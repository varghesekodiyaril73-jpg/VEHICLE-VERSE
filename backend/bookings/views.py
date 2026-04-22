from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils import timezone
from django.db.models import Case, When, Value, IntegerField, Q

from .models import Booking, Payment, Review, Complaint, ChatMessage, Bill
from .serializers import (
    EmergencyBookingSerializer, RegularBookingSerializer,
    BookingListSerializer, JobListSerializer,
    AcceptJobSerializer, ProcessPaymentSerializer,
    CompleteJobSerializer, CancelJobByMechanicSerializer,
    CancelJobByCustomerSerializer, CancelEmergencyBookingSerializer,
    ReviewSerializer,
    ComplaintSerializer, ConfirmPaymentSerializer,
    MechanicAssignedJobSerializer, AdminComplaintSerializer,
    AdminComplaintUpdateSerializer, CustomerComplaintSerializer,
    CustomerReviewSerializer, ChatMessageSerializer, BillSerializer
)


class EmergencyBookingCreateView(APIView):
    """
    Create an emergency/breakdown booking with immediate payment.
    POST /api/bookings/emergency/
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        # Only customers can create bookings
        if request.user.user_role != 'CUSTOMER':
            return Response(
                {'error': 'Only customers can create bookings.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = EmergencyBookingSerializer(
            data=request.data, 
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        booking = serializer.save()
        
        return Response({
            'message': 'Emergency booking created successfully!',
            'booking': BookingListSerializer(booking).data
        }, status=status.HTTP_201_CREATED)


class RegularBookingCreateView(APIView):
    """
    Create a regular/scheduled service booking.
    POST /api/bookings/regular/
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        if request.user.user_role != 'CUSTOMER':
            return Response(
                {'error': 'Only customers can create bookings.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = RegularBookingSerializer(
            data=request.data,
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        booking = serializer.save()
        
        return Response({
            'message': 'Service booking request submitted! You will be notified when a mechanic accepts.',
            'booking': BookingListSerializer(booking).data
        }, status=status.HTTP_201_CREATED)


class CustomerBookingsListView(generics.ListAPIView):
    """
    List all bookings for the authenticated customer.
    GET /api/bookings/
    """
    serializer_class = BookingListSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Booking.objects.filter(
            customer=self.request.user
        ).select_related('vehicle', 'mechanic', 'payment').prefetch_related('bills').order_by('-created_at')


class CustomerNotificationsView(APIView):
    """
    Get pending notifications for customer.
    Shows bookings where mechanic has accepted but customer hasn't paid confirmation.
    GET /api/bookings/notifications/
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        if request.user.user_role != 'CUSTOMER':
            return Response({'notifications': []})
        
        # Find regular bookings that are ASSIGNED but payment is PENDING
        pending_payments = Booking.objects.filter(
            customer=request.user,
            booking_status='ASSIGNED',
            service_type='HOME_SERVICE',
            payment__advance_status='PENDING'
        ).select_related('vehicle', 'mechanic', 'payment')
        
        notifications = []
        for booking in pending_payments:
            notifications.append({
                'type': 'PAYMENT_REQUIRED',
                'booking_id': booking.booking_id,
                'message': f'Mechanic accepted your booking for {booking.vehicle.vehicle_name}. Pay ₹1000 to confirm.',
                'vehicle_name': booking.vehicle.vehicle_name,
                'mechanic_name': f"{booking.mechanic.first_name} {booking.mechanic.last_name}".strip(),
                'amount': 1000
            })
        
        return Response({'notifications': notifications})


class AvailableEmergencyJobsView(generics.ListAPIView):
    """
    List available emergency jobs for mechanics.
    Sorted by district (mechanic's district first).
    GET /api/bookings/jobs/emergency/
    """
    serializer_class = JobListSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        
        if user.user_role != 'MECHANIC':
            return Booking.objects.none()
        
        # Get mechanic's district
        mechanic_district = user.district or ''
        
        # Get pending emergency bookings, prioritize same district
        queryset = Booking.objects.filter(
            service_type='BREAKDOWN',
            booking_status='PENDING',
            mechanic__isnull=True,
            payment__advance_status='PAID'  # Only show paid emergency bookings
        ).select_related('vehicle', 'customer', 'payment')
        
        # Annotate for sorting - same district first
        queryset = queryset.annotate(
            district_priority=Case(
                When(district__iexact=mechanic_district, then=Value(0)),
                default=Value(1),
                output_field=IntegerField()
            )
        ).order_by('district_priority', '-created_at')
        
        return queryset


class AvailableRegularJobsView(generics.ListAPIView):
    """
    List available regular service jobs for mechanics.
    Sorted by district (mechanic's district first).
    GET /api/bookings/jobs/regular/
    """
    serializer_class = JobListSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        
        if user.user_role != 'MECHANIC':
            return Booking.objects.none()
        
        mechanic_district = user.district or ''
        
        # Get pending regular service bookings
        queryset = Booking.objects.filter(
            service_type='HOME_SERVICE',
            booking_status='PENDING',
            mechanic__isnull=True
        ).select_related('vehicle', 'customer', 'payment')
        
        queryset = queryset.annotate(
            district_priority=Case(
                When(district__iexact=mechanic_district, then=Value(0)),
                default=Value(1),
                output_field=IntegerField()
            )
        ).order_by('district_priority', 'scheduled_date', 'scheduled_time')
        
        return queryset


class AcceptJobView(APIView):
    """
    Mechanic accepts a job.
    POST /api/bookings/<booking_id>/accept/
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, booking_id):
        user = request.user
        
        if user.user_role != 'MECHANIC':
            return Response(
                {'error': 'Only mechanics can accept jobs.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Check mechanic approval status
        try:
            if user.mechanic_profile.approval_status != 'APPROVED':
                return Response(
                    {'error': 'Your account must be approved to accept jobs.'},
                    status=status.HTTP_403_FORBIDDEN
                )
        except:
            return Response(
                {'error': 'Mechanic profile not found.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            booking = Booking.objects.get(booking_id=booking_id)
        except Booking.DoesNotExist:
            return Response(
                {'error': 'Booking not found.'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        if booking.mechanic is not None:
            return Response(
                {'error': 'This job has already been accepted by another mechanic.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if booking.booking_status != 'PENDING':
            return Response(
                {'error': 'This job is no longer available.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Accept the job
        booking.mechanic = user
        booking.booking_status = 'ASSIGNED'
        booking.accepted_at = timezone.now()
        booking.save()
        
        return Response({
            'message': 'Job accepted successfully!',
            'booking': BookingListSerializer(booking).data
        })


class ProcessPaymentView(APIView):
    """
    Process payment for a booking.
    POST /api/bookings/<booking_id>/pay/
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, booking_id):
        from .utils import create_bill
        user = request.user
        
        try:
            booking = Booking.objects.get(booking_id=booking_id, customer=user)
        except Booking.DoesNotExist:
            return Response(
                {'error': 'Booking not found.'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = ProcessPaymentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Get or create payment
        try:
            payment = booking.payment
        except Payment.DoesNotExist:
            payment = Payment.objects.create(booking=booking)
        
        # Process payment (dummy - just mark as paid)
        payment.advance_amount = serializer.validated_data['amount']
        payment.advance_status = 'PAID'
        payment.advance_paid_at = timezone.now()
        payment.payment_gateway_ref = f"DUMMY_{timezone.now().strftime('%Y%m%d%H%M%S')}"
        payment.save()

        # Generate advance payment bill
        payment_method = serializer.validated_data.get('payment_method', 'card')
        bill = create_bill(
            booking=booking,
            payment=payment,
            bill_type='ADVANCE',
            amount=serializer.validated_data['amount'],
            payment_method=payment_method,
        )
        
        return Response({
            'message': 'Payment successful!',
            'payment_ref': payment.payment_gateway_ref,
            'amount_paid': str(payment.advance_amount),
            'bill_number': bill.bill_number
        })


class MechanicJobsView(generics.ListAPIView):
    """
    List mechanic's accepted/active jobs.
    GET /api/bookings/my-jobs/
    """
    serializer_class = BookingListSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        
        if user.user_role != 'MECHANIC':
            return Booking.objects.none()
        
        return Booking.objects.filter(
            mechanic=user,
            booking_status__in=['ASSIGNED', 'IN_PROGRESS']
        ).select_related('vehicle', 'customer', 'payment').order_by('-accepted_at')


class MechanicAllJobsView(generics.ListAPIView):
    """
    List all mechanic's jobs including completed ones.
    GET /api/bookings/my-jobs/all/
    """
    serializer_class = MechanicAssignedJobSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        
        if user.user_role != 'MECHANIC':
            return Booking.objects.none()
        
        return Booking.objects.filter(
            mechanic=user
        ).select_related('vehicle', 'customer', 'payment').prefetch_related('bills').order_by('-accepted_at')


class CompleteJobView(APIView):
    """
    Mechanic marks a job as complete with final payment amount.
    POST /api/bookings/<booking_id>/complete/
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, booking_id):
        user = request.user
        
        if user.user_role != 'MECHANIC':
            return Response(
                {'error': 'Only mechanics can complete jobs.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            booking = Booking.objects.get(booking_id=booking_id, mechanic=user)
        except Booking.DoesNotExist:
            return Response(
                {'error': 'Booking not found or not assigned to you.'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = CompleteJobSerializer(
            booking, 
            data=request.data, 
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        booking = serializer.save()
        
        return Response({
            'message': 'Job completed successfully!',
            'booking': BookingListSerializer(booking).data
        })


class CancelJobByMechanicView(APIView):
    """
    Mechanic cancels a job (job gets relisted for other mechanics).
    POST /api/bookings/<booking_id>/mechanic-cancel/
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, booking_id):
        user = request.user
        
        if user.user_role != 'MECHANIC':
            return Response(
                {'error': 'Only mechanics can use this endpoint.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            booking = Booking.objects.get(booking_id=booking_id, mechanic=user)
        except Booking.DoesNotExist:
            return Response(
                {'error': 'Booking not found or not assigned to you.'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = CancelJobByMechanicSerializer(
            booking, 
            data=request.data, 
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        booking = serializer.save()
        
        return Response({
            'message': 'Job cancelled. It has been relisted for other mechanics.',
            'booking': BookingListSerializer(booking).data
        })


class CancelJobByCustomerView(APIView):
    """
    Customer cancels a regular service booking.
    POST /api/bookings/<booking_id>/customer-cancel/
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, booking_id):
        user = request.user
        
        try:
            booking = Booking.objects.get(booking_id=booking_id, customer=user)
        except Booking.DoesNotExist:
            return Response(
                {'error': 'Booking not found.'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = CancelJobByCustomerSerializer(
            booking, 
            data=request.data, 
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        booking = serializer.save()
        
        # Get refund info
        refund_info = None
        try:
            payment = booking.payment
            if payment.refund_amount:
                refund_info = {
                    'refund_amount': str(payment.refund_amount),
                    'processing_fee': str(payment.refund_processing_fee),
                    'message': f'₹{payment.refund_amount} will be refunded. ₹{payment.refund_processing_fee} processing fee deducted.'
                }
        except:
            pass
        
        return Response({
            'message': 'Booking cancelled successfully.',
            'refund': refund_info,
            'booking': BookingListSerializer(booking).data
        })


class CancelEmergencyBookingView(APIView):
    """
    Customer cancels an emergency booking before a mechanic accepts.
    POST /api/bookings/<booking_id>/emergency-cancel/
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, booking_id):
        user = request.user
        
        try:
            booking = Booking.objects.get(booking_id=booking_id, customer=user)
        except Booking.DoesNotExist:
            return Response(
                {'error': 'Booking not found.'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = CancelEmergencyBookingSerializer(
            booking, 
            data=request.data, 
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        booking = serializer.save()
        
        # Get refund info
        refund_info = None
        try:
            payment = booking.payment
            if payment.refund_amount:
                refund_info = {
                    'refund_amount': str(payment.refund_amount),
                    'processing_fee': str(payment.refund_processing_fee),
                    'message': f'₹{payment.refund_amount} will be refunded. ₹{payment.refund_processing_fee} processing fee deducted.'
                }
        except:
            pass
        
        return Response({
            'message': 'Emergency booking cancelled successfully.',
            'refund': refund_info,
            'booking': BookingListSerializer(booking).data
        })


class CreateReviewView(APIView):
    """
    Customer creates a review for a completed booking.
    POST /api/bookings/<booking_id>/review/
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, booking_id):
        user = request.user
        
        try:
            booking = Booking.objects.get(booking_id=booking_id, customer=user)
        except Booking.DoesNotExist:
            return Response(
                {'error': 'Booking not found.'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        data = request.data.copy()
        data['booking'] = booking.booking_id
        
        serializer = ReviewSerializer(data=data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        review = serializer.save()
        
        return Response({
            'message': 'Review submitted successfully!',
            'review': ReviewSerializer(review).data
        }, status=status.HTTP_201_CREATED)


class CreateComplaintView(APIView):
    """
    Customer files a complaint for a booking.
    POST /api/bookings/<booking_id>/complaint/
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, booking_id):
        user = request.user
        
        try:
            booking = Booking.objects.get(booking_id=booking_id, customer=user)
        except Booking.DoesNotExist:
            return Response(
                {'error': 'Booking not found.'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        data = request.data.copy()
        data['booking'] = booking.booking_id
        
        serializer = ComplaintSerializer(data=data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        complaint = serializer.save()
        
        return Response({
            'message': 'Complaint filed successfully. An admin will review shortly.',
            'complaint': ComplaintSerializer(complaint).data
        }, status=status.HTTP_201_CREATED)


class ConfirmPaymentView(APIView):
    """
    Customer confirms or disputes the final payment amount.
    POST /api/bookings/<booking_id>/confirm-payment/
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, booking_id):
        user = request.user
        
        try:
            booking = Booking.objects.get(booking_id=booking_id, customer=user)
        except Booking.DoesNotExist:
            return Response(
                {'error': 'Booking not found.'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = ConfirmPaymentSerializer(
            booking, 
            data=request.data, 
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        booking = serializer.save()
        
        # Get payment status
        payment_status = 'Unknown'
        try:
            payment_status = booking.payment.final_status
        except:
            pass
        
        return Response({
            'message': 'Payment status updated.',
            'payment_status': payment_status,
            'booking': BookingListSerializer(booking).data
        })


class AdminComplaintListView(generics.ListAPIView):
    """
    Admin view to list all complaints.
    GET /api/bookings/admin/complaints/
    Optional query params: status (PENDING, IN_REVIEW, RESOLVED, REJECTED)
    """
    serializer_class = AdminComplaintSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        
        if user.user_role != 'ADMIN':
            return Complaint.objects.none()
        
        queryset = Complaint.objects.all().select_related(
            'booking', 'booking__vehicle', 'booking__mechanic',
            'customer', 'resolved_by'
        )
        
        # Filter by status if provided
        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            queryset = queryset.filter(status=status_filter.upper())
        
        # Filter by complaint_type if provided
        type_filter = self.request.query_params.get('complaint_type', None)
        if type_filter:
            queryset = queryset.filter(complaint_type=type_filter.upper())
        
        return queryset.order_by('-created_at')


class AdminComplaintUpdateView(APIView):
    """
    Admin updates complaint status and response.
    PATCH /api/bookings/admin/complaints/<id>/
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def patch(self, request, complaint_id):
        user = request.user
        
        if user.user_role != 'ADMIN':
            return Response(
                {'error': 'Only admins can update complaints.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            complaint = Complaint.objects.get(id=complaint_id)
        except Complaint.DoesNotExist:
            return Response(
                {'error': 'Complaint not found.'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = AdminComplaintUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Update complaint
        complaint.status = serializer.validated_data['status']
        if serializer.validated_data.get('admin_response'):
            complaint.admin_response = serializer.validated_data['admin_response']
        
        if complaint.status in ['RESOLVED', 'REJECTED']:
            complaint.resolved_by = user
            complaint.resolved_at = timezone.now()
        
        complaint.save()
        
        return Response({
            'message': 'Complaint updated successfully.',
            'complaint': AdminComplaintSerializer(complaint).data
        })


class CustomerComplaintsListView(generics.ListAPIView):
    """
    List all complaints filed by the authenticated customer.
    GET /api/bookings/my-complaints/
    """
    serializer_class = CustomerComplaintSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Complaint.objects.filter(
            customer=self.request.user
        ).select_related('booking', 'booking__vehicle', 'booking__mechanic').order_by('-created_at')


class CustomerReviewsListView(generics.ListAPIView):
    """
    List all reviews given by the authenticated customer.
    GET /api/bookings/my-reviews/
    """
    serializer_class = CustomerReviewSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Review.objects.filter(
            customer=self.request.user
        ).select_related('booking', 'booking__vehicle', 'mechanic').order_by('-created_at')


class BookingMessagesView(APIView):
    """
    Get all chat messages for a booking.
    Also marks the other party's messages as read.
    GET /api/bookings/<booking_id>/messages/
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, booking_id):
        user = request.user

        try:
            booking = Booking.objects.get(booking_id=booking_id)
        except Booking.DoesNotExist:
            return Response(
                {'error': 'Booking not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Only the customer or assigned mechanic can view messages
        if user != booking.customer and user != booking.mechanic:
            return Response(
                {'error': 'You are not authorized to view messages for this booking.'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Get all messages
        messages = ChatMessage.objects.filter(booking=booking).select_related('sender')

        # Mark messages from the other party as read
        messages.exclude(sender=user).filter(is_read=False).update(is_read=True)

        serializer = ChatMessageSerializer(messages, many=True)

        # Count unread messages from other party
        unread_count = ChatMessage.objects.filter(
            booking=booking, is_read=False
        ).exclude(sender=user).count()

        return Response({
            'messages': serializer.data,
            'unread_count': unread_count
        })


class SendMessageView(APIView):
    """
    Send a chat message for a booking.
    POST /api/bookings/<booking_id>/messages/send/
    Body: { "message": "text" }
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, booking_id):
        user = request.user

        try:
            booking = Booking.objects.get(booking_id=booking_id)
        except Booking.DoesNotExist:
            return Response(
                {'error': 'Booking not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Only the customer or assigned mechanic can send messages
        if user != booking.customer and user != booking.mechanic:
            return Response(
                {'error': 'You are not authorized to send messages for this booking.'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Chat is only available when mechanic is assigned and booking is active
        if booking.booking_status not in ['ASSIGNED', 'IN_PROGRESS']:
            return Response(
                {'error': 'Chat is only available for active bookings (assigned or in progress).'},
                status=status.HTTP_400_BAD_REQUEST
            )

        message_text = request.data.get('message', '').strip()
        if not message_text:
            return Response(
                {'error': 'Message cannot be empty.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Create the message
        chat_message = ChatMessage.objects.create(
            booking=booking,
            sender=user,
            message=message_text
        )

        return Response({
            'message': ChatMessageSerializer(chat_message).data
        }, status=status.HTTP_201_CREATED)


class CustomerBillsListView(generics.ListAPIView):
    """
    List all bills for the authenticated customer.
    GET /api/bookings/bills/
    """
    serializer_class = BillSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Bill.objects.filter(
            booking__customer=self.request.user
        ).select_related('booking', 'payment').order_by('-created_at')


class MechanicBillsListView(generics.ListAPIView):
    """
    List all bills for the authenticated mechanic.
    GET /api/bookings/bills/mechanic/
    """
    serializer_class = BillSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Bill.objects.filter(
            booking__mechanic=self.request.user
        ).select_related('booking', 'payment').order_by('-created_at')


class BillDetailView(generics.RetrieveAPIView):
    """
    Get a single bill by bill number.
    GET /api/bookings/bills/<str:bill_number>/
    """
    serializer_class = BillSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'bill_number'

    def get_queryset(self):
        user = self.request.user
        # Allow customer or mechanic to view their own bills
        return Bill.objects.filter(
            Q(booking__customer=user) | Q(booking__mechanic=user)
        ).select_related('booking', 'payment')
