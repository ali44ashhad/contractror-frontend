import React, { memo, useState, useCallback, useEffect, useMemo } from 'react';
import Input from './Input';
import Select from './Select';
import {
  Team,
  CreateTeamRequest,
  UpdateTeamRequest,
} from '../types/team.types';
import { getAllUsers } from '../services/userService';
import { getAllProjects } from '../services/projectService';
import { UserRole } from '../types/common.types';
import { User } from '../types/auth.types';
import { Project } from '../types/project.types';
import { formatRole } from '../utils/formatRole';

interface TeamFormProps {
  team?: Team | null;
  onSubmit: (data: CreateTeamRequest | UpdateTeamRequest) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

interface FormErrors {
  projectId?: string;
  contractorId?: string;
  teamName?: string;
  members?: string;
}

/**
 * TeamForm component for create/edit operations
 * Fields: projectId, contractorId, teamName, members
 * Includes form validation with error messages
 */
const TeamForm = memo<TeamFormProps>(
  ({ team, onSubmit, onCancel, isLoading = false }) => {
    const isEditMode = !!team;
    const [projects, setProjects] = useState<Project[]>([]);
    const [contractors, setContractors] = useState<User[]>([]);
    const [eligibleMembers, setEligibleMembers] = useState<User[]>([]);
    const [isLoadingProjects, setIsLoadingProjects] = useState(false);
    const [isLoadingContractors, setIsLoadingContractors] = useState(false);
    const [isLoadingMembers, setIsLoadingMembers] = useState(false);

    // Get current member IDs from team
    const getCurrentMemberIds = useCallback((): string[] => {
      if (!team?.members) return [];
      return team.members.map((member) =>
        typeof member === 'string' ? member : member._id
      );
    }, [team]);

    const [formData, setFormData] = useState({
      projectId: team?.projectId
        ? typeof team.projectId === 'string'
          ? team.projectId
          : team.projectId._id
        : '',
      contractorId: team?.contractorId
        ? typeof team.contractorId === 'string'
          ? team.contractorId
          : team.contractorId._id
        : '',
      teamName: team?.teamName || '',
      members: getCurrentMemberIds(),
    });

    const [errors, setErrors] = useState<FormErrors>({});

    // Fetch projects on mount
    useEffect(() => {
      const fetchProjects = async () => {
        setIsLoadingProjects(true);
        try {
          const response = await getAllProjects();
          setProjects(response.data || []);
        } catch (error) {
          console.error('Failed to fetch projects:', error);
        } finally {
          setIsLoadingProjects(false);
        }
      };
      fetchProjects();
    }, []);

    // Fetch contractors on mount
    useEffect(() => {
      const fetchContractors = async () => {
        setIsLoadingContractors(true);
        try {
          const response = await getAllUsers({ role: UserRole.CONTRACTOR });
          setContractors(response.data || []);
        } catch (error) {
          console.error('Failed to fetch contractors:', error);
        } finally {
          setIsLoadingContractors(false);
        }
      };
      fetchContractors();
    }, []);

    // Fetch eligible members on mount
    useEffect(() => {
      const fetchMembers = async () => {
        setIsLoadingMembers(true);
        try {
          // Fetch users with allowed roles: DEVELOPER, CONTRACTOR, MEMBER, ACCOUNTS
          const [developers, contractors, members, accounts] = await Promise.all([
            getAllUsers({ role: UserRole.DEVELOPER }),
            getAllUsers({ role: UserRole.CONTRACTOR }),
            getAllUsers({ role: UserRole.MEMBER }),
            getAllUsers({ role: UserRole.ACCOUNTS }),
          ]);

          const allMembers = [
            ...(developers.data || []),
            ...(contractors.data || []),
            ...(members.data || []),
            ...(accounts.data || []),
          ].filter((user) => user.isActive);

          // Remove duplicates by _id
          const uniqueMembers = Array.from(
            new Map(allMembers.map((user) => [user._id, user])).values()
          );

          setEligibleMembers(uniqueMembers);
        } catch (error) {
          console.error('Failed to fetch members:', error);
        } finally {
          setIsLoadingMembers(false);
        }
      };
      fetchMembers();
    }, []);

    // Update form data when team changes (for edit mode)
    useEffect(() => {
      if (team) {
        setFormData({
          projectId: typeof team.projectId === 'string' ? team.projectId : team.projectId._id,
          contractorId:
            typeof team.contractorId === 'string' ? team.contractorId : team.contractorId._id,
          teamName: team.teamName,
          members: getCurrentMemberIds(),
        });
      }
    }, [team, getCurrentMemberIds]);

    const validateForm = useCallback((): boolean => {
      const newErrors: FormErrors = {};

      // Project ID validation
      if (!formData.projectId) {
        newErrors.projectId = 'Project is required';
      }

      // Contractor ID validation
      if (!formData.contractorId) {
        newErrors.contractorId = 'Contractor is required';
      }

      // Team name validation
      if (!formData.teamName.trim()) {
        newErrors.teamName = 'Team name is required';
      } else if (formData.teamName.length < 3) {
        newErrors.teamName = 'Team name must be at least 3 characters';
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    }, [formData]);

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
          ...prev,
          [name]: value,
        }));

        // Clear error for this field when user starts typing
        if (errors[name as keyof FormErrors]) {
          setErrors((prev) => ({
            ...prev,
            [name]: undefined,
          }));
        }
      },
      [errors]
    );

    const [selectedMemberId, setSelectedMemberId] = useState<string>('');

    // Get selected member objects for display
    const selectedMemberObjects = useMemo(() => {
      return eligibleMembers.filter((member) => formData.members.includes(member._id));
    }, [eligibleMembers, formData.members]);

    // Get available members (not already selected)
    const availableMemberOptions = useMemo(() => {
      return eligibleMembers
        .filter((member) => !formData.members.includes(member._id))
        .map((member) => ({
          value: member._id,
          label: `${member.name} (${formatRole(member.role)})`,
        }));
    }, [eligibleMembers, formData.members]);

    // Add member to selection
    const handleAddMember = useCallback(() => {
      if (!selectedMemberId || formData.members.includes(selectedMemberId)) {
        return;
      }

      setFormData((prev) => ({
        ...prev,
        members: [...prev.members, selectedMemberId],
      }));

      setSelectedMemberId('');
      
      // Clear error for members when user adds a member
      if (errors.members) {
        setErrors((prev) => ({
          ...prev,
          members: undefined,
        }));
      }
    }, [selectedMemberId, formData.members, errors.members]);

    // Remove member from selection
    const handleRemoveMember = useCallback(
      (memberId: string) => {
        setFormData((prev) => ({
          ...prev,
          members: prev.members.filter((id) => id !== memberId),
        }));

        // Clear error for members when user removes a member
        if (errors.members) {
          setErrors((prev) => ({
            ...prev,
            members: undefined,
          }));
        }
      },
      [errors.members]
    );

    const handleSubmit = useCallback(
      async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!validateForm()) {
          return;
        }

        if (isEditMode) {
          const updateData: UpdateTeamRequest = {
            teamName: formData.teamName,
            members: formData.members.length > 0 ? formData.members : undefined,
          };
          await onSubmit(updateData);
        } else {
          const createData: CreateTeamRequest = {
            projectId: formData.projectId,
            contractorId: formData.contractorId,
            teamName: formData.teamName,
            members: formData.members.length > 0 ? formData.members : undefined,
          };
          await onSubmit(createData);
        }
      },
      [formData, isEditMode, validateForm, onSubmit]
    );

    const projectOptions = projects.map((project) => ({
      value: project._id,
      label: project.name,
    }));

    const contractorOptions = contractors.map((contractor) => ({
      value: contractor._id,
      label: contractor.name,
    }));


    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        {!isEditMode && (
          <>
            <Select
              label="Project"
              name="projectId"
              value={formData.projectId}
              onChange={handleChange}
              options={[{ value: '', label: 'Select a project' }, ...projectOptions]}
              error={errors.projectId}
              disabled={isLoadingProjects}
              helperText={isLoadingProjects ? 'Loading projects...' : 'Required'}
              required
            />

            <Select
              label="Contractor"
              name="contractorId"
              value={formData.contractorId}
              onChange={handleChange}
              options={[{ value: '', label: 'Select a contractor' }, ...contractorOptions]}
              error={errors.contractorId}
              disabled={isLoadingContractors}
              helperText={isLoadingContractors ? 'Loading contractors...' : 'Required'}
              required
            />
          </>
        )}

        <Input
          label="Team Name"
          name="teamName"
          value={formData.teamName}
          onChange={handleChange}
          error={errors.teamName}
          required
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Members
          </label>
          
          {/* Dropdown to select members */}
          <div className="flex gap-2 mb-3">
            <select
              value={selectedMemberId}
              onChange={(e) => setSelectedMemberId(e.target.value)}
              disabled={isLoadingMembers || availableMemberOptions.length === 0}
              className={`flex-1 rounded-md border ${
                errors.members
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                  : 'border-gray-300 focus:ring-[#2563EB] focus:border-[#2563EB]'
              } p-2`}
            >
              <option value="">
                {isLoadingMembers
                  ? 'Loading members...'
                  : availableMemberOptions.length === 0
                  ? 'All members selected'
                  : 'Select a member to add'}
              </option>
              {availableMemberOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleAddMember}
              disabled={!selectedMemberId || isLoadingMembers}
              className="px-4 py-2 bg-[#2563EB] text-white rounded-md hover:bg-[#1D4ED8] transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              Add
            </button>
          </div>

          {/* Display selected members as removable chips */}
          {selectedMemberObjects.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {selectedMemberObjects.map((member) => (
                <span
                  key={member._id}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-[#2563EB]/10 text-[#2563EB] border border-[#2563EB]/20"
                >
                  <span>
                    {member.name} ({formatRole(member.role)})
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveMember(member._id)}
                    className="ml-1 hover:bg-[#2563EB]/20 rounded-full p-0.5 transition duration-300"
                    aria-label={`Remove ${member.name}`}
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
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </span>
              ))}
            </div>
          )}

          {errors.members && (
            <p className="mt-1 text-sm text-red-600" role="alert">
              {errors.members}
            </p>
          )}
          {!errors.members && (
            <p className="mt-1 text-sm text-gray-500">
              {isLoadingMembers
                ? 'Loading members...'
                : selectedMemberObjects.length === 0
                ? 'No members selected (optional)'
                : `${selectedMemberObjects.length} member${selectedMemberObjects.length !== 1 ? 's' : ''} selected`}
            </p>
          )}
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] text-white font-semibold px-6 py-3 rounded-lg hover:shadow-lg transition duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Saving...' : isEditMode ? 'Update Team' : 'Create Team'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
        </div>
      </form>
    );
  }
);

TeamForm.displayName = 'TeamForm';

export default TeamForm;

