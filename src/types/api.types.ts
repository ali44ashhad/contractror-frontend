/**
 * Pagination metadata
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * Standard API response wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  count?: number;
  pagination?: PaginationMeta;
}

/**
 * API error response
 */
export interface ApiError {
  success: false;
  error: {
    message: string;
    statusCode: number;
  };
}

