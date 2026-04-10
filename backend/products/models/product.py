from django.db import models

from .category import Category

ALLOWED_AGE_SLUGS = frozenset(
    {"kids", "teens", "young_adults", "adults", "mature_adults"}
)
ALLOWED_GENDER_SLUGS = frozenset({"boys", "girls", "men", "women", "unisex"})


class Product(models.Model):
    category = models.ForeignKey(
        Category,
        on_delete=models.PROTECT,
        related_name="products",
    )
    name = models.CharField(max_length=255)
    price = models.DecimalField(max_digits=12, decimal_places=2)
    stock = models.PositiveIntegerField(default=0)
    image = models.URLField(max_length=500)
    # Extra gallery URLs (first should match `image` for storefront cards).
    images = models.JSONField(default=list, blank=True)
    badge = models.CharField(max_length=64, blank=True)
    rating = models.DecimalField(max_digits=2, decimal_places=1, default=4.5)
    # For apparel: [{"size": "M", "stock": 10}, ...]. Empty = no size selection on storefront.
    size_variants = models.JSONField(default=list, blank=True)
    is_active = models.BooleanField(default=True)
    # Demographics: empty list = applies to all (no restriction on that axis).
    age_groups = models.JSONField(default=list, blank=True)
    genders = models.JSONField(default=list, blank=True)
    brand = models.CharField(max_length=120, blank=True)
    colors = models.JSONField(default=list, blank=True)
    # MRP / list price (optional). Sale/checkout price is `price`.
    original_price = models.DecimalField(
        max_digits=12, decimal_places=2, null=True, blank=True
    )
    # 0–100 each; admin can set different “offer” vs “sale” messaging per product.
    offer_discount_percent = models.PositiveSmallIntegerField(default=0)
    sale_discount_percent = models.PositiveSmallIntegerField(default=0)
    # Pipe-wrapped slugs for fast filtering (synced in save()).
    age_slugs = models.CharField(max_length=120, blank=True, editable=False)
    gender_slugs = models.CharField(max_length=120, blank=True, editable=False)
    color_slugs = models.CharField(max_length=200, blank=True, editable=False)
    size_slugs = models.CharField(max_length=500, blank=True, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]

    def _normalize_slug_list(self, raw, allowed):
        if not raw:
            return []
        if not isinstance(raw, list):
            return []
        out = []
        for x in raw:
            s = str(x).strip().lower().replace(" ", "_").replace("-", "_")
            if s in allowed:
                out.append(s)
        return list(dict.fromkeys(out))

    def _sync_filter_slugs(self):
        ages = self._normalize_slug_list(self.age_groups, ALLOWED_AGE_SLUGS)
        self.age_slugs = "|" + "|".join(sorted(ages)) + "|" if ages else ""

        gens = self._normalize_slug_list(self.genders, ALLOWED_GENDER_SLUGS)
        self.gender_slugs = "|" + "|".join(sorted(gens)) + "|" if gens else ""

        cols = []
        if isinstance(self.colors, list):
            for x in self.colors:
                s = str(x).strip().lower().replace(" ", "_")
                if s:
                    cols.append(s)
        cols = sorted(set(cols))
        self.color_slugs = "|" + "|".join(cols) + "|" if cols else ""

        variants = self.size_variants if isinstance(self.size_variants, list) else []
        sizes = []
        for v in variants:
            if isinstance(v, dict):
                sz = str(v.get("size") or "").strip()
                if sz:
                    sizes.append(sz)
        sizes = sorted(set(sizes))
        self.size_slugs = "|" + "|".join(sizes) + "|" if sizes else ""

    def save(self, *args, **kwargs):
        self._sync_filter_slugs()
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name
