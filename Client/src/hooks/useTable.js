import { useMemo } from 'react';
import usePagination from './usePagination';
import useSorting from './useSorting';
import useFiltering from './useFiltering';

/**
 * Custom hook that combines pagination, sorting, and filtering for tables
 * @param {Object} options - Table options
 * @param {Array} options.data - The data to display in the table
 * @param {Object} options.initialFilters - Initial filter values
 * @param {Object} options.initialSort - Initial sort configuration
 * @param {number} options.initialPage - Initial page number
 * @param {number} options.pageSize - Number of items per page
 * @param {number} options.siblingsCount - Number of siblings to show in pagination
 * @returns {Object} Combined table state and functions
 */
const useTable = ({
  data = [],
  initialFilters = {},
  initialSort = { key: null, direction: 'asc' },
  initialPage = 1,
  pageSize = 10,
  siblingsCount = 1,
}) => {
  // Set up filtering
  const {
    filters,
    filteredData,
    setFilter,
    setMultipleFilters,
    removeFilter,
    clearFilters,
    resetFilters
  } = useFiltering(data, initialFilters);

  // Set up sorting on the filtered data
  const {
    sortedData,
    sortConfig,
    requestSort,
    setSort,
    clearSort,
    getSortDirection
  } = useSorting(filteredData, initialSort);

  // Calculate total items after filtering
  const totalItems = useMemo(() => sortedData.length, [sortedData]);

  // Set up pagination on the sorted and filtered data
  const {
    currentPage,
    pageSize: currentPageSize,
    totalPages,
    paginationRange,
    goToPage,
    nextPage,
    prevPage,
    changePageSize,
    getCurrentPageItems
  } = usePagination({
    totalItems,
    initialPage,
    itemsPerPage: pageSize,
    siblingsCount
  });

  // Get the current page data
  const currentPageData = useMemo(() => {
    return getCurrentPageItems(sortedData);
  }, [sortedData, getCurrentPageItems]);

  // Reset to first page when filters or sort change
  useMemo(() => {
    if (currentPage !== 1) {
      goToPage(1);
    }
  }, [filters, sortConfig, goToPage, currentPage]);

  return {
    // Data
    data: currentPageData,
    totalItems,
    
    // Filtering
    filters,
    setFilter,
    setMultipleFilters,
    removeFilter,
    clearFilters,
    resetFilters,
    
    // Sorting
    sortConfig,
    requestSort,
    setSort,
    clearSort,
    getSortDirection,
    
    // Pagination
    currentPage,
    pageSize: currentPageSize,
    totalPages,
    paginationRange,
    goToPage,
    nextPage,
    prevPage,
    changePageSize,
    
    // Combined actions
    resetAll: () => {
      resetFilters();
      clearSort();
      goToPage(1);
    }
  };
};

export default useTable;