from django.contrib import admin
from .models import Product, Category, UnitOfMeasure


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'sku', 'category', 'uom', 'is_active')
    list_filter = ('category', 'uom', 'is_active')
    search_fields = ('name', 'sku')
    list_per_page = 25
    ordering = ('name',)
    fieldsets = (
        ("Basic Info", {
            "fields": ("name", "sku", "category")
        }),
        ("Inventory Config", {
            "fields": ("uom", "is_active")
        }),
    )


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'parent')
    search_fields = ('name',)


@admin.register(UnitOfMeasure)
class UnitOfMeasureAdmin(admin.ModelAdmin):
    list_display = ('name', 'abbreviation')
    search_fields = ('name', 'abbreviation')
