from django.db import migrations, models
from django.db.models import F


def copy_discount_to_sale(apps, schema_editor):
    Product = apps.get_model("products", "Product")
    Product.objects.update(sale_discount_percent=F("discount_percent"))


class Migration(migrations.Migration):
    dependencies = [
        ("products", "0007_product_discount_and_shoes"),
    ]

    operations = [
        migrations.AddField(
            model_name="product",
            name="original_price",
            field=models.DecimalField(
                blank=True,
                decimal_places=2,
                max_digits=12,
                null=True,
            ),
        ),
        migrations.AddField(
            model_name="product",
            name="offer_discount_percent",
            field=models.PositiveSmallIntegerField(default=0),
        ),
        migrations.AddField(
            model_name="product",
            name="sale_discount_percent",
            field=models.PositiveSmallIntegerField(default=0),
        ),
        migrations.RunPython(copy_discount_to_sale, migrations.RunPython.noop),
        migrations.RemoveField(
            model_name="product",
            name="discount_percent",
        ),
    ]
