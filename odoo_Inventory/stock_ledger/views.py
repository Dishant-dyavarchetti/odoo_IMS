from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import StockMovement
from .serializers import StockMovementSerializer, StockMovementDetailSerializer


class StockMovementViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for StockMovement model (read-only)"""
    
    queryset = StockMovement.objects.select_related(
        'product', 'source_location', 'destination_location', 'created_by'
    ).all()
    serializer_class = StockMovementSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['movement_type', 'product', 'document_type', 'created_by']
    search_fields = ['product__sku', 'product__name', 'document_reference']
    ordering_fields = ['created_at', 'quantity']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return StockMovementDetailSerializer
        return StockMovementSerializer
