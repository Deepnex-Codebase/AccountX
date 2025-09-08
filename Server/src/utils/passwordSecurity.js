/**
 * Password Security Utilities
 * Comprehensive password security measures
 */

const bcrypt = require('bcryptjs');
const crypto = require('crypto');

/**
 * Password strength requirements
 */
const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  preventCommonPasswords: true,
  preventSequentialChars: true,
  preventRepeatingChars: true
};

/**
 * Common weak passwords to prevent
 */
const COMMON_PASSWORDS = [
  'password', '123456', '123456789', 'qwerty', 'abc123',
  'password123', 'admin', 'letmein', 'welcome', 'monkey',
  'dragon', 'master', 'hello', 'freedom', 'whatever',
  'qazwsx', 'trustno1', 'jordan', 'joshua', 'michael',
  'mustang', 'access', 'shadow', 'baseball', 'superman',
  'iloveyou', 'starwars', 'computer', 'michelle', 'jessica',
  'pepper', 'daniel', 'maggie', 'summer', 'ashley',
  'qwertyuiop', 'basketball', 'football', 'jordan23',
  'harley', 'hunter', 'michelle1', 'charles', 'andrew',
  'matthew', 'abcc123', '111111', '123123', 'admin123',
  'root', 'toor', 'password1', '12345678', 'qwerty123'
];

/**
 * Validate password strength
 */
const validatePasswordStrength = (password) => {
  const errors = [];

  // Check length
  if (password.length < PASSWORD_REQUIREMENTS.minLength) {
    errors.push(`Password must be at least ${PASSWORD_REQUIREMENTS.minLength} characters long`);
  }

  if (password.length > PASSWORD_REQUIREMENTS.maxLength) {
    errors.push(`Password must be no more than ${PASSWORD_REQUIREMENTS.maxLength} characters long`);
  }

  // Check for uppercase letters
  if (PASSWORD_REQUIREMENTS.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  // Check for lowercase letters
  if (PASSWORD_REQUIREMENTS.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  // Check for numbers
  if (PASSWORD_REQUIREMENTS.requireNumbers && !/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  // Check for special characters
  if (PASSWORD_REQUIREMENTS.requireSpecialChars && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  // Check for common passwords
  if (PASSWORD_REQUIREMENTS.preventCommonPasswords && COMMON_PASSWORDS.includes(password.toLowerCase())) {
    errors.push('Password is too common, please choose a stronger password');
  }

  // Check for sequential characters
  if (PASSWORD_REQUIREMENTS.preventSequentialChars) {
    const sequentialPatterns = ['123', '234', '345', '456', '567', '678', '789', '890', 'abc', 'bcd', 'cde', 'def', 'efg', 'fgh', 'ghi', 'hij', 'ijk', 'jkl', 'klm', 'lmn', 'mno', 'nop', 'opq', 'pqr', 'qrs', 'rst', 'stu', 'tuv', 'uvw', 'vwx', 'wxy', 'xyz'];
    const hasSequential = sequentialPatterns.some(pattern => 
      password.toLowerCase().includes(pattern)
    );
    if (hasSequential) {
      errors.push('Password contains sequential characters');
    }
  }

  // Check for repeating characters
  if (PASSWORD_REQUIREMENTS.preventRepeatingChars) {
    const repeatingPattern = /(.)\1{2,}/;
    if (repeatingPattern.test(password)) {
      errors.push('Password contains too many repeating characters');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    score: calculatePasswordScore(password)
  };
};

/**
 * Calculate password strength score (0-100)
 */
const calculatePasswordScore = (password) => {
  let score = 0;

  // Length contribution
  score += Math.min(password.length * 4, 40);

  // Character variety contribution
  if (/[a-z]/.test(password)) score += 10;
  if (/[A-Z]/.test(password)) score += 10;
  if (/\d/.test(password)) score += 10;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 10;

  // Complexity bonus
  const uniqueChars = new Set(password).size;
  score += Math.min(uniqueChars * 2, 20);

  // Penalty for common patterns
  if (COMMON_PASSWORDS.includes(password.toLowerCase())) {
    score -= 50;
  }

  return Math.max(0, Math.min(100, score));
};

/**
 * Hash password with salt
 */
const hashPassword = async (password) => {
  const saltRounds = 12; // Higher for better security
  return await bcrypt.hash(password, saltRounds);
};

/**
 * Compare password with hash
 */
const comparePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

/**
 * Generate secure random password
 */
const generateSecurePassword = (length = 16) => {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
  let password = '';
  
  // Ensure at least one character from each required category
  password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)]; // Uppercase
  password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)]; // Lowercase
  password += '0123456789'[Math.floor(Math.random() * 10)]; // Number
  password += '!@#$%^&*()_+-=[]{}|;:,.<>?'[Math.floor(Math.random() * 32)]; // Special char
  
  // Fill the rest randomly
  for (let i = 4; i < length; i++) {
    password += charset[Math.floor(Math.random() * charset.length)];
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
};

/**
 * Create password reset token
 */
const createPasswordResetToken = () => {
  const resetToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  
  return {
    resetToken,
    hashedToken,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
  };
};

/**
 * Validate password reset token
 */
const validatePasswordResetToken = (token, hashedToken, expiresAt) => {
  const currentTime = new Date();
  const tokenExpiry = new Date(expiresAt);
  
  if (currentTime > tokenExpiry) {
    return { isValid: false, error: 'Token has expired' };
  }
  
  const providedHashedToken = crypto.createHash('sha256').update(token).digest('hex');
  
  if (providedHashedToken !== hashedToken) {
    return { isValid: false, error: 'Invalid token' };
  }
  
  return { isValid: true };
};

/**
 * Password history tracking (for preventing reuse)
 */
const checkPasswordHistory = (newPassword, passwordHistory = []) => {
  for (const oldPassword of passwordHistory) {
    if (bcrypt.compareSync(newPassword, oldPassword)) {
      return { isReused: true, error: 'Password has been used before' };
    }
  }
  return { isReused: false };
};

/**
 * Get password strength description
 */
const getPasswordStrengthDescription = (score) => {
  if (score >= 80) return { level: 'Very Strong', color: 'green' };
  if (score >= 60) return { level: 'Strong', color: 'blue' };
  if (score >= 40) return { level: 'Medium', color: 'yellow' };
  if (score >= 20) return { level: 'Weak', color: 'orange' };
  return { level: 'Very Weak', color: 'red' };
};

module.exports = {
  validatePasswordStrength,
  calculatePasswordScore,
  hashPassword,
  comparePassword,
  generateSecurePassword,
  createPasswordResetToken,
  validatePasswordResetToken,
  checkPasswordHistory,
  getPasswordStrengthDescription,
  PASSWORD_REQUIREMENTS
}; 