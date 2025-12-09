import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useApi } from '../../hooks/useApi';
import {
  getAllProjects,
  createProject,
  updateProject,
  deleteProject,
} from '../../services/projectService';
import { getAllUsers } from '../../services/userService';
import {
  Project,
  CreateProjectRequest,
  UpdateProjectRequest,
  UserReference,
  ProjectStatus,
} from '../../types/project.types';
import { UserRole } from '../../types/common.types';
import { User } from '../../types/auth.types';
import Table from '../../components/Table';
import Modal from '../../components/Modal';
import ProjectForm from '../../components/ProjectForm';
import DeleteConfirmModal from '../../components/DeleteConfirmModal';
import Select from '../../components/Select';
import Input from '../../components/Input';
import { getMapUrl } from '../../utils/maps';

/**
 * ProjectsPage component
 * Main projects management page with table, search, filters, and CRUD modals
 */
const ProjectsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [contractorFilter, setContractorFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteProjectData, setDeleteProjectData] = useState<Project | null>(null);
  const [contractors, setContractors] = useState<User[]>([]);

  // Build filters object for API
  const apiFilters = useMemo(() => {
    const filters: { status?: string; contractorId?: string; page?: number; limit?: number } = {};
    if (statusFilter) filters.status = statusFilter;
    if (contractorFilter) filters.contractorId = contractorFilter;
    filters.page = page;
    filters.limit = 10;
    return filters;
  }, [statusFilter, contractorFilter, page]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [statusFilter, contractorFilter]);

  // Fetch contractors for filter dropdown
  useEffect(() => {
    const fetchContractors = async () => {
      try {
        const response = await getAllUsers({ role: UserRole.CONTRACTOR });
        setContractors(response.data || []);
      } catch (error) {
        console.error('Failed to fetch contractors:', error);
      }
    };
    fetchContractors();
  }, []);

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

  // Create project
  const {
    isLoading: isCreating,
    execute: executeCreate,
    error: createError,
    clearError: clearCreateError,
  } = useApi(createProject);

  // Update project wrapper
  const updateProjectWrapper = useCallback(
    async (...args: unknown[]) => {
      return updateProject(args[0] as string, args[1] as UpdateProjectRequest);
    },
    []
  );

  // Update project
  const {
    isLoading: isUpdating,
    execute: executeUpdate,
    error: updateError,
    clearError: clearUpdateError,
  } = useApi(updateProjectWrapper);

  // Delete project wrapper
  const deleteProjectWrapper = useCallback(async (...args: unknown[]) => {
    return deleteProject(args[0] as string);
  }, []);

  // Delete project
  const {
    isLoading: isDeleting,
    execute: executeDelete,
    error: deleteError,
    clearError: clearDeleteError,
  } = useApi(deleteProjectWrapper);

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
  const getUserName = useCallback((userRef: string | UserReference | null | undefined): string => {
    if (!userRef) return 'Not assigned';
    if (typeof userRef === 'string') return 'Loading...';
    return userRef.name;
  }, []);

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

  // Handle create project
  const handleCreateProject = useCallback(
    async (data: CreateProjectRequest | UpdateProjectRequest) => {
      clearCreateError();
      await executeCreate(data as CreateProjectRequest);
      setIsCreateModalOpen(false);
      fetchProjects(); // Refresh list
    },
    [executeCreate, fetchProjects, clearCreateError]
  );

  // Handle edit project
  const handleEditProject = useCallback(
    async (data: CreateProjectRequest | UpdateProjectRequest) => {
      if (!selectedProject) return;
      clearUpdateError();
      await executeUpdate(selectedProject._id, data as UpdateProjectRequest);
      setIsEditModalOpen(false);
      setSelectedProject(null);
      fetchProjects(); // Refresh list
    },
    [selectedProject, executeUpdate, fetchProjects, clearUpdateError]
  );

  // Handle delete project
  const handleDeleteProject = useCallback(async () => {
    if (!deleteProjectData) return;
    clearDeleteError();
    await executeDelete(deleteProjectData._id);
    setIsDeleteModalOpen(false);
    setDeleteProjectData(null);
    fetchProjects(); // Refresh list
  }, [deleteProjectData, executeDelete, fetchProjects, clearDeleteError]);

  // Open edit modal
  const handleEditClick = useCallback((project: Project) => {
    setSelectedProject(project);
    setIsEditModalOpen(true);
  }, []);

  // Open delete modal
  const handleDeleteClick = useCallback((project: Project) => {
    setDeleteProjectData(project);
    setIsDeleteModalOpen(true);
  }, []);

  // Get status badge color
  const getStatusColor = useCallback((status: ProjectStatus): string => {
    switch (status) {
      case ProjectStatus.PLANNING:
        return 'bg-blue-100 text-blue-800';
      case ProjectStatus.IN_PROGRESS:
        return 'bg-green-100 text-green-800';
      case ProjectStatus.ON_HOLD:
        return 'bg-yellow-100 text-yellow-800';
      case ProjectStatus.COMPLETED:
        return 'bg-gray-100 text-gray-800';
      case ProjectStatus.CANCELLED:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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
      key: 'contractor',
      header: 'Contractor',
      render: (project: Project) => (
        <div className="text-gray-600">{getUserName(project.contractorId)}</div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (project: Project) => (
        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
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
          {project.contractorId && (
            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                Contractor
              </div>
              <div className="text-gray-800">{getUserName(project.contractorId)}</div>
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
          {project.location && (
            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                Location
              </div>
              <a
                href={getMapUrl(project.location)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#00BFB6] hover:text-[#00a8a0] hover:underline transition duration-300 flex items-center gap-1.5 group"
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
                <span className="text-gray-800 group-hover:text-[#00BFB6]">
                  {project.location}
                </span>
              </a>
            </div>
          )}
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
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              Updated At
            </div>
            <div className="text-gray-800">{formatDate(project.updatedAt)}</div>
          </div>
        </div>
      );
    },
    [getUserName, formatCurrency, formatDate]
  );

  // Render action buttons
  const renderActions = useCallback(
    (project: Project) => {
      return (
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => handleEditClick(project)}
            className="p-2 rounded-lg bg-[#00BFB6]/10 text-[#00BFB6] hover:bg-[#00BFB6]/20 transition duration-300"
            aria-label="Edit project"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </button>
          <button
            onClick={() => handleDeleteClick(project)}
            className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition duration-300"
            aria-label="Delete project"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      );
    },
    [handleEditClick, handleDeleteClick]
  );

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: ProjectStatus.PLANNING, label: 'Planning' },
    { value: ProjectStatus.IN_PROGRESS, label: 'In Progress' },
    { value: ProjectStatus.ON_HOLD, label: 'On Hold' },
    { value: ProjectStatus.COMPLETED, label: 'Completed' },
    { value: ProjectStatus.CANCELLED, label: 'Cancelled' },
  ];

  const contractorOptions = [
    { value: '', label: 'All Contractors' },
    ...contractors.map((contractor) => ({
      value: contractor._id,
      label: contractor.name,
    })),
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
          <div className="md:w-48">
            <Select
              label="Contractor"
              value={contractorFilter}
              onChange={(e) => setContractorFilter(e.target.value)}
              options={contractorOptions}
            />
          </div>
        </div>
      </div>

      {/* Table Header with Create Button */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-800">
          Projects ({filteredProjects.length})
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchProjects()}
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
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 bg-gradient-to-r from-[#00BFB6] to-[#00a8a0] text-white font-medium rounded-lg hover:shadow-lg transition duration-300 flex items-center gap-2 text-sm"
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
                d="M12 4v16m8-8H4"
              />
            </svg>
            Create Project
          </button>
        </div>
      </div>

      {/* Error Messages */}
      {(projectsError || createError || updateError || deleteError) && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm">
            {projectsError ||
              createError ||
              updateError ||
              deleteError ||
              'An error occurred'}
          </p>
        </div>
      )}

      {/* Projects Table */}
      <Table
        columns={columns}
        data={filteredProjects}
        renderExpandableContent={renderExpandableContent}
        renderActions={renderActions}
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

      {/* Create Project Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          clearCreateError();
        }}
        title="Create New Project"
        size="lg"
      >
        <ProjectForm
          onSubmit={handleCreateProject}
          onCancel={() => {
            setIsCreateModalOpen(false);
            clearCreateError();
          }}
          isLoading={isCreating}
        />
      </Modal>

      {/* Edit Project Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedProject(null);
          clearUpdateError();
        }}
        title="Edit Project"
        size="lg"
      >
        {selectedProject && (
          <ProjectForm
            project={selectedProject}
            onSubmit={handleEditProject}
            onCancel={() => {
              setIsEditModalOpen(false);
              setSelectedProject(null);
              clearUpdateError();
            }}
            isLoading={isUpdating}
          />
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeleteProjectData(null);
          clearDeleteError();
        }}
        onConfirm={handleDeleteProject}
        itemName={deleteProjectData?.name || ''}
        itemType="project"
        isLoading={isDeleting}
      />
    </motion.section>
  );
};

export default ProjectsPage;

