/**
 * Application constants
 */

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || '/api';

export const PRIMARY_COLOR = '#00BFB6';

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  ABOUT: '/about-us',
  CONTACT: '/contact-us',
  HELP: '/help',
} as const;

