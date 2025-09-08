/**
 * Utility functions for date handling
 */

/**
 * Format a date to a string using Intl.DateTimeFormat
 * @param {Date|string|number} date - The date to format
 * @param {Object} options - Intl.DateTimeFormat options
 * @param {string} locale - The locale to use
 * @returns {string} Formatted date string
 */
export const formatDate = (date, options = {}, locale = 'en-US') => {
  if (!date) return '';
  
  try {
    const dateObj = date instanceof Date ? date : new Date(date);
    
    // Default options for date format
    const defaultOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      ...options
    };
    
    return new Intl.DateTimeFormat(locale, defaultOptions).format(dateObj);
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
};

/**
 * Format a date to a string with time using Intl.DateTimeFormat
 * @param {Date|string|number} date - The date to format
 * @param {Object} options - Intl.DateTimeFormat options
 * @param {string} locale - The locale to use
 * @returns {string} Formatted date and time string
 */
export const formatDateTime = (date, options = {}, locale = 'en-US') => {
  if (!date) return '';
  
  try {
    const dateObj = date instanceof Date ? date : new Date(date);
    
    // Default options for date and time format
    const defaultOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      ...options
    };
    
    return new Intl.DateTimeFormat(locale, defaultOptions).format(dateObj);
  } catch (error) {
    console.error('Error formatting date and time:', error);
    return '';
  }
};

/**
 * Format a date to ISO string (YYYY-MM-DD)
 * @param {Date|string|number} date - The date to format
 * @returns {string} ISO formatted date string
 */
export const formatISODate = (date) => {
  if (!date) return '';
  
  try {
    const dateObj = date instanceof Date ? date : new Date(date);
    return dateObj.toISOString().split('T')[0];
  } catch (error) {
    console.error('Error formatting ISO date:', error);
    return '';
  }
};

/**
 * Get the difference between two dates in days
 * @param {Date|string|number} date1 - The first date
 * @param {Date|string|number} date2 - The second date
 * @returns {number} The difference in days
 */
export const getDaysDifference = (date1, date2) => {
  if (!date1 || !date2) return 0;
  
  try {
    const d1 = date1 instanceof Date ? date1 : new Date(date1);
    const d2 = date2 instanceof Date ? date2 : new Date(date2);
    
    // Convert to UTC to avoid timezone issues
    const utc1 = Date.UTC(d1.getFullYear(), d1.getMonth(), d1.getDate());
    const utc2 = Date.UTC(d2.getFullYear(), d2.getMonth(), d2.getDate());
    
    // Calculate difference in days
    const MS_PER_DAY = 1000 * 60 * 60 * 24;
    return Math.floor((utc2 - utc1) / MS_PER_DAY);
  } catch (error) {
    console.error('Error calculating days difference:', error);
    return 0;
  }
};

/**
 * Add days to a date
 * @param {Date|string|number} date - The date to add days to
 * @param {number} days - The number of days to add
 * @returns {Date} The new date
 */
export const addDays = (date, days) => {
  if (!date) return new Date();
  
  try {
    const dateObj = date instanceof Date ? new Date(date) : new Date(date);
    dateObj.setDate(dateObj.getDate() + days);
    return dateObj;
  } catch (error) {
    console.error('Error adding days to date:', error);
    return new Date();
  }
};

/**
 * Add months to a date
 * @param {Date|string|number} date - The date to add months to
 * @param {number} months - The number of months to add
 * @returns {Date} The new date
 */
export const addMonths = (date, months) => {
  if (!date) return new Date();
  
  try {
    const dateObj = date instanceof Date ? new Date(date) : new Date(date);
    dateObj.setMonth(dateObj.getMonth() + months);
    return dateObj;
  } catch (error) {
    console.error('Error adding months to date:', error);
    return new Date();
  }
};

/**
 * Get the start of a day (00:00:00)
 * @param {Date|string|number} date - The date
 * @returns {Date} The start of the day
 */
export const startOfDay = (date) => {
  if (!date) return new Date();
  
  try {
    const dateObj = date instanceof Date ? new Date(date) : new Date(date);
    dateObj.setHours(0, 0, 0, 0);
    return dateObj;
  } catch (error) {
    console.error('Error getting start of day:', error);
    return new Date();
  }
};

/**
 * Get the end of a day (23:59:59.999)
 * @param {Date|string|number} date - The date
 * @returns {Date} The end of the day
 */
export const endOfDay = (date) => {
  if (!date) return new Date();
  
  try {
    const dateObj = date instanceof Date ? new Date(date) : new Date(date);
    dateObj.setHours(23, 59, 59, 999);
    return dateObj;
  } catch (error) {
    console.error('Error getting end of day:', error);
    return new Date();
  }
};

/**
 * Get the start of a month
 * @param {Date|string|number} date - The date
 * @returns {Date} The start of the month
 */
export const startOfMonth = (date) => {
  if (!date) return new Date();
  
  try {
    const dateObj = date instanceof Date ? new Date(date) : new Date(date);
    dateObj.setDate(1);
    dateObj.setHours(0, 0, 0, 0);
    return dateObj;
  } catch (error) {
    console.error('Error getting start of month:', error);
    return new Date();
  }
};

/**
 * Get the end of a month
 * @param {Date|string|number} date - The date
 * @returns {Date} The end of the month
 */
export const endOfMonth = (date) => {
  if (!date) return new Date();
  
  try {
    const dateObj = date instanceof Date ? new Date(date) : new Date(date);
    dateObj.setMonth(dateObj.getMonth() + 1);
    dateObj.setDate(0);
    dateObj.setHours(23, 59, 59, 999);
    return dateObj;
  } catch (error) {
    console.error('Error getting end of month:', error);
    return new Date();
  }
};

/**
 * Get the start of a year
 * @param {Date|string|number} date - The date
 * @returns {Date} The start of the year
 */
export const startOfYear = (date) => {
  if (!date) return new Date();
  
  try {
    const dateObj = date instanceof Date ? new Date(date) : new Date(date);
    dateObj.setMonth(0, 1);
    dateObj.setHours(0, 0, 0, 0);
    return dateObj;
  } catch (error) {
    console.error('Error getting start of year:', error);
    return new Date();
  }
};

/**
 * Get the end of a year
 * @param {Date|string|number} date - The date
 * @returns {Date} The end of the year
 */
export const endOfYear = (date) => {
  if (!date) return new Date();
  
  try {
    const dateObj = date instanceof Date ? new Date(date) : new Date(date);
    dateObj.setMonth(11, 31);
    dateObj.setHours(23, 59, 59, 999);
    return dateObj;
  } catch (error) {
    console.error('Error getting end of year:', error);
    return new Date();
  }
};

/**
 * Check if a date is today
 * @param {Date|string|number} date - The date to check
 * @returns {boolean} Whether the date is today
 */
export const isToday = (date) => {
  if (!date) return false;
  
  try {
    const dateObj = date instanceof Date ? date : new Date(date);
    const today = new Date();
    
    return (
      dateObj.getDate() === today.getDate() &&
      dateObj.getMonth() === today.getMonth() &&
      dateObj.getFullYear() === today.getFullYear()
    );
  } catch (error) {
    console.error('Error checking if date is today:', error);
    return false;
  }
};

/**
 * Get a relative time string (e.g., "2 hours ago", "in 3 days")
 * @param {Date|string|number} date - The date to format
 * @param {Object} options - Intl.RelativeTimeFormat options
 * @param {string} locale - The locale to use
 * @returns {string} Relative time string
 */
export const getRelativeTimeString = (date, options = {}, locale = 'en-US') => {
  if (!date) return '';
  
  try {
    const dateObj = date instanceof Date ? date : new Date(date);
    const now = new Date();
    const diffInSeconds = Math.floor((dateObj - now) / 1000);
    const formatter = new Intl.RelativeTimeFormat(locale, {
      numeric: 'auto',
      style: 'long',
      ...options
    });
    
    // Define time units and their values in seconds
    const units = [
      { unit: 'year', seconds: 31536000 },
      { unit: 'month', seconds: 2592000 },
      { unit: 'week', seconds: 604800 },
      { unit: 'day', seconds: 86400 },
      { unit: 'hour', seconds: 3600 },
      { unit: 'minute', seconds: 60 },
      { unit: 'second', seconds: 1 }
    ];
    
    // Find the appropriate unit
    for (const { unit, seconds } of units) {
      if (Math.abs(diffInSeconds) >= seconds || unit === 'second') {
        return formatter.format(Math.round(diffInSeconds / seconds), unit);
      }
    }
    
    return '';
  } catch (error) {
    console.error('Error formatting relative time:', error);
    return '';
  }
};