from django.db import models
from django.contrib.auth import get_user_model
from products.models import UnitOfMeasure
from warehouse.models import StockQuant
from django.core.exceptions import ValidationError

User = get_user_model()


class MovementType(models.TextChoices):
    RECEIPT = 'RECEIPT', 'Receipt'
    DELIVERY = 'DELIVERY', 'Delivery'
    TRANSFER = 'TRANSFER', 'Internal Transfer'
    ADJUSTMENT = 'ADJUSTMENT', 'Adjustment'
    OPENING = 'OPENING', 'Opening Balance'


class StockMovement(models.Model):
    """
    Core ledger table: every stock change is recorded here.
    Does NOT store current stock balance → history only.
    """

    movement_type = models.CharField(max_length=20, choices=MovementType.choices)

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

    document_type = models.CharField(max_length=50, blank=True)
    document_number = models.CharField(max_length=100, blank=True)
    note = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # 🔥 Prevent recursion for auto-generated transfer entries
    is_auto = models.BooleanField(default=False, editable=False)


    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['product']),
            models.Index(fields=['movement_type']),
            models.Index(fields=['document_type', 'document_number']),
        ]


    def __str__(self):
        return f"{self.movement_type} | {self.product} | {self.quantity} {self.uom}"


    # --------------------------
    # PROPERTIES
    # --------------------------
    @property
    def is_inbound(self):
        return self.movement_type in {
            MovementType.RECEIPT,
            MovementType.TRANSFER,
            MovementType.ADJUSTMENT,
            MovementType.OPENING,
        }

    @property
    def is_outbound(self):
        return self.movement_type in {
            MovementType.DELIVERY,
            MovementType.TRANSFER,
            MovementType.ADJUSTMENT,
        }


    # --------------------------
    # VALIDATION RULES
    # --------------------------
    def clean(self):

        if self.quantity <= 0:
            raise ValidationError("Quantity must be a positive value.")

        if self.movement_type == MovementType.TRANSFER:
            if not self.source_location or not self.destination_location:
                raise ValidationError("Transfer requires both source and destination.")

        if self.movement_type == MovementType.RECEIPT and not self.destination_location:
            raise ValidationError("Receipt requires destination location.")

        if self.movement_type == MovementType.DELIVERY and not self.source_location:
            raise ValidationError("Delivery requires source location.")

        # 🔥 Prevent negative outbound without stock
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


    # --------------------------
    # SAVE (+ TRANSFER LOGIC)
    # --------------------------
    def save(self, *args, **kwargs):

        # Auto assign UOM if missing
        if not self.uom and self.product:
            self.uom = self.product.uom

        super().save(*args, **kwargs)

        # 🔥 AUTO-CREATE IN + OUT ENTRIES FOR TRANSFER
        from stock_ledger.models import MovementType

        if (
            self.movement_type == MovementType.TRANSFER
            and not self.is_auto
            and self.source_location
            and self.destination_location
        ):
            # OUT MOVEMENT
            StockMovement.objects.create(
                movement_type=MovementType.TRANSFER,
                product=self.product,
                quantity=self.quantity,   # direction is outbound
                source_location=self.source_location,
                document_type=self.document_type,
                document_number=self.document_number,
                created_by=self.created_by,
                uom=self.uom,
                is_auto=True
            )

            # IN MOVEMENT
            StockMovement.objects.create(
                movement_type=MovementType.TRANSFER,
                product=self.product,
                quantity=self.quantity,   # inbound entry
                destination_location=self.destination_location,
                document_type=self.document_type,
                document_number=self.document_number,
                created_by=self.created_by,
                uom=self.uom,
                is_auto=True
            )
