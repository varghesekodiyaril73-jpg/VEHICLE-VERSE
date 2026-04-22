import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    AlertTriangle, Clock, CheckCircle, XCircle, MessageSquare,
    User, Wrench, Calendar, ChevronDown, ChevronUp, Send, Search, Filter,
    Zap, Shield
} from 'lucide-react';
import { getComplaints, updateComplaint } from '../../services/authService';
import styles from '../../styles/AdminDashboard.module.css';
import AdminLayout from '../../components/layout/AdminLayout';

const AdminComplaints = () => {
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('ALL');
    const [typeFilter, setTypeFilter] = useState('EMERGENCY_DELAY');
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedComplaint, setExpandedComplaint] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [responseText, setResponseText] = useState({});

    useEffect(() => {
        fetchComplaints();
    }, [filter, typeFilter]);

    const fetchComplaints = async () => {
        setLoading(true);
        try {
            const statusParam = filter === 'ALL' ? null : filter;
            const typeParam = typeFilter === 'ALL' ? null : typeFilter;
            const data = await getComplaints(statusParam, typeParam);
            setComplaints(data);
        } catch (err) {
            console.error('Error fetching complaints:', err);
            setError('Failed to load complaints');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (complaintId, newStatus) => {
        setActionLoading(true);
        try {
            await updateComplaint(complaintId, {
                status: newStatus,
                admin_response: responseText[complaintId] || ''
            });
            fetchComplaints();
            setExpandedComplaint(null);
            setResponseText(prev => ({ ...prev, [complaintId]: '' }));
        } catch (err) {
            console.error('Error updating complaint:', err);
            setError('Failed to update complaint');
        } finally {
            setActionLoading(false);
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            PENDING: { bg: 'rgba(251, 191, 36, 0.15)', text: '#fbbf24', border: 'rgba(251, 191, 36, 0.3)' },
            IN_REVIEW: { bg: 'rgba(59, 130, 246, 0.15)', text: '#3b82f6', border: 'rgba(59, 130, 246, 0.3)' },
            RESOLVED: { bg: 'rgba(34, 197, 94, 0.15)', text: '#22c55e', border: 'rgba(34, 197, 94, 0.3)' },
            REJECTED: { bg: 'rgba(239, 68, 68, 0.15)', text: '#ef4444', border: 'rgba(239, 68, 68, 0.3)' },
        };
        return colors[status] || colors.PENDING;
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'PENDING': return <Clock size={14} />;
            case 'IN_REVIEW': return <AlertTriangle size={14} />;
            case 'RESOLVED': return <CheckCircle size={14} />;
            case 'REJECTED': return <XCircle size={14} />;
            default: return <Clock size={14} />;
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const filterTabs = ['ALL', 'PENDING', 'IN_REVIEW', 'RESOLVED', 'REJECTED'];

    const typeTabs = [
        { value: 'EMERGENCY_DELAY', label: '⚡ Emergency Delays', color: '#ef4444' },
        { value: 'ALL', label: '📚 All Complaints', color: '#2dd4bf' },
        { value: 'SERVICE_QUALITY', label: '🔧 Service Quality', color: '#f59e0b' },
        { value: 'PAYMENT_ISSUE', label: '💳 Payment Issues', color: '#3b82f6' },
        { value: 'OTHER', label: '📝 Other', color: '#8b5cf6' },
    ];

    const getComplaintTypeBadge = (type) => {
        const types = {
            EMERGENCY_DELAY: { label: 'Mechanic Delay', bg: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: 'rgba(239, 68, 68, 0.3)' },
            SERVICE_QUALITY: { label: 'Service Quality', bg: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', border: 'rgba(245, 158, 11, 0.3)' },
            PAYMENT_ISSUE: { label: 'Payment Issue', bg: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', border: 'rgba(59, 130, 246, 0.3)' },
            OTHER: { label: 'Other', bg: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6', border: 'rgba(139, 92, 246, 0.3)' },
        };
        return types[type] || types.OTHER;
    };

    const filteredComplaints = complaints.filter(c =>
        searchTerm === '' ||
        c.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.mechanic_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.booking_id?.toString().includes(searchTerm)
    );

    // Count by status
    const pendingCount = complaints.filter(c => c.status === 'PENDING').length;
    const inReviewCount = complaints.filter(c => c.status === 'IN_REVIEW').length;
    const resolvedCount = complaints.filter(c => c.status === 'RESOLVED').length;
    const emergencyDelayCount = complaints.filter(c => c.complaint_type === 'EMERGENCY_DELAY').length;

    return (
        <AdminLayout>
            {/* Page Header */}
            <motion.div
                className={styles.pageHeader}
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                <p className={styles.breadcrumb}>Pages / Admin / Complaints</p>
                <h1 className={styles.pageTitle}>Customer Complaints</h1>
            </motion.div>

            {/* Complaint Type Tabs - Emergency Delays first */}
            <motion.div
                style={{
                    display: 'flex',
                    gap: '0.5rem',
                    flexWrap: 'wrap',
                    marginBottom: '1.25rem'
                }}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.08 }}
            >
                {typeTabs.map((tab) => (
                    <motion.button
                        key={tab.value}
                        onClick={() => setTypeFilter(tab.value)}
                        style={{
                            padding: '0.65rem 1.25rem',
                            borderRadius: '10px',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            border: '1px solid',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            background: typeFilter === tab.value ? `${tab.color}22` : 'rgba(255, 255, 255, 0.03)',
                            borderColor: typeFilter === tab.value ? `${tab.color}66` : 'rgba(255, 255, 255, 0.08)',
                            color: typeFilter === tab.value ? tab.color : 'rgba(255, 255, 255, 0.5)'
                        }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        {tab.label}
                    </motion.button>
                ))}
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
                        <p className={styles.statLabel}>Pending</p>
                        <h3 className={styles.statValue}>{pendingCount}</h3>
                    </div>
                </motion.div>
                <motion.div className={styles.statCard} whileHover={{ y: -4 }}>
                    <div className={styles.statIcon} style={{ background: 'rgba(59, 130, 246, 0.1)', borderColor: 'rgba(59, 130, 246, 0.2)' }}>
                        <AlertTriangle size={22} style={{ color: '#3b82f6' }} />
                    </div>
                    <div className={styles.statInfo}>
                        <p className={styles.statLabel}>In Review</p>
                        <h3 className={styles.statValue}>{inReviewCount}</h3>
                    </div>
                </motion.div>
                <motion.div className={styles.statCard} whileHover={{ y: -4 }}>
                    <div className={styles.statIcon} style={{ background: 'rgba(34, 197, 94, 0.1)', borderColor: 'rgba(34, 197, 94, 0.2)' }}>
                        <CheckCircle size={22} style={{ color: '#22c55e' }} />
                    </div>
                    <div className={styles.statInfo}>
                        <p className={styles.statLabel}>Resolved</p>
                        <h3 className={styles.statValue}>{resolvedCount}</h3>
                    </div>
                </motion.div>
                <motion.div className={styles.statCard} whileHover={{ y: -4 }}>
                    <div className={styles.statIcon} style={{ background: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.2)' }}>
                        <Zap size={22} style={{ color: '#ef4444' }} />
                    </div>
                    <div className={styles.statInfo}>
                        <p className={styles.statLabel}>Emergency Delays</p>
                        <h3 className={styles.statValue}>{emergencyDelayCount}</h3>
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
                            {status === 'IN_REVIEW' ? 'IN REVIEW' : status}
                        </button>
                    ))}
                </div>

                {/* Search */}
                <div style={{ position: 'relative', minWidth: '250px' }}>
                    <Search size={16} style={{
                        position: 'absolute',
                        left: '1rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: 'rgba(255, 255, 255, 0.3)'
                    }} />
                    <input
                        type="text"
                        placeholder="Search by customer, mechanic, or booking..."
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
                    <AlertTriangle size={18} />
                    <span>{error}</span>
                </motion.div>
            )}

            {/* Complaints List */}
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
            ) : filteredComplaints.length === 0 ? (
                <motion.div
                    className={styles.chartCard}
                    style={{ textAlign: 'center', padding: '3rem' }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    <MessageSquare size={48} style={{ color: 'rgba(255, 255, 255, 0.2)', marginBottom: '1rem' }} />
                    <p style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                        {filter === 'ALL' ? 'No complaints found' : `No ${filter.toLowerCase().replace('_', ' ')} complaints`}
                    </p>
                </motion.div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {filteredComplaints.map((complaint, index) => (
                        <motion.div
                            key={complaint.id}
                            className={styles.chartCard}
                            style={{ padding: '1.25rem' }}
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.1 + index * 0.05 }}
                            whileHover={{ borderColor: 'rgba(45, 212, 191, 0.3)' }}
                        >
                            {/* Complaint Header */}
                            <div style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                justifyContent: 'space-between',
                                flexWrap: 'wrap',
                                gap: '1rem'
                            }}>
                                {/* Left: Complaint Info */}
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                                        <span style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '0.35rem',
                                            padding: '0.35rem 0.85rem',
                                            borderRadius: '6px',
                                            fontSize: '0.75rem',
                                            fontWeight: 600,
                                            background: getStatusColor(complaint.status).bg,
                                            color: getStatusColor(complaint.status).text,
                                            border: `1px solid ${getStatusColor(complaint.status).border}`
                                        }}>
                                            {getStatusIcon(complaint.status)}
                                            {complaint.status.replace('_', ' ')}
                                        </span>
                                        <span style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.4)' }}>
                                            Booking #{complaint.booking_id}
                                        </span>
                                        <span style={{
                                            padding: '0.25rem 0.6rem',
                                            borderRadius: '6px',
                                            fontSize: '0.7rem',
                                            background: complaint.service_type === 'BREAKDOWN'
                                                ? 'rgba(239, 68, 68, 0.15)'
                                                : 'rgba(59, 130, 246, 0.15)',
                                            color: complaint.service_type === 'BREAKDOWN' ? '#ef4444' : '#3b82f6',
                                            border: `1px solid ${complaint.service_type === 'BREAKDOWN'
                                                ? 'rgba(239, 68, 68, 0.3)'
                                                : 'rgba(59, 130, 246, 0.3)'}`
                                        }}>
                                            {complaint.service_type === 'BREAKDOWN' ? 'Emergency' : 'Regular Service'}
                                        </span>
                                        {/* Complaint Type Badge */}
                                        {complaint.complaint_type && (() => {
                                            const typeBadge = getComplaintTypeBadge(complaint.complaint_type);
                                            return (
                                                <span style={{
                                                    padding: '0.25rem 0.6rem',
                                                    borderRadius: '6px',
                                                    fontSize: '0.7rem',
                                                    fontWeight: 600,
                                                    background: typeBadge.bg,
                                                    color: typeBadge.color,
                                                    border: `1px solid ${typeBadge.border}`
                                                }}>
                                                    {complaint.complaint_type_display || typeBadge.label}
                                                </span>
                                            );
                                        })()}
                                    </div>

                                    {/* Customer & Mechanic Info */}
                                    <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <User size={16} style={{ color: '#2dd4bf' }} />
                                            <div>
                                                <p style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.4)' }}>Customer</p>
                                                <p style={{ fontSize: '0.9rem', color: 'white', fontWeight: 500 }}>{complaint.customer_name}</p>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <Wrench size={16} style={{ color: '#fbbf24' }} />
                                            <div>
                                                <p style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.4)' }}>Mechanic</p>
                                                <p style={{ fontSize: '0.9rem', color: 'white', fontWeight: 500 }}>{complaint.mechanic_name}</p>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <Calendar size={16} style={{ color: '#8b5cf6' }} />
                                            <div>
                                                <p style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.4)' }}>Filed On</p>
                                                <p style={{ fontSize: '0.9rem', color: 'white' }}>{formatDate(complaint.created_at)}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Complaint Text Preview */}
                                    <p style={{
                                        fontSize: '0.9rem',
                                        color: 'rgba(255, 255, 255, 0.7)',
                                        lineHeight: 1.5,
                                        overflow: expandedComplaint === complaint.id ? 'visible' : 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: expandedComplaint === complaint.id ? 'normal' : 'nowrap',
                                        maxWidth: expandedComplaint === complaint.id ? 'none' : '600px'
                                    }}>
                                        "{complaint.complaint_text}"
                                    </p>
                                </div>

                                {/* Right: Expand Button */}
                                <motion.button
                                    onClick={() => setExpandedComplaint(
                                        expandedComplaint === complaint.id ? null : complaint.id
                                    )}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.4rem',
                                        padding: '0.6rem 1rem',
                                        borderRadius: '8px',
                                        background: 'rgba(45, 212, 191, 0.1)',
                                        border: '1px solid rgba(45, 212, 191, 0.3)',
                                        color: '#2dd4bf',
                                        fontSize: '0.85rem',
                                        fontWeight: 500,
                                        cursor: 'pointer'
                                    }}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    {expandedComplaint === complaint.id ? 'Hide Details' : 'View Details'}
                                    {expandedComplaint === complaint.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                </motion.button>
                            </div>

                            {/* Expanded Section */}
                            <AnimatePresence>
                                {expandedComplaint === complaint.id && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        style={{
                                            marginTop: '1.25rem',
                                            paddingTop: '1.25rem',
                                            borderTop: '1px solid rgba(255, 255, 255, 0.06)'
                                        }}
                                    >
                                        {/* Full Complaint Text */}
                                        <div style={{ marginBottom: '1.25rem' }}>
                                            <p style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.4)', marginBottom: '0.5rem' }}>
                                                Full Complaint
                                            </p>
                                            <div style={{
                                                background: 'rgba(255, 255, 255, 0.03)',
                                                border: '1px solid rgba(255, 255, 255, 0.06)',
                                                borderRadius: '10px',
                                                padding: '1rem'
                                            }}>
                                                <p style={{ fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.8)', lineHeight: 1.6 }}>
                                                    {complaint.complaint_text}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Contact Info */}
                                        <div style={{
                                            display: 'grid',
                                            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                            gap: '1rem',
                                            marginBottom: '1.25rem'
                                        }}>
                                            <div>
                                                <p style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.4)', marginBottom: '0.25rem' }}>
                                                    Customer Email
                                                </p>
                                                <p style={{ fontSize: '0.9rem', color: 'white' }}>{complaint.customer_email}</p>
                                            </div>
                                            <div>
                                                <p style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.4)', marginBottom: '0.25rem' }}>
                                                    Customer Phone
                                                </p>
                                                <p style={{ fontSize: '0.9rem', color: 'white' }}>{complaint.customer_phone}</p>
                                            </div>
                                        </div>

                                        {/* Previous Admin Response */}
                                        {complaint.admin_response && (
                                            <div style={{ marginBottom: '1.25rem' }}>
                                                <p style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.4)', marginBottom: '0.5rem' }}>
                                                    Admin Response {complaint.resolved_by_name && `(by ${complaint.resolved_by_name})`}
                                                </p>
                                                <div style={{
                                                    background: 'rgba(34, 197, 94, 0.1)',
                                                    border: '1px solid rgba(34, 197, 94, 0.2)',
                                                    borderRadius: '10px',
                                                    padding: '1rem'
                                                }}>
                                                    <p style={{ fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.8)', lineHeight: 1.6 }}>
                                                        {complaint.admin_response}
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        {/* Admin Response Input & Actions */}
                                        {(complaint.status === 'PENDING' || complaint.status === 'IN_REVIEW') && (
                                            <div>
                                                <p style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.4)', marginBottom: '0.5rem' }}>
                                                    Add Response (Optional)
                                                </p>
                                                <textarea
                                                    value={responseText[complaint.id] || ''}
                                                    onChange={(e) => setResponseText(prev => ({
                                                        ...prev,
                                                        [complaint.id]: e.target.value
                                                    }))}
                                                    placeholder="Enter your response to the customer..."
                                                    style={{
                                                        width: '100%',
                                                        minHeight: '80px',
                                                        background: 'rgba(255, 255, 255, 0.03)',
                                                        border: '1px solid rgba(255, 255, 255, 0.08)',
                                                        borderRadius: '10px',
                                                        padding: '0.75rem',
                                                        color: 'white',
                                                        fontSize: '0.9rem',
                                                        resize: 'vertical',
                                                        outline: 'none',
                                                        marginBottom: '1rem'
                                                    }}
                                                />

                                                {/* Action Buttons */}
                                                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                                                    {complaint.status === 'PENDING' && (
                                                        <motion.button
                                                            onClick={() => handleStatusUpdate(complaint.id, 'IN_REVIEW')}
                                                            disabled={actionLoading}
                                                            style={{
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '0.4rem',
                                                                padding: '0.6rem 1.25rem',
                                                                borderRadius: '8px',
                                                                background: 'rgba(59, 130, 246, 0.1)',
                                                                border: '1px solid rgba(59, 130, 246, 0.3)',
                                                                color: '#3b82f6',
                                                                fontSize: '0.85rem',
                                                                fontWeight: 500,
                                                                cursor: 'pointer'
                                                            }}
                                                            whileHover={{ scale: 1.02 }}
                                                            whileTap={{ scale: 0.98 }}
                                                        >
                                                            <AlertTriangle size={16} />
                                                            Mark In Review
                                                        </motion.button>
                                                    )}
                                                    <motion.button
                                                        onClick={() => handleStatusUpdate(complaint.id, 'RESOLVED')}
                                                        disabled={actionLoading}
                                                        style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '0.4rem',
                                                            padding: '0.6rem 1.25rem',
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
                                                        Mark Resolved
                                                    </motion.button>
                                                    <motion.button
                                                        onClick={() => handleStatusUpdate(complaint.id, 'REJECTED')}
                                                        disabled={actionLoading}
                                                        style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '0.4rem',
                                                            padding: '0.6rem 1.25rem',
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
                                                        Reject Complaint
                                                    </motion.button>
                                                </div>
                                            </div>
                                        )}

                                        {/* Resolved Info */}
                                        {complaint.resolved_at && (
                                            <div style={{
                                                marginTop: '1rem',
                                                padding: '0.75rem',
                                                background: 'rgba(255, 255, 255, 0.03)',
                                                borderRadius: '8px',
                                                fontSize: '0.8rem',
                                                color: 'rgba(255, 255, 255, 0.5)'
                                            }}>
                                                {complaint.status === 'RESOLVED' ? '✓ Resolved' : '✗ Rejected'} on {formatDate(complaint.resolved_at)}
                                                {complaint.resolved_by_name && ` by ${complaint.resolved_by_name}`}
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </div>
            )}
        </AdminLayout>
    );
};

export default AdminComplaints;
