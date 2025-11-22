from django.db import models

class Warehouse(models.Model):
    name = models.CharField(max_length=150)
    code = models.CharField(max_length=20, unique=True)

    def __str__(self):
        return self.code


class Location(models.Model):
    warehouse = models.ForeignKey(
        Warehouse,
        on_delete=models.CASCADE,
        related_name='locations'
    )
    name = models.CharField(max_length=150)
    is_internal = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.warehouse.code} - {self.name}"


class StockQuant(models.Model):
    """
    Stores the REAL-TIME stock count per product per location.
    Updated using StockMovement entries from stock_ledger.
    """
    product = models.ForeignKey(
        'products.Product',
        on_delete=models.CASCADE
    )
    location = models.ForeignKey(
        Location,
        on_delete=models.CASCADE
    )
    quantity = models.DecimalField(
        max_digits=12,
        decimal_places=3,
        default=0
    )

    class Meta:
        unique_together = ('product', 'location')

    def __str__(self):
        return f"{self.product} @ {self.location} = {self.quantity}"