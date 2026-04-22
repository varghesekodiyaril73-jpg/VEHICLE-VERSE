import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    AlertTriangle, Wrench, Home, Car, ClipboardList, Clock,
    MapPin, Phone, CheckCircle, ArrowRight, Users
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import styles from '../../styles/BookService.module.css';

// Service Option Card Component
const ServiceOptionCard = ({ icon, title, subtitle, description, features, buttonText, variant, delay, onClick }) => {
    return (
        <motion.div
            className={`${styles.serviceCard} ${styles[variant]}`}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: delay, duration: 0.6 }}
            whileHover={{ y: -8, transition: { duration: 0.3 } }}
        >
            <div className={styles.cardHeader}>
                <div className={`${styles.iconWrapper} ${styles[`${variant}Icon`]}`}>
                    {icon}
                </div>
                <div className={styles.cardTitles}>
                    <h3 className={styles.cardTitle}>{title}</h3>
                    <span className={styles.cardSubtitle}>{subtitle}</span>
                </div>
            </div>

            <p className={styles.cardDescription}>{description}</p>

            <ul className={styles.featuresList}>
                {features.map((feature, index) => (
                    <li key={index} className={styles.featureItem}>
                        <CheckCircle size={16} className={styles.featureIcon} />
                        <span>{feature}</span>
                    </li>
                ))}
            </ul>

            <motion.button
                className={`${styles.cardButton} ${styles[`${variant}Button`]}`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onClick}
            >
                {buttonText}
                <ArrowRight size={18} />
            </motion.button>
        </motion.div>
    );
};

const BookService = () => {
    const navigate = useNavigate();

    const menuItems = [
        { label: 'Dashboard', path: '/customer', icon: Home },
        { label: 'My Vehicles', path: '/customer/vehicles', icon: Car },
        { label: 'Find Mechanics', path: '/customer/mechanics', icon: Users },
        { label: 'My Bookings', path: '/customer/bookings', icon: ClipboardList },
    ];

    const emergencyFeatures = [
        'Mechanics arrive within 30-60 minutes',
        'Available 24/7 for emergencies',
        'On-spot repairs & towing assistance',
        'Live tracking of mechanic location',
    ];

    const regularFeatures = [
        'Choose your preferred date & time',
        'Home service at your doorstep',
        'Comprehensive vehicle maintenance',
        'Transparent pricing upfront',
    ];

    const handleEmergencyService = () => {
        navigate('/customer/book/emergency');
    };

    const handleRegularService = () => {
        navigate('/customer/book/regular');
    };

    return (
        <DashboardLayout title="Book Service" role="CUSTOMER" menuItems={menuItems}>
            <div className={styles.container}>
                {/* Background Effects */}
                <div className={styles.backgroundEffects}>
                    <div className={`${styles.glowBlob} ${styles.blob1}`} />
                    <div className={`${styles.glowBlob} ${styles.blob2}`} />
                </div>

                {/* Page Header */}
                <header className={styles.pageHeader}>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <span className={styles.pageTagline}>🔧 BOOK A SERVICE</span>
                        <h1 className={styles.pageTitle}>How Can We Help You?</h1>
                        <p className={styles.pageSubtitle}>
                            Choose the type of service you need. Whether it's an emergency breakdown
                            or scheduled maintenance, we've got you covered.
                        </p>
                    </motion.div>
                </header>

                {/* Service Options Grid */}
                <section className={styles.servicesSection}>
                    <div className={styles.servicesGrid}>
                        {/* Emergency Breakdown Card */}
                        <ServiceOptionCard
                            icon={<AlertTriangle size={32} />}
                            title="Emergency Breakdown"
                            subtitle="Instant Assistance"
                            description="Stranded on the road? Get immediate help with our emergency breakdown service. Our verified mechanics will reach you quickly and get you back on the road."
                            features={emergencyFeatures}
                            buttonText="Request Emergency Help"
                            variant="emergency"
                            delay={0.2}
                            onClick={handleEmergencyService}
                        />

                        {/* Regular Service Card */}
                        <ServiceOptionCard
                            icon={<Wrench size={32} />}
                            title="Regular Service"
                            subtitle="Scheduled Maintenance"
                            description="Keep your vehicle in top condition with scheduled maintenance. Book a service at your convenience and let our experts take care of your vehicle."
                            features={regularFeatures}
                            buttonText="Schedule a Service"
                            variant="regular"
                            delay={0.4}
                            onClick={handleRegularService}
                        />
                    </div>
                </section>

                {/* Info Section */}
                <section className={styles.infoSection}>
                    <motion.div
                        className={styles.infoBanner}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                    >
                        <div className={styles.infoItem}>
                            <Clock size={22} className={styles.infoIcon} />
                            <div>
                                <h4>Quick Response</h4>
                                <p>Average 30 min arrival time</p>
                            </div>
                        </div>
                        <div className={styles.infoItem}>
                            <MapPin size={22} className={styles.infoIcon} />
                            <div>
                                <h4>Service Anywhere</h4>
                                <p>We come to your location</p>
                            </div>
                        </div>
                        <div className={styles.infoItem}>
                            <Phone size={22} className={styles.infoIcon} />
                            <div>
                                <h4>24/7 Support</h4>
                                <p>Always here to help</p>
                            </div>
                        </div>
                    </motion.div>
                </section>
            </div>
        </DashboardLayout>
    );
};

export default BookService;
