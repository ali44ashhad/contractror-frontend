import { UserRole } from '../types/common.types';
import { ProjectStatus } from '../types/project.types';
import { RequestStatus, RequestType } from '../types/request.types';

/**
 * Get Tailwind CSS classes for role badge colors
 * @param role - User role
 * @returns Tailwind CSS classes for the role badge
 */
export const getRoleColor = (role: UserRole | string): string => {
  switch (role) {
    case UserRole.ADMIN:
      return 'bg-purple-100 text-purple-800';
    case UserRole.DEVELOPER:
      return 'bg-blue-100 text-blue-800';
    case UserRole.ACCOUNTS:
      return 'bg-green-100 text-green-800';
    case UserRole.CONTRACTOR:
      return 'bg-orange-100 text-orange-800';
    case UserRole.MEMBER:
      return 'bg-teal-100 text-teal-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

/**
 * Get Tailwind CSS classes for project status badge colors
 * @param status - Project status
 * @returns Tailwind CSS classes for the status badge
 */
export const getProjectStatusColor = (status: ProjectStatus | string): string => {
  switch (status) {
    case ProjectStatus.PLANNING:
      return 'bg-blue-100 text-blue-800';
    case ProjectStatus.IN_PROGRESS:
      return 'bg-gray-100 text-gray-800';
    case ProjectStatus.ON_HOLD:
      return 'bg-yellow-100 text-yellow-800';
    case ProjectStatus.COMPLETED:
      return 'bg-green-100 text-green-800';
    case ProjectStatus.CANCELLED:
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

/**
 * Get Tailwind CSS classes for request status badge colors
 * @param status - Request status
 * @returns Tailwind CSS classes for the status badge
 */
export const getRequestStatusColor = (status: RequestStatus | string): string => {
  switch (status) {
    case RequestStatus.PENDING:
      return 'bg-yellow-100 text-yellow-800';
    case RequestStatus.APPROVED:
      return 'bg-green-100 text-green-800';
    case RequestStatus.REJECTED:
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

/**
 * Get Tailwind CSS classes for request type badge colors
 * @param type - Request type
 * @returns Tailwind CSS classes for the type badge
 */
export const getRequestTypeColor = (type: RequestType | string): string => {
  switch (type) {
    case RequestType.COMPLETION:
      return 'bg-blue-100 text-blue-800';
    case RequestType.EXTENSION:
      return 'bg-purple-100 text-purple-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

/**
 * Get Tailwind CSS classes for user active/inactive status badge colors
 * @param isActive - Whether the user is active
 * @returns Tailwind CSS classes for the status badge
 */
export const getUserStatusColor = (isActive: boolean): string => {
  return isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
};

