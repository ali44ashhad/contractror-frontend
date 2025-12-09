import apiClient from './apiClient';
import { ApiResponse } from '../types/api.types';
import { DashboardKPI, RecentUpdate } from '../types/admin.types';

/**
 * Dashboard service
 * All API calls for dashboard data are centralized here
 */

/**
 * Get dashboard statistics/KPIs
 */
export const getDashboardStats = async (): Promise<ApiResponse<DashboardKPI>> => {
  const response = await apiClient.get<ApiResponse<DashboardKPI>>('/dashboard/stats');
  return response.data;
};

/**
 * Get recent updates for dashboard
 */
export const getRecentUpdates = async (limit?: number): Promise<ApiResponse<RecentUpdate[]>> => {
  const params = new URLSearchParams();
  if (limit) params.append('limit', limit.toString());

  const queryString = params.toString();
  const url = queryString ? `/dashboard/recent-updates?${queryString}` : '/dashboard/recent-updates';

  const response = await apiClient.get<ApiResponse<RecentUpdate[]>>(url);
  return response.data;
};

