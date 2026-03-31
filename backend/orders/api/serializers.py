from rest_framework import serializers

from orders.models import DeliveryOption, Order


class DeliveryOptionSerializer(serializers.ModelSerializer):
    etaDays = serializers.IntegerField(source="eta_days")

    class Meta:
        model = DeliveryOption
        fields = ("id", "name", "description", "fee", "etaDays", "active", "sort_order")


class OrderSerializer(serializers.ModelSerializer):
    userId = serializers.CharField(source="user_id", allow_null=True, required=False)
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
    createdAt = serializers.DateTimeField(source="created_at", read_only=True)
    updatedAt = serializers.DateTimeField(source="updated_at", read_only=True)

    class Meta:
        model = Order
        fields = (
            "id",
            "userId",
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
            "createdAt",
            "updatedAt",
        )
        read_only_fields = ("id", "createdAt", "updatedAt")


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
        return Order.objects.create(
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
