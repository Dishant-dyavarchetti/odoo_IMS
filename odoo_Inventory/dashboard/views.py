from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from django.db.models import Sum, Q, Count
from django.utils import timezone
from datetime import timedelta
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


class MovementTrendsView(APIView):
    """Movement trends over time"""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        """Get movement trends for the last 30 days"""
        
        days = int(request.query_params.get('days', 30))
        end_date = timezone.now()
        start_date = end_date - timedelta(days=days)
        
        movements = StockMovement.objects.filter(
            created_at__gte=start_date
        ).values('movement_type').annotate(
            count=Count('id')
        )
        
        # Get daily counts
        daily_data = []
        for i in range(days):
            date = start_date + timedelta(days=i)
            next_date = date + timedelta(days=1)
            
            day_movements = StockMovement.objects.filter(
                created_at__gte=date,
                created_at__lt=next_date
            ).values('movement_type').annotate(count=Count('id'))
            
            receipts = sum(m['count'] for m in day_movements if m['movement_type'] == 'RECEIPT')
            deliveries = sum(m['count'] for m in day_movements if m['movement_type'] == 'DELIVERY')
            transfers = sum(m['count'] for m in day_movements if m['movement_type'] == 'TRANSFER')
            adjustments = sum(m['count'] for m in day_movements if m['movement_type'] == 'ADJUSTMENT')
            
            daily_data.append({
                'date': date.strftime('%Y-%m-%d'),
                'receipts': receipts,
                'deliveries': deliveries,
                'transfers': transfers,
                'adjustments': adjustments,
                'total': receipts + deliveries + transfers + adjustments
            })
        
        return Response(daily_data)


class TopProductsView(APIView):
    """Top products by movement"""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        """Get top products by movement"""
        
        limit = int(request.query_params.get('limit', 10))
        days = int(request.query_params.get('days', 30))
        
        end_date = timezone.now()
        start_date = end_date - timedelta(days=days)
        
        # Get top products by movement count
        top_products = StockMovement.objects.filter(
            created_at__gte=start_date
        ).values('product__name', 'product__sku').annotate(
            movement_count=Count('id'),
            total_quantity=Sum('quantity')
        ).order_by('-movement_count')[:limit]
        
        data = []
        for item in top_products:
            data.append({
                'name': item['product__name'],
                'sku': item['product__sku'],
                'movements': item['movement_count'],
                'quantity': str(item['total_quantity'] or 0)
            })
        
        return Response(data)


class StockValueByCategoryView(APIView):
    """Stock value grouped by category"""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        """Get stock value by category"""
        
        categories = {}
        
        for quant in StockQuant.objects.select_related('product', 'product__category').filter(quantity__gt=0):
            category_name = quant.product.category.name if quant.product.category else 'Uncategorized'
            
            if category_name not in categories:
                categories[category_name] = {
                    'category': category_name,
                    'value': 0,
                    'quantity': 0,
                    'products': 0
                }
            
            value = float(quant.quantity) * float(quant.product.cost_price)
            categories[category_name]['value'] += value
            categories[category_name]['quantity'] += float(quant.quantity)
            categories[category_name]['products'] += 1
        
        # Convert to list and sort by value
        data = sorted(categories.values(), key=lambda x: x['value'], reverse=True)
        
        # Round values
        for item in data:
            item['value'] = round(item['value'], 2)
            item['quantity'] = round(item['quantity'], 2)
        
        return Response(data)
