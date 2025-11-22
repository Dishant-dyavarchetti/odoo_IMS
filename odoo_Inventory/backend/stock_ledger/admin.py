from django.contrib import admin
from .models import StockMovement, MovementType


@admin.register(StockMovement)
class StockMovementAdmin(admin.ModelAdmin):

    # 👁 Columns on list page
    list_display = (
        'movement_type',
        'product',
        'source_location',
        'destination_location',
        'quantity',
        'uom',
        'created_by',
        'document_number',
        'created_at',
    )

    # 🔍 Filters
    list_filter = (
        'movement_type',
        'product',
        'source_location',
        'destination_location',
        'created_by',
        'document_type',
    )

    search_fields = (
        'document_number',
        'product__name',
        'source_location__name',
        'destination_location__name',
    )

    ordering = ('-created_at',)

    # 🔒 Hide internal / system fields
    exclude = ('is_auto',)

    # 🏷 UI Grouping (Cleaner Form)
    fieldsets = (
        ("Movement Details", {
            'fields': (
                'movement_type',
                'product',
                'quantity',
                'uom',
            ),
        }),
        ("Locations", {
            'fields': (
                'source_location',
                'destination_location',
            ),
        }),
        ("Document Metadata", {
            'fields': (
                'document_type',
                'document_number',
                'note',
            ),
        }),
        ("Audit", {
            'fields': ('created_by',),
        }),
    )

    # 🛑 Automatically assign user on admin save
    def save_model(self, request, obj, form, change):
        if not obj.created_by:
            obj.created_by = request.user
        super().save_model(request, obj, form, change)
