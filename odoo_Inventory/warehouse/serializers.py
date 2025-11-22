from rest_framework import serializers
from .models import Warehouse, Location, StockQuant
from products.serializers import ProductListSerializer


class WarehouseSerializer(serializers.ModelSerializer):
    """Serializer for Warehouse model"""
    
    locations_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Warehouse
        fields = [
            'id', 'code', 'name', 'address', 'city', 'state', 'country',
            'postal_code', 'phone', 'is_active', 'locations_count',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_locations_count(self, obj):
        return obj.locations.count()


class LocationSerializer(serializers.ModelSerializer):
    """Serializer for Location model"""
    
    warehouse_name = serializers.CharField(source='warehouse.name', read_only=True)
    full_path = serializers.SerializerMethodField()
    
    class Meta:
        model = Location
        fields = [
            'id', 'warehouse', 'warehouse_name', 'code', 'name', 'location_type',
            'parent', 'capacity', 'is_active', 'full_path', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_full_path(self, obj):
        return obj.get_full_path()


class StockQuantSerializer(serializers.ModelSerializer):
    """Serializer for StockQuant model"""
    
    product_sku = serializers.CharField(source='product.sku', read_only=True)
    product_name = serializers.CharField(source='product.name', read_only=True)
    location_code = serializers.CharField(source='location.code', read_only=True)
    warehouse_code = serializers.CharField(source='location.warehouse.code', read_only=True)
    available_quantity = serializers.SerializerMethodField()
    
    class Meta:
        model = StockQuant
        fields = [
            'id', 'product', 'product_sku', 'product_name', 'location', 'location_code',
            'warehouse_code', 'quantity', 'reserved_quantity', 'available_quantity',
            'last_updated', 'created_at'
        ]
        read_only_fields = ['id', 'last_updated', 'created_at']
    
    def get_available_quantity(self, obj):
        return obj.available_quantity()


class StockQuantDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for StockQuant with product details"""
    
    product = ProductListSerializer(read_only=True)
    location = LocationSerializer(read_only=True)
    available_quantity = serializers.SerializerMethodField()
    
    class Meta:
        model = StockQuant
        fields = [
            'id', 'product', 'location', 'quantity', 'reserved_quantity',
            'available_quantity', 'last_updated', 'created_at'
        ]
        read_only_fields = ['id', 'last_updated', 'created_at']
    
    def get_available_quantity(self, obj):
        return obj.available_quantity()
