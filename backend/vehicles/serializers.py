from rest_framework import serializers
from .models import Vehicle


class VehicleSerializer(serializers.ModelSerializer):
    """Serializer for Vehicle model - CRUD operations for customer vehicles"""
    
    class Meta:
        model = Vehicle
        fields = [
            'id', 'vehicle_name', 'vehicle_type', 'vehicle_brand',
            'vehicle_model', 'registration_no', 'vehicle_year', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']
    
    def validate_registration_no(self, value):
        """Ensure registration number is unique (excluding current instance on update)"""
        instance = getattr(self, 'instance', None)
        queryset = Vehicle.objects.filter(registration_no=value)
        
        if instance:
            queryset = queryset.exclude(pk=instance.pk)
        
        if queryset.exists():
            raise serializers.ValidationError("A vehicle with this registration number already exists.")
        
        return value.upper()  # Normalize to uppercase
