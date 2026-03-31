from django.db import models


class Banner(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    image = models.URLField(max_length=500, blank=True)
    link = models.CharField(max_length=500, default="/products")
    bg_gradient = models.CharField(
        max_length=200,
        default="from-violet-600 to-indigo-700",
        help_text="Tailwind gradient classes, e.g. from-blue-600 to-indigo-700",
    )
    sort_order = models.PositiveSmallIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["sort_order", "id"]

    def __str__(self):
        return self.title
