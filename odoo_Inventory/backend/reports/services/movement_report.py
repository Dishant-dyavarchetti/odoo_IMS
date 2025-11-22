from stock_ledger.models import StockMovement
from django.db.models import F


def get_movement_history(product=None, warehouse=None):
    qs = StockMovement.objects.all().order_by("-created_at")

    if product:
        qs = qs.filter(product=product)

    if warehouse:
        qs = qs.filter(
            destination_location__warehouse=warehouse
        ) | qs.filter(
            source_location__warehouse=warehouse
        )

    return qs
