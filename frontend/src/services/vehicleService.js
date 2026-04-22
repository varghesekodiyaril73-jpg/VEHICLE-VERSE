import api from './api';

/**
 * Vehicle Service - API calls for customer vehicles
 */

// Get all vehicles for authenticated user
export const getVehicles = async () => {
    const response = await api.get('/vehicles/');
    return response.data;
};

// Get a single vehicle by ID
export const getVehicle = async (id) => {
    const response = await api.get(`/vehicles/${id}/`);
    return response.data;
};

// Create a new vehicle
export const createVehicle = async (vehicleData) => {
    const response = await api.post('/vehicles/', vehicleData);
    return response.data;
};

// Update an existing vehicle
export const updateVehicle = async (id, vehicleData) => {
    const response = await api.patch(`/vehicles/${id}/`, vehicleData);
    return response.data;
};

// Delete a vehicle
export const deleteVehicle = async (id) => {
    const response = await api.delete(`/vehicles/${id}/`);
    return response.data;
};

export default {
    getVehicles,
    getVehicle,
    createVehicle,
    updateVehicle,
    deleteVehicle
};
