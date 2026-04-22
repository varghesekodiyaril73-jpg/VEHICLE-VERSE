import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User, MapPin, Star, Wrench, Eye, Home, Car, ClipboardList,
    Search, X, Award, ArrowRight, ArrowLeft, Calendar,
    CheckCircle, Clock, ChevronLeft, ChevronRight, Plus, AlertCircle
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { getPublicMechanics } from '../../services/mechanicService';
import { getVehicles } from '../../services/vehicleService';
import { createRegularBooking } from '../../services/bookingService';
import styles from '../../styles/ViewMechanics.module.css';

// ── Step helpers (reused from RegularBookingFlow logic) ──
const serviceCategories = [
    'Oil Change', 'Brake Service', 'Engine Tune-up', 'Battery Replacement',
    'Tire Service', 'AC Service', 'Full Service', 'Other'
];
const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

const getCalendarDays = (month, year) => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) days.push(d);
    return days;
};

const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr + 'T00:00:00');
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

// ── Book Service Modal ──
const BookServiceModal = ({ mechanic, onClose, onSuccess }) => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1); // 1=vehicle, 2=details, 3=datetime, 4=review, 5=success
    const [vehicles, setVehicles] = useState([]);
    const [loadingVehicles, setLoadingVehicles] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [bookingId, setBookingId] = useState(null);
    const [selectedVehicle, setSelectedVehicle] = useState(null);

    const todayObj = new Date();
    const todayStr = todayObj.toISOString().split('T')[0];
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 2);
    const maxDateStr = maxDate.toISOString().split('T')[0];

    const [formData, setFormData] = useState({
        district: '',
        place: '',
        address_line: '',
        service_category: '',
        service_details: '',
        scheduled_date: todayStr,
        scheduled_time: '09:00'
    });

    const [calendarMonth, setCalendarMonth] = useState(todayObj.getMonth());
    const [calendarYear, setCalendarYear] = useState(todayObj.getFullYear());
    const [selectedHour, setSelectedHour] = useState(9);
    const [selectedMinute, setSelectedMinute] = useState(0);
    const [selectedPeriod, setSelectedPeriod] = useState('AM');

    useEffect(() => {
        getVehicles().then(data => {
            setVehicles(data);
            setLoadingVehicles(false);
        }).catch(() => setLoadingVehicles(false));
    }, []);

    const calendarDays = useMemo(() => getCalendarDays(calendarMonth, calendarYear), [calendarMonth, calendarYear]);

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
        setFormData(prev => ({ ...prev, scheduled_date: dateStr }));
    };

    const updateTime = (hour, minute, period) => {
        let h24 = hour;
        if (period === 'PM' && hour !== 12) h24 = hour + 12;
        if (period === 'AM' && hour === 12) h24 = 0;
        setFormData(prev => ({ ...prev, scheduled_time: `${String(h24).padStart(2, '0')}:${String(minute).padStart(2, '0')}` }));
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
                scheduled_time: formData.scheduled_time,
                preferred_mechanic_id: mechanic.user.id,
            };
            const response = await createRegularBooking(bookingData);
            setBookingId(response.booking.booking_id);
            setStep(5);
        } catch (err) {
            console.error('Booking error:', err.response?.data);
            const errData = err.response?.data;
            if (typeof errData === 'string') {
                setError(errData);
            } else if (errData?.error) {
                setError(errData.error);
            } else if (errData?.detail) {
                setError(errData.detail);
            } else if (errData && typeof errData === 'object') {
                // DRF field-level errors
                const msgs = Object.entries(errData).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`).join(' | ');
                setError(msgs || 'Failed to create booking. Please try again.');
            } else {
                setError('Failed to create booking. Please try again.');
            }
        } finally {
            setSubmitting(false);
        }
    };

    const mechanicName = `${mechanic.user?.first_name || ''} ${mechanic.user?.last_name || ''}`.trim() || mechanic.user?.username;

    return (
        <div className={styles.modalOverlay} onClick={(e) => { if (e.target === e.currentTarget && step !== 5) onClose(); }}>
            <motion.div
                className={styles.modal}
                initial={{ opacity: 0, scale: 0.92, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: 30 }}
                transition={{ duration: 0.3 }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Modal Header */}
                <div className={styles.modalHeader}>
                    <div>
                        <div className={styles.modalTag}>📅 BOOK SERVICE</div>
                        <h2 className={styles.modalTitle}>Schedule with {mechanicName}</h2>
                    </div>
                    {step < 5 && (
                        <button className={styles.modalClose} onClick={onClose}><X size={20} /></button>
                    )}
                </div>

                {/* Step Indicator */}
                {step < 5 && (
                    <div className={styles.stepIndicator}>
                        {['Vehicle', 'Details', 'Schedule', 'Review'].map((label, i) => (
                            <div key={i} className={styles.stepItem}>
                                <div className={`${styles.stepDot} ${step > i + 1 ? styles.stepDone : ''} ${step === i + 1 ? styles.stepCurrent : ''}`}>
                                    {step > i + 1 ? <CheckCircle size={14} /> : i + 1}
                                </div>
                                <span className={styles.stepLabel}>{label}</span>
                            </div>
                        ))}
                    </div>
                )}

                {/* Error */}
                <AnimatePresence>
                    {error && (
                        <motion.div className={styles.modalError} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <AlertCircle size={16} />{error}
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className={styles.modalBody}>
                    <AnimatePresence mode="wait">

                        {/* Step 1: Vehicle Selection */}
                        {step === 1 && (
                            <motion.div key="s1" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}>
                                <h3 className={styles.stepTitle}>Select Your Vehicle</h3>
                                <p className={styles.stepDesc}>Choose the vehicle that needs service</p>
                                {loadingVehicles ? (
                                    <div className={styles.modalLoading}><div className={styles.miniSpinner} /> Loading vehicles...</div>
                                ) : vehicles.length === 0 ? (
                                    <div className={styles.noVehicles}>
                                        <Car size={40} />
                                        <p>No vehicles found. Add a vehicle first.</p>
                                        <button className={styles.addVehicleBtn} onClick={() => navigate('/customer/vehicles')}>Add Vehicle</button>
                                    </div>
                                ) : (
                                    <div className={styles.vehicleList}>
                                        {vehicles.map(v => (
                                            <motion.button
                                                key={v.id}
                                                className={`${styles.vehicleOption} ${selectedVehicle?.id === v.id ? styles.vehicleOptionSelected : ''}`}
                                                onClick={() => setSelectedVehicle(v)}
                                                whileHover={{ scale: 1.01 }}
                                            >
                                                <div className={styles.vehicleOptionIcon}><Car size={22} /></div>
                                                <div className={styles.vehicleOptionInfo}>
                                                    <span className={styles.vehicleOptionName}>{v.vehicle_name}</span>
                                                    <span className={styles.vehicleOptionSub}>{v.vehicle_brand} {v.vehicle_model} · {v.registration_no}</span>
                                                </div>
                                                {selectedVehicle?.id === v.id && <CheckCircle size={18} className={styles.vehicleCheck} />}
                                            </motion.button>
                                        ))}
                                    </div>
                                )}
                                <div className={styles.modalActions}>
                                    <button className={styles.modalBackBtn} onClick={onClose}><X size={16} /> Cancel</button>
                                    <button className={styles.modalNextBtn} disabled={!selectedVehicle} onClick={() => setStep(2)}>
                                        Continue <ArrowRight size={16} />
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* Step 2: Service Details */}
                        {step === 2 && (
                            <motion.div key="s2" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}>
                                <h3 className={styles.stepTitle}>Service Details</h3>
                                <p className={styles.stepDesc}>Tell us what you need done</p>
                                <form onSubmit={handleDetailsSubmit} className={styles.detailsForm}>
                                    <div className={styles.formRow}>
                                        <div className={styles.formGroup}>
                                            <label className={styles.formLabel}><MapPin size={14} /> District *</label>
                                            <input className={styles.formInput} placeholder="e.g. Ernakulam" value={formData.district}
                                                onChange={e => setFormData(p => ({ ...p, district: e.target.value }))} required />
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label className={styles.formLabel}><MapPin size={14} /> Place *</label>
                                            <input className={styles.formInput} placeholder="e.g. Kakkanad" value={formData.place}
                                                onChange={e => setFormData(p => ({ ...p, place: e.target.value }))} required />
                                        </div>
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>Full Address (Optional)</label>
                                        <input className={styles.formInput} placeholder="House/Building, Street..." value={formData.address_line}
                                            onChange={e => setFormData(p => ({ ...p, address_line: e.target.value }))} />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.formLabel}><Wrench size={14} /> Service Type *</label>
                                        <div className={styles.categoryGrid}>
                                            {serviceCategories.map(cat => (
                                                <button key={cat} type="button"
                                                    className={`${styles.catBtn} ${formData.service_category === cat ? styles.catBtnActive : ''}`}
                                                    onClick={() => setFormData(p => ({ ...p, service_category: cat }))}
                                                >{cat}</button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>Describe the issue *</label>
                                        <textarea className={styles.formTextarea} rows={3} placeholder="e.g. Need oil change and brake check..."
                                            value={formData.service_details}
                                            onChange={e => setFormData(p => ({ ...p, service_details: e.target.value }))} required />
                                    </div>
                                    <div className={styles.modalActions}>
                                        <button type="button" className={styles.modalBackBtn} onClick={() => setStep(1)}><ArrowLeft size={16} /> Back</button>
                                        <button type="submit" className={styles.modalNextBtn}>Continue <ArrowRight size={16} /></button>
                                    </div>
                                </form>
                            </motion.div>
                        )}

                        {/* Step 3: Date & Time */}
                        {step === 3 && (
                            <motion.div key="s3" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}>
                                <h3 className={styles.stepTitle}>Choose Date & Time</h3>
                                <p className={styles.stepDesc}>Select your preferred schedule (up to 2 months ahead)</p>
                                <form onSubmit={handleScheduleSubmit}>
                                    {/* Calendar */}
                                    <div className={styles.calendarCard}>
                                        <div className={styles.calHeader}>
                                            <button type="button" className={styles.calNavBtn}
                                                onClick={() => calendarMonth === 0 ? (setCalendarMonth(11), setCalendarYear(y => y - 1)) : setCalendarMonth(m => m - 1)}>
                                                <ChevronLeft size={18} />
                                            </button>
                                            <span className={styles.calMonthLabel}>{monthNames[calendarMonth]} {calendarYear}</span>
                                            <button type="button" className={styles.calNavBtn}
                                                onClick={() => calendarMonth === 11 ? (setCalendarMonth(0), setCalendarYear(y => y + 1)) : setCalendarMonth(m => m + 1)}>
                                                <ChevronRight size={18} />
                                            </button>
                                        </div>
                                        <div className={styles.calDayNames}>
                                            {dayNames.map(d => <span key={d} className={styles.calDayName}>{d}</span>)}
                                        </div>
                                        <div className={styles.calGrid}>
                                            {calendarDays.map((day, idx) => (
                                                <button key={idx} type="button" disabled={isDateDisabled(day)} onClick={() => handleDayClick(day)}
                                                    className={[
                                                        styles.calDay,
                                                        !day ? styles.calDayEmpty : '',
                                                        isDateDisabled(day) ? styles.calDayDisabled : '',
                                                        isDateSelected(day) ? styles.calDaySelected : '',
                                                        isToday(day) && !isDateSelected(day) ? styles.calDayToday : ''
                                                    ].filter(Boolean).join(' ')}
                                                >{day || ''}</button>
                                            ))}
                                        </div>
                                        {formData.scheduled_date && (
                                            <div className={styles.selectedDateDisplay}><CheckCircle size={13} /> {formatDate(formData.scheduled_date)}</div>
                                        )}
                                    </div>

                                    {/* Time Picker */}
                                    <div className={styles.timePickerCard}>
                                        <label className={styles.formLabel}><Clock size={14} /> Preferred Time *</label>
                                        <div className={styles.timeRow}>
                                            <div className={styles.timeCol}>
                                                <span className={styles.timeColLabel}>Hour</span>
                                                <select className={styles.timeSelect} value={selectedHour}
                                                    onChange={e => { const h = parseInt(e.target.value); setSelectedHour(h); updateTime(h, selectedMinute, selectedPeriod); }}>
                                                    {[12,1,2,3,4,5,6,7,8,9,10,11].map(h => <option key={h} value={h}>{String(h).padStart(2,'0')}</option>)}
                                                </select>
                                            </div>
                                            <span className={styles.timeColon}>:</span>
                                            <div className={styles.timeCol}>
                                                <span className={styles.timeColLabel}>Minute</span>
                                                <select className={styles.timeSelect} value={selectedMinute}
                                                    onChange={e => { const m = parseInt(e.target.value); setSelectedMinute(m); updateTime(selectedHour, m, selectedPeriod); }}>
                                                    {[0,15,30,45].map(m => <option key={m} value={m}>{String(m).padStart(2,'0')}</option>)}
                                                </select>
                                            </div>
                                            <div className={styles.timeCol}>
                                                <span className={styles.timeColLabel}>Period</span>
                                                <div className={styles.periodToggle}>
                                                    {['AM','PM'].map(p => (
                                                        <button key={p} type="button"
                                                            className={`${styles.periodBtn} ${selectedPeriod === p ? styles.periodActive : ''}`}
                                                            onClick={() => { setSelectedPeriod(p); updateTime(selectedHour, selectedMinute, p); }}
                                                        >{p}</button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        <div className={styles.timeDisplay}><Clock size={13} /> {String(selectedHour).padStart(2,'0')}:{String(selectedMinute).padStart(2,'0')} {selectedPeriod}</div>
                                    </div>

                                    <div className={styles.modalActions}>
                                        <button type="button" className={styles.modalBackBtn} onClick={() => setStep(2)}><ArrowLeft size={16} /> Back</button>
                                        <button type="submit" className={styles.modalNextBtn}>Review Booking <ArrowRight size={16} /></button>
                                    </div>
                                </form>
                            </motion.div>
                        )}

                        {/* Step 4: Review */}
                        {step === 4 && (
                            <motion.div key="s4" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}>
                                <h3 className={styles.stepTitle}>Review Your Booking</h3>
                                <p className={styles.stepDesc}>Confirm the details before submitting</p>
                                <div className={styles.reviewCard}>
                                    <div className={styles.reviewRow}>
                                        <span className={styles.reviewLabel}>Mechanic</span>
                                        <span className={styles.reviewValue}>{mechanicName}</span>
                                    </div>
                                    <div className={styles.reviewRow}>
                                        <span className={styles.reviewLabel}>Vehicle</span>
                                        <span className={styles.reviewValue}>{selectedVehicle?.vehicle_name} · <span style={{ color: '#9ca3af' }}>{selectedVehicle?.registration_no}</span></span>
                                    </div>
                                    <div className={styles.reviewRow}>
                                        <span className={styles.reviewLabel}>Location</span>
                                        <span className={styles.reviewValue}>{formData.place}, {formData.district}</span>
                                    </div>
                                    <div className={styles.reviewRow}>
                                        <span className={styles.reviewLabel}>Service</span>
                                        <span className={styles.reviewValue}>{formData.service_category}</span>
                                    </div>
                                    <div className={styles.reviewRow}>
                                        <span className={styles.reviewLabel}>Details</span>
                                        <span className={styles.reviewValue} style={{ color: '#9ca3af', fontSize: '0.85rem' }}>{formData.service_details}</span>
                                    </div>
                                    <div className={styles.reviewRow}>
                                        <span className={styles.reviewLabel}>Date</span>
                                        <span className={styles.reviewValue}>{formatDate(formData.scheduled_date)}</span>
                                    </div>
                                    <div className={styles.reviewRow}>
                                        <span className={styles.reviewLabel}>Time</span>
                                        <span className={styles.reviewValue}>{formatTime(formData.scheduled_time)}</span>
                                    </div>
                                </div>
                                <div className={styles.paymentNote}>
                                    <span>💡</span>
                                    <p>No payment required now. You'll pay ₹1000 as confirmation after the mechanic accepts.</p>
                                </div>
                                <div className={styles.modalActions}>
                                    <button className={styles.modalBackBtn} onClick={() => setStep(3)}><ArrowLeft size={16} /> Back</button>
                                    <button className={styles.submitBtn} onClick={handleFinalSubmit} disabled={submitting}>
                                        {submitting ? <><div className={styles.miniSpinner} /> Submitting...</> : 'Submit Request'}
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* Step 5: Success */}
                        {step === 5 && (
                            <motion.div key="s5" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className={styles.successContent}>
                                <motion.div className={styles.successIcon} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring' }}>
                                    <CheckCircle size={56} />
                                </motion.div>
                                <h3 className={styles.successTitle}>Request Submitted!</h3>
                                <p className={styles.successSub}>Your booking with <strong>{mechanicName}</strong> has been sent.</p>
                                <p className={styles.bookingRef}>Booking ID: #{bookingId}</p>
                                <p className={styles.successInfo}>You'll be notified when the mechanic accepts. Pay ₹1000 to confirm.</p>
                                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', marginTop: '1.5rem' }}>
                                    <button className={styles.modalBackBtn} onClick={onClose}>Back to Mechanics</button>
                                    <button className={styles.modalNextBtn} onClick={() => navigate('/customer/bookings')}>My Bookings</button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
};

// ── Main ViewMechanics Page ──
const ViewMechanics = () => {
    const navigate = useNavigate();
    const [mechanics, setMechanics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeOnly, setActiveOnly] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedMechanic, setSelectedMechanic] = useState(null); // For book modal

    const menuItems = [
        { label: 'Dashboard', path: '/customer', icon: Home },
        { label: 'My Vehicles', path: '/customer/vehicles', icon: Car },
        { label: 'Find Mechanics', path: '/customer/mechanics', icon: Wrench },
        { label: 'My Bookings', path: '/customer/bookings', icon: ClipboardList },
    ];

    useEffect(() => { fetchMechanics(); }, [activeOnly]);

    const fetchMechanics = async () => {
        try {
            setLoading(true);
            const data = await getPublicMechanics(activeOnly);
            setMechanics(data);
        } catch (err) {
            console.error('Error fetching mechanics:', err);
        } finally {
            setLoading(false);
        }
    };

    // Filter by manufacturer_partner search
    const filteredMechanics = useMemo(() => {
        if (!searchQuery.trim()) return mechanics;
        const q = searchQuery.trim().toLowerCase();
        return mechanics.filter(m => (m.manufacturer_partner || '').toLowerCase().includes(q));
    }, [mechanics, searchQuery]);

    const renderStars = (rating) => {
        const fullStars = Math.round(parseFloat(rating) || 0);
        return Array.from({ length: 5 }, (_, i) => (
            <Star key={i} size={14} fill={i < fullStars ? '#fbbf24' : 'none'} color={i < fullStars ? '#fbbf24' : '#374151'} />
        ));
    };

    return (
        <DashboardLayout title="Find Mechanics" role="CUSTOMER" menuItems={menuItems}>
            <div className={styles.container}>
                {/* Background Effects */}
                <div className={styles.backgroundEffects}>
                    <div className={`${styles.glowBlob} ${styles.blob1}`} />
                    <div className={`${styles.glowBlob} ${styles.blob2}`} />
                </div>

                {/* Page Header */}
                <header className={styles.pageHeader}>
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                        <span className={styles.pageTagline}>🔧 VERIFIED MECHANICS</span>
                        <h1 className={styles.pageTitle}>Find Expert Mechanics</h1>
                        <p className={styles.pageSubtitle}>Browse our network of verified mechanics. Book services with confidence.</p>
                    </motion.div>
                </header>

                {/* Search Bar — manufacturer partner search */}
                <div className={styles.searchSection}>
                    <div className={styles.searchWrapper}>
                        <Search size={18} className={styles.searchIcon} />
                        <input
                            type="text"
                            className={styles.searchInput}
                            placeholder="Search by manufacturer partner (e.g. Toyota, Honda...)"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                        {searchQuery && (
                            <button className={styles.searchClear} onClick={() => setSearchQuery('')}><X size={16} /></button>
                        )}
                    </div>
                    {searchQuery && (
                        <p className={styles.searchResultsNote}>
                            {filteredMechanics.length === 0
                                ? `No mechanics found for "${searchQuery}"`
                                : `${filteredMechanics.length} mechanic${filteredMechanics.length > 1 ? 's' : ''} found for "${searchQuery}"`}
                        </p>
                    )}
                </div>

                {/* Filter Tabs */}
                <div className={styles.filterBar}>
                    <button className={`${styles.filterTab} ${activeOnly ? styles.filterTabActive : ''}`} onClick={() => setActiveOnly(true)}>
                        Active Mechanics
                    </button>
                    <button className={`${styles.filterTab} ${!activeOnly ? styles.filterTabActive : ''}`} onClick={() => setActiveOnly(false)}>
                        All Mechanics
                    </button>
                </div>

                {/* Mechanics Grid */}
                <section className={styles.mechanicsSection}>
                    {loading ? (
                        <div className={styles.loadingState}>
                            <div className={styles.spinner} />
                            <p>Loading mechanics...</p>
                        </div>
                    ) : filteredMechanics.length === 0 ? (
                        <motion.div className={styles.emptyState} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                            <div className={styles.emptyIcon}><Wrench size={40} /></div>
                            <h3 className={styles.emptyTitle}>No Mechanics Found</h3>
                            <p>{searchQuery
                                ? `No mechanics are an official service centre for "${searchQuery}". Try a different brand.`
                                : activeOnly ? 'No active mechanics available right now.' : 'No approved mechanics found.'}
                            </p>
                        </motion.div>
                    ) : (
                        <motion.div className={styles.mechanicsGrid} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
                            {filteredMechanics.map((mechanic, index) => (
                                <motion.div
                                    key={mechanic.id}
                                    className={styles.mechanicCard}
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.07, duration: 0.4 }}
                                >
                                    {/* Card Header */}
                                    <div className={styles.mechanicHeader}>
                                        <div className={styles.mechanicAvatar}>
                                            {mechanic.user?.photo_url
                                                ? <img src={mechanic.user.photo_url} alt={mechanic.user?.first_name} />
                                                : <User size={28} style={{ color: 'white' }} />}
                                        </div>
                                        <div className={styles.mechanicInfo}>
                                            <h4 className={styles.mechanicName}>{mechanic.user?.first_name} {mechanic.user?.last_name}</h4>
                                            <p className={styles.mechanicLocation}>
                                                <MapPin size={13} />
                                                {mechanic.user?.place || 'Location not set'}{mechanic.user?.district && `, ${mechanic.user.district}`}
                                            </p>
                                        </div>
                                        <span className={`${styles.statusBadge} ${mechanic.is_available ? styles.statusAvailable : styles.statusBusy}`}>
                                            <span className={styles.statusDot} />
                                            {mechanic.is_available ? 'Available' : 'Busy'}
                                        </span>
                                    </div>

                                    {/* Manufacturer Partner Badge */}
                                    {mechanic.manufacturer_partner && (
                                        <div className={styles.manufacturerBadge}>
                                            <Award size={13} />
                                            <span>Official <strong>{mechanic.manufacturer_partner}</strong> Service Centre</span>
                                            {(mechanic.service_centre_place || mechanic.service_centre_state) && (
                                                <span className={styles.centreLoc}>
                                                    <MapPin size={11} />
                                                    {[mechanic.service_centre_place, mechanic.service_centre_state].filter(Boolean).join(', ')}
                                                </span>
                                            )}
                                        </div>
                                    )}

                                    {/* Details */}
                                    <div className={styles.mechanicDetails}>
                                        <div className={styles.detailItem}>
                                            <span className={styles.detailLabel}>Service Fee</span>
                                            <span className={styles.detailValue}>₹{mechanic.min_service_fee || '0'}</span>
                                        </div>
                                        <div className={styles.detailItem}>
                                            <span className={styles.detailLabel}>Breakdown Fee</span>
                                            <span className={styles.detailValue}>₹{mechanic.min_breakdown_fee || '0'}</span>
                                        </div>
                                        <div className={styles.detailItem}>
                                            <span className={styles.detailLabel}>Rating</span>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                                <div style={{ display: 'flex', gap: '0.1rem' }}>{renderStars(mechanic.avg_rating)}</div>
                                                <span className={`${styles.detailValue} ${styles.ratingValue}`}>{mechanic.avg_rating || '0.0'}/5</span>
                                            </div>
                                        </div>
                                        <div className={styles.detailItem}>
                                            <span className={styles.detailLabel}>Status</span>
                                            <span className={styles.detailValue}>{mechanic.approval_status}</span>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className={styles.cardActions}>
                                        <button
                                            className={styles.bookBtn}
                                            disabled={!mechanic.is_available}
                                            onClick={() => mechanic.is_available && setSelectedMechanic(mechanic)}
                                        >
                                            <Wrench size={17} />
                                            Book Service
                                        </button>
                                        <button className={styles.viewBtn} onClick={() => navigate(`/customer/mechanics/${mechanic.id}`)}>
                                            <Eye size={17} />
                                            View Profile
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </section>

                {/* Book Service Modal */}
                <AnimatePresence>
                    {selectedMechanic && (
                        <BookServiceModal
                            mechanic={selectedMechanic}
                            onClose={() => setSelectedMechanic(null)}
                            onSuccess={() => { setSelectedMechanic(null); navigate('/customer/bookings'); }}
                        />
                    )}
                </AnimatePresence>
            </div>
        </DashboardLayout>
    );
};

export default ViewMechanics;
