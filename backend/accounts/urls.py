from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    CustomerRegistrationView,
    MechanicRegistrationView,
    AdminRegistrationView,
    LoginView,
    UserProfileView,
    MechanicListView,
    MechanicDetailView,
    MechanicApprovalView,
    UserListView,
    PublicMechanicListView,
    MechanicAvailabilityView,
    MechanicPublicDetailView,
)

urlpatterns = [
    # Registration endpoints
    path('register/customer/', CustomerRegistrationView.as_view(), name='register-customer'),
    path('register/mechanic/', MechanicRegistrationView.as_view(), name='register-mechanic'),
    path('register/admin/', AdminRegistrationView.as_view(), name='register-admin'),
    
    # Login and token endpoints
    path('login/', LoginView.as_view(), name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    
    # User profile
    path('profile/', UserProfileView.as_view(), name='user-profile'),
    
    # Admin - Users management
    path('users/', UserListView.as_view(), name='user-list'),
    
    # Admin - Mechanics management
    path('mechanics/', MechanicListView.as_view(), name='mechanic-list'),
    path('mechanics/<int:pk>/', MechanicDetailView.as_view(), name='mechanic-detail'),
    path('mechanics/<int:pk>/approve/', MechanicApprovalView.as_view(), name='mechanic-approve'),
    
    # Public - Mechanics for customers
    path('mechanics/public/', PublicMechanicListView.as_view(), name='mechanic-public-list'),
    path('mechanics/public/<int:pk>/', MechanicPublicDetailView.as_view(), name='mechanic-public-detail'),
    
    # Mechanic - Availability toggle
    path('mechanics/availability/', MechanicAvailabilityView.as_view(), name='mechanic-availability'),
]

