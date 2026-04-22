import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Lock, ArrowRight, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { login as loginApi } from '../../services/authService';
import styles from '../../styles/Login.module.css';

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [formData, setFormData] = useState({ username: '', password: '' });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (error) setError(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const response = await loginApi(formData);
            login(response.user, response.profile);
            setSuccess('Login successful! Redirecting...');

            const userRole = response.user.user_role;
            setTimeout(() => {
                if (userRole === 'ADMIN') {
                    navigate('/admin');
                } else if (userRole === 'MECHANIC') {
                    navigate('/mechanic');
                } else {
                    navigate('/customer');
                }
            }, 1000);

        } catch (err) {
            console.error('Login error:', err);
            const errorMessage = err.response?.data?.detail
                || err.response?.data?.non_field_errors?.[0]
                || err.response?.data?.message
                || 'Login failed. Please check your credentials.';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            {/* Background Effects */}
            <div className={styles.backgroundEffects}>
                <div className={`${styles.glowBlob} ${styles.blob1}`} />
                <div className={`${styles.glowBlob} ${styles.blob2}`} />
            </div>

            {/* Login Card */}
            <motion.div
                className={styles.loginCard}
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
                    <h1 className={styles.title}>Welcome Back</h1>
                    <p className={styles.subtitle}>Sign in to access your dashboard</p>
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
                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.inputGroup}>
                        <User className={styles.inputIcon} />
                        <input
                            type="text"
                            name="username"
                            placeholder="Username"
                            value={formData.username}
                            onChange={handleChange}
                            className={styles.input}
                            required
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <Lock className={styles.inputIcon} />
                        <input
                            type="password"
                            name="password"
                            placeholder="Password"
                            value={formData.password}
                            onChange={handleChange}
                            className={styles.input}
                            required
                        />
                    </div>

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
                                Signing In...
                            </>
                        ) : (
                            <>
                                Sign In <ArrowRight size={18} />
                            </>
                        )}
                    </motion.button>
                </form>

                {/* Footer */}
                <div className={styles.footer}>
                    Don't have an account?{' '}
                    <Link to="/register" className={styles.registerLink}>
                        Register now
                    </Link>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
