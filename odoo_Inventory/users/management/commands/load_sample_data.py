"""
Management command to load sample data for testing the Inventory Management System
Run with: python manage.py load_sample_data
"""
from django.core.management.base import BaseCommand
from django.utils import timezone
from users.models import User
from products.models import Category, UnitOfMeasure, Product
from warehouse.models import Warehouse, Location
from datetime import date


class Command(BaseCommand):
    help = 'Load sample data for testing'

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.SUCCESS('Loading sample data...'))

        # Create test users
        if not User.objects.filter(username='admin').exists():
            User.objects.create_superuser(
                username='admin',
                email='admin@inventory.com',
                password='admin123',
                role='ADMIN',
                first_name='Admin',
                last_name='User'
            )
            self.stdout.write(self.style.SUCCESS('✓ Created admin user (username: admin, password: admin123)'))

        if not User.objects.filter(username='manager').exists():
            User.objects.create_user(
                username='manager',
                email='manager@inventory.com',
                password='manager123',
                role='INVENTORY_MANAGER',
                first_name='John',
                last_name='Manager'
            )
            self.stdout.write(self.style.SUCCESS('✓ Created manager user (username: manager, password: manager123)'))

        if not User.objects.filter(username='staff').exists():
            User.objects.create_user(
                username='staff',
                email='staff@inventory.com',
                password='staff123',
                role='WAREHOUSE_STAFF',
                first_name='Jane',
                last_name='Staff'
            )
            self.stdout.write(self.style.SUCCESS('✓ Created staff user (username: staff, password: staff123)'))

        # Create Units of Measure
        uom_data = [
            ('Piece', 'PCS'),
            ('Kilogram', 'KG'),
            ('Liter', 'L'),
            ('Meter', 'M'),
            ('Box', 'BOX'),
            ('Carton', 'CTN'),
        ]
        
        for name, abbr in uom_data:
            UnitOfMeasure.objects.get_or_create(
                abbreviation=abbr,
                defaults={'name': name}
            )
        self.stdout.write(self.style.SUCCESS(f'✓ Created {len(uom_data)} units of measure'))

        # Create Categories
        categories = {}
        category_data = [
            ('Electronics', None),
            ('Furniture', None),
            ('Raw Materials', None),
            ('Finished Goods', None),
            ('Office Supplies', None),
        ]
        
        for name, parent_name in category_data:
            parent = categories.get(parent_name)
            cat, _ = Category.objects.get_or_create(
                name=name,
                defaults={'parent': parent}
            )
            categories[name] = cat
        self.stdout.write(self.style.SUCCESS(f'✓ Created {len(category_data)} categories'))

        # Create Products
        pcs = UnitOfMeasure.objects.get(abbreviation='PCS')
        kg = UnitOfMeasure.objects.get(abbreviation='KG')
        box = UnitOfMeasure.objects.get(abbreviation='BOX')
        
        products = [
            ('LAPTOP-001', 'Laptop Computer', categories['Electronics'], pcs, 45000, 55000, 5, 10),
            ('MOUSE-001', 'Wireless Mouse', categories['Electronics'], pcs, 500, 800, 20, 50),
            ('DESK-001', 'Office Desk', categories['Furniture'], pcs, 8000, 12000, 3, 5),
            ('CHAIR-001', 'Office Chair', categories['Furniture'], pcs, 5000, 7500, 10, 20),
            ('STEEL-001', 'Steel Rods', categories['Raw Materials'], kg, 80, 0, 100, 500),
            ('PAPER-001', 'A4 Paper', categories['Office Supplies'], box, 200, 350, 50, 100),
        ]
        
        for sku, name, category, uom, cost, selling, min_stock, reorder in products:
            Product.objects.get_or_create(
                sku=sku,
                defaults={
                    'name': name,
                    'category': category,
                    'uom': uom,
                    'cost_price': cost,
                    'selling_price': selling,
                    'min_stock_level': min_stock,
                    'reorder_quantity': reorder,
                }
            )
        self.stdout.write(self.style.SUCCESS(f'✓ Created {len(products)} products'))

        # Create Warehouses
        warehouses = [
            ('WH-MAIN', 'Main Warehouse', 'Mumbai', 'Maharashtra'),
            ('WH-SEC', 'Secondary Warehouse', 'Delhi', 'Delhi'),
        ]
        
        for code, name, city, state in warehouses:
            Warehouse.objects.get_or_create(
                code=code,
                defaults={
                    'name': name,
                    'city': city,
                    'state': state,
                    'country': 'India',
                }
            )
        self.stdout.write(self.style.SUCCESS(f'✓ Created {len(warehouses)} warehouses'))

        # Create Locations
        main_wh = Warehouse.objects.get(code='WH-MAIN')
        sec_wh = Warehouse.objects.get(code='WH-SEC')
        
        locations = [
            (main_wh, 'ZONE-A', 'Zone A', 'ZONE', None),
            (main_wh, 'RACK-A1', 'Rack A1', 'RACK', None),
            (main_wh, 'BIN-A1-01', 'Bin A1-01', 'BIN', None),
            (main_wh, 'ZONE-B', 'Zone B', 'ZONE', None),
            (main_wh, 'RACK-B1', 'Rack B1', 'RACK', None),
            (sec_wh, 'ZONE-A', 'Zone A', 'ZONE', None),
            (sec_wh, 'RACK-A1', 'Rack A1', 'RACK', None),
        ]
        
        for warehouse, code, name, loc_type, parent in locations:
            Location.objects.get_or_create(
                warehouse=warehouse,
                code=code,
                defaults={
                    'name': name,
                    'location_type': loc_type,
                    'parent': parent,
                }
            )
        self.stdout.write(self.style.SUCCESS(f'✓ Created {len(locations)} locations'))

        self.stdout.write(self.style.SUCCESS('\n=== Sample Data Loaded Successfully! ==='))
        self.stdout.write(self.style.SUCCESS('\nTest Users:'))
        self.stdout.write('  Admin:   username=admin,   password=admin123')
        self.stdout.write('  Manager: username=manager, password=manager123')
        self.stdout.write('  Staff:   username=staff,   password=staff123')
        self.stdout.write(self.style.SUCCESS('\nYou can now:'))
        self.stdout.write('  1. Login to admin panel: http://localhost:8000/admin')
        self.stdout.write('  2. Test API endpoints with the sample data')
        self.stdout.write('  3. Create receipts, deliveries, transfers, and adjustments')
