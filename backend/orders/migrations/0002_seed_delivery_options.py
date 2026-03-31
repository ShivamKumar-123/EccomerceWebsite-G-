from django.db import migrations


def seed(apps, schema_editor):
    DeliveryOption = apps.get_model("orders", "DeliveryOption")
    rows = [
        ("standard", "Standard Delivery", "Pan-India road freight, 5–7 business days", 0, 7, True, 0),
        ("express", "Express Delivery", "Priority dispatch, 2–3 business days", 499, 3, True, 1),
        ("pickup", "Warehouse Pickup", "Collect from Raipur warehouse (no shipping charge)", 0, 1, True, 2),
    ]
    for slug, name, desc, fee, eta, active, sort_order in rows:
        DeliveryOption.objects.get_or_create(
            id=slug,
            defaults={
                "name": name,
                "description": desc,
                "fee": fee,
                "eta_days": eta,
                "active": active,
                "sort_order": sort_order,
            },
        )


def unseed(apps, schema_editor):
    DeliveryOption = apps.get_model("orders", "DeliveryOption")
    DeliveryOption.objects.filter(id__in=["standard", "express", "pickup"]).delete()


class Migration(migrations.Migration):
    dependencies = [("orders", "0001_initial")]

    operations = [migrations.RunPython(seed, unseed)]
