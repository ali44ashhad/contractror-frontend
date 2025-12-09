# Construction Client

A production-ready React + TypeScript frontend application for the Construction Management System.

## Features

- **TypeScript** - Full type safety
- **React 18** - Modern React with hooks
- **Vite** - Fast build tool and dev server
- **TailwindCSS v4** - Utility-first CSS framework
- **Framer Motion** - Smooth animations
- **React Router** - Client-side routing
- **Axios** - HTTP client with interceptors
- **ESLint** - Code linting

## Project Structure

```
src/
  components/     # Reusable UI components
  hooks/         # Custom React hooks
  pages/         # Page components
  layouts/       # Layout components
  services/      # API service functions
  utils/         # Utility functions
  types/         # TypeScript type definitions
  assets/        # Images, fonts, etc.
  data/          # Static data files
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### Development

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Code Standards

This project follows strict production-grade rules:

- All API calls must be in `services/` directory
- Business logic in hooks, not components
- TypeScript interfaces for all props
- React.memo, useCallback, useMemo for optimization
- Functional components only
- No unused imports or console.logs
- Proper error handling

See `rules.md` for complete guidelines.

## API Integration

The app uses httpOnly cookies for authentication. The backend automatically sets cookies on login/register, and Axios is configured to send cookies with all requests via `withCredentials: true`.

## Theme

Primary color: `#00BFB6` (teal)

All styling uses TailwindCSS utility classes matching the contractor theme.

# contractror-frontend
