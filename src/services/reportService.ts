import apiClient from './apiClient';
import { GetProjectReportResponse } from '../types/report.types';

/**
 * Report service
 * All API calls for report management are centralized here
 */

/**
 * Get project report with team members and updates for a date range
 */
export const getProjectReport = async (
  projectId: string,
  startDate: string,
  endDate: string
): Promise<GetProjectReportResponse> => {
  const params = new URLSearchParams();
  params.append('startDate', startDate);
  params.append('endDate', endDate);

  const url = `/reports/project/${projectId}?${params.toString()}`;
  const response = await apiClient.get<GetProjectReportResponse>(url);
  return response.data;
};

