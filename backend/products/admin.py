from django.contrib import admin

from products.models import Banner, Category, Product, SiteSection


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "slug")
    prepopulated_fields = {"slug": ("name",)}
    search_fields = ("name", "slug")


@admin.register(Banner)
class BannerAdmin(admin.ModelAdmin):
    list_display = ("title", "sort_order", "is_active", "updated_at")
    list_filter = ("is_active",)
    search_fields = ("title",)
    ordering = ("sort_order", "id")


@admin.register(SiteSection)
class SiteSectionAdmin(admin.ModelAdmin):
    list_display = ("title", "placement", "sort_order", "is_active", "updated_at")
    list_filter = ("placement", "is_active")
    search_fields = ("title", "body")
    ordering = ("placement", "sort_order", "id")


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ("name", "category", "price", "stock", "is_active", "updated_at")
    list_filter = ("is_active", "category")
    search_fields = ("name",)
    autocomplete_fields = ("category",)
