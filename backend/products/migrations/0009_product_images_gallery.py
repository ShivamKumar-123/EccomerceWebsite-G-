from django.db import migrations, models


def copy_image_to_images(apps, schema_editor):
    Product = apps.get_model("products", "Product")
    for p in Product.objects.all().iterator():
        img = (getattr(p, "image", None) or "").strip()
        if img:
            p.images = [img]
            p.save(update_fields=["images"])


class Migration(migrations.Migration):
    dependencies = [
        ("products", "0008_product_offer_sale_pricing"),
    ]

    operations = [
        migrations.AddField(
            model_name="product",
            name="images",
            field=models.JSONField(blank=True, default=list),
        ),
        migrations.RunPython(copy_image_to_images, migrations.RunPython.noop),
    ]
