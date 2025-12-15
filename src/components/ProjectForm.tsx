import React, { memo, useState, useCallback, useEffect } from 'react';
import Input from './Input';
import Select from './Select';
import {
  Project,
  CreateProjectRequest,
  UpdateProjectRequest,
  ProjectStatus,
} from '../types/project.types';
import { getAllUsers } from '../services/userService';
import { UserRole } from '../types/common.types';
import { User } from '../types/auth.types';

interface ProjectFormProps {
  project?: Project | null;
  onSubmit: (data: CreateProjectRequest | UpdateProjectRequest) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

interface FormErrors {
  name?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  budget?: string;
}

/**
 * ProjectForm component for create/edit operations
 * Fields: name, description, contractorId, status, startDate, endDate, budget, location
 * Includes form validation with error messages
 */
const ProjectForm = memo<ProjectFormProps>(
  ({ project, onSubmit, onCancel, isLoading = false }) => {
    const isEditMode = !!project;
    const [contractors, setContractors] = useState<User[]>([]);
    const [isLoadingContractors, setIsLoadingContractors] = useState(false);

    const [formData, setFormData] = useState({
      name: project?.name || '',
      description: project?.description || '',
      contractorId: project?.contractorId
        ? typeof project.contractorId === 'string'
          ? project.contractorId
          : project.contractorId._id
        : '',
      status: project?.status || ProjectStatus.PLANNING,
      startDate: project?.startDate
        ? new Date(project.startDate).toISOString().split('T')[0]
        : '',
      endDate: project?.endDate
        ? new Date(project.endDate).toISOString().split('T')[0]
        : '',
      budget: project?.budget?.toString() || '',
      location: project?.location || '',
    });

    const [errors, setErrors] = useState<FormErrors>({});

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

    // Update form data when project changes (for edit mode)
    useEffect(() => {
      if (project) {
        setFormData({
          name: project.name,
          description: project.description,
          contractorId: project.contractorId
            ? typeof project.contractorId === 'string'
              ? project.contractorId
              : project.contractorId._id
            : '',
          status: project.status,
          startDate: project.startDate
            ? new Date(project.startDate).toISOString().split('T')[0]
            : '',
          endDate: project.endDate
            ? new Date(project.endDate).toISOString().split('T')[0]
            : '',
          budget: project.budget?.toString() || '',
          location: project.location || '',
        });
      }
    }, [project]);

    const validateForm = useCallback((): boolean => {
      const newErrors: FormErrors = {};

      // Name validation
      if (!formData.name.trim()) {
        newErrors.name = 'Project name is required';
      } else if (formData.name.length < 3) {
        newErrors.name = 'Project name must be at least 3 characters';
      }

      // Description validation
      if (!formData.description.trim()) {
        newErrors.description = 'Description is required';
      } else if (formData.description.length < 10) {
        newErrors.description = 'Description must be at least 10 characters';
      }

      // Date validation
      if (formData.startDate && formData.endDate) {
        const start = new Date(formData.startDate);
        const end = new Date(formData.endDate);
        if (end < start) {
          newErrors.endDate = 'End date must be after start date';
        }
      }

      // Budget validation
      if (formData.budget) {
        const budgetNum = parseFloat(formData.budget);
        if (isNaN(budgetNum) || budgetNum < 0) {
          newErrors.budget = 'Budget must be a positive number';
        }
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    }, [formData]);

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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

    const handleSubmit = useCallback(
      async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!validateForm()) {
          return;
        }

        const submitData: CreateProjectRequest | UpdateProjectRequest = {
          name: formData.name,
          description: formData.description,
          contractorId: formData.contractorId || null,
          status: formData.status,
          startDate: formData.startDate || undefined,
          endDate: formData.endDate || undefined,
          budget: formData.budget ? parseFloat(formData.budget) : undefined,
          location: formData.location || undefined,
        };

        await onSubmit(submitData);
      },
      [formData, validateForm, onSubmit]
    );

    const statusOptions = [
      { value: ProjectStatus.PLANNING, label: 'Planning' },
      { value: ProjectStatus.IN_PROGRESS, label: 'In Progress' },
      { value: ProjectStatus.ON_HOLD, label: 'On Hold' },
      { value: ProjectStatus.COMPLETED, label: 'Completed' },
      { value: ProjectStatus.CANCELLED, label: 'Cancelled' },
    ];

    const contractorOptions = [
      { value: '', label: 'No Contractor Assigned' },
      ...contractors.map((contractor) => ({
        value: contractor._id,
        label: contractor.name,
      })),
    ];

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Project Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          required
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className={`mt-1 block w-full rounded-md border ${
              errors.description
                ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                : 'border-gray-300 focus:ring-[#2563EB] focus:border-[#2563EB]'
            } p-2`}
            required
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600" role="alert">
              {errors.description}
            </p>
          )}
        </div>

        <Select
          label="Contractor"
          name="contractorId"
          value={formData.contractorId}
          onChange={handleChange}
          options={contractorOptions}
          disabled={isLoadingContractors}
          helperText={isLoadingContractors ? 'Loading contractors...' : 'Optional'}
        />

        <Select
          label="Status"
          name="status"
          value={formData.status}
          onChange={handleChange}
          options={statusOptions}
          required
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Start Date"
            name="startDate"
            type="date"
            value={formData.startDate}
            onChange={handleChange}
            error={errors.startDate}
          />

          <Input
            label="End Date"
            name="endDate"
            type="date"
            value={formData.endDate}
            onChange={handleChange}
            error={errors.endDate}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Budget"
            name="budget"
            type="number"
            step="0.01"
            min="0"
            value={formData.budget}
            onChange={handleChange}
            error={errors.budget}
            helperText="Optional"
          />

          <Input
            label="Location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            helperText="Optional"
          />
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] text-white font-semibold px-6 py-3 rounded-lg hover:shadow-lg transition duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Saving...' : isEditMode ? 'Update Project' : 'Create Project'}
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

ProjectForm.displayName = 'ProjectForm';

export default ProjectForm;

