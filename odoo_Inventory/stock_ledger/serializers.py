from rest_framework import serializers
from .models import StockMovement
from products.serializers import ProductListSerializer
from warehouse.serializers import LocationSerializer


class StockMovementSerializer(serializers.ModelSerializer):
    """Serializer for StockMovement model"""
    
    product_sku = serializers.CharField(source='product.sku', read_only=True)
    product_name = serializers.CharField(source='product.name', read_only=True)
    source_location_code = serializers.CharField(source='source_location.code', read_only=True)
    destination_location_code = serializers.CharField(source='destination_location.code', read_only=True)
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    
    class Meta:
        model = StockMovement
        fields = [
            'id', 'movement_type', 'product', 'product_sku', 'product_name',
            'quantity', 'source_location', 'source_location_code',
            'destination_location', 'destination_location_code',
            'document_reference', 'document_type', 'created_by', 'created_by_username',
            'created_at', 'notes'
        ]
        read_only_fields = ['id', 'created_at']


class StockMovementDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for StockMovement with full related data"""
    
    product = ProductListSerializer(read_only=True)
    source_location = LocationSerializer(read_only=True)
    destination_location = LocationSerializer(read_only=True)
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    
    class Meta:
        model = StockMovement
        fields = [
            'id', 'movement_type', 'product', 'quantity', 'source_location',
            'destination_location', 'document_reference', 'document_type',
            'created_by', 'created_by_username', 'created_at', 'notes'
        ]
        read_only_fields = ['id', 'created_at']
