from decimal import Decimal

from rest_framework import serializers

from products.models import Banner, Category, Product, SiteSection
from products.models.product import ALLOWED_AGE_SLUGS, ALLOWED_GENDER_SLUGS
from products.services.product_service import (
    effective_size_variants_for_product,
    normalize_size_variants,
    parse_price,
)


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


def _norm_age_slugs(values):
    if not values:
        return []
    out = []
    for x in values:
        s = str(x).strip().lower().replace(" ", "_").replace("-", "_")
        if s in ALLOWED_AGE_SLUGS:
            out.append(s)
    return list(dict.fromkeys(out))


def _norm_gender_slugs(values):
    if not values:
        return []
    out = []
    for x in values:
        s = str(x).strip().lower()
        if s in ALLOWED_GENDER_SLUGS:
            out.append(s)
    return list(dict.fromkeys(out))


def _norm_colors(values):
    if not values:
        return []
    out = []
    for x in values:
        s = str(x).strip().lower().replace(" ", "_")
        if s:
            out.append(s)
    return list(dict.fromkeys(out))


class ProductReadSerializer(serializers.ModelSerializer):
    category = serializers.SlugField(source="category.slug", read_only=True)
    sizeVariants = serializers.SerializerMethodField()
    ageGroups = serializers.JSONField(source="age_groups", read_only=True)
    genders = serializers.JSONField(read_only=True)
    brand = serializers.CharField(read_only=True)
    colors = serializers.JSONField(read_only=True)
    originalPrice = serializers.SerializerMethodField()
    offerDiscountPercent = serializers.SerializerMethodField()
    saleDiscountPercent = serializers.SerializerMethodField()
    discountPercent = serializers.SerializerMethodField()
    images = serializers.SerializerMethodField()
    createdAt = serializers.DateTimeField(source="created_at", read_only=True)

    class Meta:
        model = Product
        fields = (
            "id",
            "name",
            "category",
            "stock",
            "image",
            "images",
            "badge",
            "rating",
            "is_active",
            "sizeVariants",
            "ageGroups",
            "genders",
            "brand",
            "colors",
            "originalPrice",
            "offerDiscountPercent",
            "saleDiscountPercent",
            "discountPercent",
            "createdAt",
        )

    def get_sizeVariants(self, obj):
        return effective_size_variants_for_product(obj)

    def get_originalPrice(self, obj):
        if obj.original_price is None:
            return None
        return format_inr(obj.original_price)

    def get_offerDiscountPercent(self, obj):
        return int(obj.offer_discount_percent or 0)

    def get_saleDiscountPercent(self, obj):
        return int(obj.sale_discount_percent or 0)

    def get_discountPercent(self, obj):
        return int(obj.sale_discount_percent or 0)

    def get_images(self, obj):
        raw = obj.images if isinstance(obj.images, list) else []
        urls = [str(u).strip() for u in raw if str(u).strip()][:24]
        if not urls and obj.image:
            return [obj.image]
        return urls

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
    ageGroups = serializers.ListField(
        source="age_groups",
        child=serializers.CharField(),
        required=False,
        default=list,
    )
    genders = serializers.ListField(
        child=serializers.CharField(),
        required=False,
        default=list,
    )
    brand = serializers.CharField(required=False, allow_blank=True, max_length=120)
    colors = serializers.ListField(
        child=serializers.CharField(),
        required=False,
        default=list,
    )
    originalPrice = serializers.CharField(
        required=False,
        allow_blank=True,
        allow_null=True,
    )
    offerDiscountPercent = serializers.IntegerField(
        source="offer_discount_percent",
        required=False,
        default=0,
        min_value=0,
        max_value=100,
    )
    saleDiscountPercent = serializers.IntegerField(
        source="sale_discount_percent",
        required=False,
        default=0,
        min_value=0,
        max_value=100,
    )
    images = serializers.ListField(
        child=serializers.CharField(max_length=500, allow_blank=True),
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
            "images",
            "badge",
            "rating",
            "is_active",
            "sizeVariants",
            "ageGroups",
            "genders",
            "brand",
            "colors",
            "originalPrice",
            "offerDiscountPercent",
            "saleDiscountPercent",
        )

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data["ageGroups"] = instance.age_groups or []
        data["genders"] = instance.genders or []
        data["colors"] = instance.colors or []
        data["originalPrice"] = (
            format_inr(instance.original_price)
            if instance.original_price is not None
            else None
        )
        data["offerDiscountPercent"] = int(instance.offer_discount_percent or 0)
        data["saleDiscountPercent"] = int(instance.sale_discount_percent or 0)
        data["discountPercent"] = int(instance.sale_discount_percent or 0)
        imgs = instance.images if isinstance(instance.images, list) else []
        data["images"] = [str(u).strip() for u in imgs if str(u).strip()][:24]
        if not data["images"] and instance.image:
            data["images"] = [instance.image]
        return data

    def validate_age_groups(self, value):
        return _norm_age_slugs(value or [])

    def validate_genders(self, value):
        return _norm_gender_slugs(value or [])

    def validate_colors(self, value):
        return _norm_colors(value or [])[:20]

    def validate_originalPrice(self, value):
        if value in (None, ""):
            return None
        d = parse_price(value)
        if d is None:
            raise serializers.ValidationError("Invalid original price.")
        return d

    def validate(self, attrs):
        if self.instance is None:
            raw = attrs.get("price")
            if raw is None or (isinstance(raw, str) and not raw.strip()):
                raise serializers.ValidationError({"price": "This field is required."})
        if "originalPrice" in attrs:
            orig = attrs["originalPrice"]
        else:
            orig = self.instance.original_price if self.instance else None
        if "price" in attrs:
            price_dec = attrs["price"]
        else:
            price_dec = self.instance.price if self.instance else None
        if orig is not None and price_dec is not None and orig < price_dec:
            raise serializers.ValidationError(
                {"originalPrice": "Must be greater than or equal to sale price."}
            )
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
        orig = validated_data.pop("originalPrice", None)
        op = validated_data.pop("offer_discount_percent", 0)
        sp = validated_data.pop("sale_discount_percent", 0)
        imgs = validated_data.pop("images", None)
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
            "age_groups": validated_data.get("age_groups", []),
            "genders": validated_data.get("genders", []),
            "brand": validated_data.get("brand", "") or "",
            "colors": validated_data.get("colors", []),
            "original_price": orig,
            "offer_discount_percent": int(op or 0),
            "sale_discount_percent": int(sp or 0),
        }
        if imgs is not None:
            payload["images"] = imgs
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
        if "age_groups" in validated_data:
            payload["age_groups"] = _norm_age_slugs(validated_data["age_groups"])
        if "genders" in validated_data:
            payload["genders"] = _norm_gender_slugs(validated_data["genders"])
        if "brand" in validated_data:
            payload["brand"] = str(validated_data.get("brand") or "").strip()[:120]
        if "colors" in validated_data:
            payload["colors"] = _norm_colors(validated_data["colors"])[:20]
        if "originalPrice" in validated_data:
            payload["original_price"] = validated_data["originalPrice"]
        if "offer_discount_percent" in validated_data:
            payload["offer_discount_percent"] = max(
                0, min(100, int(validated_data.get("offer_discount_percent") or 0))
            )
        if "sale_discount_percent" in validated_data:
            payload["sale_discount_percent"] = max(
                0, min(100, int(validated_data.get("sale_discount_percent") or 0))
            )
        if "images" in validated_data:
            payload["images"] = validated_data["images"]
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
