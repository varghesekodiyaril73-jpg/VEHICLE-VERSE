import api from './api';

/**
 * Booking Service
 * Handles all booking-related API calls
 */

/**
 * Create an emergency/breakdown booking
 * @param {Object} data - { vehicle_id, district, place, service_details, payment_amount }
 */
export const createEmergencyBooking = async (data) => {
    const response = await api.post('/bookings/emergency/', data);
    return response.data;
};

/**
 * Create a regular/scheduled service booking
 * @param {Object} data - { vehicle_id, district, place, service_category, service_details, scheduled_date, scheduled_time }
 */
export const createRegularBooking = async (data) => {
    const response = await api.post('/bookings/regular/', data);
    return response.data;
};

/**
 * Get customer's bookings
 */
export const getCustomerBookings = async () => {
    const response = await api.get('/bookings/');
    return response.data;
};

/**
 * Get pending notifications for customer
 */
export const getNotifications = async () => {
    const response = await api.get('/bookings/notifications/');
    return response.data;
};

/**
 * Get available emergency jobs (for mechanics)
 */
export const getAvailableEmergencyJobs = async () => {
    const response = await api.get('/bookings/jobs/emergency/');
    return response.data;
};

/**
 * Get available regular jobs (for mechanics)
 */
export const getAvailableRegularJobs = async () => {
    const response = await api.get('/bookings/jobs/regular/');
    return response.data;
};

/**
 * Get mechanic's active jobs
 */
export const getMechanicJobs = async () => {
    const response = await api.get('/bookings/my-jobs/');
    return response.data;
};

/**
 * Get all mechanic's jobs (including completed)
 */
export const getMechanicAllJobs = async () => {
    const response = await api.get('/bookings/my-jobs/all/');
    return response.data;
};

/**
 * Accept a job (for mechanics)
 * @param {number} bookingId 
 */
export const acceptJob = async (bookingId) => {
    const response = await api.post(`/bookings/${bookingId}/accept/`);
    return response.data;
};

/**
 * Process payment for a booking
 * @param {number} bookingId 
 * @param {Object} paymentData - { amount, payment_method, card_number?, upi_id? }
 */
export const processPayment = async (bookingId, paymentData) => {
    const response = await api.post(`/bookings/${bookingId}/pay/`, paymentData);
    return response.data;
};

/**
 * Complete a job (for mechanics)
 * @param {number} bookingId 
 * @param {Object} data - { final_amount, work_notes? }
 */
export const completeJob = async (bookingId, data) => {
    const response = await api.post(`/bookings/${bookingId}/complete/`, data);
    return response.data;
};

/**
 * Cancel a job by mechanic (relists the job)
 * @param {number} bookingId 
 * @param {Object} data - { cancellation_reason }
 */
export const cancelJobByMechanic = async (bookingId, data) => {
    const response = await api.post(`/bookings/${bookingId}/mechanic-cancel/`, data);
    return response.data;
};

/**
 * Cancel a booking by customer (regular service only)
 * @param {number} bookingId 
 * @param {Object} data - { cancellation_reason }
 */
export const cancelBookingByCustomer = async (bookingId, data) => {
    const response = await api.post(`/bookings/${bookingId}/customer-cancel/`, data);
    return response.data;
};

/**
 * Create a review for a completed booking
 * @param {number} bookingId 
 * @param {Object} data - { rating, review_text? }
 */
export const createReview = async (bookingId, data) => {
    const response = await api.post(`/bookings/${bookingId}/review/`, data);
    return response.data;
};

/**
 * File a complaint for a booking
 * @param {number} bookingId 
 * @param {Object} data - { complaint_text }
 */
export const createComplaint = async (bookingId, data) => {
    const response = await api.post(`/bookings/${bookingId}/complaint/`, data);
    return response.data;
};

/**
 * Confirm or dispute the final payment amount
 * @param {number} bookingId 
 * @param {Object} data - { confirmed: boolean, customer_amount?: number }
 */
export const confirmPayment = async (bookingId, data) => {
    const response = await api.post(`/bookings/${bookingId}/confirm-payment/`, data);
    return response.data;
};

/**
 * Get customer's complaints
 */
export const getCustomerComplaints = async () => {
    const response = await api.get('/bookings/my-complaints/');
    return response.data;
};

/**
 * Get customer's reviews
 */
export const getCustomerReviews = async () => {
    const response = await api.get('/bookings/my-reviews/');
    return response.data;
};

/**
 * Get admin dashboard statistics
 * @param {string} period - week, month, year, or custom
 * @param {string} startDate - YYYY-MM-DD (optional, required if period is custom)
 * @param {string} endDate - YYYY-MM-DD (optional, required if period is custom)
 */
export const getAdminStats = async (period = 'month', startDate = null, endDate = null) => {
    let url = `/bookings/admin/stats/?period=${period}`;
    if (period === 'custom' && startDate && endDate) {
        url += `&start_date=${startDate}&end_date=${endDate}`;
    }
    const response = await api.get(url);
    return response.data;
};

/**
 * Get admin analytics data
 */
export const getAdminAnalytics = async () => {
    const response = await api.get('/bookings/admin/analytics/');
    return response.data;
};

/**
 * Cancel an emergency booking (before mechanic accepts)
 * @param {number} bookingId 
 * @param {Object} data - { cancellation_reason }
 */
export const cancelEmergencyBooking = async (bookingId, data) => {
    const response = await api.post(`/bookings/${bookingId}/emergency-cancel/`, data);
    return response.data;
};

/**
 * Get admin complaints filtered by complaint type
 * @param {string} complaintType - EMERGENCY_DELAY, SERVICE_QUALITY, PAYMENT_ISSUE, OTHER
 */
export const getAdminComplaintsByType = async (complaintType = null) => {
    const params = complaintType ? { complaint_type: complaintType } : {};
    const response = await api.get('/bookings/admin/complaints/', { params });
    return response.data;
};

/**
 * Get chat messages for a booking
 * @param {number} bookingId
 */
export const getBookingMessages = async (bookingId) => {
    const response = await api.get(`/bookings/${bookingId}/messages/`);
    return response.data;
};

/**
 * Send a chat message for a booking
 * @param {number} bookingId
 * @param {string} message
 */
export const sendBookingMessage = async (bookingId, message) => {
    const response = await api.post(`/bookings/${bookingId}/messages/send/`, { message });
    return response.data;
};

/**
 * Get all bills for the authenticated customer
 */
export const getCustomerBills = async () => {
    const response = await api.get('/bookings/bills/');
    return response.data;
};

/**
 * Get all bills for the authenticated mechanic
 */
export const getMechanicBills = async () => {
    const response = await api.get('/bookings/bills/mechanic/');
    return response.data;
};

/**
 * Get a single bill by bill number
 * @param {string} billNumber
 */
export const getBillDetail = async (billNumber) => {
    const response = await api.get(`/bookings/bills/${billNumber}/`);
    return response.data;
};

export default {
    createEmergencyBooking,
    createRegularBooking,
    getCustomerBookings,
    getNotifications,
    getAvailableEmergencyJobs,
    getAvailableRegularJobs,
    getMechanicJobs,
    getMechanicAllJobs,
    acceptJob,
    processPayment,
    completeJob,
    cancelJobByMechanic,
    cancelBookingByCustomer,
    cancelEmergencyBooking,
    createReview,
    createComplaint,
    confirmPayment,
    getCustomerComplaints,
    getCustomerReviews,
    getAdminStats,
    getAdminAnalytics,
    getAdminComplaintsByType,
    getBookingMessages,
    sendBookingMessage,
    getCustomerBills,
    getMechanicBills,
    getBillDetail,
};
