from decimal import Decimal, InvalidOperation

from django.db.models import Q

from products.models import Category, Product
from products.models.product import ALLOWED_AGE_SLUGS, ALLOWED_GENDER_SLUGS


def _norm_age(raw):
    if not raw:
        return []
    out = []
    for x in raw:
        s = str(x).strip().lower().replace(" ", "_").replace("-", "_")
        if s in ALLOWED_AGE_SLUGS:
            out.append(s)
    return list(dict.fromkeys(out))


def _norm_gender(raw):
    if not raw:
        return []
    out = []
    for x in raw:
        s = str(x).strip().lower()
        if s in ALLOWED_GENDER_SLUGS:
            out.append(s)
    return list(dict.fromkeys(out))


def _norm_colors(raw):
    if not raw:
        return []
    out = []
    for x in raw:
        s = str(x).strip().lower().replace(" ", "_")
        if s:
            out.append(s)
    return list(dict.fromkeys(out))[:20]


def normalize_size_variants(raw):
    if not raw:
        return []
    out = []
    for v in raw:
        if not isinstance(v, dict):
            continue
        size = str(v.get("size") or "").strip()
        if not size:
            continue
        out.append({"size": size, "stock": max(0, int(v.get("stock") or 0))})
    return out


def parse_price(value):
    if value is None:
        return None
    if isinstance(value, (int, float, Decimal)):
        return Decimal(str(value))
    s = str(value).strip().replace("₹", "").replace(",", "").replace(" ", "")
    if not s:
        return None
    try:
        return Decimal(s)
    except InvalidOperation:
        return None


class ProductService:
    @staticmethod
    def list_products(*, search: str | None = None, category_slug: str | None = None):
        qs = Product.objects.select_related("category").filter(is_active=True)
        if category_slug:
            qs = qs.filter(category__slug=category_slug)
        if search:
            q = search.strip()
            if q:
                qs = qs.filter(
                    Q(name__icontains=q) | Q(category__name__icontains=q)
                )
        return qs

    @staticmethod
    def list_all_for_admin(*, search: str | None = None):
        qs = Product.objects.select_related("category").all()
        if search:
            q = search.strip()
            if q:
                qs = qs.filter(
                    Q(name__icontains=q) | Q(category__name__icontains=q)
                )
        return qs

    @staticmethod
    def get_by_id(pk: int):
        return Product.objects.select_related("category").filter(pk=pk).first()

    @staticmethod
    def create(data: dict) -> Product:
        slug = data["category"]
        category, _ = Category.objects.get_or_create(
            slug=slug,
            defaults={"name": slug.replace("-", " ").title()},
        )
        price = parse_price(data.get("price"))
        if price is None:
            raise ValueError("Invalid price")
        variants = normalize_size_variants(data.get("size_variants") or [])
        if variants:
            stock = sum(v["stock"] for v in variants)
        else:
            stock = int(data.get("stock") or 0)
        brand = str(data.get("brand") or "").strip()[:120]
        disc = int(data.get("discount_percent") or 0)
        disc = max(0, min(100, disc))
        return Product.objects.create(
            category=category,
            name=data["name"].strip(),
            price=price,
            stock=stock,
            image=(data.get("image") or "").strip() or "https://via.placeholder.com/400",
            badge=(data.get("badge") or "").strip(),
            rating=Decimal(str(data.get("rating") or "4.5")),
            is_active=bool(data.get("is_active", True)),
            size_variants=variants,
            age_groups=_norm_age(data.get("age_groups") or []),
            genders=_norm_gender(data.get("genders") or []),
            brand=brand,
            colors=_norm_colors(data.get("colors") or []),
            discount_percent=disc,
        )

    @staticmethod
    def update(instance: Product, data: dict) -> Product:
        if "category" in data:
            slug = data["category"]
            category, _ = Category.objects.get_or_create(
                slug=slug,
                defaults={"name": slug.replace("-", " ").title()},
            )
            instance.category = category
        if "name" in data:
            instance.name = str(data["name"]).strip()
        if "price" in data:
            price = parse_price(data["price"])
            if price is None:
                raise ValueError("Invalid price")
            instance.price = price
        if "size_variants" in data:
            variants = normalize_size_variants(data["size_variants"])
            instance.size_variants = variants
            if variants:
                instance.stock = sum(v["stock"] for v in variants)
        elif "stock" in data:
            instance.stock = int(data["stock"] or 0)
        if "image" in data:
            instance.image = str(data["image"] or "").strip() or instance.image
        if "badge" in data:
            instance.badge = str(data.get("badge") or "").strip()
        if "rating" in data:
            instance.rating = Decimal(str(data["rating"]))
        if "is_active" in data:
            instance.is_active = bool(data["is_active"])
        if "age_groups" in data:
            instance.age_groups = _norm_age(data["age_groups"])
        if "genders" in data:
            instance.genders = _norm_gender(data["genders"])
        if "brand" in data:
            instance.brand = str(data.get("brand") or "").strip()[:120]
        if "colors" in data:
            instance.colors = _norm_colors(data["colors"])
        if "discount_percent" in data:
            instance.discount_percent = max(0, min(100, int(data.get("discount_percent") or 0)))
        instance.save()
        return instance

    @staticmethod
    def delete(instance: Product) -> None:
        instance.delete()
