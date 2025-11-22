from django.contrib import admin
from .models import StockMovement


@admin.register(StockMovement)
class StockMovementAdmin(admin.ModelAdmin):
    list_display = (
        'product',
        'movement_type',
        'quantity',
        'source_location',
        'destination_location',
        'created_by',
        'created_at',
    )

    list_filter = ('movement_type', 'product', 'source_location', 'destination_location')
    search_fields = ('product__name', 'document_number')
    ordering = ('-created_at',)

    readonly_fields = (
        'created_at', 'updated_at'
    )
    
    list_per_page = 30
