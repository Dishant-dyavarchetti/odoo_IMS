from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class DeliveryStatus(models.TextChoices):
    DRAFT = "DRAFT", "Draft"                 # Created but not confirmed
    WAITING = "WAITING", "Waiting for Stock" # Out of stock
    READY = "READY", "Ready to Deliver"      # Stock available
    DONE = "DONE", "Delivered"               # Movement posted


class Delivery(models.Model):
    reference = models.CharField(
        max_length=50,
        unique=True,
        help_text="Auto-generated delivery number"
    )

    delivery_address = models.CharField(
        max_length=200,
        help_text="Where the goods are delivered"
    )

    operation_type = models.CharField(
        max_length=50,
        default="Customer Delivery",
        help_text="Customer / Internal Transfer / Disposal"
    )

    schedule_date = models.DateField(
        null=True,
        blank=True
    )

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


    def save(self, *args, **kwargs):
        is_new = self.pk is None

        super().save(*args, **kwargs)

        if is_new and (not self.reference or self.reference == "auto"):
            first_line = self.lines.first()
            if first_line:
                warehouse_code = first_line.location.warehouse.name[:2].upper()
            else:
                warehouse_code = "WH"

            operation_code = "OUT"
            last_id = Delivery.objects.count()

            self.reference = f"{warehouse_code}/{operation_code}/{last_id:03d}"

            super().save(*args, **kwargs)


    def validate(self):
        """
        Validate → Create StockMovement → Set status DONE
        """
        if self.status == DeliveryStatus.DONE:
            return
        
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

        self.status = DeliveryStatus.DONE
        self.save()



class DeliveryLine(models.Model):
    delivery = models.ForeignKey(
        Delivery,
        on_delete=models.CASCADE,
        related_name='lines'
    )

    product = models.ForeignKey(
        "products.Product",
        on_delete=models.PROTECT
    )

    location = models.ForeignKey(
        "warehouse.Location",
        on_delete=models.PROTECT,
        help_text="Stock will be deducted from this location"
    )

    quantity = models.DecimalField(
        max_digits=12,
        decimal_places=3
    )

    def __str__(self):
        return f"{self.product} ({self.quantity})"
