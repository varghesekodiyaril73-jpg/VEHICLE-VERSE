import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    const { user, loading, isAuthenticated } = useAuth();
    const location = useLocation();

    // Show loading state while checking auth
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-400">Loading...</p>
                </div>
            </div>
        );
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Check role-based access
    if (allowedRoles.length > 0 && !allowedRoles.includes(user?.user_role)) {
        // Redirect to appropriate dashboard based on role
        const roleRedirects = {
            'ADMIN': '/admin',
            'MECHANIC': '/mechanic',
            'CUSTOMER': '/customer',
        };

        const redirectPath = roleRedirects[user?.user_role] || '/';
        return <Navigate to={redirectPath} replace />;
    }

    return children;
};

export default ProtectedRoute;
