from django.contrib import admin
from .models import StockAdjustment, StockAdjustmentLine, AdjustmentStatus


class StockAdjustmentLineInline(admin.TabularInline):
    model = StockAdjustmentLine
    extra = 1


@admin.register(StockAdjustment)
class StockAdjustmentAdmin(admin.ModelAdmin):
    list_display = ('reference', 'location', 'responsible', 'status', 'created_at')
    list_filter = ('status', 'location')
    search_fields = ('reference',)

    inlines = [StockAdjustmentLineInline]

    actions = ['validate_adjustment']

    @admin.action(description="Validate selected adjustments")
    def validate_adjustment(self, request, queryset):
        for adj in queryset:
            adj.validate()
