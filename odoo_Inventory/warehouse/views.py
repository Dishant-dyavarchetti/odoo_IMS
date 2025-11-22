from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import Warehouse, Location, StockQuant
from .serializers import WarehouseSerializer, LocationSerializer, StockQuantSerializer, StockQuantDetailSerializer


class WarehouseViewSet(viewsets.ModelViewSet):
    """ViewSet for Warehouse model"""
    
    queryset = Warehouse.objects.all()
    serializer_class = WarehouseSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['is_active', 'city', 'state']
    search_fields = ['code', 'name', 'city']
    ordering_fields = ['code', 'name', 'created_at']
    ordering = ['name']


class LocationViewSet(viewsets.ModelViewSet):
    """ViewSet for Location model"""
    
    queryset = Location.objects.select_related('warehouse').all()
    serializer_class = LocationSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['warehouse', 'location_type', 'is_active']
    search_fields = ['code', 'name']
    ordering_fields = ['code', 'name', 'created_at']
    ordering = ['warehouse', 'code']


class StockQuantViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for StockQuant model (read-only)"""
    
    queryset = StockQuant.objects.select_related('product', 'location', 'location__warehouse').all()
    serializer_class = StockQuantSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['product', 'location', 'location__warehouse']
    search_fields = ['product__sku', 'product__name', 'location__code']
    ordering_fields = ['quantity', 'last_updated']
    ordering = ['product__name']
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return StockQuantDetailSerializer
        return StockQuantSerializer
