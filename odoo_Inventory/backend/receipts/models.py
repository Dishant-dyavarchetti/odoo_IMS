from django.db import models
from django.contrib.auth import get_user_model
from warehouse.models import Location

User = get_user_model()

# -----------------------------
# STATUS FLOW: DRAFT → READY → DONE
# -----------------------------
class ReceiptStatus(models.TextChoices):
    DRAFT = "DRAFT", "Draft"
    READY = "READY", "Ready"
    DONE = "DONE", "Done"


class Vendor(models.Model):
    name = models.CharField(max_length=150, unique=True)
    address = models.TextField(blank=True)
    contact_person = models.CharField(max_length=100, blank=True)
    phone = models.CharField(max_length=20, blank=True)
    email = models.EmailField(blank=True)

    def __str__(self):
        return self.name


class Receipt(models.Model):
    reference = models.CharField(
        max_length=50,
        unique=True,
        blank=True,
        null=True,
        help_text="Auto-generated receipt number"
    )

    receive_from = models.ForeignKey(
        Vendor,
        on_delete=models.PROTECT,
        related_name='receipts',
        help_text="Select vendor"
    )

    schedule_date = models.DateField(
        null=True,
        blank=True
    )

    responsible = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        help_text="Responsible person"
    )

    status = models.CharField(
        max_length=20,
        choices=ReceiptStatus.choices,
        default=ReceiptStatus.DRAFT
    )

    note = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


    def __str__(self):
        return f"{self.reference} [{self.status}]"


    # -----------------------------------------
    # SAVE → Auto-Reference + Auto-Validation
    # -----------------------------------------
    def save(self, *args, **kwargs):
        is_new = self.pk is None
        previous_status = None

        if not is_new:
            previous_status = Receipt.objects.get(pk=self.pk).status

        super().save(*args, **kwargs)   # save first so `lines` exist


        # -----------------------------------------
        # AUTO-GENERATE REFERENCE (ONCE)
        # -----------------------------------------
        if is_new and not self.reference:
            first_line = self.lines.first()

            warehouse_code = (
                first_line.location.warehouse.name[:2].upper()
                if first_line else "WH"
            )
            operation_code = "IN"

            last_id = Receipt.objects.count()
            self.reference = f"{warehouse_code}/{operation_code}/{last_id:03d}"

            super().save(update_fields=["reference"])


        # -----------------------------------------
        # AUTO VALIDATE WHEN STATUS SETS TO DONE
        # -----------------------------------------
        if self.status == ReceiptStatus.DONE and self.lines.exists() and (is_new or previous_status != ReceiptStatus.DONE):
            self.validate()


    # -----------------------------------------
    # VALIDATE → Create Stock Movement Entries
    # -----------------------------------------
    
    def validate(self):
        from stock_ledger.models import StockMovement, MovementType

        # If movements already exist for this receipt, skip re-posting
        if self.status == ReceiptStatus.DONE:
            # But continue posting movements if they don't exist
            pass

        for line in self.lines.all():
            StockMovement.objects.get_or_create(
                movement_type=MovementType.RECEIPT,
                product=line.product,
                quantity=line.quantity,
                destination_location=line.location,
                created_by=self.responsible,
                document_type="RECEIPT",
                document_number=self.reference,
            )

        # Mark DONE finally
        super().save(update_fields=["status"])



# -----------------------------
# RECEIPT LINE ITEMS
# -----------------------------
class ReceiptLine(models.Model):
    receipt = models.ForeignKey(
        Receipt,
        on_delete=models.CASCADE,
        related_name='lines'
    )

    product = models.ForeignKey(
        'products.Product',
        on_delete=models.PROTECT
    )

    location = models.ForeignKey(
        'warehouse.Location',
        on_delete=models.PROTECT
    )

    quantity = models.DecimalField(
        max_digits=12,
        decimal_places=3
    )

    def __str__(self):
        return f"{self.product} ({self.quantity})"
