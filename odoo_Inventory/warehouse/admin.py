from django.contrib import admin
from .models import Warehouse, Location, StockQuant


@admin.register(Warehouse)
class WarehouseAdmin(admin.ModelAdmin):
    list_display = ['code', 'name', 'city', 'is_active', 'created_at']
    list_filter = ['is_active', 'city', 'created_at']
    search_fields = ['code', 'name', 'city']
    ordering = ['name']


@admin.register(Location)
class LocationAdmin(admin.ModelAdmin):
    list_display = ['code', 'name', 'warehouse', 'location_type', 'parent', 'is_active']
    list_filter = ['warehouse', 'location_type', 'is_active']
    search_fields = ['code', 'name']
    ordering = ['warehouse', 'code']


@admin.register(StockQuant)
class StockQuantAdmin(admin.ModelAdmin):
    list_display = ['product', 'location', 'quantity', 'reserved_quantity', 'last_updated']
    list_filter = ['location__warehouse', 'last_updated']
    search_fields = ['product__sku', 'product__name', 'location__code']
    readonly_fields = ['created_at', 'last_updated']
