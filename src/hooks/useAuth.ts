import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '../types/auth.types';
import { LoginRequest, RegisterRequest } from '../types/auth.types';
import { UserRole } from '../types/common.types';
import * as authService from '../services/authService';
import { ApiError } from '../types/api.types';

interface UseAuthReturn {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

/**
 * Authentication hook
 * Manages authentication state and operations
 * Returns stable API object as per rules.md
 */
export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  /**
   * Check if user is authenticated on mount
   */
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await authService.getMe();
        // getMe returns data: user directly, not data: { user }
        if (response.success && response.data) {
          // Check if response.data is the user object or has a user property
          const userData = (response.data as any).user || response.data;
          if (userData && userData._id) {
            setUser(userData);
          }
        }
      } catch (err) {
        // User not authenticated or token expired
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  /**
   * Login handler
   */
  const loginHandler = useCallback(async (data: LoginRequest) => {
    try {
      setError(null);
      setIsLoading(true);
      const response = await authService.login(data);
      if (response.success && response.data.user) {
        const userData = response.data.user;
        setUser(userData);
        // Navigate based on user role
        const redirectPath =
          userData.role === UserRole.CONTRACTOR
            ? '/contractor-dashboard'
            : '/admin-dashboard';
        navigate(redirectPath, { replace: true });
      }
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.error.message || 'Login failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  /**
   * Register handler
   */
  const registerHandler = useCallback(async (data: RegisterRequest) => {
    try {
      setError(null);
      setIsLoading(true);
      const response = await authService.register(data);
      if (response.success && response.data.user) {
        const userData = response.data.user;
        setUser(userData);
        // Navigate based on user role
        const redirectPath =
          userData.role === UserRole.CONTRACTOR
            ? '/contractor-dashboard'
            : '/admin-dashboard';
        navigate(redirectPath, { replace: true });
      }
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.error.message || 'Registration failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  /**
   * Logout handler
   */
  const logoutHandler = useCallback(async () => {
    try {
      await authService.logout();
      setUser(null);
      navigate('/admin-login', { replace: true });
    } catch (err) {
      // Even if logout fails, clear local state
      setUser(null);
      navigate('/admin-login', { replace: true });
    }
  }, [navigate]);

  /**
   * Clear error handler
   */
  const clearErrorHandler = useCallback(() => {
    setError(null);
  }, []);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    error,
    login: loginHandler,
    register: registerHandler,
    logout: logoutHandler,
    clearError: clearErrorHandler,
  };
};

