from django.contrib import admin
from .models import Delivery, DeliveryLine, DeliveryStatus


class DeliveryLineInline(admin.TabularInline):
    model = DeliveryLine
    extra = 1
    min_num = 1
    verbose_name = "Product Line"
    verbose_name_plural = "Product Lines"


@admin.register(Delivery)
class DeliveryAdmin(admin.ModelAdmin):
    list_display = (
        'reference',
        'delivery_address',
        'schedule_date',
        'responsible',
        'status',
        'created_at'
    )

    list_filter = ('status', 'schedule_date')

    # FIX: Search by address, not object reference
    search_fields = ('reference', 'delivery_address')  

    inlines = [DeliveryLineInline]

    # Hide reference field (auto-generated)
    exclude = ("reference",)

    # Read-only audit fields
    readonly_fields = ("created_at", "updated_at")

    actions = [
        'mark_as_waiting',
        'mark_as_ready',
        'validate_deliveries'
    ]


    # -------------------------------
    # ACTION: Mark as WAITING
    # -------------------------------
    @admin.action(description="Mark selected deliveries as Waiting")
    def mark_as_waiting(self, request, queryset):
        queryset.update(status=DeliveryStatus.WAITING)
        self.message_user(request, "Deliveries moved to WAITING.")


    # -------------------------------
    # ACTION: Mark as READY
    # -------------------------------
    @admin.action(description="Mark selected deliveries as Ready")
    def mark_as_ready(self, request, queryset):
        queryset.update(status=DeliveryStatus.READY)
        self.message_user(request, "Deliveries moved to READY.")


    # -------------------------------
    # ACTION: Validate → Apply stock movement
    # -------------------------------
    @admin.action(description="Validate selected deliveries (Post stock movements)")
    def validate_deliveries(self, request, queryset):
        validated = 0
        for delivery in queryset:
            if delivery.status != DeliveryStatus.DONE:
                delivery.validate()
                validated += 1

        self.message_user(request, f"{validated} delivery(s) validated successfully.")
