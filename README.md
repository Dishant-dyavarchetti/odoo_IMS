# 📦 **Odoo IMS – Django + React (Vite + Tailwind) Setup Guide**

This project uses:

- **Django 5 (Backend API)**
- **Django REST Framework**
- **React + Vite + TypeScript + TailwindCSS (Frontend)**
- **Python virtual environment (venv)**

Follow the instructions below to set up and run the project on your local machine.

---

# 🚀 **1. Clone the Project**

```bash
git clone <your-repo-url>
cd odoo_IMS
```

---

# 🐍 **2. Create & Activate Python Virtual Environment**

### **Linux / MacOS**
```bash
python3 -m venv env
source env/bin/activate
```

### **Windows**
```bash
python -m venv env
env\Scripts\activate
```

---

# 📥 **3. Install Python Dependencies**

Install backend dependencies:

```bash
pip install -r requirements.txt
```

Your `requirements.txt` includes:

```
asgiref==3.11.0
Django==5.2.8
django-cors-headers==4.9.0
django-filter==25.2
djangorestframework==3.16.1
dotenv==0.9.9
pillow==12.0.0
python-dotenv==1.2.1
sqlparse==0.5.3
pip==24.0
```

---

# ⚙️ **4. Run Django Migrations**

```bash
cd odoo_Inventory
python manage.py migrate
```

---

# ▶️ **5. Run Django Development Server**

```bash
python manage.py runserver
```

Django runs at:

```
http://127.0.0.1:8000/
```

---

# 🖥️ **6. Install Frontend (React) Dependencies**

```bash
cd frontend
npm install
```

---

# 🎨 **7. Run React Development Server (Vite)**

```bash
npm run dev
```

React runs at:

```
http://localhost:5173/
```

---

# 🔗 **8. Communication Between Django & React**

React → calls Django API:

```
http://127.0.0.1:8000/api/...
```

Example:

```ts
fetch("http://127.0.0.1:8000/api/items/")
```

---

# 📁 **9. Project Structure**

```
odoo_IMS/
│
├── env/
│
└── odoo_Inventory/
    ├── manage.py
    ├── odoo_Inventory/
    ├── frontend/
    ├── media/
    └── static/
```

---

# 🛠️ **10. Building React for Production (Later)**

(Not required during development)

```bash
cd frontend
npm run build
```

---

# 🧹 **11. Deactivate Virtual Environment**

```bash
deactivate
```

---

# 🎉 **Project Ready!**
Django running at **localhost:8000**  
React running at **localhost:5173**
