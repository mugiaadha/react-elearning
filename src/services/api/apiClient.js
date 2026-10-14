import axios from 'axios';

/**
 * NAC Tax Center - HTTP REST API Client
 * 
 * Configured to seamlessly target static mock JSON files during development (/public/api/...)
 * or the actual Backend API in production by simply updating VITE_API_BASE_URL.
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request Interceptor: Attach Auth Token if user is logged in
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('nac_auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // When sending FormData, delete Content-Type so browser sets boundary automatically
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    
    // In dev mode, append timestamp cache-busting to static JSON files to ensure fresh reads
    if (config.url && config.url.endsWith('.json')) {
      config.params = {
        ...config.params,
        _t: Date.now(),
      };
    }
    return config;
  },
  (error) => {
    console.error('[API Client Request Error]', error);
    return Promise.reject(error);
  }
);

// Response Interceptor: Standardize API responses & error handling
apiClient.interceptors.response.use(
  (response) => {
    // Return standard backend response payload
    return response.data;
  },
  (error) => {
    if (error.response?.status === 401 && !error.config?.url?.includes('/auth/login')) {
      localStorage.removeItem('nac_auth_token');
    }
    const customError = {
      success: false,
      status: error.response?.status || 500,
      message:
        error.response?.data?.message ||
        error.message ||
        'Terjadi kesalahan saat menghubungi server.',
      details: error.response?.data || null,
    };
    console.error('[API Client Response Error]', customError);
    return Promise.reject(customError);
  }
);

export default apiClient;
