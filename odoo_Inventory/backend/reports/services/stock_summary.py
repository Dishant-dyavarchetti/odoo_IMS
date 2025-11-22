from warehouse.models import StockQuant
from products.models import Product
from django.db.models import Sum


def get_stock_summary():
    """
    Returns stock grouped by product & location.
    """
    return (
        StockQuant.objects
        .values(
            "product__name",
            "location__name",
            "location__warehouse__name"
        )
        .annotate(total_qty=Sum("quantity"))
        .order_by("product__name", "location__warehouse__name")
    )
