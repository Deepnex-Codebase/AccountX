/**
 * Financial Ratio Model for CFO Module
 * Represents financial ratios calculated for a specific period
 */

const mongoose = require('mongoose');

// Ratio Value Schema (Sub-document)
const ratioValueSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Ratio name is required'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Ratio category is required'],
    enum: [
      'LIQUIDITY',      // Liquidity ratios
      'PROFITABILITY',   // Profitability ratios
      'SOLVENCY',        // Solvency/Leverage ratios
      'EFFICIENCY',      // Efficiency/Activity ratios
      'VALUATION',       // Valuation ratios
      'GROWTH',          // Growth ratios
      'CASH_FLOW',       // Cash flow ratios
      'CUSTOM'           // Custom ratios
    ]
  },
  value: {
    type: Number,
    required: [true, 'Ratio value is required']
  },
  formula: {
    type: String,
    trim: true
  },
  benchmark: {
    type: Number
  },
  industryAverage: {
    type: Number
  },
  previousPeriodValue: {
    type: Number
  },
  trend: {
    type: String,
    enum: ['IMPROVING', 'STABLE', 'DECLINING', 'UNKNOWN'],
    default: 'UNKNOWN'
  },
  status: {
    type: String,
    enum: ['EXCELLENT', 'GOOD', 'AVERAGE', 'POOR', 'CRITICAL', 'UNKNOWN'],
    default: 'UNKNOWN'
  },
  notes: {
    type: String,
    trim: true
  }
});

// Financial Ratio Schema
const financialRatioSchema = new mongoose.Schema({
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: [true, 'Tenant ID is required']
  },
  periodType: {
    type: String,
    required: [true, 'Period type is required'],
    enum: ['MONTHLY', 'QUARTERLY', 'HALF_YEARLY', 'YEARLY', 'CUSTOM'],
    default: 'YEARLY'
  },
  periodName: {
    type: String,
    required: [true, 'Period name is required'],
    trim: true
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required']
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
  // Liquidity Ratios
  liquidityRatios: {
    type: [ratioValueSchema],
    default: []
  },
  // Profitability Ratios
  profitabilityRatios: {
    type: [ratioValueSchema],
    default: []
  },
  // Solvency/Leverage Ratios
  solvencyRatios: {
    type: [ratioValueSchema],
    default: []
  },
  // Efficiency/Activity Ratios
  efficiencyRatios: {
    type: [ratioValueSchema],
    default: []
  },
  // Valuation Ratios
  valuationRatios: {
    type: [ratioValueSchema],
    default: []
  },
  // Growth Ratios
  growthRatios: {
    type: [ratioValueSchema],
    default: []
  },
  // Cash Flow Ratios
  cashFlowRatios: {
    type: [ratioValueSchema],
    default: []
  },
  // Custom Ratios
  customRatios: {
    type: [ratioValueSchema],
    default: []
  },
  // Overall financial health score (0-100)
  financialHealthScore: {
    type: Number,
    min: 0,
    max: 100
  },
  // Overall financial health status
  financialHealthStatus: {
    type: String,
    enum: ['EXCELLENT', 'GOOD', 'AVERAGE', 'POOR', 'CRITICAL', 'UNKNOWN'],
    default: 'UNKNOWN'
  },
  // Key insights and recommendations
  insights: [{
    type: String,
    trim: true
  }],
  recommendations: [{
    type: String,
    trim: true
  }],
  // Source of data used for calculations
  dataSource: {
    type: String,
    enum: ['SYSTEM_GENERATED', 'MANUALLY_ENTERED', 'IMPORTED', 'MIXED'],
    default: 'SYSTEM_GENERATED'
  },
  status: {
    type: String,
    enum: ['Draft', 'Published', 'Archived'],
    default: 'Draft'
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
  publishedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  publishedAt: {
    type: Date
  },
  notes: {
    type: String,
    trim: true
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
financialRatioSchema.index({ tenantId: 1, periodType: 1, periodName: 1, fiscalYear: 1 }, { unique: true });
financialRatioSchema.index({ tenantId: 1, fiscalYear: 1 });
financialRatioSchema.index({ tenantId: 1, status: 1 });
financialRatioSchema.index({ createdAt: 1 });
financialRatioSchema.index({ updatedAt: 1 });

// Helper function to get all ratios from all categories
financialRatioSchema.methods.getAllRatios = function() {
  return [
    ...this.liquidityRatios || [],
    ...this.profitabilityRatios || [],
    ...this.solvencyRatios || [],
    ...this.efficiencyRatios || [],
    ...this.valuationRatios || [],
    ...this.growthRatios || [],
    ...this.cashFlowRatios || [],
    ...this.customRatios || []
  ];
};

// Method to calculate financial health score
financialRatioSchema.methods.calculateFinancialHealthScore = function() {
  const allRatios = this.getAllRatios();
  if (!allRatios.length) {
    this.financialHealthScore = null;
    this.financialHealthStatus = 'UNKNOWN';
    return this;
  }
  
  // Count ratios by status
  const statusCounts = {
    'EXCELLENT': 0,
    'GOOD': 0,
    'AVERAGE': 0,
    'POOR': 0,
    'CRITICAL': 0,
    'UNKNOWN': 0
  };
  
  allRatios.forEach(ratio => {
    statusCounts[ratio.status]++;
  });
  
  // Calculate weighted score
  const totalRatios = allRatios.length - statusCounts['UNKNOWN'];
  if (totalRatios === 0) {
    this.financialHealthScore = null;
    this.financialHealthStatus = 'UNKNOWN';
    return this;
  }
  
  const score = (
    (statusCounts['EXCELLENT'] * 100) +
    (statusCounts['GOOD'] * 80) +
    (statusCounts['AVERAGE'] * 60) +
    (statusCounts['POOR'] * 30) +
    (statusCounts['CRITICAL'] * 10)
  ) / totalRatios;
  
  this.financialHealthScore = Math.round(score);
  
  // Determine overall status based on score
  if (score >= 90) this.financialHealthStatus = 'EXCELLENT';
  else if (score >= 75) this.financialHealthStatus = 'GOOD';
  else if (score >= 50) this.financialHealthStatus = 'AVERAGE';
  else if (score >= 25) this.financialHealthStatus = 'POOR';
  else this.financialHealthStatus = 'CRITICAL';
  
  return this;
};

// Method to calculate common financial ratios
financialRatioSchema.methods.calculateCommonRatios = async function(financialData) {
  // This would be implemented to calculate common financial ratios
  // based on the provided financial data (balance sheet, income statement, cash flow)
  // Implementation would depend on the financial data structure and business logic
  
  // Example implementation for a few common ratios
  if (!financialData) return this;
  
  const { balanceSheet, incomeStatement, cashFlow } = financialData;
  
  // Clear existing ratios
  this.liquidityRatios = [];
  this.profitabilityRatios = [];
  this.solvencyRatios = [];
  this.efficiencyRatios = [];
  
  // Calculate liquidity ratios
  if (balanceSheet) {
    const currentAssets = balanceSheet.currentAssets || 0;
    const currentLiabilities = balanceSheet.currentLiabilities || 0;
    const inventory = balanceSheet.inventory || 0;
    const cash = balanceSheet.cash || 0;
    
    // Current Ratio
    if (currentLiabilities > 0) {
      this.liquidityRatios.push({
        name: 'Current Ratio',
        category: 'LIQUIDITY',
        value: currentAssets / currentLiabilities,
        formula: 'Current Assets / Current Liabilities',
        benchmark: 2.0,
        status: currentAssets / currentLiabilities >= 2.0 ? 'GOOD' : 
                currentAssets / currentLiabilities >= 1.5 ? 'AVERAGE' : 'POOR'
      });
    }
    
    // Quick Ratio
    if (currentLiabilities > 0) {
      this.liquidityRatios.push({
        name: 'Quick Ratio',
        category: 'LIQUIDITY',
        value: (currentAssets - inventory) / currentLiabilities,
        formula: '(Current Assets - Inventory) / Current Liabilities',
        benchmark: 1.0,
        status: (currentAssets - inventory) / currentLiabilities >= 1.0 ? 'GOOD' : 
                (currentAssets - inventory) / currentLiabilities >= 0.7 ? 'AVERAGE' : 'POOR'
      });
    }
    
    // Cash Ratio
    if (currentLiabilities > 0) {
      this.liquidityRatios.push({
        name: 'Cash Ratio',
        category: 'LIQUIDITY',
        value: cash / currentLiabilities,
        formula: 'Cash / Current Liabilities',
        benchmark: 0.5,
        status: cash / currentLiabilities >= 0.5 ? 'GOOD' : 
                cash / currentLiabilities >= 0.2 ? 'AVERAGE' : 'POOR'
      });
    }
  }
  
  // Calculate profitability ratios
  if (incomeStatement && balanceSheet) {
    const revenue = incomeStatement.revenue || 0;
    const netIncome = incomeStatement.netIncome || 0;
    const grossProfit = incomeStatement.grossProfit || 0;
    const operatingIncome = incomeStatement.operatingIncome || 0;
    const totalAssets = balanceSheet.totalAssets || 0;
    const shareholdersEquity = balanceSheet.shareholdersEquity || 0;
    
    // Gross Profit Margin
    if (revenue > 0) {
      this.profitabilityRatios.push({
        name: 'Gross Profit Margin',
        category: 'PROFITABILITY',
        value: (grossProfit / revenue) * 100,
        formula: '(Gross Profit / Revenue) * 100',
        benchmark: 40,
        status: (grossProfit / revenue) * 100 >= 40 ? 'EXCELLENT' : 
                (grossProfit / revenue) * 100 >= 30 ? 'GOOD' : 
                (grossProfit / revenue) * 100 >= 20 ? 'AVERAGE' : 'POOR'
      });
    }
    
    // Net Profit Margin
    if (revenue > 0) {
      this.profitabilityRatios.push({
        name: 'Net Profit Margin',
        category: 'PROFITABILITY',
        value: (netIncome / revenue) * 100,
        formula: '(Net Income / Revenue) * 100',
        benchmark: 10,
        status: (netIncome / revenue) * 100 >= 15 ? 'EXCELLENT' : 
                (netIncome / revenue) * 100 >= 10 ? 'GOOD' : 
                (netIncome / revenue) * 100 >= 5 ? 'AVERAGE' : 'POOR'
      });
    }
    
    // Return on Assets (ROA)
    if (totalAssets > 0) {
      this.profitabilityRatios.push({
        name: 'Return on Assets (ROA)',
        category: 'PROFITABILITY',
        value: (netIncome / totalAssets) * 100,
        formula: '(Net Income / Total Assets) * 100',
        benchmark: 5,
        status: (netIncome / totalAssets) * 100 >= 10 ? 'EXCELLENT' : 
                (netIncome / totalAssets) * 100 >= 5 ? 'GOOD' : 
                (netIncome / totalAssets) * 100 >= 2 ? 'AVERAGE' : 'POOR'
      });
    }
    
    // Return on Equity (ROE)
    if (shareholdersEquity > 0) {
      this.profitabilityRatios.push({
        name: 'Return on Equity (ROE)',
        category: 'PROFITABILITY',
        value: (netIncome / shareholdersEquity) * 100,
        formula: '(Net Income / Shareholders Equity) * 100',
        benchmark: 15,
        status: (netIncome / shareholdersEquity) * 100 >= 20 ? 'EXCELLENT' : 
                (netIncome / shareholdersEquity) * 100 >= 15 ? 'GOOD' : 
                (netIncome / shareholdersEquity) * 100 >= 10 ? 'AVERAGE' : 'POOR'
      });
    }
  }
  
  // Calculate financial health score
  this.calculateFinancialHealthScore();
  
  return this;
};

const FinancialRatio = mongoose.model('FinancialRatio', financialRatioSchema);

module.exports = FinancialRatio;