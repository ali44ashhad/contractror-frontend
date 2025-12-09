import { UserReference, ProjectReference } from './update.types';

/**
 * Update reference interface (for populated fields)
 */
export interface UpdateReference {
  _id: string;
  updateType: string;
  timestamp: string;
  updateDescription?: string;
}

/**
 * Attendance interface matching backend IAttendance
 */
export interface Attendance {
  _id: string;
  userId: string | UserReference;
  projectId: string | ProjectReference;
  date: string;
  morningUpdateId?: string | UpdateReference;
  eveningUpdateId?: string | UpdateReference;
  isPresent: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Get attendance response from backend
 */
export interface GetAttendanceResponse {
  success: boolean;
  data: Attendance[];
  count: number;
}

