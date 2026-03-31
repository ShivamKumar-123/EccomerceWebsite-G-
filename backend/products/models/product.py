from django.db import models

from .category import Category


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
    badge = models.CharField(max_length=64, blank=True)
    rating = models.DecimalField(max_digits=2, decimal_places=1, default=4.5)
    # For apparel: [{"size": "M", "stock": 10}, ...]. Empty = no size selection on storefront.
    size_variants = models.JSONField(default=list, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name
