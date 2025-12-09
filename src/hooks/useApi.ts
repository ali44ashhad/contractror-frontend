import { useState, useCallback } from 'react';
import { ApiError } from '../types/api.types';

interface UseApiReturn<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  execute: (...args: unknown[]) => Promise<T | null>;
  clearError: () => void;
}

/**
 * Generic API call hook with error handling
 * Follows rules.md: returns stable API object
 */
export const useApi = <T>(
  apiFunction: (...args: unknown[]) => Promise<T>
): UseApiReturn<T> => {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(
    async (...args: unknown[]): Promise<T | null> => {
      try {
        setError(null);
        setIsLoading(true);
        const result = await apiFunction(...args);
        setData(result);
        return result;
      } catch (err) {
        const apiError = err as ApiError;
        setError(apiError.error.message || 'An error occurred');
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [apiFunction]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    data,
    isLoading,
    error,
    execute,
    clearError,
  };
};

