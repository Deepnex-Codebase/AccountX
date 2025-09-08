/**
 * Utility functions for error handling
 */

/**
 * Format API error response
 * @param {Error} error - The error object
 * @returns {Object} Formatted error object
 */
export const formatApiError = (error) => {
  // Default error structure
  const formattedError = {
    message: 'An unexpected error occurred',
    statusCode: 500,
    errors: {},
    originalError: error
  };

  // Handle Axios error responses
  if (error.response) {
    const { data, status } = error.response;
    
    formattedError.statusCode = status;
    
    // Handle different response formats
    if (data) {
      // Extract message
      if (data.message) {
        formattedError.message = data.message;
      } else if (typeof data === 'string') {
        formattedError.message = data;
      }
      
      // Extract validation errors
      if (data.errors) {
        formattedError.errors = data.errors;
      }
    }
    
    // Handle common status codes
    if (status === 401) {
      formattedError.message = data?.message || 'Authentication required';
    } else if (status === 403) {
      formattedError.message = data?.message || 'You do not have permission to perform this action';
    } else if (status === 404) {
      formattedError.message = data?.message || 'The requested resource was not found';
    } else if (status === 422) {
      formattedError.message = data?.message || 'Validation failed';
    }
  } else if (error.request) {
    // Request was made but no response received
    formattedError.message = 'No response received from server';
    formattedError.statusCode = 0;
  } else {
    // Error in setting up the request
    formattedError.message = error.message || 'Error setting up request';
  }

  return formattedError;
};

/**
 * Extract validation errors from API response
 * @param {Error} error - The error object
 * @returns {Object} Object with field names as keys and error messages as values
 */
export const extractValidationErrors = (error) => {
  const formatted = formatApiError(error);
  return formatted.errors || {};
};

/**
 * Handle API errors with a callback
 * @param {Error} error - The error object
 * @param {Function} callback - Callback function to handle the error
 * @returns {Object} Formatted error object
 */
export const handleApiError = (error, callback = null) => {
  const formatted = formatApiError(error);
  
  if (callback && typeof callback === 'function') {
    callback(formatted);
  }
  
  return formatted;
};

/**
 * Log error to console with additional context
 * @param {Error} error - The error object
 * @param {string} context - Context where the error occurred
 * @param {Object} additionalData - Any additional data to log
 */
export const logError = (error, context = '', additionalData = {}) => {
  console.error(`Error in ${context}:`, error);
  
  if (Object.keys(additionalData).length > 0) {
    console.error('Additional data:', additionalData);
  }
  
  // Here you could also send errors to a monitoring service like Sentry
  // if (typeof window !== 'undefined' && window.Sentry) {
  //   window.Sentry.captureException(error, {
  //     tags: { context },
  //     extra: additionalData
  //   });
  // }
};

/**
 * Create a safe function that catches errors
 * @param {Function} fn - The function to make safe
 * @param {Function} errorHandler - Function to handle errors
 * @returns {Function} A function that won't throw errors
 */
export const createSafeFunction = (fn, errorHandler = console.error) => {
  return (...args) => {
    try {
      const result = fn(...args);
      
      // Handle promises
      if (result instanceof Promise) {
        return result.catch(error => {
          errorHandler(error);
          return null;
        });
      }
      
      return result;
    } catch (error) {
      errorHandler(error);
      return null;
    }
  };
};