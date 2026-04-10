from django.db import migrations


def backfill_group(apps, schema_editor):
    Group = apps.get_model("auth", "Group")
    User = apps.get_model("auth", "User")
    Application = apps.get_model("delivery_partners", "DeliveryPartnerApplication")
    grp, _ = Group.objects.get_or_create(name="Delivery Partner")
    for app in Application.objects.filter(status="approved").exclude(linked_user_id=None):
        user = User.objects.filter(pk=app.linked_user_id).first()
        if user:
            user.groups.add(grp)


class Migration(migrations.Migration):

    dependencies = [
        ("delivery_partners", "0002_document_front_back_and_partner_group"),
    ]

    operations = [
        migrations.RunPython(backfill_group, migrations.RunPython.noop),
    ]
