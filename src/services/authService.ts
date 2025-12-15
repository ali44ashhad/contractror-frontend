import apiClient from './apiClient';
import { LoginRequest, RegisterRequest, AuthResponse } from '../types/auth.types';
import { ApiResponse } from '../types/api.types';
import { User } from '../types/auth.types';

/**
 * Authentication service
 * All API calls for authentication are centralized here
 */

/**
 * Register a new user
 * Sets httpOnly cookie automatically via withCredentials
 */
export const register = async (
  data: RegisterRequest
): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>('/auth/register', data);
  return response.data;
};

/**
 * Login user
 * Sets httpOnly cookie automatically via withCredentials
 */
export const login = async (data: LoginRequest): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>('/auth/login', data);
  return response.data;
};

/**
 * Logout user
 * Clears httpOnly cookie
 */
export const logout = async (): Promise<void> => {
  await apiClient.post('/auth/logout');
};

/**
 * Get current authenticated user
 * Note: Backend returns data: user directly, not data: { user }
 * This is used to check auth status, so 401 errors are expected when not authenticated
 * Using validateStatus to prevent axios from treating 401 as an error (which causes console noise)
 */
export const getMe = async (): Promise<ApiResponse<User>> => {
  try {
    const response = await apiClient.get<ApiResponse<User>>('/auth/me', {
      // Don't treat 401 as an error - it's expected when checking auth status
      // This prevents axios from logging the error to console
      validateStatus: (status) => status < 500, // Accept all status codes except 5xx
    });
    
    // If status is 401, the response.data will contain the error from the server
    // The server returns: { success: false, error: { message: "...", statusCode: 401 } }
    if (response.status === 401) {
      return response.data as ApiResponse<User>;
    }
    
    // For successful responses (200), return the data
    return response.data;
  } catch (error) {
    // Handle any unexpected errors (5xx, network errors, etc.)
    // This should rarely happen since we're accepting status < 500
    throw error;
  }
};

/**
 * Change password
 */
export const changePassword = async (data: {
  currentPassword: string;
  newPassword: string;
}): Promise<ApiResponse<void>> => {
  const response = await apiClient.post<ApiResponse<void>>('/auth/change-password', data);
  return response.data;
};

