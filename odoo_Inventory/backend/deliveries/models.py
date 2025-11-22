from django.db import models
from django.contrib.auth import get_user_model
from warehouse.models import Location
from receipts.models import Vendor  # or Customer model if separate

User = get_user_model()


# -----------------------------
# STATUS FLOW: DRAFT → READY → DONE
# -----------------------------
class DeliveryStatus(models.TextChoices):
    DRAFT = "DRAFT", "Draft"
    READY = "READY", "Ready"
    DONE = "DONE", "Done"


class Delivery(models.Model):
    reference = models.CharField(
        max_length=50,
        unique=True,
        blank=True,
        null=True,
        help_text="Auto-generated delivery number"
    )

    deliver_to = models.ForeignKey(
        Vendor,
        on_delete=models.PROTECT,
        related_name="deliveries",
        null=True,
        blank=True
    )


    schedule_date = models.DateField(null=True, blank=True)

    responsible = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    status = models.CharField(
        max_length=20,
        choices=DeliveryStatus.choices,
        default=DeliveryStatus.DRAFT
    )

    note = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


    def __str__(self):
        return f"{self.reference} [{self.status}]"


    # -----------------------------
    # SAVE + AUTO-GENERATE REF + STATUS TRIGGER
    # -----------------------------
    def save(self, *args, **kwargs):
        is_new = self.pk is None
        old_status = None

        if not is_new:
            old_status = Delivery.objects.get(pk=self.pk).status

        super().save(*args, **kwargs)

        # Generate reference once lines are saved
        if is_new and not self.reference:
            first_line = self.lines.first()
            warehouse_code = first_line.location.warehouse.name[:2].upper() if first_line else "WH"
            operation_code = "OUT"
            new_id = Delivery.objects.count()

            self.reference = f"{warehouse_code}/{operation_code}/{new_id:03d}"
            super().save(update_fields=["reference"])

        # Auto-validate when newly created as DONE or status transitions to DONE
        if self.status == DeliveryStatus.DONE and (is_new or old_status != DeliveryStatus.DONE):
            self.validate()


    # -----------------------------
    # VALIDATE DELIVERY → CREATE STOCK MOVEMENTS
    # -----------------------------
    def validate(self):
        from stock_ledger.models import StockMovement, MovementType

        for line in self.lines.all():
            StockMovement.objects.create(
                movement_type=MovementType.DELIVERY,
                product=line.product,
                quantity=line.quantity,
                source_location=line.location,
                created_by=self.responsible,
                document_type="DELIVERY",
                document_number=self.reference,
            )

        super().save(update_fields=["status"])


# -----------------------------
# DELIVERY LINE ITEMS
# -----------------------------
class DeliveryLine(models.Model):
    delivery = models.ForeignKey(
        Delivery,
        on_delete=models.CASCADE,
        related_name="lines"
    )

    product = models.ForeignKey(
        "products.Product",
        on_delete=models.PROTECT
    )

    location = models.ForeignKey(
        "warehouse.Location",
        on_delete=models.PROTECT
    )

    quantity = models.DecimalField(
        max_digits=12,
        decimal_places=3
    )

    def __str__(self):
        return f"{self.product} ({self.quantity})"
