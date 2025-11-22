from decimal import Decimal
from django.db import models
from django.core.validators import MinValueValidator


class Category(models.Model):
    """Product categories"""
    
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='children')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'categories'
        verbose_name_plural = 'Categories'
        ordering = ['name']
    
    def __str__(self):
        return self.name


class UnitOfMeasure(models.Model):
    """Unit of Measure (UOM) for products"""
    
    name = models.CharField(max_length=50, unique=True)
    abbreviation = models.CharField(max_length=10)
    description = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'units_of_measure'
        ordering = ['name']
    
    def __str__(self):
        return f"{self.name} ({self.abbreviation})"


class Product(models.Model):
    """Product master with SKU and categorization"""
    
    sku = models.CharField(max_length=50, unique=True, help_text="Stock Keeping Unit")
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    category = models.ForeignKey(Category, on_delete=models.PROTECT, related_name='products')
    uom = models.ForeignKey(UnitOfMeasure, on_delete=models.PROTECT, related_name='products')
    
    # Pricing
    cost_price = models.DecimalField(max_digits=10, decimal_places=2, default=0, validators=[MinValueValidator(Decimal('0'))])
    selling_price = models.DecimalField(max_digits=10, decimal_places=2, default=0, validators=[MinValueValidator(Decimal('0'))])
    
    # Reordering rules
    min_stock_level = models.IntegerField(default=0, validators=[MinValueValidator(0)], help_text="Minimum stock alert level")
    reorder_quantity = models.IntegerField(default=0, validators=[MinValueValidator(0)], help_text="Quantity to reorder when below minimum")
    
    # Additional info
    barcode = models.CharField(max_length=50, blank=True, null=True, unique=True)
    image = models.ImageField(upload_to='products/', blank=True, null=True)
    weight = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True, validators=[MinValueValidator(Decimal('0'))])
    
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'products'
        ordering = ['name']
        indexes = [
            models.Index(fields=['sku']),
            models.Index(fields=['category']),
        ]
    
    def __str__(self):
        return f"{self.sku} - {self.name}"
    
    def get_total_stock(self):
        """Get total stock across all warehouses"""
        from warehouse.models import StockQuant
        total = StockQuant.objects.filter(product=self).aggregate(models.Sum('quantity'))['quantity__sum']
        return total or 0
    
    def is_low_stock(self):
        """Check if product is below minimum stock level"""
        return self.get_total_stock() < self.min_stock_level
