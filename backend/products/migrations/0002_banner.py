# Generated manually for Banner model

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("products", "0001_initial"),
    ]

    operations = [
        migrations.CreateModel(
            name="Banner",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("title", models.CharField(max_length=200)),
                ("description", models.TextField(blank=True)),
                ("image", models.URLField(blank=True, max_length=500)),
                ("link", models.CharField(default="/products", max_length=500)),
                (
                    "bg_gradient",
                    models.CharField(
                        default="from-violet-600 to-indigo-700",
                        help_text="Tailwind gradient classes, e.g. from-blue-600 to-indigo-700",
                        max_length=200,
                    ),
                ),
                ("sort_order", models.PositiveSmallIntegerField(default=0)),
                ("is_active", models.BooleanField(default=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
            ],
            options={
                "ordering": ["sort_order", "id"],
            },
        ),
    ]
