import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Car, MapPin, AlertTriangle, ArrowRight, ArrowLeft,
    Home, ClipboardList, Users, CheckCircle, Plus
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PaymentModal from '../../components/booking/PaymentModal';
import { getVehicles } from '../../services/vehicleService';
import { createEmergencyBooking, processPayment } from '../../services/bookingService';
import styles from '../../styles/EmergencyBooking.module.css';

const EmergencyBookingFlow = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [showPayment, setShowPayment] = useState(false);
    const [bookingId, setBookingId] = useState(null);

    // Form data
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [formData, setFormData] = useState({
        district: '',
        place: '',
        service_details: ''
    });
    const [paymentAmount, setPaymentAmount] = useState(1500);

    const menuItems = [
        { label: 'Dashboard', path: '/customer', icon: Home },
        { label: 'My Vehicles', path: '/customer/vehicles', icon: Car },
        { label: 'Find Mechanics', path: '/customer/mechanics', icon: Users },
        { label: 'My Bookings', path: '/customer/bookings', icon: ClipboardList },
    ];

    // Fetch vehicles on mount
    useEffect(() => {
        const fetchVehicles = async () => {
            try {
                const data = await getVehicles();
                setVehicles(data);
                if (data.length === 0) {
                    // No vehicles - redirect to add vehicle
                    navigate('/customer/vehicles', {
                        state: { message: 'Please add a vehicle first to book emergency service.' }
                    });
                }
            } catch (err) {
                console.error('Error fetching vehicles:', err);
                setError('Failed to load vehicles');
            } finally {
                setLoading(false);
            }
        };
        fetchVehicles();
    }, [navigate]);

    const handleVehicleSelect = (vehicle) => {
        setSelectedVehicle(vehicle);
        setStep(2);
    };

    const handleLocationSubmit = (e) => {
        e.preventDefault();
        if (!formData.district || !formData.place || !formData.service_details) {
            setError('Please fill in all fields');
            return;
        }
        setError(null);
        setStep(3);
    };

    const handleProceedToPayment = () => {
        setShowPayment(true);
    };

    const handlePaymentComplete = async (paymentData) => {
        setShowPayment(false);
        setSubmitting(true);
        setError(null);

        try {
            // Create the booking
            const bookingData = {
                vehicle_id: selectedVehicle.id,
                district: formData.district,
                place: formData.place,
                service_details: formData.service_details,
                payment_amount: paymentData.amount
            };

            const response = await createEmergencyBooking(bookingData);
            setBookingId(response.booking.booking_id);
            setStep(4); // Success step
        } catch (err) {
            console.error('Booking error:', err);
            setError(err.response?.data?.error || 'Failed to create booking. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const renderStepIndicator = () => (
        <div className={styles.stepIndicator}>
            {[1, 2, 3, 4].map((s) => (
                <div
                    key={s}
                    className={`${styles.stepDot} ${step >= s ? styles.stepActive : ''} ${step === s ? styles.stepCurrent : ''}`}
                >
                    {step > s ? <CheckCircle size={16} /> : s}
                </div>
            ))}
        </div>
    );

    return (
        <DashboardLayout title="Emergency Booking" role="CUSTOMER" menuItems={menuItems}>
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
                        transition={{ duration: 0.6 }}
                    >
                        <div className={styles.emergencyBadge}>
                            <AlertTriangle size={18} />
                            EMERGENCY SERVICE
                        </div>
                        <h1 className={styles.pageTitle}>Request Emergency Help</h1>
                        <p className={styles.pageSubtitle}>
                            Our verified mechanics will reach you within 30-60 minutes
                        </p>
                    </motion.div>
                </header>

                {/* Step Indicator */}
                {renderStepIndicator()}

                {/* Error Message */}
                {error && (
                    <motion.div
                        className={styles.errorMessage}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <AlertTriangle size={18} />
                        {error}
                    </motion.div>
                )}

                {/* Content */}
                <div className={styles.contentWrapper}>
                    <AnimatePresence mode="wait">
                        {/* Step 1: Vehicle Selection */}
                        {step === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -50 }}
                                className={styles.stepContent}
                            >
                                <h2 className={styles.stepTitle}>Select Your Vehicle</h2>
                                <p className={styles.stepDesc}>Choose the vehicle that needs assistance</p>

                                {loading ? (
                                    <div className={styles.loadingState}>Loading vehicles...</div>
                                ) : (
                                    <div className={styles.vehicleGrid}>
                                        {vehicles.map((vehicle) => (
                                            <motion.div
                                                key={vehicle.id}
                                                className={`${styles.vehicleCard} ${selectedVehicle?.id === vehicle.id ? styles.selected : ''}`}
                                                onClick={() => handleVehicleSelect(vehicle)}
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                            >
                                                <div className={styles.vehicleIcon}>
                                                    <Car size={32} />
                                                </div>
                                                <div className={styles.vehicleInfo}>
                                                    <h3>{vehicle.vehicle_name}</h3>
                                                    <p>{vehicle.vehicle_brand} {vehicle.vehicle_model}</p>
                                                    <span className={styles.regNo}>{vehicle.registration_no}</span>
                                                </div>
                                                <div className={styles.vehicleType}>{vehicle.vehicle_type}</div>
                                            </motion.div>
                                        ))}

                                        {/* Add New Vehicle */}
                                        <motion.div
                                            className={styles.addVehicleCard}
                                            onClick={() => navigate('/customer/vehicles')}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            <Plus size={32} />
                                            <span>Add New Vehicle</span>
                                        </motion.div>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {/* Step 2: Location Details */}
                        {step === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -50 }}
                                className={styles.stepContent}
                            >
                                <h2 className={styles.stepTitle}>Your Location & Issue</h2>
                                <p className={styles.stepDesc}>Tell us where you are and what's wrong</p>

                                <form onSubmit={handleLocationSubmit} className={styles.locationForm}>
                                    <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>
                                            <MapPin size={16} /> District
                                        </label>
                                        <input
                                            type="text"
                                            className={styles.formInput}
                                            placeholder="e.g. Ernakulam"
                                            value={formData.district}
                                            onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>
                                            <MapPin size={16} /> Place
                                        </label>
                                        <input
                                            type="text"
                                            className={styles.formInput}
                                            placeholder="e.g. MG Road Junction"
                                            value={formData.place}
                                            onChange={(e) => setFormData({ ...formData, place: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>
                                            <AlertTriangle size={16} /> Describe the Issue
                                        </label>
                                        <textarea
                                            className={styles.formTextarea}
                                            placeholder="e.g. Flat tire on rear left, engine not starting, car overheating..."
                                            value={formData.service_details}
                                            onChange={(e) => setFormData({ ...formData, service_details: e.target.value })}
                                            rows={4}
                                            required
                                        />
                                    </div>

                                    <div className={styles.formActions}>
                                        <button
                                            type="button"
                                            className={styles.backBtn}
                                            onClick={() => setStep(1)}
                                        >
                                            <ArrowLeft size={18} /> Back
                                        </button>
                                        <button type="submit" className={styles.nextBtn}>
                                            Continue <ArrowRight size={18} />
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        )}

                        {/* Step 3: Payment Summary */}
                        {step === 3 && (
                            <motion.div
                                key="step3"
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -50 }}
                                className={styles.stepContent}
                            >
                                <h2 className={styles.stepTitle}>Confirm & Pay</h2>
                                <p className={styles.stepDesc}>Review your booking and make payment</p>

                                {/* Booking Summary */}
                                <div className={styles.summaryCard}>
                                    <div className={styles.summarySection}>
                                        <h4>Vehicle</h4>
                                        <p>{selectedVehicle?.vehicle_name} ({selectedVehicle?.registration_no})</p>
                                    </div>
                                    <div className={styles.summarySection}>
                                        <h4>Location</h4>
                                        <p>{formData.place}, {formData.district}</p>
                                    </div>
                                    <div className={styles.summarySection}>
                                        <h4>Issue</h4>
                                        <p>{formData.service_details}</p>
                                    </div>
                                </div>

                                {/* Payment Info */}
                                <div className={styles.paymentInfo}>
                                    <div className={styles.paymentNote}>
                                        <AlertTriangle size={18} />
                                        <span>Minimum advance payment of ₹1500 is required for emergency services. You can pay more if you wish.</span>
                                    </div>
                                    <div className={styles.amountSelector}>
                                        <label>Payment Amount</label>
                                        <div className={styles.amountInput}>
                                            <span>₹</span>
                                            <input
                                                type="number"
                                                value={paymentAmount}
                                                onChange={(e) => setPaymentAmount(Math.max(1500, Number(e.target.value)))}
                                                min={1500}
                                            />
                                        </div>
                                        <span className={styles.minText}>Minimum: ₹1500</span>
                                    </div>
                                </div>

                                <div className={styles.formActions}>
                                    <button
                                        type="button"
                                        className={styles.backBtn}
                                        onClick={() => setStep(2)}
                                    >
                                        <ArrowLeft size={18} /> Back
                                    </button>
                                    <button
                                        type="button"
                                        className={styles.payBtn}
                                        onClick={handleProceedToPayment}
                                        disabled={submitting}
                                    >
                                        Proceed to Pay ₹{paymentAmount}
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* Step 4: Success */}
                        {step === 4 && (
                            <motion.div
                                key="step4"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className={styles.successContent}
                            >
                                <motion.div
                                    className={styles.successIcon}
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.2, type: 'spring' }}
                                >
                                    <CheckCircle size={64} />
                                </motion.div>
                                <h2>Booking Confirmed!</h2>
                                <p>Your emergency service request has been submitted.</p>
                                <p className={styles.bookingRef}>Booking ID: #{bookingId}</p>
                                <p className={styles.infoText}>
                                    Available mechanics in your area will be notified.
                                    You'll receive updates once a mechanic accepts your request.
                                </p>
                                <button
                                    className={styles.doneBtn}
                                    onClick={() => navigate('/customer')}
                                >
                                    Go to Dashboard
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Payment Modal */}
                <PaymentModal
                    isOpen={showPayment}
                    onClose={() => setShowPayment(false)}
                    amount={paymentAmount}
                    minAmount={1500}
                    allowHigherAmount={true}
                    onPaymentComplete={handlePaymentComplete}
                    title="Emergency Service Payment"
                    description="Pay advance for emergency breakdown service"
                />
            </div>
        </DashboardLayout>
    );
};

export default EmergencyBookingFlow;
