import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Home, BarChart2, Wrench, Users, User, LogOut, MessageSquare
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import styles from '../../styles/AdminLayout.module.css';

const AdminLayout = ({ children }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { logout } = useAuth();

    const isActive = (path) => {
        if (path === '/admin' && location.pathname === '/admin') return true;
        if (path !== '/admin' && location.pathname.startsWith(path)) return true;
        return false;
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Navigation items (Settings removed)
    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/admin' },
        { id: 'analytics', label: 'Analytics', icon: BarChart2, path: '/admin/analytics' },
        { id: 'mechanics', label: 'Mechanics', icon: Wrench, path: '/admin/mechanics' },
        { id: 'complaints', label: 'Complaints', icon: MessageSquare, path: '/admin/complaints' },
        { id: 'customers', label: 'Customers', icon: Users, path: '/admin/customers' },
        { id: 'profile', label: 'Profile', icon: User, path: '/admin/profile' },
    ];

    return (
        <div className={styles.adminContainer}>
            {/* Background Gradient */}
            <div className={styles.backgroundGradient} />

            {/* Sidebar */}
            <motion.aside
                className={styles.sidebar}
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                <div className={styles.sidebarBrand}>
                    <h1 className={styles.brandName}>VehicleVerse</h1>
                </div>

                <nav className={styles.sidebarNav}>
                    {navItems.map((item, index) => {
                        const active = isActive(item.path);
                        return (
                            <motion.div
                                key={item.id}
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.1 + index * 0.05 }}
                            >
                                <Link
                                    to={item.path}
                                    className={`${styles.navItem} ${active ? styles.navItemActive : ''}`}
                                >
                                    <span className={styles.navIcon}>
                                        <item.icon size={20} />
                                    </span>
                                    <span>{item.label}</span>
                                </Link>
                            </motion.div>
                        );
                    })}

                    {/* Logout — directly below Profile in the nav */}
                    <motion.div
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.1 + navItems.length * 0.05 }}
                    >
                        <div className={styles.navDivider} />
                        <button className={styles.logoutNavBtn} onClick={handleLogout}>
                            <span className={styles.navIcon}><LogOut size={20} /></span>
                            <span>Log Out</span>
                        </button>
                    </motion.div>
                </nav>
            </motion.aside>

            {/* Main Content */}
            <main className={styles.mainContent}>
                {children}
            </main>
        </div>
    );
};

export default AdminLayout;
