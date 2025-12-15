import { UserRole } from './common.types';
import { PaginationMeta } from './api.types';

/**
 * User interface matching backend User model
 */
export interface User {
  _id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Login request payload
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Register request payload
 */
export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  role?: UserRole;
  phone?: string;
}

/**
 * Auth response from backend
 */
export interface AuthResponse {
  success: boolean;
  data: {
    user: User;
    token?: string; // Optional token for Safari/iOS fallback when cookies are blocked
  };
  message: string;
}

/**
 * Create user request payload
 */
export interface CreateUserRequest {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  phone?: string;
}

/**
 * Update user request payload
 */
export interface UpdateUserRequest {
  name?: string;
  phone?: string;
  role?: UserRole;
  isActive?: boolean;
  password?: string;
}

/**
 * Get users response from backend
 */
export interface GetUsersResponse {
  success: boolean;
  data: User[];
  count: number;
  pagination?: PaginationMeta;
}

