from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Receipt, ReceiptLine
from .serializers import ReceiptSerializer, ReceiptCreateSerializer, ReceiptValidateSerializer


class ReceiptViewSet(viewsets.ModelViewSet):
    """ViewSet for Receipt model"""
    
    queryset = Receipt.objects.select_related(
        'destination_location', 'created_by', 'validated_by'
    ).prefetch_related('lines__product').all()
    serializer_class = ReceiptSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'destination_location', 'created_by']
    search_fields = ['receipt_number', 'supplier_name', 'supplier_reference']
    ordering_fields = ['created_at', 'expected_date', 'received_date']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        if self.action == 'create':
            return ReceiptCreateSerializer
        return ReceiptSerializer
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
    
    @action(detail=True, methods=['post'])
    def validate_receipt(self, request, pk=None):
        """Validate receipt and create stock movements"""
        receipt = self.get_object()
        
        try:
            receipt.validate(request.user)
            serializer = self.get_serializer(receipt)
            return Response(serializer.data)
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
