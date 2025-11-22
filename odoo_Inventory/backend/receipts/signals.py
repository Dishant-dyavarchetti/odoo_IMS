from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Receipt, ReceiptStatus, ReceiptLine


@receiver(post_save, sender=ReceiptLine)
def auto_validate_receipt_on_line_save(sender, instance, created, **kwargs):
    receipt = instance.receipt

    # If receipt is already done → nothing to do
    if receipt.status != ReceiptStatus.DONE:
        return

    # Trigger validation after lines exist
    receipt.validate()
