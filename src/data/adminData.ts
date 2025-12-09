import { DashboardKPI, RecentUpdate, MenuItem } from '../types/admin.types';

/**
 * Dashboard menu items
 */
export const menuItems: MenuItem[] = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'users', label: 'Users' },
  { key: 'projects', label: 'Projects' },
  { key: 'teams', label: 'Teams' },
  { key: 'requests', label: 'Requests' },
  { key: 'reports', label: 'Reports' },
];

/**
 * Dummy KPI data for dashboard
 */
export const dummyKPIs: DashboardKPI = {
  totalProjects: 24,
  updatesToday: 48,
  activeContractors: 8,
  pendingRequests: 3,
};

/**
 * Generate dummy recent updates data
 */
export const generateDummyUpdates = (count: number = 8): RecentUpdate[] => {
  return Array.from({ length: count }).map((_, i) => ({
    _id: `update-${i}`,
    imageUrl: `https://picsum.photos/seed/update-${i}/400/300`,
    contractorName: `Contractor ${i + 1}`,
    projectName: `Project ${String.fromCharCode(65 + (i % 5))}`,
    projectId: `project-${i % 5}`,
    description: `Site visit and progress update ${i + 1}. Work is progressing well on the foundation and structural elements.`,
    updateType: i % 2 === 0 ? 'morning' : 'evening',
    timestamp: new Date(Date.now() - i * 1000 * 60 * 60 * 2).toISOString(),
    status: i % 3 === 0 ? 'pending' : 'approved',
    lat: 28.6 + Math.random() * 0.1,
    lng: 77.2 + Math.random() * 0.1,
  }));
};

