from django.db import models
from django.core.validators import MinValueValidator
from django.conf import settings
from products.models import Product
from warehouse.models import Location
from stock_ledger.models import StockMovement


class DeliveryOrder(models.Model):
    """Delivery order for outgoing stock to customers"""
    
    STATUS_CHOICES = [
        ('DRAFT', 'Draft'),
        ('WAITING', 'Waiting'),
        ('READY', 'Ready'),
        ('DONE', 'Done'),
        ('CANCELLED', 'Cancelled'),
    ]
    
    delivery_number = models.CharField(max_length=50, unique=True)
    customer_name = models.CharField(max_length=200)
    customer_reference = models.CharField(max_length=100, blank=True, null=True)
    
    source_location = models.ForeignKey(Location, on_delete=models.PROTECT, related_name='deliveries')
    
    shipping_address = models.TextField(blank=True, null=True)
    
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='DRAFT')
    scheduled_date = models.DateField(null=True, blank=True)
    delivery_date = models.DateField(null=True, blank=True)
    
    notes = models.TextField(blank=True, null=True)
    
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name='deliveries')
    validated_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, 
                                     related_name='validated_deliveries', null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    validated_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'delivery_orders'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['delivery_number']),
            models.Index(fields=['status', 'created_at']),
        ]
    
    def __str__(self):
        return f"{self.delivery_number} - {self.customer_name}"
    
    def validate(self, user):
        """Validate delivery and create stock movements"""
        if self.status == 'DONE':
            raise ValueError("Delivery already validated")
        
        from django.utils import timezone
        
        # Check stock availability
        for line in self.lines.all():
            from warehouse.models import StockQuant
            quant = StockQuant.objects.filter(
                product=line.product,
                location=self.source_location
            ).first()
            
            if not quant or quant.available_quantity() < line.quantity:
                raise ValueError(f"Insufficient stock for {line.product.sku}")
        
        # Create stock movements for each line
        for line in self.lines.all():
            StockMovement.objects.create(
                movement_type='DELIVERY',
                product=line.product,
                quantity=line.quantity,
                source_location=self.source_location,
                document_reference=self.delivery_number,
                document_type='DELIVERY',
                created_by=user,
                notes=f"Delivery to {self.customer_name}"
            )
        
        self.status = 'DONE'
        self.validated_by = user
        self.validated_at = timezone.now()
        self.delivery_date = timezone.now().date()
        self.save()


class DeliveryLine(models.Model):
    """Delivery order line items"""
    
    delivery = models.ForeignKey(DeliveryOrder, on_delete=models.CASCADE, related_name='lines')
    product = models.ForeignKey(Product, on_delete=models.PROTECT, related_name='delivery_lines')
    quantity = models.DecimalField(max_digits=15, decimal_places=3, validators=[MinValueValidator(0.001)])
    unit_price = models.DecimalField(max_digits=10, decimal_places=2, default=0, validators=[MinValueValidator(0)])
    
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'delivery_lines'
        ordering = ['delivery', 'id']
    
    def __str__(self):
        return f"{self.delivery.delivery_number} - {self.product.sku} - {self.quantity}"
    
    def get_total_price(self):
        """Calculate line total"""
        return self.quantity * self.unit_price
