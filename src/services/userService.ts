import apiClient from './apiClient';
import { ApiResponse } from '../types/api.types';
import { User, CreateUserRequest, UpdateUserRequest, GetUsersResponse } from '../types/auth.types';

/**
 * User service
 * All API calls for user management are centralized here
 */

/**
 * Get all users with optional filters
 */
export const getAllUsers = async (
  filters?: { role?: string; isActive?: boolean; page?: number; limit?: number }
): Promise<GetUsersResponse> => {
  const params = new URLSearchParams();
  if (filters?.role) params.append('role', filters.role);
  if (filters?.isActive !== undefined) params.append('isActive', String(filters.isActive));
  if (filters?.page) params.append('page', String(filters.page));
  if (filters?.limit) params.append('limit', String(filters.limit));

  const queryString = params.toString();
  const url = queryString ? `/users?${queryString}` : '/users';
  
  const response = await apiClient.get<GetUsersResponse>(url);
  return response.data;
};

/**
 * Get user by ID
 */
export const getUserById = async (id: string): Promise<ApiResponse<User>> => {
  const response = await apiClient.get<ApiResponse<User>>(`/users/${id}`);
  return response.data;
};

/**
 * Create new user
 */
export const createUser = async (data: CreateUserRequest): Promise<ApiResponse<User>> => {
  const response = await apiClient.post<ApiResponse<User>>('/users', data);
  return response.data;
};

/**
 * Update user
 */
export const updateUser = async (
  id: string,
  data: UpdateUserRequest
): Promise<ApiResponse<User>> => {
  const response = await apiClient.put<ApiResponse<User>>(`/users/${id}`, data);
  return response.data;
};

/**
 * Delete user
 */
export const deleteUser = async (id: string): Promise<ApiResponse<void>> => {
  const response = await apiClient.delete<ApiResponse<void>>(`/users/${id}`);
  return response.data;
};

