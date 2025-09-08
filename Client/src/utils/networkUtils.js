/**
 * Utility functions for network operations
 */

/**
 * Check if the device is currently online
 * @returns {boolean} True if online, false otherwise
 */
export const isOnline = () => {
  return typeof navigator !== 'undefined' && navigator.onLine;
};

/**
 * Add event listeners for online/offline status changes
 * @param {Function} onlineCallback - Function to call when device goes online
 * @param {Function} offlineCallback - Function to call when device goes offline
 * @returns {Function} Cleanup function to remove event listeners
 */
export const addNetworkStatusListeners = (onlineCallback, offlineCallback) => {
  if (typeof window === 'undefined') return () => {};
  
  window.addEventListener('online', onlineCallback);
  window.addEventListener('offline', offlineCallback);
  
  return () => {
    window.removeEventListener('online', onlineCallback);
    window.removeEventListener('offline', offlineCallback);
  };
};

/**
 * Create an AbortController with timeout
 * @param {number} timeoutMs - Timeout in milliseconds
 * @returns {Object} Object containing the AbortController and signal
 */
export const createAbortController = (timeoutMs = 30000) => {
  const controller = new AbortController();
  const { signal } = controller;
  
  const timeout = setTimeout(() => {
    controller.abort();
  }, timeoutMs);
  
  // Return cleanup function to clear the timeout
  const clear = () => clearTimeout(timeout);
  
  return { controller, signal, clear };
};

/**
 * Retry a function with exponential backoff
 * @param {Function} fn - The function to retry
 * @param {Object} options - Retry options
 * @param {number} options.maxRetries - Maximum number of retries (default: 3)
 * @param {number} options.initialDelay - Initial delay in ms (default: 1000)
 * @param {number} options.maxDelay - Maximum delay in ms (default: 30000)
 * @param {Function} options.shouldRetry - Function to determine if retry should occur (default: always retry)
 * @returns {Promise} Promise that resolves with the function result or rejects after max retries
 */
export const retryWithBackoff = async (fn, {
  maxRetries = 3,
  initialDelay = 1000,
  maxDelay = 30000,
  shouldRetry = () => true
} = {}) => {
  let retries = 0;
  
  const execute = async () => {
    try {
      return await fn();
    } catch (error) {
      if (retries >= maxRetries || !shouldRetry(error)) {
        throw error;
      }
      
      const delay = Math.min(
        initialDelay * Math.pow(2, retries),
        maxDelay
      );
      
      retries++;
      
      await new Promise(resolve => setTimeout(resolve, delay));
      return execute();
    }
  };
  
  return execute();
};

/**
 * Throttle API requests to avoid rate limiting
 * @param {Function} fn - The function to throttle
 * @param {number} limit - Maximum number of concurrent requests
 * @returns {Function} Throttled function
 */
export const throttleRequests = (fn, limit = 5) => {
  const queue = [];
  let activeCount = 0;
  
  const executeNext = () => {
    if (queue.length === 0 || activeCount >= limit) return;
    
    const { args, resolve, reject } = queue.shift();
    activeCount++;
    
    fn(...args)
      .then(result => {
        resolve(result);
        activeCount--;
        executeNext();
      })
      .catch(error => {
        reject(error);
        activeCount--;
        executeNext();
      });
  };
  
  return (...args) => {
    return new Promise((resolve, reject) => {
      queue.push({ args, resolve, reject });
      executeNext();
    });
  };
};

/**
 * Batch multiple API requests into a single request
 * @param {Function} batchFn - Function to execute the batch request
 * @param {Object} options - Batch options
 * @param {number} options.maxSize - Maximum batch size (default: 10)
 * @param {number} options.maxDelay - Maximum delay before sending batch in ms (default: 100)
 * @returns {Function} Function that returns a promise resolving with the result
 */
export const batchRequests = (batchFn, { maxSize = 10, maxDelay = 100 } = {}) => {
  let batch = [];
  let timer = null;
  
  const processBatch = async () => {
    const currentBatch = [...batch];
    batch = [];
    clearTimeout(timer);
    timer = null;
    
    try {
      const results = await batchFn(currentBatch);
      currentBatch.forEach(({ resolve }, index) => {
        resolve(results[index]);
      });
    } catch (error) {
      currentBatch.forEach(({ reject }) => {
        reject(error);
      });
    }
  };
  
  return (request) => {
    return new Promise((resolve, reject) => {
      batch.push({ request, resolve, reject });
      
      if (batch.length >= maxSize) {
        processBatch();
      } else if (!timer) {
        timer = setTimeout(processBatch, maxDelay);
      }
    });
  };
};

/**
 * Create a cache for API responses
 * @param {Object} options - Cache options
 * @param {number} options.maxSize - Maximum cache size (default: 100)
 * @param {number} options.ttl - Time to live in ms (default: 5 minutes)
 * @returns {Object} Cache object with get, set, and clear methods
 */
export const createApiCache = ({ maxSize = 100, ttl = 5 * 60 * 1000 } = {}) => {
  const cache = new Map();
  
  const get = (key) => {
    if (!cache.has(key)) return null;
    
    const { value, expiry } = cache.get(key);
    
    if (expiry < Date.now()) {
      cache.delete(key);
      return null;
    }
    
    return value;
  };
  
  const set = (key, value) => {
    if (cache.size >= maxSize && !cache.has(key)) {
      // Remove oldest entry
      const oldestKey = cache.keys().next().value;
      cache.delete(oldestKey);
    }
    
    cache.set(key, {
      value,
      expiry: Date.now() + ttl
    });
  };
  
  const clear = () => {
    cache.clear();
  };
  
  // Periodically clean expired items
  const cleanup = () => {
    const now = Date.now();
    for (const [key, { expiry }] of cache.entries()) {
      if (expiry < now) {
        cache.delete(key);
      }
    }
  };
  
  // Run cleanup every minute
  const interval = typeof window !== 'undefined' ? 
    setInterval(cleanup, 60 * 1000) : null;
  
  return {
    get,
    set,
    clear,
    destroy: () => {
      if (interval) clearInterval(interval);
    }
  };
};

/**
 * Create a debounced function
 * @param {Function} fn - The function to debounce
 * @param {number} wait - The debounce wait time in ms
 * @returns {Function} Debounced function
 */
export const debounce = (fn, wait = 300) => {
  let timeout;
  
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      fn(...args);
    };
    
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Create a throttled function
 * @param {Function} fn - The function to throttle
 * @param {number} limit - The throttle limit in ms
 * @returns {Function} Throttled function
 */
export const throttle = (fn, limit = 300) => {
  let inThrottle;
  
  return function executedFunction(...args) {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
};

/**
 * Parse URL query parameters
 * @param {string} queryString - The query string to parse
 * @returns {Object} Parsed query parameters
 */
export const parseQueryParams = (queryString = window.location.search) => {
  const params = {};
  const searchParams = new URLSearchParams(queryString);
  
  for (const [key, value] of searchParams.entries()) {
    // Try to parse JSON values
    try {
      params[key] = JSON.parse(value);
    } catch (e) {
      params[key] = value;
    }
  }
  
  return params;
};

/**
 * Build a URL with query parameters
 * @param {string} url - The base URL
 * @param {Object} params - The query parameters
 * @returns {string} URL with query parameters
 */
export const buildUrl = (url, params = {}) => {
  const urlObj = new URL(url, window.location.origin);
  const searchParams = new URLSearchParams(urlObj.search);
  
  Object.entries(params).forEach(([key, value]) => {
    if (value === null || value === undefined) {
      searchParams.delete(key);
    } else if (typeof value === 'object') {
      searchParams.set(key, JSON.stringify(value));
    } else {
      searchParams.set(key, String(value));
    }
  });
  
  urlObj.search = searchParams.toString();
  return urlObj.toString();
};

/**
 * Download a file from a URL
 * @param {string} url - The URL to download from
 * @param {string} filename - The filename to save as
 */
export const downloadFile = (url, filename) => {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Download data as a file
 * @param {string|Blob} data - The data to download
 * @param {string} filename - The filename to save as
 * @param {string} mimeType - The MIME type of the file
 */
export const downloadData = (data, filename, mimeType = 'text/plain') => {
  const blob = data instanceof Blob ? data : new Blob([data], { type: mimeType });
  const url = URL.createObjectURL(blob);
  
  downloadFile(url, filename);
  
  // Clean up the URL object
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 100);
};

/**
 * Check if a URL is valid
 * @param {string} url - The URL to check
 * @returns {boolean} True if valid, false otherwise
 */
export const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
};

/**
 * Get the base URL of the current page
 * @returns {string} The base URL
 */
export const getBaseUrl = () => {
  if (typeof window === 'undefined') return '';
  return `${window.location.protocol}//${window.location.host}`;
};

/**
 * Get the current URL path
 * @returns {string} The current path
 */
export const getCurrentPath = () => {
  if (typeof window === 'undefined') return '';
  return window.location.pathname;
};