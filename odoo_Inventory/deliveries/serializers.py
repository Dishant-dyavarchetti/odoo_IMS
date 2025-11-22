from rest_framework import serializers
from .models import DeliveryOrder, DeliveryLine
from products.serializers import ProductListSerializer
from warehouse.serializers import LocationSerializer


class DeliveryLineSerializer(serializers.ModelSerializer):
    """Serializer for DeliveryLine model"""
    
    product_sku = serializers.CharField(source='product.sku', read_only=True)
    product_name = serializers.CharField(source='product.name', read_only=True)
    total_price = serializers.SerializerMethodField()
    
    class Meta:
        model = DeliveryLine
        fields = ['id', 'product', 'product_sku', 'product_name', 'quantity', 'unit_price', 'total_price', 'notes', 'created_at']
        read_only_fields = ['id', 'created_at']
    
    def get_total_price(self, obj):
        return obj.get_total_price()


class DeliveryOrderSerializer(serializers.ModelSerializer):
    """Serializer for DeliveryOrder model"""
    
    lines = DeliveryLineSerializer(many=True, read_only=True)
    source_location_code = serializers.CharField(source='source_location.code', read_only=True)
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    validated_by_username = serializers.CharField(source='validated_by.username', read_only=True)
    responsible_username = serializers.CharField(source='responsible.username', read_only=True)
    
    class Meta:
        model = DeliveryOrder
        fields = [
            'id', 'delivery_number', 'customer_name', 'customer_reference',
            'source_location', 'source_location_code', 'shipping_address', 'status',
            'scheduled_date', 'delivery_date', 'notes', 'lines', 'responsible', 'responsible_username',
            'created_by', 'created_by_username', 'validated_by', 'validated_by_username',
            'created_at', 'updated_at', 'validated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'validated_at', 'validated_by']


class DeliveryOrderCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating DeliveryOrder with lines"""
    
    lines = DeliveryLineSerializer(many=True)
    
    class Meta:
        model = DeliveryOrder
        fields = [
            'delivery_number', 'customer_name', 'customer_reference',
            'source_location', 'shipping_address', 'status', 'scheduled_date', 'notes', 'lines', 'responsible'
        ]
    
    def create(self, validated_data):
        lines_data = validated_data.pop('lines')
        delivery = DeliveryOrder.objects.create(**validated_data)
        
        for line_data in lines_data:
            DeliveryLine.objects.create(delivery=delivery, **line_data)
        
        return delivery


class DeliveryValidateSerializer(serializers.Serializer):
    """Serializer for validating delivery"""
    
    delivery_id = serializers.IntegerField()
