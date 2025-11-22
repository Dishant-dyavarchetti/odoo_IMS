from django.db import models
from django.core.validators import MinValueValidator
from django.conf import settings
from products.models import Product
from warehouse.models import Location, StockQuant


class StockMovement(models.Model):
    """Core engine for tracking all stock movements"""
    
    MOVEMENT_TYPE_CHOICES = [
        ('RECEIPT', 'Receipt'),
        ('DELIVERY', 'Delivery'),
        ('TRANSFER', 'Transfer'),
        ('ADJUSTMENT', 'Adjustment'),
    ]
    
    # Movement details
    movement_type = models.CharField(max_length=15, choices=MOVEMENT_TYPE_CHOICES)
    product = models.ForeignKey(Product, on_delete=models.PROTECT, related_name='movements')
    quantity = models.DecimalField(max_digits=15, decimal_places=3, validators=[MinValueValidator(0)])
    
    # Locations
    source_location = models.ForeignKey(Location, on_delete=models.PROTECT, 
                                       related_name='outgoing_movements', 
                                       null=True, blank=True)
    destination_location = models.ForeignKey(Location, on_delete=models.PROTECT, 
                                            related_name='incoming_movements', 
                                            null=True, blank=True)
    
    # Reference to originating document
    document_reference = models.CharField(max_length=100, help_text="Reference to Receipt, Delivery, Transfer, or Adjustment")
    document_type = models.CharField(max_length=20)
    
    # Tracking
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name='stock_movements')
    created_at = models.DateTimeField(auto_now_add=True)
    notes = models.TextField(blank=True, null=True)
    
    class Meta:
        db_table = 'stock_movements'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['movement_type', 'created_at']),
            models.Index(fields=['product', 'created_at']),
            models.Index(fields=['document_reference']),
        ]
    
    def __str__(self):
        return f"{self.movement_type} - {self.product.sku} - {self.quantity} - {self.created_at}"
    
    def save(self, *args, **kwargs):
        """Override save to update StockQuant"""
        is_new = self.pk is None
        super().save(*args, **kwargs)
        
        if is_new:
            self.update_stock_quants()
    
    def update_stock_quants(self):
        """Update StockQuant based on movement type"""
        if self.movement_type == 'RECEIPT':
            # Increase stock at destination
            self._update_quant(self.destination_location, self.quantity)
            
        elif self.movement_type == 'DELIVERY':
            # Decrease stock at source
            self._update_quant(self.source_location, -self.quantity)
            
        elif self.movement_type == 'TRANSFER':
            # Decrease at source, increase at destination
            self._update_quant(self.source_location, -self.quantity)
            self._update_quant(self.destination_location, self.quantity)
            
        elif self.movement_type == 'ADJUSTMENT':
            # Can be positive or negative at destination
            if self.destination_location:
                self._update_quant(self.destination_location, self.quantity)
            if self.source_location:
                self._update_quant(self.source_location, -self.quantity)
    
    def _update_quant(self, location, qty_change):
        """Update or create StockQuant"""
        if location:
            quant, created = StockQuant.objects.get_or_create(
                product=self.product,
                location=location,
                defaults={'quantity': 0}
            )
            quant.update_quantity(qty_change)
