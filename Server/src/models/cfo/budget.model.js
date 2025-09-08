/**
 * Budget Model for CFO Module
 * Represents a budget plan for a specific period
 */

const mongoose = require('mongoose');

// Budget Line Item Schema (Sub-document)
const budgetLineItemSchema = new mongoose.Schema({
  account: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account',
    required: [true, 'Account is required']
  },
  costCenter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CostCenter'
  },
  description: {
    type: String,
    trim: true
  },
  annualAmount: {
    type: Number,
    required: [true, 'Annual amount is required'],
    min: 0
  },
  // Monthly distribution of the budget
  monthlyDistribution: {
    type: Map,
    of: Number,
    default: () => ({
      '1': 0, '2': 0, '3': 0, '4': 0, '5': 0, '6': 0,
      '7': 0, '8': 0, '9': 0, '10': 0, '11': 0, '12': 0
    })
  },
  // Quarterly distribution of the budget
  quarterlyDistribution: {
    type: Map,
    of: Number,
    default: () => ({
      '1': 0, '2': 0, '3': 0, '4': 0
    })
  },
  notes: {
    type: String,
    trim: true
  }
});

// Budget Schema
const budgetSchema = new mongoose.Schema({
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: [true, 'Tenant ID is required']
  },
  name: {
    type: String,
    required: [true, 'Budget name is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  fiscalYear: {
    type: String,
    required: [true, 'Fiscal year is required'],
    trim: true,
    validate: {
      validator: function(value) {
        // Format: YYYY-YY
        return /^\d{4}-\d{2}$/.test(value);
      },
      message: 'Fiscal year must be in YYYY-YY format'
    }
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required']
  },
  status: {
    type: String,
    enum: ['Draft', 'Submitted', 'Approved', 'Rejected', 'Active', 'Closed'],
    default: 'Draft'
  },
  type: {
    type: String,
    enum: ['Operating', 'Capital', 'Cash Flow', 'Project', 'Department', 'Master'],
    default: 'Operating'
  },
  version: {
    type: Number,
    default: 1,
    min: 1
  },
  isCurrentVersion: {
    type: Boolean,
    default: true
  },
  parentBudget: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Budget'
  },
  lineItems: {
    type: [budgetLineItemSchema],
    default: []
  },
  totalAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  currency: {
    type: String,
    default: 'INR',
    trim: true
  },
  assumptions: {
    type: String,
    trim: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Created by user is required']
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: {
    type: Date
  },
  attachments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Attachment'
  }],
  tags: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

// Indexes
budgetSchema.index({ tenantId: 1, name: 1, fiscalYear: 1 }, { unique: true });
budgetSchema.index({ tenantId: 1, fiscalYear: 1 });
budgetSchema.index({ tenantId: 1, status: 1 });
budgetSchema.index({ createdAt: 1 });
budgetSchema.index({ updatedAt: 1 });

// Pre-save hook to calculate total amount
budgetSchema.pre('save', function(next) {
  if (this.lineItems && this.lineItems.length > 0) {
    this.totalAmount = this.lineItems.reduce((sum, item) => sum + item.annualAmount, 0);
  } else {
    this.totalAmount = 0;
  }
  next();
});

// Method to distribute annual amounts to monthly/quarterly values
budgetSchema.methods.distributeAmounts = function(distributionType = 'equal') {
  if (!this.lineItems || this.lineItems.length === 0) return this;
  
  this.lineItems.forEach(item => {
    const annualAmount = item.annualAmount || 0;
    
    // Monthly distribution
    if (distributionType === 'equal') {
      // Equal distribution across all months
      const monthlyAmount = annualAmount / 12;
      for (let i = 1; i <= 12; i++) {
        item.monthlyDistribution.set(i.toString(), monthlyAmount);
      }
      
      // Equal distribution across all quarters
      const quarterlyAmount = annualAmount / 4;
      for (let i = 1; i <= 4; i++) {
        item.quarterlyDistribution.set(i.toString(), quarterlyAmount);
      }
    } else if (distributionType === 'seasonal') {
      // Example of a seasonal distribution (can be customized)
      // Q1: 20%, Q2: 30%, Q3: 30%, Q4: 20%
      const q1 = annualAmount * 0.2;
      const q2 = annualAmount * 0.3;
      const q3 = annualAmount * 0.3;
      const q4 = annualAmount * 0.2;
      
      item.quarterlyDistribution.set('1', q1);
      item.quarterlyDistribution.set('2', q2);
      item.quarterlyDistribution.set('3', q3);
      item.quarterlyDistribution.set('4', q4);
      
      // Distribute quarterly amounts to months
      item.monthlyDistribution.set('1', q1 / 3);
      item.monthlyDistribution.set('2', q1 / 3);
      item.monthlyDistribution.set('3', q1 / 3);
      
      item.monthlyDistribution.set('4', q2 / 3);
      item.monthlyDistribution.set('5', q2 / 3);
      item.monthlyDistribution.set('6', q2 / 3);
      
      item.monthlyDistribution.set('7', q3 / 3);
      item.monthlyDistribution.set('8', q3 / 3);
      item.monthlyDistribution.set('9', q3 / 3);
      
      item.monthlyDistribution.set('10', q4 / 3);
      item.monthlyDistribution.set('11', q4 / 3);
      item.monthlyDistribution.set('12', q4 / 3);
    }
    // Additional distribution types can be added here
  });
  
  return this;
};

// Method to create a new version of the budget
budgetSchema.methods.createNewVersion = async function() {
  // Set current version as not current
  this.isCurrentVersion = false;
  await this.save();
  
  // Create a new version
  const newVersion = new this.constructor({
    ...this.toObject(),
    _id: mongoose.Types.ObjectId(),
    version: this.version + 1,
    isCurrentVersion: true,
    parentBudget: this._id,
    status: 'Draft',
    createdAt: new Date(),
    updatedAt: new Date(),
    approvedBy: null,
    approvedAt: null
  });
  
  return newVersion.save();
};

// Method to compare actual vs budget
budgetSchema.methods.compareWithActual = async function(endDate = new Date()) {
  // This would be implemented to fetch actual financial data
  // and compare with budget values
  // Implementation would depend on the JournalEntry model and business logic
  
  // Placeholder for the comparison result
  const comparison = {
    budgetTotal: this.totalAmount,
    actualTotal: 0,
    variance: 0,
    variancePercentage: 0,
    lineItemComparisons: []
  };
  
  // Return the comparison result
  return comparison;
};

const Budget = mongoose.model('Budget', budgetSchema);

module.exports = Budget;