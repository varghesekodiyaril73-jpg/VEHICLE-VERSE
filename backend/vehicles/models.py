from django.db import models
from django.conf import settings

class Vehicle(models.Model):
    TYPE_CHOICES = (
        ('CAR', 'Car'),
        ('BIKE', 'Bike'),
        ('SCOOTER', 'Scooter'),
        ('OTHER', 'Other'),
    )

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='vehicles')
    vehicle_name = models.CharField(max_length=100, help_text="Friendly name e.g. Dad's Car")
    vehicle_type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    vehicle_brand = models.CharField(max_length=50)
    vehicle_model = models.CharField(max_length=50)
    registration_no = models.CharField(max_length=20, unique=True)
    vehicle_year = models.IntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.vehicle_name} ({self.registration_no})"

class Address(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='addresses')
    address_line = models.TextField()
    address_landmark = models.CharField(max_length=100, blank=True, null=True)
    state = models.CharField(max_length=100)
    district = models.CharField(max_length=100)
    place = models.CharField(max_length=100)
    pincode = models.CharField(max_length=10, blank=True, null=True)
    is_default = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.place}, {self.district}"
