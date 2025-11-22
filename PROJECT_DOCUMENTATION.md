# StockMaster - Inventory Management System

A complete full-stack Inventory Management System built with Django REST Framework and React + Vite.

## Features

### Backend (Django + DRF)
- **User Management**: Role-based access control (Admin, Inventory Manager, Warehouse Staff)
- **Products**: SKU tracking, categories, units of measure, stock levels
- **Warehouses**: Multi-warehouse support with hierarchical locations
- **Stock Operations**:
  - Receipts (incoming stock)
  - Deliveries (outgoing stock)
  - Transfers (between locations)
  - Adjustments (physical count corrections)
- **Stock Ledger**: Real-time stock movement tracking
- **Dashboard**: KPIs and analytics
- **API Documentation**: Complete REST API with token authentication

### Frontend (React + TypeScript + Vite)
- **Modern UI**: Built with TailwindCSS and Radix UI components
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Protected Routes**: Authentication-based navigation
- **Complete Pages**:
  - Dashboard with KPIs and recent movements
  - Products management with categories and UOMs
  - Warehouse and location management
  - Receipts, Deliveries, Transfers, Adjustments
  - Stock movement history
  - Settings and profile management

## Tech Stack

### Backend
- Django 5.2.8
- Django REST Framework 3.16.1
- PostgreSQL (psycopg2-binary)
- django-cors-headers
- django-filter

### Frontend
- React 19.2.0
- TypeScript
- Vite 7.2.4
- TailwindCSS 4.1.17
- Radix UI Components
- Axios for API calls
- React Router v7
- React Toastify for notifications
- Recharts for data visualization
- Lucide React for icons

## Setup Instructions

### Prerequisites
- Python 3.10+
- Node.js 20.12.2+
- PostgreSQL 13+

### Backend Setup

1. **Create and activate virtual environment**:
```powershell
cd odoo_Inventory
python -m venv env
.\env\Scripts\activate
```

2. **Install dependencies**:
```powershell
pip install -r requirements.txt
```

3. **Configure database**:
   - Create PostgreSQL database
   - Create `.env` file in `odoo_Inventory/odoo_Inventory/` directory:
```
DB_NAME=your_database_name
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_HOST=localhost
DB_PORT=5432
```

4. **Run migrations**:
```powershell
python manage.py makemigrations
python manage.py migrate
```

5. **Create superuser**:
```powershell
python manage.py createsuperuser
```

6. **Run development server**:
```powershell
python manage.py runserver
```

Backend will be available at: `http://localhost:8000`
Admin panel: `http://localhost:8000/admin`

### Frontend Setup

1. **Navigate to frontend directory**:
```powershell
cd frontend
```

2. **Install dependencies**:
```powershell
npm install
```

3. **Start development server**:
```powershell
npm run dev
```

Frontend will be available at: `http://localhost:5173`

## Default Credentials

After creating a superuser, you can create additional users with different roles through the admin panel:
- **ADMIN**: Full system access
- **INVENTORY_MANAGER**: Manage products, stock operations, view reports
- **WAREHOUSE_STAFF**: Create and validate operations

## API Endpoints

### Authentication
- POST `/api/users/login/` - Login
- POST `/api/users/register/` - Register new user
- POST `/api/users/logout/` - Logout
- GET `/api/users/me/` - Get current user

### Products
- GET/POST `/api/products/` - List/Create products
- GET/PUT/DELETE `/api/products/{id}/` - Retrieve/Update/Delete product
- GET/POST `/api/categories/` - Categories
- GET/POST `/api/units/` - Units of Measure

### Warehouses
- GET/POST `/api/warehouses/` - List/Create warehouses
- GET/PUT/DELETE `/api/warehouses/{id}/` - Warehouse operations
- GET/POST `/api/locations/` - Locations
- GET `/api/stock-quants/` - Stock quantities

### Operations
- GET/POST `/api/receipts/` - Receipts
- POST `/api/receipts/{id}/validate_receipt/` - Validate receipt
- GET/POST `/api/deliveries/` - Deliveries
- POST `/api/deliveries/{id}/validate_delivery/` - Validate delivery
- GET/POST `/api/transfers/` - Transfers
- POST `/api/transfers/{id}/validate_transfer/` - Validate transfer
- GET/POST `/api/adjustments/` - Adjustments
- POST `/api/adjustments/{id}/validate_adjustment/` - Validate adjustment

### Dashboard
- GET `/api/dashboard/kpis/` - Get KPIs
- GET `/api/dashboard/recent-movements/` - Recent stock movements

## Project Structure

```
odoo_IMS/
├── odoo_Inventory/          # Backend Django project
│   ├── users/              # User management app
│   ├── products/           # Products, categories, UOMs
│   ├── warehouse/          # Warehouses, locations, stock quants
│   ├── stock_ledger/       # Stock movements tracking
│   ├── receipts/           # Incoming stock operations
│   ├── deliveries/         # Outgoing stock operations
│   ├── transfers/          # Transfer operations
│   ├── adjustments/        # Stock adjustments
│   ├── dashboard/          # Analytics and KPIs
│   ├── odoo_Inventory/     # Main project settings
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── .env           # Database configuration
│   └── manage.py
│
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   │   ├── ui/        # Shadcn-style components
│   │   │   ├── Layout.tsx # Main layout with sidebar
│   │   │   └── ProtectedRoutes.tsx
│   │   ├── pages/         # Application pages
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Products.tsx
│   │   │   ├── Warehouses.tsx
│   │   │   ├── Receipts.tsx
│   │   │   ├── Deliveries.tsx
│   │   │   ├── Transfers.tsx
│   │   │   ├── Adjustments.tsx
│   │   │   ├── MoveHistory.tsx
│   │   │   ├── Settings.tsx
│   │   │   ├── Login.tsx
│   │   │   └── Register.tsx
│   │   ├── services/      # API service layer
│   │   │   └── api.ts
│   │   ├── lib/           # Utilities
│   │   ├── App.tsx        # Main app with routes
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
│
└── README.md
```

## Usage Workflow

1. **Login**: Use your credentials to access the system
2. **Create Products**: 
   - Add categories and units of measure
   - Create products with SKU, reorder levels
3. **Setup Warehouses**:
   - Create warehouses
   - Add locations (hierarchical structure)
4. **Stock Operations**:
   - **Receipt**: Record incoming stock from suppliers
   - **Delivery**: Process outgoing stock to customers
   - **Transfer**: Move stock between locations
   - **Adjustment**: Correct stock based on physical counts
5. **Monitor**: 
   - View dashboard KPIs
   - Check stock levels
   - Review movement history

## Development

### Run tests (Backend)
```powershell
python manage.py test
```

### Build for production (Frontend)
```powershell
npm run build
```

### Linting (Frontend)
```powershell
npm run lint
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License

## Support

For issues and questions, please open an issue on GitHub.
