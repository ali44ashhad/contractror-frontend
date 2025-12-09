import apiClient from './apiClient';
import { GetAttendanceResponse } from '../types/attendance.types';

/**
 * Attendance service
 * All API calls for attendance management are centralized here
 */

/**
 * Get attendance records with optional filters
 */
export const getAttendance = async (filters?: {
  userId?: string;
  projectId?: string;
  startDate?: string;
  endDate?: string;
}): Promise<GetAttendanceResponse> => {
  const params = new URLSearchParams();
  if (filters?.userId) params.append('userId', filters.userId);
  if (filters?.projectId) params.append('projectId', filters.projectId);
  if (filters?.startDate) params.append('startDate', filters.startDate);
  if (filters?.endDate) params.append('endDate', filters.endDate);

  const queryString = params.toString();
  const url = queryString ? `/attendance?${queryString}` : '/attendance';

  const response = await apiClient.get<GetAttendanceResponse>(url);
  return response.data;
};

/**
 * Get attendance for specific user
 */
export const getUserAttendance = async (
  userId: string,
  filters?: {
    projectId?: string;
    startDate?: string;
    endDate?: string;
  }
): Promise<GetAttendanceResponse> => {
  const params = new URLSearchParams();
  if (filters?.projectId) params.append('projectId', filters.projectId);
  if (filters?.startDate) params.append('startDate', filters.startDate);
  if (filters?.endDate) params.append('endDate', filters.endDate);

  const queryString = params.toString();
  const url = queryString
    ? `/attendance/user/${userId}?${queryString}`
    : `/attendance/user/${userId}`;

  const response = await apiClient.get<GetAttendanceResponse>(url);
  return response.data;
};

/**
 * Get attendance for all team members in a project
 */
export const getProjectAttendance = async (
  projectId: string,
  filters?: {
    startDate?: string;
    endDate?: string;
  }
): Promise<GetAttendanceResponse> => {
  const params = new URLSearchParams();
  if (filters?.startDate) params.append('startDate', filters.startDate);
  if (filters?.endDate) params.append('endDate', filters.endDate);

  const queryString = params.toString();
  const url = queryString
    ? `/attendance/project/${projectId}?${queryString}`
    : `/attendance/project/${projectId}`;

  const response = await apiClient.get<GetAttendanceResponse>(url);
  return response.data;
};

