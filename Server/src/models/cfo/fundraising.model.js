/**
 * Fundraising Model
 * Defines the schema for fundraising activities and investor tracking
 */

const mongoose = require('mongoose');

const fundraisingSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tenant',
      required: [true, 'Tenant ID is required']
    },
    investor: {
      type: String,
      required: [true, 'Investor name is required'],
      trim: true
    },
    stage: {
      type: String,
      enum: ['initial-contact', 'pitch', 'due-diligence', 'negotiation', 'term-sheet', 'closed-won', 'closed-lost'],
      required: [true, 'Stage is required'],
      default: 'initial-contact'
    },
    investorType: {
      type: String,
      enum: ['angel', 'seed', 'vc', 'pe', 'corporate', 'strategic', 'family-office', 'government', 'other'],
      default: 'vc'
    },
    contactPerson: {
      name: {
        type: String,
        trim: true
      },
      email: {
        type: String,
        trim: true,
        lowercase: true
      },
      phone: {
        type: String,
        trim: true
      },
      position: {
        type: String,
        trim: true
      }
    },
    amount: {
      target: {
        type: Number,
        default: 0
      },
      committed: {
        type: Number,
        default: 0
      },
      received: {
        type: Number,
        default: 0
      },
      currency: {
        type: String,
        default: 'INR'
      }
    },
    equity: {
      offered: {
        type: Number,
        min: 0,
        max: 100
      },
      agreed: {
        type: Number,
        min: 0,
        max: 100
      }
    },
    valuation: {
      pre: {
        type: Number,
        default: 0
      },
      post: {
        type: Number,
        default: 0
      },
      currency: {
        type: String,
        default: 'INR'
      }
    },
    startDate: {
      type: Date,
      default: Date.now
    },
    expectedCloseDate: Date,
    actualCloseDate: Date,
    status: {
      type: String,
      enum: ['active', 'on-hold', 'completed', 'abandoned'],
      default: 'active'
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Owner is required']
    },
    notes: {
      type: String,
      trim: true
    },
    terms: {
      type: String,
      trim: true
    },
    nextSteps: {
      type: String,
      trim: true
    },
    interactions: [{
      type: {
        type: String,
        enum: ['email', 'call', 'meeting', 'pitch', 'document-shared', 'other'],
        required: [true, 'Interaction type is required']
      },
      date: {
        type: Date,
        default: Date.now,
        required: [true, 'Interaction date is required']
      },
      participants: [{
        type: String,
        trim: true
      }],
      summary: {
        type: String,
        trim: true
      },
      outcome: {
        type: String,
        trim: true
      },
      followUp: {
        required: Boolean,
        date: Date,
        task: String
      }
    }],
    documents: [{
      name: {
        type: String,
        required: [true, 'Document name is required'],
        trim: true
      },
      type: {
        type: String,
        enum: ['pitch-deck', 'financial-model', 'term-sheet', 'due-diligence', 'legal', 'other'],
        required: [true, 'Document type is required']
      },
      url: {
        type: String,
        required: [true, 'Document URL is required']
      },
      version: {
        type: String,
        default: '1.0'
      },
      sharedOn: {
        type: Date,
        default: Date.now
      },
      sharedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    }],
    tags: [String],
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
fundraisingSchema.index({ tenantId: 1 });

// Create index on tenantId and stage for faster filtering
fundraisingSchema.index({ tenantId: 1, stage: 1 });

// Create index on tenantId and status for faster filtering
fundraisingSchema.index({ tenantId: 1, status: 1 });

// Create unique index on tenantId, investor and stage to prevent duplicates
fundraisingSchema.index({ tenantId: 1, investor: 1, stage: 1 }, { unique: true });

// Method to calculate progress percentage
fundraisingSchema.methods.calculateProgress = function() {
  const stageWeights = {
    'initial-contact': 10,
    'pitch': 25,
    'due-diligence': 50,
    'negotiation': 70,
    'term-sheet': 85,
    'closed-won': 100,
    'closed-lost': 0
  };
  
  return stageWeights[this.stage] || 0;
};

// Method to calculate days in current stage
fundraisingSchema.methods.daysInCurrentStage = function() {
  const lastStageChange = this.history
    .filter(h => h.action === 'stage-change')
    .sort((a, b) => b.performedAt - a.performedAt)[0];
  
  const startDate = lastStageChange ? new Date(lastStageChange.performedAt) : new Date(this.createdAt);
  const today = new Date();
  const diffTime = today - startDate;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

// Method to calculate funding gap
fundraisingSchema.methods.calculateFundingGap = function() {
  return this.amount.target - this.amount.committed;
};

const Fundraising = mongoose.model('Fundraising', fundraisingSchema);

module.exports = Fundraising;