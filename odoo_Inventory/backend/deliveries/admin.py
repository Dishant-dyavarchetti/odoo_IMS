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
    # -------------------------------
    # LIST VIEW CONFIG
    # -------------------------------
    list_display = (
        "reference",
        "deliver_to",
        "schedule_date",
        "responsible",
        "status",
        "created_at",
    )

    list_filter = ("status", "schedule_date", "deliver_to")
    search_fields = ("reference", "deliver_to__name", "responsible__username")
    ordering = ("-created_at",)

    # -------------------------------
    # FORM UI CONFIG
    # -------------------------------
    inlines = [DeliveryLineInline]

    exclude = ("reference",)             # auto-generated
    readonly_fields = ("created_at", "updated_at")

    fieldsets = (
        ("Delivery Info", {
            "fields": ("deliver_to", "schedule_date", "status", "note")
        }),
        ("User & Audit", {
            "fields": ("responsible", "created_at", "updated_at")
        }),
    )

    # -------------------------------
    # ADMIN ACTIONS
    # -------------------------------
    actions = ["mark_as_ready", "mark_as_done"]

    @admin.action(description="Mark selected deliveries as Ready")
    def mark_as_ready(self, request, queryset):
        updated = queryset.update(status=DeliveryStatus.READY)
        self.message_user(request, f"{updated} delivery(ies) marked READY.")

    @admin.action(description="Mark selected deliveries as Done (post stock movements)")
    def mark_as_done(self, request, queryset):
        count = 0
        for delivery in queryset:
            if delivery.status != DeliveryStatus.DONE:
                delivery.status = DeliveryStatus.DONE
                delivery.save()   # save() triggers validate()
                count += 1

        self.message_user(request, f"{count} delivery(ies) validated and completed.")


    # -------------------------------
    # AUTO ASSIGN USER ON CREATE
    # -------------------------------
    def save_model(self, request, obj, form, change):
        if not obj.responsible:
            obj.responsible = request.user
        super().save_model(request, obj, form, change)

    # -------------------------------
    # DISABLE EDITING WHEN DONE
    # -------------------------------
    def get_readonly_fields(self, request, obj=None):
        if obj and obj.status == DeliveryStatus.DONE:
            return (
                "reference", "deliver_to", "schedule_date", "responsible",
                "status", "note", "created_at", "updated_at"
            )
        return self.readonly_fields
