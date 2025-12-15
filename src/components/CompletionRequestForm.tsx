import React, { memo, useState, useCallback } from 'react';
import { CreateCompletionRequest } from '../types/request.types';

interface CompletionRequestFormProps {
  projectId: string;
  onSubmit: (data: CreateCompletionRequest) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

interface FormErrors {
  reason?: string;
}

/**
 * CompletionRequestForm component
 * Form for creating completion requests with optional reason field
 * Includes form validation and error handling
 */
const CompletionRequestForm = memo<CompletionRequestFormProps>(
  ({ projectId, onSubmit, onCancel, isLoading = false }) => {
    const [formData, setFormData] = useState({
      reason: '',
    });

    const [errors, setErrors] = useState<FormErrors>({});

    const validateForm = useCallback((): boolean => {
      const newErrors: FormErrors = {};

      // Reason is optional, but if provided, should have minimum length
      if (formData.reason.trim() && formData.reason.trim().length < 5) {
        newErrors.reason = 'Reason must be at least 5 characters if provided';
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    }, [formData]);

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const { value } = e.target;

        setFormData((prev) => ({
          ...prev,
          reason: value,
        }));

        // Clear error when user starts typing
        if (errors.reason) {
          setErrors((prev) => ({
            ...prev,
            reason: undefined,
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

        const submitData: CreateCompletionRequest = {
          projectId,
          reason: formData.reason.trim() || undefined,
        };

        await onSubmit(submitData);
      },
      [projectId, formData, validateForm, onSubmit]
    );

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Reason <span className="text-gray-400 text-xs">(Optional)</span>
          </label>
          <textarea
            name="reason"
            value={formData.reason}
            onChange={handleChange}
            rows={4}
            placeholder="Provide a reason for requesting project completion..."
            className={`mt-1 block w-full rounded-md border ${
              errors.reason
                ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                : 'border-gray-300 focus:ring-[#2563EB] focus:border-[#2563EB]'
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
            className="flex-1 bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] text-white font-semibold px-6 py-3 rounded-lg hover:shadow-lg transition duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
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

CompletionRequestForm.displayName = 'CompletionRequestForm';

export default CompletionRequestForm;

