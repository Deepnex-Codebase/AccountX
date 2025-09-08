/**
 * Cash Flow Forecast Model for CFO Module
 * Represents a cash flow forecast for a specific period
 */

const mongoose = require('mongoose');

// Cash Flow Line Item Schema (Sub-document)
const cashFlowLineItemSchema = new mongoose.Schema({
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      // Operating Activities
      'OPERATING_RECEIPTS_CUSTOMERS',
      'OPERATING_RECEIPTS_OTHER',
      'OPERATING_PAYMENTS_SUPPLIERS',
      'OPERATING_PAYMENTS_EMPLOYEES',
      'OPERATING_PAYMENTS_TAXES',
      'OPERATING_PAYMENTS_OTHER',
      
      // Investing Activities
      'INVESTING_RECEIPTS_ASSET_SALES',
      'INVESTING_RECEIPTS_INVESTMENT_INCOME',
      'INVESTING_PAYMENTS_ASSET_PURCHASE',
      'INVESTING_PAYMENTS_INVESTMENTS',
      
      // Financing Activities
      'FINANCING_RECEIPTS_EQUITY',
      'FINANCING_RECEIPTS_BORROWINGS',
      'FINANCING_PAYMENTS_DIVIDENDS',
      'FINANCING_PAYMENTS_LOAN_REPAYMENTS',
      'FINANCING_PAYMENTS_INTEREST',
      
      // Other
      'OTHER_RECEIPTS',
      'OTHER_PAYMENTS'
    ]
  },
  description: {
    type: String,
    trim: true
  },
  account: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account'
  },
  // Monthly forecast amounts
  monthlyForecast: {
    type: Map,
    of: Number,
    default: () => ({
      '1': 0, '2': 0, '3': 0, '4': 0, '5': 0, '6': 0,
      '7': 0, '8': 0, '9': 0, '10': 0, '11': 0, '12': 0
    })
  },
  // Quarterly forecast amounts
  quarterlyForecast: {
    type: Map,
    of: Number,
    default: () => ({
      '1': 0, '2': 0, '3': 0, '4': 0
    })
  },
  annualAmount: {
    type: Number,
    default: 0
  },
  isRecurring: {
    type: Boolean,
    default: true
  },
  probability: {
    type: Number,
    min: 0,
    max: 100,
    default: 100
  },
  notes: {
    type: String,
    trim: true
  }
});

// Cash Flow Forecast Schema
const cashFlowForecastSchema = new mongoose.Schema({
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: [true, 'Tenant ID is required']
  },
  name: {
    type: String,
    required: [true, 'Forecast name is required'],
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
    enum: ['Draft', 'Submitted', 'Approved', 'Rejected', 'Active', 'Archived'],
    default: 'Draft'
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
  parentForecast: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CashFlowForecast'
  },
  // Opening balance at the start of the forecast period
  openingBalance: {
    type: Number,
    required: [true, 'Opening balance is required'],
    default: 0
  },
  // Line items for the forecast
  lineItems: {
    type: [cashFlowLineItemSchema],
    default: []
  },
  // Monthly closing balances (calculated)
  monthlyClosingBalances: {
    type: Map,
    of: Number,
    default: () => ({
      '1': 0, '2': 0, '3': 0, '4': 0, '5': 0, '6': 0,
      '7': 0, '8': 0, '9': 0, '10': 0, '11': 0, '12': 0
    })
  },
  // Quarterly closing balances (calculated)
  quarterlyClosingBalances: {
    type: Map,
    of: Number,
    default: () => ({
      '1': 0, '2': 0, '3': 0, '4': 0
    })
  },
  // Final closing balance at the end of the forecast period
  closingBalance: {
    type: Number,
    default: 0
  },
  // Total inflows for the period
  totalInflows: {
    type: Number,
    default: 0
  },
  // Total outflows for the period
  totalOutflows: {
    type: Number,
    default: 0
  },
  // Net cash flow for the period
  netCashFlow: {
    type: Number,
    default: 0
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
cashFlowForecastSchema.index({ tenantId: 1, name: 1, fiscalYear: 1 }, { unique: true });
cashFlowForecastSchema.index({ tenantId: 1, fiscalYear: 1 });
cashFlowForecastSchema.index({ tenantId: 1, status: 1 });
cashFlowForecastSchema.index({ createdAt: 1 });
cashFlowForecastSchema.index({ updatedAt: 1 });

// Helper function to determine if a category is an inflow
const isInflowCategory = (category) => {
  return [
    'OPERATING_RECEIPTS_CUSTOMERS',
    'OPERATING_RECEIPTS_OTHER',
    'INVESTING_RECEIPTS_ASSET_SALES',
    'INVESTING_RECEIPTS_INVESTMENT_INCOME',
    'FINANCING_RECEIPTS_EQUITY',
    'FINANCING_RECEIPTS_BORROWINGS',
    'OTHER_RECEIPTS'
  ].includes(category);
};

// Pre-save hook to calculate totals and balances
cashFlowForecastSchema.pre('save', function(next) {
  if (!this.lineItems || this.lineItems.length === 0) {
    this.totalInflows = 0;
    this.totalOutflows = 0;
    this.netCashFlow = 0;
    this.closingBalance = this.openingBalance;
    return next();
  }
  
  // Calculate annual amounts for each line item
  this.lineItems.forEach(item => {
    let annualTotal = 0;
    for (let i = 1; i <= 12; i++) {
      const monthValue = item.monthlyForecast.get(i.toString()) || 0;
      annualTotal += monthValue;
    }
    item.annualAmount = annualTotal;
  });
  
  // Calculate total inflows and outflows
  let totalInflows = 0;
  let totalOutflows = 0;
  
  this.lineItems.forEach(item => {
    if (isInflowCategory(item.category)) {
      totalInflows += item.annualAmount;
    } else {
      totalOutflows += item.annualAmount;
    }
  });
  
  this.totalInflows = totalInflows;
  this.totalOutflows = totalOutflows;
  this.netCashFlow = totalInflows - totalOutflows;
  
  // Calculate monthly closing balances
  let runningBalance = this.openingBalance;
  
  for (let month = 1; month <= 12; month++) {
    const monthStr = month.toString();
    let monthlyInflows = 0;
    let monthlyOutflows = 0;
    
    this.lineItems.forEach(item => {
      const monthValue = item.monthlyForecast.get(monthStr) || 0;
      if (isInflowCategory(item.category)) {
        monthlyInflows += monthValue;
      } else {
        monthlyOutflows += monthValue;
      }
    });
    
    runningBalance += (monthlyInflows - monthlyOutflows);
    this.monthlyClosingBalances.set(monthStr, runningBalance);
    
    // Update quarterly balances at the end of each quarter
    if (month % 3 === 0) {
      const quarter = (month / 3).toString();
      this.quarterlyClosingBalances.set(quarter, runningBalance);
    }
  }
  
  // Set final closing balance
  this.closingBalance = runningBalance;
  
  next();
});

// Method to create a new version of the forecast
cashFlowForecastSchema.methods.createNewVersion = async function() {
  // Set current version as not current
  this.isCurrentVersion = false;
  await this.save();
  
  // Create a new version
  const newVersion = new this.constructor({
    ...this.toObject(),
    _id: mongoose.Types.ObjectId(),
    version: this.version + 1,
    isCurrentVersion: true,
    parentForecast: this._id,
    status: 'Draft',
    createdAt: new Date(),
    updatedAt: new Date(),
    approvedBy: null,
    approvedAt: null
  });
  
  return newVersion.save();
};

// Method to compare actual vs forecast
cashFlowForecastSchema.methods.compareWithActual = async function(endDate = new Date()) {
  // This would be implemented to fetch actual cash flow data
  // and compare with forecast values
  // Implementation would depend on the JournalEntry model and business logic
  
  // Placeholder for the comparison result
  const comparison = {
    forecastNetCashFlow: this.netCashFlow,
    actualNetCashFlow: 0,
    variance: 0,
    variancePercentage: 0,
    monthlyComparisons: {}
  };
  
  // Return the comparison result
  return comparison;
};

const CashFlowForecast = mongoose.model('CashFlowForecast', cashFlowForecastSchema);

module.exports = CashFlowForecast;