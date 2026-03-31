from decimal import Decimal

from rest_framework import serializers

from products.models import Banner, Category, Product, SiteSection
from products.services.product_service import normalize_size_variants, parse_price


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ("id", "name", "slug")


class BannerSerializer(serializers.ModelSerializer):
    bgColor = serializers.CharField(source="bg_gradient", max_length=200)
    sortOrder = serializers.IntegerField(source="sort_order", required=False)
    isActive = serializers.BooleanField(source="is_active", required=False)

    class Meta:
        model = Banner
        fields = (
            "id",
            "title",
            "description",
            "image",
            "link",
            "bgColor",
            "sortOrder",
            "isActive",
        )


def format_inr(value: Decimal) -> str:
    n = int(value)
    return f"₹{n:,}"


class ProductReadSerializer(serializers.ModelSerializer):
    category = serializers.SlugField(source="category.slug", read_only=True)
    sizeVariants = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = (
            "id",
            "name",
            "category",
            "stock",
            "image",
            "badge",
            "rating",
            "is_active",
            "sizeVariants",
        )

    def get_sizeVariants(self, obj):
        return normalize_size_variants(obj.size_variants)

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data["price"] = format_inr(instance.price)
        return data


class ProductWriteSerializer(serializers.ModelSerializer):
    category = serializers.SlugRelatedField(
        slug_field="slug",
        queryset=Category.objects.all(),
    )
    price = serializers.CharField(required=False, allow_blank=True)
    sizeVariants = serializers.ListField(
        child=serializers.DictField(),
        required=False,
        allow_empty=True,
    )

    class Meta:
        model = Product
        fields = (
            "name",
            "category",
            "price",
            "stock",
            "image",
            "badge",
            "rating",
            "is_active",
            "sizeVariants",
        )

    def validate(self, attrs):
        if self.instance is None:
            raw = attrs.get("price")
            if raw is None or (isinstance(raw, str) and not raw.strip()):
                raise serializers.ValidationError({"price": "This field is required."})
        return attrs

    def validate_price(self, value):
        if value in (None, ""):
            return None
        d = parse_price(value)
        if d is None:
            raise serializers.ValidationError("Invalid price.")
        return d

    def create(self, validated_data):
        from products.services.product_service import ProductService

        c = validated_data["category"]
        sv = normalize_size_variants(validated_data.pop("sizeVariants", None))
        payload = {
            "name": validated_data["name"],
            "category": c.slug,
            "price": validated_data["price"],
            "stock": validated_data.get("stock", 0),
            "image": validated_data.get("image", ""),
            "badge": validated_data.get("badge", ""),
            "rating": validated_data.get("rating", Decimal("4.5")),
            "is_active": validated_data.get("is_active", True),
            "size_variants": sv,
        }
        return ProductService.create(payload)

    def update(self, instance, validated_data):
        from products.services.product_service import ProductService

        payload = {}
        if "name" in validated_data:
            payload["name"] = validated_data["name"]
        if "category" in validated_data:
            payload["category"] = validated_data["category"].slug
        if validated_data.get("price") is not None:
            payload["price"] = validated_data["price"]
        if "stock" in validated_data:
            payload["stock"] = validated_data["stock"]
        if "image" in validated_data:
            payload["image"] = validated_data["image"]
        if "badge" in validated_data:
            payload["badge"] = validated_data["badge"]
        if "rating" in validated_data:
            payload["rating"] = validated_data["rating"]
        if "is_active" in validated_data:
            payload["is_active"] = validated_data["is_active"]
        if "sizeVariants" in validated_data:
            payload["size_variants"] = normalize_size_variants(validated_data["sizeVariants"])
        return ProductService.update(instance, payload)


class SiteSectionSerializer(serializers.ModelSerializer):
    ctaLabel = serializers.CharField(source="cta_label", allow_blank=True, required=False)
    ctaLink = serializers.CharField(source="cta_link", allow_blank=True, required=False)
    sortOrder = serializers.IntegerField(source="sort_order", required=False)
    isActive = serializers.BooleanField(source="is_active", required=False)

    class Meta:
        model = SiteSection
        fields = (
            "id",
            "title",
            "body",
            "image",
            "ctaLabel",
            "ctaLink",
            "placement",
            "sortOrder",
            "isActive",
        )
