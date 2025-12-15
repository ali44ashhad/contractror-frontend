import React, { memo, forwardRef, useRef, useEffect } from 'react';
import SelectComponent, { StylesConfig, GroupBase } from 'react-select';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  label?: string;
  error?: string;
  helperText?: string;
  options: SelectOption[];
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

/**
 * Custom styles for react-select to match existing Input component style
 */
const customStyles: StylesConfig<SelectOption, false, GroupBase<SelectOption>> = {
  control: (base, state) => ({
    ...base,
    minHeight: '38px',
    borderRadius: '0.375rem',
    borderColor: state.isFocused
      ? state.selectProps['aria-invalid'] === 'true'
        ? '#ef4444'
        : '#2563EB'
      : state.selectProps['aria-invalid'] === 'true'
      ? '#fca5a5'
      : '#d1d5db',
    borderWidth: state.isFocused ? '2px' : '1px',
    boxShadow: state.isFocused
      ? state.selectProps['aria-invalid'] === 'true'
        ? '0 0 0 3px rgba(239, 68, 68, 0.1)'
        : '0 0 0 3px rgba(37, 99, 235, 0.1)'
      : 'none',
    '&:hover': {
      borderColor: state.selectProps['aria-invalid'] === 'true' ? '#ef4444' : '#9ca3af',
    },
    opacity: state.isDisabled ? 0.5 : 1,
    cursor: state.isDisabled ? 'not-allowed' : 'pointer',
  }),
  valueContainer: (base) => ({
    ...base,
    padding: '0.5rem',
    fontSize: '0.875rem',
  }),
  input: (base) => ({
    ...base,
    fontSize: '0.875rem',
    margin: 0,
    padding: 0,
  }),
  placeholder: (base) => ({
    ...base,
    fontSize: '0.875rem',
    color: '#9ca3af',
  }),
  singleValue: (base) => ({
    ...base,
    fontSize: '0.875rem',
    color: '#111827',
  }),
  menu: (base) => ({
    ...base,
    borderRadius: '0.375rem',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    marginTop: '0.25rem',
    zIndex: 50,
  }),
  menuList: (base) => ({
    ...base,
    padding: 0,
    maxHeight: '240px',
  }),
  option: (base, state) => ({
    ...base,
    fontSize: '0.875rem',
    padding: '0.5rem 0.75rem',
    backgroundColor: state.isSelected
      ? 'rgba(37, 99, 235, 0.1)'
      : state.isFocused
      ? 'rgba(37, 99, 235, 0.1)'
      : 'transparent',
    color: state.isSelected ? '#2563EB' : '#111827',
    fontWeight: state.isSelected ? 500 : 400,
    cursor: 'pointer',
    '&:active': {
      backgroundColor: 'rgba(37, 99, 235, 0.15)',
    },
  }),
  indicatorSeparator: () => ({
    display: 'none',
  }),
  dropdownIndicator: (base) => ({
    ...base,
    color: '#9ca3af',
    padding: '0.5rem',
    '&:hover': {
      color: '#6b7280',
    },
  }),
};

/**
 * Reusable Select component with label and error handling
 * Uses react-select for better mobile support and polished design
 * Matches Input component style
 */
const Select = memo(
  forwardRef<HTMLSelectElement, SelectProps>(
    ({ label, error, helperText, options, className = '', value, onChange, name, disabled, required, ...props }, ref) => {
      const selectRef = useRef<any>(null);

      // Forward ref to the underlying select element
      useEffect(() => {
        if (ref) {
          if (typeof ref === 'function') {
            ref(selectRef.current?.inputRef || null);
          } else {
            ref.current = selectRef.current?.inputRef || null;
          }
        }
      }, [ref]);

      const selectedOption = options.find((opt) => opt.value === value) || null;

      const handleChange = (selectedOption: SelectOption | null) => {
        // Create a synthetic event to match native select onChange signature
        if (onChange) {
          const syntheticEvent = {
            target: {
              name: name || '',
              value: selectedOption?.value || '',
            },
            currentTarget: {
              name: name || '',
              value: selectedOption?.value || '',
            },
          } as React.ChangeEvent<HTMLSelectElement>;
          onChange(syntheticEvent);
        }
      };

      return (
        <div className={className}>
          {label && (
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </label>
          )}
          <SelectComponent
            ref={selectRef}
            value={selectedOption}
            onChange={handleChange}
            options={options}
            isDisabled={disabled}
            isClearable={false}
            isSearchable={true}
            placeholder="Select an option"
            styles={customStyles}
            aria-invalid={error ? 'true' : 'false'}
            aria-required={required}
            menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
            menuPosition="fixed"
            classNamePrefix="react-select"
            {...(props as any)}
          />
          {error && (
            <p className="mt-1 text-sm text-red-600" role="alert">
              {error}
            </p>
          )}
          {helperText && !error && (
            <p className="mt-1 text-sm text-gray-500">{helperText}</p>
          )}
          {/* Hidden native select for form submission */}
          <select
            ref={ref}
            name={name}
            value={value || ''}
            onChange={() => {}} // Controlled by react-select
            disabled={disabled}
            required={required}
            className="sr-only"
            aria-hidden="true"
            {...props}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      );
    }
  )
);

Select.displayName = 'Select';

export default Select;
