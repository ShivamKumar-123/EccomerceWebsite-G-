from django.db.models import Q
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticatedOrReadOnly

from products.api.serializers import (
    BannerSerializer,
    CategorySerializer,
    ProductReadSerializer,
    ProductWriteSerializer,
    SiteSectionSerializer,
)
from products.models import Banner, Category, Product, SiteSection


class ProductViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        search = (self.request.query_params.get("search") or "").strip()
        category_slug = (self.request.query_params.get("category") or "").strip()
        base = Product.objects.select_related("category")
        if self.request.user.is_authenticated:
            qs = base.all()
        else:
            qs = base.filter(is_active=True)
        if category_slug:
            qs = qs.filter(category__slug=category_slug)
        if search:
            qs = qs.filter(
                Q(name__icontains=search) | Q(category__name__icontains=search)
            )
        return qs.order_by("name")

    def get_serializer_class(self):
        if self.action in ("create", "update", "partial_update"):
            return ProductWriteSerializer
        return ProductReadSerializer


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.all().order_by("name")
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticatedOrReadOnly]


class BannerViewSet(viewsets.ModelViewSet):
    serializer_class = BannerSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    http_method_names = ["get", "post", "patch", "delete", "head", "options"]

    def get_queryset(self):
        qs = Banner.objects.all().order_by("sort_order", "id")
        if not self.request.user.is_authenticated:
            qs = qs.filter(is_active=True)
        return qs


class SiteSectionViewSet(viewsets.ModelViewSet):
    serializer_class = SiteSectionSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    http_method_names = ["get", "post", "patch", "delete", "head", "options"]

    def get_queryset(self):
        qs = SiteSection.objects.all()
        placement = (self.request.query_params.get("placement") or "").strip()
        if not self.request.user.is_authenticated:
            qs = qs.filter(is_active=True)
        if placement:
            qs = qs.filter(placement=placement)
        return qs.order_by("sort_order", "id")
