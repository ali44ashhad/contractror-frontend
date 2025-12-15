import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { ApiError } from '../types/api.types';

/**
 * Axios instance configured for API calls
 * Automatically sends cookies for authentication
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  withCredentials: true, // Important: sends cookies automatically
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request interceptor - removes Content-Type header for FormData to let browser set it with boundary
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // If data is FormData, remove Content-Type header to let browser set it with boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor - handles errors globally
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const statusCode = error.response?.status || 500;
    
    const apiError: ApiError = {
      success: false,
      error: {
        message:
          error.response?.data?.error?.message ||
          error.message ||
          'An unexpected error occurred',
        statusCode,
      },
    };
    return Promise.reject(apiError);
  }
);

export default apiClient;

