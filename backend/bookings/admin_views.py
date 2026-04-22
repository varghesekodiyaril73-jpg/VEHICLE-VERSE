from rest_framework import permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Sum, Count, Q
from django.utils import timezone
from django.utils.dateparse import parse_date
from datetime import timedelta, datetime
from decimal import Decimal

from .models import Booking, Payment
from accounts.models import User


class AdminDashboardStatsView(APIView):
    """
    Get admin dashboard statistics.
    GET /api/bookings/admin/stats/?period=month
    Query params:
        - period: week, month, year (default: month)
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        # Check if user is admin
        if request.user.user_role != 'ADMIN':
            return Response({'error': 'Admin access required'}, status=403)

        period = request.query_params.get('period', 'month')
        now = timezone.now()
        
        # Calculate date ranges based on period
        if period == 'custom':
            start_date_str = request.query_params.get('start_date')
            end_date_str = request.query_params.get('end_date')
            
            if not start_date_str or not end_date_str:
                return Response({'error': 'start_date and end_date are required for custom period'}, status=400)
                
            try:
                # Parse localized dates correctly assuming YYYY-MM-DD
                parsed_start = parse_date(start_date_str)
                parsed_end = parse_date(end_date_str)
                
                if not parsed_start or not parsed_end:
                    raise ValueError("Invalid date format")

                # Convert to timezone aware datetime at midnight
                current_start = timezone.make_aware(datetime.combine(parsed_start, datetime.min.time()))
                # Make end inclusive up to end of the day
                current_end = timezone.make_aware(datetime.combine(parsed_end, datetime.max.time()))
                
                # Calculate the duration of the custom period
                duration_days = (parsed_end - parsed_start).days + 1
                
                # Previous period is immediately before the custom period, with same duration
                previous_end_time = current_start - timedelta(microseconds=1)
                previous_start = current_start - timedelta(days=duration_days)
                previous_end = previous_end_time
                
            except (ValueError, TypeError) as e:
                return Response({'error': f'Invalid date format. Use YYYY-MM-DD. {str(e)}'}, status=400)
                
        elif period == 'week':
            current_start = now - timedelta(days=7)
            current_end = now
            previous_start = current_start - timedelta(days=7)
            previous_end = current_start
        elif period == 'year':
            current_start = now - timedelta(days=365)
            current_end = now
            previous_start = current_start - timedelta(days=365)
            previous_end = current_start
        else:  # month (default)
            current_start = now - timedelta(days=30)
            current_end = now
            previous_start = current_start - timedelta(days=30)
            previous_end = current_start

        # Get revenue data from completed payments
        def get_revenue(start_date, end_date=None):
            from django.db.models import Q
            # Count advance payments (₹1000 confirmation) on any booking
            advance_q = Payment.objects.filter(advance_status='PAID')
            # Count final payments on completed bookings
            final_q = Payment.objects.filter(
                booking__booking_status='COMPLETED',
                final_status__in=['PAID', 'CONFIRMED']
            )
            if end_date:
                advance_q = advance_q.filter(advance_paid_at__gte=start_date, advance_paid_at__lt=end_date)
                final_q = final_q.filter(final_paid_at__gte=start_date, final_paid_at__lt=end_date)
            else:
                advance_q = advance_q.filter(advance_paid_at__gte=start_date)
                final_q = final_q.filter(final_paid_at__gte=start_date)

            advance_total = advance_q.aggregate(total=Sum('advance_amount'))['total'] or Decimal('0.00')
            final_total = final_q.aggregate(total=Sum('final_amount'))['total'] or Decimal('0.00')
            return advance_total + final_total

        # Calculate total revenue (all time)
        total_advance = Payment.objects.filter(advance_status='PAID').aggregate(total=Sum('advance_amount'))['total'] or Decimal('0.00')
        total_final = Payment.objects.filter(
            booking__booking_status='COMPLETED',
            final_status__in=['PAID', 'CONFIRMED']
        ).aggregate(total=Sum('final_amount'))['total'] or Decimal('0.00')
        total_revenue = total_advance + total_final


        # Current and previous period revenue
        current_period_revenue = get_revenue(current_start, current_end)
        previous_period_revenue = get_revenue(previous_start, previous_end)

        # Generate chart data based on period
        chart_data = []
        if period == 'custom':
            duration_days = (current_end - current_start).days + 1
            max_points = 10 # To keep chart from overcrowding
            
            if duration_days <= max_points:
                # Daily data
                for i in range(duration_days):
                    day_start = current_start + timedelta(days=i)
                    day_end = day_start + timedelta(days=1)
                    
                    prev_day_start = previous_start + timedelta(days=i)
                    prev_day_end = prev_day_start + timedelta(days=1)
                    
                    current_val = get_revenue(day_start, day_end)
                    prev_val = get_revenue(prev_day_start, prev_day_end)
                    
                    chart_data.append({
                        'label': day_start.strftime('%d %b'),
                        'current': float(current_val),
                        'previous': float(prev_val)
                    })
            else:
                # Group by intervals
                interval = max(1, duration_days // max_points)
                for i in range(max_points):
                    int_start = current_start + timedelta(days=i*interval)
                    # If this is the last interval, stretch it to the actual end
                    int_end = int_start + timedelta(days=interval) if i < max_points - 1 else current_end + timedelta(days=1)
                    if int_start >= current_end + timedelta(days=1): break # Safety check
                    
                    prev_int_start = previous_start + timedelta(days=i*interval)
                    prev_int_end = prev_int_start + timedelta(days=interval) if i < max_points - 1 else previous_end + timedelta(days=1)
                    
                    current_val = get_revenue(int_start, int_end)
                    prev_val = get_revenue(prev_int_start, prev_int_end)
                    
                    chart_data.append({
                        'label': f'{int_start.strftime("%d %b")} - {(int_end - timedelta(days=1)).strftime("%d %b")}' if interval > 1 else int_start.strftime("%d %b"),
                        'current': float(current_val),
                        'previous': float(prev_val)
                    })
                    
        elif period == 'week':
            # Daily data for week
            for i in range(7):
                day_start = (now - timedelta(days=6-i)).replace(hour=0, minute=0, second=0, microsecond=0)
                day_end = day_start + timedelta(days=1)
                prev_day_start = day_start - timedelta(days=7)
                prev_day_end = prev_day_start + timedelta(days=1)
                
                current_val = get_revenue(day_start, day_end)
                prev_val = get_revenue(prev_day_start, prev_day_end)
                
                chart_data.append({
                    'label': day_start.strftime('%a'),
                    'current': float(current_val),
                    'previous': float(prev_val)
                })
        elif period == 'year':
            # Monthly data for year
            for i in range(12):
                month_start = (now - timedelta(days=365) + timedelta(days=i*30)).replace(hour=0, minute=0, second=0, microsecond=0)
                month_end = month_start + timedelta(days=30)
                
                prev_month_start = month_start - timedelta(days=365)
                prev_month_end = month_end - timedelta(days=365)
                
                current_val = get_revenue(month_start, month_end)
                prev_val = get_revenue(prev_month_start, prev_month_end)
                
                chart_data.append({
                    'label': month_start.strftime('%b'),
                    'current': float(current_val),
                    'previous': float(prev_val)
                })
        else:  # month
            # Weekly data for month
            for i in range(4):
                week_start = (now - timedelta(days=28-i*7)).replace(hour=0, minute=0, second=0, microsecond=0)
                week_end = week_start + timedelta(days=7)
                prev_week_start = week_start - timedelta(days=30)
                prev_week_end = prev_week_start + timedelta(days=7)
                
                current_val = get_revenue(week_start, week_end)
                prev_val = get_revenue(prev_week_start, prev_week_end)
                
                chart_data.append({
                    'label': f'Week {i+1}',
                    'current': float(current_val),
                    'previous': float(prev_val)
                })

        # User counts
        total_customers = User.objects.filter(user_role='CUSTOMER').count()
        total_mechanics = User.objects.filter(user_role='MECHANIC').count()

        # Booking statistics with details
        def serialize_booking(booking):
            return {
                'booking_id': booking.booking_id,
                'customer_name': f"{booking.customer.first_name} {booking.customer.last_name}".strip() or booking.customer.username,
                'vehicle_name': booking.vehicle.vehicle_name if booking.vehicle else 'N/A',
                'service_details': booking.service_details[:50] + '...' if len(booking.service_details) > 50 else booking.service_details,
                'service_category': booking.service_category or ('Emergency' if booking.service_type == 'BREAKDOWN' else 'Service'),
                'status': booking.booking_status,
                'district': booking.district or '',
                'place': booking.place or '',
                'created_at': booking.created_at.strftime('%d %b %Y, %I:%M %p') if booking.created_at else '',
                'completed_at': booking.completed_at.strftime('%d %b %Y, %I:%M %p') if booking.completed_at else '',
                'mechanic_name': f"{booking.mechanic.first_name} {booking.mechanic.last_name}".strip() if booking.mechanic else 'Not Assigned',
            }

        emergency_bookings = Booking.objects.filter(service_type='BREAKDOWN').select_related('customer', 'vehicle', 'mechanic')
        regular_bookings = Booking.objects.filter(service_type='HOME_SERVICE').select_related('customer', 'vehicle', 'mechanic')

        emergency_pending_qs = emergency_bookings.filter(
            booking_status__in=['PENDING', 'ASSIGNED', 'IN_PROGRESS']
        ).order_by('-created_at')[:10]
        emergency_completed_qs = emergency_bookings.filter(
            booking_status='COMPLETED'
        ).order_by('-completed_at')[:10]

        regular_pending_qs = regular_bookings.filter(
            booking_status__in=['PENDING', 'ASSIGNED', 'IN_PROGRESS']
        ).order_by('-created_at')[:10]
        regular_completed_qs = regular_bookings.filter(
            booking_status='COMPLETED'
        ).order_by('-completed_at')[:10]

        # Calculate percentage change
        if previous_period_revenue > 0:
            percentage_change = ((current_period_revenue - previous_period_revenue) / previous_period_revenue) * 100
        else:
            percentage_change = 100 if current_period_revenue > 0 else 0

        return Response({
            'revenue': {
                'total': float(total_revenue),
                'current_period': float(current_period_revenue),
                'previous_period': float(previous_period_revenue),
                'percentage_change': round(float(percentage_change), 2),
                'period_type': period,
                'chart_data': chart_data
            },
            'users': {
                'total_customers': total_customers,
                'total_mechanics': total_mechanics
            },
            'bookings': {
                'emergency': {
                    'pending': [serialize_booking(b) for b in emergency_pending_qs],
                    'pending_count': emergency_bookings.filter(booking_status__in=['PENDING', 'ASSIGNED', 'IN_PROGRESS']).count(),
                    'completed': [serialize_booking(b) for b in emergency_completed_qs],
                    'completed_count': emergency_bookings.filter(booking_status='COMPLETED').count()
                },
                'regular': {
                    'pending': [serialize_booking(b) for b in regular_pending_qs],
                    'pending_count': regular_bookings.filter(booking_status__in=['PENDING', 'ASSIGNED', 'IN_PROGRESS']).count(),
                    'completed': [serialize_booking(b) for b in regular_completed_qs],
                    'completed_count': regular_bookings.filter(booking_status='COMPLETED').count()
                }
            }
        })


class AdminAnalyticsView(APIView):
    """
    Get analytics data for admin dashboard.
    GET /api/bookings/admin/analytics/
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        # Check if user is admin
        if request.user.user_role != 'ADMIN':
            return Response({'error': 'Admin access required'}, status=403)

        now = timezone.now()
        
        # 1. District-wise Bookings (Bar Chart)
        district_bookings = Booking.objects.values('district').annotate(
            count=Count('booking_id')
        ).order_by('-count')[:10]
        
        district_data = [
            {'district': item['district'] or 'Unknown', 'count': item['count']}
            for item in district_bookings
        ]

        # 2. Service Type Distribution (Pie Chart)
        service_distribution = Booking.objects.values('service_type').annotate(
            count=Count('booking_id')
        )
        
        service_data = []
        for item in service_distribution:
            label = 'Emergency' if item['service_type'] == 'BREAKDOWN' else 'Home Service'
            service_data.append({
                'type': label,
                'count': item['count']
            })

        # 3. Booking Status Distribution (Pie Chart)
        status_distribution = Booking.objects.values('booking_status').annotate(
            count=Count('booking_id')
        )
        
        status_data = [
            {'status': item['booking_status'], 'count': item['count']}
            for item in status_distribution
        ]

        # 4. Monthly Revenue Trend (Line Chart) - Last 6 months
        monthly_revenue = []
        for i in range(6):
            month_end = now - timedelta(days=30 * i)
            month_start = month_end - timedelta(days=30)

            advance_rev = Payment.objects.filter(
                advance_status='PAID',
                advance_paid_at__gte=month_start,
                advance_paid_at__lt=month_end
            ).aggregate(total=Sum('advance_amount'))['total'] or Decimal('0.00')

            final_rev = Payment.objects.filter(
                booking__booking_status='COMPLETED',
                final_status__in=['PAID', 'CONFIRMED'],
                final_paid_at__gte=month_start,
                final_paid_at__lt=month_end
            ).aggregate(total=Sum('final_amount'))['total'] or Decimal('0.00')

            revenue = advance_rev + final_rev

            monthly_revenue.append({
                'month': month_end.strftime('%b %Y'),
                'revenue': float(revenue)
            })

        
        monthly_revenue.reverse()  # Oldest first

        # 5. Mechanic Performance (Horizontal Bar Chart)
        from accounts.models import MechanicProfile
        
        mechanic_stats = []
        mechanics = MechanicProfile.objects.filter(
            approval_status='APPROVED'
        ).select_related('user')[:10]
        
        for mechanic in mechanics:
            completed_jobs = Booking.objects.filter(
                mechanic=mechanic.user,
                booking_status='COMPLETED'
            ).count()
            
            if completed_jobs > 0:
                mechanic_stats.append({
                    'name': f"{mechanic.user.first_name} {mechanic.user.last_name}".strip() or mechanic.user.username,
                    'completed_jobs': completed_jobs,
                    'rating': float(mechanic.avg_rating) if mechanic.avg_rating else 0.0
                })
        
        # Sort by completed jobs
        mechanic_stats.sort(key=lambda x: x['completed_jobs'], reverse=True)

        # 6. Bookings Over Time (Last 30 days - Line Chart)
        daily_bookings = []
        for i in range(30):
            day = now - timedelta(days=29-i)
            day_start = day.replace(hour=0, minute=0, second=0, microsecond=0)
            day_end = day_start + timedelta(days=1)
            
            emergency_count = Booking.objects.filter(
                service_type='BREAKDOWN',
                created_at__gte=day_start,
                created_at__lt=day_end
            ).count()
            
            service_count = Booking.objects.filter(
                service_type='HOME_SERVICE',
                created_at__gte=day_start,
                created_at__lt=day_end
            ).count()
            
            daily_bookings.append({
                'date': day_start.strftime('%d %b'),
                'emergency': emergency_count,
                'service': service_count
            })

        # 7. Customer Growth (Last 6 months)
        customer_growth = []
        for i in range(6):
            month_end = now - timedelta(days=30 * i)
            
            total_customers = User.objects.filter(
                user_role='CUSTOMER',
                created_at__lte=month_end
            ).count()
            
            customer_growth.append({
                'month': month_end.strftime('%b %Y'),
                'customers': total_customers
            })
        
        customer_growth.reverse()

        return Response({
            'district_bookings': district_data,
            'service_distribution': service_data,
            'status_distribution': status_data,
            'monthly_revenue': monthly_revenue,
            'mechanic_performance': mechanic_stats[:5],  # Top 5
            'daily_bookings': daily_bookings,
            'customer_growth': customer_growth
        })
