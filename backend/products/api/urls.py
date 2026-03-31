from django.urls import include, path
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from products.api.views import (
    BannerViewSet,
    CategoryViewSet,
    ProductViewSet,
    SiteSectionViewSet,
)

router = DefaultRouter()
router.register("products", ProductViewSet, basename="product")
router.register("categories", CategoryViewSet, basename="category")
router.register("banners", BannerViewSet, basename="banner")
router.register("site-sections", SiteSectionViewSet, basename="site-section")

urlpatterns = [
    path("auth/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("auth/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("", include(router.urls)),
]
