import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUser, logout as logoutService, isAuthenticated, getStoredUser } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Check auth status on mount
    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        setLoading(true);
        try {
            if (isAuthenticated()) {
                // First try to get user from storage
                const storedUser = getStoredUser();
                if (storedUser) {
                    setUser(storedUser);
                }

                // Then fetch fresh data from API
                const data = await getCurrentUser();
                setUser(data.user);
                setProfile(data.profile);
            }
        } catch (err) {
            console.error('Auth check failed:', err);
            // If auth check fails, clear everything
            logoutService();
            setUser(null);
            setProfile(null);
        } finally {
            setLoading(false);
        }
    };

    const login = (userData, profileData = null) => {
        setUser(userData);
        setProfile(profileData);
    };

    const logout = () => {
        logoutService();
        setUser(null);
        setProfile(null);
    };

    const updateUser = (userData) => {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
    };

    const value = {
        user,
        profile,
        loading,
        error,
        isAuthenticated: !!user,
        login,
        logout,
        updateUser,
        checkAuth,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;
