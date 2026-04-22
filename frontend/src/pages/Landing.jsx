import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Search, Car, Wrench, MapPin, Zap,
    AlertTriangle, Home, Clock, CreditCard, MessageCircle, ShieldCheck, CheckCircle,
    Mail, Phone
} from 'lucide-react';
import styles from '../styles/Landing.module.css';

const Landing = () => {
    return (
        <div className={styles.container}>
            {/* Background Effects */}
            <div className={styles.backgroundEffects}>
                <div className={`${styles.glowBlob} ${styles.blob1}`} />
                <div className={`${styles.glowBlob} ${styles.blob2}`} />
            </div>

            {/* Navbar */}
            <motion.nav
                className={styles.navbar}
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
            >
                <div className={styles.brand}>VehicleVerse</div>

                <div className={styles.navLinks}>
                    <a href="#overview" className={styles.navLink}>Overview</a>
                    <a href="#features" className={styles.navLink}>Features</a>
                    <a href="#contact" className={styles.navLink}>Contact</a>
                </div>

                <div className={styles.searchContainer}>
                    <Search className={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder="Search..."
                        className={styles.searchInput}
                    />
                </div>

                <div className={styles.authButtons}>
                    <Link to="/register" className={styles.joinBtn}>Join Us</Link>
                    <Link to="/login" className={styles.loginLink}>Login</Link>
                </div>
            </motion.nav>

            {/* Hero Section */}
            <header className={styles.heroSection}>
                <motion.div
                    className={styles.heroContent}
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
                            Connect to the Future of <br />
                            <span className={styles.glowText}>Automotive Services</span>
                        </motion.h1>

                        <motion.button
                            className={styles.ctaButton}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Link to="/login" style={{ color: 'inherit', textDecoration: 'none' }}>
                                Get Started
                            </Link>
                        </motion.button>
                    </div>
                </motion.div>
            </header>

            {/* Overview Section */}
            <section id="overview" className={styles.overviewSection}>
                <motion.div
                    className={styles.overviewIntro}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <span className={styles.overviewTagline}>🚗 VEHICLE SERVICE & BREAKDOWN MANAGEMENT</span>
                    <h2 className={styles.overviewTitle}>Welcome to VehicleVerse</h2>
                    <p className={styles.overviewSubtitle}>
                        Connect with trusted mechanics anytime, anywhere. Emergency breakdown or home service — help is just a click away.
                    </p>
                </motion.div>

                {/* Benefits Grid */}
                <motion.div
                    className={styles.benefitsGrid}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <BenefitCard icon={<AlertTriangle size={24} />} title="Emergency Breakdown" desc="Instant roadside assistance" />
                    <BenefitCard icon={<Home size={24} />} title="Home Service" desc="Scheduled maintenance at your door" />
                    <BenefitCard icon={<Clock size={24} />} title="Real-time Tracking" desc="Track mechanic arrival live" />
                    <BenefitCard icon={<CreditCard size={24} />} title="Secure Payments" desc="Safe advance payments" />
                    <BenefitCard icon={<ShieldCheck size={24} />} title="Verified Mechanics" desc="Approved & monitored experts" />
                    <BenefitCard icon={<MessageCircle size={24} />} title="24/7 Support" desc="Chat with our assistant anytime" />
                </motion.div>

                {/* Trust Banner */}
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

            {/* Core Features */}
            <section id="features" className={styles.featuresGrid}>
                <FeatureCard
                    icon={<Car size={40} />}
                    title="Emergeny Breakdown Services"
                    desc="Mechanics will arrive and repair the vechicle anywhere"
                    delay={0.2}
                />
                <FeatureCard
                    icon={<Zap size={40} />}
                    title="Home Service"
                    desc="Mechanics will arrive and repair the vechicle in your house"
                    delay={0.4}
                />
                <FeatureCard
                    icon={<Wrench size={40} />}
                    title="Expert Diagnostics"
                    desc="AI-powered analysis for precision repairs."
                    delay={0.6}
                />
                <FeatureCard
                    icon={<MapPin size={40} />}
                    title="Nation level Positioning"
                    desc="Real-time tracking. Dynamic route planning."
                    delay={0.8}
                />
            </section>

            {/* Contact Section */}
            <section id="contact" className={styles.contactSection}>
                <motion.div
                    className={styles.contactContainer}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <span className={styles.contactTagline}>📞 GET IN TOUCH</span>
                    <h2 className={styles.contactTitle}>We're Here to Help</h2>
                    <p className={styles.contactSubtitle}>
                        Have questions or need assistance? Reach out to us anytime — we're just a message away.
                    </p>

                    <div className={styles.contactCards}>
                        <motion.a
                            href="mailto:varghesekodiyaril73@gmail.com"
                            className={styles.contactCard}
                            whileHover={{ y: -5 }}
                        >
                            <div className={styles.contactCardIcon}>
                                <Mail size={28} />
                            </div>
                            <p className={styles.contactCardLabel}>Email Us</p>
                            <p className={styles.contactCardValue}>varghesekodiyaril73@gmail.com</p>
                        </motion.a>

                        <motion.a
                            href="tel:+918012345690"
                            className={styles.contactCard}
                            whileHover={{ y: -5 }}
                        >
                            <div className={styles.contactCardIcon}>
                                <Phone size={28} />
                            </div>
                            <p className={styles.contactCardLabel}>Call Us</p>
                            <p className={styles.contactCardValue}>+91 80XXXXXX90</p>
                        </motion.a>
                    </div>
                </motion.div>
            </section>

            {/* Footer */}
            <footer className={styles.footer}>
                <p className={styles.footerText}>
                    © 2026 <span className={styles.footerBrand}>VehicleVerse</span>. All rights reserved.
                </p>
            </footer>
        </div>
    );
};

const FeatureCard = ({ icon, title, desc, delay }) => {
    return (
        <motion.div
            className={styles.featureCard}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: delay, duration: 0.6 }}
        >
            <div className={styles.iconWrapper}>
                {icon}
            </div>
            <h3 className={styles.featureTitle}>{title}</h3>
            <p className={styles.featureDesc}>{desc}</p>
        </motion.div>
    );
}

const BenefitCard = ({ icon, title, desc }) => {
    return (
        <motion.div
            className={styles.benefitCard}
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
        >
            <div className={styles.benefitIcon}>
                {icon}
            </div>
            <h4 className={styles.benefitTitle}>{title}</h4>
            <p className={styles.benefitDesc}>{desc}</p>
        </motion.div>
    );
}

export default Landing;

