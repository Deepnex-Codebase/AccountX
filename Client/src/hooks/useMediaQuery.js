import { useState, useEffect } from 'react';

/**
 * Custom hook to check if a media query matches
 * @param {string} query - The media query to check
 * @returns {boolean} Whether the media query matches
 */
const useMediaQuery = (query) => {
  // Initialize with the current match state
  const [matches, setMatches] = useState(() => {
    // Check if window is defined (for SSR)
    if (typeof window !== 'undefined') {
      return window.matchMedia(query).matches;
    }
    return false;
  });

  useEffect(() => {
    // Return early if window is not defined (for SSR)
    if (typeof window === 'undefined') {
      return () => {};
    }

    // Create a media query list
    const mediaQueryList = window.matchMedia(query);
    
    // Update the state when matches change
    const updateMatches = (e) => {
      setMatches(e.matches);
    };

    // Add the listener
    // Use the modern addEventListener if available, otherwise use addListener
    if (mediaQueryList.addEventListener) {
      mediaQueryList.addEventListener('change', updateMatches);
    } else {
      // For older browsers
      mediaQueryList.addListener(updateMatches);
    }

    // Initial check
    setMatches(mediaQueryList.matches);

    // Clean up
    return () => {
      if (mediaQueryList.removeEventListener) {
        mediaQueryList.removeEventListener('change', updateMatches);
      } else {
        // For older browsers
        mediaQueryList.removeListener(updateMatches);
      }
    };
  }, [query]);

  return matches;
};

// Common media query breakpoints
export const breakpoints = {
  sm: '(min-width: 640px)',
  md: '(min-width: 768px)',
  lg: '(min-width: 1024px)',
  xl: '(min-width: 1280px)',
  '2xl': '(min-width: 1536px)',
  dark: '(prefers-color-scheme: dark)',
  light: '(prefers-color-scheme: light)',
  portrait: '(orientation: portrait)',
  landscape: '(orientation: landscape)',
};

export default useMediaQuery;