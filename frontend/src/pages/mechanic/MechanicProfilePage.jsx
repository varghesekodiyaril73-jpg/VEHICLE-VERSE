import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User, Mail, Phone, MapPin, Edit3, Save, X,
    Wrench, CheckCircle, AlertTriangle,
    DollarSign, Star, Settings, PenTool, Calendar
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { getCurrentUser, updateProfile } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import styles from '../../styles/CustomerProfile.module.css';

const MechanicProfilePage = () => {
    const navigate = useNavigate();
    const { user: authUser, updateUser } = useAuth();
    const [profile, setProfile] = useState(null);
    const [mechanicProfile, setMechanicProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        state: '',
        district: '',
        place: '',
        address_line: ''
    });

    const menuItems = [
        { label: 'Dashboard', path: '/mechanic', icon: PenTool },
        { label: 'Jobs', path: '/mechanic/jobs', icon: Wrench },
        { label: 'History', path: '/mechanic/history', icon: Calendar },
    ];

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        setLoading(true);
        try {
            const data = await getCurrentUser();
            setProfile(data.user);
            setMechanicProfile(data.profile);
            setFormData({
                first_name: data.user.first_name || '',
                last_name: data.user.last_name || '',
                email: data.user.email || '',
                phone: data.user.phone || '',
                state: data.user.state || '',
                district: data.user.district || '',
                place: data.user.place || '',
                address_line: data.user.address_line || ''
            });
        } catch (err) {
            console.error('Error fetching profile:', err);
            setError('Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        setSaving(true);
        setError(null);
        try {
            const updatedUser = await updateProfile(formData);
            setProfile(updatedUser);
            setIsEditing(false);
            setSuccessMessage('Profile updated successfully!');
            if (updateUser) {
                updateUser(updatedUser);
            }
            setTimeout(() => setSuccessMessage(null), 5000);
        } catch (err) {
            console.error('Error updating profile:', err);
            setError(err.response?.data?.error || 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        setFormData({
            first_name: profile?.first_name || '',
            last_name: profile?.last_name || '',
            email: profile?.email || '',
            phone: profile?.phone || '',
            state: profile?.state || '',
            district: profile?.district || '',
            place: profile?.place || '',
            address_line: profile?.address_line || ''
        });
    };

    const getApprovalStatusBadge = (status) => {
        const statusConfig = {
            'APPROVED': { color: '#34d399', bg: 'rgba(16, 185, 129, 0.2)', label: 'Approved' },
            'PENDING': { color: '#fbbf24', bg: 'rgba(251, 191, 36, 0.2)', label: 'Pending Approval' },
            'REJECTED': { color: '#f87171', bg: 'rgba(239, 68, 68, 0.2)', label: 'Rejected' }
        };
        const config = statusConfig[status] || statusConfig['PENDING'];
        return (
            <span style={{
                padding: '4px 12px',
                background: config.bg,
                border: `1px solid ${config.color}40`,
                borderRadius: '20px',
                fontSize: '0.75rem',
                fontWeight: 500,
                color: config.color
            }}>
                {config.label}
            </span>
        );
    };

    if (loading) {
        return (
            <DashboardLayout title="My Profile" role="MECHANIC" menuItems={menuItems}>
                <div className={styles.container}>
                    <div className={styles.loadingState}>Loading profile...</div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="My Profile" role="MECHANIC" menuItems={menuItems}>
            <div className={styles.container}>
                {/* Background Effects */}
                <div className={styles.backgroundEffects}>
                    <div className={`${styles.glowBlob} ${styles.blob1}`} />
                    <div className={`${styles.glowBlob} ${styles.blob2}`} />
                </div>

                {/* Content Wrapper */}
                <div className={styles.contentWrapper}>

                    {/* Messages */}
                    <AnimatePresence>
                        {error && (
                            <motion.div
                                className={styles.errorMessage}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            >
                                <AlertTriangle size={18} />
                                {error}
                                <button onClick={() => setError(null)}>&times;</button>
                            </motion.div>
                        )}
                        {successMessage && (
                            <motion.div
                                className={styles.successMessage}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            >
                                <CheckCircle size={18} />
                                {successMessage}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Profile Card */}
                    <motion.div
                        className={styles.glassCard}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        {/* Card Header */}
                        <div className={styles.cardHeader}>
                            <h3 className={styles.cardTitle}>Profile Information</h3>
                            <div className={styles.headerActions}>
                                {!isEditing ? (
                                    <motion.button
                                        className={styles.editBtn}
                                        onClick={() => setIsEditing(true)}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <Edit3 size={16} />
                                        Edit
                                    </motion.button>
                                ) : (
                                    <>
                                        <motion.button
                                            className={styles.cancelBtn}
                                            onClick={handleCancel}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            <X size={16} />
                                            Cancel
                                        </motion.button>
                                        <motion.button
                                            className={styles.saveBtn}
                                            onClick={handleSave}
                                            disabled={saving}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            <Save size={16} />
                                            {saving ? 'Saving...' : 'Save'}
                                        </motion.button>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Avatar Section */}
                        <div className={styles.avatarSection}>
                            <div className={styles.avatarWrapper}>
                                {profile?.photo_url ? (
                                    <img src={profile.photo_url} alt="Profile" className={styles.avatar} />
                                ) : (
                                    <div className={styles.avatarPlaceholder}>
                                        <Wrench size={48} />
                                    </div>
                                )}
                            </div>
                            <div className={styles.userInfo}>
                                <h2>{profile?.first_name} {profile?.last_name}</h2>
                                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                                    <span className={styles.roleBadge} style={{
                                        background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.2), rgba(234, 88, 12, 0.2))',
                                        borderColor: 'rgba(249, 115, 22, 0.4)',
                                        color: '#fb923c'
                                    }}>
                                        Mechanic
                                    </span>
                                    {mechanicProfile && getApprovalStatusBadge(mechanicProfile.approval_status)}
                                </div>
                                <p className={styles.username}>@{profile?.username}</p>
                                {mechanicProfile && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '0.5rem' }}>
                                        <Star size={16} style={{ color: '#fbbf24', fill: '#fbbf24' }} />
                                        <span style={{ color: 'white', fontSize: '0.9rem' }}>
                                            {parseFloat(mechanicProfile.avg_rating || 0).toFixed(1)} Rating
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Details Grid */}
                        <div className={styles.detailsGrid}>
                            {/* Personal Information */}
                            <div className={styles.section}>
                                <h3 className={styles.sectionTitle}>
                                    <User size={18} />
                                    Personal Information
                                </h3>

                                <div className={styles.fieldGroup}>
                                    <label>First Name</label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            name="first_name"
                                            value={formData.first_name}
                                            onChange={handleInputChange}
                                            className={styles.input}
                                        />
                                    ) : (
                                        <p>{profile?.first_name || 'Not set'}</p>
                                    )}
                                </div>

                                <div className={styles.fieldGroup}>
                                    <label>Last Name</label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            name="last_name"
                                            value={formData.last_name}
                                            onChange={handleInputChange}
                                            className={styles.input}
                                        />
                                    ) : (
                                        <p>{profile?.last_name || 'Not set'}</p>
                                    )}
                                </div>
                            </div>

                            {/* Contact Information */}
                            <div className={styles.section}>
                                <h3 className={styles.sectionTitle}>
                                    <Mail size={18} />
                                    Contact Information
                                </h3>

                                <div className={styles.fieldGroup}>
                                    <label>Email</label>
                                    {isEditing ? (
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            className={styles.input}
                                        />
                                    ) : (
                                        <p>{profile?.email || 'Not set'}</p>
                                    )}
                                </div>

                                <div className={styles.fieldGroup}>
                                    <label>Phone</label>
                                    {isEditing ? (
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            className={styles.input}
                                        />
                                    ) : (
                                        <p>{profile?.phone || 'Not set'}</p>
                                    )}
                                </div>
                            </div>

                            {/* Service Fees */}
                            {mechanicProfile && (
                                <div className={styles.section}>
                                    <h3 className={styles.sectionTitle}>
                                        <DollarSign size={18} />
                                        Service Fees
                                    </h3>

                                    <div className={styles.fieldGroup}>
                                        <label>Minimum Service Fee</label>
                                        <p>₹{mechanicProfile.min_service_fee || '0'}</p>
                                    </div>

                                    <div className={styles.fieldGroup}>
                                        <label>Minimum Breakdown Fee</label>
                                        <p>₹{mechanicProfile.min_breakdown_fee || '0'}</p>
                                    </div>

                                    <div className={styles.fieldGroup}>
                                        <label>Availability Status</label>
                                        <p style={{
                                            color: mechanicProfile.is_available ? '#34d399' : '#f87171'
                                        }}>
                                            {mechanicProfile.is_available ? '● Available' : '○ Not Available'}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Address Information */}
                            <div className={styles.section}>
                                <h3 className={styles.sectionTitle}>
                                    <MapPin size={18} />
                                    Address
                                </h3>

                                <div className={styles.fieldGroup}>
                                    <label>State</label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            name="state"
                                            value={formData.state}
                                            onChange={handleInputChange}
                                            className={styles.input}
                                        />
                                    ) : (
                                        <p>{profile?.state || 'Not set'}</p>
                                    )}
                                </div>

                                <div className={styles.fieldGroup}>
                                    <label>District</label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            name="district"
                                            value={formData.district}
                                            onChange={handleInputChange}
                                            className={styles.input}
                                        />
                                    ) : (
                                        <p>{profile?.district || 'Not set'}</p>
                                    )}
                                </div>

                                <div className={styles.fieldGroup}>
                                    <label>Place</label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            name="place"
                                            value={formData.place}
                                            onChange={handleInputChange}
                                            className={styles.input}
                                        />
                                    ) : (
                                        <p>{profile?.place || 'Not set'}</p>
                                    )}
                                </div>

                                <div className={styles.fieldGroup}>
                                    <label>Address Line</label>
                                    {isEditing ? (
                                        <textarea
                                            name="address_line"
                                            value={formData.address_line}
                                            onChange={handleInputChange}
                                            className={styles.textarea}
                                            rows={3}
                                        />
                                    ) : (
                                        <p>{profile?.address_line || 'Not set'}</p>
                                    )}
                                </div>
                            </div>

                            {/* Account Information */}
                            <div className={styles.section}>
                                <h3 className={styles.sectionTitle}>
                                    <Settings size={18} />
                                    Account Details
                                </h3>

                                <div className={styles.fieldGroup}>
                                    <label>Username</label>
                                    <p>{profile?.username}</p>
                                </div>

                                <div className={styles.fieldGroup}>
                                    <label>Member Since</label>
                                    <p>
                                        {profile?.created_at
                                            ? new Date(profile.created_at).toLocaleDateString('en-IN', {
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric'
                                            })
                                            : 'N/A'
                                        }
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default MechanicProfilePage;
