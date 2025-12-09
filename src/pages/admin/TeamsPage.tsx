import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useApi } from '../../hooks/useApi';
import {
  getAllTeams,
  createTeam,
  updateTeam,
  deleteTeam,
} from '../../services/teamService';
import { getAllProjects } from '../../services/projectService';
import { getAllUsers } from '../../services/userService';
import {
  Team,
  CreateTeamRequest,
  UpdateTeamRequest,
  ProjectReference,
  UserReference,
} from '../../types/team.types';
import { Project } from '../../types/project.types';
import { User } from '../../types/auth.types';
import { UserRole } from '../../types/common.types';
import { formatRole } from '../../utils/formatRole';
import Table from '../../components/Table';
import Modal from '../../components/Modal';
import TeamForm from '../../components/TeamForm';
import DeleteConfirmModal from '../../components/DeleteConfirmModal';
import Select from '../../components/Select';
import Input from '../../components/Input';

/**
 * TeamsPage component
 * Main teams management page with table, search, filters, and CRUD modals
 */
const TeamsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [projectFilter, setProjectFilter] = useState<string>('');
  const [contractorFilter, setContractorFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteTeamData, setDeleteTeamData] = useState<Team | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [contractors, setContractors] = useState<User[]>([]);

  // Build filters object for API
  const apiFilters = useMemo(() => {
    const filters: { projectId?: string; contractorId?: string; page?: number; limit?: number } = {};
    if (projectFilter) filters.projectId = projectFilter;
    if (contractorFilter) filters.contractorId = contractorFilter;
    filters.page = page;
    filters.limit = 10;
    return filters;
  }, [projectFilter, contractorFilter, page]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [projectFilter, contractorFilter]);

  // Fetch projects and contractors for filter dropdowns
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projectsResponse, contractorsResponse] = await Promise.all([
          getAllProjects(),
          getAllUsers({ role: UserRole.CONTRACTOR }),
        ]);
        setProjects(projectsResponse.data || []);
        setContractors(contractorsResponse.data || []);
      } catch (error) {
        console.error('Failed to fetch filter data:', error);
      }
    };
    fetchData();
  }, []);

  // Fetch teams function - memoized to prevent unnecessary re-renders
  const fetchTeamsFn = useCallback(() => {
    return getAllTeams(apiFilters);
  }, [apiFilters]);

  // Fetch teams
  const {
    data: teamsResponse,
    isLoading: isLoadingTeams,
    error: teamsError,
    execute: fetchTeams,
  } = useApi(fetchTeamsFn);

  // Create team wrapper
  const createTeamWrapper = useCallback(
    async (...args: unknown[]) => {
      return createTeam(args[0] as CreateTeamRequest);
    },
    []
  );

  // Create team
  const {
    isLoading: isCreating,
    execute: executeCreate,
    error: createError,
    clearError: clearCreateError,
  } = useApi(createTeamWrapper);

  // Update team wrapper
  const updateTeamWrapper = useCallback(
    async (...args: unknown[]) => {
      return updateTeam(args[0] as string, args[1] as UpdateTeamRequest);
    },
    []
  );

  // Update team
  const {
    isLoading: isUpdating,
    execute: executeUpdate,
    error: updateError,
    clearError: clearUpdateError,
  } = useApi(updateTeamWrapper);

  // Delete team wrapper
  const deleteTeamWrapper = useCallback(async (...args: unknown[]) => {
    return deleteTeam(args[0] as string);
  }, []);

  // Delete team
  const {
    isLoading: isDeleting,
    execute: executeDelete,
    error: deleteError,
    clearError: clearDeleteError,
  } = useApi(deleteTeamWrapper);

  // Fetch teams when filters change
  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  // Filter teams by search query (client-side)
  const filteredTeams = useMemo(() => {
    if (!teamsResponse?.data) return [];
    if (!searchQuery.trim()) return teamsResponse.data;

    const query = searchQuery.toLowerCase();
    return teamsResponse.data.filter((team) => {
      const projectName =
        typeof team.projectId === 'string' ? '' : team.projectId.name;
      const contractorName =
        typeof team.contractorId === 'string' ? '' : team.contractorId.name;
      return (
        team.teamName.toLowerCase().includes(query) ||
        projectName.toLowerCase().includes(query) ||
        contractorName.toLowerCase().includes(query)
      );
    });
  }, [teamsResponse?.data, searchQuery]);

  // Helper function to get project name from reference
  const getProjectName = useCallback(
    (projectRef: string | ProjectReference | null | undefined): string => {
      if (!projectRef) return 'Not assigned';
      if (typeof projectRef === 'string') return 'Loading...';
      return projectRef.name;
    },
    []
  );

  // Helper function to get user name from reference
  const getUserName = useCallback(
    (userRef: string | UserReference | null | undefined): string => {
      if (!userRef) return 'Not assigned';
      if (typeof userRef === 'string') return 'Loading...';
      return userRef.name;
    },
    []
  );

  // Helper function to get member names
  const getMemberNames = useCallback((members: (string | UserReference)[]): string => {
    if (!members || members.length === 0) return 'No members';
    return members
      .map((member) => (typeof member === 'string' ? 'Loading...' : member.name))
      .join(', ');
  }, []);

  // Handle create team
  const handleCreateTeam = useCallback(
    async (data: CreateTeamRequest | UpdateTeamRequest) => {
      clearCreateError();
      await executeCreate(data as CreateTeamRequest);
      setIsCreateModalOpen(false);
      fetchTeams(); // Refresh list
    },
    [executeCreate, fetchTeams, clearCreateError]
  );

  // Handle edit team
  const handleEditTeam = useCallback(
    async (data: CreateTeamRequest | UpdateTeamRequest) => {
      if (!selectedTeam) return;
      clearUpdateError();
      await executeUpdate(selectedTeam._id, data as UpdateTeamRequest);
      setIsEditModalOpen(false);
      setSelectedTeam(null);
      fetchTeams(); // Refresh list
    },
    [selectedTeam, executeUpdate, fetchTeams, clearUpdateError]
  );

  // Handle delete team
  const handleDeleteTeam = useCallback(async () => {
    if (!deleteTeamData) return;
    clearDeleteError();
    await executeDelete(deleteTeamData._id);
    setIsDeleteModalOpen(false);
    setDeleteTeamData(null);
    fetchTeams(); // Refresh list
  }, [deleteTeamData, executeDelete, fetchTeams, clearDeleteError]);

  // Open edit modal
  const handleEditClick = useCallback((team: Team) => {
    setSelectedTeam(team);
    setIsEditModalOpen(true);
  }, []);

  // Open delete modal
  const handleDeleteClick = useCallback((team: Team) => {
    setDeleteTeamData(team);
    setIsDeleteModalOpen(true);
  }, []);

  // Table columns
  const columns = [
    {
      key: 'teamName',
      header: 'Team Name',
      render: (team: Team) => (
        <div className="font-semibold text-gray-800">{team.teamName}</div>
      ),
    },
    {
      key: 'project',
      header: 'Project',
      render: (team: Team) => (
        <div className="text-gray-600">{getProjectName(team.projectId)}</div>
      ),
    },
    {
      key: 'contractor',
      header: 'Contractor',
      render: (team: Team) => (
        <div className="text-gray-600">{getUserName(team.contractorId)}</div>
      ),
    },
    {
      key: 'members',
      header: 'Members',
      render: (team: Team) => (
        <div className="text-gray-600">
          {team.members?.length || 0} member{team.members?.length !== 1 ? 's' : ''}
        </div>
      ),
    },
  ];

  // Render expandable content
  const renderExpandableContent = useCallback(
    (team: Team) => {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              Team Name
            </div>
            <div className="text-gray-800">{team.teamName}</div>
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              Project
            </div>
            <div className="text-gray-800">{getProjectName(team.projectId)}</div>
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              Contractor
            </div>
            <div className="text-gray-800">{getUserName(team.contractorId)}</div>
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              Created By
            </div>
            <div className="text-gray-800">{getUserName(team.createdBy)}</div>
          </div>
          <div className="md:col-span-2">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              Members ({team.members?.length || 0})
            </div>
            <div className="text-gray-800">
              {team.members && team.members.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {team.members.map((member, index) => {
                    const memberName = typeof member === 'string' ? 'Loading...' : member.name;
                    const memberRole = typeof member === 'string' ? '' : formatRole(member.role);
                    return (
                      <span
                        key={typeof member === 'string' ? member : member._id}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[#00BFB6]/10 text-[#00BFB6]"
                      >
                        {memberName}
                        {memberRole && (
                          <span className="ml-1 text-[#00BFB6]/70">
                            ({memberRole})
                          </span>
                        )}
                      </span>
                    );
                  })}
                </div>
              ) : (
                'No members assigned'
              )}
            </div>
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              Created At
            </div>
            <div className="text-gray-800">
              {new Date(team.createdAt).toLocaleDateString()}
            </div>
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              Updated At
            </div>
            <div className="text-gray-800">
              {new Date(team.updatedAt).toLocaleDateString()}
            </div>
          </div>
        </div>
      );
    },
    [getProjectName, getUserName]
  );

  // Render action buttons
  const renderActions = useCallback(
    (team: Team) => {
      return (
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => handleEditClick(team)}
            className="p-2 rounded-lg bg-[#00BFB6]/10 text-[#00BFB6] hover:bg-[#00BFB6]/20 transition duration-300"
            aria-label="Edit team"
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
            onClick={() => handleDeleteClick(team)}
            className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition duration-300"
            aria-label="Delete team"
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

  const projectOptions = [
    { value: '', label: 'All Projects' },
    ...projects.map((project) => ({
      value: project._id,
      label: project.name,
    })),
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
              label="Search Teams"
              type="text"
              placeholder="Search by team name, project, or contractor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="md:w-48">
            <Select
              label="Project"
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
              options={projectOptions}
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
          Teams ({filteredTeams.length})
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchTeams()}
            disabled={isLoadingTeams}
            className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition duration-300 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2 font-medium text-sm"
            aria-label="Refresh teams"
            title="Refresh teams"
          >
            {isLoadingTeams ? (
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
            Create Team
          </button>
        </div>
      </div>

      {/* Error Messages */}
      {(teamsError || createError || updateError || deleteError) && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm">
            {teamsError ||
              createError ||
              updateError ||
              deleteError ||
              'An error occurred'}
          </p>
        </div>
      )}

      {/* Teams Table */}
      <Table
        columns={columns}
        data={filteredTeams}
        renderExpandableContent={renderExpandableContent}
        renderActions={renderActions}
        isLoading={isLoadingTeams}
        emptyMessage="No teams found"
        getRowId={(team) => team._id}
        pagination={
          teamsResponse?.pagination
            ? {
                page: teamsResponse.pagination.page,
                limit: teamsResponse.pagination.limit,
                total: teamsResponse.pagination.total,
                totalPages: teamsResponse.pagination.totalPages,
                onPageChange: setPage,
              }
            : undefined
        }
      />

      {/* Create Team Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          clearCreateError();
        }}
        title="Create New Team"
        size="lg"
      >
        <TeamForm
          onSubmit={handleCreateTeam}
          onCancel={() => {
            setIsCreateModalOpen(false);
            clearCreateError();
          }}
          isLoading={isCreating}
        />
      </Modal>

      {/* Edit Team Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedTeam(null);
          clearUpdateError();
        }}
        title="Edit Team"
        size="lg"
      >
        {selectedTeam && (
          <TeamForm
            team={selectedTeam}
            onSubmit={handleEditTeam}
            onCancel={() => {
              setIsEditModalOpen(false);
              setSelectedTeam(null);
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
          setDeleteTeamData(null);
          clearDeleteError();
        }}
        onConfirm={handleDeleteTeam}
        itemName={deleteTeamData?.teamName || ''}
        itemType="team"
        isLoading={isDeleting}
      />
    </motion.section>
  );
};

export default TeamsPage;

