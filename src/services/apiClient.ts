import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { ApiError } from '../types/api.types';
import { isIOSSafari, getTokenForIOS, storeTokenForIOS } from '../utils/iosDetection';

/**
 * Axios instance configured for API calls
 * Automatically sends cookies for authentication
 * For iOS Safari, uses Authorization header as fallback (cookies don't work cross-domain)
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  withCredentials: true, // Important: sends cookies automatically (works for non-iOS browsers)
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request interceptor - adds Authorization header for iOS Safari and handles FormData
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // If data is FormData, remove Content-Type header to let browser set it with boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    
    // iOS Safari Fix: Add Authorization header if token is stored
    // iOS Safari blocks cross-site cookies, so we use Authorization header as fallback
    if (isIOSSafari()) {
      const token = getTokenForIOS();
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor - handles errors globally and stores token for iOS Safari
 */
apiClient.interceptors.response.use(
  (response) => {
    // iOS Safari Fix: Store token from response if present
    // Backend returns token in response.data.data.token (for login/register/refresh)
    // Check multiple possible locations for the token
    if (isIOSSafari()) {
      const token = response.data?.data?.token || 
                    response.data?.token || 
                    (response.data?.data && typeof response.data.data === 'object' && 'token' in response.data.data ? response.data.data.token : null);
      if (token) {
        storeTokenForIOS(token);
      }
    }
    return response;
  },
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

