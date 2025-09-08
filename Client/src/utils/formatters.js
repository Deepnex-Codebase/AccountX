/**
 * Format a number as currency
 * @param {number} amount - The amount to format
 * @param {string} currency - The currency code (default: 'INR')
 * @param {string} locale - The locale to use for formatting (default: 'en-IN')
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currency = 'INR', locale = 'en-IN') => {
  if (amount === null || amount === undefined) return '-';
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Format a number with commas as thousands separators
 * @param {number} number - The number to format
 * @param {number} decimals - Number of decimal places (default: 2)
 * @param {string} locale - The locale to use for formatting (default: 'en-IN')
 * @returns {string} Formatted number string
 */
export const formatNumber = (number, decimals = 2, locale = 'en-IN') => {
  if (number === null || number === undefined) return '-';
  
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(number);
};

/**
 * Format a date string to a readable format
 * @param {string|Date} date - The date to format
 * @param {string} format - The format to use (default: 'medium')
 * @param {string} locale - The locale to use for formatting (default: 'en-IN')
 * @returns {string} Formatted date string
 */
export const formatDate = (date, format = 'medium', locale = 'en-IN') => {
  if (!date) return '-';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) return 'Invalid Date';
  
  const options = {};
  
  switch (format) {
    case 'short':
      options.year = 'numeric';
      options.month = 'numeric';
      options.day = 'numeric';
      break;
    case 'medium':
      options.year = 'numeric';
      options.month = 'short';
      options.day = 'numeric';
      break;
    case 'long':
      options.year = 'numeric';
      options.month = 'long';
      options.day = 'numeric';
      break;
    case 'full':
      options.weekday = 'long';
      options.year = 'numeric';
      options.month = 'long';
      options.day = 'numeric';
      break;
    default:
      return dateObj.toLocaleDateString(locale);
  }
  
  return dateObj.toLocaleDateString(locale, options);
};

/**
 * Format a date and time string to a readable format
 * @param {string|Date} datetime - The datetime to format
 * @param {string} format - The format to use (default: 'medium')
 * @param {string} locale - The locale to use for formatting (default: 'en-IN')
 * @returns {string} Formatted datetime string
 */
export const formatDateTime = (datetime, format = 'medium', locale = 'en-IN') => {
  if (!datetime) return '-';
  
  const dateObj = typeof datetime === 'string' ? new Date(datetime) : datetime;
  
  if (isNaN(dateObj.getTime())) return 'Invalid Date';
  
  const dateOptions = {};
  const timeOptions = {};
  
  switch (format) {
    case 'short':
      dateOptions.year = 'numeric';
      dateOptions.month = 'numeric';
      dateOptions.day = 'numeric';
      timeOptions.hour = 'numeric';
      timeOptions.minute = 'numeric';
      break;
    case 'medium':
      dateOptions.year = 'numeric';
      dateOptions.month = 'short';
      dateOptions.day = 'numeric';
      timeOptions.hour = 'numeric';
      timeOptions.minute = 'numeric';
      timeOptions.second = 'numeric';
      break;
    case 'long':
      dateOptions.year = 'numeric';
      dateOptions.month = 'long';
      dateOptions.day = 'numeric';
      timeOptions.hour = 'numeric';
      timeOptions.minute = 'numeric';
      timeOptions.second = 'numeric';
      timeOptions.timeZoneName = 'short';
      break;
    default:
      return `${dateObj.toLocaleDateString(locale)} ${dateObj.toLocaleTimeString(locale)}`;
  }
  
  return `${dateObj.toLocaleDateString(locale, dateOptions)} ${dateObj.toLocaleTimeString(locale, timeOptions)}`;
};

/**
 * Format a percentage value
 * @param {number} value - The value to format as percentage
 * @param {number} decimals - Number of decimal places (default: 2)
 * @param {string} locale - The locale to use for formatting (default: 'en-IN')
 * @returns {string} Formatted percentage string
 */
export const formatPercentage = (value, decimals = 2, locale = 'en-IN') => {
  if (value === null || value === undefined) return '-';
  
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value / 100);
};

/**
 * Truncate a string to a specified length and add ellipsis if needed
 * @param {string} str - The string to truncate
 * @param {number} length - Maximum length before truncation (default: 50)
 * @returns {string} Truncated string
 */
export const truncateString = (str, length = 50) => {
  if (!str) return '';
  
  if (str.length <= length) return str;
  
  return `${str.substring(0, length)}...`;
};

/**
 * Convert a string to title case
 * @param {string} str - The string to convert
 * @returns {string} Title cased string
 */
export const toTitleCase = (str) => {
  if (!str) return '';
  
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Format a file size in bytes to a human-readable string
 * @param {number} bytes - The file size in bytes
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {string} Formatted file size string
 */
export const formatFileSize = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

/**
 * Format a phone number to a standard format
 * @param {string} phoneNumber - The phone number to format
 * @param {string} format - The format to use (default: 'IN')
 * @returns {string} Formatted phone number
 */
export const formatPhoneNumber = (phoneNumber, format = 'IN') => {
  if (!phoneNumber) return '';
  
  // Remove all non-numeric characters
  const cleaned = ('' + phoneNumber).replace(/\D/g, '');
  
  // Format based on country code
  switch (format) {
    case 'IN': // India
      if (cleaned.length === 10) {
        return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
      }
      break;
    case 'US': // United States
      if (cleaned.length === 10) {
        return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
      }
      break;
    default:
      break;
  }
  
  // Return original if no formatting applied
  return phoneNumber;
};