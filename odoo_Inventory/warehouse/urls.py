from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import WarehouseViewSet, LocationViewSet, StockQuantViewSet

router = DefaultRouter()
router.register(r'warehouses', WarehouseViewSet, basename='warehouse')
router.register(r'locations', LocationViewSet, basename='location')
router.register(r'stock-quants', StockQuantViewSet, basename='stock-quant')

urlpatterns = [
    path('', include(router.urls)),
]
