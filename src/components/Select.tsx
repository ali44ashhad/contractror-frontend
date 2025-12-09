import React, { memo, forwardRef } from 'react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: SelectOption[];
}

/**
 * Reusable Select component with label and error handling
 * Matches Input component style
 */
const Select = memo(
  forwardRef<HTMLSelectElement, SelectProps>(
    ({ label, error, helperText, options, className = '', ...props }, ref) => {
      const selectClasses = `mt-1 block w-full rounded-md border ${
        error
          ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
          : 'border-gray-300 focus:ring-[#00BFB6] focus:border-[#00BFB6]'
      } p-2 ${className}`;

      return (
        <div>
          {label && (
            <label className="block text-sm font-medium text-gray-700">
              {label}
            </label>
          )}
          <select ref={ref} className={selectClasses} {...props}>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {error && (
            <p className="mt-1 text-sm text-red-600" role="alert">
              {error}
            </p>
          )}
          {helperText && !error && (
            <p className="mt-1 text-sm text-gray-500">{helperText}</p>
          )}
        </div>
      );
    }
  )
);

Select.displayName = 'Select';

export default Select;

