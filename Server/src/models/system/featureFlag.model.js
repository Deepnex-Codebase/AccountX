/**
 * Feature Flag Model
 * Defines the schema for feature flags and tenant-specific overrides
 */

const mongoose = require('mongoose');

// Schema for global feature flags
const featureFlagSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Feature flag name is required'],
      trim: true,
      unique: true
    },
    description: {
      type: String,
      trim: true
    },
    enabled: {
      type: Boolean,
      default: false
    },
    category: {
      type: String,
      enum: ['core', 'accounting', 'gst', 'cfo', 'ui', 'integration', 'system', 'other'],
      default: 'other'
    },
    type: {
      type: String,
      enum: ['boolean', 'string', 'number', 'json'],
      default: 'boolean'
    },
    defaultValue: {
      type: mongoose.Schema.Types.Mixed,
      default: false
    },
    allowTenantOverride: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    notes: {
      type: String,
      trim: true
    },
    tags: [String]
  },
  {
    timestamps: true,
    suppressReservedKeysWarning: true
  }
);

// Create index on category for faster filtering
featureFlagSchema.index({ category: 1 });

// Create index on enabled for faster filtering
featureFlagSchema.index({ enabled: 1 });

// Schema for tenant-specific feature flag overrides
const tenantFeatureFlagSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tenant',
      required: [true, 'Tenant ID is required']
    },
    flagName: {
      type: String,
      required: [true, 'Feature flag name is required'],
      trim: true
    },
    enabled: {
      type: Boolean,
      default: null
    },
    value: {
      type: mongoose.Schema.Types.Mixed
    },
    expiresAt: {
      type: Date
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    notes: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true,
    suppressReservedKeysWarning: true
  }
);

// Create index on tenantId for faster queries
tenantFeatureFlagSchema.index({ tenantId: 1 });

// Create unique index on tenantId and flagName to prevent duplicates
tenantFeatureFlagSchema.index({ tenantId: 1, flagName: 1 }, { unique: true });

// Method to check if tenant override is expired
tenantFeatureFlagSchema.methods.isExpired = function() {
  if (!this.expiresAt) return false;
  return new Date() >= this.expiresAt;
};

// Pre-save middleware to validate value type against global flag type
tenantFeatureFlagSchema.pre('save', async function(next) {
  try {
    // Skip validation if value is not being modified
    if (!this.isModified('value')) return next();
    
    // Find the global feature flag to check its type
    const FeatureFlag = mongoose.model('FeatureFlag');
    const globalFlag = await FeatureFlag.findOne({ name: this.flagName });
    
    if (!globalFlag) {
      return next(new Error(`Global feature flag '${this.flagName}' not found`));
    }
    
    // Validate value type against global flag type
    if (globalFlag.type === 'boolean' && typeof this.value !== 'boolean') {
      return next(new Error(`Value for flag '${this.flagName}' must be a boolean`));
    }
    
    if (globalFlag.type === 'string' && typeof this.value !== 'string') {
      return next(new Error(`Value for flag '${this.flagName}' must be a string`));
    }
    
    if (globalFlag.type === 'number' && typeof this.value !== 'number') {
      return next(new Error(`Value for flag '${this.flagName}' must be a number`));
    }
    
    if (globalFlag.type === 'json' && typeof this.value !== 'object') {
      return next(new Error(`Value for flag '${this.flagName}' must be a JSON object`));
    }
    
    next();
  } catch (error) {
    next(error);
  }
});

const FeatureFlag = mongoose.model('FeatureFlag', featureFlagSchema);
const TenantFeatureFlag = mongoose.model('TenantFeatureFlag', tenantFeatureFlagSchema);

module.exports = {
  FeatureFlag,
  TenantFeatureFlag
};