import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User, Mail, Phone, MapPin, Home, Edit3, Save, X, Camera,
    Car, ClipboardList, Users, CheckCircle, AlertTriangle,
    ArrowLeft
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { getCurrentUser, updateProfile } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import styles from '../../styles/CustomerProfile.module.css';

const CustomerProfile = () => {
    const navigate = useNavigate();
    const { user: authUser, updateUser } = useAuth();
    const [profile, setProfile] = useState(null);
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
        { label: 'Dashboard', path: '/customer', icon: Home },
        { label: 'My Vehicles', path: '/customer/vehicles', icon: Car },
        { label: 'Find Mechanics', path: '/customer/mechanics', icon: Users },
        { label: 'My Bookings', path: '/customer/bookings', icon: ClipboardList },
    ];

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        setLoading(true);
        try {
            const data = await getCurrentUser();
            setProfile(data.user);
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
            // Update auth context
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

    if (loading) {
        return (
            <DashboardLayout title="My Profile" role="CUSTOMER" menuItems={menuItems}>
                <div className={styles.container}>
                    <div className={styles.loadingState}>Loading profile...</div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="My Profile" role="CUSTOMER" menuItems={menuItems}>
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
                        className={styles.headerContent}
                    >
                        <button
                            className={styles.backBtn}
                            onClick={() => navigate(-1)}
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <h1 className={styles.pageTitle}>My Profile</h1>
                            <p className={styles.pageSubtitle}>
                                Manage your personal information
                            </p>
                        </div>
                    </motion.div>

                    {!isEditing ? (
                        <motion.button
                            className={styles.editBtn}
                            onClick={() => setIsEditing(true)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Edit3 size={18} />
                            Edit Profile
                        </motion.button>
                    ) : (
                        <div className={styles.editActions}>
                            <motion.button
                                className={styles.cancelBtn}
                                onClick={handleCancel}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <X size={18} />
                                Cancel
                            </motion.button>
                            <motion.button
                                className={styles.saveBtn}
                                onClick={handleSave}
                                disabled={saving}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Save size={18} />
                                {saving ? 'Saving...' : 'Save Changes'}
                            </motion.button>
                        </div>
                    )}
                </header>

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
                    className={styles.profileCard}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    {/* Avatar Section */}
                    <div className={styles.avatarSection}>
                        <div className={styles.avatarWrapper}>
                            {profile?.photo_url ? (
                                <img src={profile.photo_url} alt="Profile" className={styles.avatar} />
                            ) : (
                                <div className={styles.avatarPlaceholder}>
                                    <User size={48} />
                                </div>
                            )}
                        </div>
                        <div className={styles.userInfo}>
                            <h2>{profile?.first_name} {profile?.last_name}</h2>
                            <span className={styles.roleBadge}>Customer</span>
                            <p className={styles.username}>@{profile?.username}</p>
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
                                <ClipboardList size={18} />
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
        </DashboardLayout>
    );
};

export default CustomerProfile;
