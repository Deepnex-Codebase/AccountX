/**
 * Utility functions for working with browser storage
 */

/**
 * Set an item in localStorage with optional expiration
 * @param {string} key - The key to store the value under
 * @param {any} value - The value to store
 * @param {number} expirationMinutes - Optional expiration time in minutes
 */
export const setLocalStorageItem = (key, value, expirationMinutes = null) => {
  try {
    const item = {
      value,
      timestamp: Date.now(),
    };

    // Add expiration if specified
    if (expirationMinutes) {
      item.expiration = Date.now() + expirationMinutes * 60 * 1000;
    }

    localStorage.setItem(key, JSON.stringify(item));
    return true;
  } catch (error) {
    console.error('Error setting localStorage item:', error);
    return false;
  }
};

/**
 * Get an item from localStorage, respecting expiration
 * @param {string} key - The key to retrieve
 * @param {any} defaultValue - Default value if key doesn't exist or is expired
 * @returns {any} The stored value or defaultValue
 */
export const getLocalStorageItem = (key, defaultValue = null) => {
  try {
    const itemStr = localStorage.getItem(key);
    
    // Return default value if item doesn't exist
    if (!itemStr) {
      return defaultValue;
    }

    const item = JSON.parse(itemStr);
    
    // Check if item has expired
    if (item.expiration && Date.now() > item.expiration) {
      localStorage.removeItem(key);
      return defaultValue;
    }
    
    return item.value;
  } catch (error) {
    console.error('Error getting localStorage item:', error);
    return defaultValue;
  }
};

/**
 * Remove an item from localStorage
 * @param {string} key - The key to remove
 */
export const removeLocalStorageItem = (key) => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error('Error removing localStorage item:', error);
    return false;
  }
};

/**
 * Clear all items from localStorage
 */
export const clearLocalStorage = () => {
  try {
    localStorage.clear();
    return true;
  } catch (error) {
    console.error('Error clearing localStorage:', error);
    return false;
  }
};

/**
 * Set an item in sessionStorage
 * @param {string} key - The key to store the value under
 * @param {any} value - The value to store
 */
export const setSessionStorageItem = (key, value) => {
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error('Error setting sessionStorage item:', error);
    return false;
  }
};

/**
 * Get an item from sessionStorage
 * @param {string} key - The key to retrieve
 * @param {any} defaultValue - Default value if key doesn't exist
 * @returns {any} The stored value or defaultValue
 */
export const getSessionStorageItem = (key, defaultValue = null) => {
  try {
    const itemStr = sessionStorage.getItem(key);
    return itemStr ? JSON.parse(itemStr) : defaultValue;
  } catch (error) {
    console.error('Error getting sessionStorage item:', error);
    return defaultValue;
  }
};

/**
 * Remove an item from sessionStorage
 * @param {string} key - The key to remove
 */
export const removeSessionStorageItem = (key) => {
  try {
    sessionStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error('Error removing sessionStorage item:', error);
    return false;
  }
};

/**
 * Clear all items from sessionStorage
 */
export const clearSessionStorage = () => {
  try {
    sessionStorage.clear();
    return true;
  } catch (error) {
    console.error('Error clearing sessionStorage:', error);
    return false;
  }
};

/**
 * Check if storage is available
 * @param {string} type - The type of storage to check ('localStorage' or 'sessionStorage')
 * @returns {boolean} Whether the storage is available
 */
export const isStorageAvailable = (type) => {
  try {
    const storage = window[type];
    const testKey = '__storage_test__';
    storage.setItem(testKey, testKey);
    storage.removeItem(testKey);
    return true;
  } catch (e) {
    return false;
  }
};