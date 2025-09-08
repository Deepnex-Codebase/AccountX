import { useState, useEffect } from 'react';

/**
 * Custom hook for managing dark mode with localStorage persistence
 * @param {string} key - The localStorage key to use
 * @param {boolean} initialValue - The initial dark mode value
 * @returns {Array} [isDarkMode, setDarkMode, toggleDarkMode]
 */
const useDarkMode = (key = 'darkMode', initialValue = false) => {
  // Initialize state from localStorage or use initialValue
  const [isDarkMode, setDarkMode] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item !== null ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error('Error reading dark mode from localStorage:', error);
      return initialValue;
    }
  });

  // Update localStorage when dark mode changes
  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(isDarkMode));
      
      // Apply or remove dark class to/from document body
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch (error) {
      console.error('Error saving dark mode to localStorage:', error);
    }
  }, [isDarkMode, key]);

  // Toggle function for dark mode
  const toggleDarkMode = () => {
    setDarkMode(prevMode => !prevMode);
  };

  return [isDarkMode, setDarkMode, toggleDarkMode];
};

export default useDarkMode;