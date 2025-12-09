import React, { memo, useState, useCallback } from 'react';
import { CreateExtensionRequest } from '../types/request.types';
import Input from './Input';

interface ExtensionRequestFormProps {
  projectId: string;
  currentEndDate?: string;
  onSubmit: (data: CreateExtensionRequest) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

interface FormErrors {
  requestedEndDate?: string;
  reason?: string;
}

/**
 * ExtensionRequestForm component
 * Form for creating extension requests with date picker and optional reason field
 * Validates that requested date is after current project end date
 */
const ExtensionRequestForm = memo<ExtensionRequestFormProps>(
  ({ projectId, currentEndDate, onSubmit, onCancel, isLoading = false }) => {
    const [formData, setFormData] = useState({
      requestedEndDate: '',
      reason: '',
    });

    const [errors, setErrors] = useState<FormErrors>({});

    const validateForm = useCallback((): boolean => {
      const newErrors: FormErrors = {};

      // Requested end date validation
      if (!formData.requestedEndDate.trim()) {
        newErrors.requestedEndDate = 'Requested end date is required';
      } else {
        const requestedDate = new Date(formData.requestedEndDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (isNaN(requestedDate.getTime())) {
          newErrors.requestedEndDate = 'Invalid date format';
        } else if (requestedDate <= today) {
          newErrors.requestedEndDate = 'Requested date must be in the future';
        } else if (currentEndDate) {
          const currentEnd = new Date(currentEndDate);
          currentEnd.setHours(0, 0, 0, 0);
          if (requestedDate <= currentEnd) {
            newErrors.requestedEndDate =
              'Requested date must be after the current project end date';
          }
        }
      }

      // Reason is optional, but if provided, should have minimum length
      if (formData.reason.trim() && formData.reason.trim().length < 5) {
        newErrors.reason = 'Reason must be at least 5 characters if provided';
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    }, [formData, currentEndDate]);

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

        const submitData: CreateExtensionRequest = {
          projectId,
          requestedEndDate: formData.requestedEndDate,
          reason: formData.reason.trim() || undefined,
        };

        await onSubmit(submitData);
      },
      [projectId, formData, validateForm, onSubmit]
    );

    // Calculate minimum date (tomorrow or day after current end date)
    const getMinDate = (): string => {
      if (currentEndDate) {
        const currentEnd = new Date(currentEndDate);
        currentEnd.setDate(currentEnd.getDate() + 1);
        return currentEnd.toISOString().split('T')[0];
      }
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow.toISOString().split('T')[0];
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Requested End Date"
          name="requestedEndDate"
          type="date"
          value={formData.requestedEndDate}
          onChange={handleChange}
          error={errors.requestedEndDate}
          min={getMinDate()}
          required
        />

        {currentEndDate && (
          <p className="text-sm text-gray-600">
            Current project end date:{' '}
            <span className="font-semibold">
              {new Date(currentEndDate).toLocaleDateString()}
            </span>
          </p>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Reason <span className="text-gray-400 text-xs">(Optional)</span>
          </label>
          <textarea
            name="reason"
            value={formData.reason}
            onChange={handleChange}
            rows={4}
            placeholder="Provide a reason for requesting an extension..."
            className={`mt-1 block w-full rounded-md border ${
              errors.reason
                ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                : 'border-gray-300 focus:ring-[#00BFB6] focus:border-[#00BFB6]'
            } p-2`}
          />
          {errors.reason && (
            <p className="mt-1 text-sm text-red-600" role="alert">
              {errors.reason}
            </p>
          )}
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 bg-gradient-to-r from-[#00BFB6] to-[#00a8a0] text-white font-semibold px-6 py-3 rounded-lg hover:shadow-lg transition duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Submitting...' : 'Submit Request'}
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

ExtensionRequestForm.displayName = 'ExtensionRequestForm';

export default ExtensionRequestForm;

