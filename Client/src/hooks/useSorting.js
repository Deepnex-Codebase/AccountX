import { useState, useCallback, useMemo } from 'react';

/**
 * Custom hook for sorting data
 * @param {Array} data - The data to sort
 * @param {Object} config - The sorting configuration
 * @param {string} config.key - The initial key to sort by
 * @param {string} config.direction - The initial sort direction ('asc' or 'desc')
 * @returns {Object} Sorting state and functions
 */
const useSorting = (data = [], config = { key: null, direction: 'asc' }) => {
  const [sortConfig, setSortConfig] = useState(config);

  // Function to request a sort
  const requestSort = useCallback((key) => {
    let direction = 'asc';
    
    // If we're already sorting by this key, toggle the direction
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    
    setSortConfig({ key, direction });
  }, [sortConfig]);

  // Function to set a specific sort configuration
  const setSort = useCallback((key, direction) => {
    setSortConfig({ key, direction });
  }, []);

  // Function to clear sorting
  const clearSort = useCallback(() => {
    setSortConfig({ key: null, direction: 'asc' });
  }, []);

  // Sort the data based on the current configuration
  const sortedData = useMemo(() => {
    // If no key is provided, return the original data
    if (!sortConfig.key) return data;
    
    // Create a copy of the data to avoid mutating the original
    const sortableData = [...data];
    
    // Sort the data
    sortableData.sort((a, b) => {
      // Handle nested keys (e.g., 'user.name')
      const keyParts = sortConfig.key.split('.');
      let aValue = a;
      let bValue = b;
      
      // Traverse the object to get the nested value
      for (const part of keyParts) {
        aValue = aValue?.[part];
        bValue = bValue?.[part];
      }
      
      // Handle undefined or null values
      if (aValue === undefined || aValue === null) return sortConfig.direction === 'asc' ? -1 : 1;
      if (bValue === undefined || bValue === null) return sortConfig.direction === 'asc' ? 1 : -1;
      
      // Handle different types of values
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortConfig.direction === 'asc' 
          ? aValue.localeCompare(bValue) 
          : bValue.localeCompare(aValue);
      }
      
      // For numbers, dates, and other comparable types
      return sortConfig.direction === 'asc' 
        ? (aValue > bValue ? 1 : -1) 
        : (aValue < bValue ? 1 : -1);
    });
    
    return sortableData;
  }, [data, sortConfig]);

  // Get the current sort direction for a specific key
  const getSortDirection = useCallback((key) => {
    if (sortConfig.key === key) {
      return sortConfig.direction;
    }
    return null;
  }, [sortConfig]);

  return {
    sortedData,
    sortConfig,
    requestSort,
    setSort,
    clearSort,
    getSortDirection,
  };
};

export default useSorting;