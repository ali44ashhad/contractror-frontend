import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { useApi } from '../../hooks/useApi';
import { updateUser } from '../../services/userService';
import { changePassword } from '../../services/authService';
import { UpdateUserRequest } from '../../types/auth.types';
import { formatRole } from '../../utils/formatRole';
import Input from '../../components/Input';
import Button from '../../components/Button';

/**
 * ProfilePage component
 * Admin profile page with edit profile and change password functionality
 */
const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');

  // Profile form state
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
  });

  // Password form state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [profileErrors, setProfileErrors] = useState<{
    name?: string;
    phone?: string;
  }>({});

  const [passwordErrors, setPasswordErrors] = useState<{
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});

  // Update profile data when user changes
  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name,
        phone: user.phone || '',
      });
    }
  }, [user]);

  // Update profile wrapper
  const updateProfileWrapper = useCallback(
    async (...args: unknown[]) => {
      if (!user) throw new Error('User not found');
      return updateUser(user._id, args[0] as UpdateUserRequest);
    },
    [user]
  );

  // Update profile
  const {
    isLoading: isUpdatingProfile,
    execute: executeUpdateProfile,
    error: updateProfileError,
    clearError: clearUpdateProfileError,
  } = useApi(updateProfileWrapper);

  // Change password wrapper
  const changePasswordWrapper = useCallback(async (...args: unknown[]) => {
    return changePassword(args[0] as { currentPassword: string; newPassword: string });
  }, []);

  // Change password
  const {
    isLoading: isChangingPassword,
    execute: executeChangePassword,
    error: changePasswordError,
    clearError: clearChangePasswordError,
  } = useApi(changePasswordWrapper);

  // Validate profile form
  const validateProfileForm = useCallback((): boolean => {
    const errors: { name?: string; phone?: string } = {};

    if (!profileData.name.trim()) {
      errors.name = 'Name is required';
    } else if (profileData.name.length < 3) {
      errors.name = 'Name must be at least 3 characters';
    }

    const phoneRegex = /^[\d\s\+\-\(\)]+$/;
    if (profileData.phone && profileData.phone.trim() && !phoneRegex.test(profileData.phone.trim())) {
      errors.phone = 'Please enter a valid phone number';
    }

    setProfileErrors(errors);
    return Object.keys(errors).length === 0;
  }, [profileData]);

  // Validate password form
  const validatePasswordForm = useCallback((): boolean => {
    const errors: {
      currentPassword?: string;
      newPassword?: string;
      confirmPassword?: string;
    } = {};

    if (!passwordData.currentPassword) {
      errors.currentPassword = 'Current password is required';
    }

    if (!passwordData.newPassword) {
      errors.newPassword = 'New password is required';
    } else if (passwordData.newPassword.length < 6) {
      errors.newPassword = 'Password must be at least 6 characters';
    }

    if (!passwordData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your new password';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  }, [passwordData]);

  // Handle profile update
  const handleProfileSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      clearUpdateProfileError();

      if (!validateProfileForm()) {
        return;
      }

      const updateData: UpdateUserRequest = {
        name: profileData.name,
        phone: profileData.phone || undefined,
      };

      await executeUpdateProfile(updateData);
      // Refresh user data by logging out and back in, or just reload
      window.location.reload();
    },
    [profileData, validateProfileForm, executeUpdateProfile, clearUpdateProfileError]
  );

  // Handle password change
  const handlePasswordSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      clearChangePasswordError();

      if (!validatePasswordForm()) {
        return;
      }

      await executeChangePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      // Clear form on success
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    },
    [passwordData, validatePasswordForm, executeChangePassword, clearChangePasswordError]
  );

  // Handle input changes
  const handleProfileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setProfileData((prev) => ({ ...prev, [name]: value }));
      if (profileErrors[name as keyof typeof profileErrors]) {
        setProfileErrors((prev) => ({ ...prev, [name]: undefined }));
      }
    },
    [profileErrors]
  );

  const handlePasswordChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setPasswordData((prev) => ({ ...prev, [name]: value }));
      if (passwordErrors[name as keyof typeof passwordErrors]) {
        setPasswordErrors((prev) => ({ ...prev, [name]: undefined }));
      }
    },
    [passwordErrors]
  );

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#00BFB6]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f7fafd] to-[#F5F7F9]">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/admin-dashboard')}
                className="p-2 rounded-lg hover:bg-[#00BFB6]/10 transition duration-300"
                aria-label="Back to dashboard"
              >
                <svg
                  className="w-6 h-6 text-gray-700"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
              </button>
              <h1 className="text-xl font-bold text-gray-800">Profile Settings</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          {/* User Info Card */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#00BFB6] to-[#00a8a0] flex items-center justify-center text-white text-2xl font-bold">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">{user.name}</h2>
                <p className="text-gray-600">{user.email}</p>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#00BFB6]/10 text-[#00BFB6] mt-2">
                  {formatRole(user.role)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  Phone
                </div>
                <div className="text-gray-800">{user.phone || 'Not provided'}</div>
              </div>
              <div>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  Status
                </div>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                    user.isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {user.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  Member Since
                </div>
                <div className="text-gray-800">
                  {new Date(user.createdAt).toLocaleDateString()}
                </div>
              </div>
              <div>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  Last Updated
                </div>
                <div className="text-gray-800">
                  {new Date(user.updatedAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="border-b border-gray-200">
              <nav className="flex">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`flex-1 px-6 py-4 text-sm font-semibold transition duration-300 ${
                    activeTab === 'profile'
                      ? 'bg-[#00BFB6]/10 text-[#00BFB6] border-b-2 border-[#00BFB6]'
                      : 'text-gray-600 hover:text-[#00BFB6] hover:bg-gray-50'
                  }`}
                >
                  Edit Profile
                </button>
                <button
                  onClick={() => setActiveTab('password')}
                  className={`flex-1 px-6 py-4 text-sm font-semibold transition duration-300 ${
                    activeTab === 'password'
                      ? 'bg-[#00BFB6]/10 text-[#00BFB6] border-b-2 border-[#00BFB6]'
                      : 'text-gray-600 hover:text-[#00BFB6] hover:bg-gray-50'
                  }`}
                >
                  Change Password
                </button>
              </nav>
            </div>

            <div className="p-6">
              {/* Edit Profile Tab */}
              {activeTab === 'profile' && (
                <motion.form
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onSubmit={handleProfileSubmit}
                  className="space-y-4"
                >
                  {(updateProfileError || changePasswordError) && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-red-800 text-sm">
                        {updateProfileError || changePasswordError || 'An error occurred'}
                      </p>
                    </div>
                  )}

                  <Input
                    label="Name"
                    name="name"
                    value={profileData.name}
                    onChange={handleProfileChange}
                    error={profileErrors.name}
                    required
                  />

                  <Input
                    label="Email"
                    name="email"
                    type="email"
                    value={user.email}
                    disabled
                    helperText="Email cannot be changed"
                  />

                  <Input
                    label="Phone"
                    name="phone"
                    type="tel"
                    value={profileData.phone}
                    onChange={handleProfileChange}
                    error={profileErrors.phone}
                    helperText="Optional"
                  />

                  <div className="flex gap-3 pt-4">
                    <Button
                      type="submit"
                      isLoading={isUpdatingProfile}
                      className="flex-1"
                    >
                      Update Profile
                    </Button>
                    <button
                      type="button"
                      onClick={() => navigate('/admin-dashboard')}
                      className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition duration-300"
                    >
                      Cancel
                    </button>
                  </div>
                </motion.form>
              )}

              {/* Change Password Tab */}
              {activeTab === 'password' && (
                <motion.form
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onSubmit={handlePasswordSubmit}
                  className="space-y-4"
                >
                  {changePasswordError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-red-800 text-sm">
                        {changePasswordError || 'An error occurred'}
                      </p>
                    </div>
                  )}

                  <Input
                    label="Current Password"
                    name="currentPassword"
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    error={passwordErrors.currentPassword}
                    required
                  />

                  <Input
                    label="New Password"
                    name="newPassword"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    error={passwordErrors.newPassword}
                    helperText="Must be at least 6 characters"
                    required
                  />

                  <Input
                    label="Confirm New Password"
                    name="confirmPassword"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    error={passwordErrors.confirmPassword}
                    required
                  />

                  <div className="flex gap-3 pt-4">
                    <Button
                      type="submit"
                      isLoading={isChangingPassword}
                      className="flex-1"
                    >
                      Change Password
                    </Button>
                    <button
                      type="button"
                      onClick={() => {
                        setPasswordData({
                          currentPassword: '',
                          newPassword: '',
                          confirmPassword: '',
                        });
                        setPasswordErrors({});
                        clearChangePasswordError();
                      }}
                      className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition duration-300"
                    >
                      Clear
                    </button>
                  </div>
                </motion.form>
              )}
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default ProfilePage;

