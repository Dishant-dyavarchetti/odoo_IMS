from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Delivery, DeliveryStatus, DeliveryLine

@receiver(post_save, sender=DeliveryLine)
def auto_validate_delivery_on_line_save(sender, instance, created, **kwargs):
    delivery = instance.delivery

    # Only auto-post when marked as DONE
    if delivery.status == DeliveryStatus.DONE:
        delivery.validate()
