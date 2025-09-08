import { z } from 'zod';

/**
 * Email validation schema
 */
export const emailSchema = z
  .string()
  .min(1, { message: 'Email is required' })
  .email({ message: 'Invalid email address' });

/**
 * Password validation schema
 */
export const passwordSchema = z
  .string()
  .min(8, { message: 'Password must be at least 8 characters' })
  .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
  .regex(/[a-z]/, { message: 'Password must contain at least one lowercase letter' })
  .regex(/[0-9]/, { message: 'Password must contain at least one number' })
  .regex(/[^A-Za-z0-9]/, { message: 'Password must contain at least one special character' });

/**
 * Phone number validation schema
 */
export const phoneSchema = z
  .string()
  .min(1, { message: 'Phone number is required' })
  .regex(/^\+?[0-9]{10,15}$/, { message: 'Invalid phone number format' });

/**
 * Name validation schema
 */
export const nameSchema = z
  .string()
  .min(1, { message: 'Name is required' })
  .max(100, { message: 'Name is too long' });

/**
 * Login form validation schema
 */
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, { message: 'Password is required' }),
  rememberMe: z.boolean().optional(),
});

/**
 * Registration form validation schema
 */
export const registrationSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string().min(1, { message: 'Please confirm your password' }),
  acceptTerms: z.boolean().refine(val => val === true, {
    message: 'You must accept the terms and conditions',
  }),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

/**
 * User profile validation schema
 */
export const userProfileSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  phone: phoneSchema.optional().or(z.literal('')),
  department: z.string().optional(),
  position: z.string().optional(),
  bio: z.string().max(500, { message: 'Bio is too long' }).optional(),
});

/**
 * Change password validation schema
 */
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, { message: 'Current password is required' }),
  newPassword: passwordSchema,
  confirmNewPassword: z.string().min(1, { message: 'Please confirm your new password' }),
}).refine(data => data.newPassword === data.confirmNewPassword, {
  message: 'Passwords do not match',
  path: ['confirmNewPassword'],
});

/**
 * Account validation schema
 */
export const accountSchema = z.object({
  code: z.string().min(1, { message: 'Account code is required' }),
  name: z.string().min(1, { message: 'Account name is required' }),
  type: z.string().min(1, { message: 'Account type is required' }),
  category: z.string().min(1, { message: 'Account category is required' }),
  description: z.string().optional(),
  active: z.boolean().default(true),
});

/**
 * Journal entry validation schema
 */
export const journalEntrySchema = z.object({
  date: z.string().min(1, { message: 'Date is required' }),
  reference: z.string().optional(),
  description: z.string().min(1, { message: 'Description is required' }),
  lines: z.array(z.object({
    accountId: z.string().min(1, { message: 'Account is required' }),
    description: z.string().optional(),
    debit: z.number().min(0, { message: 'Debit must be a positive number' }),
    credit: z.number().min(0, { message: 'Credit must be a positive number' }),
  })).min(2, { message: 'At least two lines are required for a journal entry' }),
}).refine(data => {
  // Calculate total debits and credits
  const totalDebits = data.lines.reduce((sum, line) => sum + (line.debit || 0), 0);
  const totalCredits = data.lines.reduce((sum, line) => sum + (line.credit || 0), 0);
  
  // Check if they are equal
  return Math.abs(totalDebits - totalCredits) < 0.01; // Allow for small floating point differences
}, {
  message: 'Total debits must equal total credits',
  path: ['lines'],
}).refine(data => {
  // Check that each line has either a debit or credit, but not both
  return data.lines.every(line => {
    const hasDebit = line.debit > 0;
    const hasCredit = line.credit > 0;
    return (hasDebit && !hasCredit) || (!hasDebit && hasCredit);
  });
}, {
  message: 'Each line must have either a debit or a credit, but not both',
  path: ['lines'],
});

/**
 * Validate an email address
 * @param {string} email - The email to validate
 * @returns {boolean} Whether the email is valid
 */
export const isValidEmail = (email) => {
  try {
    emailSchema.parse(email);
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Validate a password
 * @param {string} password - The password to validate
 * @returns {boolean} Whether the password is valid
 */
export const isValidPassword = (password) => {
  try {
    passwordSchema.parse(password);
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Validate a phone number
 * @param {string} phone - The phone number to validate
 * @returns {boolean} Whether the phone number is valid
 */
export const isValidPhone = (phone) => {
  try {
    phoneSchema.parse(phone);
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Get validation errors from Zod error
 * @param {Error} error - The Zod error
 * @returns {Object} An object with field names as keys and error messages as values
 */
export const getValidationErrors = (error) => {
  if (!error || !error.errors) return {};
  
  return error.errors.reduce((acc, curr) => {
    const path = curr.path.join('.');
    acc[path] = curr.message;
    return acc;
  }, {});
};