import React, { useState, useCallback, memo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import UserDropdown from './UserDropdown';

interface NavbarProps {
  className?: string;
}

/**
 * Navigation component matching contractor theme
 * Uses useAuth hook for authentication state
 */
const Navbar = memo<NavbarProps>(({ className = '' }) => {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();

  const navItems = [
    { name: 'Home', href: '/' },
    { name: 'About Us', href: '/about-us' },
    { name: 'Contact', href: '/contact-us' },
    { name: 'Help', href: '/help' },
  ];

  const handleLogout = useCallback(async () => {
    await logout();
    setIsMenuOpen(false);
  }, [logout]);

  const goAndClose = useCallback(
    (href: string) => {
      setIsMenuOpen(false);
      navigate(href);
    },
    [navigate]
  );

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 bg-white shadow-sm ${className}`}
      aria-label="Main navigation"
    >
      <div className="mx-auto max-w-7xl py-2 px-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-3"
            aria-label="Go to home"
          >
            <span className="text-2xl font-bold text-gray-900">Contractor</span>
          </button>

          {/* Desktop nav (centered) */}
          <div className="hidden md:flex md:flex-1 md:justify-center">
            <ul className="flex items-center gap-8">
              {navItems.map((item) => (
                <li key={item.name}>
                  <button
                    onClick={() => navigate(item.href)}
                    className="text-sm font-medium text-slate-700 hover:text-[#00BFB6] transition"
                  >
                    {item.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Right: CTA (desktop) + mobile hamburger */}
          <div className="flex items-center gap-4">
            {/* Desktop Buttons */}
            <div className="hidden md:flex items-center gap-3">
              {isAuthenticated ? (
                <UserDropdown showDashboardLink={true} />
              ) : (
                <>
                  <button
                    className="rounded-full px-4 py-2 text-sm hover:cursor-pointer font-bold bg-[#00BFB6] border border-[#00BFB6] text-white hover:bg-white hover:text-[#00BFB6] transition"
                    onClick={() => navigate('/admin-login')}
                  >
                    Login
                  </button>
                  <button
                    className="rounded-full px-4 py-2 text-sm hover:cursor-pointer font-bold border border-[#00BFB6] text-[#00BFB6] hover:bg-[#00BFB6] hover:text-white transition"
                    onClick={() => navigate('/admin-register')}
                  >
                    Register
                  </button>
                </>
              )}
            </div>

            {/* Mobile Hamburger */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen((s) => !s)}
                aria-label="Toggle navigation"
                aria-expanded={isMenuOpen}
                className="inline-flex items-center justify-center p-2 rounded-md text-slate-700 hover:text-slate-900 focus:outline-none"
              >
                {isMenuOpen ? (
                  <svg
                    className="h-6 w-6"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                ) : (
                  <svg
                    className="h-6 w-6"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile slide-in panel + overlay */}
        <div
          className={`fixed inset-0 z-40 md:hidden transition-opacity duration-300 ${
            isMenuOpen
              ? 'pointer-events-auto opacity-100'
              : 'pointer-events-none opacity-0'
          }`}
          aria-hidden={!isMenuOpen}
          onClick={() => setIsMenuOpen(false)}
        >
          <div className="absolute inset-0 bg-black bg-opacity-40" />
        </div>

        <aside
          className={`fixed top-0 right-0 z-50 md:hidden h-full w-1/2 max-w-[50%] bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
            isMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
          aria-hidden={!isMenuOpen}
          aria-label="Mobile menu"
        >
          <div className="h-full flex flex-col p-4">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => goAndClose('/')}
                className="flex items-center gap-3"
              >
                <span className="text-xl font-bold text-gray-900">
                  Contractor
                </span>
              </button>

              <button
                onClick={() => setIsMenuOpen(false)}
                aria-label="Close menu"
                className="p-2 rounded-md text-slate-700 hover:text-slate-900 focus:outline-none"
              >
                <svg
                  className="h-6 w-6"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <nav className="flex-1 overflow-auto">
              <ul className="flex flex-col gap-2">
                {navItems.map((item) => (
                  <li key={item.name}>
                    <button
                      onClick={() => goAndClose(item.href)}
                      className="block rounded-md px-3 py-3 text-base font-medium text-slate-700 hover:text-[#00BFB6] hover:bg-gray-50 transition"
                    >
                      {item.name}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="mt-4 border-t border-gray-200 pt-4">
              {isAuthenticated ? (
                <div className="space-y-2">
                  <div className="px-3 py-2 mb-2">
                    <p className="text-sm font-semibold text-gray-800">{user?.name}</p>
                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                  </div>
                  <button
                    onClick={() => goAndClose('/admin-dashboard')}
                    className="w-full rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:text-[#00BFB6] hover:bg-gray-50 transition text-left"
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={() => goAndClose('/admin-profile')}
                    className="w-full rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:text-[#00BFB6] hover:bg-gray-50 transition text-left"
                  >
                    Profile
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full rounded-full px-4 py-3 text-sm font-bold bg-white border border-[#00BFB6] text-[#00BFB6] hover:bg-[#00BFB6] hover:text-white transition mt-3"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => goAndClose('/admin-login')}
                    className="w-full rounded-full px-4 py-3 text-sm font-bold bg-[#00BFB6] border border-[#00BFB6] text-white hover:text-white transition mt-3"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => goAndClose('/admin-register')}
                    className="w-full rounded-full px-4 py-3 text-sm font-bold border border-[#00BFB6] text-[#00BFB6] hover:bg-[#00BFB6] hover:text-white transition mt-3"
                  >
                    Register
                  </button>
                </>
              )}
            </div>
          </div>
        </aside>
      </div>
    </nav>
  );
});

Navbar.displayName = 'Navbar';

export default Navbar;

