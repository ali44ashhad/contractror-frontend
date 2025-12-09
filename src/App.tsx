import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Home from './pages/Home';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/admin/AdminDashboard';
import ProfilePage from './pages/admin/ProfilePage';
import ContractorDashboard from './pages/contractor/ContractorDashboard';
import MemberDashboard from './pages/member/MemberDashboard';
import { useAuth } from './hooks/useAuth';
import { UserRole } from './types/common.types';

/**
 * Protected Route component
 * Redirects to login if not authenticated
 */
interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
  excludedRoles?: UserRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  excludedRoles,
}) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#00BFB6]" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin-login" replace />;
  }

  // Check if user role is excluded
  if (excludedRoles && user?.role && excludedRoles.includes(user.role)) {
    // Redirect based on user role
    if (user.role === UserRole.CONTRACTOR) {
      return <Navigate to="/contractor-dashboard" replace />;
    }
    if (user.role === UserRole.ADMIN) {
      return <Navigate to="/admin-dashboard" replace />;
    }
    return <Navigate to="/" replace />;
  }

  // Check role if required
  if (requiredRole && user?.role !== requiredRole) {
    // Log for debugging
    console.warn('Role mismatch:', {
      required: requiredRole,
      actual: user?.role,
      user: user,
    });
    // Redirect based on user role
    if (user?.role === UserRole.CONTRACTOR) {
      return <Navigate to="/contractor-dashboard" replace />;
    }
    if (user?.role === UserRole.ADMIN) {
      return <Navigate to="/admin-dashboard" replace />;
    }
    // All other roles go to member dashboard
    return <Navigate to="/member-dashboard" replace />;
  }

  return <>{children}</>;
};

/**
 * Public Route component
 * Redirects to dashboard if already authenticated
 */
interface PublicRouteProps {
  children: React.ReactNode;
}

const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#00BFB6]" />
      </div>
    );
  }

  if (isAuthenticated) {
    // Redirect based on user role
    if (user?.role === UserRole.CONTRACTOR) {
      return <Navigate to="/contractor-dashboard" replace />;
    }
    if (user?.role === UserRole.ADMIN) {
      return <Navigate to="/admin-dashboard" replace />;
    }
    // All other roles (member, developer, accounts, etc.) go to member dashboard
    return <Navigate to="/member-dashboard" replace />;
  }

  return <>{children}</>;
};


/**
 * Main App component matching contractor structure
 */
const App: React.FC = () => {
  const { pathname } = useLocation();
  const hideFooterOn = [
    '/admin-dashboard',
    '/admin-profile',
    '/contractor-dashboard',
    '/contractor-profile',
    '/member-dashboard',
    '/supervisor-admin',
  ];

  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div>
        <div className="flex items-center justify-center h-screen bg-gradient-to-br from-[#d3f5f3] to-[#b3e5fc]">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#00BFB6]"></div>
        </div>
      </div>
    );
  }

  const hideNavbarOn = [
    '/admin-dashboard',
    '/admin-profile',
    '/contractor-dashboard',
    '/contractor-profile',
    '/member-dashboard',
    '/supervisor-admin',
  ];

  return (
    <>
      {!hideNavbarOn.includes(pathname) && (
        <div className="pb-10">
          <Navbar />
        </div>
      )}

      <Routes>
        <Route
          path="/"
          element={
            <PublicRoute>
              <Home />
            </PublicRoute>
          }
        />
        <Route
          path="/admin-login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/admin-register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />
        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute requiredRole={UserRole.ADMIN}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-profile"
          element={
            <ProtectedRoute requiredRole={UserRole.ADMIN}>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/contractor-dashboard"
          element={
            <ProtectedRoute requiredRole={UserRole.CONTRACTOR}>
              <ContractorDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/member-dashboard"
          element={
            <ProtectedRoute excludedRoles={[UserRole.ADMIN, UserRole.CONTRACTOR]}>
              <MemberDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Render footer only when route is NOT in hideFooterOn */}
      {!hideFooterOn.includes(pathname) && <Footer />}
    </>
  );
};

export default App;

