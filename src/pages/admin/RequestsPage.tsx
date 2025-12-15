import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useApi } from '../../hooks/useApi';
import {
  getRequests,
  approveRequest,
  rejectRequest,
} from '../../services/requestService';
import {
  ProjectRequest,
  RequestType,
  RequestStatus,
  UserReference,
  ProjectReference,
} from '../../types/request.types';
import Table from '../../components/Table';
import Modal from '../../components/Modal';
import RequestActionForm from '../../components/RequestActionForm';
import Select from '../../components/Select';
import Input from '../../components/Input';
import { getRequestStatusColor, getRequestTypeColor } from '../../utils/badgeColors';

/**
 * RequestsPage component
 * Main requests management page with table, search, filters, and action modals
 * Allows admins to view, approve, and reject project requests
 */
const RequestsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [selectedRequest, setSelectedRequest] = useState<ProjectRequest | null>(null);
  const [actionModalType, setActionModalType] = useState<'approve' | 'reject' | null>(null);

  // Build filters object for API
  const apiFilters = useMemo(() => {
    const filters: { status?: string; type?: string; page?: number; limit?: number } = {};
    if (statusFilter) filters.status = statusFilter;
    if (typeFilter) filters.type = typeFilter;
    filters.page = page;
    filters.limit = 10;
    return filters;
  }, [statusFilter, typeFilter, page]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [statusFilter, typeFilter]);

  // Fetch requests function - memoized to prevent unnecessary re-renders
  const fetchRequestsFn = useCallback(() => {
    return getRequests(apiFilters);
  }, [apiFilters]);

  // Fetch requests
  const {
    data: requestsResponse,
    isLoading: isLoadingRequests,
    error: requestsError,
    execute: fetchRequests,
  } = useApi(fetchRequestsFn);

  // Approve request wrapper
  const approveRequestWrapper = useCallback(
    async (...args: unknown[]) => {
      const [requestId, data] = args as [string, { approvedEndDate?: string; adminNotes?: string }];
      return approveRequest(requestId, data);
    },
    []
  );

  // Approve request
  const {
    isLoading: isApproving,
    execute: executeApprove,
    error: approveError,
    clearError: clearApproveError,
  } = useApi(approveRequestWrapper);

  // Reject request wrapper
  const rejectRequestWrapper = useCallback(
    async (...args: unknown[]) => {
      const [requestId, data] = args as [string, { adminNotes?: string }];
      return rejectRequest(requestId, data);
    },
    []
  );

  // Reject request
  const {
    isLoading: isRejecting,
    execute: executeReject,
    error: rejectError,
    clearError: clearRejectError,
  } = useApi(rejectRequestWrapper);

  // Fetch requests when filters change
  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // Filter requests by search query (client-side)
  const filteredRequests = useMemo(() => {
    if (!requestsResponse?.data) return [];
    if (!searchQuery.trim()) return requestsResponse.data;

    const query = searchQuery.toLowerCase();
    return requestsResponse.data.filter((request) => {
      const projectRef =
        typeof request.projectId === 'object' ? request.projectId : null;
      const requestedByRef =
        typeof request.requestedBy === 'object' ? request.requestedBy : null;
      const projectName = projectRef?.name || '';
      const contractorName = requestedByRef?.name || '';
      const reason = request.reason || '';

      return (
        projectName.toLowerCase().includes(query) ||
        contractorName.toLowerCase().includes(query) ||
        reason.toLowerCase().includes(query) ||
        request.type.toLowerCase().includes(query) ||
        request.status.toLowerCase().includes(query)
      );
    });
  }, [requestsResponse?.data, searchQuery]);

  // Helper function to get user name from reference
  const getUserName = useCallback(
    (userRef: string | UserReference | null | undefined): string => {
      if (!userRef) return 'Unknown';
      if (typeof userRef === 'string') return 'Loading...';
      return userRef.name;
    },
    []
  );

  // Helper function to get project name from reference
  const getProjectName = useCallback(
    (projectRef: string | ProjectReference | null | undefined): string => {
      if (!projectRef) return 'Unknown';
      if (typeof projectRef === 'string') return 'Loading...';
      return projectRef.name;
    },
    []
  );

  // Helper function to format date
  const formatDate = useCallback((dateString?: string): string => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString();
  }, []);

  // Handle approve request
  const handleApproveRequest = useCallback(
    async (data: { approvedEndDate?: string; adminNotes?: string }) => {
      if (!selectedRequest) return;
      clearApproveError();
      await executeApprove(selectedRequest._id, data);
      setActionModalType(null);
      setSelectedRequest(null);
      fetchRequests(); // Refresh list
    },
    [selectedRequest, executeApprove, fetchRequests, clearApproveError]
  );

  // Handle reject request
  const handleRejectRequest = useCallback(
    async (data: { adminNotes?: string }) => {
      if (!selectedRequest) return;
      clearRejectError();
      await executeReject(selectedRequest._id, data);
      setActionModalType(null);
      setSelectedRequest(null);
      fetchRequests(); // Refresh list
    },
    [selectedRequest, executeReject, fetchRequests, clearRejectError]
  );

  // Open approve modal
  const handleApproveClick = useCallback((request: ProjectRequest) => {
    if (request.status !== RequestStatus.PENDING) return;
    setSelectedRequest(request);
    setActionModalType('approve');
  }, []);

  // Open reject modal
  const handleRejectClick = useCallback((request: ProjectRequest) => {
    if (request.status !== RequestStatus.PENDING) return;
    setSelectedRequest(request);
    setActionModalType('reject');
  }, []);

  // Table columns
  const columns = [
    {
      key: 'project',
      header: 'Project',
      render: (request: ProjectRequest) => (
        <div className="font-semibold text-gray-800">
          {getProjectName(request.projectId)}
        </div>
      ),
    },
    {
      key: 'requestedBy',
      header: 'Requested By',
      render: (request: ProjectRequest) => (
        <div className="text-gray-600">{getUserName(request.requestedBy)}</div>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      render: (request: ProjectRequest) => (
        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getRequestTypeColor(
            request.type
          )}`}
        >
          {request.type.charAt(0).toUpperCase() + request.type.slice(1)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (request: ProjectRequest) => (
        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getRequestStatusColor(
            request.status
          )}`}
        >
          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
        </span>
      ),
    },
    {
      key: 'requestedDate',
      header: 'Requested Date',
      render: (request: ProjectRequest) => (
        <div className="text-gray-600">
          {request.type === RequestType.EXTENSION && request.requestedEndDate
            ? formatDate(request.requestedEndDate)
            : '-'}
        </div>
      ),
    },
    {
      key: 'createdAt',
      header: 'Created At',
      render: (request: ProjectRequest) => (
        <div className="text-gray-600">{formatDate(request.createdAt)}</div>
      ),
    },
  ];

  // Render expandable content
  const renderExpandableContent = useCallback(
    (request: ProjectRequest) => {
      const projectRef =
        typeof request.projectId === 'object' ? request.projectId : null;
      const requestedByRef =
        typeof request.requestedBy === 'object' ? request.requestedBy : null;
      const reviewedByRef =
        typeof request.reviewedBy === 'object' ? request.reviewedBy : null;

      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              Project
            </div>
            <div className="text-gray-800">{getProjectName(request.projectId)}</div>
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              Requested By
            </div>
            <div className="text-gray-800">{getUserName(request.requestedBy)}</div>
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              Type
            </div>
            <div className="text-gray-800 capitalize">{request.type}</div>
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              Status
            </div>
            <div className="text-gray-800 capitalize">{request.status}</div>
          </div>
          {request.type === RequestType.EXTENSION && (
            <>
              {request.requestedEndDate && (
                <div>
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    Requested End Date
                  </div>
                  <div className="text-gray-800">
                    {formatDate(request.requestedEndDate)}
                  </div>
                </div>
              )}
              {request.approvedEndDate && (
                <div>
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    Approved End Date
                  </div>
                  <div className="text-gray-800">
                    {formatDate(request.approvedEndDate)}
                  </div>
                </div>
              )}
              {projectRef?.endDate && (
                <div>
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    Current Project End Date
                  </div>
                  <div className="text-gray-800">{formatDate(projectRef.endDate)}</div>
                </div>
              )}
            </>
          )}
          {request.reason && (
            <div className="md:col-span-2">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                Reason
              </div>
              <div className="text-gray-800">{request.reason}</div>
            </div>
          )}
          {request.adminNotes && (
            <div className="md:col-span-2">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                Admin Notes
              </div>
              <div className="text-gray-800">{request.adminNotes}</div>
            </div>
          )}
          {reviewedByRef && (
            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                Reviewed By
              </div>
              <div className="text-gray-800">{getUserName(request.reviewedBy)}</div>
            </div>
          )}
          {request.reviewedAt && (
            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                Reviewed At
              </div>
              <div className="text-gray-800">{formatDate(request.reviewedAt)}</div>
            </div>
          )}
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              Created At
            </div>
            <div className="text-gray-800">{formatDate(request.createdAt)}</div>
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              Updated At
            </div>
            <div className="text-gray-800">{formatDate(request.updatedAt)}</div>
          </div>
        </div>
      );
    },
    [getProjectName, getUserName, formatDate]
  );

  // Render action buttons
  const renderActions = useCallback(
    (request: ProjectRequest) => {
      const isPending = request.status === RequestStatus.PENDING;

      return (
        <div className="flex items-center justify-end gap-2">
          {isPending && (
            <>
              <button
                onClick={() => handleApproveClick(request)}
                className="p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition duration-300"
                aria-label="Approve request"
                title="Approve request"
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
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </button>
              <button
                onClick={() => handleRejectClick(request)}
                className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition duration-300"
                aria-label="Reject request"
                title="Reject request"
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </>
          )}
          {!isPending && (
            <span className="text-xs text-gray-500 italic">
              {request.status === RequestStatus.APPROVED ? 'Approved' : 'Rejected'}
            </span>
          )}
        </div>
      );
    },
    [handleApproveClick, handleRejectClick]
  );

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: RequestStatus.PENDING, label: 'Pending' },
    { value: RequestStatus.APPROVED, label: 'Approved' },
    { value: RequestStatus.REJECTED, label: 'Rejected' },
  ];

  const typeOptions = [
    { value: '', label: 'All Types' },
    { value: RequestType.COMPLETION, label: 'Completion' },
    { value: RequestType.EXTENSION, label: 'Extension' },
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
              label="Search Requests"
              type="text"
              placeholder="Search by project, contractor, reason..."
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
              label="Type"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              options={typeOptions}
            />
          </div>
        </div>
      </div>

      {/* Table Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-800">
          Requests ({filteredRequests.length})
        </h3>
        <button
          onClick={() => fetchRequests()}
          disabled={isLoadingRequests}
          className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition duration-300 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2 font-medium text-sm"
          aria-label="Refresh requests"
          title="Refresh requests"
        >
          {isLoadingRequests ? (
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
      {(requestsError || approveError || rejectError) && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm">
            {requestsError || approveError || rejectError || 'An error occurred'}
          </p>
        </div>
      )}

      {/* Requests Table */}
      <Table
        columns={columns}
        data={filteredRequests}
        renderExpandableContent={renderExpandableContent}
        renderActions={renderActions}
        isLoading={isLoadingRequests}
        emptyMessage="No requests found"
        getRowId={(request) => request._id}
        pagination={
          requestsResponse?.pagination
            ? {
                page: requestsResponse.pagination.page,
                limit: requestsResponse.pagination.limit,
                total: requestsResponse.pagination.total,
                totalPages: requestsResponse.pagination.totalPages,
                onPageChange: setPage,
              }
            : undefined
        }
      />

      {/* Approve Request Modal */}
      {actionModalType === 'approve' && selectedRequest && (
        <Modal
          isOpen={true}
          onClose={() => {
            setActionModalType(null);
            setSelectedRequest(null);
            clearApproveError();
          }}
          title="Approve Request"
          size="lg"
        >
          <RequestActionForm
            request={selectedRequest}
            action="approve"
            onSubmit={handleApproveRequest}
            onCancel={() => {
              setActionModalType(null);
              setSelectedRequest(null);
              clearApproveError();
            }}
            isLoading={isApproving}
          />
        </Modal>
      )}

      {/* Reject Request Modal */}
      {actionModalType === 'reject' && selectedRequest && (
        <Modal
          isOpen={true}
          onClose={() => {
            setActionModalType(null);
            setSelectedRequest(null);
            clearRejectError();
          }}
          title="Reject Request"
          size="lg"
        >
          <RequestActionForm
            request={selectedRequest}
            action="reject"
            onSubmit={handleRejectRequest}
            onCancel={() => {
              setActionModalType(null);
              setSelectedRequest(null);
              clearRejectError();
            }}
            isLoading={isRejecting}
          />
        </Modal>
      )}
    </motion.section>
  );
};

export default RequestsPage;

