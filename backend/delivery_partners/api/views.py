import secrets
import uuid as uuid_std

from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.mail import send_mail
from django.db import transaction
from django.utils import timezone
from django.contrib.auth.models import Group
from rest_framework import status, viewsets
from rest_framework.decorators import action, api_view, parser_classes, permission_classes
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import AllowAny, BasePermission, IsAuthenticated
from rest_framework.response import Response

from django.db.models import Count, Sum
from django.db.models.functions import ExtractHour

from orders.api.serializers import OrderSerializer
from orders.delivery_proof import save_order_delivery_proof_files
from orders.models import Order

from delivery_partners.constants import DELIVERY_PARTNER_GROUP_NAME
from delivery_partners.models import DeliveryPartnerApplication
from delivery_partners.api.serializers import (
    ApproveDeliveryPartnerSerializer,
    DeliveryPartnerApplicationAdminSerializer,
    DeliveryPartnerApplicationCreateSerializer,
    RejectDeliveryPartnerSerializer,
)

User = get_user_model()


class IsStaffUser(BasePermission):
    def has_permission(self, request, view):
        u = request.user
        return bool(u and u.is_authenticated and u.is_staff)


class IsDeliveryPartner(BasePermission):
    def has_permission(self, request, view):
        u = request.user
        return bool(
            u
            and u.is_authenticated
            and u.groups.filter(name=DELIVERY_PARTNER_GROUP_NAME).exists()
        )


def _generate_password():
    return secrets.token_urlsafe(12)


def _send_partner_welcome_email(to_email: str, username: str, password: str):
    subject = getattr(
        settings,
        "DELIVERY_PARTNER_EMAIL_SUBJECT",
        "Goldy Mart — Delivery partner account approved",
    )
    body = (
        f"Hello,\n\n"
        f"Your delivery partner application has been approved.\n\n"
        f"Login username: {username}\n"
        f"Password: {password}\n\n"
        f"Sign in to your delivery dashboard: open the Goldy Mart website and go to Partner login "
        f"(path: /partner-login), then use the email above as username.\n"
        f"Change your password after first login when that option is available.\n"
        f"Keep these details confidential.\n\n"
        f"— Goldy Mart"
    )
    send_mail(
        subject,
        body,
        settings.DEFAULT_FROM_EMAIL,
        [to_email],
        fail_silently=False,
    )


class DeliveryPartnerApplicationViewSet(viewsets.ModelViewSet):
    queryset = DeliveryPartnerApplication.objects.all()
    http_method_names = ["get", "post", "head", "options"]

    def get_permissions(self):
        if self.action == "create":
            return [AllowAny()]
        return [IsAuthenticated(), IsStaffUser()]

    def get_parser_classes(self):
        if self.action == "create":
            return [MultiPartParser, FormParser]
        return super().get_parser_classes()

    def get_serializer_class(self):
        if self.action == "create":
            return DeliveryPartnerApplicationCreateSerializer
        return DeliveryPartnerApplicationAdminSerializer

    def create(self, request, *args, **kwargs):
        ser = self.get_serializer(data=request.data)
        ser.is_valid(raise_exception=True)
        app = ser.save()
        return Response(
            {
                "id": app.id,
                "detail": "Application submitted. We will review it and email you if approved.",
            },
            status=status.HTTP_201_CREATED,
        )

    @action(detail=True, methods=["post"], url_path="approve")
    def approve(self, request, pk=None):
        application = self.get_object()
        if application.status != DeliveryPartnerApplication.Status.PENDING:
            return Response(
                {"detail": "Only pending applications can be approved."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        ser = ApproveDeliveryPartnerSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        raw_pw = (ser.validated_data.get("password") or "").strip()
        password = raw_pw if raw_pw else _generate_password()

        email = application.email.strip().lower()
        username = email

        if User.objects.filter(username__iexact=username).exists():
            return Response(
                {
                    "detail": "A user with this email already exists. Use a different flow or remove the duplicate user.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
        if User.objects.filter(email__iexact=email).exists():
            return Response(
                {"detail": "A user with this email already exists."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            with transaction.atomic():
                user = User.objects.create_user(
                    username=username[:150],
                    email=email,
                    password=password,
                    first_name=application.full_name[:150],
                    is_staff=False,
                    is_active=True,
                )
                grp, _ = Group.objects.get_or_create(name=DELIVERY_PARTNER_GROUP_NAME)
                user.groups.add(grp)
                application.status = DeliveryPartnerApplication.Status.APPROVED
                application.linked_user = user
                application.reviewed_at = timezone.now()
                application.save(
                    update_fields=[
                        "status",
                        "linked_user",
                        "reviewed_at",
                        "updated_at",
                    ]
                )
                _send_partner_welcome_email(email, username, password)
                application.password_sent_at = timezone.now()
                application.save(update_fields=["password_sent_at", "updated_at"])
        except Exception as e:
            return Response(
                {"detail": str(e) or "Approval or email failed. No changes were saved."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        return Response(
            {
                "detail": "Partner approved. Credentials were sent to their email.",
                "user_id": user.id,
            },
            status=status.HTTP_200_OK,
        )

    @action(detail=True, methods=["post"], url_path="reject")
    def reject(self, request, pk=None):
        application = self.get_object()
        if application.status != DeliveryPartnerApplication.Status.PENDING:
            return Response(
                {"detail": "Only pending applications can be rejected."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        ser = RejectDeliveryPartnerSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        application.status = DeliveryPartnerApplication.Status.REJECTED
        application.admin_note = (ser.validated_data.get("admin_note") or "").strip()
        application.reviewed_at = timezone.now()
        application.save(
            update_fields=["status", "admin_note", "reviewed_at", "updated_at"]
        )
        return Response(
            DeliveryPartnerApplicationAdminSerializer(
                application, context={"request": request}
            ).data,
            status=status.HTTP_200_OK,
        )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def delivery_partner_account(request):
    """JWT user: true if member of Delivery Partner group (approved partner login)."""
    user = request.user
    if not user.groups.filter(name=DELIVERY_PARTNER_GROUP_NAME).exists():
        return Response({"is_delivery_partner": False})

    app = (
        DeliveryPartnerApplication.objects.filter(
            linked_user=user, status=DeliveryPartnerApplication.Status.APPROVED
        )
        .order_by("-reviewed_at")
        .first()
    )
    return Response(
        {
            "is_delivery_partner": True,
            "full_name": (app.full_name if app else "") or user.first_name or user.username,
            "email": user.email or user.username,
            "phone": app.phone if app else "",
            "city": app.city if app else "",
            "district": app.district if app else "",
            "state": app.state if app else "",
        }
    )


def _relative_time(dt):
    if not dt:
        return ""
    delta = timezone.now() - dt
    s = int(max(0, delta.total_seconds()))
    if s < 45:
        return "Just now"
    if s < 3600:
        return f"{s // 60} min ago"
    if s < 86400:
        return f"{s // 3600} hr ago"
    return f"{s // 86400} days ago"


def _partner_category_breakdown(qs, limit_orders=200):
    from collections import Counter

    c = Counter()
    for o in qs.order_by("-created_at")[:limit_orders]:
        for it in (o.items or [])[:15]:
            nm = str(it.get("name") or it.get("title") or "Product").strip()
            if nm:
                c[nm[:48]] += int(it.get("quantity") or 1)
    top = c.most_common(4)
    if not top:
        return []
    colors = ["#f97316", "#06b6d4", "#10b981", "#8b5cf6"]
    return [
        {"name": n, "value": int(v), "color": colors[i % len(colors)]}
        for i, (n, v) in enumerate(top)
    ]


def _partner_activities(qs, limit=12):
    out = []
    for o in qs.order_by("-updated_at")[:limit]:
        info = o.customer_info or {}
        name = (info.get("name") or "Customer").strip() or "Customer"
        short = str(o.id).replace("-", "")[:8].upper()
        st = o.status
        if st == "delivered":
            highlight = f"Order #{short}"
            text = f" delivered to {name}"
            color = "#10b981"
        elif st == "shipped":
            highlight = f"Order #{short}"
            text = f" is out for delivery — {name}"
            color = "#f97316"
        elif st == "rejected":
            highlight = f"Order #{short}"
            text = f" was cancelled — {name}"
            color = "#ef4444"
        elif st == "approved":
            highlight = f"Order #{short}"
            text = f" approved — {name}"
            color = "#22c55e"
        else:
            highlight = f"Order #{short}"
            text = f" pending — {name}"
            color = "#eab308"
        out.append(
            {
                "color": color,
                "highlight": highlight,
                "text": text,
                "time": _relative_time(o.updated_at),
            }
        )
    return out


@api_view(["GET"])
@permission_classes([IsAuthenticated, IsDeliveryPartner])
def delivery_partner_orders(request):
    qs = (
        Order.objects.filter(delivery_partner=request.user)
        .select_related("delivery_partner")
        .order_by("-created_at")[:500]
    )
    ser = OrderSerializer(qs, many=True, context={"request": request})
    return Response(ser.data)


@api_view(["POST"])
@parser_classes([MultiPartParser, FormParser])
@permission_classes([IsAuthenticated, IsDeliveryPartner])
def delivery_partner_mark_delivered(request, order_id):
    """Partner marks an assigned order delivered with proof images (status must be shipped)."""
    try:
        oid = uuid_std.UUID(str(order_id))
    except (ValueError, TypeError, AttributeError):
        return Response({"detail": "Invalid order id."}, status=status.HTTP_400_BAD_REQUEST)

    order = (
        Order.objects.filter(pk=oid, delivery_partner=request.user, status="shipped")
        .select_related("delivery_partner")
        .first()
    )
    if not order:
        return Response(
            {
                "detail": "Order not found, not assigned to you, or not out for delivery (shipped).",
            },
            status=status.HTTP_404_BAD_REQUEST,
        )

    files = [f for f in request.FILES.getlist("proof_images") if f]
    if len(files) < 2:
        return Response(
            {"detail": "Upload at least two delivery proof images."},
            status=status.HTTP_400_BAD_REQUEST,
        )
    if len(files) > 10:
        return Response(
            {"detail": "At most ten images allowed."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        paths = save_order_delivery_proof_files(order, files)
    except ValueError as e:
        return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    order.delivery_proof_images = paths
    order.status = "delivered"
    order.save(update_fields=["delivery_proof_images", "status", "updated_at"])
    return Response(OrderSerializer(order, context={"request": request}).data)


@api_view(["GET"])
@permission_classes([IsAuthenticated, IsDeliveryPartner])
def delivery_partner_stats(request):
    qs = Order.objects.filter(delivery_partner=request.user)
    total = qs.count()
    delivered = qs.filter(status="delivered").count()
    transit = qs.filter(status="shipped").count()
    pending = qs.filter(status__in=("pending", "approved")).count()
    cancelled = qs.filter(status="rejected").count()
    revenue = qs.filter(status="delivered").aggregate(s=Sum("total"))["s"] or 0
    settled = delivered + cancelled
    success_rate = round(100.0 * delivered / settled, 1) if settled else 0.0

    start = timezone.localtime(timezone.now()).replace(
        hour=0, minute=0, second=0, microsecond=0
    )
    hourly = [0] * 24
    for row in (
        qs.filter(created_at__gte=start)
        .annotate(h=ExtractHour("created_at"))
        .values("h")
        .annotate(c=Count("id"))
    ):
        h = int(row["h"])
        if 0 <= h < 24:
            hourly[h] = row["c"]

    today_local = timezone.localdate()
    orders_today = qs.filter(created_at__date=today_local).count()

    return Response(
        {
            "total_orders": total,
            "delivered": delivered,
            "in_transit": transit,
            "pending": pending,
            "cancelled": cancelled,
            "revenue_total": float(revenue),
            "success_rate_percent": success_rate,
            "hourly_today": hourly,
            "orders_today": orders_today,
            "categories": _partner_category_breakdown(qs),
            "activities": _partner_activities(qs),
        }
    )


@api_view(["GET"])
@permission_classes([IsAuthenticated, IsStaffUser])
def staff_list_delivery_partner_users(request):
    rows = (
        User.objects.filter(groups__name=DELIVERY_PARTNER_GROUP_NAME)
        .distinct()
        .order_by("email", "username")
    )
    data = []
    for u in rows[:500]:
        data.append(
            {
                "id": u.id,
                "email": u.email or u.username,
                "full_name": (u.first_name or "").strip() or u.username or u.email,
            }
        )
    return Response(data)
