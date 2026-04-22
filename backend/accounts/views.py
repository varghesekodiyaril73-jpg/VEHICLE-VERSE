import threading
from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.shortcuts import get_object_or_404
from django.core.mail import send_mail
from django.conf import settings

from .models import User, MechanicProfile, AdminProfile
from .serializers import (
    UserSerializer, MechanicProfileSerializer, AdminProfileSerializer,
    CustomerRegistrationSerializer, MechanicRegistrationSerializer,
    AdminRegistrationSerializer, LoginSerializer, MechanicApprovalSerializer,
    MechanicPublicDetailSerializer
)


def send_welcome_email(user):
    """Send a welcome email to a newly registered customer."""
    subject = 'Welcome to VehicleVerse! 🚗'
    message = (
        f"Hi {user.first_name or user.username},\n\n"
        f"Welcome to VehicleVerse — your one-stop platform for all vehicle service needs!\n\n"
        f"With VehicleVerse you can:\n"
        f"  • Browse and book trusted, verified mechanics near you\n"
        f"  • Schedule regular maintenance or request emergency roadside assistance\n"
        f"  • Track your bookings and service history in real time\n"
        f"  • Rate and review mechanics to help the community\n"
        f"  • Chat directly with your assigned mechanic\n\n"
        f"We're thrilled to have you on board. If you ever need help, our support team "
        f"is just a click away.\n\n"
        f"Drive safe and welcome aboard!\n"
        f"— The VehicleVerse Team"
    )
    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=False,
        )
    except Exception as e:
        # Log the error but don't break registration
        print(f"[EMAIL ERROR] Failed to send welcome email to {user.email}: {e}")


def send_mechanic_pending_email(user):
    """Send an email to a newly registered mechanic informing them their request is pending."""
    subject = 'VehicleVerse — Registration Request Received ✅'
    message = (
        f"Hi {user.first_name or user.username},\n\n"
        f"Thank you for registering as a mechanic on VehicleVerse!\n\n"
        f"Your registration request has been submitted successfully and is now "
        f"waiting for approval from our admin team.\n\n"
        f"Here's what happens next:\n"
        f"  • Our admin will review your profile and proof documents\n"
        f"  • You'll receive an email once a decision has been made\n"
        f"  • Once approved, you can start accepting service bookings!\n\n"
        f"This process usually takes 1–2 business days. We appreciate your patience.\n\n"
        f"Best regards,\n"
        f"— The VehicleVerse Team"
    )
    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=False,
        )
    except Exception as e:
        print(f"[EMAIL ERROR] Failed to send mechanic pending email to {user.email}: {e}")


def send_mechanic_approval_email(mechanic_profile):
    """Send an email to the mechanic after admin approves or declines their account."""
    user = mechanic_profile.user
    status_val = mechanic_profile.approval_status  # 'APPROVED' or 'REJECTED'

    if status_val == 'APPROVED':
        subject = 'VehicleVerse — Your Account Has Been Approved! 🎉'
        message = (
            f"Hi {user.first_name or user.username},\n\n"
            f"Great news! Your mechanic account on VehicleVerse has been APPROVED.\n\n"
            f"You can now:\n"
            f"  • Log in to your mechanic dashboard\n"
            f"  • Set your availability and start accepting bookings\n"
            f"  • Chat with customers and manage your services\n\n"
            f"Welcome aboard — we're excited to have you on the team!\n\n"
            f"Best regards,\n"
            f"— The VehicleVerse Team"
        )
    else:
        subject = 'VehicleVerse — Account Application Update'
        message = (
            f"Hi {user.first_name or user.username},\n\n"
            f"We regret to inform you that your mechanic registration on VehicleVerse "
            f"has been declined after review.\n\n"
            f"This could be due to incomplete documents or information that could not "
            f"be verified. If you believe this was a mistake, please feel free to "
            f"contact our support team for further assistance.\n\n"
            f"Thank you for your interest in VehicleVerse.\n\n"
            f"Best regards,\n"
            f"— The VehicleVerse Team"
        )

    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=False,
        )
    except Exception as e:
        print(f"[EMAIL ERROR] Failed to send approval email to {user.email}: {e}")


class CustomerRegistrationView(generics.CreateAPIView):
    """
    Register a new customer account.
    POST /api/accounts/register/customer/
    """
    serializer_class = CustomerRegistrationSerializer
    permission_classes = [permissions.AllowAny]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Send welcome email in background thread (won't slow down the response)
        threading.Thread(target=send_welcome_email, args=(user,)).start()
        
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'message': 'Customer registered successfully!',
            'user': UserSerializer(user, context={'request': request}).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        }, status=status.HTTP_201_CREATED)


class MechanicRegistrationView(generics.CreateAPIView):
    """
    Register a new mechanic account with proof document.
    POST /api/accounts/register/mechanic/
    """
    serializer_class = MechanicRegistrationSerializer
    permission_classes = [permissions.AllowAny]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Send pending approval email in background thread
        threading.Thread(target=send_mechanic_pending_email, args=(user,)).start()
        
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'message': 'Mechanic registered successfully! Your account is pending approval.',
            'user': UserSerializer(user, context={'request': request}).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        }, status=status.HTTP_201_CREATED)


class AdminRegistrationView(generics.CreateAPIView):
    """
    Register a new admin account.
    POST /api/accounts/register/admin/
    """
    serializer_class = AdminRegistrationSerializer
    permission_classes = [permissions.AllowAny]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'message': 'Admin registered successfully!',
            'user': UserSerializer(user, context={'request': request}).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        }, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    """
    User login endpoint.
    POST /api/accounts/login/
    """
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = serializer.validated_data['user']
        refresh = RefreshToken.for_user(user)
        
        # Get role-specific profile data
        profile_data = None
        if user.user_role == 'MECHANIC':
            try:
                profile = user.mechanic_profile
                profile_data = MechanicProfileSerializer(profile, context={'request': request}).data
            except MechanicProfile.DoesNotExist:
                pass
        elif user.user_role == 'ADMIN':
            try:
                profile = user.admin_profile
                profile_data = AdminProfileSerializer(profile, context={'request': request}).data
            except AdminProfile.DoesNotExist:
                pass
        
        return Response({
            'message': 'Login successful!',
            'user': UserSerializer(user, context={'request': request}).data,
            'profile': profile_data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        })


class UserProfileView(generics.RetrieveUpdateAPIView):
    """
    Get or update current user's profile.
    GET/PUT/PATCH /api/accounts/profile/
    """
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        return self.request.user
    
    def retrieve(self, request, *args, **kwargs):
        user = self.get_object()
        user_data = self.get_serializer(user).data
        
        # Get role-specific profile
        profile_data = None
        if user.user_role == 'MECHANIC':
            try:
                profile = user.mechanic_profile
                profile_data = MechanicProfileSerializer(profile, context={'request': request}).data
            except MechanicProfile.DoesNotExist:
                pass
        elif user.user_role == 'ADMIN':
            try:
                profile = user.admin_profile
                profile_data = AdminProfileSerializer(profile, context={'request': request}).data
            except AdminProfile.DoesNotExist:
                pass
        
        return Response({
            'user': user_data,
            'profile': profile_data
        })


class MechanicListView(generics.ListAPIView):
    """
    List all mechanics (for admin).
    GET /api/accounts/mechanics/
    """
    serializer_class = MechanicProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = MechanicProfile.objects.select_related('user').all()
        
        # Filter by approval status if provided
        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            queryset = queryset.filter(approval_status=status_filter.upper())
        
        return queryset.order_by('-created_at')


class MechanicDetailView(generics.RetrieveAPIView):
    """
    Get a specific mechanic's details including proof.
    GET /api/accounts/mechanics/<id>/
    """
    serializer_class = MechanicProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = MechanicProfile.objects.select_related('user').all()


class MechanicApprovalView(generics.UpdateAPIView):
    """
    Approve or reject a mechanic.
    PATCH /api/accounts/mechanics/<id>/approve/
    """
    serializer_class = MechanicApprovalSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = MechanicProfile.objects.all()
    
    def update(self, request, *args, **kwargs):
        # Check if user is admin
        if request.user.user_role != 'ADMIN':
            return Response(
                {'error': 'Only admins can approve mechanics.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        # Send approval/decline email in background thread
        threading.Thread(target=send_mechanic_approval_email, args=(instance,)).start()
        
        # Return full mechanic profile
        return Response({
            'message': f'Mechanic {instance.approval_status.lower()} successfully!',
            'mechanic': MechanicProfileSerializer(instance, context={'request': request}).data
        })


class UserListView(generics.ListAPIView):
    """
    List all users (for admin).
    GET /api/accounts/users/
    """
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.user_role != 'ADMIN':
            return User.objects.none()
        
        queryset = User.objects.all()
        
        # Filter by role if provided
        role_filter = self.request.query_params.get('role', None)
        if role_filter:
            queryset = queryset.filter(user_role=role_filter.upper())
        
        return queryset.order_by('-created_at')


class PublicMechanicListView(generics.ListAPIView):
    """
    List approved mechanics for customers to view.
    GET /api/accounts/mechanics/public/
    Query params:
        - active_only: true/false (default: true) - filter by availability
    """
    serializer_class = MechanicProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        # Only show APPROVED mechanics
        queryset = MechanicProfile.objects.select_related('user').filter(
            approval_status='APPROVED'
        )
        
        # Filter by availability (default: show only available)
        active_only = self.request.query_params.get('active_only', 'true').lower()
        if active_only == 'true':
            queryset = queryset.filter(is_available=True)
        
        return queryset.order_by('-avg_rating', '-created_at')


class MechanicAvailabilityView(APIView):
    """
    Toggle mechanic availability status.
    PATCH /api/accounts/mechanics/availability/
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def patch(self, request):
        # Only mechanics can update their availability
        if request.user.user_role != 'MECHANIC':
            return Response(
                {'error': 'Only mechanics can update availability'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            profile = request.user.mechanic_profile
        except MechanicProfile.DoesNotExist:
            return Response(
                {'error': 'Mechanic profile not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Get the new availability status
        is_available = request.data.get('is_available')
        if is_available is None:
            return Response(
                {'error': 'is_available field is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        profile.is_available = is_available
        profile.save()
        
        return Response({
            'message': f'Availability updated to {"Available" if is_available else "Busy"}',
            'is_available': profile.is_available
        })


class MechanicPublicDetailView(generics.RetrieveAPIView):
    """
    Get a specific approved mechanic's public profile with reviews.
    GET /api/accounts/mechanics/public/<id>/
    """
    serializer_class = MechanicPublicDetailSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        # Only show APPROVED mechanics publicly
        return MechanicProfile.objects.select_related('user').filter(
            approval_status='APPROVED'
        )
