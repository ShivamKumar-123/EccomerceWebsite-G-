from decimal import Decimal, InvalidOperation

from django.db.models import Q

from products.catalog_constants import SHOE_CATEGORY_SLUGS
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


# Defaults when DB has no size_variants (keeps storefront dropdowns consistent).
DEFAULT_APPAREL_SIZE_VARIANTS = [
    {"size": "S", "stock": 10},
    {"size": "M", "stock": 20},
    {"size": "L", "stock": 18},
    {"size": "XL", "stock": 14},
    {"size": "XXL", "stock": 8},
]

DEFAULT_SHOE_SIZE_VARIANTS = [
    {"size": "UK 7", "stock": 6},
    {"size": "UK 8", "stock": 10},
    {"size": "UK 9", "stock": 12},
    {"size": "UK 10", "stock": 10},
    {"size": "UK 11", "stock": 5},
]

_FOOTWEAR_NAME_HINTS = (
    "shoe",
    "sneaker",
    "boot",
    "sandal",
    "slide",
    "loafer",
    "trainer",
    "footwear",
    "cleat",
)


def effective_size_variants_for_product(product) -> list:
    """
    Return size rows for API/cart UI. Uses saved JSON when present; otherwise
    infers defaults from category (and product name for mixed fashion rows).
    """
    saved = normalize_size_variants(getattr(product, "size_variants", None))
    if saved:
        return saved

    cat = getattr(product, "category", None)
    slug = ((cat.slug if cat else "") or "").strip().lower()
    name_l = (getattr(product, "name", None) or "").lower()
    footwear_by_name = any(h in name_l for h in _FOOTWEAR_NAME_HINTS)

    if slug in SHOE_CATEGORY_SLUGS:
        return [dict(x) for x in DEFAULT_SHOE_SIZE_VARIANTS]
    if slug in ("fashion", "clothes"):
        if footwear_by_name:
            return [dict(x) for x in DEFAULT_SHOE_SIZE_VARIANTS]
        return [dict(x) for x in DEFAULT_APPAREL_SIZE_VARIANTS]
    return []


def _clamp_pct(v) -> int:
    return max(0, min(100, int(v or 0)))


def normalize_product_images(raw) -> list:
    """Non-empty unique image URLs, max 24, each max 500 chars."""
    if not raw:
        return []
    if isinstance(raw, str):
        raw = [raw]
    if not isinstance(raw, list):
        return []
    out = []
    seen = set()
    for x in raw:
        u = str(x).strip()[:500]
        if not u or u in seen:
            continue
        seen.add(u)
        out.append(u)
        if len(out) >= 24:
            break
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
        orig = data.get("original_price")
        if orig is not None and not isinstance(orig, Decimal):
            orig = parse_price(orig)
        if orig is not None and orig < price:
            raise ValueError("Original price must be greater than or equal to sale price")
        offer_p = _clamp_pct(data.get("offer_discount_percent"))
        sale_p = _clamp_pct(data.get("sale_discount_percent"))
        imgs = normalize_product_images(data.get("images"))
        legacy_img = str(data.get("image") or "").strip()
        if not imgs and legacy_img:
            imgs = [legacy_img]
        if not imgs:
            imgs = ["https://via.placeholder.com/400"]
        primary = imgs[0]
        return Product.objects.create(
            category=category,
            name=data["name"].strip(),
            price=price,
            original_price=orig,
            stock=stock,
            image=primary,
            images=imgs,
            badge=(data.get("badge") or "").strip(),
            rating=Decimal(str(data.get("rating") or "4.5")),
            is_active=bool(data.get("is_active", True)),
            size_variants=variants,
            age_groups=_norm_age(data.get("age_groups") or []),
            genders=_norm_gender(data.get("genders") or []),
            brand=brand,
            colors=_norm_colors(data.get("colors") or []),
            offer_discount_percent=offer_p,
            sale_discount_percent=sale_p,
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
        if "original_price" in data:
            raw = data["original_price"]
            if raw is None:
                instance.original_price = None
            else:
                op = parse_price(raw) if not isinstance(raw, Decimal) else raw
                if op is None:
                    instance.original_price = None
                else:
                    instance.original_price = op
        eff_price = instance.price
        eff_orig = instance.original_price
        if eff_orig is not None and eff_orig < eff_price:
            raise ValueError("Original price must be greater than or equal to sale price")
        if "size_variants" in data:
            variants = normalize_size_variants(data["size_variants"])
            instance.size_variants = variants
            if variants:
                instance.stock = sum(v["stock"] for v in variants)
        elif "stock" in data:
            instance.stock = int(data["stock"] or 0)
        if "images" in data:
            imgs = normalize_product_images(data.get("images"))
            if imgs:
                instance.images = imgs
                instance.image = imgs[0]
            else:
                fb = (
                    str(data.get("image") or instance.image or "").strip()
                    or "https://via.placeholder.com/400"
                )
                instance.images = [fb]
                instance.image = fb
        elif "image" in data:
            im = str(data["image"] or "").strip()
            if im:
                instance.image = im
                li = list(instance.images) if isinstance(instance.images, list) else []
                if li:
                    li[0] = im
                else:
                    li = [im]
                instance.images = li
            else:
                instance.image = instance.image
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
        if "offer_discount_percent" in data:
            instance.offer_discount_percent = _clamp_pct(
                data.get("offer_discount_percent")
            )
        if "sale_discount_percent" in data:
            instance.sale_discount_percent = _clamp_pct(
                data.get("sale_discount_percent")
            )
        instance.save()
        return instance

    @staticmethod
    def delete(instance: Product) -> None:
        instance.delete()
