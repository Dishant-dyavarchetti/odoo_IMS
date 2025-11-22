from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import DeliveryOrder, DeliveryLine
from .serializers import DeliveryOrderSerializer, DeliveryOrderCreateSerializer


class DeliveryOrderViewSet(viewsets.ModelViewSet):
    """ViewSet for DeliveryOrder model"""
    
    queryset = DeliveryOrder.objects.select_related(
        'source_location', 'created_by', 'validated_by'
    ).prefetch_related('lines__product').all()
    serializer_class = DeliveryOrderSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'source_location', 'created_by']
    search_fields = ['delivery_number', 'customer_name', 'customer_reference']
    ordering_fields = ['created_at', 'scheduled_date', 'delivery_date']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        if self.action == 'create':
            return DeliveryOrderCreateSerializer
        return DeliveryOrderSerializer
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
    
    @action(detail=True, methods=['post'])
    def validate_delivery(self, request, pk=None):
        """Validate delivery and create stock movements"""
        delivery = self.get_object()
        
        try:
            delivery.validate(request.user)
            serializer = self.get_serializer(delivery)
            return Response(serializer.data)
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
