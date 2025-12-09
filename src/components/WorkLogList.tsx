import React, { memo, useState, useCallback, useMemo } from 'react';
import { Update, UpdateType, DocumentType } from '../types/update.types';
import { Project } from '../types/project.types';
import { PaginationMeta } from '../types/api.types';
import Input from './Input';
import Select from './Select';
import Pagination from './Pagination';

interface WorkLogListProps {
  updates: Update[];
  projects: Project[];
  isLoading?: boolean;
  onRefresh?: () => void;
  pagination?: PaginationMeta;
  onPageChange?: (page: number) => void;
}

/**
 * WorkLogList component
 * Displays list of work log updates with filters and image gallery
 */
const WorkLogList = memo<WorkLogListProps>(
  ({ updates, projects, isLoading = false, onRefresh, pagination, onPageChange }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [projectFilter, setProjectFilter] = useState<string>('');
    const [updateTypeFilter, setUpdateTypeFilter] = useState<string>('');
    const [startDateFilter, setStartDateFilter] = useState<string>('');
    const [endDateFilter, setEndDateFilter] = useState<string>('');
    const [expandedUpdateId, setExpandedUpdateId] = useState<string | null>(null);

    const toggleExpand = useCallback((id: string) => {
      setExpandedUpdateId((prev) => (prev === id ? null : id));
    }, []);

    // Filter updates
    const filteredUpdates = useMemo(() => {
      let filtered = [...updates];

      // Project filter
      if (projectFilter) {
        filtered = filtered.filter((update) => {
          const projectId =
            typeof update.projectId === 'string' ? update.projectId : update.projectId._id;
          return projectId === projectFilter;
        });
      }

      // Update type filter
      if (updateTypeFilter) {
        filtered = filtered.filter((update) => update.updateType === updateTypeFilter);
      }

      // Date range filter
      if (startDateFilter) {
        const startDate = new Date(startDateFilter);
        startDate.setHours(0, 0, 0, 0);
        filtered = filtered.filter((update) => {
          const updateDate = new Date(update.updateDate);
          updateDate.setHours(0, 0, 0, 0);
          return updateDate >= startDate;
        });
      }

      if (endDateFilter) {
        const endDate = new Date(endDateFilter);
        endDate.setHours(23, 59, 59, 999);
        filtered = filtered.filter((update) => {
          const updateDate = new Date(update.updateDate);
          updateDate.setHours(0, 0, 0, 0);
          return updateDate <= endDate;
        });
      }

      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter((update) => {
          const projectName =
            typeof update.projectId === 'string'
              ? projects.find((p) => p._id === update.projectId)?.name || ''
              : update.projectId.name;
          const status = update.status.toLowerCase();
          const description = update.updateDescription?.toLowerCase() || '';

          return (
            projectName.toLowerCase().includes(query) ||
            status.includes(query) ||
            description.includes(query)
          );
        });
      }

      return filtered;
    }, [updates, projectFilter, updateTypeFilter, startDateFilter, endDateFilter, searchQuery, projects]);

    const formatDate = useCallback((dateString: string): string => {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    }, []);

    const formatTime = useCallback((dateString: string): string => {
      return new Date(dateString).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });
    }, []);

    const getProjectName = useCallback(
      (update: Update): string => {
        if (typeof update.projectId === 'string') {
          const project = projects.find((p) => p._id === update.projectId);
          return project?.name || 'Unknown Project';
        }
        return update.projectId.name;
      },
      [projects]
    );

    const getUpdateTypeBadgeColor = useCallback((type: UpdateType): string => {
      return type === UpdateType.MORNING
        ? 'bg-blue-100 text-blue-800'
        : 'bg-orange-100 text-orange-800';
    }, []);


    const projectOptions = [
      { value: '', label: 'All Projects' },
      ...projects.map((project) => ({
        value: project._id,
        label: project.name,
      })),
    ];

    const updateTypeOptions = [
      { value: '', label: 'All Types' },
      { value: UpdateType.MORNING, label: 'Morning' },
      { value: UpdateType.EVENING, label: 'Evening' },
    ];

    if (isLoading) {
      return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-[#00BFB6]" />
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Filters */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <Input
                label="Search"
                type="text"
                placeholder="Search by project, status, or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select
              label="Project"
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
              options={projectOptions}
            />
            <Select
              label="Update Type"
              value={updateTypeFilter}
              onChange={(e) => setUpdateTypeFilter(e.target.value)}
              options={updateTypeOptions}
            />
            <Input
              label="Start Date"
              type="date"
              value={startDateFilter}
              onChange={(e) => setStartDateFilter(e.target.value)}
            />
            <Input
              label="End Date"
              type="date"
              value={endDateFilter}
              onChange={(e) => setEndDateFilter(e.target.value)}
            />
          </div>
        </div>

        {/* Updates List */}
        <div className="space-y-4">
          {filteredUpdates.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 text-center">
              <p className="text-gray-500">No work logs found</p>
            </div>
          ) : (
            filteredUpdates.map((update) => (
              <div
                key={update._id}
                className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden"
              >
                {/* Header */}
                <div
                  className="p-4 cursor-pointer hover:bg-gray-50 transition duration-300"
                  onClick={() => toggleExpand(update._id)}
                >
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="text-lg font-semibold text-gray-800">
                          {getProjectName(update)}
                        </h3>
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getUpdateTypeBadgeColor(
                            update.updateType
                          )}`}
                        >
                          {update.updateType === UpdateType.MORNING ? 'Morning' : 'Evening'}
                        </span>
                        <span className="text-sm text-gray-600">
                          {formatDate(update.updateDate)} at {formatTime(update.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{update.status}</p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleExpand(update._id);
                      }}
                      className="p-2 rounded-lg hover:bg-gray-100 transition duration-300"
                      aria-label={expandedUpdateId === update._id ? 'Collapse' : 'Expand'}
                    >
                      <svg
                        className={`w-5 h-5 text-gray-600 transition-transform ${
                          expandedUpdateId === update._id ? 'rotate-180' : ''
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Expanded Content */}
                {expandedUpdateId === update._id && (
                  <div className="border-t border-gray-100 p-4 space-y-4">
                    {update.updateDescription && (
                      <div>
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                          Description
                        </div>
                        <p className="text-gray-800">{update.updateDescription}</p>
                      </div>
                    )}

                    {/* Documents/Images Gallery */}
                    {update.documents && update.documents.length > 0 && (
                      <div>
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                          Documents & Images ({update.documents.length})
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                          {update.documents.map((doc, index) => (
                            <div
                              key={doc._id || index}
                              className="relative group border border-gray-200 rounded-lg overflow-hidden flex flex-col"
                            >
                              {/* Image area with clickable link - only covers image, not overlay */}
                              <div className="relative flex-shrink-0" style={{ height: '128px' }}>
                                {doc.filePath && doc.mimeType?.startsWith('image/') ? (
                                  <>
                                    <img
                                      src={doc.filePath}
                                      alt={doc.fileName || `Document ${index + 1}`}
                                      className="w-full h-full object-cover"
                                    />
                                    {doc.filePath && (
                                      <a
                                        href={doc.filePath}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/20 transition duration-300 opacity-0 group-hover:opacity-100"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <svg
                                          className="w-6 h-6 text-white"
                                          fill="none"
                                          stroke="currentColor"
                                          viewBox="0 0 24 24"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                          />
                                        </svg>
                                      </a>
                                    )}
                                  </>
                                ) : (
                                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                    <svg
                                      className="w-8 h-8 text-gray-400"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                      />
                                    </svg>
                                  </div>
                                )}
                              </div>
                              {/* Overlay with metadata - separate from image link, always clickable */}
                              <div className="bg-black/60 text-white p-2 text-xs relative z-10">
                                <div className="flex items-center justify-between">
                                  <span className="truncate">{doc.fileName}</span>
                                </div>
                                {doc.description && (
                                  <p className="text-xs mt-1 line-clamp-1">{doc.description}</p>
                                )}
                                {doc.latitude !== undefined && doc.longitude !== undefined && (
                                  <div className="mt-1 flex items-center gap-1">
                                    <svg
                                      className="w-3 h-3"
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
                                    <span className="text-xs">
                                      {doc.latitude.toFixed(6)}, {doc.longitude.toFixed(6)}
                                    </span>
                                    <a
                                      href={`https://www.google.com/maps?q=${doc.latitude},${doc.longitude}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="ml-1 text-blue-300 hover:text-blue-100 underline text-xs relative z-20"
                                      title="View on Google Maps"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        window.open(`https://www.google.com/maps?q=${doc.latitude},${doc.longitude}`, '_blank', 'noopener,noreferrer');
                                      }}
                                    >
                                      Map
                                    </a>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Posted By Info */}
                    <div className="text-xs text-gray-500">
                      Posted by:{' '}
                      {typeof update.postedBy === 'string'
                        ? 'Loading...'
                        : update.postedBy.name}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {pagination && onPageChange && (
          <Pagination
            page={pagination.page}
            limit={pagination.limit}
            total={pagination.total}
            totalPages={pagination.totalPages}
            onPageChange={onPageChange}
          />
        )}
      </div>
    );
  }
);

WorkLogList.displayName = 'WorkLogList';

export default WorkLogList;

