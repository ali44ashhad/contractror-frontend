/**
 * Update type enum matching backend
 */
export enum UpdateType {
  MORNING = 'morning',
  EVENING = 'evening',
}

/**
 * Document type enum matching backend
 */
export enum DocumentType {
  REQUIREMENT = 'requirement',
  STATUS = 'status',
  OTHER = 'other',
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
}

/**
 * Update document interface matching backend IUpdateDocument
 */
export interface UpdateDocument {
  _id?: string;
  uploadedBy: string | UserReference;
  type: DocumentType;
  fileName: string;
  filePath: string;
  fileSize?: number;
  mimeType?: string;
  description?: string;
  latitude: number;
  longitude: number;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Update interface matching backend IUpdate
 */
export interface Update {
  _id: string;
  projectId: string | ProjectReference;
  contractorId: string | UserReference;
  postedBy: string | UserReference;
  updateType: UpdateType;
  status: string;
  updateDate: string;
  timestamp: string;
  updateDescription?: string;
  documents: UpdateDocument[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Document metadata input for file uploads
 */
export interface DocumentMetadataInput {
  type: DocumentType;
  description?: string;
  fileName?: string;
  latitude: number;
  longitude: number;
}

/**
 * Create update request payload
 */
export interface CreateUpdateRequest {
  projectId: string;
  updateType: UpdateType;
  status: string;
  updateDate?: string;
  updateDescription?: string;
  documentMetadata?: DocumentMetadataInput[];
}

import { PaginationMeta } from './api.types';

/**
 * Get updates response from backend
 */
export interface GetUpdatesResponse {
  success: boolean;
  data: Update[];
  count: number;
  pagination?: PaginationMeta;
}

