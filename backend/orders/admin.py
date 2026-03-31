from django.contrib import admin

from orders.models import DeliveryOption, Order


@admin.register(DeliveryOption)
class DeliveryOptionAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "fee", "eta_days", "active", "sort_order")
    list_editable = ("sort_order", "active")


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ("id", "status", "payment_status", "total", "user_id", "created_at")
    list_filter = ("status", "payment_status")
    search_fields = ("id", "user_id", "tracking_number", "customer_info")
    readonly_fields = ("id", "created_at", "updated_at")
