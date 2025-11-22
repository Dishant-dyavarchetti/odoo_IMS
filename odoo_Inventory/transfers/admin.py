from django.contrib import admin
from .models import TransferOrder, TransferLine


class TransferLineInline(admin.TabularInline):
    model = TransferLine
    extra = 1
    fields = ['product', 'quantity', 'notes']


@admin.register(TransferOrder)
class TransferOrderAdmin(admin.ModelAdmin):
    list_display = ['transfer_number', 'source_location', 'destination_location', 'status', 'scheduled_date', 'created_at', 'created_by']
    list_filter = ['status', 'created_at', 'scheduled_date']
    search_fields = ['transfer_number']
    readonly_fields = ['created_at', 'updated_at', 'validated_at']
    ordering = ['-created_at']
    inlines = [TransferLineInline]
