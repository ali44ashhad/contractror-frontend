/**
 * iOS Safari detection utility
 * Detects iOS Safari and Chrome on iOS (both use WebKit)
 */

/**
 * Check if the current browser is iOS Safari or Chrome on iOS
 * iOS Safari has issues with cross-site cookies, so we need to use Authorization header fallback
 */
export const isIOSSafari = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const userAgent = window.navigator.userAgent;
  
  // Detect iOS Safari or Chrome on iOS (both use WebKit)
  // iOS Safari: contains "iPhone" or "iPad" and "Safari" but not "Chrome"
  // iOS Chrome: contains "iPhone" or "iPad" and "CriOS" (Chrome on iOS)
  const isIOS = /iPhone|iPad|iPod/.test(userAgent);
  const isSafari = /Safari/.test(userAgent) && !/Chrome|CriOS|FxiOS/.test(userAgent);
  const isIOSChrome = /CriOS/.test(userAgent);
  
  return isIOS && (isSafari || isIOSChrome);
};

/**
 * Storage key for iOS Safari token fallback
 */
const TOKEN_STORAGE_KEY = 'auth_token_ios_fallback';

/**
 * Store token for iOS Safari fallback
 */
export const storeTokenForIOS = (token: string): void => {
  if (isIOSSafari()) {
    try {
      // Use sessionStorage for better security (cleared on tab close)
      sessionStorage.setItem(TOKEN_STORAGE_KEY, token);
    } catch (error) {
      // Storage might be disabled or full
      console.warn('Failed to store token for iOS Safari:', error);
    }
  }
};

/**
 * Get stored token for iOS Safari fallback
 */
export const getTokenForIOS = (): string | null => {
  if (isIOSSafari()) {
    try {
      return sessionStorage.getItem(TOKEN_STORAGE_KEY);
    } catch (error) {
      return null;
    }
  }
  return null;
};

/**
 * Clear stored token for iOS Safari fallback
 */
export const clearTokenForIOS = (): void => {
  if (isIOSSafari()) {
    try {
      sessionStorage.removeItem(TOKEN_STORAGE_KEY);
    } catch (error) {
      // Ignore errors
    }
  }
};

