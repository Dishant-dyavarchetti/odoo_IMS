from django.contrib import admin
from .models import DeliveryOrder, DeliveryLine


class DeliveryLineInline(admin.TabularInline):
    model = DeliveryLine
    extra = 1
    fields = ['product', 'quantity', 'unit_price', 'notes']


@admin.register(DeliveryOrder)
class DeliveryOrderAdmin(admin.ModelAdmin):
    list_display = ['delivery_number', 'customer_name', 'source_location', 'status', 'scheduled_date', 'created_at', 'created_by']
    list_filter = ['status', 'created_at', 'scheduled_date']
    search_fields = ['delivery_number', 'customer_name', 'customer_reference']
    readonly_fields = ['created_at', 'updated_at', 'validated_at']
    ordering = ['-created_at']
    inlines = [DeliveryLineInline]
