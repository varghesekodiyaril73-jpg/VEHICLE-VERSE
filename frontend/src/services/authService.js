import api from './api';

/**
 * Authentication Service
 * Handles all auth-related API calls
 */

// Helper to create FormData from object
const createFormData = (data) => {
    const formData = new FormData();

    Object.keys(data).forEach(key => {
        if (data[key] !== null && data[key] !== undefined) {
            formData.append(key, data[key]);
        }
    });

    return formData;
};

// Store auth data in localStorage
const storeAuthData = (response) => {
    const { tokens, user } = response.data;

    if (tokens) {
        localStorage.setItem('access_token', tokens.access);
        localStorage.setItem('refresh_token', tokens.refresh);
    }

    if (user) {
        localStorage.setItem('user', JSON.stringify(user));
    }

    return response.data;
};

/**
 * Register a new customer
 */
export const registerCustomer = async (data) => {
    const formData = createFormData(data);
    const response = await api.post('/accounts/register/customer/', formData);
    return storeAuthData(response);
};

/**
 * Register a new mechanic
 */
export const registerMechanic = async (data) => {
    const formData = createFormData(data);
    const response = await api.post('/accounts/register/mechanic/', formData);
    return storeAuthData(response);
};

/**
 * Register a new admin
 */
export const registerAdmin = async (data) => {
    const formData = createFormData(data);
    const response = await api.post('/accounts/register/admin/', formData);
    return storeAuthData(response);
};

/**
 * Login user
 */
export const login = async (credentials) => {
    const response = await api.post('/accounts/login/', credentials);
    return storeAuthData(response);
};

/**
 * Logout user
 */
export const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
};

/**
 * Get current user profile
 */
export const getCurrentUser = async () => {
    const response = await api.get('/accounts/profile/');
    return response.data;
};

/**
 * Update user profile
 */
export const updateProfile = async (data) => {
    const formData = createFormData(data);
    const response = await api.patch('/accounts/profile/', formData);

    // Update stored user data
    const user = response.data;
    localStorage.setItem('user', JSON.stringify(user));

    return user;
};

/**
 * Get mechanics list (admin only)
 */
export const getMechanics = async (status = null) => {
    const params = status ? { status } : {};
    const response = await api.get('/accounts/mechanics/', { params });
    return response.data;
};

/**
 * Get mechanic details (admin only)
 */
export const getMechanicDetail = async (id) => {
    const response = await api.get(`/accounts/mechanics/${id}/`);
    return response.data;
};

/**
 * Approve or reject mechanic (admin only)
 */
export const updateMechanicStatus = async (id, approvalStatus) => {
    const response = await api.patch(`/accounts/mechanics/${id}/approve/`, {
        approval_status: approvalStatus
    });
    return response.data;
};

/**
 * Get all users (admin only)
 */
export const getUsers = async (role = null) => {
    const params = role ? { role } : {};
    const response = await api.get('/accounts/users/', { params });
    return response.data;
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = () => {
    return !!localStorage.getItem('access_token');
};

/**
 * Get stored user
 */
export const getStoredUser = () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
};

/**
 * Get complaints list (admin only)
 */
export const getComplaints = async (status = null, complaintType = null) => {
    const params = {};
    if (status) params.status = status;
    if (complaintType) params.complaint_type = complaintType;
    const response = await api.get('/bookings/admin/complaints/', { params });
    return response.data;
};

/**
 * Update complaint status (admin only)
 */
export const updateComplaint = async (complaintId, data) => {
    const response = await api.patch(`/bookings/admin/complaints/${complaintId}/`, data);
    return response.data;
};

export default {
    registerCustomer,
    registerMechanic,
    registerAdmin,
    login,
    logout,
    getCurrentUser,
    updateProfile,
    getMechanics,
    getMechanicDetail,
    updateMechanicStatus,
    getUsers,
    isAuthenticated,
    getStoredUser,
    getComplaints,
    updateComplaint,
};
