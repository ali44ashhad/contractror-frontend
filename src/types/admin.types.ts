/**
 * Admin dashboard type definitions
 */

export interface DashboardKPI {
  totalProjects: number;
  updatesToday: number;
  activeContractors: number;
  pendingRequests: number;
}

export interface RecentUpdate {
  _id: string;
  imageUrl: string;
  contractorName: string;
  projectName: string;
  projectId: string;
  description?: string;
  updateType: 'morning' | 'evening';
  timestamp: string;
  status: string;
  lat?: number;
  lng?: number;
}

export interface MenuItem {
  key: string;
  label: string;
}

export interface DashboardFilters {
  project: string;
  status: string;
  dateFrom: string;
  dateTo: string;
}

