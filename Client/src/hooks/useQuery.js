import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import apiService from '../services/apiService';

/**
 * Custom hook for fetching data using React Query
 * @param {string} endpoint - API endpoint
 * @param {Object} params - Query parameters
 * @param {Object} options - React Query options
 * @returns {Object} Query result
 */
export const useFetchQuery = (endpoint, params = {}, options = {}) => {
  const queryKey = options.queryKey || [endpoint, params];
  
  return useQuery({
    queryKey,
    queryFn: async () => {
      const response = await apiService.get(endpoint, { params });
      return response.data;
    },
    onError: (error) => {
      const message = error.response?.data?.message || error.message || 'An error occurred';
      if (options.showErrorToast !== false) {
        toast.error(message);
      }
      if (options.onError) {
        options.onError(error);
      }
    },
    ...options
  });
};

/**
 * Custom hook for creating data using React Query
 * @param {string} endpoint - API endpoint
 * @param {Object} options - React Query options
 * @returns {Object} Mutation result
 */
export const useCreateMutation = (endpoint, options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data) => {
      const response = await apiService.post(endpoint, data);
      return response.data;
    },
    onSuccess: (data, variables, context) => {
      if (options.invalidateQueries !== false) {
        // Invalidate queries to refetch data
        const queriesToInvalidate = options.invalidateQueries || [endpoint];
        queriesToInvalidate.forEach(query => {
          queryClient.invalidateQueries({ queryKey: [query] });
        });
      }
      
      if (options.showSuccessToast !== false) {
        toast.success(options.successMessage || 'Created successfully');
      }
      
      if (options.onSuccess) {
        options.onSuccess(data, variables, context);
      }
    },
    onError: (error, variables, context) => {
      const message = error.response?.data?.message || error.message || 'Failed to create';
      
      if (options.showErrorToast !== false) {
        toast.error(message);
      }
      
      if (options.onError) {
        options.onError(error, variables, context);
      }
    },
    ...options
  });
};

/**
 * Custom hook for updating data using React Query
 * @param {string} endpoint - API endpoint
 * @param {Object} options - React Query options
 * @returns {Object} Mutation result
 */
export const useUpdateMutation = (endpoint, options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await apiService.put(`${endpoint}/${id}`, data);
      return response.data;
    },
    onSuccess: (data, variables, context) => {
      if (options.invalidateQueries !== false) {
        // Invalidate queries to refetch data
        const queriesToInvalidate = options.invalidateQueries || [endpoint];
        queriesToInvalidate.forEach(query => {
          queryClient.invalidateQueries({ queryKey: [query] });
        });
      }
      
      if (options.showSuccessToast !== false) {
        toast.success(options.successMessage || 'Updated successfully');
      }
      
      if (options.onSuccess) {
        options.onSuccess(data, variables, context);
      }
    },
    onError: (error, variables, context) => {
      const message = error.response?.data?.message || error.message || 'Failed to update';
      
      if (options.showErrorToast !== false) {
        toast.error(message);
      }
      
      if (options.onError) {
        options.onError(error, variables, context);
      }
    },
    ...options
  });
};

/**
 * Custom hook for deleting data using React Query
 * @param {string} endpoint - API endpoint
 * @param {Object} options - React Query options
 * @returns {Object} Mutation result
 */
export const useDeleteMutation = (endpoint, options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id) => {
      const response = await apiService.delete(`${endpoint}/${id}`);
      return response.data;
    },
    onSuccess: (data, variables, context) => {
      if (options.invalidateQueries !== false) {
        // Invalidate queries to refetch data
        const queriesToInvalidate = options.invalidateQueries || [endpoint];
        queriesToInvalidate.forEach(query => {
          queryClient.invalidateQueries({ queryKey: [query] });
        });
      }
      
      if (options.showSuccessToast !== false) {
        toast.success(options.successMessage || 'Deleted successfully');
      }
      
      if (options.onSuccess) {
        options.onSuccess(data, variables, context);
      }
    },
    onError: (error, variables, context) => {
      const message = error.response?.data?.message || error.message || 'Failed to delete';
      
      if (options.showErrorToast !== false) {
        toast.error(message);
      }
      
      if (options.onError) {
        options.onError(error, variables, context);
      }
    },
    ...options
  });
};

/**
 * Custom hook for batch operations using React Query
 * @param {string} endpoint - API endpoint
 * @param {Object} options - React Query options
 * @returns {Object} Mutation result
 */
export const useBatchMutation = (endpoint, options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data) => {
      const response = await apiService.post(`${endpoint}/batch`, data);
      return response.data;
    },
    onSuccess: (data, variables, context) => {
      if (options.invalidateQueries !== false) {
        // Invalidate queries to refetch data
        const queriesToInvalidate = options.invalidateQueries || [endpoint];
        queriesToInvalidate.forEach(query => {
          queryClient.invalidateQueries({ queryKey: [query] });
        });
      }
      
      if (options.showSuccessToast !== false) {
        toast.success(options.successMessage || 'Operation completed successfully');
      }
      
      if (options.onSuccess) {
        options.onSuccess(data, variables, context);
      }
    },
    onError: (error, variables, context) => {
      const message = error.response?.data?.message || error.message || 'Operation failed';
      
      if (options.showErrorToast !== false) {
        toast.error(message);
      }
      
      if (options.onError) {
        options.onError(error, variables, context);
      }
    },
    ...options
  });
};