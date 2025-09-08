/**
 * Recurring Template Model
 * Represents a template for recurring journal entries
 */

const mongoose = require('mongoose');

// Template Entry Line Schema (Sub-document)
const templateEntryLineSchema = new mongoose.Schema({
  account: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account',
    required: [true, 'Account is required']
  },
  debit: {
    type: Number,
    default: 0,
    min: 0
  },
  credit: {
    type: Number,
    default: 0,
    min: 0
  },
  description: {
    type: String,
    trim: true
  },
  costCenter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CostCenter'
  }
});

// Main Template Schema
const templateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Template name is required'],
    trim: true
  },
  frequency: {
    type: String,
    required: [true, 'Frequency is required'],
    enum: ['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY'],
    default: 'MONTHLY'
  },
  entries: {
    type: [templateEntryLineSchema],
    validate: {
      validator: function(entries) {
        // Must have at least 2 entries
        if (entries.length < 2) return false;
        
        // Calculate total debits and credits
        const totalDebit = entries.reduce((sum, entry) => sum + entry.debit, 0);
        const totalCredit = entries.reduce((sum, entry) => sum + entry.credit, 0);
        
        // Debits must equal credits (within a small rounding tolerance)
        return Math.abs(totalDebit - totalCredit) < 0.001;
      },
      message: 'Template must have at least 2 entries and debits must equal credits'
    }
  },
  isEnabled: {
    type: Boolean,
    default: true
  },
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: [true, 'Tenant ID is required']
  },
  narration: {
    type: String,
    trim: true
  },
  nextRunDate: {
    type: Date
  },
  lastRunDate: {
    type: Date
  },
  dayOfMonth: {
    type: Number,
    min: 1,
    max: 31,
    validate: {
      validator: function(value) {
        return this.frequency === 'MONTHLY' || this.frequency === 'QUARTERLY' || this.frequency === 'YEARLY' ? value >= 1 && value <= 31 : true;
      },
      message: 'Day of month must be between 1 and 31 for monthly, quarterly, or yearly frequencies'
    }
  },
  dayOfWeek: {
    type: Number,
    min: 0,
    max: 6,
    validate: {
      validator: function(value) {
        return this.frequency === 'WEEKLY' ? value >= 0 && value <= 6 : true;
      },
      message: 'Day of week must be between 0 (Sunday) and 6 (Saturday) for weekly frequency'
    }
  },
  monthOfYear: {
    type: Number,
    min: 0,
    max: 11,
    validate: {
      validator: function(value) {
        return this.frequency === 'YEARLY' ? value >= 0 && value <= 11 : true;
      },
      message: 'Month of year must be between 0 (January) and 11 (December) for yearly frequency'
    }
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Created by user is required']
  }
}, {
  timestamps: true
});

// Indexes
templateSchema.index({ tenantId: 1 });
templateSchema.index({ tenantId: 1, name: 1 }, { unique: true });
templateSchema.index({ tenantId: 1, isEnabled: 1 });
templateSchema.index({ nextRunDate: 1 });
templateSchema.index({ createdAt: 1 });
templateSchema.index({ updatedAt: 1 });

// Virtual for total amount
templateSchema.virtual('totalAmount').get(function() {
  if (!this.entries || this.entries.length === 0) return 0;
  return this.entries.reduce((sum, entry) => sum + (entry.debit || 0), 0);
});

// Pre-save hook to calculate next run date
templateSchema.pre('save', function(next) {
  if (this.isEnabled && !this.nextRunDate) {
    this.calculateNextRunDate();
  }
  next();
});

// Method to calculate next run date based on frequency
templateSchema.methods.calculateNextRunDate = function() {
  const now = new Date();
  let nextRun = new Date();
  
  switch (this.frequency) {
    case 'DAILY':
      nextRun.setDate(now.getDate() + 1);
      break;
      
    case 'WEEKLY':
      const dayDiff = this.dayOfWeek - now.getDay();
      nextRun.setDate(now.getDate() + (dayDiff > 0 ? dayDiff : 7 + dayDiff));
      break;
      
    case 'MONTHLY':
      nextRun.setMonth(now.getMonth() + 1);
      nextRun.setDate(Math.min(this.dayOfMonth, new Date(nextRun.getFullYear(), nextRun.getMonth() + 1, 0).getDate()));
      break;
      
    case 'QUARTERLY':
      nextRun.setMonth(now.getMonth() + 3);
      nextRun.setDate(Math.min(this.dayOfMonth, new Date(nextRun.getFullYear(), nextRun.getMonth() + 1, 0).getDate()));
      break;
      
    case 'YEARLY':
      nextRun.setFullYear(now.getFullYear() + 1);
      nextRun.setMonth(this.monthOfYear);
      nextRun.setDate(Math.min(this.dayOfMonth, new Date(nextRun.getFullYear(), nextRun.getMonth() + 1, 0).getDate()));
      break;
  }
  
  this.nextRunDate = nextRun;
  return nextRun;
};

const Template = mongoose.model('Template', templateSchema);

module.exports = Template;