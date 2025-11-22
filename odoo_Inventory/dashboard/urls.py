from django.urls import path
from .views import (
    DashboardKPIView, 
    RecentMovementsView, 
    StockLevelsByLocationView,
    MovementTrendsView,
    TopProductsView,
    StockValueByCategoryView
)

urlpatterns = [
    path('kpis/', DashboardKPIView.as_view(), name='dashboard-kpis'),
    path('recent-movements/', RecentMovementsView.as_view(), name='recent-movements'),
    path('stock-levels/', StockLevelsByLocationView.as_view(), name='stock-levels'),
    path('movement-trends/', MovementTrendsView.as_view(), name='movement-trends'),
    path('top-products/', TopProductsView.as_view(), name='top-products'),
    path('stock-value-by-category/', StockValueByCategoryView.as_view(), name='stock-value-by-category'),
]
