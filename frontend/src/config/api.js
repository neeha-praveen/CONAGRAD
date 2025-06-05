import axios from 'axios';

const BASE_URL = 'http://localhost:4000/api';

export const API_ENDPOINTS = {
    STUDENT_ASSIGNMENTS: `${BASE_URL}/student/assignments`,
    UPLOAD_ASSIGNMENT: `${BASE_URL}/student/upload-assignment`,
    DOWNLOAD_FILE: `${BASE_URL}/student/download`,
    // Fixed: Added missing endpoint for single assignment
    GET_ASSIGNMENT: (assignmentId) => `${BASE_URL}/student/assignments/${assignmentId}`,
    // Bid endpoints
    GET_ASSIGNMENT_BIDS: (assignmentId) => `${BASE_URL}/student/assignments/${assignmentId}/bids`,
    ACCEPT_BID: (assignmentId, bidId) => `${BASE_URL}/student/assignments/${assignmentId}/accept-bid/${bidId}`,
    REJECT_BID: (assignmentId, bidId) => `${BASE_URL}/student/assignments/${assignmentId}/reject-bid/${bidId}`
};

export const getAuthHeader = () => {
    const token = localStorage.getItem('studentToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

// Create axios instance with consistent base URL
export const axiosInstance = axios.create({
    baseURL: BASE_URL, // Fixed: Now matches API_ENDPOINTS base URL
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    }
});

// Request interceptor
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('studentToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        console.log('Making request to:', config.baseURL + config.url); // Debug log
        return config;
    },
    (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor with better error handling
axiosInstance.interceptors.response.use(
    (response) => {
        console.log('Response received:', response.status, response.config.url); // Debug log
        return response;
    },
    (error) => {
        console.error('API Error Details:', {
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            url: error.config?.url,
            method: error.config?.method
        });
        
        if (error.response?.status === 401) {
            localStorage.removeItem('studentToken');
            window.location.href = '/';
        }
        return Promise.reject(error);
    }
);

// Add default export for backward compatibility
export default axiosInstance;