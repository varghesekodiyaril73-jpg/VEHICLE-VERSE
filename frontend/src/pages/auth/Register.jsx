import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User, Lock, Mail, Phone, MapPin, Building, FileCheck, Rocket,
    AlertCircle, CheckCircle, ArrowLeft, Upload, AlertTriangle, Eye, EyeOff, Award
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { registerCustomer, registerMechanic, registerAdmin } from '../../services/authService';
import styles from '../../styles/Register.module.css';

// ── Validation Helpers ──

const validators = {
    first_name: (v) => {
        if (!v || v.trim().length < 2) return 'First name must be at least 2 characters';
        if (!/^[a-zA-Z\s]+$/.test(v.trim())) return 'First name must contain only letters';
        return '';
    },
    last_name: (v) => {
        if (!v || v.trim().length < 2) return 'Last name must be at least 2 characters';
        if (!/^[a-zA-Z\s]+$/.test(v.trim())) return 'Last name must contain only letters';
        return '';
    },
    username: (v) => {
        if (!v || v.length < 3) return 'Username must be at least 3 characters';
        if (v.length > 30) return 'Username must be at most 30 characters';
        if (!/^[a-zA-Z0-9_]+$/.test(v)) return 'Only letters, numbers, and underscores allowed';
        return '';
    },
    email: (v) => {
        if (!v) return 'Email is required';
        if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(v))
            return 'Please enter a valid email (e.g., user@example.com)';
        return '';
    },
    phone: (v) => {
        if (!v) return '';  // optional but if provided, must be valid
        const cleaned = v.replace(/[\s\-\(\)\+]/g, '');
        if (!/^\d{10}$/.test(cleaned)) return 'Phone number must be exactly 10 digits';
        return '';
    },
    password: (v) => {
        if (!v) return 'Password is required';
        if (v.length < 8) return 'Password must be at least 8 characters';
        if (!/[A-Z]/.test(v)) return 'Password must contain at least one uppercase letter';
        if (!/[a-z]/.test(v)) return 'Password must contain at least one lowercase letter';
        if (!/[0-9]/.test(v)) return 'Password must contain at least one number';
        return '';
    },
    confirm_password: (v, formData) => {
        if (!v) return 'Please confirm your password';
        if (v !== formData.password) return 'Passwords do not match';
        return '';
    },
};

// Auto-capitalize name fields (Title Case)
const capitalizeWords = (str) => {
    return str.replace(/\b\w/g, (c) => c.toUpperCase());
};

// Password strength calculator
const getPasswordStrength = (password) => {
    if (!password) return { level: 0, label: '', color: '' };
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 2) return { level: 1, label: 'Weak', color: '#ef4444' };
    if (score <= 3) return { level: 2, label: 'Fair', color: '#f59e0b' };
    if (score <= 4) return { level: 3, label: 'Good', color: '#3b82f6' };
    return { level: 4, label: 'Strong', color: '#10b981' };
};

const Register = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [role, setRole] = useState('CUSTOMER');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirm_password: '',
        first_name: '',
        last_name: '',
        phone: '',
        photo: null,
        state: '',
        district: '',
        place: '',
        address_line: '',
        proof: null,
        min_service_fee: '',
        min_breakdown_fee: '',
        notes: '',
        manufacturer_partner: '',
        service_centre_place: '',
        service_centre_state: '',
    });

    // Track which fields have been touched (for showing errors only after interaction)
    const [touched, setTouched] = useState({});
    const [fieldErrors, setFieldErrors] = useState({});

    // Validate a single field
    const validateField = useCallback((name, value) => {
        const validator = validators[name];
        if (validator) {
            return validator(value, formData);
        }
        return '';
    }, [formData]);

    // Handle field blur - mark as touched and validate
    const handleBlur = (e) => {
        const { name, value } = e.target;
        setTouched(prev => ({ ...prev, [name]: true }));
        const error = validateField(name, value);
        setFieldErrors(prev => ({ ...prev, [name]: error }));
    };

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        let newValue = value;

        if (files) {
            setFormData({ ...formData, [name]: files[0] });
            return;
        }

        // Auto-capitalize name fields
        if (name === 'first_name' || name === 'last_name') {
            newValue = capitalizeWords(value);
        }

        // Phone: only allow digits, limit to 10
        if (name === 'phone') {
            newValue = value.replace(/[^\d]/g, '').slice(0, 10);
        }

        setFormData({ ...formData, [name]: newValue });
        if (error) setError(null);

        // Live validation for touched fields
        if (touched[name]) {
            const fieldError = validateField(name, newValue);
            setFieldErrors(prev => ({ ...prev, [name]: fieldError }));
        }

        // Re-validate confirm_password when password changes
        if (name === 'password' && touched.confirm_password) {
            const confirmError = validators.confirm_password(formData.confirm_password, { ...formData, password: newValue });
            setFieldErrors(prev => ({ ...prev, confirm_password: confirmError }));
        }
    };

    // Validate all fields before submit
    const validateAll = () => {
        const errors = {};
        const requiredFields = ['first_name', 'last_name', 'username', 'email', 'password', 'confirm_password'];

        requiredFields.forEach(field => {
            const err = validateField(field, formData[field]);
            if (err) errors[field] = err;
        });

        // Phone is optional but validate if provided
        if (formData.phone) {
            const phoneErr = validateField('phone', formData.phone);
            if (phoneErr) errors.phone = phoneErr;
        }

        // Mechanic-specific
        if (role === 'MECHANIC' && !formData.proof) {
            errors.proof = 'Proof document is required for mechanic registration';
        }

        setFieldErrors(errors);
        // Mark all fields as touched
        const allTouched = {};
        requiredFields.forEach(f => allTouched[f] = true);
        if (formData.phone) allTouched.phone = true;
        setTouched(prev => ({ ...prev, ...allTouched }));

        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateAll()) {
            setError('Please fix the errors below before submitting.');
            return;
        }

        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            let response;
            if (role === 'CUSTOMER') {
                response = await registerCustomer(formData);
            } else if (role === 'MECHANIC') {
                // Build clean payload: remove the internal helper key
                const { manufacturer_partner_other, ...mechanicData } = formData;
                response = await registerMechanic(mechanicData);
            } else if (role === 'ADMIN') {
                response = await registerAdmin(formData);
            }

            login(response.user, response.profile);
            setSuccess(response.message);

            setTimeout(() => {
                if (role === 'MECHANIC') {
                    navigate('/login');
                } else if (role === 'ADMIN') {
                    navigate('/admin');
                } else {
                    navigate('/customer');
                }
            }, 1500);

        } catch (err) {
            console.error('Registration error:', err);
            const errorMessage = err.response?.data?.detail
                || err.response?.data?.message
                || Object.values(err.response?.data || {}).flat().join(', ')
                || 'Registration failed. Please try again.';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const roles = [
        { id: 'CUSTOMER', label: 'Customer', icon: User },
        { id: 'MECHANIC', label: 'Mechanic', icon: FileCheck },
        // { id: 'ADMIN', label: 'Admin', icon: Building },
    ];

    const passwordStrength = getPasswordStrength(formData.password);

    // Helper to render field error
    const FieldError = ({ name }) => {
        if (!touched[name] || !fieldErrors[name]) return null;
        return (
            <motion.span
                className={styles.fieldError}
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <AlertCircle size={12} />
                {fieldErrors[name]}
            </motion.span>
        );
    };

    // Helper to get input class based on validation state
    const getInputClass = (name) => {
        if (!touched[name]) return styles.input;
        if (fieldErrors[name]) return `${styles.input} ${styles.inputError}`;
        return `${styles.input} ${styles.inputValid}`;
    };

    return (
        <div className={styles.container}>
            {/* Background Effects */}
            <div className={styles.backgroundEffects}>
                <div className={`${styles.glowBlob} ${styles.blob1}`} />
                <div className={`${styles.glowBlob} ${styles.blob2}`} />
            </div>

            {/* Register Card */}
            <motion.div
                className={styles.registerCard}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                {/* Back Link */}
                <Link to="/" className={styles.backLink}>
                    <ArrowLeft size={16} />
                    Back to Home
                </Link>

                {/* Brand */}
                <Link to="/" className={styles.brandLink}>
                    <span className={styles.brand}>VehicleVerse</span>
                </Link>

                {/* Header */}
                <div className={styles.header}>
                    <h1 className={styles.title}>Create Account</h1>
                    <p className={styles.subtitle}>Join VehicleVerse today</p>
                </div>

                {/* Role Selection */}
                <div className={styles.roleSelector}>
                    {roles.map((r) => (
                        <button
                            key={r.id}
                            type="button"
                            onClick={() => setRole(r.id)}
                            className={`${styles.roleBtn} ${role === r.id ? styles.roleBtnActive : ''}`}
                        >
                            <r.icon size={16} />
                            {r.label}
                        </button>
                    ))}
                </div>

                {/* Error Message */}
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`${styles.message} ${styles.errorMessage}`}
                    >
                        <AlertCircle size={18} />
                        <span>{error}</span>
                    </motion.div>
                )}

                {/* Success Message */}
                {success && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`${styles.message} ${styles.successMessage}`}
                    >
                        <CheckCircle size={18} />
                        <span>{success}</span>
                    </motion.div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className={styles.form} noValidate>
                    {/* Name Row */}
                    <div className={styles.row}>
                        <div className={styles.inputGroup}>
                            <User className={styles.inputIcon} />
                            <input
                                type="text"
                                name="first_name"
                                placeholder="First Name"
                                value={formData.first_name}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className={getInputClass('first_name')}
                                required
                            />
                            <FieldError name="first_name" />
                        </div>
                        <div className={styles.inputGroup}>
                            <User className={styles.inputIcon} />
                            <input
                                type="text"
                                name="last_name"
                                placeholder="Last Name"
                                value={formData.last_name}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className={getInputClass('last_name')}
                                required
                            />
                            <FieldError name="last_name" />
                        </div>
                    </div>

                    {/* Username */}
                    <div className={styles.inputGroup}>
                        <User className={styles.inputIcon} />
                        <input
                            type="text"
                            name="username"
                            placeholder="Username (min 3 characters)"
                            value={formData.username}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={getInputClass('username')}
                            required
                        />
                        <FieldError name="username" />
                    </div>

                    {/* Email */}
                    <div className={styles.inputGroup}>
                        <Mail className={styles.inputIcon} />
                        <input
                            type="email"
                            name="email"
                            placeholder="Email Address (e.g., user@example.com)"
                            value={formData.email}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={getInputClass('email')}
                            required
                        />
                        <FieldError name="email" />
                    </div>

                    {/* Phone */}
                    <div className={styles.inputGroup}>
                        <Phone className={styles.inputIcon} />
                        <input
                            type="tel"
                            name="phone"
                            placeholder="Phone Number (10 digits)"
                            value={formData.phone}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={getInputClass('phone')}
                            maxLength={10}
                        />
                        {formData.phone && (
                            <span className={styles.charCount}>
                                {formData.phone.length}/10
                            </span>
                        )}
                        <FieldError name="phone" />
                    </div>

                    {/* Password Row */}
                    <div className={styles.row}>
                        <div className={styles.inputGroup}>
                            <Lock className={styles.inputIcon} />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                placeholder="Password (min 8 chars)"
                                value={formData.password}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className={getInputClass('password')}
                                required
                            />
                            <button
                                type="button"
                                className={styles.passwordToggle}
                                onClick={() => setShowPassword(!showPassword)}
                                tabIndex={-1}
                            >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                            <FieldError name="password" />
                        </div>
                        <div className={styles.inputGroup}>
                            <Lock className={styles.inputIcon} />
                            <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                name="confirm_password"
                                placeholder="Confirm Password"
                                value={formData.confirm_password}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className={getInputClass('confirm_password')}
                                required
                            />
                            <button
                                type="button"
                                className={styles.passwordToggle}
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                tabIndex={-1}
                            >
                                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                            <FieldError name="confirm_password" />
                        </div>
                    </div>

                    {/* Password Strength Bar */}
                    {formData.password && (
                        <div className={styles.strengthBar}>
                            <div className={styles.strengthTrack}>
                                {[1, 2, 3, 4].map((level) => (
                                    <div
                                        key={level}
                                        className={styles.strengthSegment}
                                        style={{
                                            backgroundColor: level <= passwordStrength.level
                                                ? passwordStrength.color
                                                : 'rgba(255,255,255,0.1)'
                                        }}
                                    />
                                ))}
                            </div>
                            <span
                                className={styles.strengthLabel}
                                style={{ color: passwordStrength.color }}
                            >
                                {passwordStrength.label}
                            </span>
                        </div>
                    )}

                    {/* Address Section */}
                    <div className={styles.section}>
                        <h3 className={styles.sectionTitle}>Address Details</h3>
                        <div className={styles.row3}>
                            <div className={styles.inputGroup}>
                                <MapPin className={styles.inputIcon} />
                                <input
                                    type="text"
                                    name="state"
                                    placeholder="State"
                                    value={formData.state}
                                    onChange={handleChange}
                                    className={styles.input}
                                />
                            </div>
                            <div className={styles.inputGroup}>
                                <MapPin className={styles.inputIcon} />
                                <input
                                    type="text"
                                    name="district"
                                    placeholder="District"
                                    value={formData.district}
                                    onChange={handleChange}
                                    className={styles.input}
                                />
                            </div>
                            <div className={styles.inputGroup}>
                                <MapPin className={styles.inputIcon} />
                                <input
                                    type="text"
                                    name="place"
                                    placeholder="Place/City"
                                    value={formData.place}
                                    onChange={handleChange}
                                    className={styles.input}
                                />
                            </div>
                        </div>
                        <div className={styles.inputGroup}>
                            <MapPin className={styles.inputIcon} />
                            <input
                                type="text"
                                name="address_line"
                                placeholder="Full Address"
                                value={formData.address_line}
                                onChange={handleChange}
                                className={styles.input}
                            />
                        </div>
                    </div>

                    {/* Photo Upload */}
                    <div className={styles.fileUpload}>
                        <label className={styles.fileUploadLabel}>
                            <Upload size={24} className={styles.fileUploadIcon} />
                            <span className={styles.fileUploadText}>Profile Photo</span>
                            <span className={styles.fileUploadHint}>JPG, PNG (optional)</span>
                            <input
                                type="file"
                                name="photo"
                                accept="image/*"
                                onChange={handleChange}
                                className={styles.fileInput}
                            />
                            {formData.photo && (
                                <span className={styles.fileUploadName}>{formData.photo.name}</span>
                            )}
                        </label>
                    </div>

                    {/* Mechanic Specific Fields */}
                    {role === 'MECHANIC' && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className={styles.section}
                        >
                            <h3 className={`${styles.sectionTitle} ${styles.sectionTitleMechanic}`}>
                                Mechanic Details
                            </h3>

                            <div className={styles.fileUpload}>
                                <label className={styles.fileUploadLabel}>
                                    <Upload size={24} className={styles.fileUploadIcon} />
                                    <span className={styles.fileUploadText}>Proof Document (Required)</span>
                                    <span className={styles.fileUploadHint}>ID proof or certification</span>
                                    <input
                                        type="file"
                                        name="proof"
                                        accept="image/*,.pdf"
                                        onChange={handleChange}
                                        className={styles.fileInput}
                                        required
                                    />
                                    {formData.proof && (
                                        <span className={styles.fileUploadName}>{formData.proof.name}</span>
                                    )}
                                </label>
                            </div>

                            <div className={styles.row}>
                                <div className={styles.inputGroup}>
                                    <input
                                        type="number"
                                        name="min_service_fee"
                                        placeholder="Min Service Fee (₹)"
                                        value={formData.min_service_fee}
                                        onChange={handleChange}
                                        className={styles.input}
                                        style={{ paddingLeft: '1rem' }}
                                        min="0"
                                    />
                                </div>
                                <div className={styles.inputGroup}>
                                    <input
                                        type="number"
                                        name="min_breakdown_fee"
                                        placeholder="Min Breakdown Fee (₹)"
                                        value={formData.min_breakdown_fee}
                                        onChange={handleChange}
                                        className={styles.input}
                                        style={{ paddingLeft: '1rem' }}
                                        min="0"
                                    />
                                </div>
                            </div>

                            {/* Official Manufacturer Service Centre Partner */}
                            <div className={styles.inputGroup} style={{ marginTop: '0.5rem' }}>
                                <Award className={styles.inputIcon} />
                                <select
                                    name="manufacturer_partner"
                                    value={formData.manufacturer_partner}
                                    onChange={handleChange}
                                    className={styles.select}
                                >
                                    <option value="">Official Manufacturer Service Centre Partner — None</option>
                                    <option value="Toyota">Toyota</option>
                                    <option value="Ford">Ford</option>
                                    <option value="Honda">Honda</option>
                                    <option value="Hyundai">Hyundai</option>
                                    <option value="Maruti Suzuki">Maruti Suzuki</option>
                                    <option value="Tata">Tata</option>
                                    <option value="Mahindra">Mahindra</option>
                                    <option value="Kia">Kia</option>
                                    <option value="Volkswagen">Volkswagen</option>
                                    <option value="BMW">BMW</option>
                                    <option value="Mercedes-Benz">Mercedes-Benz</option>
                                    <option value="Audi">Audi</option>
                                    <option value="Renault">Renault</option>
                                    <option value="Skoda">Skoda</option>
                                    <option value="MG">MG</option>
                                    <option value="Other">Other (type below)</option>
                                </select>
                            </div>

                            {/* If 'Other' is selected, show a free-text input */}
                            <AnimatePresence>
                                {formData.manufacturer_partner === 'Other' && (
                                    <motion.div
                                        key="other-brand"
                                        className={styles.inputGroup}
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.25 }}
                                    >
                                        <Award className={styles.inputIcon} />
                                        <input
                                            type="text"
                                            name="manufacturer_partner_other"
                                            placeholder="Enter manufacturer name (e.g., Nissan)"
                                            value={formData.manufacturer_partner_other || ''}
                                            onChange={(e) => setFormData(prev => ({ ...prev, manufacturer_partner_other: e.target.value, manufacturer_partner: e.target.value || 'Other' }))}
                                            className={styles.input}
                                        />
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Service Centre Location — shown when any manufacturer is selected */}
                            <AnimatePresence>
                                {formData.manufacturer_partner !== '' && formData.manufacturer_partner !== 'Other' && (
                                    <motion.div
                                        key="service-centre-location"
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.55)', marginBottom: '0.5rem', marginTop: '0.25rem' }}>
                                            Authorised service centre location for <strong style={{ color: '#a78bfa' }}>{formData.manufacturer_partner}</strong>
                                        </p>
                                        <div className={styles.row}>
                                            <div className={styles.inputGroup}>
                                                <MapPin className={styles.inputIcon} />
                                                <input
                                                    type="text"
                                                    name="service_centre_place"
                                                    placeholder="Service Centre Place/City"
                                                    value={formData.service_centre_place}
                                                    onChange={handleChange}
                                                    className={styles.input}
                                                />
                                            </div>
                                            <div className={styles.inputGroup}>
                                                <MapPin className={styles.inputIcon} />
                                                <input
                                                    type="text"
                                                    name="service_centre_state"
                                                    placeholder="Service Centre State"
                                                    value={formData.service_centre_state}
                                                    onChange={handleChange}
                                                    className={styles.input}
                                                />
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Service Centre Location for 'Other' manufacturer */}
                            <AnimatePresence>
                                {formData.manufacturer_partner === 'Other' && formData.manufacturer_partner_other && (
                                    <motion.div
                                        key="service-centre-location-other"
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.55)', marginBottom: '0.5rem', marginTop: '0.25rem' }}>
                                            Authorised service centre location for <strong style={{ color: '#a78bfa' }}>{formData.manufacturer_partner_other}</strong>
                                        </p>
                                        <div className={styles.row}>
                                            <div className={styles.inputGroup}>
                                                <MapPin className={styles.inputIcon} />
                                                <input
                                                    type="text"
                                                    name="service_centre_place"
                                                    placeholder="Service Centre Place/City"
                                                    value={formData.service_centre_place}
                                                    onChange={handleChange}
                                                    className={styles.input}
                                                />
                                            </div>
                                            <div className={styles.inputGroup}>
                                                <MapPin className={styles.inputIcon} />
                                                <input
                                                    type="text"
                                                    name="service_centre_state"
                                                    placeholder="Service Centre State"
                                                    value={formData.service_centre_state}
                                                    onChange={handleChange}
                                                    className={styles.input}
                                                />
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className={styles.warningBox}>
                                <AlertTriangle size={18} />
                                Your account will be pending approval until an admin verifies your documents.
                            </div>
                        </motion.div>
                    )}

                    {/* Admin Specific Fields */}
                    {role === 'ADMIN' && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className={styles.section}
                        >
                            <h3 className={`${styles.sectionTitle} ${styles.sectionTitleAdmin}`}>
                                Admin Notes
                            </h3>
                            <textarea
                                name="notes"
                                placeholder="Additional notes (optional)"
                                value={formData.notes}
                                onChange={handleChange}
                                className={styles.textarea}
                            />
                        </motion.div>
                    )}

                    {/* Submit Button */}
                    <motion.button
                        type="submit"
                        className={styles.submitBtn}
                        disabled={loading}
                        whileHover={{ scale: loading ? 1 : 1.02 }}
                        whileTap={{ scale: loading ? 1 : 0.98 }}
                    >
                        {loading ? (
                            <>
                                <span className={styles.spinner}></span>
                                Creating Account...
                            </>
                        ) : (
                            <>
                                Create {role.charAt(0) + role.slice(1).toLowerCase()} Account
                                <Rocket size={18} />
                            </>
                        )}
                    </motion.button>
                </form>

                {/* Footer */}
                <div className={styles.footer}>
                    Already have an account?{' '}
                    <Link to="/login" className={styles.loginLink}>
                        Sign in
                    </Link>
                </div>
            </motion.div>
        </div>
    );
};

export default Register;
