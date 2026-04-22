import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Car, MapPin, Calendar, Clock, AlertTriangle, CheckCircle,
    Wrench, CreditCard, User, Phone, Home, Users, ClipboardList,
    ChevronRight, RefreshCw, Star, MessageSquare, XCircle, DollarSign,
    FileText, ChevronDown, LayoutGrid, List, MessageCircle, Receipt
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PaymentModal from '../../components/booking/PaymentModal';
import BillModal from '../../components/booking/BillModal';
import BookingChat from '../../components/chat/BookingChat';
import {
    getCustomerBookings,
    processPayment,
    cancelBookingByCustomer,
    cancelEmergencyBooking,
    createReview,
    createComplaint,
    confirmPayment,
    getCustomerComplaints,
    getCustomerReviews
} from '../../services/bookingService';
import styles from '../../styles/MyBookings.module.css';

// Review Modal Component
const ReviewModal = ({ isOpen, onClose, onSubmit, booking }) => {
    const [rating, setRating] = useState(5);
    const [reviewText, setReviewText] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async () => {
        setSubmitting(true);
        await onSubmit({ rating, review_text: reviewText });
        setSubmitting(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <motion.div
            className={styles.modalOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
        >
            <motion.div
                className={styles.modal}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
            >
                <h3>Rate & Review</h3>
                <p>How was your experience with the mechanic?</p>

                <div className={styles.ratingStars}>
                    {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                            key={star}
                            size={32}
                            className={`${styles.star} ${star <= rating ? styles.starActive : ''}`}
                            onClick={() => setRating(star)}
                        />
                    ))}
                </div>
                <span className={styles.ratingLabel}>{rating} out of 5 stars</span>

                <textarea
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="Write your review (optional)..."
                    rows={4}
                />

                <div className={styles.modalActions}>
                    <button onClick={onClose} className={styles.modalCancel}>Cancel</button>
                    <button
                        onClick={handleSubmit}
                        className={styles.modalConfirm}
                        disabled={submitting}
                    >
                        {submitting ? 'Submitting...' : 'Submit Review'}
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};

// Complaint Modal Component with Type Selection
const ComplaintModal = ({ isOpen, onClose, onSubmit, booking }) => {
    const [complaintType, setComplaintType] = useState('EMERGENCY_DELAY');
    const [complaintText, setComplaintText] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const complaintTypes = [
        { value: 'EMERGENCY_DELAY', label: 'Mechanic Not Arriving On Time', icon: '⏰' },
        { value: 'SERVICE_QUALITY', label: 'Poor Service Quality', icon: '🔧' },
        { value: 'PAYMENT_ISSUE', label: 'Payment Dispute', icon: '💳' },
        { value: 'OTHER', label: 'Other Issue', icon: '📝' },
    ];

    const handleSubmit = async () => {
        if (!complaintText.trim()) {
            alert('Please describe your complaint');
            return;
        }
        setSubmitting(true);
        await onSubmit({ complaint_type: complaintType, complaint_text: complaintText });
        setSubmitting(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <motion.div
            className={styles.modalOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
        >
            <motion.div
                className={styles.modal}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
            >
                <h3>File a Complaint</h3>
                <p>Select the type of issue and describe your complaint. Both the mechanic and admin will be notified.</p>

                <div className={styles.complaintTypeList}>
                    {complaintTypes.map((type) => (
                        <label
                            key={type.value}
                            className={`${styles.complaintTypeOption} ${complaintType === type.value ? styles.complaintTypeActive : ''}`}
                        >
                            <input
                                type="radio"
                                name="complaintType"
                                value={type.value}
                                checked={complaintType === type.value}
                                onChange={(e) => setComplaintType(e.target.value)}
                                style={{ display: 'none' }}
                            />
                            <span className={styles.complaintTypeIcon}>{type.icon}</span>
                            <span className={styles.complaintTypeLabel}>{type.label}</span>
                        </label>
                    ))}
                </div>

                <textarea
                    value={complaintText}
                    onChange={(e) => setComplaintText(e.target.value)}
                    placeholder={complaintType === 'EMERGENCY_DELAY'
                        ? 'Describe the delay issue (e.g., mechanic was supposed to arrive 30 mins ago)...'
                        : 'Describe your complaint...'}
                    rows={5}
                />

                <div className={styles.modalActions}>
                    <button onClick={onClose} className={styles.modalCancel}>Cancel</button>
                    <button
                        onClick={handleSubmit}
                        className={styles.modalConfirmDanger}
                        disabled={submitting}
                    >
                        {submitting ? 'Submitting...' : 'Submit Complaint'}
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};

// Emergency Cancel Modal
const EmergencyCancelModal = ({ isOpen, onClose, onSubmit, booking }) => {
    const [reason, setReason] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!reason.trim()) {
            alert('Please provide a reason for cancellation');
            return;
        }
        setSubmitting(true);
        await onSubmit({ cancellation_reason: reason });
        setSubmitting(false);
        onClose();
    };

    if (!isOpen) return null;

    const advanceAmount = booking?.payment?.advance_amount || 0;
    const processingFee = 100;
    const refundAmount = Math.max(0, advanceAmount - processingFee);

    return (
        <motion.div
            className={styles.modalOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
        >
            <motion.div
                className={styles.modal}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
            >
                <h3 style={{ color: '#ef4444' }}>
                    <AlertTriangle size={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                    Cancel Emergency Booking
                </h3>
                <p>You can cancel this emergency booking since no mechanic has accepted it yet.</p>

                {booking?.payment?.advance_status === 'PAID' && (
                    <div className={styles.refundInfo}>
                        <DollarSign size={20} />
                        <div>
                            <span className={styles.refundTitle}>Refund Information</span>
                            <span className={styles.refundText}>
                                ₹{refundAmount} will be refunded (₹{processingFee} processing fee deducted from ₹{advanceAmount})
                            </span>
                        </div>
                    </div>
                )}

                <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Reason for cancelling emergency booking..."
                    rows={3}
                />

                <div className={styles.modalActions}>
                    <button onClick={onClose} className={styles.modalCancel}>Go Back</button>
                    <button
                        onClick={handleSubmit}
                        className={styles.modalConfirmDanger}
                        disabled={submitting}
                    >
                        {submitting ? 'Cancelling...' : 'Confirm Cancellation'}
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};

// Cancel Booking Modal (Regular Service Only)
const CancelModal = ({ isOpen, onClose, onSubmit, booking }) => {
    const [reason, setReason] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!reason.trim()) {
            alert('Please provide a reason for cancellation');
            return;
        }
        setSubmitting(true);
        await onSubmit({ cancellation_reason: reason });
        setSubmitting(false);
        onClose();
    };

    if (!isOpen) return null;

    const advanceAmount = booking?.payment?.advance_amount || 0;
    const processingFee = 50;
    const refundAmount = Math.max(0, advanceAmount - processingFee);

    return (
        <motion.div
            className={styles.modalOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
        >
            <motion.div
                className={styles.modal}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
            >
                <h3>Cancel Booking</h3>
                <p>Are you sure you want to cancel this booking?</p>

                {booking?.payment?.advance_status === 'PAID' && (
                    <div className={styles.refundInfo}>
                        <DollarSign size={20} />
                        <div>
                            <span className={styles.refundTitle}>Refund Information</span>
                            <span className={styles.refundText}>
                                ₹{refundAmount} will be refunded (₹{processingFee} processing fee deducted)
                            </span>
                        </div>
                    </div>
                )}

                <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Reason for cancellation..."
                    rows={3}
                />

                <div className={styles.modalActions}>
                    <button onClick={onClose} className={styles.modalCancel}>Go Back</button>
                    <button
                        onClick={handleSubmit}
                        className={styles.modalConfirmDanger}
                        disabled={submitting}
                    >
                        {submitting ? 'Cancelling...' : 'Confirm Cancellation'}
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};

// Payment Confirmation Modal (for completed bookings)
const ConfirmPaymentModal = ({ isOpen, onClose, onSubmit, booking }) => {
    const [confirmed, setConfirmed] = useState(true);
    const [customerAmount, setCustomerAmount] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const mechanicAmount = booking?.payment?.final_amount || 0;

    const handleSubmit = async () => {
        if (!confirmed && !customerAmount) {
            alert('Please enter the amount you paid');
            return;
        }
        setSubmitting(true);
        await onSubmit({
            confirmed,
            customer_amount: confirmed ? mechanicAmount : parseFloat(customerAmount)
        });
        setSubmitting(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <motion.div
            className={styles.modalOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
        >
            <motion.div
                className={styles.modal}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
            >
                <h3>Confirm Payment</h3>
                <p>Please verify the final payment amount.</p>

                <div className={styles.paymentSummary}>
                    <div className={styles.amountRow}>
                        <span>Amount reported by mechanic:</span>
                        <span className={styles.amountValue}>₹{mechanicAmount}</span>
                    </div>
                </div>

                <div className={styles.confirmOptions}>
                    <label className={`${styles.confirmOption} ${confirmed ? styles.confirmOptionActive : ''}`}>
                        <input
                            type="radio"
                            checked={confirmed}
                            onChange={() => setConfirmed(true)}
                        />
                        <CheckCircle size={20} />
                        <span>Yes, I paid ₹{mechanicAmount}</span>
                    </label>
                    <label className={`${styles.confirmOption} ${!confirmed ? styles.confirmOptionActive : ''}`}>
                        <input
                            type="radio"
                            checked={!confirmed}
                            onChange={() => setConfirmed(false)}
                        />
                        <XCircle size={20} />
                        <span>No, the amount is different</span>
                    </label>
                </div>

                {!confirmed && (
                    <div className={styles.amountInput}>
                        <span className={styles.currencySymbol}>₹</span>
                        <input
                            type="number"
                            value={customerAmount}
                            onChange={(e) => setCustomerAmount(e.target.value)}
                            placeholder="Enter amount you paid"
                            min="0"
                        />
                    </div>
                )}

                <div className={styles.modalActions}>
                    <button onClick={onClose} className={styles.modalCancel}>Cancel</button>
                    <button
                        onClick={handleSubmit}
                        className={confirmed ? styles.modalConfirm : styles.modalConfirmDanger}
                        disabled={submitting}
                    >
                        {submitting ? 'Submitting...' : (confirmed ? 'Confirm Amount' : 'Dispute Amount')}
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};

const BookingCard = ({ booking, onPayment, onReview, onComplaint, onCancel, onConfirmPayment, onChat, onViewBills }) => {
    const getStatusColor = (status) => {
        switch (status) {
            case 'PENDING': return styles.statusPending;
            case 'ASSIGNED': return styles.statusAssigned;
            case 'IN_PROGRESS': return styles.statusInProgress;
            case 'COMPLETED': return styles.statusCompleted;
            case 'CANCELLED': return styles.statusCancelled;
            default: return '';
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'PENDING': return 'Waiting for Mechanic';
            case 'ASSIGNED': return 'Mechanic Assigned';
            case 'IN_PROGRESS': return 'Service In Progress';
            case 'COMPLETED': return 'Completed';
            case 'CANCELLED': return 'Cancelled';
            default: return status;
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleDateString('en-IN', {
            day: 'numeric', month: 'short', year: 'numeric'
        });
    };

    const formatTime = (timeStr) => {
        if (!timeStr) return '';
        const [hours, minutes] = timeStr.split(':');
        const hour = parseInt(hours, 10);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes} ${ampm}`;
    };

    const isEmergency = booking.service_type === 'BREAKDOWN';
    const isCompleted = booking.booking_status === 'COMPLETED';
    const isCancelled = booking.booking_status === 'CANCELLED';
    const needsPayment = booking.booking_status === 'ASSIGNED' &&
        booking.payment?.advance_status === 'PENDING';
    const canCancel = !isEmergency && !isCompleted && !isCancelled &&
        ['PENDING', 'ASSIGNED'].includes(booking.booking_status);
    // Emergency bookings can be cancelled only when PENDING (before mechanic accepts)
    const canCancelEmergency = isEmergency && booking.booking_status === 'PENDING' && !booking.mechanic;
    // Can file complaint when mechanic is assigned/in progress (emergency or regular)
    const canComplaint = !isCancelled && ['ASSIGNED', 'IN_PROGRESS'].includes(booking.booking_status);
    const canReview = isCompleted && !booking.has_review;
    const showPaymentConfirm = isCompleted &&
        booking.payment?.final_amount &&
        booking.payment?.final_status !== 'CONFIRMED';

    return (
        <motion.div
            className={`${styles.bookingCard} ${isEmergency ? styles.emergencyCard : styles.regularCard}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4 }}
        >
            {/* Type Badge */}
            <div className={`${styles.typeBadge} ${isEmergency ? styles.emergencyBadge : styles.regularBadge}`}>
                {isEmergency ? (
                    <>
                        <AlertTriangle size={14} />
                        EMERGENCY
                    </>
                ) : (
                    <>
                        <Calendar size={14} />
                        REGULAR SERVICE
                    </>
                )}
            </div>

            {/* Status */}
            <div className={`${styles.statusBadge} ${getStatusColor(booking.booking_status)}`}>
                {getStatusLabel(booking.booking_status)}
            </div>

            {/* Booking ID */}
            <div className={styles.bookingId}>
                Booking #{booking.booking_id}
            </div>

            {/* Vehicle Info */}
            <div className={styles.vehicleSection}>
                <div className={styles.vehicleIcon}>
                    <Car size={24} />
                </div>
                <div className={styles.vehicleDetails}>
                    <h3>{booking.vehicle?.vehicle_name || 'Vehicle'}</h3>
                    <p>{booking.vehicle?.registration_no}</p>
                </div>
            </div>

            {/* Service Details */}
            <div className={styles.serviceDetails}>
                <div className={styles.detailRow}>
                    <Wrench size={16} />
                    <span>{booking.service_category || 'Emergency Repair'}</span>
                </div>
                <p className={styles.description}>{booking.service_details}</p>
            </div>

            {/* Location */}
            <div className={styles.detailRow}>
                <MapPin size={16} />
                <span>{booking.place}, {booking.district}</span>
            </div>

            {/* Schedule (for regular) */}
            {!isEmergency && booking.scheduled_date && (
                <div className={styles.detailRow}>
                    <Clock size={16} />
                    <span>{formatDate(booking.scheduled_date)} at {formatTime(booking.scheduled_time)}</span>
                </div>
            )}

            {/* Mechanic Info (if assigned) */}
            {booking.mechanic && (
                <div className={styles.mechanicInfo}>
                    <h4>Assigned Mechanic</h4>
                    <div className={styles.mechanicDetails}>
                        <User size={16} />
                        <span>{booking.mechanic.first_name} {booking.mechanic.last_name}</span>
                    </div>
                    {booking.mechanic.phone && (
                        <div className={styles.mechanicDetails}>
                            <Phone size={16} />
                            <span>{booking.mechanic.phone}</span>
                        </div>
                    )}
                </div>
            )}

            {/* Payment Status */}
            <div className={styles.paymentSection}>
                <div className={styles.paymentInfo}>
                    <CreditCard size={16} />
                    <span>
                        {booking.payment?.advance_status === 'PAID'
                            ? `Advance: ₹${booking.payment.advance_amount} Paid`
                            : `Advance: ₹${booking.payment?.advance_amount || 1000} Pending`}
                    </span>
                </div>
                {isCompleted && booking.payment?.final_amount && (
                    <div className={styles.paymentInfo}>
                        <DollarSign size={16} />
                        <span>Final: ₹{booking.payment.final_amount}</span>
                    </div>
                )}
            </div>

            {/* Created Date */}
            <div className={styles.createdDate}>
                Booked on {formatDate(booking.created_at)}
            </div>

            {/* Action Buttons */}
            <div className={styles.actionButtons}>
                {/* Payment for assigned regular service */}
                {needsPayment && (
                    <motion.button
                        className={styles.payNowBtn}
                        onClick={() => onPayment(booking)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <CreditCard size={16} />
                        Pay ₹1000 to Confirm
                    </motion.button>
                )}

                {/* For completed services */}
                {isCompleted && (
                    <>
                        {canReview && (
                            <motion.button
                                className={styles.reviewBtn}
                                onClick={() => onReview(booking)}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Star size={16} />
                                Rate & Review
                            </motion.button>
                        )}
                        <motion.button
                            className={styles.complaintBtn}
                            onClick={() => onComplaint(booking)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <MessageSquare size={16} />
                            Complaint
                        </motion.button>
                        {showPaymentConfirm && (
                            <motion.button
                                className={styles.confirmPayBtn}
                                onClick={() => onConfirmPayment(booking)}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <DollarSign size={16} />
                                Confirm Payment
                            </motion.button>
                        )}
                    </>
                )}

                {/* Cancel option for regular service (not emergency) */}
                {canCancel && (
                    <motion.button
                        className={styles.cancelBtn}
                        onClick={() => onCancel(booking)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <XCircle size={16} />
                        Cancel Booking
                    </motion.button>
                )}

                {/* Cancel emergency booking (only before mechanic accepts) */}
                {canCancelEmergency && (
                    <motion.button
                        className={styles.cancelBtn}
                        onClick={() => onCancel(booking)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <XCircle size={16} />
                        Cancel Emergency
                    </motion.button>
                )}

                {/* Chat button for active bookings where mechanic is assigned */}
                {booking.mechanic && ['ASSIGNED', 'IN_PROGRESS'].includes(booking.booking_status) && (
                    <motion.button
                        className={styles.chatBtn}
                        onClick={() => onChat(booking)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <MessageCircle size={16} />
                        Chat with Mechanic
                    </motion.button>
                )}

                {/* Complaint for active bookings where mechanic is assigned */}
                {canComplaint && (
                    <motion.button
                        className={styles.complaintBtn}
                        onClick={() => onComplaint(booking)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <MessageSquare size={16} />
                        {isEmergency ? 'Report Delay' : 'Complaint'}
                    </motion.button>
                )}

                {/* View Bills button */}
                {booking.bills && booking.bills.length > 0 && (
                    <motion.button
                        className={styles.confirmPayBtn}
                        onClick={() => onViewBills(booking)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        style={{ background: 'rgba(99, 102, 241, 0.15)', borderColor: 'rgba(99, 102, 241, 0.3)', color: '#818cf8' }}
                    >
                        <Receipt size={16} />
                        View Bills ({booking.bills.length})
                    </motion.button>
                )}
            </div>

            {/* Review Submitted */}
            {booking.has_review && (
                <div className={styles.reviewSubmitted}>
                    <CheckCircle size={14} />
                    Review submitted
                </div>
            )}
        </motion.div>
    );
};

// Compact List Item Component for list view
const BookingListItem = ({ booking, onPayment, onReview, onComplaint, onCancel, onConfirmPayment, onChat, onViewBills }) => {
    const getStatusColor = (status) => {
        switch (status) {
            case 'PENDING': return styles.statusPending;
            case 'ASSIGNED': return styles.statusAssigned;
            case 'IN_PROGRESS': return styles.statusInProgress;
            case 'COMPLETED': return styles.statusCompleted;
            case 'CANCELLED': return styles.statusCancelled;
            default: return '';
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'PENDING': return 'Waiting';
            case 'ASSIGNED': return 'Assigned';
            case 'IN_PROGRESS': return 'In Progress';
            case 'COMPLETED': return 'Completed';
            case 'CANCELLED': return 'Cancelled';
            default: return status;
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleDateString('en-IN', {
            day: 'numeric', month: 'short'
        });
    };

    const isEmergency = booking.service_type === 'BREAKDOWN';
    const isCompleted = booking.booking_status === 'COMPLETED';
    const isCancelled = booking.booking_status === 'CANCELLED';
    const needsPayment = booking.booking_status === 'ASSIGNED' &&
        booking.payment?.advance_status === 'PENDING';
    const canCancel = !isEmergency && !isCompleted && !isCancelled &&
        ['PENDING', 'ASSIGNED'].includes(booking.booking_status);
    const canCancelEmergency = isEmergency && booking.booking_status === 'PENDING' && !booking.mechanic;
    const canComplaint = !isCancelled && ['ASSIGNED', 'IN_PROGRESS'].includes(booking.booking_status);
    const canReview = isCompleted && !booking.has_review;
    const showPaymentConfirm = isCompleted &&
        booking.payment?.final_amount &&
        booking.payment?.final_status !== 'CONFIRMED';

    return (
        <motion.div
            className={`${styles.listItem} ${isEmergency ? styles.listItemEmergency : styles.listItemRegular}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ x: 4 }}
        >
            {/* Left: Type indicator + Vehicle */}
            <div className={styles.listItemLeft}>
                <div className={`${styles.listTypeDot} ${isEmergency ? styles.listDotEmergency : styles.listDotRegular}`} />
                <div className={styles.listVehicleInfo}>
                    <span className={styles.listVehicleName}>
                        {booking.vehicle?.vehicle_name || 'Vehicle'}
                    </span>
                    <span className={styles.listVehicleReg}>
                        {booking.vehicle?.registration_no}
                    </span>
                </div>
            </div>

            {/* Center: Service + Location + Date */}
            <div className={styles.listItemCenter}>
                <span className={styles.listService}>
                    <Wrench size={13} />
                    {booking.service_category || 'Emergency Repair'}
                </span>
                <span className={styles.listLocation}>
                    <MapPin size={13} />
                    {booking.place}, {booking.district}
                </span>
                {booking.mechanic && (
                    <span className={styles.listMechanic}>
                        <User size={13} />
                        {booking.mechanic.first_name} {booking.mechanic.last_name}
                    </span>
                )}
            </div>

            {/* Right: Status + Date + Actions */}
            <div className={styles.listItemRight}>
                <div className={styles.listMeta}>
                    <span className={`${styles.listStatusBadge} ${getStatusColor(booking.booking_status)}`}>
                        {getStatusLabel(booking.booking_status)}
                    </span>
                    <span className={styles.listDate}>
                        {formatDate(booking.created_at)}
                    </span>
                    <span className={styles.listPayment}>
                        {booking.payment?.advance_status === 'PAID' ? '₹ Paid' : '₹ Pending'}
                    </span>
                </div>
                <div className={styles.listActions}>
                    {needsPayment && (
                        <motion.button
                            className={styles.listActionBtn}
                            onClick={() => onPayment(booking)}
                            whileTap={{ scale: 0.95 }}
                            title="Pay Now"
                        >
                            <CreditCard size={14} />
                        </motion.button>
                    )}
                    {canReview && (
                        <motion.button
                            className={`${styles.listActionBtn} ${styles.listActionReview}`}
                            onClick={() => onReview(booking)}
                            whileTap={{ scale: 0.95 }}
                            title="Review"
                        >
                            <Star size={14} />
                        </motion.button>
                    )}
                    {showPaymentConfirm && (
                        <motion.button
                            className={`${styles.listActionBtn} ${styles.listActionConfirm}`}
                            onClick={() => onConfirmPayment(booking)}
                            whileTap={{ scale: 0.95 }}
                            title="Confirm Payment"
                        >
                            <DollarSign size={14} />
                        </motion.button>
                    )}
                    {booking.mechanic && ['ASSIGNED', 'IN_PROGRESS'].includes(booking.booking_status) && (
                        <motion.button
                            className={`${styles.listActionBtn} ${styles.listActionChat}`}
                            onClick={() => onChat(booking)}
                            whileTap={{ scale: 0.95 }}
                            title="Chat with Mechanic"
                        >
                            <MessageCircle size={14} />
                        </motion.button>
                    )}
                    {(canComplaint || isCompleted) && (
                        <motion.button
                            className={`${styles.listActionBtn} ${styles.listActionComplaint}`}
                            onClick={() => onComplaint(booking)}
                            whileTap={{ scale: 0.95 }}
                            title="Complaint"
                        >
                            <MessageSquare size={14} />
                        </motion.button>
                    )}
                    {(canCancel || canCancelEmergency) && (
                        <motion.button
                            className={`${styles.listActionBtn} ${styles.listActionCancel}`}
                            onClick={() => onCancel(booking)}
                            whileTap={{ scale: 0.95 }}
                            title="Cancel"
                        >
                            <XCircle size={14} />
                        </motion.button>
                    )}
                    {booking.has_review && (
                        <span className={styles.listReviewDone} title="Review submitted">
                            <CheckCircle size={14} />
                        </span>
                    )}
                    {booking.bills && booking.bills.length > 0 && (
                        <motion.button
                            className={`${styles.listActionBtn}`}
                            onClick={() => onViewBills(booking)}
                            whileTap={{ scale: 0.95 }}
                            title="View Bills"
                            style={{ color: '#818cf8' }}
                        >
                            <Receipt size={14} />
                        </motion.button>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

const MyBookings = () => {
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [complaints, setComplaints] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('all');
    const [viewMode, setViewMode] = useState('grid');
    const [activeTab, setActiveTab] = useState('bookings'); // 'bookings', 'complaints', 'reviews'
    const [showPayment, setShowPayment] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    // Modal states
    const [showReview, setShowReview] = useState(false);
    const [showComplaint, setShowComplaint] = useState(false);
    const [showCancel, setShowCancel] = useState(false);
    const [showEmergencyCancel, setShowEmergencyCancel] = useState(false);
    const [showConfirmPayment, setShowConfirmPayment] = useState(false);
    const [showChat, setShowChat] = useState(false);
    const [chatBookingId, setChatBookingId] = useState(null);
    const [chatOtherName, setChatOtherName] = useState('');
    const [showBillModal, setShowBillModal] = useState(false);
    const [selectedBills, setSelectedBills] = useState([]);

    const menuItems = [
        { label: 'Dashboard', path: '/customer', icon: Home },
        { label: 'My Vehicles', path: '/customer/vehicles', icon: Car },
        { label: 'Find Mechanics', path: '/customer/mechanics', icon: Users },
        { label: 'My Bookings', path: '/customer/bookings', icon: ClipboardList },
    ];

    useEffect(() => {
        fetchBookings();
        fetchComplaintsAndReviews();
    }, []);

    const fetchComplaintsAndReviews = async () => {
        try {
            const [complaintsData, reviewsData] = await Promise.all([
                getCustomerComplaints(),
                getCustomerReviews()
            ]);
            setComplaints(complaintsData);
            setReviews(reviewsData);
        } catch (err) {
            console.error('Error fetching complaints/reviews:', err);
        }
    };

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const data = await getCustomerBookings();
            setBookings(data);
        } catch (err) {
            console.error('Error fetching bookings:', err);
            setError('Failed to load bookings');
        } finally {
            setLoading(false);
        }
    };

    const handlePayment = (booking) => {
        setSelectedBooking(booking);
        setShowPayment(true);
    };

    const handlePaymentComplete = async (paymentData) => {
        setShowPayment(false);
        try {
            await processPayment(selectedBooking.booking_id, paymentData);
            setSuccessMessage('Payment successful! Your booking is confirmed.');
            fetchBookings();
            setTimeout(() => setSuccessMessage(null), 5000);
        } catch (err) {
            console.error('Payment error:', err);
            setError(err.response?.data?.error || 'Payment failed. Please try again.');
        }
    };

    const handleReview = (booking) => {
        setSelectedBooking(booking);
        setShowReview(true);
    };

    const handleReviewSubmit = async (data) => {
        try {
            await createReview(selectedBooking.booking_id, data);
            setSuccessMessage('Thank you for your review!');
            fetchBookings();
            setTimeout(() => setSuccessMessage(null), 5000);
        } catch (err) {
            console.error('Review error:', err);
            setError(err.response?.data?.error || 'Failed to submit review.');
        }
    };

    const handleComplaint = (booking) => {
        setSelectedBooking(booking);
        setShowComplaint(true);
    };

    const handleComplaintSubmit = async (data) => {
        try {
            await createComplaint(selectedBooking.booking_id, data);
            setSuccessMessage('Complaint submitted. An admin will review shortly.');
            fetchBookings();
            setTimeout(() => setSuccessMessage(null), 5000);
        } catch (err) {
            console.error('Complaint error:', err);
            setError(err.response?.data?.error || 'Failed to submit complaint.');
        }
    };

    const handleCancel = (booking) => {
        setSelectedBooking(booking);
        // Route to the appropriate cancel modal
        if (booking.service_type === 'BREAKDOWN') {
            setShowEmergencyCancel(true);
        } else {
            setShowCancel(true);
        }
    };

    const handleCancelSubmit = async (data) => {
        try {
            const result = await cancelBookingByCustomer(selectedBooking.booking_id, data);
            let message = 'Booking cancelled successfully.';
            if (result.refund) {
                message += ` ${result.refund.message}`;
            }
            setSuccessMessage(message);
            fetchBookings();
            setTimeout(() => setSuccessMessage(null), 7000);
        } catch (err) {
            console.error('Cancel error:', err);
            setError(err.response?.data?.error || 'Failed to cancel booking.');
        }
    };

    const handleEmergencyCancelSubmit = async (data) => {
        try {
            const result = await cancelEmergencyBooking(selectedBooking.booking_id, data);
            let message = 'Emergency booking cancelled successfully.';
            if (result.refund) {
                message += ` ${result.refund.message}`;
            }
            setSuccessMessage(message);
            fetchBookings();
            setTimeout(() => setSuccessMessage(null), 7000);
        } catch (err) {
            console.error('Emergency cancel error:', err);
            setError(err.response?.data?.error || 'Failed to cancel emergency booking.');
        }
    };

    const handleConfirmPayment = (booking) => {
        setSelectedBooking(booking);
        setShowConfirmPayment(true);
    };

    const handleConfirmPaymentSubmit = async (data) => {
        try {
            await confirmPayment(selectedBooking.booking_id, data);
            setSuccessMessage(data.confirmed ? 'Payment confirmed!' : 'Payment dispute submitted.');
            fetchBookings();
            setTimeout(() => setSuccessMessage(null), 5000);
        } catch (err) {
            console.error('Confirm payment error:', err);
            setError(err.response?.data?.error || 'Failed to confirm payment.');
        }
    };

    const filteredBookings = bookings.filter(booking => {
        if (filter === 'all') return true;
        if (filter === 'active') return ['PENDING', 'ASSIGNED', 'IN_PROGRESS'].includes(booking.booking_status);
        if (filter === 'completed') return booking.booking_status === 'COMPLETED';
        if (filter === 'emergency') return booking.service_type === 'BREAKDOWN';
        if (filter === 'regular') return booking.service_type === 'HOME_SERVICE';
        return true;
    });

    const pendingPaymentCount = bookings.filter(
        b => b.booking_status === 'ASSIGNED' && b.payment?.advance_status === 'PENDING'
    ).length;

    return (
        <DashboardLayout title="My Bookings" role="CUSTOMER" menuItems={menuItems}>
            <div className={styles.container}>
                {/* Background Effects */}
                <div className={styles.backgroundEffects}>
                    <div className={`${styles.glowBlob} ${styles.blob1}`} />
                    <div className={`${styles.glowBlob} ${styles.blob2}`} />
                </div>

                {/* Header */}
                <header className={styles.pageHeader}>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <h1 className={styles.pageTitle}>Service History</h1>
                        <p className={styles.pageSubtitle}>
                            View and manage all your service bookings, complaints and reviews
                        </p>
                    </motion.div>

                    <div className={styles.headerActions}>
                        <motion.button
                            className={`${styles.headerActionBtn} ${activeTab === 'bookings' ? styles.headerActionActive : ''}`}
                            onClick={() => setActiveTab('bookings')}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <ClipboardList size={18} />
                            My Bookings
                            {bookings.length > 0 && <span className={styles.actionBadge}>{bookings.length}</span>}
                        </motion.button>
                        <motion.button
                            className={`${styles.headerActionBtn} ${activeTab === 'complaints' ? styles.headerActionActive : ''}`}
                            onClick={() => setActiveTab('complaints')}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <MessageSquare size={18} />
                            My Complaints
                            {complaints.length > 0 && <span className={styles.actionBadge}>{complaints.length}</span>}
                        </motion.button>
                        <motion.button
                            className={`${styles.headerActionBtn} ${activeTab === 'reviews' ? styles.headerActionActive : ''}`}
                            onClick={() => setActiveTab('reviews')}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <Star size={18} />
                            My Reviews
                            {reviews.length > 0 && <span className={styles.actionBadge}>{reviews.length}</span>}
                        </motion.button>
                        <motion.button
                            className={styles.refreshBtn}
                            onClick={() => { fetchBookings(); fetchComplaintsAndReviews(); }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <RefreshCw size={18} />
                            Refresh
                        </motion.button>
                    </div>
                </header>

                {/* Alert for pending payments */}
                {pendingPaymentCount > 0 && (
                    <motion.div
                        className={styles.paymentAlert}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <CreditCard size={20} />
                        <span>
                            You have {pendingPaymentCount} booking(s) waiting for confirmation payment.
                        </span>
                    </motion.div>
                )}

                {/* Messages */}
                <AnimatePresence>
                    {error && (
                        <motion.div
                            className={styles.errorMessage}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <AlertTriangle size={18} />
                            {error}
                            <button onClick={() => setError(null)}>&times;</button>
                        </motion.div>
                    )}
                    {successMessage && (
                        <motion.div
                            className={styles.successMessage}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <CheckCircle size={18} />
                            {successMessage}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Bookings Tab Content */}
                {activeTab === 'bookings' && (
                    <>
                        {/* Filter Tabs + View Toggle */}
                        <div className={styles.filterRow}>
                            <div className={styles.filterTabs}>
                                {[
                                    { key: 'all', label: 'All' },
                                    { key: 'active', label: 'Active' },
                                    { key: 'completed', label: 'Completed' },
                                    { key: 'emergency', label: 'Emergency' },
                                    { key: 'regular', label: 'Regular' },
                                ].map(tab => (
                                    <button
                                        key={tab.key}
                                        className={`${styles.filterTab} ${filter === tab.key ? styles.filterActive : ''}`}
                                        onClick={() => setFilter(tab.key)}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                            <div className={styles.viewToggle}>
                                <motion.button
                                    className={`${styles.viewToggleBtn} ${viewMode === 'grid' ? styles.viewToggleActive : ''}`}
                                    onClick={() => setViewMode('grid')}
                                    whileTap={{ scale: 0.92 }}
                                    title="Grid View"
                                >
                                    <LayoutGrid size={18} />
                                </motion.button>
                                <motion.button
                                    className={`${styles.viewToggleBtn} ${viewMode === 'list' ? styles.viewToggleActive : ''}`}
                                    onClick={() => setViewMode('list')}
                                    whileTap={{ scale: 0.92 }}
                                    title="List View"
                                >
                                    <List size={18} />
                                </motion.button>
                            </div>
                        </div>

                        {/* Bookings List */}
                        <div className={styles.bookingsContainer}>
                            {loading ? (
                                <div className={styles.loadingState}>Loading bookings...</div>
                            ) : filteredBookings.length === 0 ? (
                                <div className={styles.emptyState}>
                                    <ClipboardList size={48} />
                                    <h3>No bookings found</h3>
                                    <p>
                                        {filter === 'all'
                                            ? "You haven't made any service bookings yet."
                                            : `No ${filter} bookings found.`}
                                    </p>
                                    <motion.button
                                        className={styles.bookNowBtn}
                                        onClick={() => navigate('/customer/services')}
                                        whileHover={{ scale: 1.02 }}
                                    >
                                        Book a Service
                                    </motion.button>
                                </div>
                            ) : (
                                <div className={viewMode === 'grid' ? styles.bookingsGrid : styles.bookingsList}>
                                    {filteredBookings.map((booking) => (
                                        viewMode === 'grid' ? (
                                            <BookingCard
                                                key={booking.booking_id}
                                                booking={booking}
                                                onPayment={handlePayment}
                                                onReview={handleReview}
                                                onComplaint={handleComplaint}
                                                onCancel={handleCancel}
                                                onConfirmPayment={handleConfirmPayment}
                                                onChat={(b) => {
                                                    setChatBookingId(b.booking_id);
                                                    const mechName = b.mechanic ? `${b.mechanic.first_name || ''} ${b.mechanic.last_name || ''}`.trim() || b.mechanic.username : 'Mechanic';
                                                    setChatOtherName(mechName);
                                                    setShowChat(true);
                                                }}
                                                onViewBills={(b) => {
                                                    setSelectedBills(b.bills || []);
                                                    setShowBillModal(true);
                                                }}
                                            />
                                        ) : (
                                            <BookingListItem
                                                key={booking.booking_id}
                                                booking={booking}
                                                onPayment={handlePayment}
                                                onReview={handleReview}
                                                onComplaint={handleComplaint}
                                                onCancel={handleCancel}
                                                onConfirmPayment={handleConfirmPayment}
                                                onChat={(b) => {
                                                    setChatBookingId(b.booking_id);
                                                    const mechName = b.mechanic ? `${b.mechanic.first_name || ''} ${b.mechanic.last_name || ''}`.trim() || b.mechanic.username : 'Mechanic';
                                                    setChatOtherName(mechName);
                                                    setShowChat(true);
                                                }}
                                                onViewBills={(b) => {
                                                    setSelectedBills(b.bills || []);
                                                    setShowBillModal(true);
                                                }}
                                            />
                                        )
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                )}

                {/* Complaints Tab Content */}
                {activeTab === 'complaints' && (
                    <>
                        {/* View Toggle for Complaints */}
                        <div className={styles.filterRow}>
                            <div className={styles.filterTabs}>
                                <span className={styles.sectionLabel}>My Complaints</span>
                            </div>
                            <div className={styles.viewToggle}>
                                <motion.button
                                    className={`${styles.viewToggleBtn} ${viewMode === 'grid' ? styles.viewToggleActive : ''}`}
                                    onClick={() => setViewMode('grid')}
                                    whileTap={{ scale: 0.92 }}
                                    title="Grid View"
                                >
                                    <LayoutGrid size={18} />
                                </motion.button>
                                <motion.button
                                    className={`${styles.viewToggleBtn} ${viewMode === 'list' ? styles.viewToggleActive : ''}`}
                                    onClick={() => setViewMode('list')}
                                    whileTap={{ scale: 0.92 }}
                                    title="List View"
                                >
                                    <List size={18} />
                                </motion.button>
                            </div>
                        </div>

                        <div className={styles.bookingsContainer}>
                            {complaints.length === 0 ? (
                                <div className={styles.emptyState}>
                                    <MessageSquare size={48} />
                                    <h3>No complaints filed</h3>
                                    <p>You haven't filed any complaints yet.</p>
                                </div>
                            ) : viewMode === 'grid' ? (
                                <div className={styles.complaintsGrid}>
                                    {complaints.map((complaint) => (
                                        <motion.div
                                            key={complaint.id}
                                            className={styles.complaintCard}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                        >
                                            <div className={styles.complaintHeader}>
                                                <span className={styles.bookingIdLabel}>
                                                    Booking #{complaint.booking_id}
                                                </span>
                                                <span className={`${styles.complaintStatus} ${styles[`status${complaint.status}`]}`}>
                                                    {complaint.status.replace('_', ' ')}
                                                </span>
                                            </div>

                                            <div className={styles.complaintMeta}>
                                                <div className={styles.detailRow}>
                                                    <Car size={16} />
                                                    <span>{complaint.vehicle_name}</span>
                                                </div>
                                                <div className={styles.detailRow}>
                                                    <Wrench size={16} />
                                                    <span>{complaint.service_type}</span>
                                                </div>
                                                <div className={styles.detailRow}>
                                                    <User size={16} />
                                                    <span>Mechanic: {complaint.mechanic_name}</span>
                                                </div>
                                            </div>

                                            <div className={styles.complaintContent}>
                                                <h4>Your Complaint:</h4>
                                                <p>{complaint.complaint_text}</p>
                                            </div>

                                            {complaint.admin_response && (
                                                <div className={styles.adminResponse}>
                                                    <h4>Admin Response:</h4>
                                                    <p>{complaint.admin_response}</p>
                                                </div>
                                            )}

                                            <div className={styles.complaintFooter}>
                                                <span className={styles.complaintDate}>
                                                    <Calendar size={14} />
                                                    Filed: {new Date(complaint.created_at).toLocaleDateString('en-IN', {
                                                        day: 'numeric', month: 'short', year: 'numeric'
                                                    })}
                                                </span>
                                                {complaint.resolved_at && (
                                                    <span className={styles.complaintDate}>
                                                        <CheckCircle size={14} />
                                                        Resolved: {new Date(complaint.resolved_at).toLocaleDateString('en-IN', {
                                                            day: 'numeric', month: 'short', year: 'numeric'
                                                        })}
                                                    </span>
                                                )}
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <div className={styles.bookingsList}>
                                    {complaints.map((complaint) => (
                                        <motion.div
                                            key={complaint.id}
                                            className={styles.listItem}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                        >
                                            <div className={styles.listItemLeft}>
                                                <span className={`${styles.complaintStatus} ${styles[`status${complaint.status}`]}`}>
                                                    {complaint.status.replace('_', ' ')}
                                                </span>
                                            </div>
                                            <div className={styles.listItemCenter}>
                                                <span className={styles.listVehicle}>
                                                    <Car size={14} /> {complaint.vehicle_name}
                                                </span>
                                                <span className={styles.listDetail}>
                                                    <Wrench size={14} /> {complaint.service_type}
                                                </span>
                                                <span className={styles.listDetail}>
                                                    <User size={14} /> {complaint.mechanic_name}
                                                </span>
                                            </div>
                                            <div className={styles.listItemRight}>
                                                <span className={styles.listDetail} style={{ fontSize: '0.75rem' }}>
                                                    #{complaint.booking_id}
                                                </span>
                                                <span className={styles.listDate}>
                                                    {new Date(complaint.created_at).toLocaleDateString('en-IN', {
                                                        day: 'numeric', month: 'short'
                                                    })}
                                                </span>
                                                {complaint.admin_response && (
                                                    <span className={styles.listReviewDone} title="Admin responded">
                                                        <CheckCircle size={14} />
                                                    </span>
                                                )}
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                )}

                {/* Reviews Tab Content */}
                {activeTab === 'reviews' && (
                    <>
                        {/* View Toggle for Reviews */}
                        <div className={styles.filterRow}>
                            <div className={styles.filterTabs}>
                                <span className={styles.sectionLabel}>My Reviews</span>
                            </div>
                            <div className={styles.viewToggle}>
                                <motion.button
                                    className={`${styles.viewToggleBtn} ${viewMode === 'grid' ? styles.viewToggleActive : ''}`}
                                    onClick={() => setViewMode('grid')}
                                    whileTap={{ scale: 0.92 }}
                                    title="Grid View"
                                >
                                    <LayoutGrid size={18} />
                                </motion.button>
                                <motion.button
                                    className={`${styles.viewToggleBtn} ${viewMode === 'list' ? styles.viewToggleActive : ''}`}
                                    onClick={() => setViewMode('list')}
                                    whileTap={{ scale: 0.92 }}
                                    title="List View"
                                >
                                    <List size={18} />
                                </motion.button>
                            </div>
                        </div>

                        <div className={styles.bookingsContainer}>
                            {reviews.length === 0 ? (
                                <div className={styles.emptyState}>
                                    <Star size={48} />
                                    <h3>No reviews given</h3>
                                    <p>You haven't submitted any reviews yet.</p>
                                </div>
                            ) : viewMode === 'grid' ? (
                                <div className={styles.reviewsGrid}>
                                    {reviews.map((review) => (
                                        <motion.div
                                            key={review.id}
                                            className={styles.reviewCard}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                        >
                                            <div className={styles.reviewHeader}>
                                                <span className={styles.bookingIdLabel}>
                                                    Booking #{review.booking_id}
                                                </span>
                                                <div className={styles.reviewRating}>
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <Star
                                                            key={star}
                                                            size={16}
                                                            className={star <= review.rating ? styles.starFilled : styles.starEmpty}
                                                            fill={star <= review.rating ? '#fbbf24' : 'none'}
                                                        />
                                                    ))}
                                                    <span>{review.rating}/5</span>
                                                </div>
                                            </div>

                                            <div className={styles.reviewMeta}>
                                                <div className={styles.detailRow}>
                                                    <Car size={16} />
                                                    <span>{review.vehicle_name}</span>
                                                </div>
                                                <div className={styles.detailRow}>
                                                    <Wrench size={16} />
                                                    <span>{review.service_type}</span>
                                                </div>
                                                <div className={styles.detailRow}>
                                                    <User size={16} />
                                                    <span>Mechanic: {review.mechanic_name}</span>
                                                </div>
                                            </div>

                                            {review.review_text && (
                                                <div className={styles.reviewContent}>
                                                    <p>"{review.review_text}"</p>
                                                </div>
                                            )}

                                            <div className={styles.reviewFooter}>
                                                <span className={styles.reviewDate}>
                                                    <Calendar size={14} />
                                                    {new Date(review.created_at).toLocaleDateString('en-IN', {
                                                        day: 'numeric', month: 'short', year: 'numeric'
                                                    })}
                                                </span>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <div className={styles.bookingsList}>
                                    {reviews.map((review) => (
                                        <motion.div
                                            key={review.id}
                                            className={styles.listItem}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                        >
                                            <div className={styles.listItemLeft}>
                                                <div className={styles.reviewRatingCompact}>
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <Star
                                                            key={star}
                                                            size={12}
                                                            className={star <= review.rating ? styles.starFilled : styles.starEmpty}
                                                            fill={star <= review.rating ? '#fbbf24' : 'none'}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                            <div className={styles.listItemCenter}>
                                                <span className={styles.listVehicle}>
                                                    <Car size={14} /> {review.vehicle_name}
                                                </span>
                                                <span className={styles.listDetail}>
                                                    <Wrench size={14} /> {review.service_type}
                                                </span>
                                                <span className={styles.listDetail}>
                                                    <User size={14} /> {review.mechanic_name}
                                                </span>
                                            </div>
                                            <div className={styles.listItemRight}>
                                                <span className={styles.listDetail} style={{ fontSize: '0.75rem' }}>
                                                    #{review.booking_id}
                                                </span>
                                                <span className={styles.listDate}>
                                                    {new Date(review.created_at).toLocaleDateString('en-IN', {
                                                        day: 'numeric', month: 'short'
                                                    })}
                                                </span>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                )}

                {/* Payment Modal */}
                <PaymentModal
                    isOpen={showPayment}
                    onClose={() => setShowPayment(false)}
                    amount={1000}
                    minAmount={1000}
                    allowHigherAmount={false}
                    onPaymentComplete={handlePaymentComplete}
                    title="Confirm Booking"
                    description="Pay ₹1000 to confirm your service booking"
                />

                {/* Review Modal */}
                <AnimatePresence>
                    {showReview && (
                        <ReviewModal
                            isOpen={showReview}
                            onClose={() => setShowReview(false)}
                            onSubmit={handleReviewSubmit}
                            booking={selectedBooking}
                        />
                    )}
                </AnimatePresence>

                {/* Complaint Modal */}
                <AnimatePresence>
                    {showComplaint && (
                        <ComplaintModal
                            isOpen={showComplaint}
                            onClose={() => setShowComplaint(false)}
                            onSubmit={handleComplaintSubmit}
                            booking={selectedBooking}
                        />
                    )}
                </AnimatePresence>

                {/* Cancel Modal */}
                <AnimatePresence>
                    {showCancel && (
                        <CancelModal
                            isOpen={showCancel}
                            onClose={() => setShowCancel(false)}
                            onSubmit={handleCancelSubmit}
                            booking={selectedBooking}
                        />
                    )}
                </AnimatePresence>

                {/* Emergency Cancel Modal */}
                <AnimatePresence>
                    {showEmergencyCancel && (
                        <EmergencyCancelModal
                            isOpen={showEmergencyCancel}
                            onClose={() => setShowEmergencyCancel(false)}
                            onSubmit={handleEmergencyCancelSubmit}
                            booking={selectedBooking}
                        />
                    )}
                </AnimatePresence>

                {/* Confirm Payment Modal */}
                <AnimatePresence>
                    {showConfirmPayment && (
                        <ConfirmPaymentModal
                            isOpen={showConfirmPayment}
                            onClose={() => setShowConfirmPayment(false)}
                            onSubmit={handleConfirmPaymentSubmit}
                            booking={selectedBooking}
                        />
                    )}
                </AnimatePresence>
            </div>

            {/* Chat Drawer */}
            <BookingChat
                isOpen={showChat}
                onClose={() => setShowChat(false)}
                bookingId={chatBookingId}
                otherPartyName={chatOtherName}
                currentUserRole="CUSTOMER"
            />

            {/* Bill Modal */}
            <BillModal
                isOpen={showBillModal}
                onClose={() => setShowBillModal(false)}
                bills={selectedBills}
            />
        </DashboardLayout>
    );
};

export default MyBookings;
