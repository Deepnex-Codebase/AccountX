/**
 * User Model
 * Represents a user in the system with authentication and role-based access
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email']
  },
  passwordHash: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 8,
    select: false // Don't include password in query results by default
  },
  roles: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role'
  }],
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: [true, 'Tenant ID is required']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  passwordResetToken: String,
  passwordResetExpires: Date,
  lastLogin: Date
}, {
  timestamps: true,
  suppressReservedKeysWarning: true
});

// Indexes
// Email index is already defined in the schema with unique: true
userSchema.index({ tenantId: 1 });
userSchema.index({ createdAt: 1 });
userSchema.index({ updatedAt: 1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  // Only run this function if password was modified
  if (!this.isModified('passwordHash')) return next();

  // Hash the password with cost of 12
  this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
  next();
});

// Method to check if password is correct
userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// Method to check if user has specific permission
userSchema.methods.hasPermission = function(permission) {
  // This requires roles to be populated
  if (!this.roles || this.roles.length === 0) {
    return false;
  }
  
  return this.roles.some(role => 
    role.permissions && role.permissions.includes(permission)
  );
};

const User = mongoose.model('User', userSchema);

module.exports = User;