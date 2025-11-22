from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import AdjustmentEntry
from .serializers import AdjustmentEntrySerializer, AdjustmentCreateSerializer


class AdjustmentEntryViewSet(viewsets.ModelViewSet):
    """ViewSet for AdjustmentEntry model"""
    
    queryset = AdjustmentEntry.objects.select_related(
        'location', 'product', 'created_by', 'validated_by'
    ).all()
    serializer_class = AdjustmentEntrySerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'location', 'product', 'reason', 'created_by']
    search_fields = ['adjustment_number', 'product__sku', 'product__name']
    ordering_fields = ['created_at', 'adjustment_quantity']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        if self.action == 'create':
            return AdjustmentCreateSerializer
        return AdjustmentEntrySerializer
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
    
    @action(detail=True, methods=['post'])
    def validate_adjustment(self, request, pk=None):
        """Validate adjustment and create stock movement"""
        adjustment = self.get_object()
        
        try:
            adjustment.validate(request.user)
            serializer = self.get_serializer(adjustment)
            return Response(serializer.data)
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
