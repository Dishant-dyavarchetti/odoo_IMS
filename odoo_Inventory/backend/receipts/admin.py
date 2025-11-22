from django.contrib import admin
from .models import Receipt, ReceiptLine, Vendor
from .models import ReceiptStatus


class ReceiptLineInline(admin.TabularInline):
    model = ReceiptLine
    extra = 1
    min_num = 1
    verbose_name = "Product Line"
    verbose_name_plural = "Product Lines"


@admin.register(Vendor)
class VendorAdmin(admin.ModelAdmin):
    list_display = ('name', 'phone', 'email')
    search_fields = ('name', 'email', 'phone')


@admin.register(Receipt)
class ReceiptAdmin(admin.ModelAdmin):
    list_display = (
        'reference',
        'receive_from',
        'schedule_date',
        'responsible',
        'status',
        'created_at'
    )

    list_filter = ('status', 'schedule_date')
    search_fields = ('reference', 'receive_from__name')   # FIXED
    inlines = [ReceiptLineInline]

    exclude = ("reference",)  # Hide reference from admin form
    readonly_fields = ("created_at", "updated_at")

    actions = ['mark_as_ready', 'validate_receipts']

    # ----------------------------
    # ACTION: Mark as READY
    # ----------------------------
    @admin.action(description="Mark selected receipts as Ready")
    def mark_as_ready(self, request, queryset):
        queryset.update(status=ReceiptStatus.READY)
        self.message_user(request, "Receipts moved to READY status.")

    # ----------------------------
    # ACTION: Validate Receipt (POST stock)
    # ----------------------------
    @admin.action(description="Validate selected receipts (Post stock movements)")
    def validate_receipts(self, request, queryset):
        validated = 0
        for receipt in queryset:
            if receipt.status != ReceiptStatus.DONE:
                receipt.validate()
                validated += 1

        self.message_user(request, f"{validated} receipt(s) validated successfully.")
