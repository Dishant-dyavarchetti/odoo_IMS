from django.db import models


class StockSummary(models.Model):
    product_name = models.CharField(max_length=255)
    warehouse = models.CharField(max_length=255)
    location = models.CharField(max_length=255)
    total_qty = models.DecimalField(max_digits=12, decimal_places=3)

    class Meta:
        managed = False  # Not a real DB table
        verbose_name = "Stock Summary"
        verbose_name_plural = "Stock Summary"


class MovementReport(models.Model):
    product_name = models.CharField(max_length=255)
    movement_type = models.CharField(max_length=50)
    quantity = models.DecimalField(max_digits=12, decimal_places=3)
    source_location = models.CharField(max_length=255, null=True)
    destination_location = models.CharField(max_length=255, null=True)
    date = models.DateTimeField()

    class Meta:
        managed = False
        verbose_name = "Movement History"
        verbose_name_plural = "Movement History"
