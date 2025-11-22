from django.http import JsonResponse
from .services.stock_summary import get_stock_summary
from .services.movement_report import get_movement_history


def stock_summary_view(request):
    data = list(get_stock_summary())
    return JsonResponse(data, safe=False)


def movement_report_view(request):
    data = list(get_movement_history())
    return JsonResponse(data, safe=False)
