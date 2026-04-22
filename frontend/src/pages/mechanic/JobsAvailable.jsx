import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    PenTool, Wrench, Calendar, Car, MapPin, Clock,
    AlertTriangle, CheckCircle, User, Phone, ChevronRight,
    XCircle, ClipboardList, RefreshCw, Star, MessageCircle, Receipt
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import BookingChat from '../../components/chat/BookingChat';
import BillModal from '../../components/booking/BillModal';
import {
    getAvailableEmergencyJobs,
    getAvailableRegularJobs,
    getMechanicJobs,
    getMechanicAllJobs,
    acceptJob,
    completeJob,
    cancelJobByMechanic
} from '../../services/bookingService';
import styles from '../../styles/JobsAvailable.module.css';

// Job Card for Available Jobs
const AvailableJobCard = ({ job, type, onAccept, accepting }) => {
    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
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
        <motion.div
            className={`${styles.jobCard} ${type === 'emergency' ? styles.emergencyCard : styles.regularCard}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4 }}
        >
            {/* Badge */}
            <div className={`${styles.jobBadge} ${type === 'emergency' ? styles.emergencyBadge : styles.regularBadge}`}>
                {type === 'emergency' ? (
                    <>
                        <AlertTriangle size={14} />
                        EMERGENCY
                    </>
                ) : (
                    <>
                        <Calendar size={14} />
                        SCHEDULED
                    </>
                )}
            </div>

            {/* Vehicle Info */}
            <div className={styles.vehicleSection}>
                <div className={styles.vehicleIcon}>
                    <Car size={24} />
                </div>
                <div className={styles.vehicleDetails}>
                    <h3>{job.vehicle?.vehicle_name || 'Vehicle'}</h3>
                    <p>{job.vehicle?.vehicle_brand} {job.vehicle?.vehicle_model}</p>
                    <span className={styles.regNo}>{job.vehicle?.registration_no}</span>
                </div>
            </div>

            {/* Location */}
            <div className={styles.infoRow}>
                <MapPin size={16} />
                <span>{job.place}, {job.district}</span>
            </div>

            {/* Issue/Service */}
            <div className={styles.serviceDetails}>
                <h4>{job.service_category || 'Service Required'}</h4>
                <p>{job.service_details}</p>
            </div>

            {/* Schedule (for regular) */}
            {type === 'regular' && job.scheduled_date && (
                <div className={styles.scheduleInfo}>
                    <Clock size={16} />
                    <span>{formatDate(job.scheduled_date)} at {formatTime(job.scheduled_time)}</span>
                </div>
            )}

            {/* Customer Info */}
            <div className={styles.customerInfo}>
                <div className={styles.customerRow}>
                    <User size={14} />
                    <span>{job.customer_name}</span>
                </div>
                <div className={styles.customerRow}>
                    <Phone size={14} />
                    <span>{job.customer_phone}</span>
                </div>
            </div>

            {/* Actions */}
            <motion.button
                className={styles.acceptBtn}
                onClick={() => onAccept(job.booking_id)}
                disabled={accepting}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
            >
                {accepting ? 'Accepting...' : 'Accept Job'}
                <ChevronRight size={18} />
            </motion.button>

            {/* Time ago */}
            <div className={styles.timeAgo}>
                Posted {new Date(job.created_at).toLocaleDateString('en-IN')}
            </div>
        </motion.div>
    );
};

// Job Card for Active/Completed Jobs
const ActiveJobCard = ({ job, onComplete, onCancel, onChat, onViewBills, processing }) => {
    const [showCompleteModal, setShowCompleteModal] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [finalAmount, setFinalAmount] = useState('');
    const [cancelReason, setCancelReason] = useState('');

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    const handleComplete = () => {
        if (!finalAmount || parseFloat(finalAmount) < 0) {
            alert('Please enter a valid amount');
            return;
        }
        onComplete(job.booking_id, { final_amount: parseFloat(finalAmount) });
        setShowCompleteModal(false);
    };

    const handleCancel = () => {
        if (!cancelReason.trim()) {
            alert('Please provide a reason for cancellation');
            return;
        }
        onCancel(job.booking_id, { cancellation_reason: cancelReason });
        setShowCancelModal(false);
    };

    const isCompleted = job.booking_status === 'COMPLETED';

    return (
        <motion.div
            className={`${styles.jobCard} ${isCompleted ? styles.completedCard : styles.activeCard}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: isCompleted ? 0 : -4 }}
        >
            {/* Badge */}
            <div className={`${styles.jobBadge} ${isCompleted ? styles.completedBadge : styles.activeBadge}`}>
                {isCompleted ? (
                    <>
                        <CheckCircle size={14} />
                        COMPLETED
                    </>
                ) : (
                    <>
                        <Clock size={14} />
                        {job.service_type === 'BREAKDOWN' ? 'EMERGENCY' : 'REGULAR'}
                    </>
                )}
            </div>

            {/* Vehicle Info */}
            <div className={styles.vehicleSection}>
                <div className={styles.vehicleIcon}>
                    <Car size={24} />
                </div>
                <div className={styles.vehicleDetails}>
                    <h3>{job.vehicle?.vehicle_name || 'Vehicle'}</h3>
                    <p>{job.vehicle?.vehicle_brand} {job.vehicle?.vehicle_model}</p>
                    <span className={styles.regNo}>{job.vehicle?.registration_no}</span>
                </div>
            </div>

            {/* Location */}
            <div className={styles.infoRow}>
                <MapPin size={16} />
                <span>{job.place}, {job.district}</span>
            </div>

            {/* Service */}
            <div className={styles.serviceDetails}>
                <h4>{job.service_category || (job.service_type === 'BREAKDOWN' ? 'Emergency Repair' : 'Service')}</h4>
                <p>{job.service_details?.substring(0, 80)}{job.service_details?.length > 80 ? '...' : ''}</p>
            </div>

            {/* Customer Info */}
            <div className={styles.customerInfo}>
                <div className={styles.customerRow}>
                    <User size={14} />
                    <span>{job.customer_name}</span>
                </div>
                <div className={styles.customerRow}>
                    <Phone size={14} />
                    <span>{job.customer_phone}</span>
                </div>
            </div>

            {/* Payment Info for Completed */}
            {isCompleted && job.payment?.final_amount && (
                <div className={styles.paymentInfo}>
                    <span className={styles.paymentLabel}>Final Payment:</span>
                    <span className={styles.paymentAmount}>₹{job.payment.final_amount}</span>
                </div>
            )}

            {/* Actions for Active Jobs */}
            {!isCompleted && (
                <div className={styles.actionButtons}>
                    <motion.button
                        className={styles.chatBtnMech}
                        onClick={() => onChat(job)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <MessageCircle size={16} />
                        Chat
                    </motion.button>
                    <motion.button
                        className={styles.completeBtn}
                        onClick={() => setShowCompleteModal(true)}
                        disabled={processing}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <CheckCircle size={16} />
                        Complete
                    </motion.button>
                    <motion.button
                        className={styles.cancelBtn}
                        onClick={() => setShowCancelModal(true)}
                        disabled={processing}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <XCircle size={16} />
                        Cancel
                    </motion.button>
                </div>
            )}

            {/* Completed Date */}
            {isCompleted && (
                <div className={styles.completedDate}>
                    Completed on {formatDate(job.completed_at)}
                </div>
            )}

            {/* View Bills for completed jobs */}
            {isCompleted && job.bills && job.bills.length > 0 && (
                <div className={styles.actionButtons} style={{ marginTop: '8px' }}>
                    <motion.button
                        className={styles.chatBtnMech}
                        onClick={() => onViewBills(job)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        style={{ background: 'rgba(99, 102, 241, 0.15)', borderColor: 'rgba(99, 102, 241, 0.3)', color: '#818cf8' }}
                    >
                        <Receipt size={16} />
                        View Bills ({job.bills.length})
                    </motion.button>
                </div>
            )}

            {/* Complete Modal */}
            <AnimatePresence>
                {showCompleteModal && (
                    <motion.div
                        className={styles.modalOverlay}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowCompleteModal(false)}
                    >
                        <motion.div
                            className={styles.modal}
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h3>Complete Job</h3>
                            <p>Enter the final amount received from customer for this job:</p>
                            <div className={styles.amountInput}>
                                <span className={styles.currencySymbol}>₹</span>
                                <input
                                    type="number"
                                    value={finalAmount}
                                    onChange={(e) => setFinalAmount(e.target.value)}
                                    placeholder="Enter amount"
                                    min="0"
                                />
                            </div>
                            <div className={styles.modalActions}>
                                <button onClick={() => setShowCompleteModal(false)} className={styles.modalCancel}>
                                    Cancel
                                </button>
                                <button onClick={handleComplete} className={styles.modalConfirm} disabled={processing}>
                                    {processing ? 'Processing...' : 'Mark Complete'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Cancel Modal */}
            <AnimatePresence>
                {showCancelModal && (
                    <motion.div
                        className={styles.modalOverlay}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowCancelModal(false)}
                    >
                        <motion.div
                            className={styles.modal}
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h3>Cancel Job</h3>
                            <p>This job will be relisted for other mechanics. Please provide a reason:</p>
                            <textarea
                                value={cancelReason}
                                onChange={(e) => setCancelReason(e.target.value)}
                                placeholder="Reason for cancellation..."
                                rows={3}
                            />
                            <div className={styles.modalActions}>
                                <button onClick={() => setShowCancelModal(false)} className={styles.modalCancel}>
                                    Go Back
                                </button>
                                <button onClick={handleCancel} className={styles.modalConfirmDanger} disabled={processing}>
                                    {processing ? 'Processing...' : 'Cancel Job'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

const JobsAvailable = () => {
    const navigate = useNavigate();
    const [mainTab, setMainTab] = useState('available'); // 'available', 'active', 'completed'
    const [availableSubTab, setAvailableSubTab] = useState('emergency');
    const [emergencyJobs, setEmergencyJobs] = useState([]);
    const [regularJobs, setRegularJobs] = useState([]);
    const [activeJobs, setActiveJobs] = useState([]);
    const [completedJobs, setCompletedJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(null);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [showChat, setShowChat] = useState(false);
    const [chatBookingId, setChatBookingId] = useState(null);
    const [chatOtherName, setChatOtherName] = useState('');
    const [showBillModal, setShowBillModal] = useState(false);
    const [selectedBills, setSelectedBills] = useState([]);

    const menuItems = [
        { label: 'Dashboard', path: '/mechanic', icon: PenTool },
        { label: 'Jobs', path: '/mechanic/jobs', icon: Wrench },
        { label: 'History', path: '/mechanic/history', icon: Calendar },
    ];

    // Fetch jobs
    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        setLoading(true);
        try {
            const [emergency, regular, active, allJobs] = await Promise.all([
                getAvailableEmergencyJobs(),
                getAvailableRegularJobs(),
                getMechanicJobs(),
                getMechanicAllJobs()
            ]);
            setEmergencyJobs(emergency || []);
            setRegularJobs(regular || []);
            setActiveJobs(active || []);
            // Filter completed from all jobs
            setCompletedJobs((allJobs || []).filter(j => j.booking_status === 'COMPLETED'));
        } catch (err) {
            console.error('Error fetching jobs:', err);
            setError('Failed to load jobs');
        } finally {
            setLoading(false);
        }
    };

    const handleAcceptJob = async (bookingId) => {
        setProcessing(bookingId);
        setError(null);
        setSuccessMessage(null);

        try {
            await acceptJob(bookingId);
            setSuccessMessage('Job accepted successfully!');
            await fetchJobs();
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err) {
            console.error('Error accepting job:', err);
            setError(err.response?.data?.error || 'Failed to accept job.');
        } finally {
            setProcessing(null);
        }
    };

    const handleCompleteJob = async (bookingId, data) => {
        setProcessing(bookingId);
        setError(null);
        setSuccessMessage(null);

        try {
            await completeJob(bookingId, data);
            setSuccessMessage('Job marked as complete!');
            await fetchJobs();
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err) {
            console.error('Error completing job:', err);
            setError(err.response?.data?.error || 'Failed to complete job.');
        } finally {
            setProcessing(null);
        }
    };

    const handleCancelJob = async (bookingId, data) => {
        setProcessing(bookingId);
        setError(null);
        setSuccessMessage(null);

        try {
            await cancelJobByMechanic(bookingId, data);
            setSuccessMessage('Job cancelled and relisted for other mechanics.');
            await fetchJobs();
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err) {
            console.error('Error cancelling job:', err);
            setError(err.response?.data?.error || 'Failed to cancel job.');
        } finally {
            setProcessing(null);
        }
    };

    const currentAvailableJobs = availableSubTab === 'emergency' ? emergencyJobs : regularJobs;

    return (
        <DashboardLayout title="Jobs" role="MECHANIC" menuItems={menuItems}>
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
                        <h1 className={styles.pageTitle}>Jobs Management</h1>
                        <p className={styles.pageSubtitle}>
                            View available jobs, manage active jobs, and see completed work
                        </p>
                    </motion.div>
                </header>

                {/* Messages */}
                <AnimatePresence>
                    {error && (
                        <motion.div
                            className={styles.errorMessage}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                        >
                            <AlertTriangle size={18} />
                            {error}
                        </motion.div>
                    )}
                    {successMessage && (
                        <motion.div
                            className={styles.successMessage}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                        >
                            <CheckCircle size={18} />
                            {successMessage}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Main Tabs */}
                <div className={styles.mainTabContainer}>
                    <button
                        className={`${styles.mainTab} ${mainTab === 'available' ? styles.mainTabActive : ''}`}
                        onClick={() => setMainTab('available')}
                    >
                        <Wrench size={18} />
                        Available
                        {(emergencyJobs.length + regularJobs.length) > 0 && (
                            <span className={styles.tabBadge}>{emergencyJobs.length + regularJobs.length}</span>
                        )}
                    </button>
                    <button
                        className={`${styles.mainTab} ${mainTab === 'active' ? styles.mainTabActive : ''}`}
                        onClick={() => setMainTab('active')}
                    >
                        <ClipboardList size={18} />
                        Active
                        {activeJobs.length > 0 && (
                            <span className={styles.tabBadgeActive}>{activeJobs.length}</span>
                        )}
                    </button>
                    <button
                        className={`${styles.mainTab} ${mainTab === 'completed' ? styles.mainTabActive : ''}`}
                        onClick={() => setMainTab('completed')}
                    >
                        <CheckCircle size={18} />
                        Completed
                        {completedJobs.length > 0 && (
                            <span className={styles.tabBadgeCompleted}>{completedJobs.length}</span>
                        )}
                    </button>
                </div>

                {/* Sub-tabs for Available */}
                {mainTab === 'available' && (
                    <div className={styles.tabContainer}>
                        <button
                            className={`${styles.tab} ${availableSubTab === 'emergency' ? styles.tabActive : ''}`}
                            onClick={() => setAvailableSubTab('emergency')}
                        >
                            <AlertTriangle size={18} />
                            Emergency
                            {emergencyJobs.length > 0 && (
                                <span className={styles.tabBadge}>{emergencyJobs.length}</span>
                            )}
                        </button>
                        <button
                            className={`${styles.tab} ${availableSubTab === 'regular' ? styles.tabActive : ''}`}
                            onClick={() => setAvailableSubTab('regular')}
                        >
                            <Calendar size={18} />
                            Regular Service
                            {regularJobs.length > 0 && (
                                <span className={styles.tabBadge}>{regularJobs.length}</span>
                            )}
                        </button>
                    </div>
                )}

                {/* Jobs Grid */}
                <div className={styles.jobsContainer}>
                    {loading ? (
                        <div className={styles.loadingState}>Loading jobs...</div>
                    ) : mainTab === 'available' ? (
                        currentAvailableJobs.length === 0 ? (
                            <div className={styles.emptyState}>
                                <div className={styles.emptyIcon}>
                                    {availableSubTab === 'emergency' ? <AlertTriangle size={48} /> : <Calendar size={48} />}
                                </div>
                                <h3>No {availableSubTab === 'emergency' ? 'emergency' : 'regular'} jobs available</h3>
                                <p>Check back later for new job requests in your area</p>
                            </div>
                        ) : (
                            <div className={styles.jobsGrid}>
                                {currentAvailableJobs.map((job) => (
                                    <AvailableJobCard
                                        key={job.booking_id}
                                        job={job}
                                        type={availableSubTab}
                                        onAccept={handleAcceptJob}
                                        accepting={processing === job.booking_id}
                                    />
                                ))}
                            </div>
                        )
                    ) : mainTab === 'active' ? (
                        activeJobs.length === 0 ? (
                            <div className={styles.emptyState}>
                                <div className={styles.emptyIcon}>
                                    <ClipboardList size={48} />
                                </div>
                                <h3>No active jobs</h3>
                                <p>Accept a job from the Available tab to get started</p>
                            </div>
                        ) : (
                            <div className={styles.jobsGrid}>
                                {activeJobs.map((job) => (
                                    <ActiveJobCard
                                        key={job.booking_id}
                                        job={job}
                                        onComplete={handleCompleteJob}
                                        onCancel={handleCancelJob}
                                        onChat={(j) => {
                                            setChatBookingId(j.booking_id);
                                            const custName = j.customer ? `${j.customer.first_name || ''} ${j.customer.last_name || ''}`.trim() || j.customer.username : (j.customer_name || 'Customer');
                                            setChatOtherName(custName);
                                            setShowChat(true);
                                        }}
                                        processing={processing === job.booking_id}
                                    />
                                ))}
                            </div>
                        )
                    ) : (
                        completedJobs.length === 0 ? (
                            <div className={styles.emptyState}>
                                <div className={styles.emptyIcon}>
                                    <CheckCircle size={48} />
                                </div>
                                <h3>No completed jobs yet</h3>
                                <p>Complete jobs will appear here</p>
                            </div>
                        ) : (
                            <div className={styles.jobsGrid}>
                                {completedJobs.map((job) => (
                                    <ActiveJobCard
                                        key={job.booking_id}
                                        job={job}
                                        onComplete={() => { }}
                                        onCancel={() => { }}
                                        onViewBills={(j) => {
                                            setSelectedBills(j.bills || []);
                                            setShowBillModal(true);
                                        }}
                                        processing={false}
                                    />
                                ))}
                            </div>
                        )
                    )}
                </div>

                {/* Refresh Button */}
                <div className={styles.refreshContainer}>
                    <motion.button
                        className={styles.refreshBtn}
                        onClick={fetchJobs}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <RefreshCw size={18} />
                        Refresh Jobs
                    </motion.button>
                </div>
            </div>

            {/* Chat Drawer */}
            <BookingChat
                isOpen={showChat}
                onClose={() => setShowChat(false)}
                bookingId={chatBookingId}
                otherPartyName={chatOtherName}
                currentUserRole="MECHANIC"
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

export default JobsAvailable;
