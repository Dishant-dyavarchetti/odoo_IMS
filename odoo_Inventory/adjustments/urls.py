from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AdjustmentEntryViewSet

router = DefaultRouter()
router.register(r'', AdjustmentEntryViewSet, basename='adjustment')

urlpatterns = [
    path('', include(router.urls)),
]
