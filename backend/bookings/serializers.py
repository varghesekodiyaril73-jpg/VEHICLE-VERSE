from rest_framework import serializers
from django.utils import timezone
from datetime import timedelta
from .models import Booking, Payment, MechanicUpdate, Review, Complaint, ChatMessage, Bill
from vehicles.models import Vehicle, Address
from accounts.serializers import UserSerializer


class VehicleMinimalSerializer(serializers.ModelSerializer):
    """Minimal vehicle info for booking displays"""
    class Meta:
        model = Vehicle
        fields = ['id', 'vehicle_name', 'vehicle_type', 'vehicle_brand', 
                  'vehicle_model', 'registration_no']


class AddressSerializer(serializers.ModelSerializer):
    """Serializer for Address model"""
    class Meta:
        model = Address
        fields = ['id', 'address_line', 'address_landmark', 'state', 
                  'district', 'place', 'pincode', 'is_default']
        read_only_fields = ['id']


class PaymentSerializer(serializers.ModelSerializer):
    """Serializer for Payment model"""
    class Meta:
        model = Payment
        fields = ['id', 'booking', 'advance_amount', 'advance_status', 
                  'advance_paid_at', 'final_amount', 'final_status', 
                  'admin_commission_amount', 'mechanic_amount',
                  'payment_gateway_ref', 'created_at']
        read_only_fields = ['id', 'created_at', 'advance_paid_at']


class BillSerializer(serializers.ModelSerializer):
    """Serializer for Bill model"""
    bill_type_display = serializers.SerializerMethodField()

    class Meta:
        model = Bill
        fields = [
            'id', 'bill_number', 'booking', 'bill_type', 'bill_type_display',
            'total_amount', 'admin_commission_percent',
            'admin_commission_amount', 'mechanic_amount',
            'customer_name', 'customer_email',
            'mechanic_name', 'mechanic_email',
            'vehicle_name', 'service_type', 'service_details',
            'payment_method', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']

    def get_bill_type_display(self, obj):
        return obj.get_bill_type_display()


class EmergencyBookingSerializer(serializers.Serializer):
    """
    Serializer for creating emergency/breakdown bookings.
    Requires immediate payment of minimum ₹1500.
    """
    vehicle_id = serializers.IntegerField()
    district = serializers.CharField(max_length=100)
    place = serializers.CharField(max_length=100)
    service_details = serializers.CharField()
    payment_amount = serializers.DecimalField(max_digits=10, decimal_places=2, min_value=1500)
    
    # Optional: use saved address
    address_id = serializers.IntegerField(required=False, allow_null=True)
    
    def validate_vehicle_id(self, value):
        user = self.context['request'].user
        try:
            vehicle = Vehicle.objects.get(id=value, user=user)
        except Vehicle.DoesNotExist:
            raise serializers.ValidationError("Vehicle not found or doesn't belong to you.")
        return value
    
    def validate_payment_amount(self, value):
        if value < 1500:
            raise serializers.ValidationError("Minimum payment for emergency service is ₹1500.")
        return value
    
    def create(self, validated_data):
        user = self.context['request'].user
        vehicle = Vehicle.objects.get(id=validated_data['vehicle_id'])
        
        # Create the booking
        booking = Booking.objects.create(
            customer=user,
            vehicle=vehicle,
            service_type='BREAKDOWN',
            service_details=validated_data['service_details'],
            district=validated_data['district'],
            place=validated_data['place'],
            is_urgent=True,
            booking_status='PENDING'
        )
        
        # Create payment record with advance paid
        payment = Payment.objects.create(
            booking=booking,
            advance_amount=validated_data['payment_amount'],
            advance_status='PAID',
            advance_paid_at=timezone.now()
        )

        # Generate advance bill for emergency payment
        from .utils import create_bill
        create_bill(
            booking=booking,
            payment=payment,
            bill_type='ADVANCE',
            amount=validated_data['payment_amount'],
            payment_method='card',  # default for emergency
        )
        
        return booking


class RegularBookingSerializer(serializers.Serializer):
    """
    Serializer for creating regular/scheduled service bookings.
    Payment is done after mechanic accepts (₹1000 confirmation).
    """
    vehicle_id = serializers.IntegerField()
    district = serializers.CharField(max_length=100)
    place = serializers.CharField(max_length=100)
    address_line = serializers.CharField(required=False, allow_blank=True)
    service_category = serializers.CharField(max_length=50)
    service_details = serializers.CharField()
    scheduled_date = serializers.DateField()
    scheduled_time = serializers.TimeField()
    preferred_mechanic_id = serializers.IntegerField(required=False, allow_null=True)

    # Optional: use saved address
    use_registered_address = serializers.BooleanField(default=False)
    address_id = serializers.IntegerField(required=False, allow_null=True)
    
    def validate_vehicle_id(self, value):
        user = self.context['request'].user
        try:
            vehicle = Vehicle.objects.get(id=value, user=user)
        except Vehicle.DoesNotExist:
            raise serializers.ValidationError("Vehicle not found or doesn't belong to you.")
        return value
    
    def validate_scheduled_date(self, value):
        today = timezone.now().date()
        max_date = today + timedelta(days=60)  # 2 months
        
        if value < today:
            raise serializers.ValidationError("Cannot schedule for past dates.")
        if value > max_date:
            raise serializers.ValidationError("Can only schedule up to 2 months in advance.")
        return value
    
    def create(self, validated_data):
        from accounts.models import User
        user = self.context['request'].user
        vehicle = Vehicle.objects.get(id=validated_data['vehicle_id'])

        address = None
        if validated_data.get('use_registered_address') and validated_data.get('address_id'):
            try:
                address = Address.objects.get(id=validated_data['address_id'], user=user)
            except Address.DoesNotExist:
                pass

        # Resolve preferred mechanic
        preferred_mechanic = None
        pm_id = validated_data.get('preferred_mechanic_id')
        if pm_id:
            try:
                preferred_mechanic = User.objects.get(id=pm_id, user_role='MECHANIC')
            except User.DoesNotExist:
                pass

        # Create the booking
        booking = Booking.objects.create(
            customer=user,
            vehicle=vehicle,
            address=address,
            service_type='HOME_SERVICE',
            service_category=validated_data.get('service_category', ''),
            service_details=validated_data['service_details'],
            district=validated_data['district'],
            place=validated_data['place'],
            scheduled_date=validated_data['scheduled_date'],
            scheduled_time=validated_data['scheduled_time'],
            preferred_mechanic=preferred_mechanic,
            is_urgent=False,
            booking_status='PENDING'
        )

        # Create payment record (pending - paid after mechanic accepts)
        Payment.objects.create(
            booking=booking,
            advance_amount=1000,  # Confirmation amount
            advance_status='PENDING'
        )

        return booking


class BookingListSerializer(serializers.ModelSerializer):
    """Serializer for listing bookings with related data"""
    vehicle = VehicleMinimalSerializer(read_only=True)
    customer = UserSerializer(read_only=True)
    mechanic = UserSerializer(read_only=True)
    payment = PaymentSerializer(read_only=True)
    bills = BillSerializer(many=True, read_only=True)
    
    class Meta:
        model = Booking
        fields = [
            'booking_id', 'customer', 'vehicle', 'mechanic', 
            'service_type', 'service_category', 'service_details',
            'district', 'place', 'is_urgent', 'booking_status',
            'scheduled_date', 'scheduled_time',
            'created_at', 'accepted_at', 'completed_at',
            'payment', 'bills'
        ]


class JobListSerializer(serializers.ModelSerializer):
    """Serializer for mechanics viewing available jobs"""
    vehicle = VehicleMinimalSerializer(read_only=True)
    customer_name = serializers.SerializerMethodField()
    customer_phone = serializers.SerializerMethodField()
    payment_status = serializers.SerializerMethodField()
    
    class Meta:
        model = Booking
        fields = [
            'booking_id', 'vehicle', 'customer_name', 'customer_phone',
            'service_type', 'service_category', 'service_details',
            'district', 'place', 'is_urgent', 'booking_status',
            'scheduled_date', 'scheduled_time', 'created_at',
            'payment_status'
        ]
    
    def get_customer_name(self, obj):
        return f"{obj.customer.first_name} {obj.customer.last_name}".strip() or obj.customer.username
    
    def get_customer_phone(self, obj):
        return obj.customer.phone or "Not provided"
    
    def get_payment_status(self, obj):
        try:
            return obj.payment.advance_status
        except Payment.DoesNotExist:
            return 'PENDING'


class AcceptJobSerializer(serializers.Serializer):
    """Serializer for mechanic accepting a job"""
    
    def update(self, instance, validated_data):
        user = self.context['request'].user
        
        # Check if already assigned
        if instance.mechanic is not None:
            raise serializers.ValidationError("This job has already been accepted by another mechanic.")
        
        # Assign the mechanic
        instance.mechanic = user
        instance.booking_status = 'ASSIGNED'
        instance.accepted_at = timezone.now()
        instance.save()
        
        return instance


class ProcessPaymentSerializer(serializers.Serializer):
    """Serializer for processing payment"""
    amount = serializers.DecimalField(max_digits=10, decimal_places=2)
    payment_method = serializers.CharField(max_length=20)  # 'card' or 'upi'
    
    # Card fields (optional)
    card_number = serializers.CharField(max_length=19, required=False)
    card_name = serializers.CharField(max_length=100, required=False)
    card_expiry = serializers.CharField(max_length=5, required=False)
    card_cvv = serializers.CharField(max_length=3, required=False)
    
    # UPI fields (optional)
    upi_id = serializers.CharField(max_length=100, required=False)
    
    def validate(self, attrs):
        method = attrs.get('payment_method')
        
        if method == 'card':
            if not all([attrs.get('card_number'), attrs.get('card_name'), 
                       attrs.get('card_expiry'), attrs.get('card_cvv')]):
                raise serializers.ValidationError("All card details are required for card payment.")
        elif method == 'upi':
            if not attrs.get('upi_id'):
                raise serializers.ValidationError("UPI ID is required for UPI payment.")
        else:
            raise serializers.ValidationError("Invalid payment method. Use 'card' or 'upi'.")
        
        return attrs


class CompleteJobSerializer(serializers.Serializer):
    """Serializer for mechanic completing a job with final payment amount"""
    final_amount = serializers.DecimalField(max_digits=10, decimal_places=2, min_value=0)
    work_notes = serializers.CharField(required=False, allow_blank=True)
    
    def update(self, instance, validated_data):
        from .utils import create_bill
        user = self.context['request'].user
        
        # Verify mechanic owns this job
        if instance.mechanic != user:
            raise serializers.ValidationError("You can only complete jobs assigned to you.")
        
        # Verify job is in the right status
        if instance.booking_status not in ['ASSIGNED', 'IN_PROGRESS']:
            raise serializers.ValidationError("This job cannot be completed in its current state.")
        
        # Update booking
        instance.booking_status = 'COMPLETED'
        instance.completed_at = timezone.now()
        instance.save()
        
        # Update payment with final amount
        try:
            payment = instance.payment
            payment.final_amount = validated_data['final_amount']
            payment.final_status = 'PAID'
            payment.final_paid_at = timezone.now()
            payment.save()

            # Generate bill for the final payment
            create_bill(
                booking=instance,
                payment=payment,
                bill_type='FINAL',
                amount=validated_data['final_amount'],
                payment_method='cash',
            )
        except Payment.DoesNotExist:
            pass
        
        # Add mechanic update
        MechanicUpdate.objects.create(
            booking=instance,
            mechanic=user,
            update_status='WORK_COMPLETED',
            remarks=validated_data.get('work_notes', '')
        )
        
        return instance


class CancelJobByMechanicSerializer(serializers.Serializer):
    """Serializer for mechanic cancelling a job"""
    cancellation_reason = serializers.CharField()
    
    def update(self, instance, validated_data):
        user = self.context['request'].user
        
        # Verify mechanic owns this job
        if instance.mechanic != user:
            raise serializers.ValidationError("You can only cancel jobs assigned to you.")
        
        # Verify job can be cancelled
        if instance.booking_status not in ['ASSIGNED', 'IN_PROGRESS']:
            raise serializers.ValidationError("This job cannot be cancelled in its current state.")
        
        # Relist the job (remove mechanic, reset to PENDING)
        instance.mechanic = None
        instance.booking_status = 'PENDING'
        instance.cancellation_reason = validated_data['cancellation_reason']
        instance.cancelled_by = user
        instance.cancelled_at = timezone.now()
        instance.accepted_at = None
        instance.save()
        
        return instance


class CancelJobByCustomerSerializer(serializers.Serializer):
    """Serializer for customer cancelling a regular service booking"""
    cancellation_reason = serializers.CharField()
    
    def update(self, instance, validated_data):
        user = self.context['request'].user
        
        # Verify customer owns this booking
        if instance.customer != user:
            raise serializers.ValidationError("You can only cancel your own bookings.")
        
        # Only regular services can be cancelled through this endpoint
        if instance.service_type == 'BREAKDOWN':
            raise serializers.ValidationError("Use the emergency cancel endpoint for emergency bookings.")
        
        # Verify booking can be cancelled
        if instance.booking_status not in ['PENDING', 'ASSIGNED']:
            raise serializers.ValidationError("This booking cannot be cancelled in its current state.")
        
        # Update booking
        instance.booking_status = 'CANCELLED'
        instance.cancellation_reason = validated_data['cancellation_reason']
        instance.cancelled_by = user
        instance.cancelled_at = timezone.now()
        instance.save()
        
        # Handle refund
        try:
            payment = instance.payment
            if payment.advance_status == 'PAID':
                processing_fee = 50  # ₹50 processing fee
                refund_amount = float(payment.advance_amount) - processing_fee
                payment.refund_amount = max(0, refund_amount)
                payment.refund_processing_fee = processing_fee
                payment.advance_status = 'REFUNDED'
                payment.refunded_at = timezone.now()
                payment.save()
        except Payment.DoesNotExist:
            pass
        
        return instance


class CancelEmergencyBookingSerializer(serializers.Serializer):
    """Serializer for customer cancelling an emergency booking before mechanic accepts"""
    cancellation_reason = serializers.CharField()
    
    def update(self, instance, validated_data):
        user = self.context['request'].user
        
        # Verify customer owns this booking
        if instance.customer != user:
            raise serializers.ValidationError("You can only cancel your own bookings.")
        
        # Only emergency/breakdown bookings
        if instance.service_type != 'BREAKDOWN':
            raise serializers.ValidationError("This endpoint is only for emergency bookings.")
        
        # Can only cancel PENDING emergency bookings (no mechanic assigned yet)
        if instance.booking_status != 'PENDING':
            raise serializers.ValidationError(
                "Emergency bookings can only be cancelled before a mechanic accepts the job."
            )
        
        if instance.mechanic is not None:
            raise serializers.ValidationError(
                "A mechanic has already accepted this job. You cannot cancel now."
            )
        
        # Update booking
        instance.booking_status = 'CANCELLED'
        instance.cancellation_reason = validated_data['cancellation_reason']
        instance.cancelled_by = user
        instance.cancelled_at = timezone.now()
        instance.save()
        
        # Handle refund for emergency - full refund minus ₹100 processing fee
        try:
            payment = instance.payment
            if payment.advance_status == 'PAID':
                processing_fee = 100  # ₹100 processing fee for emergency
                refund_amount = float(payment.advance_amount) - processing_fee
                payment.refund_amount = max(0, refund_amount)
                payment.refund_processing_fee = processing_fee
                payment.advance_status = 'REFUNDED'
                payment.refunded_at = timezone.now()
                payment.save()
        except Payment.DoesNotExist:
            pass
        
        return instance


class ReviewSerializer(serializers.ModelSerializer):
    """Serializer for customer reviews"""
    customer_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Review
        fields = ['id', 'booking', 'customer', 'customer_name', 'mechanic', 
                  'rating', 'review_text', 'created_at']
        read_only_fields = ['id', 'customer', 'mechanic', 'created_at']
    
    def get_customer_name(self, obj):
        return f"{obj.customer.first_name} {obj.customer.last_name}".strip() or obj.customer.username
    
    def validate_rating(self, value):
        if value < 1 or value > 5:
            raise serializers.ValidationError("Rating must be between 1 and 5.")
        return value
    
    def create(self, validated_data):
        booking = validated_data['booking']
        user = self.context['request'].user
        
        # Verify customer owns this booking
        if booking.customer != user:
            raise serializers.ValidationError("You can only review your own bookings.")
        
        # Verify booking is completed
        if booking.booking_status != 'COMPLETED':
            raise serializers.ValidationError("You can only review completed bookings.")
        
        # Check if review already exists
        if hasattr(booking, 'review'):
            raise serializers.ValidationError("You have already reviewed this booking.")
        
        # Create review
        review = Review.objects.create(
            booking=booking,
            customer=user,
            mechanic=booking.mechanic,
            rating=validated_data['rating'],
            review_text=validated_data.get('review_text', '')
        )
        
        # Update mechanic's average rating
        from django.db.models import Avg
        from accounts.models import MechanicProfile
        
        mechanic_reviews = Review.objects.filter(mechanic=booking.mechanic)
        avg_rating = mechanic_reviews.aggregate(Avg('rating'))['rating__avg'] or 0.0
        
        try:
            mechanic_profile = MechanicProfile.objects.get(user=booking.mechanic)
            mechanic_profile.avg_rating = round(avg_rating, 1)
            mechanic_profile.save()
        except MechanicProfile.DoesNotExist:
            pass
        
        return review


class ComplaintSerializer(serializers.ModelSerializer):
    """Serializer for customer complaints"""
    customer_name = serializers.SerializerMethodField()
    complaint_type_display = serializers.SerializerMethodField()
    
    class Meta:
        model = Complaint
        fields = ['id', 'booking', 'customer', 'customer_name', 'complaint_type',
                  'complaint_type_display', 'complaint_text', 
                  'status', 'admin_response', 'created_at', 'resolved_at']
        read_only_fields = ['id', 'customer', 'status', 'admin_response', 'created_at', 'resolved_at']
    
    def get_customer_name(self, obj):
        return f"{obj.customer.first_name} {obj.customer.last_name}".strip() or obj.customer.username
    
    def get_complaint_type_display(self, obj):
        return obj.get_complaint_type_display()
    
    def create(self, validated_data):
        booking = validated_data['booking']
        user = self.context['request'].user
        
        # Verify customer owns this booking
        if booking.customer != user:
            raise serializers.ValidationError("You can only file complaints for your own bookings.")
        
        # Create complaint
        complaint = Complaint.objects.create(
            booking=booking,
            customer=user,
            complaint_type=validated_data.get('complaint_type', 'EMERGENCY_DELAY'),
            complaint_text=validated_data['complaint_text']
        )
        
        return complaint


class AdminComplaintSerializer(serializers.ModelSerializer):
    """Serializer for admin viewing complaints with full details"""
    customer_name = serializers.SerializerMethodField()
    customer_email = serializers.SerializerMethodField()
    customer_phone = serializers.SerializerMethodField()
    mechanic_name = serializers.SerializerMethodField()
    booking_id = serializers.SerializerMethodField()
    service_type = serializers.SerializerMethodField()
    resolved_by_name = serializers.SerializerMethodField()
    complaint_type_display = serializers.SerializerMethodField()
    
    class Meta:
        model = Complaint
        fields = [
            'id', 'booking', 'booking_id', 'service_type',
            'customer', 'customer_name', 'customer_email', 'customer_phone',
            'mechanic_name', 'complaint_type', 'complaint_type_display',
            'complaint_text', 'status', 
            'admin_response', 'resolved_by', 'resolved_by_name',
            'created_at', 'resolved_at'
        ]
    
    def get_customer_name(self, obj):
        return f"{obj.customer.first_name} {obj.customer.last_name}".strip() or obj.customer.username
    
    def get_customer_email(self, obj):
        return obj.customer.email
    
    def get_customer_phone(self, obj):
        return obj.customer.phone or "Not provided"
    
    def get_mechanic_name(self, obj):
        if obj.booking.mechanic:
            return f"{obj.booking.mechanic.first_name} {obj.booking.mechanic.last_name}".strip() or obj.booking.mechanic.username
        return "Not assigned"
    
    def get_booking_id(self, obj):
        return obj.booking.booking_id
    
    def get_service_type(self, obj):
        return obj.booking.service_type
    
    def get_resolved_by_name(self, obj):
        if obj.resolved_by:
            return f"{obj.resolved_by.first_name} {obj.resolved_by.last_name}".strip() or obj.resolved_by.username
        return None
    
    def get_complaint_type_display(self, obj):
        return obj.get_complaint_type_display()


class AdminComplaintUpdateSerializer(serializers.Serializer):
    """Serializer for admin updating complaint status"""
    status = serializers.ChoiceField(choices=['PENDING', 'IN_REVIEW', 'RESOLVED', 'REJECTED'])
    admin_response = serializers.CharField(required=False, allow_blank=True)


class ConfirmPaymentSerializer(serializers.Serializer):
    """Serializer for customer confirming/disputing final payment"""
    confirmed = serializers.BooleanField()
    customer_amount = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)
    
    def update(self, instance, validated_data):
        user = self.context['request'].user
        
        # Verify customer owns this booking
        if instance.customer != user:
            raise serializers.ValidationError("You can only confirm payments for your own bookings.")
        
        # Verify booking is completed
        if instance.booking_status != 'COMPLETED':
            raise serializers.ValidationError("Payment can only be confirmed for completed bookings.")
        
        try:
            payment = instance.payment
            
            if validated_data['confirmed']:
                # Customer confirms the amount
                payment.customer_confirmed = True
                payment.customer_confirmed_amount = payment.final_amount
                payment.customer_confirmed_at = timezone.now()
                payment.final_status = 'CONFIRMED'
            else:
                # Customer disputes - enter their amount
                if 'customer_amount' not in validated_data:
                    raise serializers.ValidationError("Please provide the amount you paid.")
                payment.customer_confirmed = False
                payment.customer_confirmed_amount = validated_data['customer_amount']
                payment.customer_confirmed_at = timezone.now()
                payment.final_status = 'DISPUTED'
            
            payment.save()
            
        except Payment.DoesNotExist:
            raise serializers.ValidationError("No payment record found for this booking.")
        
        return instance


class CustomerComplaintSerializer(serializers.ModelSerializer):
    """Serializer for customer viewing their own complaints with booking details"""
    booking_id = serializers.SerializerMethodField()
    vehicle_name = serializers.SerializerMethodField()
    service_type = serializers.SerializerMethodField()
    mechanic_name = serializers.SerializerMethodField()
    complaint_type_display = serializers.SerializerMethodField()
    
    class Meta:
        model = Complaint
        fields = [
            'id', 'booking', 'booking_id', 'vehicle_name', 'service_type', 
            'mechanic_name', 'complaint_type', 'complaint_type_display',
            'complaint_text', 'status', 
            'admin_response', 'created_at', 'resolved_at'
        ]
    
    def get_booking_id(self, obj):
        return obj.booking.booking_id
    
    def get_vehicle_name(self, obj):
        return obj.booking.vehicle.vehicle_name if obj.booking.vehicle else "N/A"
    
    def get_service_type(self, obj):
        return obj.booking.get_service_type_display()
    
    def get_mechanic_name(self, obj):
        if obj.booking.mechanic:
            return f"{obj.booking.mechanic.first_name} {obj.booking.mechanic.last_name}".strip() or obj.booking.mechanic.username
        return "Not assigned"
    
    def get_complaint_type_display(self, obj):
        return obj.get_complaint_type_display()


class CustomerReviewSerializer(serializers.ModelSerializer):
    """Serializer for customer viewing their own reviews with booking details"""
    booking_id = serializers.SerializerMethodField()
    vehicle_name = serializers.SerializerMethodField()
    service_type = serializers.SerializerMethodField()
    mechanic_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Review
        fields = [
            'id', 'booking', 'booking_id', 'vehicle_name', 'service_type', 
            'mechanic_name', 'rating', 'review_text', 'created_at'
        ]
    
    def get_booking_id(self, obj):
        return obj.booking.booking_id
    
    def get_vehicle_name(self, obj):
        return obj.booking.vehicle.vehicle_name if obj.booking.vehicle else "N/A"
    
    def get_service_type(self, obj):
        return obj.booking.get_service_type_display()
    
    def get_mechanic_name(self, obj):
        if obj.mechanic:
            return f"{obj.mechanic.first_name} {obj.mechanic.last_name}".strip() or obj.mechanic.username
        return "Not assigned"


class MechanicAssignedJobSerializer(serializers.ModelSerializer):
    """Serializer for mechanic's assigned jobs (My Jobs)"""
    vehicle = VehicleMinimalSerializer(read_only=True)
    customer_name = serializers.SerializerMethodField()
    customer_phone = serializers.SerializerMethodField()
    payment = PaymentSerializer(read_only=True)
    bills = BillSerializer(many=True, read_only=True)
    has_review = serializers.SerializerMethodField()
    
    class Meta:
        model = Booking
        fields = [
            'booking_id', 'vehicle', 'customer_name', 'customer_phone',
            'service_type', 'service_category', 'service_details',
            'district', 'place', 'is_urgent', 'booking_status',
            'scheduled_date', 'scheduled_time', 
            'created_at', 'accepted_at', 'completed_at',
            'payment', 'bills', 'has_review'
        ]
    
    def get_customer_name(self, obj):
        return f"{obj.customer.first_name} {obj.customer.last_name}".strip() or obj.customer.username
    
    def get_customer_phone(self, obj):
        return obj.customer.phone or "Not provided"
    
    def get_has_review(self, obj):
        return hasattr(obj, 'review')


class ChatMessageSerializer(serializers.ModelSerializer):
    """Serializer for chat messages between customer and mechanic"""
    sender_name = serializers.SerializerMethodField()
    sender_role = serializers.SerializerMethodField()

    class Meta:
        model = ChatMessage
        fields = ['id', 'booking', 'sender', 'sender_name', 'sender_role',
                  'message', 'is_read', 'created_at']
        read_only_fields = ['id', 'sender', 'is_read', 'created_at']

    def get_sender_name(self, obj):
        return f"{obj.sender.first_name} {obj.sender.last_name}".strip() or obj.sender.username

    def get_sender_role(self, obj):
        return obj.sender.user_role

