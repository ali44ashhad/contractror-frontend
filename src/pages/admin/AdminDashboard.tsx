import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogOut } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { menuItems } from '../../data/adminData';
import { RecentUpdate, DashboardKPI } from '../../types/admin.types';
import { getDashboardStats, getRecentUpdates } from '../../services/dashboardService';
import { getAllProjects } from '../../services/projectService';
import { Project, ProjectStatus } from '../../types/project.types';
import { getMapUrl } from '../../utils/maps';
import UsersPage from './UsersPage';
import ProjectsPage from './ProjectsPage';
import TeamsPage from './TeamsPage';
import RequestsPage from './RequestsPage';
import ReportsPage from './ReportsPage';
import UserDropdown from '../../components/UserDropdown';
import Select from '../../components/Select';
import Map from '../../components/Map';

// Animation variants matching Home.jsx
const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: (custom = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay: 0.04 * custom },
  }),
};

const fadeIn = {
  hidden: { opacity: 0 },
  show: (custom = 0) => ({
    opacity: 1,
    transition: { duration: 0.55, delay: 0.04 * custom },
  }),
};

const heroVariants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: 'easeOut' },
  },
};

const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 18, scale: 0.995 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

/**
 * Expandable Update Card Component
 */
const ExpandableUpdateCard: React.FC<{
  update: RecentUpdate;
  index: number;
  onSelect: (update: RecentUpdate) => void;
}> = ({ update, index, onSelect }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      className="mb-4"
      style={{
        border: '2px solid #9CA3AF',
        borderRadius: '8px',
        backgroundColor: '#FFFFFF',
        minHeight: '100px',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}
    >
      {/* Card Header - Always Visible */}
      <div
        className="p-4 cursor-pointer flex items-start gap-4"
        style={{
          backgroundColor: '#FFFFFF',
          minHeight: '80px'
        }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex-shrink-0">
          <img
            src={update.imageUrl || 'https://placehold.co/80x80/cccccc/000000?text=Image'}
            alt={`Update from ${update.contractorName || 'Unknown'}`}
            className="w-16 h-16 object-cover rounded-lg shadow-md border border-gray-200"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.onerror = null;
              target.src = 'https://placehold.co/80x80/cccccc/000000?text=Image';
            }}
          />
        </div>
        <div className="flex-1 min-w-0" style={{ flex: '1 1 0%', minWidth: '0' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', marginBottom: '8px' }}>
            <div style={{ minWidth: '0', flex: '1 1 0%' }}>
              <div style={{ fontSize: '14px', fontWeight: '700', color: '#111827', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {update.contractorName || 'Unknown Contractor'}
              </div>
              <div style={{ fontSize: '12px', fontWeight: '500', color: '#2563EB', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {update.projectName || 'Unknown Project'}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: '0' }}>
              <span style={{
                fontSize: '12px',
                padding: '4px 8px',
                borderRadius: '4px',
                fontWeight: '600',
                backgroundColor: update.updateType === 'morning' ? '#DBEAFE' : '#FED7AA',
                color: update.updateType === 'morning' ? '#1E40AF' : '#9A3412'
              }}>
                {update.updateType === 'morning' ? 'Morning' : 'Evening'}
              </span>
              <svg
                style={{
                  width: '20px',
                  height: '20px',
                  color: isExpanded ? '#4B5563' : '#6B7280',
                  transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s'
                }}
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
            </div>
          </div>
          <div style={{ fontSize: '12px', marginTop: '4px', color: '#6B7280' }}>
            {update.timestamp 
              ? new Date(update.timestamp).toLocaleString()
              : 'No timestamp'}
          </div>
        </div>
      </div>

      {/* Expandable Content */}
      {isExpanded && (
        <div
          style={{
            borderTop: '2px solid #9CA3AF',
            backgroundColor: '#F9FAFB',
            padding: '16px'
          }}
        >
          <div className="p-4 space-y-3">
            {update.description && (
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: '#4B5563' }}>
                  Description
                </div>
                <div className="text-sm" style={{ color: '#374151' }}>
                  {update.description}
                </div>
              </div>
            )}
            
            {(update.lat !== undefined && update.lng !== undefined) && (
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: '#4B5563' }}>
                  Location
                </div>
                <div className="text-sm" style={{ color: '#374151' }}>
                  Lat: {update.lat.toFixed(4)}, Lng: {update.lng.toFixed(4)}
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 pt-3 border-t border-gray-300">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(update);
                }}
                className="text-xs px-4 py-2 border-2 border-gray-400 rounded-lg hover:bg-[#2563EB]/10 hover:border-[#2563EB] transition duration-300 font-semibold"
                style={{ color: '#374151' }}
              >
                View Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Admin Dashboard component
 * Matches contractor AdminDashboard.jsx structure
 * Adapted for construction management system
 */
const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<RecentUpdate | null>(null);

  // Dashboard data state
  const [dashboardKPIs, setDashboardKPIs] = useState<DashboardKPI>({
    totalProjects: 0,
    updatesToday: 0,
    activeContractors: 0,
    pendingRequests: 0,
  });
  const [uploads, setUploads] = useState<RecentUpdate[]>([]);
  const [loadingKPIs, setLoadingKPIs] = useState<boolean>(false);
  const [loadingUpdates, setLoadingUpdates] = useState<boolean>(false);
  const [errorKPIs, setErrorKPIs] = useState<string | null>(null);
  const [errorUpdates, setErrorUpdates] = useState<string | null>(null);
  
  // Map filter state
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [loadingProjects, setLoadingProjects] = useState<boolean>(false);

  // Get valid menu keys for validation
  const validMenuKeys = useMemo(
    () => new Set(menuItems.map((item) => item.key)),
    []
  );

  // Initialize activeMenu from URL parameter or default to 'dashboard'
  const getInitialMenu = useCallback((): string => {
    const pageParam = searchParams.get('page');
    if (pageParam && validMenuKeys.has(pageParam)) {
      return pageParam;
    }
    return 'dashboard';
  }, [searchParams, validMenuKeys]);

  const [activeMenu, setActiveMenu] = useState<string>(getInitialMenu);

  // Fetch dashboard data when dashboard is active
  useEffect(() => {
    if (activeMenu === 'dashboard') {
      // Fetch KPIs
      setLoadingKPIs(true);
      setErrorKPIs(null);
      getDashboardStats()
        .then((response) => {
          if (response.success && response.data) {
            setDashboardKPIs(response.data);
          } else {
            setErrorKPIs('Failed to load dashboard statistics');
          }
        })
        .catch((error) => {
          setErrorKPIs(error?.error?.message || 'Failed to load dashboard statistics');
        })
        .finally(() => {
          setLoadingKPIs(false);
        });

      // Fetch recent updates
      setLoadingUpdates(true);
      setErrorUpdates(null);
      getRecentUpdates(3)
        .then((response) => {
          if (response.success) {
            // Handle both array and potentially undefined/null data
            const updatesData = Array.isArray(response.data) ? response.data : [];
            setUploads(updatesData);
          } else {
            setErrorUpdates('Failed to load recent updates');
          }
        })
        .catch((error) => {
          const errorMessage = error?.error?.message || error?.message || 'Failed to load recent updates';
          setErrorUpdates(errorMessage);
          // Set empty array on error so UI doesn't break
          setUploads([]);
        })
        .finally(() => {
          setLoadingUpdates(false);
        });

      // Fetch projects for map filter
      setLoadingProjects(true);
      getAllProjects()
        .then((response) => {
          if (response.success && response.data) {
            setProjects(response.data);
          }
        })
        .catch((error) => {
          console.error('Failed to load projects:', error);
        })
        .finally(() => {
          setLoadingProjects(false);
        });
    }
  }, [activeMenu]);


  // Sync activeMenu with URL parameter when URL changes (e.g., browser back/forward)
  useEffect(() => {
    const pageParam = searchParams.get('page');
    if (pageParam && validMenuKeys.has(pageParam)) {
      setActiveMenu((currentMenu) => {
        // Only update if different to avoid unnecessary re-renders
        return pageParam !== currentMenu ? pageParam : currentMenu;
      });
    } else {
      // If no page param exists or invalid, set it to 'dashboard' in URL (replace to avoid adding to history)
      if (!pageParam || !validMenuKeys.has(pageParam)) {
        setSearchParams({ page: 'dashboard' }, { replace: true });
        setActiveMenu('dashboard');
      }
    }
  }, [searchParams, validMenuKeys, setSearchParams]);

  const handleMenuClick = useCallback(
    (menuKey: string) => {
      // Validate menu key
      if (!validMenuKeys.has(menuKey)) {
        console.warn(`Invalid menu key: ${menuKey}, defaulting to dashboard`);
        menuKey = 'dashboard';
      }
      setActiveMenu(menuKey);
      setSearchParams({ page: menuKey });
      setSidebarOpen(false);
    },
    [validMenuKeys, setSearchParams]
  );

  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  const handleItemSelect = useCallback((item: RecentUpdate) => {
    setSelectedItem(item);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setSelectedItem(null);
  }, []);

  // Get selected project
  const selectedProject = useMemo(() => {
    if (!selectedProjectId) return null;
    return projects.find((p) => p._id === selectedProjectId) || null;
  }, [selectedProjectId, projects]);

  // Project options for dropdown
  const projectOptions = useMemo(() => {
    return [
      { value: '', label: 'Select a project' },
      ...projects.map((project) => ({
        value: project._id,
        label: project.name,
      })),
    ];
  }, [projects]);

  // Helper function to format currency
  const formatCurrency = useCallback((amount?: number): string => {
    if (!amount) return 'Not set';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  }, []);

  // Helper function to get status badge color
  const getStatusColor = useCallback((status: ProjectStatus): string => {
    switch (status) {
      case ProjectStatus.PLANNING:
        return 'bg-blue-100 text-blue-800';
      case ProjectStatus.IN_PROGRESS:
        return 'bg-gray-100 text-gray-800';
      case ProjectStatus.ON_HOLD:
        return 'bg-yellow-100 text-yellow-800';
      case ProjectStatus.COMPLETED:
        return 'bg-green-100 text-green-800';
      case ProjectStatus.CANCELLED:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }, []);

  // Helper function to format status text
  const formatStatus = useCallback((status: ProjectStatus): string => {
    return status.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f7fafd] to-[#F5F7F9]">
      {/* Topbar with Home.jsx styling */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-100 ml-0 md:ml-64">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              {/* Hamburger (mobile) */}
              <button
                className="md:hidden p-2 rounded-lg hover:bg-[#2563EB]/10 transition duration-300"
                onClick={toggleSidebar}
                aria-label="Toggle sidebar"
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
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>

              {/* Logo */}
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#2563EB] to-[#1D4ED8] flex items-center justify-center text-white font-bold shadow-lg">
                  CT
                </div>
                <div className="hidden sm:block font-bold text-gray-800 text-lg">
                  Contractor Admin
                </div>
              </div>
            </div>

            {/* Profile */}
            <div className="flex-1 px-4 sm:px-6 lg:px-8">
              <div className="flex items-center gap-4 justify-end">
                {/* Desktop: UserDropdown */}
                <div className="hidden sm:flex items-center gap-3">
                  <UserDropdown />
                </div>

                {/* Mobile: UserDropdown only */}
                <div className="sm:hidden">
                  <UserDropdown />
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar with Home.jsx styling */}
        <aside
          className={`fixed z-40 inset-y-0 left-0 transform ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } md:translate-x-0 transition-transform duration-300 ease-in-out w-64 bg-white/95 backdrop-blur-sm shadow-xl border-r border-gray-100`}
        >
          <div className="h-full flex flex-col">
            <div className="p-6 border-b border-gray-100">
              <div className="text-sm font-bold text-gray-800 uppercase tracking-wider">
                Main Menu
              </div>
            </div>
            <nav className="p-4 space-y-2 flex-1 overflow-auto">
              {menuItems.map((menu) => (
                <motion.button
                  key={menu.key}
                  onClick={() => handleMenuClick(menu.key)}
                  whileHover={{ x: 4 }}
                  className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition duration-300 ${
                    activeMenu === menu.key
                      ? 'bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] text-white font-semibold shadow-lg'
                      : 'text-gray-700 hover:bg-[#2563EB]/10 hover:text-[#2563EB]'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      activeMenu === menu.key ? 'bg-white' : 'bg-[#2563EB]'
                    }`}
                  />
                  <span>{menu.label}</span>
                </motion.button>
              ))}
            </nav>

            <div className="p-4 border-t border-gray-100">
              <motion.button
                onClick={logout}
                whileHover={{ scale: 1.05 }}
                className="w-full flex items-center justify-center p-3 rounded-lg bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] text-white shadow-lg hover:shadow-xl transition duration-300"
              >
                <LogOut size={20} className="mr-2" />
                <span className="text-sm font-medium">Logout</span>
              </motion.button>
            </div>
          </div>
        </aside>

        {/* Backdrop for mobile when sidebar is open */}
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 md:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Main content area */}
        <main className="flex-1 min-h-screen ml-0 md:ml-64">
          <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            {/* Header inside main for small screens */}
            <motion.div
              initial="hidden"
              animate="show"
              variants={fadeUp}
              className="flex items-center justify-between mb-8"
            >
              <h2 className="text-2xl sm:text-3xl font-bold capitalize text-gray-800">
                {activeMenu}
              </h2>
            </motion.div>

            {/* Dashboard content switcher */}
            {activeMenu === 'dashboard' && (
              <motion.section
                initial="hidden"
                animate="show"
                variants={staggerContainer}
                className="space-y-6"
              >
                {/* Overview cards with Home.jsx styling */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <motion.div
                    variants={cardVariants}
                    className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition duration-300"
                  >
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      Total Projects
                    </div>
                    <div className="text-3xl font-bold text-[#2563EB]">
                      {loadingKPIs ? (
                        <span className="text-gray-400">...</span>
                      ) : errorKPIs ? (
                        <span className="text-red-500 text-sm">Error</span>
                      ) : (
                        dashboardKPIs.totalProjects
                      )}
                    </div>
                  </motion.div>
                  <motion.div
                    variants={cardVariants}
                    className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition duration-300"
                  >
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      Updates Today
                    </div>
                    <div className="text-3xl font-bold text-[#2563EB]">
                      {loadingKPIs ? (
                        <span className="text-gray-400">...</span>
                      ) : errorKPIs ? (
                        <span className="text-red-500 text-sm">Error</span>
                      ) : (
                        dashboardKPIs.updatesToday
                      )}
                    </div>
                  </motion.div>
                  <motion.div
                    variants={cardVariants}
                    className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition duration-300"
                  >
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      Active Contractors
                    </div>
                    <div className="text-3xl font-bold text-[#2563EB]">
                      {loadingKPIs ? (
                        <span className="text-gray-400">...</span>
                      ) : errorKPIs ? (
                        <span className="text-red-500 text-sm">Error</span>
                      ) : (
                        dashboardKPIs.activeContractors
                      )}
                    </div>
                  </motion.div>
                  <motion.div
                    variants={cardVariants}
                    className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition duration-300"
                  >
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      Pending Requests
                    </div>
                    <div className="text-3xl font-bold text-[#2563EB]">
                      {loadingKPIs ? (
                        <span className="text-gray-400">...</span>
                      ) : errorKPIs ? (
                        <span className="text-red-500 text-sm">Error</span>
                      ) : (
                        dashboardKPIs.pendingRequests
                      )}
                    </div>
                  </motion.div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Map + Filters */}
                  <motion.div
                    variants={cardVariants}
                    className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg border border-gray-100 min-h-[420px]"
                  >
                    <Map
                      location={selectedProject?.location || null}
                      height="384px"
                    />
                  </motion.div>

                  <motion.aside
                    variants={cardVariants}
                    className="bg-white p-6 rounded-xl shadow-lg border border-gray-100"
                  >
                    <h3 className="font-bold text-lg mb-4 text-gray-800">
                      Filters
                    </h3>
                    <div className="space-y-4 text-sm">
                      <div>
                        <Select
                          label="Project"
                          value={selectedProjectId}
                          onChange={(e) => setSelectedProjectId(e.target.value)}
                          options={projectOptions}
                          disabled={loadingProjects}
                        />
                      </div>

                      {/* Project Info Display */}
                      {selectedProject ? (
                        <div className="mt-6 pt-6 border-t border-gray-200">
                          <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3">
                            Project Information
                          </h4>
                          <div className="space-y-3">
                            <div>
                              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                                Name
                              </div>
                              <div className="text-sm font-semibold text-gray-800">
                                {selectedProject.name}
                              </div>
                            </div>
                            <div>
                              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                                Description
                              </div>
                              <div className="text-sm text-gray-700 line-clamp-3">
                                {selectedProject.description}
                              </div>
                            </div>
                            <div>
                              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                                Status
                              </div>
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(
                                  selectedProject.status
                                )}`}
                              >
                                {formatStatus(selectedProject.status)}
                              </span>
                            </div>
                            <div>
                              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                                Budget
                              </div>
                              <div className="text-sm text-gray-700">
                                {formatCurrency(selectedProject.budget)}
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-6 pt-6 border-t border-gray-200">
                          <p className="text-xs text-gray-400 text-center italic">
                            Select a project to view details
                          </p>
                        </div>
                      )}
                    </div>
                  </motion.aside>
                </div>

                {/* Recent updates list with expandable cards */}
                <motion.div
                  variants={cardVariants}
                  className="bg-white p-6 rounded-xl shadow-lg border border-gray-100"
                >
                  <h3 className="font-bold text-xl mb-6" style={{ color: '#1F2937' }}>
                    Recent Updates
                  </h3>
                  {loadingUpdates ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="text-gray-500">Loading updates...</div>
                    </div>
                  ) : errorUpdates ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="text-red-500">{errorUpdates}</div>
                    </div>
                  ) : uploads.length === 0 ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="text-gray-500">No recent updates found</div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {uploads.length > 0 ? (
                        uploads.map((update, index) => (
                          <ExpandableUpdateCard
                            key={update._id || `update-${index}`}
                            update={update}
                            index={index}
                            onSelect={handleItemSelect}
                          />
                        ))
                      ) : (
                        <div className="p-8 text-center border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                          <p className="text-gray-600 font-medium">No updates to display</p>
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>

                {/* Detail panel (slide-in on select) with Home.jsx styling */}
                {selectedItem && (
                  <motion.div
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 100 }}
                    className="fixed right-4 bottom-6 w-full max-w-sm bg-white rounded-xl shadow-2xl p-6 z-50 border border-gray-100"
                  >
                    <div className="flex items-start gap-4">
                      <img
                        src={selectedItem.imageUrl}
                        alt={`Update from ${selectedItem.contractorName}`}
                        className="w-32 h-24 object-cover rounded-lg flex-shrink-0 shadow-md"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.onerror = null;
                          target.src =
                            'https://placehold.co/128x96/cccccc/000000?text=Image';
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-gray-800 truncate mb-1">
                          {selectedItem.contractorName}
                        </div>
                        <div className="text-xs text-[#2563EB] font-medium truncate mb-2">
                          {selectedItem.projectName}
                        </div>
                        <div className="text-sm text-gray-600 mt-2 line-clamp-2 mb-3">
                          {selectedItem.description}
                        </div>
                        {selectedItem.lat && selectedItem.lng && (
                          <div className="text-xs text-gray-500 mt-2 bg-gray-50 px-2 py-1 rounded">
                            Lat: {selectedItem.lat.toFixed(4)}, Lng:{' '}
                            {selectedItem.lng.toFixed(4)}
                          </div>
                        )}
                        <div className="mt-4 flex gap-2 flex-wrap">
                          <button
                            onClick={handleCloseDetail}
                            className="px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-[#2563EB]/10 hover:border-[#2563EB] transition duration-300 font-medium"
                          >
                            Close
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.section>
            )}

            {/* Users Management Page */}
            {activeMenu === 'users' && <UsersPage />}

            {/* Projects Management Page */}
            {activeMenu === 'projects' && <ProjectsPage />}

            {/* Teams Management Page */}
            {activeMenu === 'teams' && <TeamsPage />}

            {/* Requests Management Page */}
            {activeMenu === 'requests' && <RequestsPage />}

            {/* Reports Page */}
            {activeMenu === 'reports' && <ReportsPage />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;

