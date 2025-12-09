import apiClient from './apiClient';
import { ApiResponse } from '../types/api.types';
import {
  Team,
  CreateTeamRequest,
  UpdateTeamRequest,
  GetTeamsResponse,
} from '../types/team.types';

/**
 * Team service
 * All API calls for team management are centralized here
 */

/**
 * Get all teams with optional filters
 */
export const getAllTeams = async (filters?: {
  projectId?: string;
  contractorId?: string;
  page?: number;
  limit?: number;
}): Promise<GetTeamsResponse> => {
  const params = new URLSearchParams();
  if (filters?.projectId) params.append('projectId', filters.projectId);
  if (filters?.contractorId) params.append('contractorId', filters.contractorId);
  if (filters?.page) params.append('page', String(filters.page));
  if (filters?.limit) params.append('limit', String(filters.limit));

  const queryString = params.toString();
  const url = queryString ? `/teams?${queryString}` : '/teams';

  const response = await apiClient.get<GetTeamsResponse>(url);
  return response.data;
};

/**
 * Get team by ID
 */
export const getTeamById = async (id: string): Promise<ApiResponse<Team>> => {
  const response = await apiClient.get<ApiResponse<Team>>(`/teams/${id}`);
  return response.data;
};

/**
 * Create new team
 */
export const createTeam = async (data: CreateTeamRequest): Promise<ApiResponse<Team>> => {
  const response = await apiClient.post<ApiResponse<Team>>('/teams', data);
  return response.data;
};

/**
 * Update team
 */
export const updateTeam = async (
  id: string,
  data: UpdateTeamRequest
): Promise<ApiResponse<Team>> => {
  const response = await apiClient.put<ApiResponse<Team>>(`/teams/${id}`, data);
  return response.data;
};

/**
 * Delete team
 */
export const deleteTeam = async (id: string): Promise<ApiResponse<void>> => {
  const response = await apiClient.delete<ApiResponse<void>>(`/teams/${id}`);
  return response.data;
};

