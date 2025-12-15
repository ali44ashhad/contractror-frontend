import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { RegisterRequest } from '../types/auth.types';
import { UserRole } from '../types/common.types';
import { formatRole } from '../utils/formatRole';

/**
 * Simple email regex for basic client-side check
 */
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Simple regex for international phone numbers
 */
const phoneRegex = /^\+?[\d\s-()]{7,20}$/;

interface ValidationErrors {
  name?: string;
  email?: string;
  password?: string;
  phone?: string;
}

/**
 * Register page component
 * Matches contractor AdminRegisterForm.jsx exactly
 */
const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register, isAuthenticated, error, clearError, isLoading } =
    useAuth();
  const [form, setForm] = useState<RegisterRequest>({
    name: '',
    email: '',
    password: '',
    role: UserRole.DEVELOPER,
    phone: '',
  });
  const [validationErrors, setValidationErrors] =
    useState<ValidationErrors>({});
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const [autoRedirectTimer, setAutoRedirectTimer] =
    useState<NodeJS.Timeout | null>(null);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin-dashboard', { replace: true });
    }
    return () => {
      clearError();
      if (autoRedirectTimer) {
        clearTimeout(autoRedirectTimer);
      }
    };
  }, [isAuthenticated, navigate, clearError, autoRedirectTimer]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setForm((prev) => ({ ...prev, [name]: value }));
      // Clear validation error when user starts typing
      setValidationErrors((prev) => ({ ...prev, [name]: undefined }));
    },
    []
  );

  const validateForm = useCallback((): boolean => {
    const errors: ValidationErrors = {};

    // Name Validation
    if (!form.name.trim()) {
      errors.name = 'Name is required.';
    } else if (form.name.length < 3) {
      errors.name = 'Name must be at least 3 characters.';
    }

    // Email Validation
    if (!form.email.trim()) {
      errors.email = 'Email is required.';
    } else if (!emailRegex.test(form.email)) {
      errors.email = 'Please enter a valid email address.';
    }

    // Password Validation
    if (!form.password) {
      errors.password = 'Password is required.';
    } else if (form.password.length < 6) {
      errors.password = 'Password must be at least 6 characters.';
    }

    // Phone Validation
    if (form.phone && form.phone.trim() && !phoneRegex.test(form.phone.trim())) {
      errors.phone =
        'Please enter a valid phone number (e.g., +1 555 123 4567).';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [form]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      if (!validateForm()) {
        return;
      }

      try {
        clearError();

        const result = await register(form);

        if (result) {
          // Show success popup/modal
          setShowSuccess(true);
          // Auto-redirect to /admin-login after 1.5s
          const timer = setTimeout(() => {
            setShowSuccess(false);
            navigate('/admin-login', { replace: true });
          }, 1500);
          setAutoRedirectTimer(timer);
        }
      } catch (err) {
        // Error handled by useAuth hook
      }
    },
    [form, register, validateForm, clearError, navigate]
  );

  const getInputFieldClasses = useCallback(
    (fieldName: keyof ValidationErrors): string => {
      return `mt-1 block w-full rounded-md border p-2 focus:ring-[#2563EB] focus:border-[#2563EB] ${
        validationErrors[fieldName]
          ? 'border-red-500'
          : 'border-gray-300'
      }`;
    },
    [validationErrors]
  );

  const togglePassword = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  const renderErrorText = useCallback((err: string | null): string => {
    if (!err) return '';
    if (typeof err === 'string') return err;
    return 'Registration failed';
  }, []);

  const handleSuccessClose = useCallback(() => {
    setShowSuccess(false);
    if (autoRedirectTimer) {
      clearTimeout(autoRedirectTimer);
    }
    navigate('/admin-login', { replace: true });
  }, [autoRedirectTimer, navigate]);

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
        <div className="bg-white p-8 sm:p-10 rounded-xl shadow-2xl w-full max-w-md">
          <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
            User Registration
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4 w-full">
            {/* Name Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                className={getInputFieldClasses('name')}
                required
              />
              {validationErrors.name && (
                <p className="text-red-500 text-xs mt-1">
                  {validationErrors.name}
                </p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                name="email"
                value={form.email}
                onChange={handleChange}
                type="email"
                className={getInputFieldClasses('email')}
                required
              />
              {validationErrors.email && (
                <p className="text-red-500 text-xs mt-1">
                  {validationErrors.email}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="relative">
              <label className="block text-sm font-medium">Password</label>
              <input
                name="password"
                value={form.password}
                onChange={handleChange}
                type={showPassword ? 'text' : 'password'}
                className={`mt-1 block w-full rounded-md border p-2 pr-10 focus:ring-[#2563EB] focus:border-[#2563EB] ${
                  validationErrors.password
                    ? 'border-red-500'
                    : 'border-gray-300'
                }`}
                required
              />
              <button
                type="button"
                onClick={togglePassword}
                className="absolute right-3 top-[35px] text-gray-500 hover:text-[#2563EB]"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
              {validationErrors.password && (
                <p className="text-red-500 text-xs mt-1">
                  {validationErrors.password}
                </p>
              )}
            </div>

            {/* Role Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Role
              </label>
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 p-2 py-2.5 bg-white focus:ring-[#2563EB] focus:border-[#2563EB]"
              >
                <option value={UserRole.DEVELOPER}>{formatRole(UserRole.DEVELOPER)}</option>
                <option value={UserRole.ADMIN}>{formatRole(UserRole.ADMIN)}</option>
                <option value={UserRole.CONTRACTOR}>{formatRole(UserRole.CONTRACTOR)}</option>
                <option value={UserRole.MEMBER}>{formatRole(UserRole.MEMBER)}</option>
                <option value={UserRole.ACCOUNTS}>{formatRole(UserRole.ACCOUNTS)}</option>
              </select>
            </div>

            {/* Phone Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Phone
              </label>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                type="tel"
                className={getInputFieldClasses('phone')}
              />
              {validationErrors.phone && (
                <p className="text-red-500 text-xs mt-1">
                  {validationErrors.phone}
                </p>
              )}
            </div>

            {/* Global/Server Error Message */}
            {error && (
              <p className="text-red-600 text-sm mt-4 text-center">
                {renderErrorText(error)}
              </p>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full rounded-full px-4 py-3 bg-[#2563EB] text-white font-bold mt-6 hover:bg-[#1D4ED8] transition duration-150 disabled:opacity-60"
              disabled={isLoading}
            >
              {isLoading ? 'Creating...' : 'Register'}
            </button>
          </form>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccess && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6"
        >
          <div
            className="absolute inset-0 bg-black/40"
            onClick={handleSuccessClose}
          />
          <div className="relative z-10 max-w-sm w-full bg-white rounded-lg p-6 shadow-2xl text-center">
            <h3 className="text-lg font-semibold mb-2 text-blue-600">
              Registration Successful
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Your account was created successfully. Redirecting to login...
            </p>
            <div className="flex items-center justify-center space-x-3">
              <button
                onClick={handleSuccessClose}
                className="px-4 py-2 rounded-full bg-[#2563EB] text-white font-medium hover:bg-[#1D4ED8] transition"
              >
                Go to Login
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Register;
