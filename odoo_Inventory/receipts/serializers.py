from rest_framework import serializers
from .models import Receipt, ReceiptLine
from products.serializers import ProductListSerializer
from warehouse.serializers import LocationSerializer


class ReceiptLineSerializer(serializers.ModelSerializer):
    """Serializer for ReceiptLine model"""
    
    product_sku = serializers.CharField(source='product.sku', read_only=True)
    product_name = serializers.CharField(source='product.name', read_only=True)
    total_price = serializers.SerializerMethodField()
    
    class Meta:
        model = ReceiptLine
        fields = ['id', 'product', 'product_sku', 'product_name', 'quantity', 'unit_price', 'total_price', 'notes', 'created_at']
        read_only_fields = ['id', 'created_at']
    
    def get_total_price(self, obj):
        return obj.get_total_price()


class ReceiptSerializer(serializers.ModelSerializer):
    """Serializer for Receipt model"""
    
    lines = ReceiptLineSerializer(many=True, read_only=True)
    destination_location_code = serializers.CharField(source='destination_location.code', read_only=True)
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    validated_by_username = serializers.CharField(source='validated_by.username', read_only=True)
    
    class Meta:
        model = Receipt
        fields = [
            'id', 'receipt_number', 'supplier_name', 'supplier_reference',
            'destination_location', 'destination_location_code', 'status',
            'expected_date', 'received_date', 'notes', 'lines',
            'created_by', 'created_by_username', 'validated_by', 'validated_by_username',
            'created_at', 'updated_at', 'validated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'validated_at', 'validated_by']


class ReceiptCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating Receipt with lines"""
    
    lines = ReceiptLineSerializer(many=True)
    
    class Meta:
        model = Receipt
        fields = [
            'receipt_number', 'supplier_name', 'supplier_reference',
            'destination_location', 'status', 'expected_date', 'notes', 'lines'
        ]
    
    def create(self, validated_data):
        lines_data = validated_data.pop('lines')
        receipt = Receipt.objects.create(**validated_data)
        
        for line_data in lines_data:
            ReceiptLine.objects.create(receipt=receipt, **line_data)
        
        return receipt


class ReceiptValidateSerializer(serializers.Serializer):
    """Serializer for validating receipt"""
    
    receipt_id = serializers.IntegerField()
