/**
 * Utility functions for common validations
 */

/**
 * Check if a value is empty (null, undefined, empty string, empty array, or empty object)
 * @param {any} value - The value to check
 * @returns {boolean} Whether the value is empty
 */
export const isEmpty = (value) => {
  if (value === null || value === undefined) {
    return true;
  }
  
  if (typeof value === 'string') {
    return value.trim() === '';
  }
  
  if (Array.isArray(value)) {
    return value.length === 0;
  }
  
  if (typeof value === 'object') {
    return Object.keys(value).length === 0;
  }
  
  return false;
};

/**
 * Check if a value is a valid email address
 * @param {string} email - The email to validate
 * @returns {boolean} Whether the email is valid
 */
export const isValidEmail = (email) => {
  if (isEmpty(email)) return false;
  
  // Basic email regex pattern
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Check if a value is a valid URL
 * @param {string} url - The URL to validate
 * @returns {boolean} Whether the URL is valid
 */
export const isValidUrl = (url) => {
  if (isEmpty(url)) return false;
  
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Check if a value is a valid phone number
 * @param {string} phone - The phone number to validate
 * @returns {boolean} Whether the phone number is valid
 */
export const isValidPhone = (phone) => {
  if (isEmpty(phone)) return false;
  
  // Basic phone regex that allows various formats
  const phoneRegex = /^\+?[0-9\s\-\(\)]{8,20}$/;
  return phoneRegex.test(phone);
};

/**
 * Check if a value is a valid date
 * @param {string|Date} date - The date to validate
 * @returns {boolean} Whether the date is valid
 */
export const isValidDate = (date) => {
  if (isEmpty(date)) return false;
  
  // If it's already a Date object
  if (date instanceof Date) {
    return !isNaN(date.getTime());
  }
  
  // If it's a string, try to convert it to a Date
  const timestamp = Date.parse(date);
  return !isNaN(timestamp);
};

/**
 * Check if a value is a valid number
 * @param {any} value - The value to check
 * @returns {boolean} Whether the value is a valid number
 */
export const isValidNumber = (value) => {
  if (value === null || value === undefined || value === '') return false;
  return !isNaN(Number(value));
};

/**
 * Check if a value is a valid integer
 * @param {any} value - The value to check
 * @returns {boolean} Whether the value is a valid integer
 */
export const isValidInteger = (value) => {
  if (!isValidNumber(value)) return false;
  const number = Number(value);
  return Number.isInteger(number);
};

/**
 * Check if a value is within a range
 * @param {number} value - The value to check
 * @param {number} min - The minimum allowed value
 * @param {number} max - The maximum allowed value
 * @returns {boolean} Whether the value is within the range
 */
export const isInRange = (value, min, max) => {
  if (!isValidNumber(value)) return false;
  const number = Number(value);
  return number >= min && number <= max;
};

/**
 * Check if a string meets a minimum length requirement
 * @param {string} value - The string to check
 * @param {number} minLength - The minimum required length
 * @returns {boolean} Whether the string meets the minimum length
 */
export const hasMinLength = (value, minLength) => {
  if (typeof value !== 'string') return false;
  return value.length >= minLength;
};

/**
 * Check if a string doesn't exceed a maximum length
 * @param {string} value - The string to check
 * @param {number} maxLength - The maximum allowed length
 * @returns {boolean} Whether the string doesn't exceed the maximum length
 */
export const hasMaxLength = (value, maxLength) => {
  if (typeof value !== 'string') return false;
  return value.length <= maxLength;
};

/**
 * Check if a string matches a regex pattern
 * @param {string} value - The string to check
 * @param {RegExp} pattern - The regex pattern to match against
 * @returns {boolean} Whether the string matches the pattern
 */
export const matchesPattern = (value, pattern) => {
  if (typeof value !== 'string') return false;
  return pattern.test(value);
};

/**
 * Check if a value is a valid password (at least 8 chars, with uppercase, lowercase, number, and special char)
 * @param {string} password - The password to validate
 * @returns {boolean} Whether the password is valid
 */
export const isStrongPassword = (password) => {
  if (isEmpty(password)) return false;
  
  // Check minimum length
  if (password.length < 8) return false;
  
  // Check for uppercase letter
  if (!/[A-Z]/.test(password)) return false;
  
  // Check for lowercase letter
  if (!/[a-z]/.test(password)) return false;
  
  // Check for number
  if (!/[0-9]/.test(password)) return false;
  
  // Check for special character
  if (!/[^A-Za-z0-9]/.test(password)) return false;
  
  return true;
};

/**
 * Get password strength score (0-4)
 * @param {string} password - The password to evaluate
 * @returns {number} Strength score from 0 (very weak) to 4 (very strong)
 */
export const getPasswordStrength = (password) => {
  if (isEmpty(password)) return 0;
  
  let score = 0;
  
  // Length check
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  
  // Complexity checks
  if (/[A-Z]/.test(password)) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  
  // Normalize score to 0-4 range
  return Math.min(4, Math.floor(score / 1.5));
};

/**
 * Get feedback message for password strength
 * @param {number} strength - Password strength score (0-4)
 * @returns {string} Feedback message
 */
export const getPasswordFeedback = (strength) => {
  switch (strength) {
    case 0:
      return 'Very weak - Use 8+ characters with letters, numbers, and symbols';
    case 1:
      return 'Weak - Add more types of characters';
    case 2:
      return 'Fair - Add more length and character types';
    case 3:
      return 'Good - Consider adding more length for extra security';
    case 4:
      return 'Strong - Excellent password!';
    default:
      return '';
  }
};