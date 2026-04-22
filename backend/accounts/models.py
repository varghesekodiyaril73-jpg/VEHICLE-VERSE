from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    ROLE_CHOICES = (
        ('ADMIN', 'Admin'),
        ('MECHANIC', 'Mechanic'),
        ('CUSTOMER', 'Customer'),
    )

    user_role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    phone = models.CharField(max_length=15, blank=True, null=True)
    photo = models.ImageField(upload_to='user_photos/', blank=True, null=True)
    
    # Address details
    state = models.CharField(max_length=100, blank=True, null=True)
    district = models.CharField(max_length=100, blank=True, null=True)
    place = models.CharField(max_length=100, blank=True, null=True)
    address_line = models.TextField(blank=True, null=True)
    
    user_inactive = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    # Resolving conflict with default auth.User groups/permissions
    groups = models.ManyToManyField(
        'auth.Group',
        related_name='custom_user_set',
        blank=True,
        help_text='The groups this user belongs to.',
        verbose_name='groups',
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        related_name='custom_user_set',
        blank=True,
        help_text='Specific permissions for this user.',
        verbose_name='user permissions',
    )

    def __str__(self):
        return self.username

class MechanicProfile(models.Model):
    APPROVAL_STATUS = (
        ('PENDING', 'Pending'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
        ('BLOCKED', 'Blocked'),
    )

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='mechanic_profile')
    proof = models.FileField(upload_to='mechanic_proofs/', blank=True, null=True)
    approval_status = models.CharField(max_length=20, choices=APPROVAL_STATUS, default='PENDING')
    min_service_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    min_breakdown_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    avg_rating = models.DecimalField(max_digits=3, decimal_places=1, default=0.0)
    is_available = models.BooleanField(default=True)
    
    # Location (Lat/Lng)
    location_lat = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    location_lng = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)

    # Official Manufacturer Service Centre Partner
    manufacturer_partner = models.CharField(max_length=100, blank=True, default='')
    service_centre_place = models.CharField(max_length=100, blank=True, default='')
    service_centre_state = models.CharField(max_length=100, blank=True, default='')

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Mechanic: {self.user.username}"

class AdminProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='admin_profile')
    notes = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"Admin: {self.user.username}"
