import uuid as uuid_std

from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from orders.models import DeliveryOption, Order
from orders.api.serializers import (
    DeliveryOptionSerializer,
    OrderCreateSerializer,
    OrderSerializer,
)


class DeliveryOptionViewSet(viewsets.ModelViewSet):
    queryset = DeliveryOption.objects.all()
    serializer_class = DeliveryOptionSerializer

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [AllowAny()]
        return [IsAuthenticated()]

    def get_queryset(self):
        qs = super().get_queryset().order_by("sort_order", "id")
        if not self.request.user.is_authenticated:
            qs = qs.filter(active=True)
        return qs

    @action(detail=False, methods=["put"], permission_classes=[IsAuthenticated], url_path="bulk")
    def bulk_replace(self, request):
        rows = request.data
        if not isinstance(rows, list):
            return Response({"detail": "Expected a JSON array"}, status=status.HTTP_400_BAD_REQUEST)
        DeliveryOption.objects.all().delete()
        for i, raw in enumerate(rows):
            oid = str(raw.get("id") or "").strip() or f"opt-{i}"
            DeliveryOption.objects.create(
                id=oid[:64],
                name=str(raw.get("name") or "Option")[:200],
                description=str(raw.get("description") or ""),
                fee=max(0, int(raw.get("fee") or 0)),
                eta_days=max(1, int(raw.get("etaDays") or raw.get("eta_days") or 7)),
                active=raw.get("active", True) is not False,
                sort_order=i,
            )
        out = DeliveryOption.objects.all().order_by("sort_order", "id")
        return Response(DeliveryOptionSerializer(out, many=True).data)


class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    http_method_names = ["get", "post", "patch", "delete", "head", "options"]

    def get_serializer_context(self):
        return {**super().get_serializer_context(), "request": self.request}

    def get_permissions(self):
        if self.action in ("create", "retrieve", "lookup"):
            return [AllowAny()]
        if self.action == "list":
            return [AllowAny()]
        return [IsAuthenticated()]

    def get_queryset(self):
        qs = Order.objects.all().order_by("-created_at")
        if self.request.user.is_authenticated:
            return qs
        uid = (self.request.query_params.get("user_id") or "").strip()
        if uid:
            return qs.filter(user_id=uid)
        return Order.objects.none()

    def get_serializer_class(self):
        if self.action == "create":
            return OrderCreateSerializer
        return OrderSerializer

    def create(self, request, *args, **kwargs):
        ser = OrderCreateSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        order = ser.save()
        return Response(
            OrderSerializer(order, context={"request": request}).data,
            status=status.HTTP_201_CREATED,
        )

    @action(detail=False, methods=["get"], permission_classes=[AllowAny], url_path="lookup")
    def lookup(self, request):
        q = (request.query_params.get("q") or "").strip()
        if len(q) < 2:
            return Response({"detail": "q too short"}, status=status.HTTP_400_BAD_REQUEST)
        qs = Order.objects.all().order_by("-created_at")
        try:
            u = uuid_std.UUID(q)
            o = qs.filter(pk=u).first()
            if o:
                return Response(OrderSerializer(o, context={"request": request}).data)
        except (ValueError, TypeError):
            pass
        o = qs.filter(id__icontains=q).first()
        if o:
            return Response(OrderSerializer(o, context={"request": request}).data)
        q_clean = q.replace("-", "").lower()
        for o in qs[:1000]:
            oid = str(o.id).replace("-", "").lower()
            if len(q_clean) >= 6 and oid.endswith(q_clean):
                return Response(OrderSerializer(o, context={"request": request}).data)
            phone = str((o.customer_info or {}).get("phone") or "")
            if phone and (q in phone or phone.strip() == q.strip()):
                return Response(OrderSerializer(o, context={"request": request}).data)
        return Response({"detail": "not found"}, status=status.HTTP_404_NOT_FOUND)
