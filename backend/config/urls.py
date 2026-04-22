from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('rest_framework.urls')), # DRF Login
    path('api/accounts/', include('accounts.urls')),  # Accounts API
    path('api/vehicles/', include('vehicles.urls')),  # Vehicles API
    path('api/bookings/', include('bookings.urls')),  # Bookings API
    path('api/support/', include('support.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
