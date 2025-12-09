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
 */
export const getMe = async (): Promise<ApiResponse<User>> => {
  const response = await apiClient.get<ApiResponse<User>>('/auth/me');
  return response.data;
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

