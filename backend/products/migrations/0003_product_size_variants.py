from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("products", "0002_banner"),
    ]

    operations = [
        migrations.AddField(
            model_name="product",
            name="size_variants",
            field=models.JSONField(blank=True, default=list),
        ),
    ]
