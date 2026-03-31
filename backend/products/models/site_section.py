from django.db import models


class SiteSection(models.Model):
    """
    Custom content blocks on the storefront (e.g. home page), managed from the dashboard.
    """

    PLACEMENT_HOME = "home"

    PLACEMENT_CHOICES = [
        (PLACEMENT_HOME, "Home page"),
    ]

    title = models.CharField(max_length=200)
    body = models.TextField(blank=True, help_text="Main text (plain; line breaks preserved)")
    image = models.URLField(max_length=500, blank=True)
    cta_label = models.CharField(max_length=120, blank=True)
    cta_link = models.CharField(max_length=500, blank=True, default="")
    placement = models.CharField(
        max_length=32,
        choices=PLACEMENT_CHOICES,
        default=PLACEMENT_HOME,
        db_index=True,
    )
    sort_order = models.PositiveSmallIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["placement", "sort_order", "id"]
        verbose_name = "Site section"
        verbose_name_plural = "Site sections"

    def __str__(self):
        return f"{self.title} ({self.placement})"
