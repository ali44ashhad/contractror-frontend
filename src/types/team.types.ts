import { UserReference } from './project.types';
import { PaginationMeta } from './api.types';

/**
 * Project reference interface (for populated fields)
 */
export interface ProjectReference {
  _id: string;
  name: string;
  description?: string;
}

/**
 * Team interface matching backend Team model
 */
export interface Team {
  _id: string;
  projectId: string | ProjectReference;
  contractorId: string | UserReference;
  teamName: string;
  members: (string | UserReference)[];
  createdBy: string | UserReference;
  createdAt: string;
  updatedAt: string;
}

/**
 * Create team request payload
 */
export interface CreateTeamRequest {
  projectId: string;
  contractorId: string;
  teamName: string;
  members?: string[];
}

/**
 * Update team request payload
 */
export interface UpdateTeamRequest {
  teamName?: string;
  members?: string[];
}

/**
 * Get teams response from backend
 */
export interface GetTeamsResponse {
  success: boolean;
  data: Team[];
  count: number;
  pagination?: PaginationMeta;
}

