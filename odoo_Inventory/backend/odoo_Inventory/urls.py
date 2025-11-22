from django.contrib import admin
from django.urls import path,include
from django.conf import settings
from django.conf.urls.static import static

# products/add

urlpatterns = [
    path('admin/', admin.site.urls),
    path('products/',include('products.urls'),name = "products"),
    path('stockledger/',include('stock_ledger.urls'),name = "stockledger"),
    path('warehouse/',include('warehouse.urls'),name = "warehouse"),    
    path("reports/", include("reports.urls")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
