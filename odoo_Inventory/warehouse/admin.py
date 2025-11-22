from django.contrib import admin
from .models import Warehouse, Location, StockQuant


@admin.register(Warehouse)
class WarehouseAdmin(admin.ModelAdmin):
    list_display = ('name', 'code')
    search_fields = ('name', 'code')


@admin.register(Location)
class LocationAdmin(admin.ModelAdmin):
    list_display = ('name', 'warehouse', 'is_internal')
    list_filter = ('warehouse', 'is_internal')
    search_fields = ('name', 'warehouse__name')


@admin.register(StockQuant)
class StockQuantAdmin(admin.ModelAdmin):
    list_display = ('product', 'location', 'quantity')
    list_filter = ('location__warehouse',)
    search_fields = ('product__name', 'location__name')
    readonly_fields = ('product', 'location')   # prevent accidental edits