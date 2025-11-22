from django.contrib import admin
from .models import Category, UnitOfMeasure, Product


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'parent', 'is_active', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['name', 'description']
    ordering = ['name']


@admin.register(UnitOfMeasure)
class UnitOfMeasureAdmin(admin.ModelAdmin):
    list_display = ['name', 'abbreviation', 'is_active']
    list_filter = ['is_active']
    search_fields = ['name', 'abbreviation']


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['sku', 'name', 'category', 'uom', 'cost_price', 'selling_price', 'min_stock_level', 'is_active']
    list_filter = ['category', 'is_active', 'created_at']
    search_fields = ['sku', 'name', 'barcode']
    ordering = ['name']
    readonly_fields = ['created_at', 'updated_at']
