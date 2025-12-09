import React from 'react';
import { getLocationCoordinates } from '../utils/maps';

interface MapProps {
  location: string | null;
  height?: string;
}

/**
 * Map component that displays a location using Google Maps iframe
 * Uses Google Maps standard URL format that works in iframes
 */
const Map: React.FC<MapProps> = ({ location, height = '100%' }) => {
  const [embedUrl, setEmbedUrl] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!location) {
      setEmbedUrl(null);
      setError(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    // Generate Google Maps embed URL
    const generateEmbedUrl = async () => {
      try {
        // If it's already a Google Maps URL, try to extract coordinates
        if (location.startsWith('http://') || location.startsWith('https://')) {
          const coords = await getLocationCoordinates(location);
          if (coords) {
            // Use coordinates in the embed URL
            setEmbedUrl(`https://www.google.com/maps?q=${coords.lat},${coords.lng}&output=embed`);
          } else {
            // If we can't extract coordinates, try to use the URL's query parameter
            // Extract the query from Google Maps URL if possible
            const urlObj = new URL(location);
            const query = urlObj.searchParams.get('q') || urlObj.pathname.split('/').pop() || location;
            const encodedQuery = encodeURIComponent(query);
            setEmbedUrl(`https://www.google.com/maps?q=${encodedQuery}&output=embed`);
          }
        } else {
          // For plain addresses, use them directly
          const encodedLocation = encodeURIComponent(location);
          setEmbedUrl(`https://www.google.com/maps?q=${encodedLocation}&output=embed`);
        }
        setIsLoading(false);
      } catch (err) {
        console.error('Error generating embed URL:', err);
        setError('Failed to load location');
        setIsLoading(false);
      }
    };

    generateEmbedUrl();
  }, [location]);

  if (!location) {
    return (
      <div
        className="flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-dashed border-gray-200 rounded-xl"
        style={{ height }}
      >
        <div className="text-center">
          <svg
            className="w-16 h-16 mx-auto mb-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
            />
          </svg>
          <p className="text-sm font-medium text-gray-400">
            Select a project to view its location
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div
        className="flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-dashed border-gray-200 rounded-xl"
        style={{ height }}
      >
        <div className="text-center">
          <svg
            className="animate-spin w-12 h-12 mx-auto mb-4 text-[#00BFB6]"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <p className="text-sm font-medium text-gray-600">Loading map...</p>
        </div>
      </div>
    );
  }

  if (error || !embedUrl) {
    return (
      <div
        className="flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-dashed border-gray-200 rounded-xl"
        style={{ height }}
      >
        <div className="text-center">
          <svg
            className="w-16 h-16 mx-auto mb-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <p className="text-sm font-medium text-gray-400">
            {error || 'Location not found'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl overflow-hidden border-2 border-gray-200" style={{ height }}>
      <iframe
        width="100%"
        height="100%"
        style={{ border: 0 }}
        loading="lazy"
        allowFullScreen
        referrerPolicy="no-referrer-when-downgrade"
        src={embedUrl}
        title="Project Location Map"
      />
    </div>
  );
};

export default Map;

