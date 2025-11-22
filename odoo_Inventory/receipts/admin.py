from django.contrib import admin
from .models import Receipt, ReceiptLine


class ReceiptLineInline(admin.TabularInline):
    model = ReceiptLine
    extra = 1
    fields = ['product', 'quantity', 'unit_price', 'notes']


@admin.register(Receipt)
class ReceiptAdmin(admin.ModelAdmin):
    list_display = ['receipt_number', 'supplier_name', 'destination_location', 'status', 'expected_date', 'created_at', 'created_by']
    list_filter = ['status', 'created_at', 'expected_date']
    search_fields = ['receipt_number', 'supplier_name', 'supplier_reference']
    readonly_fields = ['created_at', 'updated_at', 'validated_at']
    ordering = ['-created_at']
    inlines = [ReceiptLineInline]
