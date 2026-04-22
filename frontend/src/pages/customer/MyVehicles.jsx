import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Car, Plus, Edit3, Trash2, X,
    Wrench, ClipboardList, Home, Calendar, Tag, AlertTriangle, Users
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { getVehicles, createVehicle, updateVehicle, deleteVehicle } from '../../services/vehicleService';
import styles from '../../styles/MyVehicles.module.css';

const VEHICLE_TYPES = [
    { value: 'CAR', label: 'Car' },
    { value: 'BIKE', label: 'Bike' },
    { value: 'SCOOTER', label: 'Scooter' },
    { value: 'RICKSHAW', label: 'Rickshaw' },
    { value: 'HEAVY VEHICLE', label: 'Heavy Vehicle' },
    { value: 'OTHER', label: 'Other' }
];

const MyVehicles = () => {
    const navigate = useNavigate();
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Modal states
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        vehicle_name: '',
        vehicle_type: 'CAR',
        vehicle_brand: '',
        vehicle_model: '',
        registration_no: '',
        vehicle_year: ''
    });
    const [formError, setFormError] = useState('');

    const menuItems = [
        { label: 'Dashboard', path: '/customer', icon: Home },
        { label: 'My Vehicles', path: '/customer/vehicles', icon: Car },
        { label: 'Find Mechanics', path: '/customer/mechanics', icon: Users },
        { label: 'My Bookings', path: '/customer/bookings', icon: ClipboardList },
    ];

    // Fetch vehicles on mount
    useEffect(() => {
        fetchVehicles();
    }, []);

    const fetchVehicles = async () => {
        try {
            setLoading(true);
            const data = await getVehicles();
            setVehicles(data);
            setError('');
        } catch (err) {
            setError('Failed to load vehicles. Please try again.');
            console.error('Error fetching vehicles:', err);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            vehicle_name: '',
            vehicle_type: 'CAR',
            vehicle_brand: '',
            vehicle_model: '',
            registration_no: '',
            vehicle_year: ''
        });
        setFormError('');
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAddVehicle = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setFormError('');

        try {
            const payload = { ...formData };
            if (payload.vehicle_year) {
                payload.vehicle_year = parseInt(payload.vehicle_year, 10);
            } else {
                delete payload.vehicle_year;
            }

            const response = await createVehicle(payload);
            setVehicles(prev => [response.vehicle, ...prev]);
            setShowAddModal(false);
            resetForm();
        } catch (err) {
            const errorMessage = err.response?.data?.registration_no?.[0]
                || err.response?.data?.detail
                || Object.values(err.response?.data || {})[0]?.[0]
                || 'Failed to add vehicle. Please try again.';
            setFormError(errorMessage);
        } finally {
            setSubmitting(false);
        }
    };

    const handleEditClick = (vehicle) => {
        setSelectedVehicle(vehicle);
        setFormData({
            vehicle_name: vehicle.vehicle_name || '',
            vehicle_type: vehicle.vehicle_type || 'CAR',
            vehicle_brand: vehicle.vehicle_brand || '',
            vehicle_model: vehicle.vehicle_model || '',
            registration_no: vehicle.registration_no || '',
            vehicle_year: vehicle.vehicle_year || ''
        });
        setShowEditModal(true);
    };

    const handleUpdateVehicle = async (e) => {
        e.preventDefault();
        if (!selectedVehicle) return;

        setSubmitting(true);
        setFormError('');

        try {
            const payload = { ...formData };
            if (payload.vehicle_year) {
                payload.vehicle_year = parseInt(payload.vehicle_year, 10);
            } else {
                payload.vehicle_year = null;
            }

            const response = await updateVehicle(selectedVehicle.id, payload);
            setVehicles(prev => prev.map(v =>
                v.id === selectedVehicle.id ? response.vehicle : v
            ));
            setShowEditModal(false);
            setSelectedVehicle(null);
            resetForm();
        } catch (err) {
            const errorMessage = err.response?.data?.registration_no?.[0]
                || err.response?.data?.detail
                || Object.values(err.response?.data || {})[0]?.[0]
                || 'Failed to update vehicle. Please try again.';
            setFormError(errorMessage);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteClick = (vehicle) => {
        setSelectedVehicle(vehicle);
        setShowDeleteModal(true);
    };

    const handleDeleteVehicle = async () => {
        if (!selectedVehicle) return;

        setSubmitting(true);

        try {
            await deleteVehicle(selectedVehicle.id);
            setVehicles(prev => prev.filter(v => v.id !== selectedVehicle.id));
            setShowDeleteModal(false);
            setSelectedVehicle(null);
        } catch (err) {
            console.error('Error deleting vehicle:', err);
        } finally {
            setSubmitting(false);
        }
    };

    const closeModals = () => {
        setShowAddModal(false);
        setShowEditModal(false);
        setShowDeleteModal(false);
        setSelectedVehicle(null);
        resetForm();
    };

    // Render form fields - inlined to avoid re-creation
    const renderFormFields = (onSubmit, submitLabel) => (
        <form className={styles.form} onSubmit={onSubmit}>
            {formError && <div className={styles.errorMessage}>{formError}</div>}

            <div className={styles.formGroup}>
                <label className={styles.formLabel}>Vehicle Name *</label>
                <input
                    type="text"
                    name="vehicle_name"
                    value={formData.vehicle_name}
                    onChange={handleInputChange}
                    placeholder="e.g., My Swift, Dad's Car"
                    className={styles.formInput}
                    required
                />
            </div>

            <div className={styles.formRow}>
                <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Vehicle Type *</label>
                    <select
                        name="vehicle_type"
                        value={formData.vehicle_type}
                        onChange={handleInputChange}
                        className={styles.formSelect}
                        required
                    >
                        {VEHICLE_TYPES.map(type => (
                            <option key={type.value} value={type.value}>
                                {type.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Year Vechicle was Manufactured *</label>
                    <input
                        type="number"
                        name="vehicle_year"
                        value={formData.vehicle_year}
                        onChange={handleInputChange}
                        placeholder="e.g., 2020"
                        className={styles.formInput}
                        min="1900"
                        max={new Date().getFullYear() + 1}
                    />
                </div>
            </div>

            <div className={styles.formRow}>
                <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Brand *</label>
                    <input
                        type="text"
                        name="vehicle_brand"
                        value={formData.vehicle_brand}
                        onChange={handleInputChange}
                        placeholder="e.g., Maruti, Honda"
                        className={styles.formInput}
                        required
                    />
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Engine Metric *</label>
                    <input
                        type="text"
                        name="vehicle_model"
                        value={formData.vehicle_model}
                        onChange={handleInputChange}
                        placeholder="e.g., 800cc,1.0L"
                        className={styles.formInput}
                        required
                    />
                </div>
            </div>

            <div className={styles.formGroup}>
                <label className={styles.formLabel}>Registration Number *</label>
                <input
                    type="text"
                    name="registration_no"
                    value={formData.registration_no}
                    onChange={handleInputChange}
                    placeholder="e.g., KL-01-AB-1234"
                    className={styles.formInput}
                    required
                />
            </div>

            <div className={styles.formActions}>
                <button type="button" className={styles.cancelBtn} onClick={closeModals}>
                    Cancel
                </button>
                <button type="submit" className={styles.submitBtn} disabled={submitting}>
                    {submitting ? 'Saving...' : submitLabel}
                </button>
            </div>
        </form>
    );

    return (
        <DashboardLayout title="My Vehicles" role="CUSTOMER" menuItems={menuItems}>
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
                        <span className={styles.pageTagline}>🚗 MY VEHICLES</span>
                        <h1 className={styles.pageTitle}>Manage Your Vehicles</h1>
                        <p className={styles.pageSubtitle}>
                            Add, edit, and manage all your registered vehicles.
                            Book services for any vehicle with just a few clicks.
                        </p>
                    </motion.div>
                </header>

                {/* Action Bar */}
                <div className={styles.actionBar}>
                    <motion.button
                        className={styles.addButton}
                        onClick={() => setShowAddModal(true)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <Plus size={20} />
                        Add Vehicle
                    </motion.button>
                </div>

                {/* Vehicles Section */}
                <section className={styles.vehiclesSection}>
                    {loading ? (
                        <div className={styles.loadingState}>
                            <div className={styles.spinner} />
                            <p>Loading your vehicles...</p>
                        </div>
                    ) : error ? (
                        <div className={styles.errorMessage}>{error}</div>
                    ) : vehicles.length === 0 ? (
                        <motion.div
                            className={styles.emptyState}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <div className={styles.emptyIcon}>
                                <Car size={40} />
                            </div>
                            <h3 className={styles.emptyTitle}>No Vehicles Yet</h3>
                            <p className={styles.emptyText}>
                                Add your first vehicle to start booking services and track maintenance.
                            </p>
                            <motion.button
                                className={styles.addButton}
                                onClick={() => setShowAddModal(true)}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Plus size={20} />
                                Add Your First Vehicle
                            </motion.button>
                        </motion.div>
                    ) : (
                        <motion.div
                            className={styles.vehiclesGrid}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5 }}
                        >
                            {vehicles.map((vehicle, index) => (
                                <motion.div
                                    key={vehicle.id}
                                    className={styles.vehicleCard}
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1, duration: 0.5 }}
                                >
                                    <div className={styles.vehicleHeader}>
                                        <h4 className={styles.vehicleName}>{vehicle.vehicle_name}</h4>
                                        <span className={styles.vehicleTypeBadge}>{vehicle.vehicle_type}</span>
                                    </div>

                                    <div className={styles.vehicleDetails}>
                                        <div className={styles.vehicleInfo}>
                                            <Tag size={16} />
                                            <span>{vehicle.vehicle_brand} {vehicle.vehicle_model}</span>
                                        </div>
                                        {vehicle.vehicle_year && (
                                            <div className={styles.vehicleInfo}>
                                                <Calendar size={16} />
                                                <span>{vehicle.vehicle_year}</span>
                                            </div>
                                        )}
                                        <p className={styles.vehicleNumber}>{vehicle.registration_no}</p>
                                    </div>

                                    {/* Service Booking Buttons */}
                                    <div className={styles.serviceActions}>
                                        <button
                                            className={`${styles.serviceBtn} ${styles.emergencyBtn}`}
                                            onClick={() => navigate('/customer/services')}
                                        >
                                            <AlertTriangle size={18} />
                                            Book Emergency Service
                                        </button>
                                        <button
                                            className={`${styles.serviceBtn} ${styles.regularBtn}`}
                                            onClick={() => navigate('/customer/services')}
                                        >
                                            <Wrench size={18} />
                                            Book Regular Service
                                        </button>
                                    </div>

                                    {/* Edit/Delete Actions */}
                                    <div className={styles.vehicleActions}>
                                        <button
                                            className={styles.actionBtn}
                                            onClick={() => handleEditClick(vehicle)}
                                        >
                                            <Edit3 size={16} />
                                            Edit
                                        </button>
                                        <button
                                            className={`${styles.actionBtn} ${styles.deleteBtn}`}
                                            onClick={() => handleDeleteClick(vehicle)}
                                        >
                                            <Trash2 size={16} />
                                            Delete
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </section>

                {/* Add Vehicle Modal */}
                <AnimatePresence>
                    {showAddModal && (
                        <motion.div
                            className={styles.modalOverlay}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={closeModals}
                        >
                            <motion.div
                                className={styles.modal}
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                onClick={e => e.stopPropagation()}
                            >
                                <div className={styles.modalHeader}>
                                    <h2 className={styles.modalTitle}>Add New Vehicle</h2>
                                    <button className={styles.closeButton} onClick={closeModals}>
                                        <X size={24} />
                                    </button>
                                </div>
                                {renderFormFields(handleAddVehicle, "Add Vehicle")}
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Edit Vehicle Modal */}
                <AnimatePresence>
                    {showEditModal && (
                        <motion.div
                            className={styles.modalOverlay}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={closeModals}
                        >
                            <motion.div
                                className={styles.modal}
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                onClick={e => e.stopPropagation()}
                            >
                                <div className={styles.modalHeader}>
                                    <h2 className={styles.modalTitle}>Edit Vehicle</h2>
                                    <button className={styles.closeButton} onClick={closeModals}>
                                        <X size={24} />
                                    </button>
                                </div>
                                {renderFormFields(handleUpdateVehicle, "Save Changes")}
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Delete Confirmation Modal */}
                <AnimatePresence>
                    {showDeleteModal && selectedVehicle && (
                        <motion.div
                            className={styles.modalOverlay}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={closeModals}
                        >
                            <motion.div
                                className={`${styles.modal} ${styles.confirmModal}`}
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                onClick={e => e.stopPropagation()}
                            >
                                <div className={styles.modalHeader}>
                                    <h2 className={styles.modalTitle}>Delete Vehicle</h2>
                                    <button className={styles.closeButton} onClick={closeModals}>
                                        <X size={24} />
                                    </button>
                                </div>
                                <p className={styles.confirmText}>
                                    Are you sure you want to delete <strong>"{selectedVehicle.vehicle_name}"</strong>?
                                    This action cannot be undone.
                                </p>
                                <div className={styles.confirmActions}>
                                    <button className={styles.cancelBtn} onClick={closeModals}>
                                        Cancel
                                    </button>
                                    <button
                                        className={styles.confirmDeleteBtn}
                                        onClick={handleDeleteVehicle}
                                        disabled={submitting}
                                    >
                                        {submitting ? 'Deleting...' : 'Delete Vehicle'}
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </DashboardLayout>
    );
};

export default MyVehicles;
