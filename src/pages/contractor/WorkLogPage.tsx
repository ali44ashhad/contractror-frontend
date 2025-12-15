import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useApi } from '../../hooks/useApi';
import { getAllProjects } from '../../services/projectService';
import {
  createUpdate,
  getUpdates,
} from '../../services/updateService';
import {
  CreateUpdateRequest,
  DocumentMetadataInput,
} from '../../types/update.types';
import { Project, ProjectStatus } from '../../types/project.types';
import { useAuth } from '../../hooks/useAuth';
import WorkLogForm from '../../components/WorkLogForm';
import WorkLogList from '../../components/WorkLogList';

/**
 * WorkLogPage component
 * Main work log page with Log Work and View History sections
 */
const WorkLogPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'log' | 'history'>('log');
  const [projects, setProjects] = useState<Project[]>([]);

  // Fetch projects
  const fetchProjectsFn = useCallback(() => {
    return getAllProjects({ status: ProjectStatus.IN_PROGRESS });
  }, []);

  const {
    data: projectsResponse,
    isLoading: isLoadingProjects,
    execute: fetchProjects,
  } = useApi(fetchProjectsFn);

  const [updatesPage, setUpdatesPage] = useState(1);

  // Fetch updates for history
  const fetchUpdatesFn = useCallback(() => {
    return getUpdates({ postedBy: user?._id, page: updatesPage, limit: 10 });
  }, [user?._id, updatesPage]);

  const {
    data: updatesResponse,
    isLoading: isLoadingUpdates,
    execute: fetchUpdates,
  } = useApi(fetchUpdatesFn);

  // Create update wrapper
  const createUpdateWrapper = useCallback(
    async (...args: unknown[]) => {
      const [data, files, documentMetadata] = args as [
        CreateUpdateRequest,
        File[],
        DocumentMetadataInput[]
      ];
      return createUpdate(data, files, documentMetadata);
    },
    []
  );

  const {
    isLoading: isCreating,
    execute: executeCreate,
    error: createError,
    clearError: clearCreateError,
  } = useApi(createUpdateWrapper);

  // Load projects on mount
  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Load updates when viewing history
  useEffect(() => {
    if (activeTab === 'history') {
      fetchUpdates();
    }
  }, [activeTab, fetchUpdates]);

  // Reset to page 1 when switching to history tab
  useEffect(() => {
    if (activeTab === 'history') {
      setUpdatesPage(1);
    }
  }, [activeTab]);

  // Update projects state when response changes
  useEffect(() => {
    if (projectsResponse?.data) {
      setProjects(projectsResponse.data);
    }
  }, [projectsResponse]);

  // Handle form submission
  const handleSubmit = useCallback(
    async (
      data: CreateUpdateRequest,
      files: File[],
      documentMetadata: DocumentMetadataInput[]
    ) => {
      clearCreateError();
      await executeCreate(data, files, documentMetadata);
      // Refresh updates after successful submission
      fetchUpdates();
      // Switch to history tab to show the new update
      setActiveTab('history');
    },
    [executeCreate, fetchUpdates, clearCreateError]
  );

  const updates = useMemo(() => {
    return updatesResponse?.data || [];
  }, [updatesResponse]);

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
      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('log')}
            className={`flex-1 px-6 py-4 font-semibold transition duration-300 ${
              activeTab === 'log'
                ? 'bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] text-white'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Log Work
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 px-6 py-4 font-semibold transition duration-300 ${
              activeTab === 'history'
                ? 'bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] text-white'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            View History
          </button>
        </div>
      </div>

      {/* Error Messages */}
      {createError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm">{createError}</p>
        </div>
      )}

      {/* Log Work Tab */}
      {activeTab === 'log' && (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-800">Log Your Work</h3>
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
          </div>
          {isLoadingProjects ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-[#2563EB]" />
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-2">No active projects found</p>
              <p className="text-sm text-gray-500">
                You need to be assigned to a project with status "In Progress" to log work.
              </p>
            </div>
          ) : (
            <WorkLogForm
              projects={projects}
              onSubmit={handleSubmit}
              isLoading={isCreating}
            />
          )}
        </div>
      )}

      {/* View History Tab */}
      {activeTab === 'history' && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-800">Work Log History</h3>
            <button
              onClick={() => fetchUpdates()}
              disabled={isLoadingUpdates}
              className="px-4 py-2 bg-[#2563EB] text-white rounded-lg hover:bg-[#1D4ED8] transition duration-300 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <svg
                className={`w-4 h-4 ${isLoadingUpdates ? 'animate-spin' : ''}`}
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
            </button>
          </div>
          <WorkLogList
            updates={updates}
            projects={projects}
            isLoading={isLoadingUpdates}
            onRefresh={fetchUpdates}
            pagination={updatesResponse?.pagination}
            onPageChange={setUpdatesPage}
          />
        </div>
      )}
    </motion.section>
  );
};

export default WorkLogPage;

