/**
 * Integration Model
 * Defines the schema for external system integrations
 */

const mongoose = require('mongoose');
const crypto = require('crypto');

const integrationSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tenant',
      required: [true, 'Tenant ID is required']
    },
    name: {
      type: String,
      required: [true, 'Integration name is required'],
      trim: true
    },
    type: {
      type: String,
      enum: ['accounting', 'banking', 'erp', 'crm', 'tax', 'payment', 'gstn', 'custom'],
      required: [true, 'Integration type is required']
    },
    provider: {
      type: String,
      required: [true, 'Provider name is required'],
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'pending', 'error', 'expired'],
      default: 'inactive'
    },
    credentials: {
      apiKey: {
        type: String,
        trim: true,
        select: false // Don't return this field by default in queries
      },
      apiSecret: {
        type: String,
        trim: true,
        select: false // Don't return this field by default in queries
      },
      accessToken: {
        type: String,
        trim: true,
        select: false // Don't return this field by default in queries
      },
      refreshToken: {
        type: String,
        trim: true,
        select: false // Don't return this field by default in queries
      },
      username: {
        type: String,
        trim: true,
        select: false // Don't return this field by default in queries
      },
      password: {
        type: String,
        trim: true,
        select: false // Don't return this field by default in queries
      },
      gstnCredentials: {
        gstin: {
          type: String,
          trim: true
        },
        username: {
          type: String,
          trim: true,
          select: false // Don't return this field by default in queries
        },
        password: {
          type: String,
          trim: true,
          select: false // Don't return this field by default in queries
        }
      },
      // Store any other provider-specific credentials
      other: mongoose.Schema.Types.Mixed
    },
    tokenExpiresAt: Date,
    connectionDetails: {
      baseUrl: {
        type: String,
        trim: true
      },
      endpoints: mongoose.Schema.Types.Mixed,
      webhookUrl: {
        type: String,
        trim: true
      },
      webhookSecret: {
        type: String,
        trim: true,
        select: false // Don't return this field by default in queries
      },
      // Store any other connection details
      other: mongoose.Schema.Types.Mixed
    },
    settings: {
      syncFrequency: {
        type: String,
        enum: ['realtime', 'hourly', 'daily', 'weekly', 'manual'],
        default: 'daily'
      },
      syncDirection: {
        type: String,
        enum: ['import', 'export', 'bidirectional'],
        default: 'import'
      },
      dataMapping: mongoose.Schema.Types.Mixed,
      // Store any other settings
      other: mongoose.Schema.Types.Mixed
    },
    lastSyncedAt: Date,
    nextSyncAt: Date,
    syncHistory: [{
      startTime: {
        type: Date,
        default: Date.now
      },
      endTime: Date,
      status: {
        type: String,
        enum: ['success', 'partial', 'failed'],
        required: true
      },
      recordsProcessed: {
        type: Number,
        default: 0
      },
      errorMessages: [{
        message: String,
        code: String,
        details: mongoose.Schema.Types.Mixed
      }],
      summary: String
    }],
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

// Create index on tenantId for faster queries
integrationSchema.index({ tenantId: 1 });

// Create index on tenantId and type for faster filtering
integrationSchema.index({ tenantId: 1, type: 1 });

// Create index on tenantId and status for faster filtering
integrationSchema.index({ tenantId: 1, status: 1 });

// Create unique index on tenantId, type, and provider to prevent duplicates
integrationSchema.index({ tenantId: 1, type: 1, provider: 1 }, { unique: true });

// Method to encrypt sensitive data
integrationSchema.methods.encryptCredential = function(value) {
  if (!value) return null;
  
  // In a production environment, use a proper encryption key management system
  // This is a simplified example using environment variables
  const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-encryption-key-for-development';
  const IV_LENGTH = 16; // For AES, this is always 16
  
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(value);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  
  return iv.toString('hex') + ':' + encrypted.toString('hex');
};

// Method to decrypt sensitive data
integrationSchema.methods.decryptCredential = function(value) {
  if (!value) return null;
  
  // In a production environment, use a proper encryption key management system
  // This is a simplified example using environment variables
  const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-encryption-key-for-development';
  
  const textParts = value.split(':');
  const iv = Buffer.from(textParts.shift(), 'hex');
  const encryptedText = Buffer.from(textParts.join(':'), 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  
  return decrypted.toString();
};

// Method to check if token is expired
integrationSchema.methods.isTokenExpired = function() {
  if (!this.tokenExpiresAt) return true;
  return new Date() >= this.tokenExpiresAt;
};

// Method to calculate days until next sync
integrationSchema.methods.daysUntilNextSync = function() {
  if (!this.nextSyncAt) return null;
  
  const today = new Date();
  const nextSync = new Date(this.nextSyncAt);
  const diffTime = nextSync - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

// Pre-save middleware to encrypt sensitive credentials
integrationSchema.pre('save', function(next) {
  // Only encrypt if the credentials have been modified
  if (this.isModified('credentials.apiKey')) {
    this.credentials.apiKey = this.encryptCredential(this.credentials.apiKey);
  }
  
  if (this.isModified('credentials.apiSecret')) {
    this.credentials.apiSecret = this.encryptCredential(this.credentials.apiSecret);
  }
  
  if (this.isModified('credentials.accessToken')) {
    this.credentials.accessToken = this.encryptCredential(this.credentials.accessToken);
  }
  
  if (this.isModified('credentials.refreshToken')) {
    this.credentials.refreshToken = this.encryptCredential(this.credentials.refreshToken);
  }
  
  if (this.isModified('credentials.password')) {
    this.credentials.password = this.encryptCredential(this.credentials.password);
  }
  
  if (this.isModified('credentials.gstnCredentials.password')) {
    this.credentials.gstnCredentials.password = this.encryptCredential(this.credentials.gstnCredentials.password);
  }
  
  if (this.isModified('connectionDetails.webhookSecret')) {
    this.connectionDetails.webhookSecret = this.encryptCredential(this.connectionDetails.webhookSecret);
  }
  
  next();
});

const Integration = mongoose.model('Integration', integrationSchema);

module.exports = Integration;