from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import StockMovement
from warehouse.models import StockQuant


@receiver(post_save, sender=StockMovement)
def update_stock_quant(sender, instance, created, **kwargs):
    if not created:
        return  # Only apply when record is first created

    # OUTBOUND → subtract from source location
    if instance.source_location:
        quant, _ = StockQuant.objects.get_or_create(
            product=instance.product,
            location=instance.source_location
        )
        quant.quantity -= instance.quantity
        quant.save()

    # INBOUND → add to destination location
    if instance.destination_location:
        quant, _ = StockQuant.objects.get_or_create(
            product=instance.product,
            location=instance.destination_location
        )
        quant.quantity += instance.quantity
        quant.save()