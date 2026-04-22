import api from './api';

/**
 * Mechanic Service - API calls for mechanic-related features
 */

/**
 * Get list of approved mechanics (for customers)
 * @param {boolean} activeOnly - If true, only return available mechanics
 */
export const getPublicMechanics = async (activeOnly = true) => {
    const response = await api.get('/accounts/mechanics/public/', {
        params: { active_only: activeOnly }
    });
    return response.data;
};

/**
 * Update mechanic availability status (for mechanics)
 * @param {boolean} isAvailable - New availability status
 */
export const updateAvailability = async (isAvailable) => {
    const response = await api.patch('/accounts/mechanics/availability/', {
        is_available: isAvailable
    });
    return response.data;
};

/**
 * Get current mechanic's profile including availability
 */
export const getMechanicProfile = async () => {
    const response = await api.get('/accounts/profile/');
    return response.data;
};

/**
 * Get a specific mechanic's public profile with reviews
 * @param {number} mechanicId - ID of the mechanic profile to fetch
 */
export const getMechanicDetails = async (mechanicId) => {
    const response = await api.get(`/accounts/mechanics/public/${mechanicId}/`);
    return response.data;
};

export default {
    getPublicMechanics,
    updateAvailability,
    getMechanicProfile,
    getMechanicDetails
};
