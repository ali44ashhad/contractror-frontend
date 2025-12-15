import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';
import { UserRole } from '../types/common.types';

interface UserDropdownProps {
  showDashboardLink?: boolean;
}

/**
 * UserDropdown component
 * Shows user avatar, name, and dropdown menu with Profile and Logout options
 * Reusable for both Navbar and AdminDashboard
 */
const UserDropdown: React.FC<UserDropdownProps> = ({ showDashboardLink = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Close dropdown on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  const handleLogout = useCallback(async () => {
    setIsOpen(false);
    await logout();
  }, [logout]);

  const handleProfileClick = useCallback(() => {
    setIsOpen(false);
    if (!user) return;
    
    // Navigate to profile page based on user role
    if (user.role === UserRole.ADMIN) {
      navigate('/admin-profile');
    } else if (user.role === UserRole.CONTRACTOR) {
      navigate('/contractor-profile');
    } else {
      // All other roles (member, developer, accounts, etc.)
      navigate('/member-profile');
    }
  }, [navigate, user]);

  const handleDashboardClick = useCallback(() => {
    setIsOpen(false);
    if (!user) return;
    
    // Navigate to dashboard based on user role
    if (user.role === UserRole.ADMIN) {
      navigate('/admin-dashboard');
    } else if (user.role === UserRole.CONTRACTOR) {
      navigate('/contractor-dashboard');
    } else {
      // All other roles (member, developer, accounts, etc.)
      navigate('/member-dashboard');
    }
  }, [navigate, user]);

  if (!user) {
    return null;
  }

  const userInitial = user.name.charAt(0).toUpperCase();

  // Check if we're on a profile page
  const isOnProfilePage = location.pathname === '/admin-profile' || 
                         location.pathname === '/contractor-profile' || 
                         location.pathname === '/member-profile';

  return (
    <div className="relative" ref={dropdownRef}>
      {/* User Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition duration-300"
        aria-label="User menu"
        aria-expanded={isOpen}
      >
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#2563EB] to-[#1D4ED8] flex items-center justify-center text-white font-semibold text-sm ring-2 ring-[#2563EB]/20">
          {userInitial}
        </div>
        <span className="hidden sm:block text-sm font-medium text-gray-800">
          {user.name}
        </span>
        <svg
          className={`w-4 h-4 text-gray-600 transition-transform duration-300 ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
          >
            <div className="px-4 py-2 border-b border-gray-100">
              <p className="text-sm font-semibold text-gray-800">{user.name}</p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>

            {showDashboardLink && (
              <button
                onClick={handleDashboardClick}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-[#2563EB]/10 hover:text-[#2563EB] transition duration-300 flex items-center gap-2"
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
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
                Dashboard
              </button>
            )}

            <button
              onClick={handleProfileClick}
              disabled={isOnProfilePage}
              className={`w-full text-left px-4 py-2 text-sm transition duration-300 flex items-center gap-2 ${
                isOnProfilePage
                  ? 'text-gray-400 cursor-not-allowed opacity-60'
                  : 'text-gray-700 hover:bg-[#2563EB]/10 hover:text-[#2563EB]'
              }`}
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
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              Profile
            </button>

            <div className="border-t border-gray-100 my-1" />

            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition duration-300 flex items-center gap-2"
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
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              Logout
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserDropdown;

