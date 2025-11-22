from rest_framework import serializers
from .models import TransferOrder, TransferLine
from products.serializers import ProductListSerializer
from warehouse.serializers import LocationSerializer


class TransferLineSerializer(serializers.ModelSerializer):
    """Serializer for TransferLine model"""
    
    product_sku = serializers.CharField(source='product.sku', read_only=True)
    product_name = serializers.CharField(source='product.name', read_only=True)
    
    class Meta:
        model = TransferLine
        fields = ['id', 'product', 'product_sku', 'product_name', 'quantity', 'notes', 'created_at']
        read_only_fields = ['id', 'created_at']


class TransferOrderSerializer(serializers.ModelSerializer):
    """Serializer for TransferOrder model"""
    
    lines = TransferLineSerializer(many=True, read_only=True)
    source_location_code = serializers.CharField(source='source_location.code', read_only=True)
    destination_location_code = serializers.CharField(source='destination_location.code', read_only=True)
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    validated_by_username = serializers.CharField(source='validated_by.username', read_only=True)
    
    class Meta:
        model = TransferOrder
        fields = [
            'id', 'transfer_number', 'source_location', 'source_location_code',
            'destination_location', 'destination_location_code', 'status',
            'scheduled_date', 'transfer_date', 'notes', 'lines',
            'created_by', 'created_by_username', 'validated_by', 'validated_by_username',
            'created_at', 'updated_at', 'validated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'validated_at', 'validated_by']


class TransferOrderCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating TransferOrder with lines"""
    
    lines = TransferLineSerializer(many=True)
    
    class Meta:
        model = TransferOrder
        fields = [
            'transfer_number', 'source_location', 'destination_location',
            'status', 'scheduled_date', 'notes', 'lines'
        ]
    
    def create(self, validated_data):
        lines_data = validated_data.pop('lines')
        transfer = TransferOrder.objects.create(**validated_data)
        
        for line_data in lines_data:
            TransferLine.objects.create(transfer=transfer, **line_data)
        
        return transfer


class TransferValidateSerializer(serializers.Serializer):
    """Serializer for validating transfer"""
    
    transfer_id = serializers.IntegerField()
