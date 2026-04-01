from django.db.models import Q
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from rest_framework.response import Response

from products.api.filter_utils import (
    aggregate_price_range,
    apply_category_filters,
    apply_demographic_filters,
    apply_discount_filters,
    apply_product_ordering,
    truthy_param,
)
from products.api.pagination import ProductPagination
from products.api.serializers import (
    BannerSerializer,
    CategorySerializer,
    ProductReadSerializer,
    ProductWriteSerializer,
    SiteSectionSerializer,
)
from products.catalog_constants import SHOE_CATEGORY_SLUGS
from products.models import Banner, Category, Product, SiteSection


class ProductViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticatedOrReadOnly]
    pagination_class = ProductPagination

    def get_queryset(self):
        search = (self.request.query_params.get("search") or "").strip()
        base = Product.objects.select_related("category")
        if self.request.user.is_authenticated:
            qs = base.all()
        else:
            qs = base.filter(is_active=True)
        qs = apply_category_filters(qs, self.request)
        if search:
            qs = qs.filter(
                Q(name__icontains=search) | Q(category__name__icontains=search)
            )
        qs = apply_demographic_filters(qs, self.request)
        qs = apply_discount_filters(qs, self.request)
        return apply_product_ordering(qs, self.request)

    @action(detail=False, methods=["get"], url_path="filter-options")
    def filter_options(self, request):
        """Distinct brands, sizes, colors (+ price bounds) for category / footwear scope (no facet filters)."""
        qs = Product.objects.select_related("category").filter(is_active=True)
        qs = apply_category_filters(qs, request)
        search = (request.query_params.get("search") or "").strip()
        if search:
            qs = qs.filter(
                Q(name__icontains=search) | Q(category__name__icontains=search)
            )
        brands = sorted(
            {b.strip() for b in qs.exclude(brand="").values_list("brand", flat=True) if b and b.strip()},
            key=str.lower,
        )
        sizes_set: set[str] = set()
        colors_set: set[str] = set()
        for row in qs.only("size_slugs", "colors").iterator():
            if row.size_slugs:
                for s in row.size_slugs.strip("|").split("|"):
                    s = s.strip()
                    if s:
                        sizes_set.add(s)
            cols = row.colors
            if isinstance(cols, list):
                for c in cols:
                    t = str(c).strip().lower()
                    if t:
                        colors_set.add(t)
        pmin, pmax = aggregate_price_range(qs)
        shoe_types = []
        if truthy_param(request, "footwear"):
            active_slugs = set(
                qs.filter(category__slug__in=SHOE_CATEGORY_SLUGS)
                .values_list("category__slug", flat=True)
                .distinct()
            )
            shoe_types = sorted(active_slugs & set(SHOE_CATEGORY_SLUGS), key=str.lower)
        return Response(
            {
                "brands": brands,
                "sizes": sorted(sizes_set, key=lambda x: (len(x), x.lower())),
                "colors": sorted(colors_set),
                "price_min": float(pmin) if pmin is not None else None,
                "price_max": float(pmax) if pmax is not None else None,
                "count": qs.count(),
                "shoe_types": shoe_types,
            }
        )

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
