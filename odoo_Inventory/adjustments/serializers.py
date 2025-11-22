from rest_framework import serializers
from .models import AdjustmentEntry
from products.serializers import ProductListSerializer
from warehouse.serializers import LocationSerializer


class AdjustmentEntrySerializer(serializers.ModelSerializer):
    """Serializer for AdjustmentEntry model"""
    
    product_sku = serializers.CharField(source='product.sku', read_only=True)
    product_name = serializers.CharField(source='product.name', read_only=True)
    location_code = serializers.CharField(source='location.code', read_only=True)
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    validated_by_username = serializers.CharField(source='validated_by.username', read_only=True)
    
    class Meta:
        model = AdjustmentEntry
        fields = [
            'id', 'adjustment_number', 'location', 'location_code', 'product',
            'product_sku', 'product_name', 'system_quantity', 'counted_quantity',
            'adjustment_quantity', 'reason', 'notes', 'status',
            'created_by', 'created_by_username', 'validated_by', 'validated_by_username',
            'created_at', 'updated_at', 'validated_at'
        ]
        read_only_fields = ['id', 'adjustment_quantity', 'created_at', 'updated_at', 'validated_at', 'validated_by']


class AdjustmentCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating AdjustmentEntry"""
    
    class Meta:
        model = AdjustmentEntry
        fields = [
            'adjustment_number', 'location', 'product', 'system_quantity',
            'counted_quantity', 'reason', 'notes'
        ]


class AdjustmentValidateSerializer(serializers.Serializer):
    """Serializer for validating adjustment"""
    
    adjustment_id = serializers.IntegerField()
