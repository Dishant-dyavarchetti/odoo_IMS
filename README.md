# 📦 Odoo IMS - Inventory Management System

A comprehensive **Inventory Management System** built with **Django 5** (Backend) and **React 19 + Vite + TypeScript** (Frontend). This application provides complete inventory tracking, warehouse management, stock operations, and user role-based access control.

---

## 🌟 Features

### 📊 **Dashboard**
- Real-time KPI metrics (total products, warehouses, stock value)
- Interactive charts (stock movements, top products, low stock alerts)
- Recent activity tracking
- Visual analytics with Recharts

### 📦 **Product Management**
- CRUD operations for products
- Category hierarchies with parent-child relationships
- Unit of Measure (UOM) management
- SKU tracking and stock level monitoring
- Minimum stock and reorder quantity alerts
- Cost and selling price management

### 🏭 **Warehouse Operations**
- Multi-warehouse support
- Location management (receiving, storage, dispatch areas)
- Location type categorization
- Warehouse and location activation/deactivation

### 📥 **Stock Operations**
- **Receipts**: Incoming stock from suppliers
- **Deliveries**: Outgoing stock to customers
- **Transfers**: Inter-location stock movements
- **Adjustments**: Stock count corrections and adjustments
- **Move History**: Complete audit trail of stock movements

### 👥 **User Management**
- Role-based access control (Admin, Manager, User)
- User activation/deactivation
- Password reset functionality
- Last login tracking
- Permission guards for sensitive operations

### 🎨 **UI/UX Features**
- Responsive design with Tailwind CSS
- Dark mode ready
- View dialogs for detailed record inspection
- Toast notifications for user feedback
- Advanced filtering and pagination
- Protected routes and authentication

---

## 🛠️ Technology Stack

### **Backend**
- **Django 5.2.8** - Python web framework
- **Django REST Framework 3.16.1** - RESTful API
- **Django CORS Headers 4.9.0** - Cross-origin resource sharing
- **Django Filter 25.2** - Advanced filtering
- **Pillow 12.0.0** - Image processing
- **SQLite** - Development database (production: PostgreSQL/MySQL)

### **Frontend**
- **React 19.2.0** - UI library
- **TypeScript 5.9.3** - Type safety
- **Vite 7.2.4** - Build tool and dev server
- **Tailwind CSS 4.1.17** - Utility-first CSS
- **React Router DOM 7.9.6** - Client-side routing
- **Axios 1.13.2** - HTTP client
- **Recharts 3.4.1** - Data visualization
- **Radix UI** - Accessible component primitives
- **Lucide React** - Icon library

---

## 🚀 Getting Started

### **Prerequisites**
- Python 3.10+ installed
- Node.js 18+ and npm installed
- Git for version control

### **1. Clone the Repository**

```bash
git clone https://github.com/Dishant-dyavarchetti/odoo_IMS.git
cd odoo_IMS
```

### **2. Backend Setup**

#### **Create & Activate Virtual Environment**

**Windows:**
```bash
python -m venv env
env\Scripts\activate
```

**Linux/MacOS:**
```bash
python3 -m venv env
source env/bin/activate
```

#### **Install Python Dependencies**

```bash
pip install -r requirements.txt
```

#### **Run Database Migrations**

```bash
cd odoo_Inventory
python manage.py migrate
```

#### **Create Superuser (Admin)**

```bash
python manage.py createsuperuser
```

Follow prompts to create admin credentials.

#### **Start Django Development Server**

```bash
python manage.py runserver
```

Backend API runs at: **http://127.0.0.1:8000/**

Django Admin Panel: **http://127.0.0.1:8000/admin/**

### **3. Frontend Setup**

#### **Navigate to Frontend Directory**

```bash
cd frontend
```

#### **Install Dependencies**

```bash
npm install
```

#### **Start Vite Development Server**

```bash
npm run dev
```

Frontend runs at: **http://localhost:5173/**

---

## 📁 Project Structure

```
odoo_IMS/
│
├── env/                          # Python virtual environment
├── requirements.txt              # Python dependencies
├── README.md                     # This file
│
└── odoo_Inventory/              # Django project root
    ├── manage.py                # Django management script
    │
    ├── odoo_Inventory/          # Project settings
    │   ├── settings.py          # Django configuration
    │   ├── urls.py              # Main URL routing
    │   ├── wsgi.py              # WSGI application
    │   └── asgi.py              # ASGI application
    │
    ├── users/                   # User management app
    ├── products/                # Product & category management
    ├── warehouse/               # Warehouse & location management
    ├── receipts/                # Incoming stock receipts
    ├── deliveries/              # Outgoing deliveries
    ├── transfers/               # Stock transfers
    ├── adjustments/             # Stock adjustments
    ├── stock_ledger/            # Stock movement ledger
    ├── dashboard/               # Dashboard analytics
    │
    ├── media/                   # User-uploaded files
    ├── static/                  # Static files (CSS, JS)
    │
    └── frontend/                # React application
        ├── src/
        │   ├── components/      # Reusable UI components
        │   │   ├── Layout.tsx
        │   │   ├── Sidebar.tsx
        │   │   ├── Header.tsx
        │   │   ├── Pagination.tsx
        │   │   ├── PermissionGuard.tsx
        │   │   ├── ProtectedRoutes.tsx
        │   │   ├── ViewDialog.tsx
        │   │   └── ui/          # Shadcn UI components
        │   │
        │   ├── pages/           # Application pages
        │   │   ├── Login.tsx
        │   │   ├── Register.tsx
        │   │   ├── Dashboard.tsx
        │   │   ├── Products.tsx
        │   │   ├── Categories.tsx
        │   │   ├── UOMs.tsx
        │   │   ├── Warehouses.tsx
        │   │   ├── Receipts.tsx
        │   │   ├── Deliveries.tsx
        │   │   ├── Transfers.tsx
        │   │   ├── Adjustments.tsx
        │   │   ├── MoveHistory.tsx
        │   │   └── Users.tsx
        │   │
        │   ├── lib/             # Utilities
        │   ├── assets/          # Images and static assets
        │   ├── App.tsx          # Main app component
        │   └── main.tsx         # Application entry point
        │
        ├── public/              # Public assets
        ├── package.json         # Node dependencies
        ├── vite.config.ts       # Vite configuration
        ├── tsconfig.json        # TypeScript configuration
        └── tailwind.config.js   # Tailwind CSS configuration
```

---

## 🔌 API Endpoints

### **Authentication**
- `POST /api/users/login/` - User login
- `POST /api/users/register/` - User registration
- `POST /api/users/logout/` - User logout

### **Products**
- `GET/POST /api/products/` - List/create products
- `GET/PUT/DELETE /api/products/{id}/` - Retrieve/update/delete product
- `GET/POST /api/categories/` - List/create categories
- `GET/POST /api/uoms/` - List/create UOMs

### **Warehouses**
- `GET/POST /api/warehouses/` - List/create warehouses
- `GET/POST /api/locations/` - List/create locations

### **Stock Operations**
- `GET/POST /api/receipts/` - Manage receipts
- `GET/POST /api/deliveries/` - Manage deliveries
- `GET/POST /api/transfers/` - Manage transfers
- `GET/POST /api/adjustments/` - Manage adjustments
- `POST /api/receipts/{id}/validate/` - Validate receipt
- `POST /api/deliveries/{id}/validate/` - Validate delivery

### **Dashboard**
- `GET /api/dashboard/kpi/` - KPI metrics
- `GET /api/dashboard/stock-movements/` - Stock movement data
- `GET /api/dashboard/top-products/` - Top products by stock value
- `GET /api/dashboard/low-stock-alerts/` - Low stock alerts

### **Admin**
- `GET /api/users/` - List users (admin only)
- `POST /api/users/{id}/reset-password/` - Reset user password

---

## 🎯 Default User Roles

### **Admin**
- Full system access
- User management
- All CRUD operations
- System configuration

### **Manager**
- Inventory operations
- Stock management
- Report viewing
- Limited user management

### **User**
- View inventory
- Create receipts/deliveries
- Limited edit permissions

---

## 🧪 Development

### **Backend Development**

**Run migrations after model changes:**
```bash
python manage.py makemigrations
python manage.py migrate
```

**Create new Django app:**
```bash
python manage.py startapp app_name
```

**Run tests:**
```bash
python manage.py test
```

### **Frontend Development**

**Build for production:**
```bash
npm run build
```

**Preview production build:**
```bash
npm run preview
```

**Lint code:**
```bash
npm run lint
```

**Type checking:**
```bash
npx tsc --noEmit
```

---

## 📝 Environment Variables

Create a `.env` file in the `odoo_Inventory/` directory:

```env
SECRET_KEY=your-secret-key-here
DEBUG=True
DATABASE_URL=sqlite:///db.sqlite3
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:5173
```

---

## 🚢 Production Deployment

### **Backend (Django)**

1. Set `DEBUG=False` in settings
2. Configure production database (PostgreSQL recommended)
3. Set up static file serving with whitenoise or nginx
4. Use gunicorn/uwsgi as WSGI server
5. Enable HTTPS with SSL certificates
6. Configure allowed hosts and CORS

### **Frontend (React)**

1. Build production bundle: `npm run build`
2. Serve from Django static files or CDN
3. Configure environment-specific API URLs
4. Enable Vite build optimizations

---

## 🐛 Troubleshooting

### **CORS Issues**
- Ensure `corsheaders` is installed and configured
- Check `CORS_ALLOWED_ORIGINS` in Django settings
- Verify frontend API URL matches backend

### **Database Errors**
- Run migrations: `python manage.py migrate`
- Check database file permissions
- Verify model definitions

### **Frontend Build Errors**
- Clear node_modules: `rm -rf node_modules && npm install`
- Check TypeScript errors: `npx tsc --noEmit`
- Verify all dependencies are installed

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -m 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

- Dishant Dyavarchetti: [@Dishant-dyavarchetti](https://github.com/Dishant-dyavarchetti)
- Rohit Solanki: [@Rohit-Solanki-6105](https://github.com/Rohit-Solanki-6105)
- Parshva Modi: [@modiparshva](https://github.com/modiparshva)

---

## 🎉 Acknowledgments

- Django and DRF communities
- React and Vite teams
- Tailwind CSS and Radix UI
- All open-source contributors

---

## 📞 Support

For issues or questions:
- Open an issue on GitHub
- [Send Email](mailto:solanki.rohit6105@gmail.com,parshvamodi30@gmail.com,ddishantmsccs2023@gmail.com)

---

**Happy Coding! 🚀**
