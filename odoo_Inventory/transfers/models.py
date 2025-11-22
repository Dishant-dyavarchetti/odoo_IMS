from decimal import Decimal
from django.db import models
from django.core.validators import MinValueValidator
from django.conf import settings
from products.models import Product
from warehouse.models import Location
from stock_ledger.models import StockMovement


class TransferOrder(models.Model):
    """Internal transfer order for moving stock between locations"""
    
    STATUS_CHOICES = [
        ('DRAFT', 'Draft'),
        ('WAITING', 'Waiting'),
        ('READY', 'Ready'),
        ('DONE', 'Done'),
        ('CANCELLED', 'Cancelled'),
    ]
    
    transfer_number = models.CharField(max_length=50, unique=True)
    
    source_location = models.ForeignKey(Location, on_delete=models.PROTECT, related_name='outgoing_transfers')
    destination_location = models.ForeignKey(Location, on_delete=models.PROTECT, related_name='incoming_transfers')
    
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='DRAFT')
    scheduled_date = models.DateField(null=True, blank=True)
    transfer_date = models.DateField(null=True, blank=True)
    
    notes = models.TextField(blank=True, null=True)
    
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name='transfers')
    validated_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, 
                                     related_name='validated_transfers', null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    validated_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'transfer_orders'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['transfer_number']),
            models.Index(fields=['status', 'created_at']),
        ]
    
    def __str__(self):
        return f"{self.transfer_number} - {self.source_location.code} to {self.destination_location.code}"
    
    def validate(self, user):
        """Validate transfer and create stock movements"""
        if self.status == 'DONE':
            raise ValueError("Transfer already validated")
        
        if self.source_location == self.destination_location:
            raise ValueError("Source and destination cannot be the same")
        
        from django.utils import timezone
        
        # Check stock availability at source
        for line in self.lines.all():
            from warehouse.models import StockQuant
            quant = StockQuant.objects.filter(
                product=line.product,
                location=self.source_location
            ).first()
            
            if not quant or quant.available_quantity() < line.quantity:
                raise ValueError(f"Insufficient stock for {line.product.sku} at {self.source_location.code}")
        
        # Create stock movements for each line
        for line in self.lines.all():
            StockMovement.objects.create(
                movement_type='TRANSFER',
                product=line.product,
                quantity=line.quantity,
                source_location=self.source_location,
                destination_location=self.destination_location,
                document_reference=self.transfer_number,
                document_type='TRANSFER',
                created_by=user,
                notes=f"Transfer from {self.source_location.code} to {self.destination_location.code}"
            )
        
        self.status = 'DONE'
        self.validated_by = user
        self.validated_at = timezone.now()
        self.transfer_date = timezone.now().date()
        self.save()


class TransferLine(models.Model):
    """Transfer order line items"""
    
    transfer = models.ForeignKey(TransferOrder, on_delete=models.CASCADE, related_name='lines')
    product = models.ForeignKey(Product, on_delete=models.PROTECT, related_name='transfer_lines')
    quantity = models.DecimalField(max_digits=15, decimal_places=3, validators=[MinValueValidator(Decimal('0.001'))])
    
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'transfer_lines'
        ordering = ['transfer', 'id']
    
    def __str__(self):
        return f"{self.transfer.transfer_number} - {self.product.sku} - {self.quantity}"
