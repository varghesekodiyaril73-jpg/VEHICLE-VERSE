import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Car, MapPin, Wrench, ArrowRight, ArrowLeft, Calendar,
    Home, ClipboardList, Users, CheckCircle, Plus, Clock,
    ChevronLeft, ChevronRight
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { getVehicles } from '../../services/vehicleService';
import { createRegularBooking } from '../../services/bookingService';
import styles from '../../styles/RegularBooking.module.css';

const RegularBookingFlow = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [bookingId, setBookingId] = useState(null);

    // Form data — default date to today and time to 09:00 AM
    const todayObj = new Date();
    const todayStr = todayObj.toISOString().split('T')[0];
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 2);
    const maxDateStr = maxDate.toISOString().split('T')[0];

    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [formData, setFormData] = useState({
        district: '',
        place: '',
        address_line: '',
        service_category: '',
        service_details: '',
        scheduled_date: todayStr,
        scheduled_time: '09:00'
    });

    // Calendar state
    const [calendarMonth, setCalendarMonth] = useState(todayObj.getMonth());
    const [calendarYear, setCalendarYear] = useState(todayObj.getFullYear());

    // AM/PM time state
    const [selectedHour, setSelectedHour] = useState(9);
    const [selectedMinute, setSelectedMinute] = useState(0);
    const [selectedPeriod, setSelectedPeriod] = useState('AM');

    const menuItems = [
        { label: 'Dashboard', path: '/customer', icon: Home },
        { label: 'My Vehicles', path: '/customer/vehicles', icon: Car },
        { label: 'Find Mechanics', path: '/customer/mechanics', icon: Users },
        { label: 'My Bookings', path: '/customer/bookings', icon: ClipboardList },
    ];

    const serviceCategories = [
        'Oil Change', 'Brake Service', 'Engine Tune-up', 'Battery Replacement',
        'Tire Service', 'AC Service', 'Full Service', 'Other'
    ];

    // ── Calendar helpers ──
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const calendarDays = useMemo(() => {
        const firstDay = new Date(calendarYear, calendarMonth, 1).getDay();
        const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
        const days = [];
        // Blank slots before first day
        for (let i = 0; i < firstDay; i++) days.push(null);
        for (let d = 1; d <= daysInMonth; d++) days.push(d);
        return days;
    }, [calendarMonth, calendarYear]);

    const isDateDisabled = (day) => {
        if (!day) return true;
        const dateStr = `${calendarYear}-${String(calendarMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return dateStr < todayStr || dateStr > maxDateStr;
    };

    const isDateSelected = (day) => {
        if (!day) return false;
        const dateStr = `${calendarYear}-${String(calendarMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return dateStr === formData.scheduled_date;
    };

    const isToday = (day) => {
        if (!day) return false;
        const dateStr = `${calendarYear}-${String(calendarMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return dateStr === todayStr;
    };

    const handleDayClick = (day) => {
        if (!day || isDateDisabled(day)) return;
        const dateStr = `${calendarYear}-${String(calendarMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        setFormData({ ...formData, scheduled_date: dateStr });
    };

    const goToPrevMonth = () => {
        if (calendarMonth === 0) {
            setCalendarMonth(11);
            setCalendarYear(calendarYear - 1);
        } else {
            setCalendarMonth(calendarMonth - 1);
        }
    };

    const goToNextMonth = () => {
        if (calendarMonth === 11) {
            setCalendarMonth(0);
            setCalendarYear(calendarYear + 1);
        } else {
            setCalendarMonth(calendarMonth + 1);
        }
    };

    // Check if prev/next month buttons should be disabled
    const canGoPrev = (() => {
        const prevMonth = calendarMonth === 0 ? 11 : calendarMonth - 1;
        const prevYear = calendarMonth === 0 ? calendarYear - 1 : calendarYear;
        const lastDayPrev = new Date(prevYear, prevMonth + 1, 0);
        return lastDayPrev >= todayObj;
    })();

    const canGoNext = (() => {
        const nextMonth = calendarMonth === 11 ? 0 : calendarMonth + 1;
        const nextYear = calendarMonth === 11 ? calendarYear + 1 : calendarYear;
        const firstDayNext = new Date(nextYear, nextMonth, 1);
        return firstDayNext <= maxDate;
    })();

    // ── Time helpers ──
    const updateTime = (hour, minute, period) => {
        let h24 = hour;
        if (period === 'PM' && hour !== 12) h24 = hour + 12;
        if (period === 'AM' && hour === 12) h24 = 0;
        const timeStr = `${String(h24).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
        setFormData(prev => ({ ...prev, scheduled_time: timeStr }));
    };

    const handleHourChange = (h) => {
        setSelectedHour(h);
        updateTime(h, selectedMinute, selectedPeriod);
    };

    const handleMinuteChange = (m) => {
        setSelectedMinute(m);
        updateTime(selectedHour, m, selectedPeriod);
    };

    const handlePeriodToggle = (p) => {
        setSelectedPeriod(p);
        updateTime(selectedHour, selectedMinute, p);
    };

    // Fetch vehicles on mount
    useEffect(() => {
        const fetchVehicles = async () => {
            try {
                const data = await getVehicles();
                setVehicles(data);
                if (data.length === 0) {
                    navigate('/customer/vehicles', {
                        state: { message: 'Please add a vehicle first to book a service.' }
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

    const handleDetailsSubmit = (e) => {
        e.preventDefault();
        if (!formData.district || !formData.place || !formData.service_category || !formData.service_details) {
            setError('Please fill in all required fields');
            return;
        }
        setError(null);
        setStep(3);
    };

    const handleScheduleSubmit = (e) => {
        e.preventDefault();
        if (!formData.scheduled_date || !formData.scheduled_time) {
            setError('Please select date and time');
            return;
        }
        setError(null);
        setStep(4);
    };

    const handleFinalSubmit = async () => {
        setSubmitting(true);
        setError(null);

        try {
            const bookingData = {
                vehicle_id: selectedVehicle.id,
                district: formData.district,
                place: formData.place,
                address_line: formData.address_line,
                service_category: formData.service_category,
                service_details: formData.service_details,
                scheduled_date: formData.scheduled_date,
                scheduled_time: formData.scheduled_time
            };

            const response = await createRegularBooking(bookingData);
            setBookingId(response.booking.booking_id);
            setStep(5);
        } catch (err) {
            console.error('Booking error:', err);
            setError(err.response?.data?.error || 'Failed to create booking. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const renderStepIndicator = () => (
        <div className={styles.stepIndicator}>
            {[1, 2, 3, 4, 5].map((s) => (
                <div
                    key={s}
                    className={`${styles.stepDot} ${step >= s ? styles.stepActive : ''} ${step === s ? styles.stepCurrent : ''}`}
                >
                    {step > s ? <CheckCircle size={16} /> : s}
                </div>
            ))}
        </div>
    );

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    };

    const formatTime = (timeStr) => {
        if (!timeStr) return '';
        const [hours, minutes] = timeStr.split(':');
        const hour = parseInt(hours, 10);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes} ${ampm}`;
    };

    return (
        <DashboardLayout title="Schedule Service" role="CUSTOMER" menuItems={menuItems}>
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
                        <div className={styles.serviceBadge}>
                            <Wrench size={18} />
                            REGULAR SERVICE
                        </div>
                        <h1 className={styles.pageTitle}>Schedule a Service</h1>
                        <p className={styles.pageSubtitle}>
                            Book maintenance at your convenience - we'll come to you
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
                                <p className={styles.stepDesc}>Choose the vehicle that needs service</p>

                                {loading ? (
                                    <div className={styles.loadingState}>Loading vehicles...</div>
                                ) : (
                                    <div className={styles.vehicleGrid}>
                                        {vehicles.map((vehicle) => (
                                            <motion.div
                                                key={vehicle.id}
                                                className={styles.vehicleCard}
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
                                            </motion.div>
                                        ))}

                                        <motion.div
                                            className={styles.addVehicleCard}
                                            onClick={() => navigate('/customer/vehicles')}
                                            whileHover={{ scale: 1.02 }}
                                        >
                                            <Plus size={32} />
                                            <span>Add New Vehicle</span>
                                        </motion.div>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {/* Step 2: Service Details */}
                        {step === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -50 }}
                                className={styles.stepContent}
                            >
                                <h2 className={styles.stepTitle}>Service Details</h2>
                                <p className={styles.stepDesc}>Tell us about the service you need</p>

                                <form onSubmit={handleDetailsSubmit} className={styles.serviceForm}>
                                    <div className={styles.formRow}>
                                        <div className={styles.formGroup}>
                                            <label className={styles.formLabel}>
                                                <MapPin size={16} /> District *
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
                                                <MapPin size={16} /> Place *
                                            </label>
                                            <input
                                                type="text"
                                                className={styles.formInput}
                                                placeholder="e.g. Kakkanad"
                                                value={formData.place}
                                                onChange={(e) => setFormData({ ...formData, place: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>
                                            <Home size={16} /> Full Address (Optional)
                                        </label>
                                        <input
                                            type="text"
                                            className={styles.formInput}
                                            placeholder="House/Apartment name, street..."
                                            value={formData.address_line}
                                            onChange={(e) => setFormData({ ...formData, address_line: e.target.value })}
                                        />
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>
                                            <Wrench size={16} /> Service Type *
                                        </label>
                                        <div className={styles.categoryGrid}>
                                            {serviceCategories.map((cat) => (
                                                <button
                                                    key={cat}
                                                    type="button"
                                                    className={`${styles.categoryBtn} ${formData.service_category === cat ? styles.categoryActive : ''}`}
                                                    onClick={() => setFormData({ ...formData, service_category: cat })}
                                                >
                                                    {cat}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>
                                            Describe the issue or service needed *
                                        </label>
                                        <textarea
                                            className={styles.formTextarea}
                                            placeholder="e.g. Need oil change and general checkup..."
                                            value={formData.service_details}
                                            onChange={(e) => setFormData({ ...formData, service_details: e.target.value })}
                                            rows={3}
                                            required
                                        />
                                    </div>

                                    <div className={styles.formActions}>
                                        <button type="button" className={styles.backBtn} onClick={() => setStep(1)}>
                                            <ArrowLeft size={18} /> Back
                                        </button>
                                        <button type="submit" className={styles.nextBtn}>
                                            Continue <ArrowRight size={18} />
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        )}

                        {/* Step 3: Schedule */}
                        {step === 3 && (
                            <motion.div
                                key="step3"
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -50 }}
                                className={styles.stepContent}
                            >
                                <h2 className={styles.stepTitle}>Choose Date & Time</h2>
                                <p className={styles.stepDesc}>Select your preferred schedule (up to 2 months ahead)</p>

                                <form onSubmit={handleScheduleSubmit} className={styles.scheduleForm}>
                                    {/* ── Calendar ── */}
                                    <div className={styles.calendarSection}>
                                        <label className={styles.formLabel}>
                                            <Calendar size={16} /> Preferred Date *
                                        </label>
                                        <div className={styles.calendarCard}>
                                            {/* Month navigation */}
                                            <div className={styles.calendarHeader}>
                                                <button
                                                    type="button"
                                                    className={styles.calNavBtn}
                                                    onClick={goToPrevMonth}
                                                    disabled={!canGoPrev}
                                                >
                                                    <ChevronLeft size={18} />
                                                </button>
                                                <span className={styles.calMonthYear}>
                                                    {monthNames[calendarMonth]} {calendarYear}
                                                </span>
                                                <button
                                                    type="button"
                                                    className={styles.calNavBtn}
                                                    onClick={goToNextMonth}
                                                    disabled={!canGoNext}
                                                >
                                                    <ChevronRight size={18} />
                                                </button>
                                            </div>

                                            {/* Day names */}
                                            <div className={styles.calendarDayNames}>
                                                {dayNames.map(d => (
                                                    <span key={d} className={styles.calDayName}>{d}</span>
                                                ))}
                                            </div>

                                            {/* Day grid */}
                                            <div className={styles.calendarGrid}>
                                                {calendarDays.map((day, idx) => (
                                                    <button
                                                        key={idx}
                                                        type="button"
                                                        disabled={isDateDisabled(day)}
                                                        onClick={() => handleDayClick(day)}
                                                        className={[
                                                            styles.calDay,
                                                            !day ? styles.calDayEmpty : '',
                                                            isDateDisabled(day) ? styles.calDayDisabled : '',
                                                            isDateSelected(day) ? styles.calDaySelected : '',
                                                            isToday(day) && !isDateSelected(day) ? styles.calDayToday : ''
                                                        ].filter(Boolean).join(' ')}
                                                    >
                                                        {day || ''}
                                                    </button>
                                                ))}
                                            </div>

                                            {/* Selected date display */}
                                            {formData.scheduled_date && (
                                                <div className={styles.selectedDateDisplay}>
                                                    <CheckCircle size={14} />
                                                    {formatDate(formData.scheduled_date)}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* ── AM/PM Time Picker ── */}
                                    <div className={styles.timeSection}>
                                        <label className={styles.formLabel}>
                                            <Clock size={16} /> Preferred Time *
                                        </label>
                                        <div className={styles.timePickerCard}>
                                            <div className={styles.timePickerRow}>
                                                {/* Hour */}
                                                <div className={styles.timeColumn}>
                                                    <span className={styles.timeColumnLabel}>Hour</span>
                                                    <select
                                                        className={styles.timeSelect}
                                                        value={selectedHour}
                                                        onChange={(e) => handleHourChange(parseInt(e.target.value, 10))}
                                                    >
                                                        {[12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(h => (
                                                            <option key={h} value={h}>{String(h).padStart(2, '0')}</option>
                                                        ))}
                                                    </select>
                                                </div>

                                                <span className={styles.timeColon}>:</span>

                                                {/* Minute */}
                                                <div className={styles.timeColumn}>
                                                    <span className={styles.timeColumnLabel}>Minute</span>
                                                    <select
                                                        className={styles.timeSelect}
                                                        value={selectedMinute}
                                                        onChange={(e) => handleMinuteChange(parseInt(e.target.value, 10))}
                                                    >
                                                        {[0, 15, 30, 45].map(m => (
                                                            <option key={m} value={m}>{String(m).padStart(2, '0')}</option>
                                                        ))}
                                                    </select>
                                                </div>

                                                {/* AM/PM Toggle */}
                                                <div className={styles.timeColumn}>
                                                    <span className={styles.timeColumnLabel}>Period</span>
                                                    <div className={styles.periodToggle}>
                                                        <button
                                                            type="button"
                                                            className={`${styles.periodBtn} ${selectedPeriod === 'AM' ? styles.periodActive : ''}`}
                                                            onClick={() => handlePeriodToggle('AM')}
                                                        >
                                                            AM
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className={`${styles.periodBtn} ${selectedPeriod === 'PM' ? styles.periodActive : ''}`}
                                                            onClick={() => handlePeriodToggle('PM')}
                                                        >
                                                            PM
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Time display */}
                                            <div className={styles.timeDisplay}>
                                                <Clock size={14} />
                                                {String(selectedHour).padStart(2, '0')}:{String(selectedMinute).padStart(2, '0')} {selectedPeriod}
                                            </div>
                                        </div>
                                    </div>

                                    <div className={styles.formActions}>
                                        <button type="button" className={styles.backBtn} onClick={() => setStep(2)}>
                                            <ArrowLeft size={18} /> Back
                                        </button>
                                        <button type="submit" className={styles.nextBtn}>
                                            Review Booking <ArrowRight size={18} />
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        )}

                        {/* Step 4: Review */}
                        {step === 4 && (
                            <motion.div
                                key="step4"
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -50 }}
                                className={styles.stepContent}
                            >
                                <h2 className={styles.stepTitle}>Review Your Booking</h2>
                                <p className={styles.stepDesc}>Confirm the details before submitting</p>

                                <div className={styles.reviewCard}>
                                    <div className={styles.reviewSection}>
                                        <h4>Vehicle</h4>
                                        <p>{selectedVehicle?.vehicle_name}</p>
                                        <span>{selectedVehicle?.registration_no}</span>
                                    </div>
                                    <div className={styles.reviewSection}>
                                        <h4>Location</h4>
                                        <p>{formData.place}, {formData.district}</p>
                                        {formData.address_line && <span>{formData.address_line}</span>}
                                    </div>
                                    <div className={styles.reviewSection}>
                                        <h4>Service</h4>
                                        <p>{formData.service_category}</p>
                                        <span>{formData.service_details}</span>
                                    </div>
                                    <div className={styles.reviewSection}>
                                        <h4>Schedule</h4>
                                        <p>{formatDate(formData.scheduled_date)}</p>
                                        <span>at {formatTime(formData.scheduled_time)}</span>
                                    </div>
                                </div>

                                <div className={styles.paymentNote}>
                                    <span>💡</span>
                                    <p>No payment required now. You'll pay ₹1000 as confirmation after a mechanic accepts your request.</p>
                                </div>

                                <div className={styles.formActions}>
                                    <button type="button" className={styles.backBtn} onClick={() => setStep(3)}>
                                        <ArrowLeft size={18} /> Back
                                    </button>
                                    <button
                                        type="button"
                                        className={styles.submitBtn}
                                        onClick={handleFinalSubmit}
                                        disabled={submitting}
                                    >
                                        {submitting ? 'Submitting...' : 'Submit Request'}
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* Step 5: Success */}
                        {step === 5 && (
                            <motion.div
                                key="step5"
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
                                <h2>Request Submitted!</h2>
                                <p>Your service request has been sent to mechanics.</p>
                                <p className={styles.bookingRef}>Booking ID: #{bookingId}</p>
                                <p className={styles.infoText}>
                                    You'll be notified when a mechanic accepts.
                                    Pay ₹1000 to confirm the booking after acceptance.
                                </p>
                                <button className={styles.doneBtn} onClick={() => navigate('/customer')}>
                                    Go to Dashboard
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default RegularBookingFlow;
