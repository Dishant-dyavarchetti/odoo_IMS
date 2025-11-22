from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import TransferOrder, TransferLine
from .serializers import TransferOrderSerializer, TransferOrderCreateSerializer


class TransferOrderViewSet(viewsets.ModelViewSet):
    """ViewSet for TransferOrder model"""
    
    queryset = TransferOrder.objects.select_related(
        'source_location', 'destination_location', 'created_by', 'validated_by'
    ).prefetch_related('lines__product').all()
    serializer_class = TransferOrderSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'source_location', 'destination_location', 'created_by']
    search_fields = ['transfer_number']
    ordering_fields = ['created_at', 'scheduled_date', 'transfer_date']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        if self.action == 'create':
            return TransferOrderCreateSerializer
        return TransferOrderSerializer
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
    
    @action(detail=True, methods=['post'])
    def validate_transfer(self, request, pk=None):
        """Validate transfer and create stock movements"""
        transfer = self.get_object()
        
        try:
            transfer.validate(request.user)
            serializer = self.get_serializer(transfer)
            return Response(serializer.data)
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
