import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useApi } from '../../hooks/useApi';
import {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
} from '../../services/userService';
import { User, CreateUserRequest, UpdateUserRequest } from '../../types/auth.types';
import { UserRole } from '../../types/common.types';
import { formatRole } from '../../utils/formatRole';
import { getRoleColor, getUserStatusColor } from '../../utils/badgeColors';
import Table from '../../components/Table';
import Modal from '../../components/Modal';
import UserForm from '../../components/UserForm';
import DeleteConfirmModal from '../../components/DeleteConfirmModal';
import Select from '../../components/Select';
import Input from '../../components/Input';

/**
 * UsersPage component
 * Main users management page with table, search, filters, and CRUD modals
 */
const UsersPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [isActiveFilter, setIsActiveFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteUserData, setDeleteUserData] = useState<User | null>(null);

  // Build filters object for API
  const apiFilters = useMemo(() => {
    const filters: { role?: string; isActive?: boolean; page?: number; limit?: number } = {};
    if (roleFilter) filters.role = roleFilter;
    if (isActiveFilter !== '') {
      filters.isActive = isActiveFilter === 'true';
    }
    filters.page = page;
    filters.limit = 10;
    return filters;
  }, [roleFilter, isActiveFilter, page]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [roleFilter, isActiveFilter]);

  // Fetch users function - memoized to prevent unnecessary re-renders
  const fetchUsersFn = useCallback(() => {
    return getAllUsers(apiFilters);
  }, [apiFilters]);

  // Fetch users
  const {
    data: usersResponse,
    isLoading: isLoadingUsers,
    error: usersError,
    execute: fetchUsers,
  } = useApi(fetchUsersFn);

  // Create user wrapper
  const createUserWrapper = useCallback(
    async (...args: unknown[]) => {
      return createUser(args[0] as CreateUserRequest);
    },
    []
  );

  // Create user
  const {
    isLoading: isCreating,
    execute: executeCreate,
    error: createError,
    clearError: clearCreateError,
  } = useApi(createUserWrapper);

  // Update user wrapper
  const updateUserWrapper = useCallback(
    async (...args: unknown[]) => {
      return updateUser(args[0] as string, args[1] as UpdateUserRequest);
    },
    []
  );

  // Update user
  const {
    isLoading: isUpdating,
    execute: executeUpdate,
    error: updateError,
    clearError: clearUpdateError,
  } = useApi(updateUserWrapper);

  // Delete user wrapper
  const deleteUserWrapper = useCallback(async (...args: unknown[]) => {
    return deleteUser(args[0] as string);
  }, []);

  // Delete user
  const {
    isLoading: isDeleting,
    execute: executeDelete,
    error: deleteError,
    clearError: clearDeleteError,
  } = useApi(deleteUserWrapper);

  // Fetch users when filters change
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Filter users by search query (client-side)
  const filteredUsers = useMemo(() => {
    if (!usersResponse?.data) return [];
    if (!searchQuery.trim()) return usersResponse.data;

    const query = searchQuery.toLowerCase();
    return usersResponse.data.filter(
      (user) =>
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query)
    );
  }, [usersResponse?.data, searchQuery]);

  // Handle create user
  const handleCreateUser = useCallback(
    async (data: CreateUserRequest | UpdateUserRequest) => {
      clearCreateError();
      await executeCreate(data as CreateUserRequest);
      setIsCreateModalOpen(false);
      fetchUsers(); // Refresh list
    },
    [executeCreate, fetchUsers, clearCreateError]
  );

  // Handle edit user
  const handleEditUser = useCallback(
    async (data: CreateUserRequest | UpdateUserRequest) => {
      if (!selectedUser) return;
      clearUpdateError();
      await executeUpdate(selectedUser._id, data as UpdateUserRequest);
      setIsEditModalOpen(false);
      setSelectedUser(null);
      fetchUsers(); // Refresh list
    },
    [selectedUser, executeUpdate, fetchUsers, clearUpdateError]
  );

  // Handle delete user
  const handleDeleteUser = useCallback(async () => {
    if (!deleteUserData) return;
    clearDeleteError();
    await executeDelete(deleteUserData._id);
    setIsDeleteModalOpen(false);
    setDeleteUserData(null);
    fetchUsers(); // Refresh list
  }, [deleteUserData, executeDelete, fetchUsers, clearDeleteError]);

  // Open edit modal
  const handleEditClick = useCallback((user: User) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  }, []);

  // Open delete modal
  const handleDeleteClick = useCallback((user: User) => {
    setDeleteUserData(user);
    setIsDeleteModalOpen(true);
  }, []);

  // Table columns
  const columns = [
    {
      key: 'name',
      header: 'Name',
      render: (user: User) => (
        <div className="font-semibold text-gray-800">{user.name}</div>
      ),
    },
    {
      key: 'email',
      header: 'Email',
      render: (user: User) => <div className="text-gray-600">{user.email}</div>,
    },
    {
      key: 'role',
      header: 'Role',
      render: (user: User) => (
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getRoleColor(user.role)}`}>
          {formatRole(user.role)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (user: User) => (
        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getUserStatusColor(user.isActive)}`}
        >
          {user.isActive ? 'Active' : 'Inactive'}
        </span>
      ),
    },
  ];

  // Render expandable content
  const renderExpandableContent = useCallback((user: User) => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div>
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
            Email
          </div>
          <div className="text-gray-800">{user.email}</div>
        </div>
        {user.phone && (
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              Phone
            </div>
            <div className="text-gray-800">{user.phone}</div>
          </div>
        )}
        <div>
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
            Role
          </div>
          <div className="text-gray-800">{formatRole(user.role)}</div>
        </div>
        <div>
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
            Status
          </div>
          <div className="text-gray-800">{user.isActive ? 'Active' : 'Inactive'}</div>
        </div>
        <div>
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
            Created At
          </div>
          <div className="text-gray-800">
            {new Date(user.createdAt).toLocaleDateString()}
          </div>
        </div>
        <div>
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
            Updated At
          </div>
          <div className="text-gray-800">
            {new Date(user.updatedAt).toLocaleDateString()}
          </div>
        </div>
      </div>
    );
  }, []);

  // Render action buttons
  const renderActions = useCallback(
    (user: User) => {
      return (
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => handleEditClick(user)}
            className="p-2 rounded-lg bg-[#2563EB]/10 text-[#2563EB] hover:bg-[#2563EB]/20 transition duration-300"
            aria-label="Edit user"
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
            onClick={() => handleDeleteClick(user)}
            className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition duration-300"
            aria-label="Delete user"
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

  const roleOptions = [
    { value: '', label: 'All Roles' },
    { value: UserRole.ADMIN, label: 'Admin' },
    { value: UserRole.DEVELOPER, label: 'Developer' },
    { value: UserRole.ACCOUNTS, label: 'Accounts' },
    { value: UserRole.CONTRACTOR, label: 'Contractor' },
    { value: UserRole.MEMBER, label: 'Member' },
  ];

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'true', label: 'Active' },
    { value: 'false', label: 'Inactive' },
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
              label="Search Users"
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="md:w-48">
            <Select
              label="Role"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              options={roleOptions}
            />
          </div>
          <div className="md:w-48">
            <Select
              label="Status"
              value={isActiveFilter}
              onChange={(e) => setIsActiveFilter(e.target.value)}
              options={statusOptions}
            />
          </div>
        </div>
      </div>

      {/* Table Header with Create Button */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-800">
          Users ({filteredUsers.length})
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchUsers()}
            disabled={isLoadingUsers}
            className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition duration-300 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2 font-medium text-sm"
            aria-label="Refresh users"
            title="Refresh users"
          >
            {isLoadingUsers ? (
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
            className="px-4 py-2 bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] text-white font-medium rounded-lg hover:shadow-lg transition duration-300 flex items-center gap-2 text-sm"
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
            Create User
          </button>
        </div>
      </div>

      {/* Error Messages */}
      {(usersError || createError || updateError || deleteError) && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm">
            {usersError ||
              createError ||
              updateError ||
              deleteError ||
              'An error occurred'}
          </p>
        </div>
      )}

      {/* Users Table */}
      <Table
        columns={columns}
        data={filteredUsers}
        renderExpandableContent={renderExpandableContent}
        renderActions={renderActions}
        isLoading={isLoadingUsers}
        emptyMessage="No users found"
        getRowId={(user) => user._id}
        pagination={
          usersResponse?.pagination
            ? {
                page: usersResponse.pagination.page,
                limit: usersResponse.pagination.limit,
                total: usersResponse.pagination.total,
                totalPages: usersResponse.pagination.totalPages,
                onPageChange: setPage,
              }
            : undefined
        }
      />

      {/* Create User Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          clearCreateError();
        }}
        title="Create New User"
        size="lg"
      >
        <UserForm
          onSubmit={handleCreateUser}
          onCancel={() => {
            setIsCreateModalOpen(false);
            clearCreateError();
          }}
          isLoading={isCreating}
        />
      </Modal>

      {/* Edit User Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedUser(null);
          clearUpdateError();
        }}
        title="Edit User"
        size="lg"
      >
        {selectedUser && (
          <UserForm
            user={selectedUser}
            onSubmit={handleEditUser}
            onCancel={() => {
              setIsEditModalOpen(false);
              setSelectedUser(null);
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
          setDeleteUserData(null);
          clearDeleteError();
        }}
        onConfirm={handleDeleteUser}
        itemName={deleteUserData?.name || ''}
        itemType="user"
        isLoading={isDeleting}
      />
    </motion.section>
  );
};

export default UsersPage;

