from django.urls import path,include
from .views import home
urlpatterns = [
    path('productshome/',home,name = "Products Home !")    
]