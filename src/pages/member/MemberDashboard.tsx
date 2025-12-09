import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogOut } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import UserDropdown from '../../components/UserDropdown';
import MemberProjectsPage from './MemberProjectsPage';
import MemberWorkLogPage from './MemberWorkLogPage';

// Animation variants matching AdminDashboard
const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: (custom = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay: 0.04 * custom },
  }),
};

/**
 * Member Dashboard component
 * Main dashboard for members with sidebar navigation and projects management
 */
const MemberDashboard: React.FC = () => {
  const { logout } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  const menuItems = [
    { key: 'projects', label: 'Projects' },
    { key: 'work-log', label: 'Work Log' },
  ];

  // Get valid menu keys for validation
  const validMenuKeys = useMemo(
    () => new Set(menuItems.map((item) => item.key)),
    []
  );

  // Initialize activeMenu from URL parameter or default to 'projects'
  const getInitialMenu = useCallback((): string => {
    const pageParam = searchParams.get('page');
    if (pageParam && validMenuKeys.has(pageParam)) {
      return pageParam;
    }
    return 'projects';
  }, [searchParams, validMenuKeys]);

  const [activeMenu, setActiveMenu] = useState<string>(getInitialMenu);

  // Sync activeMenu with URL parameter when URL changes (e.g., browser back/forward)
  useEffect(() => {
    const pageParam = searchParams.get('page');
    if (pageParam && validMenuKeys.has(pageParam)) {
      setActiveMenu((currentMenu) => {
        // Only update if different to avoid unnecessary re-renders
        return pageParam !== currentMenu ? pageParam : currentMenu;
      });
    } else {
      // If no page param exists or invalid, set it to 'projects' in URL (replace to avoid adding to history)
      if (!pageParam || !validMenuKeys.has(pageParam)) {
        setSearchParams({ page: 'projects' }, { replace: true });
        setActiveMenu('projects');
      }
    }
  }, [searchParams, validMenuKeys, setSearchParams]);

  const handleMenuClick = useCallback(
    (menuKey: string) => {
      // Validate menu key
      if (!validMenuKeys.has(menuKey)) {
        console.warn(`Invalid menu key: ${menuKey}, defaulting to projects`);
        menuKey = 'projects';
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f7fafd] to-[#F5F7F9]">
      {/* Topbar with Home.jsx styling */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-100 ml-0 md:ml-64">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              {/* Hamburger (mobile) */}
              <button
                className="md:hidden p-2 rounded-lg hover:bg-[#00BFB6]/10 transition duration-300"
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
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#00BFB6] to-[#00a8a0] flex items-center justify-center text-white font-bold shadow-lg">
                  MP
                </div>
                <div className="hidden sm:block font-bold text-gray-800 text-lg">
                  Member Portal
                </div>
              </div>
            </div>

            {/* Search / notifications / profile */}
            <div className="flex-1 px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-end gap-4">
                <div className="hidden sm:flex items-center gap-3">
                  <button
                    className="p-2 rounded-lg hover:bg-[#00BFB6]/10 transition duration-300"
                    title="Notifications"
                    aria-label="Notifications"
                  >
                    <svg
                      className="w-6 h-6 text-gray-700"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                    >
                      <path
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                      />
                    </svg>
                  </button>

                  <div className="pl-3 border-l border-gray-200">
                    <UserDropdown />
                  </div>
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
                      ? 'bg-gradient-to-r from-[#00BFB6] to-[#00a8a0] text-white font-semibold shadow-lg'
                      : 'text-gray-700 hover:bg-[#00BFB6]/10 hover:text-[#00BFB6]'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      activeMenu === menu.key ? 'bg-white' : 'bg-[#00BFB6]'
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
                className="w-full flex items-center justify-center p-3 rounded-lg bg-gradient-to-r from-[#00BFB6] to-[#00a8a0] text-white shadow-lg hover:shadow-xl transition duration-300"
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
                {activeMenu === 'work-log' ? 'Work Log' : activeMenu}
              </h2>
            </motion.div>

            {/* Projects Management Page */}
            {activeMenu === 'projects' && <MemberProjectsPage />}

            {/* Work Log Page */}
            {activeMenu === 'work-log' && <MemberWorkLogPage />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MemberDashboard;

