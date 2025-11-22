from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TransferOrderViewSet

router = DefaultRouter()
router.register(r'', TransferOrderViewSet, basename='transfer')

urlpatterns = [
    path('', include(router.urls)),
]
