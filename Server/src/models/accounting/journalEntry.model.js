/**
 * Journal Entry Model
 * Represents a journal entry in the accounting system
 */

const mongoose = require('mongoose');

// Journal Entry Line Schema (Sub-document)
const journalEntryLineSchema = new mongoose.Schema({
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
    ref: 'CostCenter',
    default: null
  }
});

// Main Journal Entry Schema
const journalEntrySchema = new mongoose.Schema({
  date: {
    type: Date,
    required: [true, 'Posting date is required']
  },
  lines: {
    type: [journalEntryLineSchema],
    validate: {
      validator: function(lines) {
        // Must have at least 2 lines
        if (lines.length < 2) return false;
        
        // Calculate total debits and credits
        const totalDebit = lines.reduce((sum, line) => sum + line.debit, 0);
        const totalCredit = lines.reduce((sum, line) => sum + line.credit, 0);
        
        // Debits must equal credits (within a small rounding tolerance)
        return Math.abs(totalDebit - totalCredit) < 0.001;
      },
      message: 'Journal entry must have at least 2 lines and debits must equal credits'
    }
  },
  narration: {
    type: String,
    trim: true
  },
  attachments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Attachment'
  }],
  status: {
    type: String,
    enum: ['Draft', 'Pending Approval', 'Approved', 'Posted', 'Rejected'],
    default: 'Draft'
  },
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: [true, 'Tenant ID is required']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Created by user is required']
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: {
    type: Date
  },
  referenceNumber: {
    type: String,
    trim: true
  },
  sourceType: {
    type: String,
    enum: ['Manual', 'Import', 'Template', 'System'],
    default: 'Manual'
  }
}, {
  timestamps: true,
  suppressReservedKeysWarning: true
});

// Indexes
journalEntrySchema.index({ tenantId: 1, date: 1 });
journalEntrySchema.index({ tenantId: 1, status: 1 });
journalEntrySchema.index({ tenantId: 1 });
journalEntrySchema.index({ createdAt: 1 });
journalEntrySchema.index({ updatedAt: 1 });

// Virtual for total amount
journalEntrySchema.virtual('totalAmount').get(function() {
  if (!this.lines || this.lines.length === 0) return 0;
  return this.lines.reduce((sum, line) => sum + (line.debit || 0), 0);
});

// Pre-save hook to validate debit/credit balance
journalEntrySchema.pre('save', function(next) {
  if (this.lines && this.lines.length > 0) {
    // Ensure each line has either debit or credit but not both
    this.lines.forEach(line => {
      if (line.debit > 0 && line.credit > 0) {
        return next(new Error('A journal entry line cannot have both debit and credit values'));
      }
    });
  }
  next();
});

const JournalEntry = mongoose.model('JournalEntry', journalEntrySchema);

module.exports = JournalEntry;