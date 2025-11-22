from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DeliveryOrderViewSet

router = DefaultRouter()
router.register(r'', DeliveryOrderViewSet, basename='delivery')

urlpatterns = [
    path('', include(router.urls)),
]
