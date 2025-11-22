from django.urls import path,include
from .views import home
urlpatterns = [
    path('stockhome/',home,name = "Stock Home"),    
]