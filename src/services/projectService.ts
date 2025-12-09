import apiClient from './apiClient';
import { ApiResponse } from '../types/api.types';
import {
  Project,
  CreateProjectRequest,
  UpdateProjectRequest,
  AssignProjectRequest,
  GetProjectsResponse,
} from '../types/project.types';

/**
 * Project service
 * All API calls for project management are centralized here
 */

/**
 * Get all projects with optional filters
 */
export const getAllProjects = async (filters?: {
  status?: string;
  contractorId?: string;
  adminId?: string;
  page?: number;
  limit?: number;
}): Promise<GetProjectsResponse> => {
  const params = new URLSearchParams();
  if (filters?.status) params.append('status', filters.status);
  if (filters?.contractorId) params.append('contractorId', filters.contractorId);
  if (filters?.adminId) params.append('adminId', filters.adminId);
  if (filters?.page) params.append('page', String(filters.page));
  if (filters?.limit) params.append('limit', String(filters.limit));

  const queryString = params.toString();
  const url = queryString ? `/projects?${queryString}` : '/projects';

  const response = await apiClient.get<GetProjectsResponse>(url);
  return response.data;
};

/**
 * Get project by ID
 */
export const getProjectById = async (id: string): Promise<ApiResponse<Project>> => {
  const response = await apiClient.get<ApiResponse<Project>>(`/projects/${id}`);
  return response.data;
};

/**
 * Create new project
 */
export const createProject = async (
  data: CreateProjectRequest
): Promise<ApiResponse<Project>> => {
  const response = await apiClient.post<ApiResponse<Project>>('/projects', data);
  return response.data;
};

/**
 * Update project
 */
export const updateProject = async (
  id: string,
  data: UpdateProjectRequest
): Promise<ApiResponse<Project>> => {
  const response = await apiClient.put<ApiResponse<Project>>(`/projects/${id}`, data);
  return response.data;
};

/**
 * Assign project to contractor
 */
export const assignProjectToContractor = async (
  id: string,
  data: AssignProjectRequest
): Promise<ApiResponse<Project>> => {
  const response = await apiClient.post<ApiResponse<Project>>(`/projects/${id}/assign`, data);
  return response.data;
};

/**
 * Delete project
 */
export const deleteProject = async (id: string): Promise<ApiResponse<void>> => {
  const response = await apiClient.delete<ApiResponse<void>>(`/projects/${id}`);
  return response.data;
};

