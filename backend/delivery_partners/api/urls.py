from django.urls import include, path
from rest_framework.routers import DefaultRouter

from delivery_partners.api.views import (
    DeliveryPartnerApplicationViewSet,
    delivery_partner_account,
    delivery_partner_mark_delivered,
    delivery_partner_orders,
    delivery_partner_stats,
    staff_list_delivery_partner_users,
)

router = DefaultRouter()
router.register(
    "delivery-partner-applications",
    DeliveryPartnerApplicationViewSet,
    basename="deliverypartnerapplication",
)

urlpatterns = [
    path("delivery-partner-account/", delivery_partner_account, name="delivery-partner-account"),
    path(
        "delivery-partner/orders/<uuid:order_id>/mark-delivered/",
        delivery_partner_mark_delivered,
        name="delivery-partner-mark-delivered",
    ),
    path("delivery-partner/orders/", delivery_partner_orders, name="delivery-partner-orders"),
    path("delivery-partner/stats/", delivery_partner_stats, name="delivery-partner-stats"),
    path(
        "staff/delivery-partner-users/",
        staff_list_delivery_partner_users,
        name="staff-delivery-partner-users",
    ),
    path("", include(router.urls)),
]
