import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Home, BarChart2, Wrench, Users, Settings, User, LogOut,
    CheckCircle, XCircle, Eye, Clock, Shield, AlertCircle,
    Search, Filter, MoreVertical, UserCheck, UserX, Star, MessageSquare, ChevronDown, ChevronUp
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getMechanics, updateMechanicStatus } from '../../services/authService';
import { getMechanicDetails } from '../../services/mechanicService';
import styles from '../../styles/AdminDashboard.module.css';
import AdminLayout from '../../components/layout/AdminLayout';

const MechanicApproval = () => {
    const [mechanics, setMechanics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('PENDING');
    const [actionLoading, setActionLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedReviews, setExpandedReviews] = useState({});
    const [reviewsData, setReviewsData] = useState({});

    const navigate = useNavigate();
    const { logout } = useAuth();

    useEffect(() => {
        fetchMechanics();
    }, [filter]);

    const fetchMechanics = async () => {
        setLoading(true);
        try {
            const data = await getMechanics(filter);
            setMechanics(data);
        } catch (err) {
            console.error('Error fetching mechanics:', err);
            setError('Failed to load mechanics');
        } finally {
            setLoading(false);
        }
    };

    const handleApproval = async (mechanicId, status) => {
        setActionLoading(true);
        try {
            await updateMechanicStatus(mechanicId, status);
            fetchMechanics();
        } catch (err) {
            console.error('Error updating mechanic:', err);
            setError('Failed to update mechanic status');
        } finally {
            setActionLoading(false);
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            PENDING: { bg: 'rgba(251, 191, 36, 0.15)', text: '#fbbf24', border: 'rgba(251, 191, 36, 0.3)' },
            APPROVED: { bg: 'rgba(34, 197, 94, 0.15)', text: '#22c55e', border: 'rgba(34, 197, 94, 0.3)' },
            REJECTED: { bg: 'rgba(239, 68, 68, 0.15)', text: '#ef4444', border: 'rgba(239, 68, 68, 0.3)' },
            BLOCKED: { bg: 'rgba(107, 114, 128, 0.15)', text: '#6b7280', border: 'rgba(107, 114, 128, 0.3)' },
        };
        return colors[status] || colors.PENDING;
    };

    const toggleReviews = async (mechanicId) => {
        if (expandedReviews[mechanicId]) {
            setExpandedReviews(prev => ({ ...prev, [mechanicId]: false }));
            return;
        }

        // Fetch reviews if not already loaded
        if (!reviewsData[mechanicId]) {
            try {
                const data = await getMechanicDetails(mechanicId);
                setReviewsData(prev => ({ ...prev, [mechanicId]: data }));
            } catch (err) {
                console.error('Error fetching reviews:', err);
            }
        }
        setExpandedReviews(prev => ({ ...prev, [mechanicId]: true }));
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const renderStars = (rating) => {
        const stars = [];
        for (let i = 0; i < 5; i++) {
            stars.push(
                <Star
                    key={i}
                    size={14}
                    fill={i < rating ? '#fbbf24' : 'none'}
                    color={i < rating ? '#fbbf24' : '#374151'}
                />
            );
        }
        return stars;
    };

    const filterTabs = ['PENDING', 'APPROVED', 'REJECTED', 'BLOCKED'];

    const filteredMechanics = mechanics.filter(m =>
        searchTerm === '' ||
        m.user?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.user?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.user?.username?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <AdminLayout>
            {/* Page Header */}
            <motion.div
                className={styles.pageHeader}
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                <p className={styles.breadcrumb}>Pages / Admin / Mechanics</p>
                <h1 className={styles.pageTitle}>Mechanic Approval</h1>
            </motion.div>

            {/* Stats Row */}
            <motion.div
                className={styles.statsGrid}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
            >
                <motion.div className={styles.statCard} whileHover={{ y: -4 }}>
                    <div className={styles.statIcon} style={{ background: 'rgba(251, 191, 36, 0.1)', borderColor: 'rgba(251, 191, 36, 0.2)' }}>
                        <Clock size={22} style={{ color: '#fbbf24' }} />
                    </div>
                    <div className={styles.statInfo}>
                        <p className={styles.statLabel}>Pending Approval</p>
                        <h3 className={styles.statValue}>{mechanics.length}</h3>
                    </div>
                </motion.div>
                <motion.div className={styles.statCard} whileHover={{ y: -4 }}>
                    <div className={styles.statIcon} style={{ background: 'rgba(34, 197, 94, 0.1)', borderColor: 'rgba(34, 197, 94, 0.2)' }}>
                        <UserCheck size={22} style={{ color: '#22c55e' }} />
                    </div>
                    <div className={styles.statInfo}>
                        <p className={styles.statLabel}>Approved</p>
                        <h3 className={styles.statValue}>42</h3>
                    </div>
                </motion.div>
                <motion.div className={styles.statCard} whileHover={{ y: -4 }}>
                    <div className={styles.statIcon} style={{ background: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.2)' }}>
                        <UserX size={22} style={{ color: '#ef4444' }} />
                    </div>
                    <div className={styles.statInfo}>
                        <p className={styles.statLabel}>Rejected</p>
                        <h3 className={styles.statValue}>5</h3>
                    </div>
                </motion.div>
            </motion.div>

            {/* Filter & Search Bar */}
            <motion.div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1.5rem',
                    flexWrap: 'wrap',
                    gap: '1rem'
                }}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
            >
                {/* Filter Tabs */}
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {filterTabs.map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilter(status)}
                            style={{
                                padding: '0.6rem 1.25rem',
                                borderRadius: '10px',
                                fontSize: '0.85rem',
                                fontWeight: 500,
                                border: '1px solid',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                background: filter === status ? 'rgba(45, 212, 191, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                                borderColor: filter === status ? 'rgba(45, 212, 191, 0.3)' : 'rgba(255, 255, 255, 0.08)',
                                color: filter === status ? '#2dd4bf' : 'rgba(255, 255, 255, 0.5)'
                            }}
                        >
                            {status}
                        </button>
                    ))}
                </div>

                {/* Search */}
                <div style={{
                    position: 'relative',
                    minWidth: '250px'
                }}>
                    <Search size={16} style={{
                        position: 'absolute',
                        left: '1rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: 'rgba(255, 255, 255, 0.3)'
                    }} />
                    <input
                        type="text"
                        placeholder="Search mechanics..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            width: '100%',
                            background: 'rgba(255, 255, 255, 0.03)',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            borderRadius: '10px',
                            padding: '0.7rem 1rem 0.7rem 2.75rem',
                            color: 'white',
                            fontSize: '0.9rem',
                            outline: 'none'
                        }}
                    />
                </div>
            </motion.div>

            {/* Error Message */}
            {error && (
                <motion.div
                    style={{
                        marginBottom: '1rem',
                        padding: '1rem',
                        borderRadius: '12px',
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        color: '#ef4444'
                    }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    <AlertCircle size={18} />
                    <span>{error}</span>
                </motion.div>
            )}

            {/* Mechanics List */}
            {loading ? (
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '4rem'
                }}>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        border: '3px solid rgba(45, 212, 191, 0.2)',
                        borderTopColor: '#2dd4bf',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                    }} />
                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                </div>
            ) : filteredMechanics.length === 0 ? (
                <motion.div
                    className={styles.chartCard}
                    style={{ textAlign: 'center', padding: '3rem' }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    <Wrench size={48} style={{ color: 'rgba(255, 255, 255, 0.2)', marginBottom: '1rem' }} />
                    <p style={{ color: 'rgba(255, 255, 255, 0.5)' }}>No {filter.toLowerCase()} mechanics found</p>
                </motion.div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {filteredMechanics.map((mechanic, index) => (
                        <motion.div
                            key={mechanic.id}
                            className={styles.chartCard}
                            style={{ padding: '1.25rem' }}
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.1 + index * 0.05 }}
                            whileHover={{ borderColor: 'rgba(45, 212, 191, 0.3)' }}
                        >
                            <div style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                justifyContent: 'space-between',
                                flexWrap: 'wrap',
                                gap: '1.5rem'
                            }}>
                                {/* Left: Profile Info */}
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                                    {/* Avatar */}
                                    <div style={{
                                        width: '56px',
                                        height: '56px',
                                        borderRadius: '50%',
                                        background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        overflow: 'hidden',
                                        flexShrink: 0
                                    }}>
                                        {mechanic.user?.photo_url ? (
                                            <img
                                                src={mechanic.user.photo_url}
                                                alt={mechanic.user.username}
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            />
                                        ) : (
                                            <User size={24} style={{ color: 'white' }} />
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div>
                                        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'white', marginBottom: '0.25rem' }}>
                                            {mechanic.user?.first_name} {mechanic.user?.last_name}
                                        </h3>
                                        <p style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.4)', marginBottom: '0.25rem' }}>
                                            @{mechanic.user?.username}
                                        </p>
                                        <p style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.3)' }}>
                                            {mechanic.user?.email} • {mechanic.user?.phone}
                                        </p>

                                        {/* Status Badges Container */}
                                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                                            {/* Approval Status Badge */}
                                            <span style={{
                                                display: 'inline-block',
                                                padding: '0.35rem 0.85rem',
                                                borderRadius: '6px',
                                                fontSize: '0.75rem',
                                                fontWeight: 600,
                                                background: getStatusColor(mechanic.approval_status).bg,
                                                color: getStatusColor(mechanic.approval_status).text,
                                                border: `1px solid ${getStatusColor(mechanic.approval_status).border}`
                                            }}>
                                                {mechanic.approval_status}
                                            </span>

                                            {/* Availability Status Badge */}
                                            <span style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '0.35rem',
                                                padding: '0.35rem 0.85rem',
                                                borderRadius: '6px',
                                                fontSize: '0.75rem',
                                                fontWeight: 600,
                                                background: mechanic.is_available
                                                    ? 'rgba(34, 197, 94, 0.15)'
                                                    : 'rgba(107, 114, 128, 0.15)',
                                                color: mechanic.is_available ? '#22c55e' : '#6b7280',
                                                border: `1px solid ${mechanic.is_available
                                                    ? 'rgba(34, 197, 94, 0.3)'
                                                    : 'rgba(107, 114, 128, 0.3)'}`
                                            }}>
                                                <span style={{
                                                    width: '6px',
                                                    height: '6px',
                                                    borderRadius: '50%',
                                                    background: mechanic.is_available ? '#22c55e' : '#6b7280'
                                                }}></span>
                                                {mechanic.is_available ? 'Available' : 'Busy'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Right: Actions */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    {/* View Proof */}
                                    {mechanic.proof_url && (
                                        <a
                                            href={mechanic.proof_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem',
                                                padding: '0.6rem 1rem',
                                                borderRadius: '8px',
                                                background: 'rgba(59, 130, 246, 0.1)',
                                                border: '1px solid rgba(59, 130, 246, 0.3)',
                                                color: '#3b82f6',
                                                fontSize: '0.85rem',
                                                fontWeight: 500,
                                                textDecoration: 'none',
                                                transition: 'all 0.3s ease'
                                            }}
                                        >
                                            <Eye size={16} />
                                            View Proof
                                        </a>
                                    )}

                                    {/* Action Buttons */}
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        {mechanic.approval_status === 'PENDING' && (
                                            <>
                                                <motion.button
                                                    onClick={() => handleApproval(mechanic.id, 'APPROVED')}
                                                    disabled={actionLoading}
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '0.4rem',
                                                        padding: '0.6rem 1rem',
                                                        borderRadius: '8px',
                                                        background: 'rgba(34, 197, 94, 0.1)',
                                                        border: '1px solid rgba(34, 197, 94, 0.3)',
                                                        color: '#22c55e',
                                                        fontSize: '0.85rem',
                                                        fontWeight: 500,
                                                        cursor: 'pointer'
                                                    }}
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                >
                                                    <CheckCircle size={16} />
                                                    Approve
                                                </motion.button>
                                                <motion.button
                                                    onClick={() => handleApproval(mechanic.id, 'REJECTED')}
                                                    disabled={actionLoading}
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '0.4rem',
                                                        padding: '0.6rem 1rem',
                                                        borderRadius: '8px',
                                                        background: 'rgba(239, 68, 68, 0.1)',
                                                        border: '1px solid rgba(239, 68, 68, 0.3)',
                                                        color: '#ef4444',
                                                        fontSize: '0.85rem',
                                                        fontWeight: 500,
                                                        cursor: 'pointer'
                                                    }}
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                >
                                                    <XCircle size={16} />
                                                    Reject
                                                </motion.button>
                                            </>
                                        )}

                                        {mechanic.approval_status === 'APPROVED' && (
                                            <motion.button
                                                onClick={() => handleApproval(mechanic.id, 'BLOCKED')}
                                                disabled={actionLoading}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.4rem',
                                                    padding: '0.6rem 1rem',
                                                    borderRadius: '8px',
                                                    background: 'rgba(107, 114, 128, 0.1)',
                                                    border: '1px solid rgba(107, 114, 128, 0.3)',
                                                    color: '#6b7280',
                                                    fontSize: '0.85rem',
                                                    fontWeight: 500,
                                                    cursor: 'pointer'
                                                }}
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                            >
                                                <XCircle size={16} />
                                                Block
                                            </motion.button>
                                        )}

                                        {(mechanic.approval_status === 'REJECTED' || mechanic.approval_status === 'BLOCKED') && (
                                            <motion.button
                                                onClick={() => handleApproval(mechanic.id, 'APPROVED')}
                                                disabled={actionLoading}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.4rem',
                                                    padding: '0.6rem 1rem',
                                                    borderRadius: '8px',
                                                    background: 'rgba(34, 197, 94, 0.1)',
                                                    border: '1px solid rgba(34, 197, 94, 0.3)',
                                                    color: '#22c55e',
                                                    fontSize: '0.85rem',
                                                    fontWeight: 500,
                                                    cursor: 'pointer'
                                                }}
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                            >
                                                <CheckCircle size={16} />
                                                Approve
                                            </motion.button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Bottom Details Grid */}
                            <div style={{
                                marginTop: '1.25rem',
                                paddingTop: '1.25rem',
                                borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                                display: 'grid',
                                gridTemplateColumns: 'repeat(4, 1fr)',
                                gap: '1.5rem'
                            }}>
                                <div>
                                    <p style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.4)', marginBottom: '0.25rem' }}>Location</p>
                                    <p style={{ fontSize: '0.9rem', color: 'white' }}>
                                        {mechanic.user?.place}, {mechanic.user?.district}
                                    </p>
                                </div>
                                <div>
                                    <p style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.4)', marginBottom: '0.25rem' }}>Service Fee</p>
                                    <p style={{ fontSize: '0.9rem', color: '#2dd4bf', fontWeight: 600 }}>${mechanic.min_service_fee}</p>
                                </div>
                                <div>
                                    <p style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.4)', marginBottom: '0.25rem' }}>Breakdown Fee</p>
                                    <p style={{ fontSize: '0.9rem', color: '#2dd4bf', fontWeight: 600 }}>${mechanic.min_breakdown_fee}</p>
                                </div>
                                <div>
                                    <p style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.4)', marginBottom: '0.25rem' }}>Rating</p>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <div style={{ display: 'flex', gap: '0.1rem' }}>
                                            {renderStars(Math.round(parseFloat(mechanic.avg_rating) || 0))}
                                        </div>
                                        <span style={{ fontSize: '0.9rem', color: '#fbbf24', fontWeight: 600 }}>
                                            {mechanic.avg_rating || '0.0'}/5
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Reviews Section - Toggle Button */}
                            {mechanic.approval_status === 'APPROVED' && (
                                <div style={{ marginTop: '1rem' }}>
                                    <motion.button
                                        onClick={() => toggleReviews(mechanic.id)}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            padding: '0.6rem 1rem',
                                            borderRadius: '8px',
                                            background: 'rgba(251, 191, 36, 0.1)',
                                            border: '1px solid rgba(251, 191, 36, 0.3)',
                                            color: '#fbbf24',
                                            fontSize: '0.85rem',
                                            fontWeight: 500,
                                            cursor: 'pointer',
                                            width: '100%',
                                            justifyContent: 'center'
                                        }}
                                        whileHover={{ scale: 1.01 }}
                                        whileTap={{ scale: 0.99 }}
                                    >
                                        <MessageSquare size={16} />
                                        {expandedReviews[mechanic.id] ? 'Hide Reviews' : 'View Reviews'}
                                        {expandedReviews[mechanic.id] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                    </motion.button>

                                    {/* Reviews Expanded Section */}
                                    {expandedReviews[mechanic.id] && reviewsData[mechanic.id] && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            style={{
                                                marginTop: '1rem',
                                                paddingTop: '1rem',
                                                borderTop: '1px solid rgba(255, 255, 255, 0.06)'
                                            }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                                                <Star size={18} color="#fbbf24" fill="#fbbf24" />
                                                <span style={{ color: 'white', fontWeight: 600 }}>
                                                    Customer Reviews ({reviewsData[mechanic.id].total_reviews || 0})
                                                </span>
                                            </div>

                                            {reviewsData[mechanic.id].reviews && reviewsData[mechanic.id].reviews.length > 0 ? (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                                    {reviewsData[mechanic.id].reviews.map((review) => (
                                                        <div
                                                            key={review.id}
                                                            style={{
                                                                background: 'rgba(255, 255, 255, 0.03)',
                                                                border: '1px solid rgba(255, 255, 255, 0.06)',
                                                                borderRadius: '10px',
                                                                padding: '1rem'
                                                            }}
                                                        >
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                                                <div>
                                                                    <p style={{ color: 'white', fontWeight: 500, fontSize: '0.9rem' }}>
                                                                        {review.customer_name}
                                                                    </p>
                                                                    <p style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '0.75rem' }}>
                                                                        {formatDate(review.created_at)}
                                                                    </p>
                                                                </div>
                                                                <div style={{ display: 'flex', gap: '0.1rem' }}>
                                                                    {renderStars(review.rating)}
                                                                </div>
                                                            </div>
                                                            {review.review_text && (
                                                                <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.85rem', lineHeight: 1.5 }}>
                                                                    {review.review_text}
                                                                </p>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div style={{
                                                    textAlign: 'center',
                                                    padding: '2rem',
                                                    color: 'rgba(255, 255, 255, 0.4)'
                                                }}>
                                                    <MessageSquare size={24} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
                                                    <p>No reviews yet</p>
                                                </div>
                                            )}
                                        </motion.div>
                                    )}
                                </div>
                            )}
                        </motion.div>
                    ))}
                </div>
            )}
        </AdminLayout>
    );
};

export default MechanicApproval;
