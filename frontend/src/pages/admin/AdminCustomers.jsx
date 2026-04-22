import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Users, Search, Mail, Phone, MapPin, Calendar, RefreshCw,
    AlertTriangle, User, Car
} from 'lucide-react';
import styles from '../../styles/AdminCustomers.module.css';
import AdminLayout from '../../components/layout/AdminLayout';
import { getUsers } from '../../services/authService';

const AdminCustomers = () => {
    const [customers, setCustomers] = useState([]);
    const [filteredCustomers, setFilteredCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchCustomers();
    }, []);

    useEffect(() => {
        filterCustomers();
    }, [searchTerm, customers]);

    const fetchCustomers = async () => {
        try {
            setLoading(true);
            const data = await getUsers('customer');
            setCustomers(data);
            setFilteredCustomers(data);
            setError(null);
        } catch (err) {
            console.error('Error fetching customers:', err);
            setError('Failed to load customers');
        } finally {
            setLoading(false);
        }
    };

    const filterCustomers = () => {
        if (!searchTerm.trim()) {
            setFilteredCustomers(customers);
            return;
        }

        const term = searchTerm.toLowerCase();
        const filtered = customers.filter(customer =>
            customer.username?.toLowerCase().includes(term) ||
            customer.email?.toLowerCase().includes(term) ||
            customer.first_name?.toLowerCase().includes(term) ||
            customer.last_name?.toLowerCase().includes(term) ||
            customer.phone?.includes(term) ||
            customer.district?.toLowerCase().includes(term) ||
            customer.place?.toLowerCase().includes(term)
        );
        setFilteredCustomers(filtered);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const getInitials = (customer) => {
        const first = customer.first_name?.[0] || '';
        const last = customer.last_name?.[0] || '';
        return (first + last).toUpperCase() || customer.username?.[0]?.toUpperCase() || 'C';
    };

    if (loading && customers.length === 0) {
        return (
            <AdminLayout>
                <div className={styles.loadingState}>
                    <RefreshCw className={styles.spinner} size={24} />
                    Loading customers...
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            {/* Page Header */}
            <motion.div
                className={styles.pageHeader}
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                <div className={styles.headerTop}>
                    <div>
                        <p className={styles.breadcrumb}>Pages / Customers</p>
                        <h1 className={styles.pageTitle}>All Customers</h1>
                    </div>
                    <motion.button
                        className={styles.refreshBtn}
                        onClick={fetchCustomers}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        disabled={loading}
                    >
                        <RefreshCw size={18} className={loading ? styles.spinning : ''} />
                        Refresh
                    </motion.button>
                </div>

                {/* Stats */}
                <div className={styles.statsRow}>
                    <div className={styles.statItem}>
                        <Users size={20} className={styles.statIcon} />
                        <span className={styles.statValue}>{customers.length}</span>
                        <span className={styles.statLabel}>Total Customers</span>
                    </div>
                </div>

                {/* Search */}
                <div className={styles.searchWrapper}>
                    <Search size={18} className={styles.searchIcon} />
                    <input
                        type="text"
                        className={styles.searchInput}
                        placeholder="Search by name, email, phone, or location..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </motion.div>

            {error && (
                <div className={styles.errorBanner}>
                    <AlertTriangle size={18} />
                    {error}
                </div>
            )}

            {/* Customers Grid */}
            <div className={styles.customersGrid}>
                {filteredCustomers.map((customer, index) => (
                    <motion.div
                        key={customer.id}
                        className={styles.customerCard}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.4, delay: index * 0.05 }}
                        whileHover={{ y: -4 }}
                    >
                        <div className={styles.cardHeader}>
                            <div className={styles.avatar}>
                                {customer.photo ? (
                                    <img src={customer.photo} alt={customer.username} />
                                ) : (
                                    <span>{getInitials(customer)}</span>
                                )}
                            </div>
                            <div className={styles.customerInfo}>
                                <h3 className={styles.customerName}>
                                    {customer.first_name && customer.last_name
                                        ? `${customer.first_name} ${customer.last_name}`
                                        : customer.username
                                    }
                                </h3>
                                <span className={styles.customerUsername}>@{customer.username}</span>
                            </div>
                        </div>

                        <div className={styles.cardBody}>
                            <div className={styles.infoRow}>
                                <Mail size={14} />
                                <span>{customer.email || 'No email'}</span>
                            </div>
                            <div className={styles.infoRow}>
                                <Phone size={14} />
                                <span>{customer.phone || 'No phone'}</span>
                            </div>
                            {(customer.district || customer.place) && (
                                <div className={styles.infoRow}>
                                    <MapPin size={14} />
                                    <span>
                                        {[customer.place, customer.district].filter(Boolean).join(', ')}
                                    </span>
                                </div>
                            )}
                            <div className={styles.infoRow}>
                                <Calendar size={14} />
                                <span>Joined {formatDate(customer.created_at || customer.date_joined)}</span>
                            </div>
                        </div>

                        <div className={styles.cardFooter}>
                            <span className={`${styles.statusBadge} ${customer.is_active ? styles.active : styles.inactive}`}>
                                {customer.is_active ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                    </motion.div>
                ))}

                {filteredCustomers.length === 0 && !loading && (
                    <div className={styles.emptyState}>
                        <User size={48} />
                        <h3>No customers found</h3>
                        <p>{searchTerm ? 'Try adjusting your search' : 'No customers have registered yet'}</p>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default AdminCustomers;
