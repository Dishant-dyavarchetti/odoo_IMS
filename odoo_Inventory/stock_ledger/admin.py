from django.contrib import admin
from .models import StockMovement


@admin.register(StockMovement)
class StockMovementAdmin(admin.ModelAdmin):
    list_display = ['movement_type', 'product', 'quantity', 'source_location', 'destination_location', 'document_reference', 'created_at', 'created_by']
    list_filter = ['movement_type', 'document_type', 'created_at']
    search_fields = ['product__sku', 'product__name', 'document_reference']
    readonly_fields = ['created_at']
    ordering = ['-created_at']
