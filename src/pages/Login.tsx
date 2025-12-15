import React, { useState, useCallback } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { LoginRequest } from '../types/auth.types';

/**
 * Login page component
 * Redirects are handled by useAuth hook based on user role
 */
const Login: React.FC = () => {
  const { login, error, clearError, isLoading } = useAuth();
  const [form, setForm] = useState<LoginRequest>({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    },
    []
  );

  const togglePassword = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!form.email || !form.password) {
        return;
      }

      try {
        await login(form);
      } catch (err) {
        // Error handled by useAuth hook
      }
    },
    [form, login]
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-8 sm:p-10 rounded-xl shadow-2xl w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Login
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4 w-full">
          <div>
            <label className="block text-sm font-medium">Email</label>
            <input
              name="email"
              value={form.email}
              onChange={handleChange}
              type="email"
              className="mt-1 block w-full rounded-md border border-gray-300 p-2 focus:ring-[#2563EB] focus:border-[#2563EB]"
              required
            />
          </div>

          <div className="relative">
            <label className="block text-sm font-medium">Password</label>
            <input
              name="password"
              value={form.password}
              onChange={handleChange}
              type={showPassword ? 'text' : 'password'}
              className="mt-1 block w-full rounded-md border border-gray-300 p-2 pr-10 focus:ring-[#2563EB] focus:border-[#2563EB]"
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
          </div>

          {error && (
            <p className="text-red-600 text-sm">
              {typeof error === 'string' ? error : error || 'Login failed'}
            </p>
          )}

          <button
            type="submit"
            className="w-full rounded-full px-4 py-3 bg-[#2563EB] text-white font-bold mt-6 hover:bg-[#1D4ED8] transition duration-150 disabled:opacity-60"
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
