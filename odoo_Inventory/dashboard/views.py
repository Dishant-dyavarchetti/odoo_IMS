from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from django.db.models import Sum, Q, Count
from products.models import Product
from warehouse.models import StockQuant
from receipts.models import Receipt
from deliveries.models import DeliveryOrder
from transfers.models import TransferOrder
from stock_ledger.models import StockMovement


class DashboardKPIView(APIView):
    """Dashboard KPIs view"""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        """Get all dashboard KPIs"""
        
        # Total products in stock
        total_products = Product.objects.filter(is_active=True).count()
        
        # Low stock items
        low_stock_items = []
        for product in Product.objects.filter(is_active=True):
            if product.is_low_stock():
                low_stock_items.append({
                    'id': product.id,
                    'sku': product.sku,
                    'name': product.name,
                    'current_stock': product.get_total_stock(),
                    'min_stock_level': product.min_stock_level
                })
        
        # Out of stock items
        out_of_stock_items = []
        for product in Product.objects.filter(is_active=True):
            if product.get_total_stock() == 0:
                out_of_stock_items.append({
                    'id': product.id,
                    'sku': product.sku,
                    'name': product.name
                })
        
        # Pending receipts
        pending_receipts = Receipt.objects.filter(
            status__in=['DRAFT', 'WAITING', 'READY']
        ).count()
        
        # Pending deliveries
        pending_deliveries = DeliveryOrder.objects.filter(
            status__in=['DRAFT', 'WAITING', 'READY']
        ).count()
        
        # Internal transfers scheduled
        transfers_scheduled = TransferOrder.objects.filter(
            status__in=['DRAFT', 'WAITING', 'READY']
        ).count()
        
        # Total stock value
        total_stock_value = 0
        for quant in StockQuant.objects.select_related('product'):
            total_stock_value += float(quant.quantity) * float(quant.product.cost_price)
        
        return Response({
            'total_products': total_products,
            'low_stock_count': len(low_stock_items),
            'low_stock_items': low_stock_items[:10],  # Top 10
            'out_of_stock_count': len(out_of_stock_items),
            'out_of_stock_items': out_of_stock_items[:10],  # Top 10
            'pending_receipts': pending_receipts,
            'pending_deliveries': pending_deliveries,
            'transfers_scheduled': transfers_scheduled,
            'total_stock_value': round(total_stock_value, 2)
        })


class RecentMovementsView(APIView):
    """Recent stock movements view"""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        """Get recent stock movements"""
        
        limit = int(request.query_params.get('limit', 20))
        movement_type = request.query_params.get('movement_type', None)
        
        movements = StockMovement.objects.select_related(
            'product', 'source_location', 'destination_location', 'created_by'
        ).all()
        
        if movement_type:
            movements = movements.filter(movement_type=movement_type)
        
        movements = movements[:limit]
        
        data = []
        for movement in movements:
            data.append({
                'id': movement.id,
                'movement_type': movement.movement_type,
                'product_sku': movement.product.sku,
                'product_name': movement.product.name,
                'quantity': str(movement.quantity),
                'source_location': movement.source_location.code if movement.source_location else None,
                'destination_location': movement.destination_location.code if movement.destination_location else None,
                'document_reference': movement.document_reference,
                'created_at': movement.created_at,
                'created_by': movement.created_by.username
            })
        
        return Response(data)


class StockLevelsByLocationView(APIView):
    """Stock levels grouped by location"""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        """Get stock levels by location"""
        
        warehouse_id = request.query_params.get('warehouse', None)
        
        quants = StockQuant.objects.select_related(
            'product', 'location', 'location__warehouse'
        ).filter(quantity__gt=0)
        
        if warehouse_id:
            quants = quants.filter(location__warehouse_id=warehouse_id)
        
        data = []
        for quant in quants:
            data.append({
                'warehouse': quant.location.warehouse.name,
                'location': quant.location.code,
                'product_sku': quant.product.sku,
                'product_name': quant.product.name,
                'quantity': str(quant.quantity),
                'reserved_quantity': str(quant.reserved_quantity),
                'available_quantity': str(quant.available_quantity())
            })
        
        return Response(data)
