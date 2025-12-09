/**
 * Project status enum matching backend
 */
export enum ProjectStatus {
  PLANNING = 'planning',
  IN_PROGRESS = 'in_progress',
  ON_HOLD = 'on_hold',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

/**
 * User reference interface (for populated fields)
 */
export interface UserReference {
  _id: string;
  name: string;
  email: string;
  role?: string;
}

/**
 * Project interface matching backend Project model
 */
export interface Project {
  _id: string;
  name: string;
  description: string;
  adminId: string | UserReference;
  contractorId?: string | UserReference | null;
  status: ProjectStatus;
  startDate?: string;
  endDate?: string;
  budget?: number;
  location?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Create project request payload
 */
export interface CreateProjectRequest {
  name: string;
  description: string;
  contractorId?: string | null;
  status?: ProjectStatus;
  startDate?: string;
  endDate?: string;
  budget?: number;
  location?: string;
}

/**
 * Update project request payload
 */
export interface UpdateProjectRequest {
  name?: string;
  description?: string;
  contractorId?: string | null;
  status?: ProjectStatus;
  startDate?: string;
  endDate?: string;
  budget?: number;
  location?: string;
}

/**
 * Assign project to contractor request payload
 */
export interface AssignProjectRequest {
  contractorId: string;
}

import { PaginationMeta } from './api.types';

/**
 * Get projects response from backend
 */
export interface GetProjectsResponse {
  success: boolean;
  data: Project[];
  count: number;
  pagination?: PaginationMeta;
}

