from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("products", "0003_product_size_variants"),
    ]

    operations = [
        migrations.CreateModel(
            name="SiteSection",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("title", models.CharField(max_length=200)),
                ("body", models.TextField(blank=True, help_text="Main text (plain; line breaks preserved)")),
                ("image", models.URLField(blank=True, max_length=500)),
                ("cta_label", models.CharField(blank=True, max_length=120)),
                ("cta_link", models.CharField(blank=True, default="", max_length=500)),
                (
                    "placement",
                    models.CharField(
                        choices=[("home", "Home page")],
                        db_index=True,
                        default="home",
                        max_length=32,
                    ),
                ),
                ("sort_order", models.PositiveSmallIntegerField(default=0)),
                ("is_active", models.BooleanField(default=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
            ],
            options={
                "verbose_name": "Site section",
                "verbose_name_plural": "Site sections",
                "ordering": ["placement", "sort_order", "id"],
            },
        ),
    ]
