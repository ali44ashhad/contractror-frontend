import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useApi } from '../../hooks/useApi';
import { useAuth } from '../../hooks/useAuth';
import { getAllProjects } from '../../services/projectService';
import {
  createCompletionRequest,
  createExtensionRequest,
  getRequests,
  cancelRequest,
} from '../../services/requestService';
import {
  Project,
  UserReference,
  ProjectStatus,
} from '../../types/project.types';
import {
  CreateCompletionRequest,
  CreateExtensionRequest,
  ProjectRequest,
  RequestStatus,
  RequestType,
} from '../../types/request.types';
import Table from '../../components/Table';
import Modal from '../../components/Modal';
import CompletionRequestForm from '../../components/CompletionRequestForm';
import ExtensionRequestForm from '../../components/ExtensionRequestForm';
import Select from '../../components/Select';
import Input from '../../components/Input';
import { getMapUrl } from '../../utils/maps';
import { getProjectStatusColor } from '../../utils/badgeColors';

/**
 * ContractorProjectsPage component
 * Projects management page for contractors showing only their assigned projects
 * Includes Complete and Extend request functionality
 */
const ContractorProjectsPage: React.FC = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isCompletionModalOpen, setIsCompletionModalOpen] = useState(false);
  const [isExtensionModalOpen, setIsExtensionModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [requestToCancel, setRequestToCancel] = useState<ProjectRequest | null>(null);

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

  // Create completion request wrapper
  const createCompletionRequestWrapper = useCallback(
    async (...args: unknown[]) => {
      return createCompletionRequest(args[0] as CreateCompletionRequest);
    },
    []
  );

  // Create completion request
  const {
    isLoading: isCreatingCompletion,
    execute: executeCreateCompletion,
    error: completionError,
    clearError: clearCompletionError,
  } = useApi(createCompletionRequestWrapper);

  // Create extension request wrapper
  const createExtensionRequestWrapper = useCallback(
    async (...args: unknown[]) => {
      return createExtensionRequest(args[0] as CreateExtensionRequest);
    },
    []
  );

  // Create extension request
  const {
    isLoading: isCreatingExtension,
    execute: executeCreateExtension,
    error: extensionError,
    clearError: clearExtensionError,
  } = useApi(createExtensionRequestWrapper);

  // Cancel request wrapper
  const cancelRequestWrapper = useCallback(
    async (...args: unknown[]) => {
      return cancelRequest(args[0] as string);
    },
    []
  );

  // Cancel request
  const {
    isLoading: isCanceling,
    execute: executeCancel,
    error: cancelError,
    clearError: clearCancelError,
  } = useApi(cancelRequestWrapper);

  // Fetch pending requests function - memoized to prevent unnecessary re-renders
  const fetchPendingRequestsFn = useCallback(() => {
    if (!user?._id) {
      return Promise.resolve({ success: true, data: [], count: 0 });
    }
    return getRequests({
      status: RequestStatus.PENDING,
      requestedBy: user._id,
    });
  }, [user?._id]);

  // Fetch pending requests
  const {
    data: pendingRequestsResponse,
    isLoading: isLoadingPendingRequests,
    execute: fetchPendingRequests,
  } = useApi(fetchPendingRequestsFn);

  // Create map of projectId -> pendingRequest for quick lookup
  const pendingRequestsMap = useMemo(() => {
    const map = new Map<string, ProjectRequest>();
    if (pendingRequestsResponse?.data) {
      pendingRequestsResponse.data.forEach((request) => {
        const projectId =
          typeof request.projectId === 'string'
            ? request.projectId
            : request.projectId._id;
        map.set(projectId, request);
      });
    }
    return map;
  }, [pendingRequestsResponse?.data]);

  // Fetch projects when filters change
  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Fetch pending requests when user is available
  useEffect(() => {
    if (user?._id) {
      fetchPendingRequests();
    }
  }, [user?._id, fetchPendingRequests]);

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

  // Handle create completion request
  const handleCreateCompletionRequest = useCallback(
    async (data: CreateCompletionRequest) => {
      clearCompletionError();
      await executeCreateCompletion(data);
      setIsCompletionModalOpen(false);
      setSelectedProject(null);
      fetchProjects(); // Refresh list
      fetchPendingRequests(); // Refresh pending requests
    },
    [executeCreateCompletion, fetchProjects, fetchPendingRequests, clearCompletionError]
  );

  // Handle create extension request
  const handleCreateExtensionRequest = useCallback(
    async (data: CreateExtensionRequest) => {
      clearExtensionError();
      await executeCreateExtension(data);
      setIsExtensionModalOpen(false);
      setSelectedProject(null);
      fetchProjects(); // Refresh list
      fetchPendingRequests(); // Refresh pending requests
    },
    [executeCreateExtension, fetchProjects, fetchPendingRequests, clearExtensionError]
  );

  // Open completion modal
  const handleCompleteClick = useCallback((project: Project) => {
    setSelectedProject(project);
    setIsCompletionModalOpen(true);
  }, []);

  // Open extension modal
  const handleExtendClick = useCallback((project: Project) => {
    setSelectedProject(project);
    setIsExtensionModalOpen(true);
  }, []);

  // Open cancel confirmation modal
  const handleCancelRequestClick = useCallback((request: ProjectRequest) => {
    setRequestToCancel(request);
    setIsCancelModalOpen(true);
  }, []);

  // Handle confirm cancel request
  const handleConfirmCancel = useCallback(
    async () => {
      if (!requestToCancel) return;
      clearCancelError();
      await executeCancel(requestToCancel._id);
      setIsCancelModalOpen(false);
      setRequestToCancel(null);
      fetchProjects(); // Refresh list
      fetchPendingRequests(); // Refresh pending requests
    },
    [requestToCancel, executeCancel, fetchProjects, fetchPendingRequests, clearCancelError]
  );

  // Handle close cancel modal
  const handleCloseCancelModal = useCallback(() => {
    setIsCancelModalOpen(false);
    setRequestToCancel(null);
    clearCancelError();
  }, [clearCancelError]);

  // Get pending request badge
  const getPendingRequestBadge = useCallback(
    (project: Project) => {
      const pendingRequest = pendingRequestsMap.get(project._id);
      if (!pendingRequest) {
        return null;
      }

      const badgeText =
        pendingRequest.type === RequestType.COMPLETION
          ? 'Pending Completion'
          : 'Pending Extension';

      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
          {badgeText}
        </span>
      );
    },
    [pendingRequestsMap]
  );

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
      key: 'pendingRequest',
      header: 'Request Status',
      render: (project: Project) => {
        const badge = getPendingRequestBadge(project);
        return badge || <span className="text-gray-400 text-sm">-</span>;
      },
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
      const pendingRequest = pendingRequestsMap.get(project._id);

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
          {pendingRequest && (
            <div className="md:col-span-2 mt-4 pt-4 border-t border-gray-200">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs font-semibold text-yellow-800 uppercase tracking-wider">
                    Pending Request
                  </div>
                  <button
                    onClick={() => handleCancelRequestClick(pendingRequest)}
                    disabled={isCanceling}
                    className="px-3 py-1.5 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition duration-300 font-medium text-xs flex items-center gap-1.5 disabled:opacity-60 disabled:cursor-not-allowed"
                    aria-label="Cancel request"
                    title="Cancel pending request"
                  >
                    {isCanceling ? (
                      <>
                        <svg
                          className="animate-spin w-3.5 h-3.5"
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
                        Canceling...
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-3.5 h-3.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                        Cancel
                      </>
                    )}
                  </button>
                </div>
                <div className="space-y-2">
                  <div>
                    <span className="font-semibold text-gray-700">Type: </span>
                    <span className="text-gray-800 capitalize">
                      {pendingRequest.type === RequestType.COMPLETION
                        ? 'Completion'
                        : 'Extension'}
                    </span>
                  </div>
                  {pendingRequest.type === RequestType.EXTENSION &&
                    pendingRequest.requestedEndDate && (
                      <div>
                        <span className="font-semibold text-gray-700">
                          Requested End Date:{' '}
                        </span>
                        <span className="text-gray-800">
                          {formatDate(pendingRequest.requestedEndDate)}
                        </span>
                      </div>
                    )}
                  {pendingRequest.reason && (
                    <div>
                      <span className="font-semibold text-gray-700">Reason: </span>
                      <span className="text-gray-800">{pendingRequest.reason}</span>
                    </div>
                  )}
                  <div>
                    <span className="font-semibold text-gray-700">Requested At: </span>
                    <span className="text-gray-800">
                      {formatDate(pendingRequest.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      );
    },
    [
      getUserName,
      formatCurrency,
      formatDate,
      pendingRequestsMap,
      handleCancelRequestClick,
      isCanceling,
    ]
  );

  // Render action buttons
  const renderActions = useCallback(
    (project: Project) => {
      const isInProgress = project.status === ProjectStatus.IN_PROGRESS;
      const hasPendingRequest = pendingRequestsMap.has(project._id);
      const pendingRequest = pendingRequestsMap.get(project._id);

      return (
        <div className="flex items-center justify-end gap-2">
          {isInProgress && (
            <>
              {hasPendingRequest && pendingRequest ? (
                <button
                  onClick={() => handleCancelRequestClick(pendingRequest)}
                  disabled={isCanceling}
                  className="px-3 py-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition duration-300 font-medium text-xs flex items-center gap-1.5 disabled:opacity-60 disabled:cursor-not-allowed"
                  aria-label="Cancel request"
                  title="Cancel pending request"
                >
                  {isCanceling ? (
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
                      Canceling...
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
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                      Cancel
                    </>
                  )}
                </button>
              ) : (
                <>
                  <button
                    onClick={() => handleCompleteClick(project)}
                    disabled={hasPendingRequest}
                    className={`px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition duration-300 ${
                      hasPendingRequest
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-60'
                        : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                    }`}
                    aria-label="Request completion"
                    title={
                      hasPendingRequest
                        ? 'A pending request already exists for this project'
                        : 'Request completion'
                    }
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
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Complete
                  </button>
                  <button
                    onClick={() => handleExtendClick(project)}
                    disabled={hasPendingRequest}
                    className={`px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition duration-300 ${
                      hasPendingRequest
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-60'
                        : 'bg-[#2563EB]/10 text-[#2563EB] hover:bg-[#2563EB]/20'
                    }`}
                    aria-label="Request extension"
                    title={
                      hasPendingRequest
                        ? 'A pending request already exists for this project'
                        : 'Request extension'
                    }
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
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Extend
                  </button>
                </>
              )}
            </>
          )}
        </div>
      );
    },
    [
      handleCompleteClick,
      handleExtendClick,
      handleCancelRequestClick,
      pendingRequestsMap,
      isCanceling,
    ]
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
            fetchPendingRequests();
          }}
          disabled={isLoadingProjects || isLoadingPendingRequests}
          className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition duration-300 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2 font-medium text-sm"
          aria-label="Refresh projects"
          title="Refresh projects"
        >
          {isLoadingProjects || isLoadingPendingRequests ? (
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
      {(projectsError || completionError || extensionError || cancelError) && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm">
            {projectsError ||
              completionError ||
              extensionError ||
              cancelError ||
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

      {/* Completion Request Modal */}
      <Modal
        isOpen={isCompletionModalOpen}
        onClose={() => {
          setIsCompletionModalOpen(false);
          setSelectedProject(null);
          clearCompletionError();
        }}
        title="Request Project Completion"
        size="lg"
      >
        {selectedProject && (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Project:</p>
              <p className="font-semibold text-gray-800">{selectedProject.name}</p>
            </div>
            <CompletionRequestForm
              projectId={selectedProject._id}
              onSubmit={handleCreateCompletionRequest}
              onCancel={() => {
                setIsCompletionModalOpen(false);
                setSelectedProject(null);
                clearCompletionError();
              }}
              isLoading={isCreatingCompletion}
            />
          </div>
        )}
      </Modal>

      {/* Extension Request Modal */}
      <Modal
        isOpen={isExtensionModalOpen}
        onClose={() => {
          setIsExtensionModalOpen(false);
          setSelectedProject(null);
          clearExtensionError();
        }}
        title="Request Project Extension"
        size="lg"
      >
        {selectedProject && (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Project:</p>
              <p className="font-semibold text-gray-800">{selectedProject.name}</p>
            </div>
            <ExtensionRequestForm
              projectId={selectedProject._id}
              currentEndDate={selectedProject.endDate}
              onSubmit={handleCreateExtensionRequest}
              onCancel={() => {
                setIsExtensionModalOpen(false);
                setSelectedProject(null);
                clearExtensionError();
              }}
              isLoading={isCreatingExtension}
            />
          </div>
        )}
      </Modal>

      {/* Cancel Request Confirmation Modal */}
      <Modal
        isOpen={isCancelModalOpen}
        onClose={handleCloseCancelModal}
        title="Cancel Request"
        size="md"
      >
        {requestToCancel && (
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-gray-700 mb-3">
                Are you sure you want to cancel this request? This action cannot be undone.
              </p>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-semibold text-gray-700">Project: </span>
                  <span className="text-gray-800">
                    {typeof requestToCancel.projectId === 'object'
                      ? requestToCancel.projectId.name
                      : 'Loading...'}
                  </span>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Request Type: </span>
                  <span className="text-gray-800 capitalize">
                    {requestToCancel.type === RequestType.COMPLETION
                      ? 'Completion'
                      : 'Extension'}
                  </span>
                </div>
                {requestToCancel.type === RequestType.EXTENSION &&
                  requestToCancel.requestedEndDate && (
                    <div>
                      <span className="font-semibold text-gray-700">
                        Requested End Date:{' '}
                      </span>
                      <span className="text-gray-800">
                        {formatDate(requestToCancel.requestedEndDate)}
                      </span>
                    </div>
                  )}
                {requestToCancel.reason && (
                  <div>
                    <span className="font-semibold text-gray-700">Reason: </span>
                    <span className="text-gray-800">{requestToCancel.reason}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={handleConfirmCancel}
                disabled={isCanceling}
                className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold px-6 py-3 rounded-lg hover:shadow-lg transition duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isCanceling ? 'Canceling...' : 'Cancel Request'}
              </button>
              <button
                onClick={handleCloseCancelModal}
                disabled={isCanceling}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Keep Request
              </button>
            </div>
          </div>
        )}
      </Modal>
    </motion.section>
  );
};

export default ContractorProjectsPage;

