# Quick Start Script for Inventory Management System
# Run this script after setting up PostgreSQL

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "   Inventory Management System - Setup" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Check if .env file exists
if (-not (Test-Path ".env")) {
    Write-Host "ERROR: .env file not found!" -ForegroundColor Red
    Write-Host "Please create a .env file with your PostgreSQL credentials." -ForegroundColor Yellow
    Write-Host "Example:" -ForegroundColor Yellow
    Write-Host "  DB_NAME=inventory_db" -ForegroundColor Gray
    Write-Host "  DB_USER=postgres" -ForegroundColor Gray
    Write-Host "  DB_PASSWORD=your_password" -ForegroundColor Gray
    exit 1
}

Write-Host "Step 1: Activating virtual environment..." -ForegroundColor Green
.\env\Scripts\activate

Write-Host ""
Write-Host "Step 2: Navigating to Django project..." -ForegroundColor Green
cd odoo_Inventory

Write-Host ""
Write-Host "Step 3: Running database migrations..." -ForegroundColor Green
python manage.py migrate

Write-Host ""
Write-Host "Step 4: Creating superuser..." -ForegroundColor Green
Write-Host "Please enter admin credentials:" -ForegroundColor Yellow
python manage.py createsuperuser

Write-Host ""
Write-Host "Step 5: Loading sample data..." -ForegroundColor Green
python manage.py load_sample_data

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "         Setup Complete!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Start Django server:" -ForegroundColor White
Write-Host "     python manage.py runserver" -ForegroundColor Gray
Write-Host ""
Write-Host "  2. In another terminal, start React:" -ForegroundColor White
Write-Host "     cd frontend" -ForegroundColor Gray
Write-Host "     npm install" -ForegroundColor Gray
Write-Host "     npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "Access Points:" -ForegroundColor Yellow
Write-Host "  Django Admin: http://localhost:8000/admin" -ForegroundColor White
Write-Host "  API:          http://localhost:8000/api/" -ForegroundColor White
Write-Host "  React App:    http://localhost:5173" -ForegroundColor White
Write-Host ""
Write-Host "Test Accounts:" -ForegroundColor Yellow
Write-Host "  Admin:   username=admin,   password=admin123" -ForegroundColor Gray
Write-Host "  Manager: username=manager, password=manager123" -ForegroundColor Gray
Write-Host "  Staff:   username=staff,   password=staff123" -ForegroundColor Gray
Write-Host ""
