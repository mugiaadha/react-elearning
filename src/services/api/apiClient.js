import axios from 'axios';

/**
 * NAC Tax Center - HTTP REST API Client
 * 
 * Connected directly to Laravel REST API Backend
 */
const resolveApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (typeof window !== 'undefined' && window.location?.hostname) {
    const host = window.location.hostname;
    if (host !== 'localhost' && host !== '127.0.0.1') {
      if (!envUrl || envUrl.includes('localhost') || envUrl.includes('127.0.0.1')) {
        return `${window.location.origin}/api`;
      }
    }
  }
  return envUrl || 'http://127.0.0.1:8000/api';
};

const API_BASE_URL = resolveApiBaseUrl();

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
    if (customError.status >= 500) {
      console.error('[API Server Error]', customError);
    } else {
      console.warn(`[API Client ${customError.status}]`, customError.message);
    }
    return Promise.reject(customError);
  }
);

export default apiClient;
