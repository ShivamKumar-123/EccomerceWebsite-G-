from django.db import models


class Category(models.Model):
    name = models.CharField(max_length=128)
    slug = models.SlugField(unique=True, max_length=64, db_index=True)

    class Meta:
        verbose_name_plural = "categories"
        ordering = ["name"]

    def __str__(self):
        return self.name
