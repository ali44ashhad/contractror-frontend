import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useApi } from '../../hooks/useApi';
import { getAllProjects } from '../../services/projectService';
import {
  Project,
  UserReference,
  ProjectStatus,
} from '../../types/project.types';
import Table from '../../components/Table';
import Select from '../../components/Select';
import Input from '../../components/Input';
import { getMapUrl } from '../../utils/maps';
import { getProjectStatusColor } from '../../utils/badgeColors';

/**
 * MemberProjectsPage component
 * Projects management page for members showing only their enrolled projects
 * View-only: no extend/complete buttons
 */
const MemberProjectsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [page, setPage] = useState(1);

  // Build filters object for API
  const apiFilters = useMemo(() => {
    const filters: { status?: string; page?: number; limit?: number } = {};
    if (statusFilter) filters.status = statusFilter;
    filters.page = page;
    filters.limit = 10;
    return filters;
  }, [statusFilter, page]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [statusFilter]);

  // Fetch projects function - memoized to prevent unnecessary re-renders
  const fetchProjectsFn = useCallback(() => {
    return getAllProjects(apiFilters);
  }, [apiFilters]);

  // Fetch projects
  const {
    data: projectsResponse,
    isLoading: isLoadingProjects,
    error: projectsError,
    execute: fetchProjects,
  } = useApi(fetchProjectsFn);

  // Fetch projects when filters change
  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Filter projects by search query (client-side)
  const filteredProjects = useMemo(() => {
    if (!projectsResponse?.data) return [];
    if (!searchQuery.trim()) return projectsResponse.data;

    const query = searchQuery.toLowerCase();
    return projectsResponse.data.filter(
      (project) =>
        project.name.toLowerCase().includes(query) ||
        project.description.toLowerCase().includes(query) ||
        project.location?.toLowerCase().includes(query)
    );
  }, [projectsResponse?.data, searchQuery]);

  // Helper function to get user name from reference
  const getUserName = useCallback(
    (userRef: string | UserReference | null | undefined): string => {
      if (!userRef) return 'Not assigned';
      if (typeof userRef === 'string') return 'Loading...';
      return userRef.name;
    },
    []
  );

  // Helper function to format currency
  const formatCurrency = useCallback((amount?: number): string => {
    if (!amount) return 'Not set';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  }, []);

  // Helper function to format date
  const formatDate = useCallback((dateString?: string): string => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString();
  }, []);

  // Table columns
  const columns = [
    {
      key: 'name',
      header: 'Project Name',
      render: (project: Project) => (
        <div className="font-semibold text-gray-800">{project.name}</div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (project: Project) => (
        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getProjectStatusColor(
            project.status
          )}`}
        >
          {project.status.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
        </span>
      ),
    },
    {
      key: 'budget',
      header: 'Budget',
      render: (project: Project) => (
        <div className="text-gray-600">{formatCurrency(project.budget)}</div>
      ),
    },
  ];

  // Render expandable content
  const renderExpandableContent = useCallback(
    (project: Project) => {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              Description
            </div>
            <div className="text-gray-800">{project.description}</div>
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              Admin
            </div>
            <div className="text-gray-800">{getUserName(project.adminId)}</div>
          </div>
          {project.location && (
            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                Location
              </div>
              <a
                href={getMapUrl(project.location)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#2563EB] hover:text-[#1D4ED8] hover:underline transition duration-300 flex items-center gap-1.5 group"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span className="text-gray-800 group-hover:text-[#2563EB]">
                  {project.location}
                </span>
              </a>
            </div>
          )}
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              Status
            </div>
            <div className="text-gray-800 capitalize">
              {project.status.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
            </div>
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              Budget
            </div>
            <div className="text-gray-800">{formatCurrency(project.budget)}</div>
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              Start Date
            </div>
            <div className="text-gray-800">{formatDate(project.startDate)}</div>
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              End Date
            </div>
            <div className="text-gray-800">{formatDate(project.endDate)}</div>
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              Created At
            </div>
            <div className="text-gray-800">{formatDate(project.createdAt)}</div>
          </div>
        </div>
      );
    },
    [getUserName, formatCurrency, formatDate]
  );

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: ProjectStatus.PLANNING, label: 'Planning' },
    { value: ProjectStatus.IN_PROGRESS, label: 'In Progress' },
    { value: ProjectStatus.ON_HOLD, label: 'On Hold' },
    { value: ProjectStatus.COMPLETED, label: 'Completed' },
    { value: ProjectStatus.CANCELLED, label: 'Cancelled' },
  ];

  return (
    <motion.section
      initial="hidden"
      animate="show"
      variants={{
        hidden: { opacity: 0 },
        show: { opacity: 1 },
      }}
      className="space-y-6"
    >
      {/* Search and Filters */}
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              label="Search Projects"
              type="text"
              placeholder="Search by name, description, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="md:w-48">
            <Select
              label="Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={statusOptions}
            />
          </div>
        </div>
      </div>

      {/* Table Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-800">
          My Projects ({filteredProjects.length})
        </h3>
        <button
          onClick={() => {
            fetchProjects();
          }}
          disabled={isLoadingProjects}
          className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition duration-300 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2 font-medium text-sm"
          aria-label="Refresh projects"
          title="Refresh projects"
        >
          {isLoadingProjects ? (
            <>
              <svg
                className="animate-spin w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Refreshing...
            </>
          ) : (
            <>
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Refresh
            </>
          )}
        </button>
      </div>

      {/* Error Messages */}
      {projectsError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm">{projectsError}</p>
        </div>
      )}

      {/* Projects Table */}
      <Table
        columns={columns}
        data={filteredProjects}
        renderExpandableContent={renderExpandableContent}
        isLoading={isLoadingProjects}
        emptyMessage="No projects found"
        getRowId={(project) => project._id}
        pagination={
          projectsResponse?.pagination
            ? {
                page: projectsResponse.pagination.page,
                limit: projectsResponse.pagination.limit,
                total: projectsResponse.pagination.total,
                totalPages: projectsResponse.pagination.totalPages,
                onPageChange: setPage,
              }
            : undefined
        }
      />
    </motion.section>
  );
};

export default MemberProjectsPage;

