import json

from django.db import migrations, models


def _pipe_sorted(vals):
    if not vals:
        return ""
    s = sorted({str(x).strip() for x in vals if str(x).strip()})
    return "|" + "|".join(s) + "|" if s else ""


def _size_pipe(variants):
    if not variants or not isinstance(variants, list):
        return ""
    sizes = []
    for v in variants:
        if isinstance(v, dict):
            sz = str(v.get("size") or "").strip()
            if sz:
                sizes.append(sz)
    return _pipe_sorted(sizes)


def backfill_demographics(apps, schema_editor):
    Product = apps.get_model("products", "Product")
    AGE_OK = {"kids", "teens", "young_adults", "adults", "mature_adults"}
    GEN_OK = {"boys", "girls", "men", "women", "unisex"}

    for p in Product.objects.select_related("category").all():
        slug = p.category.slug
        name_l = (p.name or "").lower()
        age, gen, col, brand = [], [], [], (p.brand or "").strip()

        if slug in ("fashion", "clothes"):
            if "kids" in name_l or name_l.startswith("kid "):
                age = ["kids"]
                gen = ["boys", "girls"]
            elif any(
                x in name_l
                for x in ("women", "ladies", "kurti", "floral", "summer top", "embroidered")
            ):
                age = ["teens", "young_adults", "adults"]
                gen = ["women"]
            elif any(x in name_l for x in ("men's", "men ", "shirt", "jeans", "formal")):
                age = ["young_adults", "adults", "mature_adults"]
                gen = ["men"]
            elif "unisex" in name_l or "hooded" in name_l:
                age = ["teens", "young_adults", "adults"]
                gen = ["unisex"]
            else:
                age = ["young_adults", "adults"]
                gen = ["men", "women"]
            col = ["navy"] if any(x in name_l for x in ("blue", "denim", "dark")) else ["black"]
            if not brand:
                brand = "UrbanFit"
        elif slug == "beauty":
            age = ["teens", "young_adults", "adults", "mature_adults"]
            gen = ["women", "men", "unisex"]
            col = ["white"]
            if not brand:
                brand = "GlowCare"
        elif slug == "electronics":
            gen = ["unisex"]
            col = ["black"]
            if not brand:
                brand = "TechLine"
        else:
            gen = ["unisex"]
            col = ["beige"]
            if not brand:
                brand = "GoldyMart"

        age = [a for a in age if a in AGE_OK]
        gen = [g for g in gen if g in GEN_OK]
        col = [str(c).strip().lower() for c in col if str(c).strip()]

        variants = p.size_variants
        if isinstance(variants, str):
            try:
                variants = json.loads(variants)
            except json.JSONDecodeError:
                variants = []

        Product.objects.filter(pk=p.pk).update(
            age_groups=age,
            genders=gen,
            brand=brand[:120],
            colors=col,
            age_slugs=_pipe_sorted(age),
            gender_slugs=_pipe_sorted(gen),
            color_slugs=_pipe_sorted(col),
            size_slugs=_size_pipe(variants),
        )


class Migration(migrations.Migration):
    dependencies = [
        ("products", "0005_remove_deprecated_categories"),
    ]

    operations = [
        migrations.AddField(
            model_name="product",
            name="age_groups",
            field=models.JSONField(blank=True, default=list),
        ),
        migrations.AddField(
            model_name="product",
            name="genders",
            field=models.JSONField(blank=True, default=list),
        ),
        migrations.AddField(
            model_name="product",
            name="brand",
            field=models.CharField(blank=True, max_length=120),
        ),
        migrations.AddField(
            model_name="product",
            name="colors",
            field=models.JSONField(blank=True, default=list),
        ),
        migrations.AddField(
            model_name="product",
            name="age_slugs",
            field=models.CharField(blank=True, editable=False, max_length=120),
        ),
        migrations.AddField(
            model_name="product",
            name="gender_slugs",
            field=models.CharField(blank=True, editable=False, max_length=120),
        ),
        migrations.AddField(
            model_name="product",
            name="color_slugs",
            field=models.CharField(blank=True, editable=False, max_length=200),
        ),
        migrations.AddField(
            model_name="product",
            name="size_slugs",
            field=models.CharField(blank=True, editable=False, max_length=500),
        ),
        migrations.RunPython(backfill_demographics, migrations.RunPython.noop),
    ]
