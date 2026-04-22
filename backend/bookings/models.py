from django.db import models
from django.conf import settings

class Booking(models.Model):
    SERVICE_TYPE_CHOICES = (
        ('BREAKDOWN', 'Breakdown Assistance'),
        ('HOME_SERVICE', 'Home Service'),
    )
    STATUS_CHOICES = (
        ('PENDING', 'Pending'),
        ('ASSIGNED', 'Assigned'),
        ('IN_PROGRESS', 'In Progress'),
        ('COMPLETED', 'Completed'),
        ('CANCELLED', 'Cancelled'),
        ('NO_MECHANIC', 'No Mechanic Available'),
        ('REFUNDED', 'Refunded'),
    )

    booking_id = models.AutoField(primary_key=True)
    customer = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='bookings_as_customer'
    )
    vehicle = models.ForeignKey(
        'vehicles.Vehicle', 
        on_delete=models.CASCADE, 
        related_name='bookings'
    )
    mechanic = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='bookings_as_mechanic'
    )
    address = models.ForeignKey(
        'vehicles.Address', 
        on_delete=models.SET_NULL, 
        null=True, 
        related_name='bookings'
    )
    
    service_type = models.CharField(max_length=20, choices=SERVICE_TYPE_CHOICES)
    service_details = models.TextField(help_text="Problem description")
    service_category = models.CharField(max_length=50, blank=True, null=True, help_text="e.g. Oil Change, Brake Service")
    is_urgent = models.BooleanField(default=False)
    expected_completion = models.DateTimeField(null=True, blank=True)
    booking_status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    
    # Location fields (for when not using saved address)
    district = models.CharField(max_length=100, blank=True, null=True)
    place = models.CharField(max_length=100, blank=True, null=True)
    
    # Preferred mechanic (set when booking from Find Mechanic page)
    preferred_mechanic = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='preferred_bookings'
    )

    # Scheduling fields for regular service
    scheduled_date = models.DateField(null=True, blank=True)
    scheduled_time = models.TimeField(null=True, blank=True)
    
    # Cancellation fields
    cancellation_reason = models.TextField(blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    accepted_at = models.DateTimeField(null=True, blank=True)
    mechanic_arrival_time = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    cancelled_at = models.DateTimeField(null=True, blank=True)
    
    cancelled_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='cancelled_bookings'
    )

    def __str__(self):
        return f"Booking #{self.booking_id} - {self.service_type}"

class Payment(models.Model):
    ADVANCE_STATUS = (
        ('NOT_REQUIRED', 'Not Required'),
        ('PENDING', 'Pending'),
        ('PAID', 'Paid'),
        ('REFUNDED', 'Refunded'),
    )
    FINAL_STATUS = (
        ('PENDING', 'Pending'),
        ('PAID', 'Paid'),
        ('PARTIAL', 'Partial'),
        ('NOT_APPLICABLE', 'Not Applicable'),
        ('DISPUTED', 'Disputed'),
        ('CONFIRMED', 'Confirmed'),
    )

    booking = models.OneToOneField(Booking, on_delete=models.CASCADE, related_name='payment')
    advance_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    advance_status = models.CharField(max_length=20, choices=ADVANCE_STATUS, default='PENDING')
    advance_paid_at = models.DateTimeField(null=True, blank=True)
    
    final_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    final_status = models.CharField(max_length=20, choices=FINAL_STATUS, default='PENDING')
    final_paid_at = models.DateTimeField(null=True, blank=True)
    
    # Customer payment verification
    customer_confirmed_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    customer_confirmed = models.BooleanField(default=False)
    customer_confirmed_at = models.DateTimeField(null=True, blank=True)
    
    admin_commission_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    mechanic_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    payment_gateway_ref = models.CharField(max_length=100, null=True, blank=True)
    
    # Refund fields
    refund_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    refund_processing_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    refunded_at = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Payment for Booking #{self.booking.booking_id}"

class Bill(models.Model):
    """Invoice/bill generated for each payment (advance or final)"""
    BILL_TYPE_CHOICES = (
        ('ADVANCE', 'Advance Payment'),
        ('FINAL', 'Final Payment'),
    )

    bill_number = models.CharField(max_length=20, unique=True)  # e.g. VV-2026-00001
    booking = models.ForeignKey(Booking, on_delete=models.CASCADE, related_name='bills')
    payment = models.ForeignKey(Payment, on_delete=models.CASCADE, related_name='bills')
    bill_type = models.CharField(max_length=10, choices=BILL_TYPE_CHOICES)

    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    admin_commission_percent = models.DecimalField(max_digits=5, decimal_places=2)
    admin_commission_amount = models.DecimalField(max_digits=10, decimal_places=2)
    mechanic_amount = models.DecimalField(max_digits=10, decimal_places=2)

    customer_name = models.CharField(max_length=200)
    customer_email = models.EmailField()
    mechanic_name = models.CharField(max_length=200, blank=True)
    mechanic_email = models.EmailField(blank=True)

    vehicle_name = models.CharField(max_length=200)
    service_type = models.CharField(max_length=50)
    service_details = models.TextField(blank=True)

    payment_method = models.CharField(max_length=20, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Bill {self.bill_number} — ₹{self.total_amount}"

class MechanicUpdate(models.Model):
    UPDATE_STATUS_CHOICES = (
        ('ON_THE_WAY', 'On The Way'),
        ('ARRIVED', 'Arrived'),
        ('WORK_STARTED', 'Work Started'),
        ('WORK_COMPLETED', 'Work Completed'),
        ('DELAYED', 'Delayed'),
    )

    booking = models.ForeignKey(Booking, on_delete=models.CASCADE, related_name='mechanic_updates')
    mechanic = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    update_status = models.CharField(max_length=20, choices=UPDATE_STATUS_CHOICES)
    update_time = models.DateTimeField(auto_now_add=True)
    remarks = models.TextField(null=True, blank=True)

    def __str__(self):
        return f"Update: {self.update_status} for Booking #{self.booking.booking_id}"


class Review(models.Model):
    """Customer review for completed bookings"""
    booking = models.OneToOneField(Booking, on_delete=models.CASCADE, related_name='review')
    customer = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='reviews_given'
    )
    mechanic = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='reviews_received'
    )
    rating = models.IntegerField(help_text="Rating from 1 to 5")
    review_text = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Review for Booking #{self.booking.booking_id} - {self.rating} stars"


class Complaint(models.Model):
    """Customer complaints for bookings"""
    STATUS_CHOICES = (
        ('PENDING', 'Pending'),
        ('IN_REVIEW', 'In Review'),
        ('RESOLVED', 'Resolved'),
        ('REJECTED', 'Rejected'),
    )
    COMPLAINT_TYPE_CHOICES = (
        ('EMERGENCY_DELAY', 'Mechanic Not Arriving On Time'),
        ('SERVICE_QUALITY', 'Poor Service Quality'),
        ('PAYMENT_ISSUE', 'Payment Dispute'),
        ('OTHER', 'Other'),
    )

    booking = models.ForeignKey(Booking, on_delete=models.CASCADE, related_name='booking_complaints')
    customer = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='complaints_filed'
    )
    complaint_type = models.CharField(max_length=20, choices=COMPLAINT_TYPE_CHOICES, default='EMERGENCY_DELAY')
    complaint_text = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    admin_response = models.TextField(blank=True, null=True)
    resolved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='complaints_resolved'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    resolved_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Complaint for Booking #{self.booking.booking_id} - {self.status}"


class ChatMessage(models.Model):
    """Chat messages between customer and mechanic for a booking"""
    booking = models.ForeignKey(Booking, on_delete=models.CASCADE, related_name='chat_messages')
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='sent_chat_messages'
    )
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"Chat #{self.id} on Booking #{self.booking.booking_id} by {self.sender.username}"

