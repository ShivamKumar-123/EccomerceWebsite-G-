# Generated manually: front/back images + Delivery Partner auth group

from django.core.files.base import ContentFile
from django.db import migrations, models


def ensure_delivery_partner_group(apps, schema_editor):
    Group = apps.get_model("auth", "Group")
    Group.objects.get_or_create(name="Delivery Partner")


def copy_front_to_back_for_existing(apps, schema_editor):
    Application = apps.get_model("delivery_partners", "DeliveryPartnerApplication")
    for app in Application.objects.all():
        for front_attr, back_attr in (
            ("license_image_front", "license_image_back"),
            ("aadhar_image_front", "aadhar_image_back"),
            ("pan_image_front", "pan_image_back"),
        ):
            front = getattr(app, front_attr, None)
            if not front or not getattr(front, "name", ""):
                continue
            back_f = getattr(app, back_attr, None)
            if back_f and getattr(back_f, "name", ""):
                continue
            name = front.name or "document.jpg"
            short = name.split("/")[-1] if "/" in name else name
            try:
                with front.open("rb") as fh:
                    data = fh.read()
                getattr(app, back_attr).save(short, ContentFile(data), save=True)
            except Exception:
                pass


class Migration(migrations.Migration):

    dependencies = [
        ("delivery_partners", "0001_initial"),
    ]

    operations = [
        migrations.RunPython(ensure_delivery_partner_group, migrations.RunPython.noop),
        migrations.RenameField(
            model_name="deliverypartnerapplication",
            old_name="license_image",
            new_name="license_image_front",
        ),
        migrations.RenameField(
            model_name="deliverypartnerapplication",
            old_name="aadhar_image",
            new_name="aadhar_image_front",
        ),
        migrations.RenameField(
            model_name="deliverypartnerapplication",
            old_name="pan_image",
            new_name="pan_image_front",
        ),
        migrations.AddField(
            model_name="deliverypartnerapplication",
            name="license_image_back",
            field=models.ImageField(
                blank=True,
                null=True,
                upload_to="delivery_partners/licenses/%Y/%m/",
            ),
        ),
        migrations.AddField(
            model_name="deliverypartnerapplication",
            name="aadhar_image_back",
            field=models.ImageField(
                blank=True,
                null=True,
                upload_to="delivery_partners/aadhar/%Y/%m/",
            ),
        ),
        migrations.AddField(
            model_name="deliverypartnerapplication",
            name="pan_image_back",
            field=models.ImageField(
                blank=True,
                null=True,
                upload_to="delivery_partners/pan/%Y/%m/",
            ),
        ),
        migrations.RunPython(copy_front_to_back_for_existing, migrations.RunPython.noop),
        migrations.AlterField(
            model_name="deliverypartnerapplication",
            name="license_image_back",
            field=models.ImageField(upload_to="delivery_partners/licenses/%Y/%m/"),
        ),
        migrations.AlterField(
            model_name="deliverypartnerapplication",
            name="aadhar_image_back",
            field=models.ImageField(upload_to="delivery_partners/aadhar/%Y/%m/"),
        ),
        migrations.AlterField(
            model_name="deliverypartnerapplication",
            name="pan_image_back",
            field=models.ImageField(upload_to="delivery_partners/pan/%Y/%m/"),
        ),
    ]
