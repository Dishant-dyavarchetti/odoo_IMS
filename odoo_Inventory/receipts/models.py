from django.db import models
from django.core.validators import MinValueValidator
from django.conf import settings
from products.models import Product
from warehouse.models import Location
from stock_ledger.models import StockMovement


class Receipt(models.Model):
    """Receipt for incoming stock from vendors"""
    
    STATUS_CHOICES = [
        ('DRAFT', 'Draft'),
        ('WAITING', 'Waiting'),
        ('READY', 'Ready'),
        ('DONE', 'Done'),
        ('CANCELLED', 'Cancelled'),
    ]
    
    receipt_number = models.CharField(max_length=50, unique=True)
    supplier_name = models.CharField(max_length=200)
    supplier_reference = models.CharField(max_length=100, blank=True, null=True)
    
    destination_location = models.ForeignKey(Location, on_delete=models.PROTECT, related_name='receipts')
    
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='DRAFT')
    expected_date = models.DateField(null=True, blank=True)
    received_date = models.DateField(null=True, blank=True)
    
    notes = models.TextField(blank=True, null=True)
    
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name='receipts')
    validated_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, 
                                     related_name='validated_receipts', null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    validated_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'receipts'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['receipt_number']),
            models.Index(fields=['status', 'created_at']),
        ]
    
    def __str__(self):
        return f"{self.receipt_number} - {self.supplier_name}"
    
    def validate(self, user):
        """Validate receipt and create stock movements"""
        if self.status == 'DONE':
            raise ValueError("Receipt already validated")
        
        from django.utils import timezone
        
        # Create stock movements for each line
        for line in self.lines.all():
            StockMovement.objects.create(
                movement_type='RECEIPT',
                product=line.product,
                quantity=line.quantity,
                destination_location=self.destination_location,
                document_reference=self.receipt_number,
                document_type='RECEIPT',
                created_by=user,
                notes=f"Receipt from {self.supplier_name}"
            )
        
        self.status = 'DONE'
        self.validated_by = user
        self.validated_at = timezone.now()
        self.received_date = timezone.now().date()
        self.save()


class ReceiptLine(models.Model):
    """Receipt line items"""
    
    receipt = models.ForeignKey(Receipt, on_delete=models.CASCADE, related_name='lines')
    product = models.ForeignKey(Product, on_delete=models.PROTECT, related_name='receipt_lines')
    quantity = models.DecimalField(max_digits=15, decimal_places=3, validators=[MinValueValidator(0.001)])
    unit_price = models.DecimalField(max_digits=10, decimal_places=2, default=0, validators=[MinValueValidator(0)])
    
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'receipt_lines'
        ordering = ['receipt', 'id']
    
    def __str__(self):
        return f"{self.receipt.receipt_number} - {self.product.sku} - {self.quantity}"
    
    def get_total_price(self):
        """Calculate line total"""
        return self.quantity * self.unit_price
