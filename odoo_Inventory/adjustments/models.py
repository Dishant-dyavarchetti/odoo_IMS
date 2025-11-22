from decimal import Decimal
from django.db import models
from django.core.validators import MinValueValidator
from django.conf import settings
from products.models import Product
from warehouse.models import Location, StockQuant
from stock_ledger.models import StockMovement


class AdjustmentEntry(models.Model):
    """Stock adjustment for fixing discrepancies"""
    
    STATUS_CHOICES = [
        ('DRAFT', 'Draft'),
        ('DONE', 'Done'),
        ('CANCELLED', 'Cancelled'),
    ]
    
    REASON_CHOICES = [
        ('DAMAGED', 'Damaged'),
        ('LOST', 'Lost'),
        ('FOUND', 'Found'),
        ('PHYSICAL_COUNT', 'Physical Count'),
        ('QUALITY_ISSUE', 'Quality Issue'),
        ('OTHER', 'Other'),
    ]
    
    adjustment_number = models.CharField(max_length=50, unique=True)
    location = models.ForeignKey(Location, on_delete=models.PROTECT, related_name='adjustments')
    product = models.ForeignKey(Product, on_delete=models.PROTECT, related_name='adjustments')
    
    # Quantities
    system_quantity = models.DecimalField(max_digits=15, decimal_places=3, 
                                         help_text="Current quantity in system")
    counted_quantity = models.DecimalField(max_digits=15, decimal_places=3, 
                                          validators=[MinValueValidator(Decimal('0'))],
                                          help_text="Actual counted quantity")
    adjustment_quantity = models.DecimalField(max_digits=15, decimal_places=3, 
                                             help_text="Difference (counted - system)")
    
    reason = models.CharField(max_length=20, choices=REASON_CHOICES)
    notes = models.TextField(blank=True, null=True)
    
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='DRAFT')
    
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name='adjustments')
    validated_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, 
                                     related_name='validated_adjustments', null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    validated_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'adjustment_entries'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['adjustment_number']),
            models.Index(fields=['status', 'created_at']),
        ]
    
    def __str__(self):
        return f"{self.adjustment_number} - {self.product.sku} - {self.adjustment_quantity:+.3f}"
    
    def save(self, *args, **kwargs):
        """Calculate adjustment quantity automatically"""
        if not self.adjustment_quantity and self.counted_quantity is not None:
            self.adjustment_quantity = self.counted_quantity - self.system_quantity
        super().save(*args, **kwargs)
    
    def validate(self, user):
        """Validate adjustment and create stock movement"""
        if self.status == 'DONE':
            raise ValueError("Adjustment already validated")
        
        from django.utils import timezone
        
        # Create stock movement
        if self.adjustment_quantity != 0:
            if self.adjustment_quantity > 0:
                # Positive adjustment - increase stock
                StockMovement.objects.create(
                    movement_type='ADJUSTMENT',
                    product=self.product,
                    quantity=abs(self.adjustment_quantity),
                    destination_location=self.location,
                    document_reference=self.adjustment_number,
                    document_type='ADJUSTMENT',
                    created_by=user,
                    notes=f"Adjustment: {self.get_reason_display()}"
                )
            else:
                # Negative adjustment - decrease stock
                StockMovement.objects.create(
                    movement_type='ADJUSTMENT',
                    product=self.product,
                    quantity=abs(self.adjustment_quantity),
                    source_location=self.location,
                    document_reference=self.adjustment_number,
                    document_type='ADJUSTMENT',
                    created_by=user,
                    notes=f"Adjustment: {self.get_reason_display()}"
                )
        
        self.status = 'DONE'
        self.validated_by = user
        self.validated_at = timezone.now()
        self.save()
