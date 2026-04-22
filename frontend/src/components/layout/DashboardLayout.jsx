import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LogOut, Menu, X, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const DashboardLayout = ({ title, role, menuItems, children }) => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleProfileClick = () => {
        // Navigate based on role
        if (role === 'CUSTOMER') {
            navigate('/customer/profile');
        } else if (role === 'MECHANIC') {
            navigate('/mechanic/profile');
        } else if (role === 'ADMIN') {
            navigate('/admin/profile');
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            width: '100%',
            position: 'relative',
            backgroundColor: '#030712',
            color: 'white',
            fontFamily: "'Inter', sans-serif"
        }}>
            {/* Navbar - Matches Landing page exactly */}
            <motion.nav
                style={{
                    position: 'fixed',
                    top: '1.5rem',
                    left: 0,
                    right: 0,
                    margin: '0 auto',
                    width: '90%',
                    maxWidth: '1000px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.8rem 1.5rem',
                    zIndex: 50,
                    gap: '1rem',
                    boxSizing: 'border-box',
                    background: 'rgba(255, 255, 255, 0.03)',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '100px',
                    boxShadow: '0 4px 30px rgba(0, 0, 0, 0.5)'
                }}
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
            >
                {/* Brand */}
                <Link to="/" style={{
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    background: 'linear-gradient(135deg, #2dd4bf 0%, #3b82f6 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    letterSpacing: '-0.02em',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                    textDecoration: 'none'
                }}>
                    VehicleVerse
                </Link>

                {/* Nav Links - Desktop */}
                <div style={{
                    display: 'flex',
                    gap: '1.5rem',
                    alignItems: 'center'
                }} className="hidden md:flex">
                    {menuItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            style={{
                                color: location.pathname === item.path ? '#2dd4bf' : '#9ca3af',
                                fontSize: '0.9rem',
                                fontWeight: 500,
                                transition: 'all 0.3s ease',
                                whiteSpace: 'nowrap',
                                textDecoration: 'none'
                            }}
                        >
                            {item.label}
                        </Link>
                    ))}
                </div>

                {/* User & Actions */}
                <div style={{
                    display: 'flex',
                    gap: '0.75rem',
                    alignItems: 'center',
                    flexShrink: 0
                }}>
                    {/* User Profile - Desktop */}
                    <motion.button
                        onClick={handleProfileClick}
                        className="hidden md:flex"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            padding: '0.4rem 0.75rem',
                            borderRadius: '50px',
                            color: '#9ca3af',
                            fontSize: '0.9rem',
                            fontWeight: 500,
                            cursor: 'pointer',
                            transition: 'all 0.3s ease'
                        }}
                        whileHover={{
                            scale: 1.02,
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            borderColor: 'rgba(45, 212, 191, 0.3)'
                        }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <User size={18} style={{ color: '#2dd4bf' }} />
                        <span>{user?.first_name || user?.username || 'User'}</span>
                    </motion.button>

                    {/* Logout Button */}
                    <motion.button
                        onClick={handleLogout}
                        style={{
                            background: 'linear-gradient(135deg, rgba(45, 212, 191, 0.2), rgba(59, 130, 246, 0.2))',
                            border: '1px solid rgba(45, 212, 191, 0.3)',
                            color: '#2dd4bf',
                            padding: '0.5rem 1.25rem',
                            borderRadius: '50px',
                            fontWeight: 600,
                            fontSize: '0.9rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            transition: 'all 0.3s ease'
                        }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <LogOut size={16} />
                        <span className="hidden sm:inline">Logout</span>
                    </motion.button>

                    {/* Mobile Menu Toggle */}
                    <button
                        className="md:hidden"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: '#9ca3af',
                            cursor: 'pointer',
                            padding: '0.5rem'
                        }}
                    >
                        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </motion.nav>

            {/* Mobile Menu Dropdown */}
            {mobileMenuOpen && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                        position: 'fixed',
                        top: '5rem',
                        left: '5%',
                        right: '5%',
                        background: 'rgba(17, 24, 39, 0.95)',
                        backdropFilter: 'blur(16px)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '20px',
                        padding: '1rem',
                        zIndex: 49
                    }}
                    className="md:hidden"
                >
                    {menuItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => setMobileMenuOpen(false)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                padding: '0.75rem 1rem',
                                color: location.pathname === item.path ? '#2dd4bf' : '#9ca3af',
                                textDecoration: 'none',
                                borderRadius: '12px',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            <item.icon size={20} />
                            {item.label}
                        </Link>
                    ))}
                </motion.div>
            )}

            {/* Main Content */}
            <main style={{
                paddingTop: '7rem',
                minHeight: '100vh'
            }}>
                {children}
            </main>
        </div>
    );
};

export default DashboardLayout;
