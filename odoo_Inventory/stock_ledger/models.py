from django.db import models
from django.contrib.auth import get_user_model
from products.models import UnitOfMeasure
from warehouse.models import StockQuant
from django.core.exceptions import ValidationError


User = get_user_model()


class MovementType(models.TextChoices):
    RECEIPT = 'RECEIPT', 'Receipt'              # Goods coming in
    DELIVERY = 'DELIVERY', 'Delivery'           # Goods going out
    TRANSFER = 'TRANSFER', 'Internal Transfer'  # Between locations
    ADJUSTMENT = 'ADJUSTMENT', 'Adjustment'     # Stock correction
    OPENING = 'OPENING', 'Opening Balance'      # Initial stock load


class StockMovement(models.Model):
    """
    Core ledger table: every stock change is recorded here.
    It does NOT store real-time stock; it represents stock history.
    """

    movement_type = models.CharField(
        max_length=20,
        choices=MovementType.choices
    )

    product = models.ForeignKey(
        'products.Product',
        on_delete=models.PROTECT,
        related_name='stock_movements'
    )

    source_location = models.ForeignKey(
        'warehouse.Location',
        on_delete=models.PROTECT,
        related_name='outgoing_movements',
        null=True,
        blank=True
    )

    destination_location = models.ForeignKey(
        'warehouse.Location',
        on_delete=models.PROTECT,
        related_name='incoming_movements',
        null=True,
        blank=True
    )

    quantity = models.DecimalField(
        max_digits=12,
        decimal_places=1,
        help_text="Positive number. Direction is decided by movement_type."
    )

    # Updated: UOM is now a ForeignKey
    uom = models.ForeignKey(
        UnitOfMeasure,
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        help_text="Unit of measure for this movement. Defaults from product."
    )

    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='created_stock_movements'
    )

    document_type = models.CharField(
        max_length=50,
        blank=True,
        help_text="e.g. 'RECEIPT', 'DELIVERY', 'TRANSFER'."
    )

    document_number = models.CharField(
        max_length=100,
        blank=True,
        help_text="External or internal reference number."
    )

    note = models.TextField(
        blank=True,
        help_text="Optional remark for this movement."
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['product']),
            models.Index(fields=['movement_type']),
            models.Index(fields=['document_type', 'document_number']),
        ]


    def __str__(self):
        return f"{self.movement_type} | {self.product} | {self.quantity} {self.uom}"


    # Helper properties
    @property
    def is_inbound(self) -> bool:
        return self.movement_type in {
            MovementType.RECEIPT,
            MovementType.TRANSFER,
            MovementType.ADJUSTMENT,
            MovementType.OPENING,
        }

    @property
    def is_outbound(self) -> bool:
        return self.movement_type in {
            MovementType.DELIVERY,
            MovementType.TRANSFER,
            MovementType.ADJUSTMENT,
        }


    def clean(self):
        """Validations to keep ledger consistent."""
        from django.core.exceptions import ValidationError

        if self.quantity <= 0:
            raise ValidationError("Quantity must be a positive value.")

        if self.movement_type == MovementType.TRANSFER:
            if not self.source_location or not self.destination_location:
                raise ValidationError("Transfer requires both source and destination.")

        if self.movement_type == MovementType.RECEIPT and not self.destination_location:
            raise ValidationError("Receipt requires destination location.")

        if self.movement_type == MovementType.DELIVERY and not self.source_location:
            raise ValidationError("Delivery requires source location.")
        
        if self.is_outbound and self.source_location:
            current_stock = StockQuant.objects.filter(
                product=self.product,
                location=self.source_location
            ).first()

            current_qty = current_stock.quantity if current_stock else 0

            if self.quantity > current_qty:
                raise ValidationError(
                    f"Insufficient stock at {self.source_location}. "
                    f"Available: {current_qty}, Required: {self.quantity}"
                )


    def save(self, *args, **kwargs):
        # Automatically assign UOM based on Product if not provided
        if not self.uom and self.product:
            self.uom = self.product.uom

        super().save(*args, **kwargs)