/**
 * Map utility functions
 */

export interface Coordinates {
  lat: number;
  lng: number;
}

/**
 * Generates a Google Maps URL for a given location
 * If the location is already a URL, returns it directly
 * Otherwise, generates a Google Maps search URL
 * Google Maps works universally across all platforms and browsers
 * @param location - The location string (URL, address, place name, etc.)
 * @returns Google Maps URL
 */
export const getMapUrl = (location: string): string => {
  // Check if location is already a URL (starts with http:// or https://)
  if (location.startsWith('http://') || location.startsWith('https://')) {
    return location;
  }
  
  // Otherwise, generate a Google Maps search URL
  const encodedLocation = encodeURIComponent(location);
  return `https://www.google.com/maps/search/?api=1&query=${encodedLocation}`;
};

/**
 * Extracts coordinates from a Google Maps URL if possible
 * @param url - Google Maps URL
 * @returns Coordinates if found, null otherwise
 */
const extractCoordinatesFromGoogleMapsUrl = (url: string): Coordinates | null => {
  try {
    // Try to extract coordinates from various Google Maps URL formats
    // Format 1: https://www.google.com/maps/@lat,lng,zoom
    const atMatch = url.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/);
    if (atMatch) {
      return {
        lat: parseFloat(atMatch[1]),
        lng: parseFloat(atMatch[2]),
      };
    }

    // Format 2: https://www.google.com/maps?q=lat,lng
    const qMatch = url.match(/[?&]q=(-?\d+\.?\d*),(-?\d+\.?\d*)/);
    if (qMatch) {
      return {
        lat: parseFloat(qMatch[1]),
        lng: parseFloat(qMatch[2]),
      };
    }

    // Format 3: https://www.google.com/maps/place/.../@lat,lng
    const placeMatch = url.match(/\/place\/[^@]+@(-?\d+\.?\d*),(-?\d+\.?\d*)/);
    if (placeMatch) {
      return {
        lat: parseFloat(placeMatch[1]),
        lng: parseFloat(placeMatch[2]),
      };
    }

    return null;
  } catch (error) {
    console.error('Error extracting coordinates from URL:', error);
    return null;
  }
};

/**
 * Geocodes an address string to coordinates using Nominatim (OpenStreetMap)
 * @param address - Address string to geocode
 * @returns Promise resolving to coordinates or null if geocoding fails
 */
const geocodeAddress = async (address: string): Promise<Coordinates | null> => {
  try {
    const encodedAddress = encodeURIComponent(address);
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1`,
      {
        headers: {
          'User-Agent': 'Construction Management App', // Required by Nominatim
        },
      }
    );

    if (!response.ok) {
      throw new Error('Geocoding request failed');
    }

    const data = await response.json();
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
      };
    }

    return null;
  } catch (error) {
    console.error('Error geocoding address:', error);
    return null;
  }
};

/**
 * Converts a location string (URL or address) to coordinates
 * @param location - Location string (can be Google Maps URL or address)
 * @returns Promise resolving to coordinates or null if conversion fails
 */
export const getLocationCoordinates = async (location: string): Promise<Coordinates | null> => {
  if (!location || !location.trim()) {
    return null;
  }

  // If it's a URL, try to extract coordinates first
  if (location.startsWith('http://') || location.startsWith('https://')) {
    const coords = extractCoordinatesFromGoogleMapsUrl(location);
    if (coords) {
      return coords;
    }
    // If extraction failed, try geocoding the URL as an address
    return geocodeAddress(location);
  }

  // Otherwise, geocode the address
  return geocodeAddress(location);
};

