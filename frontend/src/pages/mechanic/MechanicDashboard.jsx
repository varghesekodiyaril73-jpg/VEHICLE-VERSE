import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Calendar, PenTool, MoreHorizontal, FileText,
    Clock, CheckCircle, Car, Wrench, DollarSign,
    ChevronRight, AlertTriangle, MapPin, ClipboardList
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import ChatWidget from '../../components/chat/ChatWidget';
import { updateAvailability, getMechanicProfile } from '../../services/mechanicService';
import { getAvailableEmergencyJobs, getAvailableRegularJobs, getMechanicJobs, acceptJob } from '../../services/bookingService';
import styles from '../../styles/MechanicDashboard.module.css';

const MechanicDashboard = () => {
    const navigate = useNavigate();
    const [isAvailable, setIsAvailable] = useState(true);
    const [toggling, setToggling] = useState(false);
    const [emergencyJobs, setEmergencyJobs] = useState([]);
    const [regularJobs, setRegularJobs] = useState([]);
    const [myJobs, setMyJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [acceptingJob, setAcceptingJob] = useState(null);

    const menuItems = [
        { label: 'Dashboard', path: '/mechanic', icon: PenTool },
        { label: 'Jobs', path: '/mechanic/jobs', icon: Wrench },
        { label: 'History', path: '/mechanic/history', icon: Calendar },
    ];

    // Fetch initial data
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [profileData, emergencyData, regularData, myJobsData] = await Promise.all([
                    getMechanicProfile(),
                    getAvailableEmergencyJobs(),
                    getAvailableRegularJobs(),
                    getMechanicJobs()
                ]);

                if (profileData.profile?.is_available !== undefined) {
                    setIsAvailable(profileData.profile.is_available);
                }
                setEmergencyJobs(emergencyData || []);
                setRegularJobs(regularData || []);
                setMyJobs(myJobsData || []);
            } catch (err) {
                console.error('Error fetching data:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Handle toggle
    const handleToggleAvailability = async () => {
        if (toggling) return;

        setToggling(true);
        const newStatus = !isAvailable;

        try {
            await updateAvailability(newStatus);
            setIsAvailable(newStatus);
        } catch (err) {
            console.error('Error updating availability:', err);
        } finally {
            setToggling(false);
        }
    };

    // Handle accept job
    const handleAcceptJob = async (bookingId) => {
        if (acceptingJob) return;
        setAcceptingJob(bookingId);

        try {
            await acceptJob(bookingId);
            // Refresh data
            const [emergencyData, regularData, myJobsData] = await Promise.all([
                getAvailableEmergencyJobs(),
                getAvailableRegularJobs(),
                getMechanicJobs()
            ]);
            setEmergencyJobs(emergencyData || []);
            setRegularJobs(regularData || []);
            setMyJobs(myJobsData || []);
        } catch (err) {
            console.error('Error accepting job:', err);
            alert(err.response?.data?.error || 'Failed to accept job');
        } finally {
            setAcceptingJob(null);
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleDateString('en-IN', {
            day: 'numeric', month: 'short', year: 'numeric'
        });
    };

    // Get the first available emergency job to show
    const currentEmergencyJob = emergencyJobs.length > 0 ? emergencyJobs[0] : null;


    return (
        <DashboardLayout title="Mechanic Workspace" role="MECHANIC" menuItems={menuItems}>
            <div className={styles.container}>
                {/* Background Effects */}
                <div className={styles.backgroundEffects}>
                    <div className={`${styles.glowBlob} ${styles.blob1}`} />
                    <div className={`${styles.glowBlob} ${styles.blob2}`} />
                </div>

                {/* Content */}
                <div className={styles.contentWrapper}>
                    {/* Top Row - Two Column Grid */}
                    <div className={styles.dashboardGrid}>
                        {/* Current Job Status Card */}
                        <motion.div
                            className={styles.glassCard}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <div className={styles.cardHeader}>
                                <h3 className={styles.cardTitle}>Emergency Jobs</h3>
                                <div className={styles.availabilityToggle}>
                                    <span className={`${styles.availabilityDot} ${!isAvailable ? styles.availabilityDotBusy : ''}`}></span>
                                    <span className={styles.availabilityText}>{isAvailable ? 'Available' : 'Busy'}</span>
                                    <div
                                        className={`${styles.toggleSwitch} ${isAvailable ? styles.toggleSwitchActive : ''} ${toggling ? styles.toggleDisabled : ''}`}
                                        onClick={handleToggleAvailability}
                                    >
                                        <div className={`${styles.toggleKnob} ${isAvailable ? styles.toggleKnobActive : ''}`}></div>
                                    </div>
                                </div>
                            </div>
                            {currentEmergencyJob ? (
                                <div className={styles.jobStatusCard}>
                                    <div className={styles.vehicleImage}>
                                        <Car size={40} style={{ margin: 'auto', marginTop: '15px', color: 'rgba(255,255,255,0.3)' }} />
                                    </div>
                                    <div className={styles.vehicleInfo}>
                                        <h4 className={styles.vehicleName}>{currentEmergencyJob.vehicle?.vehicle_name || 'Vehicle'}</h4>
                                        <span className={styles.vehicleType}>EMERGENCY</span>
                                        <div className={styles.serviceInfo}>
                                            <Clock size={14} style={{ color: 'rgba(255,255,255,0.4)' }} />
                                            <span className={styles.serviceLabel}>Issue:</span>
                                            <span className={styles.serviceValue}>{currentEmergencyJob.service_details?.substring(0, 30) || 'Emergency repair'}</span>
                                        </div>
                                        <div className={styles.serviceInfo}>
                                            <MapPin size={14} style={{ color: '#f59e0b' }} />
                                            <span className={styles.serviceValue}>{currentEmergencyJob.place}, {currentEmergencyJob.district}</span>
                                        </div>
                                        <motion.button
                                            className={styles.scheduleButton}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => handleAcceptJob(currentEmergencyJob.booking_id)}
                                            disabled={acceptingJob === currentEmergencyJob.booking_id}
                                        >
                                            {acceptingJob === currentEmergencyJob.booking_id ? 'Accepting...' : 'Accept Job'}
                                        </motion.button>
                                    </div>
                                </div>
                            ) : (
                                <div className={styles.emptyState}>
                                    <CheckCircle size={32} style={{ color: 'rgba(255,255,255,0.3)', marginBottom: '10px' }} />
                                    <p>No emergency jobs available</p>
                                </div>
                            )}
                        </motion.div>

                        {/* Regular Service Appointments Card */}
                        <motion.div
                            className={styles.glassCard}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                        >
                            <div className={styles.cardHeader}>
                                <h3 className={styles.cardTitle}>Regular Service Requests</h3>
                                <button className={styles.moreButton} onClick={() => navigate('/mechanic/jobs')}>
                                    <MoreHorizontal size={18} />
                                </button>
                            </div>
                            <div className={styles.appointmentsList}>
                                {regularJobs.length > 0 ? regularJobs.slice(0, 4).map((job, index) => (
                                    <motion.div
                                        key={job.booking_id}
                                        className={styles.appointmentItem}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.2 + index * 0.1 }}
                                    >
                                        <div className={styles.appointmentLeft}>
                                            <span className={styles.statusDot}></span>
                                            <div className={styles.appointmentInfo}>
                                                <span className={styles.appointmentDate}>
                                                    {formatDate(job.scheduled_date)} - {job.service_category || 'Service'}
                                                </span>
                                                <span className={styles.appointmentType}>
                                                    {job.place}, {job.district}
                                                </span>
                                            </div>
                                        </div>
                                        <div className={styles.appointmentRight}>
                                            <motion.button
                                                className={styles.viewDetailsBtn}
                                                onClick={() => handleAcceptJob(job.booking_id)}
                                                disabled={acceptingJob === job.booking_id}
                                            >
                                                {acceptingJob === job.booking_id ? 'Accepting...' : 'Accept'}
                                            </motion.button>
                                        </div>
                                    </motion.div>
                                )) : (
                                    <div className={styles.emptyState}>
                                        <p>No regular service requests</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>

                    {/* Bottom Row - My Active Jobs */}
                    <div className={styles.dashboardGridThree}>
                        {/* My Active Jobs */}
                        <motion.div
                            className={`${styles.glassCard} ${styles.fullWidth}`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                        >
                            <div className={styles.cardHeader}>
                                <h3 className={styles.cardTitle}>My Active Jobs</h3>
                                <button className={styles.moreButton} onClick={() => navigate('/mechanic/jobs')}>
                                    <MoreHorizontal size={18} />
                                </button>
                            </div>
                            <div className={styles.activeJobsList}>
                                {myJobs.length > 0 ? myJobs.slice(0, 3).map((job, index) => (
                                    <motion.div
                                        key={job.booking_id}
                                        className={styles.activeJobItem}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 + index * 0.1 }}
                                    >
                                        <div className={styles.activeJobLeft}>
                                            <span className={`${styles.jobTypeDot} ${job.service_type === 'BREAKDOWN' ? styles.emergencyDot : ''}`}></span>
                                            <div className={styles.activeJobInfo}>
                                                <h4>{job.vehicle?.vehicle_name || 'Vehicle'}</h4>
                                                <span>{job.service_category || (job.service_type === 'BREAKDOWN' ? 'Emergency' : 'Service')}</span>
                                            </div>
                                        </div>
                                        <div className={styles.activeJobRight}>
                                            <span className={styles.jobLocation}>{job.place}, {job.district}</span>
                                            <button
                                                className={styles.viewDetailsBtn}
                                                onClick={() => navigate('/mechanic/jobs')}
                                            >
                                                View
                                            </button>
                                        </div>
                                    </motion.div>
                                )) : (
                                    <div className={styles.emptyActiveJobs}>
                                        <p>No active jobs. Accept jobs from the Jobs page.</p>
                                        <motion.button
                                            className={styles.viewJobsBtn}
                                            onClick={() => navigate('/mechanic/jobs')}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            View Available Jobs
                                        </motion.button>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Chat Widget */}
                <ChatWidget />
            </div>
        </DashboardLayout>
    );
};

export default MechanicDashboard;
