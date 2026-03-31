from django.urls import include, path
from rest_framework.routers import DefaultRouter

from orders.api.views import DeliveryOptionViewSet, OrderViewSet

router = DefaultRouter()
router.register("orders", OrderViewSet, basename="order")
router.register("delivery-options", DeliveryOptionViewSet, basename="deliveryoption")

urlpatterns = [
    path("", include(router.urls)),
]
