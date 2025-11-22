from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import Category, UnitOfMeasure, Product
from .serializers import CategorySerializer, UnitOfMeasureSerializer, ProductSerializer, ProductListSerializer


class CategoryViewSet(viewsets.ModelViewSet):
    """ViewSet for Category model"""
    
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['is_active', 'parent']
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']


class UnitOfMeasureViewSet(viewsets.ModelViewSet):
    """ViewSet for UnitOfMeasure model"""
    
    queryset = UnitOfMeasure.objects.all()
    serializer_class = UnitOfMeasureSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['is_active']
    search_fields = ['name', 'abbreviation']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']


class ProductViewSet(viewsets.ModelViewSet):
    """ViewSet for Product model"""
    
    queryset = Product.objects.select_related('category', 'uom').all()
    serializer_class = ProductSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'is_active']
    search_fields = ['sku', 'name', 'barcode']
    ordering_fields = ['sku', 'name', 'created_at', 'cost_price', 'selling_price']
    ordering = ['name']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return ProductListSerializer
        return ProductSerializer
