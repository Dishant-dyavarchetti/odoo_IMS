from django.urls import path
from .views import stock_summary_view, movement_report_view

urlpatterns = [
    path("stock-summary/", stock_summary_view),
    path("movement-history/", movement_report_view),
]
    