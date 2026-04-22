import threading
from decimal import Decimal
from django.conf import settings
from django.core.mail import send_mail
from django.utils import timezone


def generate_bill_number():
    """Generate a sequential bill number like VV-2026-00001"""
    from .models import Bill

    year = timezone.now().year
    prefix = f"VV-{year}-"

    last_bill = (
        Bill.objects.filter(bill_number__startswith=prefix)
        .order_by('-bill_number')
        .first()
    )

    if last_bill:
        last_seq = int(last_bill.bill_number.split('-')[-1])
        next_seq = last_seq + 1
    else:
        next_seq = 1

    return f"{prefix}{next_seq:05d}"


def create_bill(booking, payment, bill_type, amount, payment_method=''):
    """
    Create a Bill record with commission breakdown.

    Args:
        booking: Booking instance
        payment: Payment instance
        bill_type: 'ADVANCE' or 'FINAL'
        amount: Decimal total amount
        payment_method: e.g. 'card', 'upi'

    Returns:
        Bill instance
    """
    from .models import Bill

    commission_percent = Decimal(str(getattr(settings, 'ADMIN_COMMISSION_PERCENT', 10)))
    total = Decimal(str(amount))
    commission_amount = (total * commission_percent / Decimal('100')).quantize(Decimal('0.01'))
    mechanic_payout = total - commission_amount

    # Customer info
    customer = booking.customer
    customer_name = (
        f"{customer.first_name} {customer.last_name}".strip()
        or customer.username
    )
    customer_email = customer.email

    # Mechanic info (may be None for advance on emergency before mechanic assigned)
    mechanic = booking.mechanic
    if mechanic:
        mechanic_name = (
            f"{mechanic.first_name} {mechanic.last_name}".strip()
            or mechanic.username
        )
        mechanic_email = mechanic.email
    else:
        mechanic_name = "Not yet assigned"
        mechanic_email = ""

    # Vehicle & service info
    vehicle_name = booking.vehicle.vehicle_name if booking.vehicle else "N/A"
    service_type = booking.get_service_type_display()
    service_details = booking.service_details or ""

    bill = Bill.objects.create(
        bill_number=generate_bill_number(),
        booking=booking,
        payment=payment,
        bill_type=bill_type,
        total_amount=total,
        admin_commission_percent=commission_percent,
        admin_commission_amount=commission_amount,
        mechanic_amount=mechanic_payout,
        customer_name=customer_name,
        customer_email=customer_email,
        mechanic_name=mechanic_name,
        mechanic_email=mechanic_email,
        vehicle_name=vehicle_name,
        service_type=service_type,
        service_details=service_details[:200],
        payment_method=payment_method,
    )

    # Also update the Payment model's commission fields
    payment.admin_commission_amount = (
        Decimal(str(payment.admin_commission_amount or 0)) + commission_amount
    )
    payment.mechanic_amount = (
        Decimal(str(payment.mechanic_amount or 0)) + mechanic_payout
    )
    payment.save()

    # Send email in background thread
    threading.Thread(target=send_bill_email, args=(bill,)).start()

    return bill


def send_bill_email(bill):
    """
    Send bill receipt email to both the customer and mechanic.
    """
    bill_type_label = "Advance Payment" if bill.bill_type == "ADVANCE" else "Final Payment"

    subject = f"VehicleVerse — {bill_type_label} Receipt ({bill.bill_number})"

    body = (
        f"{'=' * 50}\n"
        f"         VEHICLEVERSE — PAYMENT RECEIPT\n"
        f"{'=' * 50}\n\n"
        f"  Bill Number   : {bill.bill_number}\n"
        f"  Date          : {bill.created_at.strftime('%d %b %Y, %I:%M %p') if bill.created_at else 'N/A'}\n"
        f"  Bill Type     : {bill_type_label}\n\n"
        f"{'-' * 50}\n"
        f"  BOOKING DETAILS\n"
        f"{'-' * 50}\n"
        f"  Booking ID    : #{bill.booking.booking_id}\n"
        f"  Service Type  : {bill.service_type}\n"
        f"  Vehicle       : {bill.vehicle_name}\n"
        f"  Description   : {bill.service_details[:100]}\n\n"
        f"{'-' * 50}\n"
        f"  PARTIES\n"
        f"{'-' * 50}\n"
        f"  Customer      : {bill.customer_name}\n"
        f"  Mechanic      : {bill.mechanic_name}\n\n"
        f"{'-' * 50}\n"
        f"  PAYMENT BREAKDOWN\n"
        f"{'-' * 50}\n"
        f"  Total Amount          : ₹{bill.total_amount}\n"
        f"  Admin Commission ({bill.admin_commission_percent}%) : ₹{bill.admin_commission_amount}\n"
        f"  Mechanic Payout       : ₹{bill.mechanic_amount}\n"
        f"  Payment Method        : {bill.payment_method.upper() or 'N/A'}\n\n"
        f"{'=' * 50}\n"
        f"  Thank you for using VehicleVerse!\n"
        f"  This is an auto-generated receipt.\n"
        f"{'=' * 50}\n"
    )

    # Collect recipients (customer + mechanic if available)
    recipients = [bill.customer_email]
    if bill.mechanic_email:
        recipients.append(bill.mechanic_email)

    try:
        send_mail(
            subject=subject,
            message=body,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=recipients,
            fail_silently=False,
        )
        print(f"[EMAIL] Bill {bill.bill_number} sent to {', '.join(recipients)}")
    except Exception as e:
        print(f"[EMAIL ERROR] Failed to send bill {bill.bill_number}: {e}")
