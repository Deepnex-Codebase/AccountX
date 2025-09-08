import { useState, useEffect } from 'react';

/**
 * Custom hook to track window dimensions
 * @returns {Object} The current window width and height
 */
const useWindowSize = () => {
  // Initialize with default dimensions or current window size
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  useEffect(() => {
    // Handler to call on window resize
    const handleResize = () => {
      // Update window size state
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Call handler right away to update initial size
    handleResize();

    // Remove event listener on cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []); // Empty array ensures effect runs only on mount and unmount

  return windowSize;
};

// Predefined breakpoints matching Tailwind CSS defaults
export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

/**
 * Helper function to check if window width is above a breakpoint
 * @param {number} width - Current window width
 * @param {string|number} breakpoint - Breakpoint to check against
 * @returns {boolean} Whether the window width is above the breakpoint
 */
export const isAboveBreakpoint = (width, breakpoint) => {
  if (typeof breakpoint === 'number') {
    return width >= breakpoint;
  }
  return width >= (breakpoints[breakpoint] || 0);
};

/**
 * Helper function to check if window width is below a breakpoint
 * @param {number} width - Current window width
 * @param {string|number} breakpoint - Breakpoint to check against
 * @returns {boolean} Whether the window width is below the breakpoint
 */
export const isBelowBreakpoint = (width, breakpoint) => {
  if (typeof breakpoint === 'number') {
    return width < breakpoint;
  }
  return width < (breakpoints[breakpoint] || 0);
};

export default useWindowSize;