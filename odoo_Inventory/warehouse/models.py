from django.db import models
from django.core.validators import MinValueValidator
from products.models import Product


class Warehouse(models.Model):
    """Warehouse master"""
    
    code = models.CharField(max_length=20, unique=True)
    name = models.CharField(max_length=100)
    address = models.TextField(blank=True, null=True)
    city = models.CharField(max_length=100, blank=True, null=True)
    state = models.CharField(max_length=100, blank=True, null=True)
    country = models.CharField(max_length=100, blank=True, null=True)
    postal_code = models.CharField(max_length=20, blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'warehouses'
        ordering = ['name']
    
    def __str__(self):
        return f"{self.code} - {self.name}"


class Location(models.Model):
    """Storage locations within warehouse (Rack, Bin, Area, Zone)"""
    
    LOCATION_TYPE_CHOICES = [
        ('ZONE', 'Zone'),
        ('AREA', 'Area'),
        ('RACK', 'Rack'),
        ('BIN', 'Bin'),
        ('SHELF', 'Shelf'),
    ]
    
    warehouse = models.ForeignKey(Warehouse, on_delete=models.CASCADE, related_name='locations')
    code = models.CharField(max_length=50)
    name = models.CharField(max_length=100)
    location_type = models.CharField(max_length=10, choices=LOCATION_TYPE_CHOICES)
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='children')
    
    # Physical attributes
    capacity = models.IntegerField(blank=True, null=True, validators=[MinValueValidator(0)])
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'locations'
        ordering = ['warehouse', 'code']
        unique_together = [['warehouse', 'code']]
        indexes = [
            models.Index(fields=['warehouse', 'code']),
        ]
    
    def __str__(self):
        return f"{self.warehouse.code}/{self.code} - {self.name}"
    
    def get_full_path(self):
        """Get full hierarchical path"""
        if self.parent:
            return f"{self.parent.get_full_path()} > {self.code}"
        return f"{self.warehouse.code} > {self.code}"


class StockQuant(models.Model):
    """Real-time stock quantity per Location per Product"""
    
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='stock_quants')
    location = models.ForeignKey(Location, on_delete=models.CASCADE, related_name='stock_quants')
    quantity = models.DecimalField(max_digits=15, decimal_places=3, default=0)
    reserved_quantity = models.DecimalField(max_digits=15, decimal_places=3, default=0, 
                                           help_text="Quantity reserved for pending deliveries")
    
    # Tracking
    last_updated = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'stock_quants'
        unique_together = [['product', 'location']]
        ordering = ['product', 'location']
        indexes = [
            models.Index(fields=['product', 'location']),
            models.Index(fields=['location']),
        ]
    
    def __str__(self):
        return f"{self.product.sku} @ {self.location.code}: {self.quantity}"
    
    def available_quantity(self):
        """Get available quantity (total - reserved)"""
        return self.quantity - self.reserved_quantity
    
    def update_quantity(self, qty_change):
        """Update stock quantity"""
        self.quantity += qty_change
        self.save()
