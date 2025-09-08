import { useState, useCallback, useMemo } from 'react';

/**
 * Custom hook for filtering data
 * @param {Array} data - The data to filter
 * @param {Object} initialFilters - The initial filter values
 * @returns {Object} Filtering state and functions
 */
const useFiltering = (data = [], initialFilters = {}) => {
  const [filters, setFilters] = useState(initialFilters);

  // Set a specific filter value
  const setFilter = useCallback((key, value) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      [key]: value
    }));
  }, []);

  // Set multiple filters at once
  const setMultipleFilters = useCallback((newFilters) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      ...newFilters
    }));
  }, []);

  // Remove a specific filter
  const removeFilter = useCallback((key) => {
    setFilters(prevFilters => {
      const newFilters = { ...prevFilters };
      delete newFilters[key];
      return newFilters;
    });
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  // Reset filters to initial values
  const resetFilters = useCallback(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  // Apply filters to data
  const filteredData = useMemo(() => {
    // If no filters are set, return the original data
    if (Object.keys(filters).length === 0) return data;

    return data.filter(item => {
      // Check each filter
      return Object.entries(filters).every(([key, filterValue]) => {
        // Skip empty filter values
        if (filterValue === '' || filterValue === null || filterValue === undefined) {
          return true;
        }

        // Handle nested keys (e.g., 'user.name')
        const keyParts = key.split('.');
        let itemValue = item;

        // Traverse the object to get the nested value
        for (const part of keyParts) {
          itemValue = itemValue?.[part];
          if (itemValue === undefined || itemValue === null) {
            return false;
          }
        }

        // Different filtering strategies based on filter value type
        if (Array.isArray(filterValue)) {
          // If filter value is an array, check if item value is in the array
          return filterValue.includes(itemValue);
        } else if (typeof filterValue === 'function') {
          // If filter value is a function, use it as a predicate
          return filterValue(itemValue);
        } else if (typeof filterValue === 'object' && filterValue !== null) {
          // If filter value is an object, it might have special operators
          // Example: { $gt: 100, $lt: 200 } for range filtering
          return Object.entries(filterValue).every(([operator, operand]) => {
            switch (operator) {
              case '$eq': return itemValue === operand;
              case '$ne': return itemValue !== operand;
              case '$gt': return itemValue > operand;
              case '$gte': return itemValue >= operand;
              case '$lt': return itemValue < operand;
              case '$lte': return itemValue <= operand;
              case '$in': return Array.isArray(operand) && operand.includes(itemValue);
              case '$nin': return Array.isArray(operand) && !operand.includes(itemValue);
              case '$contains': return String(itemValue).includes(String(operand));
              case '$startsWith': return String(itemValue).startsWith(String(operand));
              case '$endsWith': return String(itemValue).endsWith(String(operand));
              default: return true;
            }
          });
        } else if (typeof itemValue === 'string' && typeof filterValue === 'string') {
          // Case-insensitive string comparison
          return itemValue.toLowerCase().includes(filterValue.toLowerCase());
        } else {
          // Default equality check
          return itemValue === filterValue;
        }
      });
    });
  }, [data, filters]);

  return {
    filters,
    filteredData,
    setFilter,
    setMultipleFilters,
    removeFilter,
    clearFilters,
    resetFilters
  };
};

export default useFiltering;