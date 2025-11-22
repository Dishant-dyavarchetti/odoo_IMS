# 📦 Inventory Management System (StockMaster)

A comprehensive, modular Inventory Management System (IMS) built with **Django REST Framework** and **React + Vite** that digitalizes and streamlines all stock-related operations within a business.

---

## ✨ Features

### 🔧 Backend (Django REST Framework)
- ✅ **User Management** - Role-based access (Admin, Inventory Manager, Warehouse Staff) with OTP password reset
- ✅ **Product Management** - SKU tracking, categories, units of measure, reordering rules
- ✅ **Warehouse Management** - Multi-warehouse support, hierarchical locations (zones, racks, bins), real-time stock tracking
- ✅ **Stock Ledger** - Core engine tracking all stock movements (receipts, deliveries, transfers, adjustments)
- ✅ **Operations**
  - **Receipts** - Incoming stock from vendors
  - **Deliveries** - Outgoing stock to customers
  - **Internal Transfers** - Movement between locations
  - **Stock Adjustments** - Physical count corrections
- ✅ **Dashboard** - Real-time KPIs, low stock alerts, pending operations tracking
- ✅ **Complete REST API** with filtering, search, and pagination

### 🎨 Frontend (React + Vite + TypeScript)
- ⚛️ Modern React 18 with TypeScript
- ⚡ Vite for blazing-fast development
- 🎨 TailwindCSS + Shadcn/UI components
- 🔒 Protected routes with authentication
- 📱 Responsive design

---

## 📂 Project Structure

```
odoo_IMS/
├── env/                        # Python virtual environment
├── .env                        # Environment variables (DB config)
├── requirements.txt
├── odoo_Inventory/            # Django backend
│   ├── manage.py
│   ├── odoo_Inventory/        # Main Django project
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   ├── users/                 # User authentication & roles
│   ├── products/              # Product master
│   ├── warehouse/             # Warehouse & locations
│   ├── stock_ledger/          # Stock movement tracking (CORE)
│   ├── receipts/              # Incoming stock operations
│   ├── deliveries/            # Outgoing stock operations
│   ├── transfers/             # Internal transfers
│   ├── adjustments/           # Stock corrections
│   ├── dashboard/             # KPIs & reports
│   └── frontend/              # React application
│       ├── src/
│       ├── public/
│       ├── package.json
│       └── vite.config.ts
└── README.md
```

---

## 🚀 Setup Instructions

### Prerequisites
- **Python 3.11+**
- **Node.js 18+** and npm
- **PostgreSQL 14+**

---

### 🗄️ Step 1: Set up PostgreSQL Database

#### Option 1: Using Command Line
```powershell
# Install PostgreSQL, then create database
createdb inventory_db

# Or using psql
psql -U postgres
CREATE DATABASE inventory_db;
\q
```

#### Option 2: Using pgAdmin
1. Open pgAdmin
2. Right-click "Databases" → Create → Database
3. Name: `inventory_db`
4. Save

---

### ⚙️ Step 2: Configure Environment Variables

Edit `.env` file in the **root directory** (`odoo_IMS/.env`):

```env
DB_NAME=inventory_db
DB_USER=postgres
DB_PASSWORD=YOUR_POSTGRES_PASSWORD_HERE
DB_HOST=localhost
DB_PORT=5432

SECRET_KEY=django-insecure-sq$4@b#vsdgs9@!gw&w*0l!-mc+%n4dkxneb@&mawr7q*3x#n6
DEBUG=True
```

**⚠️ IMPORTANT:** Replace `YOUR_POSTGRES_PASSWORD_HERE` with your actual PostgreSQL password.

---

### 🐍 Step 3: Backend Setup

1. **Activate Virtual Environment** (already created)
   ```powershell
   .\env\Scripts\activate
   ```

2. **Verify Dependencies** (already installed)
   ```powershell
   pip list
   ```

3. **Run Database Migrations**
   ```powershell
   cd odoo_Inventory
   python manage.py migrate
   ```

4. **Create Superuser (Admin)**
   ```powershell
   python manage.py createsuperuser
   ```
   - Enter username, email, and password

5. **Start Django Server**
   ```powershell
   python manage.py runserver
   ```

   ✅ Backend available at: **http://localhost:8000**  
   ✅ Admin panel: **http://localhost:8000/admin**

---

### ⚛️ Step 4: Frontend Setup

1. **Navigate to frontend directory**
   ```powershell
   cd frontend
   ```

2. **Install dependencies**
   ```powershell
   npm install
   ```

3. **Run development server**
   ```powershell
   npm run dev
   ```

   ✅ Frontend available at: **http://localhost:5173**

---

## 📡 API Endpoints

### 🔐 Authentication (`/api/users/`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/register/` | Register new user |
| POST | `/login/` | User login (returns token) |
| POST | `/logout/` | User logout |
| GET | `/me/` | Get current user info |
| POST | `/request_password_reset/` | Request OTP |
| POST | `/verify_password_reset/` | Verify OTP & reset password |

### 📦 Products (`/api/`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/products/` | List/Create products |
| GET/PUT/DELETE | `/products/{id}/` | Retrieve/Update/Delete product |
| GET/POST | `/categories/` | Product categories |
| GET/POST | `/units/` | Units of measure |

### 🏭 Warehouse (`/api/`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/warehouses/` | List/Create warehouses |
| GET/POST | `/locations/` | List/Create locations |
| GET | `/stock-quants/` | View real-time stock (read-only) |

### 📥📤 Operations
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/api/receipts/` | Incoming stock |
| POST | `/api/receipts/{id}/validate_receipt/` | Validate receipt |
| GET/POST | `/api/deliveries/` | Outgoing stock |
| POST | `/api/deliveries/{id}/validate_delivery/` | Validate delivery |
| GET/POST | `/api/transfers/` | Internal transfers |
| POST | `/api/transfers/{id}/validate_transfer/` | Validate transfer |
| GET/POST | `/api/adjustments/` | Stock corrections |
| POST | `/api/adjustments/{id}/validate_adjustment/` | Validate adjustment |

### 📊 Dashboard (`/api/dashboard/`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/kpis/` | All dashboard KPIs |
| GET | `/recent-movements/` | Recent stock movements |
| GET | `/stock-levels/` | Stock levels by location |

### 📜 Stock Ledger (`/api/movements/`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | View all stock movements (read-only) |

---

## 👥 User Roles

| Role | Permissions |
|------|-------------|
| **Admin** | Full access to all features |
| **Inventory Manager** | Manage products, approve operations, view reports |
| **Warehouse Staff** | Perform receipts, deliveries, transfers, adjustments |

---

## 🔄 Workflow Examples

### 1️⃣ Receive Goods from Vendor
```
1. Create Receipt
2. Add product lines (product, quantity, price)
3. Click "Validate"
   → Stock automatically increases at destination location
   → Stock movement recorded in ledger (type: RECEIPT)
```

### 2️⃣ Deliver to Customer
```
1. Create Delivery Order
2. Add product lines
3. Click "Validate"
   → System checks stock availability
   → Stock decreases from source location
   → Stock movement recorded (type: DELIVERY)
```

### 3️⃣ Internal Transfer
```
1. Create Transfer Order
2. Select source and destination locations
3. Add product lines
4. Click "Validate"
   → Stock moves between locations
   → Two movements created (- source, + destination)
```

### 4️⃣ Stock Adjustment
```
1. Physical count performed
2. Create Adjustment Entry
3. Enter system quantity and counted quantity
4. System calculates difference
5. Click "Validate"
   → Stock adjusted to match reality
   → Movement created for the difference
```

---

## 🛠️ Technologies Used

### Backend
- Django 5.2.8
- Django REST Framework 3.16.1
- PostgreSQL (psycopg2-binary)
- django-cors-headers 4.9.0
- django-filter 25.2
- python-dotenv 1.2.1
- Pillow 12.0.0

### Frontend
- React 18
- TypeScript
- Vite
- TailwindCSS
- Shadcn/UI
- React Router

---

## ✅ Development Status

| Task | Status |
|------|--------|
| Backend Models | ✅ Complete |
| API Endpoints | ✅ Complete |
| Admin Interface | ✅ Complete |
| Database Migrations | ✅ Created |
| Frontend Setup | 🔄 In Progress |
| Authentication UI | ⏳ Pending |
| Dashboard UI | ⏳ Pending |
| Testing | ⏳ Pending |

---

## 📋 Next Steps

1. ✅ Update PostgreSQL password in `.env`
2. ✅ Run migrations: `python manage.py migrate`
3. ✅ Create superuser: `python manage.py createsuperuser`
4. 🔄 Complete React frontend components
5. ⏳ Load sample/seed data
6. ⏳ End-to-end testing
7. ⏳ Deploy to production

---

## 🐛 Troubleshooting

### Database Connection Error
- Verify PostgreSQL is running
- Check credentials in `.env` file
- Ensure database `inventory_db` exists

### Port Already in Use
- Django (8000): `python manage.py runserver 8001`
- React (5173): Change port in `vite.config.ts`

### Migration Issues
```powershell
python manage.py makemigrations
python manage.py migrate
```

---

## 📞 Support

- Django Admin Panel: `http://localhost:8000/admin`
- API Documentation: Check endpoint list above
- Issues: Review console logs in browser/terminal

---

## 📄 License

This project is for educational/business purposes.

---

**Built with ❤️ using Django + React**
