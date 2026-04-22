from django.urls import path
from .views import (
    EmergencyBookingCreateView,
    RegularBookingCreateView,
    CustomerBookingsListView,
    CustomerNotificationsView,
    AvailableEmergencyJobsView,
    AvailableRegularJobsView,
    AcceptJobView,
    ProcessPaymentView,
    MechanicJobsView,
    MechanicAllJobsView,
    CompleteJobView,
    CancelJobByMechanicView,
    CancelJobByCustomerView,
    CancelEmergencyBookingView,
    CreateReviewView,
    CreateComplaintView,
    ConfirmPaymentView,
    AdminComplaintListView,
    AdminComplaintUpdateView,
    CustomerComplaintsListView,
    CustomerReviewsListView,
    BookingMessagesView,
    SendMessageView,
    CustomerBillsListView,
    MechanicBillsListView,
    BillDetailView
)
from .admin_views import AdminDashboardStatsView, AdminAnalyticsView

urlpatterns = [
    # Customer booking endpoints
    path('emergency/', EmergencyBookingCreateView.as_view(), name='emergency-booking'),
    path('regular/', RegularBookingCreateView.as_view(), name='regular-booking'),
    path('', CustomerBookingsListView.as_view(), name='customer-bookings'),
    path('notifications/', CustomerNotificationsView.as_view(), name='customer-notifications'),
    
    # Mechanic job endpoints
    path('jobs/emergency/', AvailableEmergencyJobsView.as_view(), name='available-emergency-jobs'),
    path('jobs/regular/', AvailableRegularJobsView.as_view(), name='available-regular-jobs'),
    path('my-jobs/', MechanicJobsView.as_view(), name='mechanic-jobs'),
    path('my-jobs/all/', MechanicAllJobsView.as_view(), name='mechanic-all-jobs'),
    
    # Booking actions
    path('<int:booking_id>/accept/', AcceptJobView.as_view(), name='accept-job'),
    path('<int:booking_id>/pay/', ProcessPaymentView.as_view(), name='process-payment'),
    path('<int:booking_id>/complete/', CompleteJobView.as_view(), name='complete-job'),
    path('<int:booking_id>/mechanic-cancel/', CancelJobByMechanicView.as_view(), name='mechanic-cancel-job'),
    path('<int:booking_id>/customer-cancel/', CancelJobByCustomerView.as_view(), name='customer-cancel-booking'),
    path('<int:booking_id>/emergency-cancel/', CancelEmergencyBookingView.as_view(), name='emergency-cancel-booking'),
    path('<int:booking_id>/review/', CreateReviewView.as_view(), name='create-review'),
    path('<int:booking_id>/complaint/', CreateComplaintView.as_view(), name='create-complaint'),
    path('<int:booking_id>/confirm-payment/', ConfirmPaymentView.as_view(), name='confirm-payment'),
    
    # Admin endpoints
    path('admin/complaints/', AdminComplaintListView.as_view(), name='admin-complaints'),
    path('admin/complaints/<int:complaint_id>/', AdminComplaintUpdateView.as_view(), name='admin-complaint-update'),
    path('admin/stats/', AdminDashboardStatsView.as_view(), name='admin-stats'),
    path('admin/analytics/', AdminAnalyticsView.as_view(), name='admin-analytics'),
    
    # Customer complaints and reviews endpoints
    path('my-complaints/', CustomerComplaintsListView.as_view(), name='customer-complaints'),
    path('my-reviews/', CustomerReviewsListView.as_view(), name='customer-reviews'),
    
    # Chat endpoints
    path('<int:booking_id>/messages/', BookingMessagesView.as_view(), name='booking-messages'),
    path('<int:booking_id>/messages/send/', SendMessageView.as_view(), name='send-message'),

    # Bill endpoints
    path('bills/', CustomerBillsListView.as_view(), name='customer-bills'),
    path('bills/mechanic/', MechanicBillsListView.as_view(), name='mechanic-bills'),
    path('bills/<str:bill_number>/', BillDetailView.as_view(), name='bill-detail'),
]
