from rest_framework import serializers
from .models import Category, UnitOfMeasure, Product


class CategorySerializer(serializers.ModelSerializer):
    """Serializer for Category model"""
    
    children_count = serializers.SerializerMethodField()
    products_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Category
        fields = ['id', 'name', 'description', 'parent', 'is_active', 'children_count', 'products_count', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_children_count(self, obj):
        return obj.children.count()
    
    def get_products_count(self, obj):
        return obj.products.count()


class UnitOfMeasureSerializer(serializers.ModelSerializer):
    """Serializer for UnitOfMeasure model"""
    
    class Meta:
        model = UnitOfMeasure
        fields = ['id', 'name', 'abbreviation', 'description', 'is_active', 'created_at']
        read_only_fields = ['id', 'created_at']


class ProductSerializer(serializers.ModelSerializer):
    """Serializer for Product model"""
    
    category_name = serializers.CharField(source='category.name', read_only=True)
    uom_name = serializers.CharField(source='uom.name', read_only=True)
    uom_abbreviation = serializers.CharField(source='uom.abbreviation', read_only=True)
    total_stock = serializers.SerializerMethodField()
    is_low_stock = serializers.SerializerMethodField()
    
    class Meta:
        model = Product
        fields = [
            'id', 'sku', 'name', 'description', 'category', 'category_name',
            'uom', 'uom_name', 'uom_abbreviation', 'cost_price', 'selling_price',
            'min_stock_level', 'reorder_quantity', 'barcode', 'image', 'weight',
            'is_active', 'total_stock', 'is_low_stock', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_total_stock(self, obj):
        return obj.get_total_stock()
    
    def get_is_low_stock(self, obj):
        return obj.is_low_stock()


class ProductListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for product list"""
    
    category_name = serializers.CharField(source='category.name', read_only=True)
    uom_abbreviation = serializers.CharField(source='uom.abbreviation', read_only=True)
    total_stock = serializers.SerializerMethodField()
    is_low_stock = serializers.SerializerMethodField()
    
    class Meta:
        model = Product
        fields = ['id', 'sku', 'name', 'category_name', 'uom_abbreviation', 'cost_price', 'selling_price', 'is_active', 'total_stock', 'is_low_stock', 'min_stock_level']
    
    def get_total_stock(self, obj):
        return obj.get_total_stock()
    
    def get_is_low_stock(self, obj):
        return obj.is_low_stock()
