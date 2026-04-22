import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Car, Wrench, ClipboardList, AlertTriangle, Home, Clock,
    CreditCard, ShieldCheck, MessageCircle, CheckCircle, Plus, Info, Users, Bell, X
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import ChatWidget from '../../components/chat/ChatWidget';
import { getVehicles } from '../../services/vehicleService';
import { getNotifications } from '../../services/bookingService';
import styles from '../../styles/CustomerDashboard.module.css';

// Feature Card Component - Matches Landing page FeatureCard
const FeatureCard = ({ icon, title, desc, delay, onClick }) => {
    return (
        <motion.div
            className={styles.featureCard}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: delay, duration: 0.6 }}
            onClick={onClick}
        >
            <div className={styles.iconWrapper}>
                {icon}
            </div>
            <h3 className={styles.featureTitle}>{title}</h3>
            <p className={styles.featureDesc}>{desc}</p>
        </motion.div>
    );
};

// Benefit Card Component - Matches Landing page BenefitCard
const BenefitCard = ({ icon, title, desc, onClick }) => {
    return (
        <motion.div
            className={styles.benefitCard}
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
            onClick={onClick}
            style={{ cursor: onClick ? 'pointer' : 'default' }}
        >
            <div className={styles.benefitIcon}>
                {icon}
            </div>
            <h4 className={styles.benefitTitle}>{title}</h4>
            <p className={styles.benefitDesc}>{desc}</p>
        </motion.div>
    );
};

const CustomerDashboard = () => {
    const navigate = useNavigate();
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [notifications, setNotifications] = useState([]);
    const [showNotification, setShowNotification] = useState(true);

    const menuItems = [
        { label: 'Dashboard', path: '/customer', icon: Home },
        { label: 'My Vehicles', path: '/customer/vehicles', icon: Car },
        { label: 'Find Mechanics', path: '/customer/mechanics', icon: Users },
        { label: 'My Bookings', path: '/customer/bookings', icon: ClipboardList },
    ];

    // Fetch vehicles and notifications on mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [vehiclesData, notificationsData] = await Promise.all([
                    getVehicles(),
                    getNotifications()
                ]);
                setVehicles(vehiclesData);
                setNotifications(notificationsData.notifications || []);
            } catch (err) {
                console.error('Error fetching data:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    return (
        <DashboardLayout title="Customer Portal" role="CUSTOMER" menuItems={menuItems}>
            <div className={styles.container}>
                {/* Background Effects - Exact Landing page style */}
                <div className={styles.backgroundEffects}>
                    <div className={`${styles.glowBlob} ${styles.blob1}`} />
                    <div className={`${styles.glowBlob} ${styles.blob2}`} />
                </div>

                {/* Hero Section - Matches Landing page hero */}
                <header className={styles.heroSection}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className={styles.glassCardHero}>
                            <motion.h1
                                className={styles.displayHeading}
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.2, duration: 0.8 }}
                            >
                                Welcome to <br />
                                <span className={styles.glowText}>VehicleVerse</span>
                            </motion.h1>

                            <motion.button
                                className={`${styles.ctaButton} ${styles.emergencyButton}`}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => navigate('/customer/services')}
                            >
                                <AlertTriangle size={20} />
                                Book Emergency Service
                            </motion.button>
                        </div>
                    </motion.div>
                </header>

                {/* Notification Banner for Pending Payments */}
                <AnimatePresence>
                    {showNotification && notifications.length > 0 && (
                        <motion.div
                            className={styles.notificationBanner}
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            <div className={styles.notificationContent}>
                                <Bell size={20} className={styles.notificationIcon} />
                                <div className={styles.notificationText}>
                                    <strong>Mechanic Accepted!</strong>
                                    <span>{notifications[0]?.message}</span>
                                </div>
                                <motion.button
                                    className={styles.notificationAction}
                                    onClick={() => navigate('/customer/bookings')}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <CreditCard size={16} />
                                    Pay Now
                                </motion.button>
                                <button
                                    className={styles.notificationClose}
                                    onClick={() => setShowNotification(false)}
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Overview Section - Matches Landing page overview */}
                <section className={styles.overviewSection}>
                    <motion.div
                        className={styles.overviewIntro}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <span className={styles.overviewTagline}>🚗 YOUR VEHICLE HUB</span>
                        <h2 className={styles.overviewTitle}>Manage Your Vehicles</h2>
                        <p className={styles.overviewSubtitle}>
                            Book services, track repairs, and manage all your vehicles from one place.
                            Emergency breakdown or scheduled maintenance — we've got you covered.
                        </p>
                    </motion.div>

                    {/* Benefits Grid - Matches Landing page */}
                    <motion.div
                        className={styles.benefitsGrid}
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <BenefitCard icon={<AlertTriangle size={24} />} title="Emergency Breakdown" desc="Instant roadside assistance" onClick={() => navigate('/customer/services')} />
                        <BenefitCard icon={<Home size={24} />} title="Home Service" desc="Scheduled maintenance at your door" onClick={() => navigate('/customer/services')} />
                        <BenefitCard icon={<Clock size={24} />} title="Real-time Tracking" desc="Track mechanic arrival live" />
                        <BenefitCard icon={<CreditCard size={24} />} title="Secure Payments" desc="Safe advance payments" />
                        <BenefitCard
                            icon={<ShieldCheck size={24} />}
                            title="Verified Mechanics"
                            desc="Approved & monitored experts"
                            onClick={() => navigate('/customer/mechanics')}
                        />
                        <BenefitCard icon={<MessageCircle size={24} />} title="24/7 Support" desc="Chat with our assistant anytime" />
                    </motion.div>

                    {/* Trust Banner - Matches Landing page */}
                    <motion.div
                        className={styles.trustBanner}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                    >
                        <div className={styles.trustItem}>
                            <CheckCircle size={20} className={styles.trustIcon} />
                            <span>Fast Response</span>
                        </div>
                        <div className={styles.trustItem}>
                            <CheckCircle size={20} className={styles.trustIcon} />
                            <span>Secure Payments</span>
                        </div>
                        <div className={styles.trustItem}>
                            <CheckCircle size={20} className={styles.trustIcon} />
                            <span>Quality Assured</span>
                        </div>
                    </motion.div>
                </section>

                {/* Core Features - Matches Landing page featuresGrid */}
                <section className={styles.featuresGrid}>
                    <FeatureCard
                        icon={<Car size={40} />}
                        title="Emergency Breakdown"
                        desc="Mechanics arrive and repair your vehicle anywhere"
                        delay={0.2}
                        onClick={() => navigate('/customer/services')}
                    />
                    <FeatureCard
                        icon={<Wrench size={40} />}
                        title="Book Service"
                        desc="Schedule maintenance at your convenience"
                        delay={0.4}
                        onClick={() => navigate('/customer/services')}
                    />
                    <FeatureCard
                        icon={<ClipboardList size={40} />}
                        title="My Bookings"
                        desc="View and manage your service bookings"
                        delay={0.6}
                        onClick={() => navigate('/customer/bookings')}
                    />
                    <FeatureCard
                        icon={<Home size={40} />}
                        title="Home Service"
                        desc="Mechanics come to your location"
                        delay={0.8}
                        onClick={() => navigate('/customer/services')}
                    />
                </section>

                {/* Your Vehicles Section */}
                <section className={styles.overviewSection}>
                    <motion.div
                        className={styles.overviewIntro}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <span className={styles.overviewTagline}>🚙 MY VEHICLES</span>
                        <h2 className={styles.overviewTitle}>Your Registered Vehicles</h2>
                        <p className={styles.overviewSubtitle}>
                            Manage your vehicles, book services, and view detailed information.
                        </p>
                    </motion.div>

                    <motion.div
                        className={styles.vehiclesGrid}
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        {loading ? (
                            <div className={styles.loadingText}>Loading vehicles...</div>
                        ) : vehicles.length === 0 ? (
                            <div className={styles.emptyText}>No vehicles registered yet. Add your first vehicle!</div>
                        ) : (
                            vehicles.slice(0, 2).map((vehicle, index) => (
                                <motion.div
                                    key={vehicle.id}
                                    className={styles.vehicleCard}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
                                >
                                    <div className={styles.vehicleHeader}>
                                        <h4 className={styles.vehicleName}>{vehicle.vehicle_name}</h4>
                                        <span className={styles.vehicleTypeBadge}>{vehicle.vehicle_type}</span>
                                    </div>
                                    <p className={styles.vehicleNumber}>{vehicle.registration_no}</p>
                                    <div className={styles.vehicleInfo}>
                                        <span>{vehicle.vehicle_brand} {vehicle.vehicle_model}</span>
                                        {vehicle.vehicle_year && <span> • {vehicle.vehicle_year}</span>}
                                    </div>
                                    <div className={styles.vehicleActions}>
                                        <button className={styles.actionBtn}>
                                            <Wrench size={16} />
                                            Service
                                        </button>
                                        <button
                                            className={`${styles.actionBtn} ${styles.actionBtnSecondary}`}
                                            onClick={() => navigate('/customer/vehicles')}
                                        >
                                            <Info size={16} />
                                            Details
                                        </button>
                                    </div>
                                </motion.div>
                            ))
                        )}

                        {/* Add Vehicle Card - Links to My Vehicles page */}
                        <Link to="/customer/vehicles" style={{ textDecoration: 'none' }}>
                            <motion.div
                                className={styles.addVehicleCard}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.5, duration: 0.5 }}
                                whileHover={{ scale: 1.02 }}
                            >
                                <div className={styles.addIcon}>
                                    <Plus size={28} />
                                </div>
                                <span className={styles.addText}>
                                    {vehicles.length === 0 ? 'Add Your First Vehicle' : 'Manage Vehicles'}
                                </span>
                            </motion.div>
                        </Link>
                    </motion.div>
                </section>

                {/* Chatbot Integration */}
                <ChatWidget />
            </div>
        </DashboardLayout>
    );
};

export default CustomerDashboard;

