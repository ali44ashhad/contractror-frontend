/**
 * Request type enum matching backend
 */
export enum RequestType {
  COMPLETION = 'completion',
  EXTENSION = 'extension',
}

/**
 * Request status enum matching backend
 */
export enum RequestStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
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
 * Project reference interface (for populated fields)
 */
export interface ProjectReference {
  _id: string;
  name: string;
  description: string;
  status: string;
  endDate?: string;
}

/**
 * Project Request interface matching backend ProjectRequest model
 */
export interface ProjectRequest {
  _id: string;
  projectId: string | ProjectReference;
  requestedBy: string | UserReference;
  type: RequestType;
  status: RequestStatus;
  requestedEndDate?: string;
  approvedEndDate?: string;
  reason?: string;
  adminNotes?: string;
  reviewedBy?: string | UserReference;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Create completion request payload
 */
export interface CreateCompletionRequest {
  projectId: string;
  reason?: string;
}

/**
 * Create extension request payload
 */
export interface CreateExtensionRequest {
  projectId: string;
  requestedEndDate: string;
  reason?: string;
}

import { PaginationMeta } from './api.types';

/**
 * Get requests response from backend
 */
export interface GetRequestsResponse {
  success: boolean;
  data: ProjectRequest[];
  count: number;
  pagination?: PaginationMeta;
}

