from django.contrib import admin
from .models import AdjustmentEntry


@admin.register(AdjustmentEntry)
class AdjustmentEntryAdmin(admin.ModelAdmin):
    list_display = ['adjustment_number', 'product', 'location', 'system_quantity', 'counted_quantity', 'adjustment_quantity', 'reason', 'status', 'created_at']
    list_filter = ['status', 'reason', 'created_at']
    search_fields = ['adjustment_number', 'product__sku', 'product__name']
    readonly_fields = ['created_at', 'updated_at', 'validated_at']
    ordering = ['-created_at']
