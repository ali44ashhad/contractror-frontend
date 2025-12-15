import React, { memo, useState, useCallback } from 'react';
import { ProjectRequest, RequestType } from '../types/request.types';
import Input from './Input';

interface RequestActionFormProps {
  request: ProjectRequest;
  action: 'approve' | 'reject';
  onSubmit: (data: { approvedEndDate?: string; adminNotes?: string }) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

interface FormErrors {
  approvedEndDate?: string;
  adminNotes?: string;
}

/**
 * RequestActionForm component
 * Form for approving or rejecting project requests
 * For extension requests, allows admin to modify the approved end date
 */
const RequestActionForm = memo<RequestActionFormProps>(
  ({ request, action, onSubmit, onCancel, isLoading = false }) => {
    const [formData, setFormData] = useState({
      approvedEndDate: request.requestedEndDate || '',
      adminNotes: '',
    });

    const [errors, setErrors] = useState<FormErrors>({});

    const validateForm = useCallback((): boolean => {
      const newErrors: FormErrors = {};

      // For extension approval, validate approved end date
      if (action === 'approve' && request.type === RequestType.EXTENSION) {
        if (!formData.approvedEndDate.trim()) {
          newErrors.approvedEndDate = 'Approved end date is required';
        } else {
          const approvedDate = new Date(formData.approvedEndDate);
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          if (isNaN(approvedDate.getTime())) {
            newErrors.approvedEndDate = 'Invalid date format';
          } else {
            // Get current project end date
            const projectRef =
              typeof request.projectId === 'object' ? request.projectId : null;
            if (projectRef?.endDate) {
              const currentEndDate = new Date(projectRef.endDate);
              currentEndDate.setHours(0, 0, 0, 0);
              if (approvedDate <= currentEndDate) {
                newErrors.approvedEndDate =
                  'Approved date must be after the current project end date';
              }
            } else if (approvedDate <= today) {
              newErrors.approvedEndDate = 'Approved date must be in the future';
            }
          }
        }
      }

      // Admin notes validation (optional but if provided, should have minimum length)
      if (formData.adminNotes.trim() && formData.adminNotes.trim().length < 3) {
        newErrors.adminNotes = 'Notes must be at least 3 characters if provided';
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    }, [formData, action, request]);

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
          ...prev,
          [name]: value,
        }));

        // Clear error when user starts typing
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

        const submitData: { approvedEndDate?: string; adminNotes?: string } = {};

        if (action === 'approve' && request.type === RequestType.EXTENSION) {
          submitData.approvedEndDate = formData.approvedEndDate;
        }

        if (formData.adminNotes.trim()) {
          submitData.adminNotes = formData.adminNotes.trim();
        }

        await onSubmit(submitData);
      },
      [formData, validateForm, onSubmit, action, request]
    );

    // Calculate minimum date for extension approval (day after current end date)
    const getMinDate = (): string => {
      const projectRef =
        typeof request.projectId === 'object' ? request.projectId : null;
      if (projectRef?.endDate) {
        const currentEnd = new Date(projectRef.endDate);
        currentEnd.setDate(currentEnd.getDate() + 1);
        return currentEnd.toISOString().split('T')[0];
      }
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow.toISOString().split('T')[0];
    };

    const projectRef =
      typeof request.projectId === 'object' ? request.projectId : null;
    const requestedByRef =
      typeof request.requestedBy === 'object' ? request.requestedBy : null;

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Request Details */}
        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
          <div className="text-sm">
            <span className="font-semibold text-gray-700">Project: </span>
            <span className="text-gray-800">
              {projectRef?.name || 'Loading...'}
            </span>
          </div>
          <div className="text-sm">
            <span className="font-semibold text-gray-700">Requested By: </span>
            <span className="text-gray-800">
              {requestedByRef?.name || 'Loading...'}
            </span>
          </div>
          <div className="text-sm">
            <span className="font-semibold text-gray-700">Type: </span>
            <span className="text-gray-800 capitalize">{request.type}</span>
          </div>
          {request.type === RequestType.EXTENSION && request.requestedEndDate && (
            <div className="text-sm">
              <span className="font-semibold text-gray-700">
                Requested End Date:{' '}
              </span>
              <span className="text-gray-800">
                {new Date(request.requestedEndDate).toLocaleDateString()}
              </span>
            </div>
          )}
          {request.reason && (
            <div className="text-sm">
              <span className="font-semibold text-gray-700">Reason: </span>
              <span className="text-gray-800">{request.reason}</span>
            </div>
          )}
        </div>

        {/* Extension Approval Date Field */}
        {action === 'approve' && request.type === RequestType.EXTENSION && (
          <Input
            label="Approved End Date"
            name="approvedEndDate"
            type="date"
            value={formData.approvedEndDate}
            onChange={handleChange}
            error={errors.approvedEndDate}
            min={getMinDate()}
            required
            helperText="You can modify the requested end date if needed"
          />
        )}

        {/* Admin Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Admin Notes{' '}
            <span className="text-gray-400 text-xs">(Optional)</span>
          </label>
          <textarea
            name="adminNotes"
            value={formData.adminNotes}
            onChange={handleChange}
            rows={4}
            placeholder={`Add notes for ${action === 'approve' ? 'approval' : 'rejection'}...`}
            className={`mt-1 block w-full rounded-md border ${
              errors.adminNotes
                ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                : 'border-gray-300 focus:ring-[#2563EB] focus:border-[#2563EB]'
            } p-2`}
          />
          {errors.adminNotes && (
            <p className="mt-1 text-sm text-red-600" role="alert">
              {errors.adminNotes}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className={`flex-1 font-semibold px-6 py-3 rounded-lg hover:shadow-lg transition duration-300 disabled:opacity-60 disabled:cursor-not-allowed ${
              action === 'approve'
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                : 'bg-gradient-to-r from-red-500 to-red-600 text-white'
            }`}
          >
            {isLoading
              ? `${action === 'approve' ? 'Approving' : 'Rejecting'}...`
              : `${action === 'approve' ? 'Approve' : 'Reject'} Request`}
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

RequestActionForm.displayName = 'RequestActionForm';

export default RequestActionForm;

