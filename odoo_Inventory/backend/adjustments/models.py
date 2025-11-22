from django.db import models
from django.contrib.auth import get_user_model
from warehouse.models import Location
from products.models import Product
from stock_ledger.models import StockMovement, MovementType

User = get_user_model()


class AdjustmentStatus(models.TextChoices):
    DRAFT = "DRAFT", "Draft"
    READY = "READY", "Ready"
    DONE = "DONE", "Done"


class StockAdjustment(models.Model):
    reference = models.CharField(max_length=50, unique=True, blank=True)
    location = models.ForeignKey(Location, on_delete=models.PROTECT)
    reason = models.CharField(max_length=200, blank=True)
    responsible = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)

    status = models.CharField(
        max_length=20,
        choices=AdjustmentStatus.choices,
        default=AdjustmentStatus.DRAFT
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.reference} [{self.status}]"

    def save(self, *args, **kwargs):
        is_new = self.pk is None

        if is_new and not self.reference:
            # Warehouse prefix e.g. WH
            wh_code = self.location.warehouse.name[:2].upper()

            # Operation prefix
            op_code = "ADJ"

            # Get last number (only for adjustments from same warehouse)
            last_adj = StockAdjustment.objects.filter(
                reference__startswith=f"{wh_code}/{op_code}/"
            ).order_by("-id").first()

            if last_adj:
                # Extract last incremental number
                last_num = int(last_adj.reference.split("/")[-1])
                new_num = last_num + 1
            else:
                new_num = 1

            # Generate new formatted reference
            self.reference = f"{wh_code}/{op_code}/{new_num:03d}"

        super().save(*args, **kwargs)


    # POST TO LEDGER
    def validate(self):
        if self.status == AdjustmentStatus.DONE:
            return  # avoid duplicate posting

        for line in self.lines.all():
            StockMovement.objects.create(
                movement_type=MovementType.ADJUSTMENT,
                product=line.product,
                quantity=line.adjusted_qty,
                source_location=self.location if line.adjusted_qty < 0 else None,
                destination_location=self.location if line.adjusted_qty > 0 else None,
                created_by=self.responsible,
                document_type="ADJUSTMENT",
                document_number=self.reference
            )

        self.status = AdjustmentStatus.DONE
        self.save()

class StockAdjustmentLine(models.Model):
    adjustment = models.ForeignKey(
        StockAdjustment,
        on_delete=models.CASCADE,
        related_name="lines"
    )

    product = models.ForeignKey(Product, on_delete=models.PROTECT)
    adjusted_qty = models.DecimalField(max_digits=12, decimal_places=2)

    def __str__(self):
        return f"{self.product} ({self.adjusted_qty})"
