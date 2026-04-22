from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from django.core.validators import RegexValidator
import re
from .models import User, MechanicProfile, AdminProfile


# ── Shared validation helpers ──

phone_validator = RegexValidator(
    regex=r'^\d{10}$',
    message='Phone number must be exactly 10 digits.'
)

def validate_name_field(value, field_label='Name'):
    """Validate name fields: letters only, min 2 characters, auto-capitalize."""
    if not value or len(value.strip()) < 2:
        raise serializers.ValidationError(f"{field_label} must be at least 2 characters.")
    if not re.match(r'^[a-zA-Z\s]+$', value.strip()):
        raise serializers.ValidationError(f"{field_label} must contain only letters.")
    # Auto-capitalize each word
    return value.strip().title()

def validate_email_format(value):
    """Strict email format validation."""
    email_regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    if not re.match(email_regex, value):
        raise serializers.ValidationError("Please enter a valid email address (e.g., user@example.com).")
    return value.lower().strip()

def validate_username_format(value):
    """Username: alphanumeric + underscore, 3-30 chars."""
    if len(value) < 3:
        raise serializers.ValidationError("Username must be at least 3 characters.")
    if len(value) > 30:
        raise serializers.ValidationError("Username must be at most 30 characters.")
    if not re.match(r'^[a-zA-Z0-9_]+$', value):
        raise serializers.ValidationError("Username can only contain letters, numbers, and underscores.")
    return value.strip()


class RegistrationValidationMixin:
    """Shared validation for all registration serializers."""
    
    def validate_first_name(self, value):
        return validate_name_field(value, 'First name')
    
    def validate_last_name(self, value):
        return validate_name_field(value, 'Last name')
    
    def validate_email(self, value):
        value = validate_email_format(value)
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("An account with this email already exists.")
        return value
    
    def validate_username(self, value):
        return validate_username_format(value)
    
    def validate_phone(self, value):
        if value:
            cleaned = re.sub(r'[\s\-\(\)\+]', '', value)
            if not re.match(r'^\d{10}$', cleaned):
                raise serializers.ValidationError("Phone number must be exactly 10 digits.")
            return cleaned
        return value


class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model with photo support"""
    photo_url = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'user_role', 'phone', 'photo', 'photo_url',
            'state', 'district', 'place', 'address_line',
            'created_at'
        ]
        read_only_fields = ['id', 'created_at', 'photo_url']
    
    def get_photo_url(self, obj):
        if obj.photo:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.photo.url)
            return obj.photo.url
        return None


class MechanicProfileSerializer(serializers.ModelSerializer):
    """Serializer for MechanicProfile with proof document"""
    user = UserSerializer(read_only=True)
    proof_url = serializers.SerializerMethodField()
    
    class Meta:
        model = MechanicProfile
        fields = [
            'id', 'user', 'proof', 'proof_url', 'approval_status',
            'min_service_fee', 'min_breakdown_fee', 'avg_rating',
            'is_available', 'location_lat', 'location_lng',
            'manufacturer_partner', 'service_centre_place', 'service_centre_state',
            'created_at'
        ]
        read_only_fields = ['id', 'created_at', 'proof_url', 'avg_rating']
    
    def get_proof_url(self, obj):
        if obj.proof:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.proof.url)
            return obj.proof.url
        return None


class AdminProfileSerializer(serializers.ModelSerializer):
    """Serializer for AdminProfile"""
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = AdminProfile
        fields = ['id', 'user', 'notes']


# Registration Serializers

class CustomerRegistrationSerializer(RegistrationValidationMixin, serializers.ModelSerializer):
    """Serializer for Customer registration"""
    password = serializers.CharField(write_only=True, validators=[validate_password])
    confirm_password = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = [
            'username', 'email', 'password', 'confirm_password',
            'first_name', 'last_name', 'phone', 'photo',
            'state', 'district', 'place', 'address_line'
        ]
    
    def validate(self, attrs):
        if attrs['password'] != attrs['confirm_password']:
            raise serializers.ValidationError({"confirm_password": "Passwords do not match."})
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('confirm_password')
        validated_data['user_role'] = 'CUSTOMER'
        
        user = User.objects.create_user(**validated_data)
        return user


class MechanicRegistrationSerializer(RegistrationValidationMixin, serializers.ModelSerializer):
    """Serializer for Mechanic registration with proof upload"""
    password = serializers.CharField(write_only=True, validators=[validate_password])
    confirm_password = serializers.CharField(write_only=True)
    proof = serializers.FileField(required=True)
    min_service_fee = serializers.DecimalField(max_digits=10, decimal_places=2, required=False, default=0)
    min_breakdown_fee = serializers.DecimalField(max_digits=10, decimal_places=2, required=False, default=0)
    manufacturer_partner = serializers.CharField(required=False, allow_blank=True, default='')
    service_centre_place = serializers.CharField(required=False, allow_blank=True, default='')
    service_centre_state = serializers.CharField(required=False, allow_blank=True, default='')

    class Meta:
        model = User
        fields = [
            'username', 'email', 'password', 'confirm_password',
            'first_name', 'last_name', 'phone', 'photo',
            'state', 'district', 'place', 'address_line',
            'proof', 'min_service_fee', 'min_breakdown_fee',
            'manufacturer_partner', 'service_centre_place', 'service_centre_state'
        ]
    
    def validate(self, attrs):
        if attrs['password'] != attrs['confirm_password']:
            raise serializers.ValidationError({"confirm_password": "Passwords do not match."})
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('confirm_password')
        proof = validated_data.pop('proof')
        min_service_fee = validated_data.pop('min_service_fee', 0)
        min_breakdown_fee = validated_data.pop('min_breakdown_fee', 0)
        manufacturer_partner = validated_data.pop('manufacturer_partner', '')
        service_centre_place = validated_data.pop('service_centre_place', '')
        service_centre_state = validated_data.pop('service_centre_state', '')

        validated_data['user_role'] = 'MECHANIC'
        user = User.objects.create_user(**validated_data)

        # Create mechanic profile
        MechanicProfile.objects.create(
            user=user,
            proof=proof,
            min_service_fee=min_service_fee,
            min_breakdown_fee=min_breakdown_fee,
            manufacturer_partner=manufacturer_partner,
            service_centre_place=service_centre_place,
            service_centre_state=service_centre_state,
            approval_status='PENDING'
        )

        return user


class AdminRegistrationSerializer(RegistrationValidationMixin, serializers.ModelSerializer):
    """Serializer for Admin registration"""
    password = serializers.CharField(write_only=True, validators=[validate_password])
    confirm_password = serializers.CharField(write_only=True)
    notes = serializers.CharField(required=False, allow_blank=True)
    
    class Meta:
        model = User
        fields = [
            'username', 'email', 'password', 'confirm_password',
            'first_name', 'last_name', 'phone', 'photo',
            'state', 'district', 'place', 'address_line', 'notes'
        ]
    
    def validate(self, attrs):
        if attrs['password'] != attrs['confirm_password']:
            raise serializers.ValidationError({"confirm_password": "Passwords do not match."})
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('confirm_password')
        notes = validated_data.pop('notes', '')

        validated_data['user_role'] = 'ADMIN'
        validated_data['is_staff'] = True  # Admin users get staff access
        user = User.objects.create_user(**validated_data)

        # Create admin profile
        AdminProfile.objects.create(user=user, notes=notes)

        return user


class LoginSerializer(serializers.Serializer):
    """Serializer for user login"""
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)
    
    def validate(self, attrs):
        username = attrs.get('username')
        password = attrs.get('password')
        
        if username and password:
            user = authenticate(username=username, password=password)
            
            if not user:
                raise serializers.ValidationError("Invalid credentials. Please try again.")
            
            if user.user_inactive:
                raise serializers.ValidationError("This account has been deactivated.")
            
            # Check if mechanic is approved
            if user.user_role == 'MECHANIC':
                try:
                    mechanic_profile = user.mechanic_profile
                    if mechanic_profile.approval_status == 'PENDING':
                        raise serializers.ValidationError("Your account is pending approval.")
                    elif mechanic_profile.approval_status == 'REJECTED':
                        raise serializers.ValidationError("Your account has been rejected.")
                    elif mechanic_profile.approval_status == 'BLOCKED':
                        raise serializers.ValidationError("Your account has been blocked.")
                except MechanicProfile.DoesNotExist:
                    pass
            
            attrs['user'] = user
        else:
            raise serializers.ValidationError("Both username and password are required.")
        
        return attrs


class MechanicApprovalSerializer(serializers.ModelSerializer):
    """Serializer for approving/rejecting mechanics"""
    class Meta:
        model = MechanicProfile
        fields = ['approval_status']
    
    def validate_approval_status(self, value):
        if value not in ['APPROVED', 'REJECTED', 'BLOCKED']:
            raise serializers.ValidationError("Invalid approval status.")
        return value


class MechanicReviewSerializer(serializers.Serializer):
    """Serializer for displaying reviews on mechanic profile"""
    id = serializers.IntegerField()
    customer_name = serializers.SerializerMethodField()
    rating = serializers.IntegerField()
    review_text = serializers.CharField()
    created_at = serializers.DateTimeField()
    
    def get_customer_name(self, obj):
        return f"{obj.customer.first_name} {obj.customer.last_name}".strip() or obj.customer.username


class MechanicPublicDetailSerializer(serializers.ModelSerializer):
    """Serializer for public mechanic profile with reviews"""
    user = UserSerializer(read_only=True)
    reviews = serializers.SerializerMethodField()
    total_reviews = serializers.SerializerMethodField()
    
    class Meta:
        model = MechanicProfile
        fields = [
            'id', 'user', 'approval_status',
            'min_service_fee', 'min_breakdown_fee', 'avg_rating',
            'is_available', 'created_at', 'reviews', 'total_reviews'
        ]
    
    def get_reviews(self, obj):
        from bookings.models import Review
        reviews = Review.objects.filter(mechanic=obj.user).order_by('-created_at')
        return MechanicReviewSerializer(reviews, many=True).data
    
    def get_total_reviews(self, obj):
        from bookings.models import Review
        return Review.objects.filter(mechanic=obj.user).count()
