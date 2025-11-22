from django.urls import path
from .views import DashboardKPIView, RecentMovementsView, StockLevelsByLocationView

urlpatterns = [
    path('kpis/', DashboardKPIView.as_view(), name='dashboard-kpis'),
    path('recent-movements/', RecentMovementsView.as_view(), name='recent-movements'),
    path('stock-levels/', StockLevelsByLocationView.as_view(), name='stock-levels'),
]
