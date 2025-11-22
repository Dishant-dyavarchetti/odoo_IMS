from django.urls import path,include
from .views import home
urlpatterns = [
    path('warehousehome/',home,name = "Warehouse Home"),
]
