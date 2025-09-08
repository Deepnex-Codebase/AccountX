/**
 * Control Items Model
 * Defines the schema for control management items
 */

const mongoose = require('mongoose');

const controlItemSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tenant',
      required: [true, 'Tenant ID is required']
    },
    name: {
      type: String,
      required: [true, 'Control name is required'],
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    category: {
      type: String,
      enum: ['financial', 'operational', 'strategic', 'compliance', 'it', 'other'],
      default: 'financial'
    },
    type: {
      type: String,
      enum: ['preventive', 'detective', 'corrective', 'directive'],
      default: 'preventive'
    },
    nature: {
      type: String,
      enum: ['manual', 'automated', 'semi-automated'],
      default: 'manual'
    },
    frequency: {
      type: String,
      enum: ['continuous', 'daily', 'weekly', 'monthly', 'quarterly', 'annually', 'as-needed'],
      default: 'monthly'
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'under-review', 'deprecated'],
      default: 'active'
    },
    effectiveness: {
      type: String,
      enum: ['effective', 'partially-effective', 'ineffective', 'not-tested'],
      default: 'not-tested'
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Owner is required']
    },
    implementationDate: {
      type: Date,
      default: Date.now
    },
    procedure: {
      type: String,
      trim: true
    },
    testPlan: {
      type: String,
      trim: true
    },
    lastTestedDate: Date,
    nextTestDate: Date,
    relatedRisks: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RiskItem'
    }],
    relatedPolicies: [{
      name: String,
      reference: String,
      url: String
    }],
    cost: {
      amount: {
        type: Number,
        default: 0
      },
      currency: {
        type: String,
        default: 'INR'
      },
      frequency: {
        type: String,
        enum: ['one-time', 'monthly', 'quarterly', 'annually'],
        default: 'annually'
      }
    },
    notes: {
      type: String,
      trim: true
    },
    tags: [String],
    attachments: [{
      name: String,
      url: String,
      type: String,
      uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      uploadedAt: {
        type: Date,
        default: Date.now
      }
    }],
    testResults: [{
      testDate: {
        type: Date,
        required: [true, 'Test date is required']
      },
      testedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Tester is required']
      },
      result: {
        type: String,
        enum: ['pass', 'fail', 'inconclusive'],
        required: [true, 'Test result is required']
      },
      findings: String,
      remediation: String,
      attachments: [{
        name: String,
        url: String,
        type: String
      }]
    }],
    history: [{
      action: {
        type: String,
        required: [true, 'Action is required']
      },
      performedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User is required']
      },
      performedAt: {
        type: Date,
        default: Date.now
      },
      details: mongoose.Schema.Types.Mixed
    }]
  },
  {
    timestamps: true
  }
);

// Create index on tenantId for faster queries
controlItemSchema.index({ tenantId: 1 });

// Create index on tenantId and category for faster filtering
controlItemSchema.index({ tenantId: 1, category: 1 });

// Create index on tenantId and type for faster filtering
controlItemSchema.index({ tenantId: 1, type: 1 });

// Create index on tenantId and status for faster filtering
controlItemSchema.index({ tenantId: 1, status: 1 });

// Method to determine if control is due for testing
controlItemSchema.methods.isDueForTesting = function() {
  if (!this.nextTestDate) return false;
  return new Date() >= this.nextTestDate;
};

// Method to calculate days until next test
controlItemSchema.methods.daysUntilNextTest = function() {
  if (!this.nextTestDate) return null;
  
  const today = new Date();
  const nextTest = new Date(this.nextTestDate);
  const diffTime = nextTest - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

const ControlItem = mongoose.model('ControlItem', controlItemSchema);

module.exports = ControlItem;