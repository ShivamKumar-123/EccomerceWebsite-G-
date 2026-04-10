from django.conf import settings
from django.contrib.auth import get_user_model
from rest_framework import serializers

from delivery_partners.assignment import auto_assign_delivery_partner_user
from orders.models import DeliveryOption, Order

User = get_user_model()


class DeliveryOptionSerializer(serializers.ModelSerializer):
    etaDays = serializers.IntegerField(source="eta_days")

    class Meta:
        model = DeliveryOption
        fields = ("id", "name", "description", "fee", "etaDays", "active", "sort_order")


class OrderSerializer(serializers.ModelSerializer):
    userId = serializers.CharField(source="user_id", allow_null=True, required=False)
    deliveryPartnerId = serializers.PrimaryKeyRelatedField(
        source="delivery_partner",
        queryset=User.objects.all(),
        allow_null=True,
        required=False,
    )
    paymentStatus = serializers.CharField(source="payment_status")
    deliveryFee = serializers.DecimalField(
        source="delivery_fee", max_digits=10, decimal_places=2, coerce_to_string=False
    )
    deliveryOptionId = serializers.CharField(
        source="delivery_option_id", allow_blank=True, required=False
    )
    deliveryLabel = serializers.CharField(source="delivery_label", allow_blank=True, required=False)
    deliveryDescription = serializers.CharField(
        source="delivery_description", allow_blank=True, required=False
    )
    deliveryEtaDays = serializers.IntegerField(source="delivery_eta_days")
    trackingNumber = serializers.CharField(source="tracking_number", allow_blank=True, required=False)
    customerInfo = serializers.JSONField(source="customer_info")
    paymentScreenshot = serializers.CharField(
        source="payment_screenshot", allow_blank=True, required=False
    )
    deliveryProofImages = serializers.SerializerMethodField()
    createdAt = serializers.DateTimeField(source="created_at", read_only=True)
    updatedAt = serializers.DateTimeField(source="updated_at", read_only=True)

    def get_deliveryProofImages(self, obj):
        request = self.context.get("request")
        paths = getattr(obj, "delivery_proof_images", None) or []
        if not isinstance(paths, list):
            return []
        mu = settings.MEDIA_URL or "/media/"
        if not str(mu).startswith("/"):
            mu = "/" + str(mu).lstrip("/")
        base = str(mu).rstrip("/") + "/"
        out = []
        for p in paths:
            if not isinstance(p, str) or not p.strip():
                continue
            path = base + p.lstrip("/")
            if request:
                out.append(request.build_absolute_uri(path))
            else:
                out.append(path)
        return out

    class Meta:
        model = Order
        fields = (
            "id",
            "userId",
            "deliveryPartnerId",
            "status",
            "paymentStatus",
            "total",
            "deliveryFee",
            "deliveryOptionId",
            "deliveryLabel",
            "deliveryDescription",
            "deliveryEtaDays",
            "trackingNumber",
            "carrier",
            "items",
            "customerInfo",
            "paymentScreenshot",
            "deliveryProofImages",
            "createdAt",
            "updatedAt",
        )
        read_only_fields = ("id", "createdAt", "updatedAt", "deliveryProofImages")


class OrderCreateSerializer(serializers.Serializer):
    userId = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    total = serializers.DecimalField(max_digits=12, decimal_places=2)
    customerInfo = serializers.JSONField()
    items = serializers.JSONField()
    paymentScreenshot = serializers.CharField(required=False, allow_blank=True, default="")
    status = serializers.CharField(required=False, default="pending")
    paymentStatus = serializers.CharField(required=False, default="not_uploaded")
    deliveryFee = serializers.DecimalField(
        max_digits=10, decimal_places=2, required=False, default=0
    )
    deliveryOptionId = serializers.CharField(required=False, allow_blank=True, default="")
    deliveryLabel = serializers.CharField(required=False, allow_blank=True, default="")
    deliveryDescription = serializers.CharField(required=False, allow_blank=True, default="")
    deliveryEtaDays = serializers.IntegerField(required=False, default=7)
    trackingNumber = serializers.CharField(required=False, allow_blank=True, default="")
    carrier = serializers.CharField(required=False, allow_blank=True, default="")

    def create(self, validated_data):
        order = Order.objects.create(
            user_id=validated_data.get("userId") or None,
            status=validated_data.get("status", "pending"),
            payment_status=validated_data.get("paymentStatus", "not_uploaded"),
            total=validated_data["total"],
            delivery_fee=validated_data.get("deliveryFee", 0),
            delivery_option_id=validated_data.get("deliveryOptionId", ""),
            delivery_label=validated_data.get("deliveryLabel", ""),
            delivery_description=validated_data.get("deliveryDescription", ""),
            delivery_eta_days=validated_data.get("deliveryEtaDays", 7),
            tracking_number=validated_data.get("trackingNumber", ""),
            carrier=validated_data.get("carrier", ""),
            items=validated_data["items"],
            customer_info=validated_data["customerInfo"],
            payment_screenshot=validated_data.get("paymentScreenshot", ""),
        )
        partner = auto_assign_delivery_partner_user(validated_data.get("customerInfo") or {})
        if partner:
            order.delivery_partner = partner
            order.save(update_fields=["delivery_partner", "updated_at"])
        return order
