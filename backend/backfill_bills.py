import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from bookings.models import Booking
from bookings.utils import create_bill

def backfill():
    completed_bookings = Booking.objects.filter(booking_status='COMPLETED')
    count = 0
    for b in completed_bookings:
        if hasattr(b, 'payment') and b.payment:
            if not b.bills.filter(bill_type='ADVANCE').exists() and b.payment.advance_status == 'PAID':
                create_bill(b, b.payment, 'ADVANCE', b.payment.advance_amount or 1000, 'card')
                count += 1
            if not b.bills.filter(bill_type='FINAL').exists() and b.payment.final_status == 'PAID':
                create_bill(b, b.payment, 'FINAL', b.payment.final_amount, 'cash')
                count += 1
    print(f'Generated {count} missing bills.')

if __name__ == '__main__':
    backfill()
