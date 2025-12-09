import apiClient from './apiClient';
import { ApiResponse } from '../types/api.types';
import {
  ProjectRequest,
  CreateCompletionRequest,
  CreateExtensionRequest,
  GetRequestsResponse,
} from '../types/request.types';

/**
 * Request service
 * All API calls for request management are centralized here
 */

/**
 * Create completion request
 */
export const createCompletionRequest = async (
  data: CreateCompletionRequest
): Promise<ApiResponse<ProjectRequest>> => {
  const response = await apiClient.post<ApiResponse<ProjectRequest>>(
    '/requests/completion',
    data
  );
  return response.data;
};

/**
 * Create extension request
 */
export const createExtensionRequest = async (
  data: CreateExtensionRequest
): Promise<ApiResponse<ProjectRequest>> => {
  const response = await apiClient.post<ApiResponse<ProjectRequest>>(
    '/requests/extension',
    data
  );
  return response.data;
};

/**
 * Get all requests with optional filters
 */
export const getRequests = async (filters?: {
  projectId?: string;
  status?: string;
  type?: string;
  requestedBy?: string;
  page?: number;
  limit?: number;
}): Promise<GetRequestsResponse> => {
  const params = new URLSearchParams();
  if (filters?.projectId) params.append('projectId', filters.projectId);
  if (filters?.status) params.append('status', filters.status);
  if (filters?.type) params.append('type', filters.type);
  if (filters?.requestedBy) params.append('requestedBy', filters.requestedBy);
  if (filters?.page) params.append('page', String(filters.page));
  if (filters?.limit) params.append('limit', String(filters.limit));

  const queryString = params.toString();
  const url = queryString ? `/requests?${queryString}` : '/requests';

  const response = await apiClient.get<GetRequestsResponse>(url);
  return response.data;
};

/**
 * Approve request (Admin only)
 */
export const approveRequest = async (
  requestId: string,
  data?: { approvedEndDate?: string; adminNotes?: string }
): Promise<ApiResponse<ProjectRequest>> => {
  const response = await apiClient.patch<ApiResponse<ProjectRequest>>(
    `/requests/${requestId}/approve`,
    data
  );
  return response.data;
};

/**
 * Reject request (Admin only)
 */
export const rejectRequest = async (
  requestId: string,
  data?: { adminNotes?: string }
): Promise<ApiResponse<ProjectRequest>> => {
  const response = await apiClient.patch<ApiResponse<ProjectRequest>>(
    `/requests/${requestId}/reject`,
    data
  );
  return response.data;
};

/**
 * Cancel request (Contractor only - can only cancel their own pending requests)
 */
export const cancelRequest = async (
  requestId: string
): Promise<ApiResponse<void>> => {
  const response = await apiClient.delete<ApiResponse<void>>(
    `/requests/${requestId}/cancel`
  );
  return response.data;
};

