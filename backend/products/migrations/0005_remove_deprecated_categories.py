from django.db import migrations

# Removed from storefront (products deleted first — Category uses PROTECT).
REMOVED_SLUGS = (
    "agriculture",
    "food-processing",
    "industrial",
    "rice-mills",
    "spare-parts",
    "water-pumps",
)


def forwards(apps, schema_editor):
    Product = apps.get_model("products", "Product")
    Category = apps.get_model("products", "Category")
    for slug in REMOVED_SLUGS:
        Product.objects.filter(category__slug=slug).delete()
    Category.objects.filter(slug__in=REMOVED_SLUGS).delete()


def backwards(apps, schema_editor):
    pass


class Migration(migrations.Migration):
    dependencies = [
        ("products", "0004_site_section"),
    ]

    operations = [
        migrations.RunPython(forwards, backwards),
    ]
