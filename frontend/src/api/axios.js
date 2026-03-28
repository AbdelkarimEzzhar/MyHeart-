import axios from 'axios';

// Determine baseURL based on environment
const getBaseURL = () => {
    // In browser, use relative path that Nginx will proxy
    // Nginx proxies /api/* to api-gateway:8080
    return window.location.origin;
};

const API = axios.create({
    baseURL: getBaseURL(),
    headers: { 'Content-Type': 'application/json' },
    timeout: 30000, // 30 second timeout
});

API.interceptors.request.use((config) => {
    try {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers = config.headers || {};
            config.headers['Authorization'] = `Bearer ${token}`;
        }
    } catch (e) {
        console.error('Token error:', e);
    }
    return config;
});

API.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            // Server responded with error status
            console.error('API Error:', error.response.status, error.response.data);
        } else if (error.request) {
            // Request made but no response
            console.error('No response received:', error.request);
        } else {
            // Error in request setup
            console.error('Request error:', error.message);
        }
        return Promise.reject(error);
    }
);

export default API;
