import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    User, MapPin, Star, DollarSign, Wrench, ArrowLeft, MessageSquare,
    Home, Car, ClipboardList, AlertCircle
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { getMechanicDetails } from '../../services/mechanicService';
import styles from '../../styles/MechanicProfile.module.css';

const MechanicProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [mechanic, setMechanic] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const menuItems = [
        { label: 'Dashboard', path: '/customer', icon: Home },
        { label: 'My Vehicles', path: '/customer/vehicles', icon: Car },
        { label: 'Find Mechanics', path: '/customer/mechanics', icon: Wrench },
        { label: 'My Bookings', path: '/customer/bookings', icon: ClipboardList },
    ];

    useEffect(() => {
        fetchMechanicDetails();
    }, [id]);

    const fetchMechanicDetails = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getMechanicDetails(id);
            setMechanic(data);
        } catch (err) {
            console.error('Error fetching mechanic details:', err);
            setError('Failed to load mechanic profile. The mechanic may not exist or is not approved.');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const renderStars = (rating, size = 16) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        for (let i = 0; i < 5; i++) {
            stars.push(
                <Star
                    key={i}
                    size={size}
                    className={i < fullStars ? styles.starFilled : styles.starEmpty}
                    fill={i < fullStars ? '#fbbf24' : 'none'}
                />
            );
        }
        return stars;
    };

    if (loading) {
        return (
            <DashboardLayout title="Mechanic Profile" role="CUSTOMER" menuItems={menuItems}>
                <div className={styles.container}>
                    <div className={styles.backgroundEffects}>
                        <div className={`${styles.glowBlob} ${styles.blob1}`} />
                        <div className={`${styles.glowBlob} ${styles.blob2}`} />
                    </div>
                    <div className={styles.contentWrapper}>
                        <div className={styles.loadingState}>
                            <div className={styles.spinner} />
                            <p>Loading mechanic profile...</p>
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    if (error) {
        return (
            <DashboardLayout title="Mechanic Profile" role="CUSTOMER" menuItems={menuItems}>
                <div className={styles.container}>
                    <div className={styles.backgroundEffects}>
                        <div className={`${styles.glowBlob} ${styles.blob1}`} />
                        <div className={`${styles.glowBlob} ${styles.blob2}`} />
                    </div>
                    <div className={styles.contentWrapper}>
                        <button className={styles.backButton} onClick={() => navigate('/customer/mechanics')}>
                            <ArrowLeft size={18} />
                            Back to Mechanics
                        </button>
                        <div className={styles.errorState}>
                            <div className={styles.errorIcon}>
                                <AlertCircle size={40} />
                            </div>
                            <h3 className={styles.errorTitle}>Profile Not Found</h3>
                            <p className={styles.errorText}>{error}</p>
                            <button className={styles.backButton} onClick={() => navigate('/customer/mechanics')}>
                                Browse Mechanics
                            </button>
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Mechanic Profile" role="CUSTOMER" menuItems={menuItems}>
            <div className={styles.container}>
                {/* Background Effects */}
                <div className={styles.backgroundEffects}>
                    <div className={`${styles.glowBlob} ${styles.blob1}`} />
                    <div className={`${styles.glowBlob} ${styles.blob2}`} />
                </div>

                <div className={styles.contentWrapper}>
                    {/* Back Button */}
                    <motion.button
                        className={styles.backButton}
                        onClick={() => navigate('/customer/mechanics')}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <ArrowLeft size={18} />
                        Back to Mechanics
                    </motion.button>

                    {/* Profile Card */}
                    <motion.div
                        className={styles.profileCard}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className={styles.profileHeader}>
                            <div className={styles.profileAvatar}>
                                {mechanic.user?.photo_url ? (
                                    <img src={mechanic.user.photo_url} alt={mechanic.user?.first_name} />
                                ) : (
                                    <User size={50} style={{ color: 'white' }} />
                                )}
                            </div>
                            <div className={styles.profileInfo}>
                                <h1 className={styles.profileName}>
                                    {mechanic.user?.first_name} {mechanic.user?.last_name}
                                </h1>
                                <p className={styles.profileLocation}>
                                    <MapPin size={18} />
                                    {mechanic.user?.place || 'Location not set'}
                                    {mechanic.user?.district && `, ${mechanic.user.district}`}
                                </p>
                                <span className={`${styles.statusBadge} ${mechanic.is_available ? styles.statusAvailable : styles.statusBusy}`}>
                                    <span className={styles.statusDot}></span>
                                    {mechanic.is_available ? 'Available' : 'Currently Busy'}
                                </span>
                            </div>
                        </div>

                        {/* Stats Grid */}
                        <div className={styles.statsGrid}>
                            <div className={styles.statCard}>
                                <div className={`${styles.statIcon} ${styles.statIconRating}`}>
                                    <Star size={24} />
                                </div>
                                <div className={styles.statValue}>
                                    <div className={styles.ratingDisplay}>
                                        {renderStars(parseFloat(mechanic.avg_rating) || 0, 18)}
                                    </div>
                                </div>
                                <div className={styles.statLabel}>
                                    {mechanic.avg_rating || '0.0'}/5 Rating
                                </div>
                            </div>
                            <div className={styles.statCard}>
                                <div className={`${styles.statIcon} ${styles.statIconReviews}`}>
                                    <MessageSquare size={24} />
                                </div>
                                <div className={styles.statValue}>{mechanic.total_reviews || 0}</div>
                                <div className={styles.statLabel}>Reviews</div>
                            </div>
                            <div className={styles.statCard}>
                                <div className={`${styles.statIcon} ${styles.statIconService}`}>
                                    <Wrench size={24} />
                                </div>
                                <div className={styles.statValue}>₹{mechanic.min_service_fee || '0'}</div>
                                <div className={styles.statLabel}>Service Fee</div>
                            </div>
                            <div className={styles.statCard}>
                                <div className={`${styles.statIcon} ${styles.statIconBreakdown}`}>
                                    <DollarSign size={24} />
                                </div>
                                <div className={styles.statValue}>₹{mechanic.min_breakdown_fee || '0'}</div>
                                <div className={styles.statLabel}>Breakdown Fee</div>
                            </div>
                        </div>

                        {/* Book Button */}
                        <button
                            className={styles.bookButton}
                            disabled={!mechanic.is_available}
                            onClick={() => navigate('/customer/services')}
                        >
                            <Wrench size={20} />
                            {mechanic.is_available ? 'Book This Mechanic' : 'Currently Unavailable'}
                        </button>
                    </motion.div>

                    {/* Reviews Section */}
                    <motion.div
                        className={styles.reviewsSection}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <h2 className={styles.sectionTitle}>
                            <Star size={24} />
                            Customer Reviews ({mechanic.total_reviews || 0})
                        </h2>

                        {mechanic.reviews && mechanic.reviews.length > 0 ? (
                            <div className={styles.reviewsList}>
                                {mechanic.reviews.map((review, index) => (
                                    <motion.div
                                        key={review.id}
                                        className={styles.reviewCard}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                    >
                                        <div className={styles.reviewHeader}>
                                            <div className={styles.reviewerInfo}>
                                                <div className={styles.reviewerAvatar}>
                                                    <User size={20} />
                                                </div>
                                                <div>
                                                    <div className={styles.reviewerName}>
                                                        {review.customer_name}
                                                    </div>
                                                    <div className={styles.reviewDate}>
                                                        {formatDate(review.created_at)}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className={styles.reviewRating}>
                                                {renderStars(review.rating, 16)}
                                            </div>
                                        </div>
                                        {review.review_text && (
                                            <p className={styles.reviewText}>{review.review_text}</p>
                                        )}
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className={styles.noReviews}>
                                <div className={styles.noReviewsIcon}>
                                    <MessageSquare size={35} />
                                </div>
                                <p className={styles.noReviewsText}>
                                    No reviews yet. Be the first to review!
                                </p>
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default MechanicProfile;
