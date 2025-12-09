import apiClient from './apiClient';
import { ApiResponse } from '../types/api.types';
import {
  Update,
  CreateUpdateRequest,
  DocumentMetadataInput,
  GetUpdatesResponse,
} from '../types/update.types';

/**
 * Update service
 * All API calls for update management are centralized here
 */

/**
 * Create update with file uploads
 */
export const createUpdate = async (
  data: CreateUpdateRequest,
  files: File[],
  documentMetadata?: DocumentMetadataInput[]
): Promise<ApiResponse<Update>> => {
  const formData = new FormData();

  // Add text fields
  formData.append('projectId', data.projectId);
  formData.append('updateType', data.updateType);
  formData.append('status', data.status);
  if (data.updateDate) {
    formData.append('updateDate', data.updateDate);
  }
  if (data.updateDescription) {
    formData.append('updateDescription', data.updateDescription);
  }

  // Add files
  files.forEach((file) => {
    formData.append('documents', file);
  });

  // Add document metadata as JSON string
  if (documentMetadata && documentMetadata.length > 0) {
    formData.append('documentMetadata', JSON.stringify(documentMetadata));
  }

  // Don't set Content-Type header - browser will set it with boundary for FormData
  const response = await apiClient.post<ApiResponse<Update>>('/updates', formData);
  return response.data;
};

/**
 * Get all updates with optional filters
 */
export const getUpdates = async (filters?: {
  projectId?: string;
  contractorId?: string;
  postedBy?: string;
  updateType?: string;
  page?: number;
  limit?: number;
}): Promise<GetUpdatesResponse> => {
  const params = new URLSearchParams();
  if (filters?.projectId) params.append('projectId', filters.projectId);
  if (filters?.contractorId) params.append('contractorId', filters.contractorId);
  if (filters?.postedBy) params.append('postedBy', filters.postedBy);
  if (filters?.updateType) params.append('updateType', filters.updateType);
  if (filters?.page) params.append('page', String(filters.page));
  if (filters?.limit) params.append('limit', String(filters.limit));

  const queryString = params.toString();
  const url = queryString ? `/updates?${queryString}` : '/updates';

  const response = await apiClient.get<GetUpdatesResponse>(url);
  return response.data;
};

/**
 * Get update by ID
 */
export const getUpdateById = async (id: string): Promise<ApiResponse<Update>> => {
  const response = await apiClient.get<ApiResponse<Update>>(`/updates/${id}`);
  return response.data;
};

/**
 * Add documents to existing update
 */
export const addDocumentsToUpdate = async (
  id: string,
  files: File[],
  documentMetadata?: DocumentMetadataInput[]
): Promise<ApiResponse<Update>> => {
  const formData = new FormData();

  // Add files
  files.forEach((file) => {
    formData.append('documents', file);
  });

  // Add document metadata as JSON string
  if (documentMetadata && documentMetadata.length > 0) {
    formData.append('documentMetadata', JSON.stringify(documentMetadata));
  }

  // Don't set Content-Type header - browser will set it with boundary for FormData
  const response = await apiClient.post<ApiResponse<Update>>(
    `/updates/${id}/documents`,
    formData
  );
  return response.data;
};

