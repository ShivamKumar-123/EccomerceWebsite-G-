from django.contrib import admin

from delivery_partners.models import DeliveryPartnerApplication


@admin.register(DeliveryPartnerApplication)
class DeliveryPartnerApplicationAdmin(admin.ModelAdmin):
    list_display = ("full_name", "email", "phone", "status", "city", "state", "created_at")
    list_filter = ("status", "state")
    search_fields = ("full_name", "email", "phone", "license_number", "aadhar_number", "pan_number")
    readonly_fields = ("created_at", "updated_at", "password_sent_at", "linked_user", "reviewed_at")
