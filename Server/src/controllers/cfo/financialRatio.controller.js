/**
 * Financial Ratio Controller
 * Handles API requests for financial ratio analysis operations
 */

const FinancialRatio = require('../../models/cfo/financialRatio.model');
const { asyncHandler, AppError } = require('../../utils/appError');

/**
 * @desc    Create a new financial ratio analysis
 * @route   POST /api/v1/cfo/financial-ratios
 * @access  Private (Requires authentication and authorization)
 */
exports.createFinancialRatio = asyncHandler(async (req, res) => {
  // Add tenant ID from authenticated user
  req.body.tenantId = req.user.tenantId;
  req.body.createdBy = req.user._id;
  
  // Validate fiscal year format (YYYY-YY)
  const fyRegex = /^\d{4}-\d{2}$/;
  if (!fyRegex.test(req.body.fiscalYear)) {
    return res.status(400).json({
      success: false,
      error: 'Fiscal year must be in YYYY-YY format'
    });
  }
  
  // Check if financial ratio analysis already exists for the given period
  const existingAnalysis = await FinancialRatio.findOne({
    tenantId: req.user.tenantId,
    fiscalYear: req.body.fiscalYear,
    'period.type': req.body.period.type,
    'period.name': req.body.period.name
  });
  
  if (existingAnalysis) {
    return res.status(400).json({
      success: false,
      error: `A financial ratio analysis already exists for ${req.body.period.type} ${req.body.period.name} in fiscal year ${req.body.fiscalYear}`
    });
  }
  
  // Create the financial ratio analysis
  const financialRatio = await FinancialRatio.create(req.body);
  
  res.status(201).json({
    success: true,
    data: financialRatio
  });
});

/**
 * @desc    Get all financial ratio analyses
 * @route   GET /api/v1/cfo/financial-ratios
 * @access  Private (Requires authentication and authorization)
 */
exports.getFinancialRatios = asyncHandler(async (req, res) => {
  // Filter by tenant ID from authenticated user
  const filter = { tenantId: req.user.tenantId };
  
  // Add additional filters if provided
  if (req.query.fiscalYear) {
    filter.fiscalYear = req.query.fiscalYear;
  }
  if (req.query.periodType) {
    filter['period.type'] = req.query.periodType;
  }
  if (req.query.periodName) {
    filter['period.name'] = req.query.periodName;
  }
  
  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;
  
  // Find financial ratio analyses with filters and pagination
  const financialRatios = await FinancialRatio.find(filter)
    .populate('createdBy', 'name email')
    .sort({ fiscalYear: -1, 'period.name': -1 })
    .skip(skip)
    .limit(limit);
  
  // Get total count for pagination
  const total = await FinancialRatio.countDocuments(filter);
  
  res.status(200).json({
    success: true,
    count: financialRatios.length,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    },
    data: financialRatios
  });
});

/**
 * @desc    Get financial ratio analysis by ID
 * @route   GET /api/v1/cfo/financial-ratios/:id
 * @access  Private (Requires authentication and authorization)
 */
exports.getFinancialRatioById = asyncHandler(async (req, res) => {
  const financialRatio = await FinancialRatio.findOne({
    _id: req.params.id,
    tenantId: req.user.tenantId
  })
    .populate('createdBy', 'name email')
    .populate('attachments');
  
  if (!financialRatio) {
    return res.status(404).json({
      success: false,
      error: 'Financial ratio analysis not found'
    });
  }
  
  res.status(200).json({
    success: true,
    data: financialRatio
  });
});

/**
 * @desc    Update financial ratio analysis
 * @route   PUT /api/v1/cfo/financial-ratios/:id
 * @access  Private (Requires authentication and authorization)
 */
exports.updateFinancialRatio = asyncHandler(async (req, res) => {
  // Find the financial ratio analysis first
  const existingAnalysis = await FinancialRatio.findOne({
    _id: req.params.id,
    tenantId: req.user.tenantId
  });
  
  if (!existingAnalysis) {
    return res.status(404).json({
      success: false,
      error: 'Financial ratio analysis not found'
    });
  }
  
  // Update the financial ratio analysis
  req.body.updatedBy = req.user._id;
  const financialRatio = await FinancialRatio.findOneAndUpdate(
    { _id: req.params.id, tenantId: req.user.tenantId },
    req.body,
    { new: true, runValidators: true }
  );
  
  res.status(200).json({
    success: true,
    data: financialRatio
  });
});

/**
 * @desc    Delete financial ratio analysis
 * @route   DELETE /api/v1/cfo/financial-ratios/:id
 * @access  Private (Requires authentication and authorization)
 */
exports.deleteFinancialRatio = asyncHandler(async (req, res) => {
  // Find the financial ratio analysis first
  const existingAnalysis = await FinancialRatio.findOne({
    _id: req.params.id,
    tenantId: req.user.tenantId
  });
  
  if (!existingAnalysis) {
    return res.status(404).json({
      success: false,
      error: 'Financial ratio analysis not found'
    });
  }
  
  // Delete the financial ratio analysis
  await FinancialRatio.findOneAndDelete({
    _id: req.params.id,
    tenantId: req.user.tenantId
  });
  
  res.status(200).json({
    success: true,
    data: {}
  });
});

/**
 * @desc    Calculate financial ratios from financial statements
 * @route   POST /api/v1/cfo/financial-ratios/calculate
 * @access  Private (Requires authentication and authorization)
 */
exports.calculateFinancialRatios = asyncHandler(async (req, res) => {
  // Validate request body
  if (!req.body.fiscalYear || !req.body.period || !req.body.balanceSheet || !req.body.incomeStatement) {
    return res.status(400).json({
      success: false,
      error: 'Fiscal year, period, balance sheet, and income statement data are required'
    });
  }
  
  // Validate fiscal year format (YYYY-YY)
  const fyRegex = /^\d{4}-\d{2}$/;
  if (!fyRegex.test(req.body.fiscalYear)) {
    return res.status(400).json({
      success: false,
      error: 'Fiscal year must be in YYYY-YY format'
    });
  }
  
  // Extract financial statement data
  const { balanceSheet, incomeStatement, cashFlowStatement } = req.body;
  
  // Calculate liquidity ratios
  const liquidityRatios = [
    {
      name: 'Current Ratio',
      category: 'LIQUIDITY',
      value: balanceSheet.currentAssets / balanceSheet.currentLiabilities,
      formula: 'Current Assets / Current Liabilities',
      benchmark: 2.0,
      status: (balanceSheet.currentAssets / balanceSheet.currentLiabilities) >= 2.0 ? 'GOOD' : 'NEEDS_IMPROVEMENT'
    },
    {
      name: 'Quick Ratio',
      category: 'LIQUIDITY',
      value: (balanceSheet.currentAssets - balanceSheet.inventory) / balanceSheet.currentLiabilities,
      formula: '(Current Assets - Inventory) / Current Liabilities',
      benchmark: 1.0,
      status: ((balanceSheet.currentAssets - balanceSheet.inventory) / balanceSheet.currentLiabilities) >= 1.0 ? 'GOOD' : 'NEEDS_IMPROVEMENT'
    },
    {
      name: 'Cash Ratio',
      category: 'LIQUIDITY',
      value: balanceSheet.cash / balanceSheet.currentLiabilities,
      formula: 'Cash / Current Liabilities',
      benchmark: 0.5,
      status: (balanceSheet.cash / balanceSheet.currentLiabilities) >= 0.5 ? 'GOOD' : 'NEEDS_IMPROVEMENT'
    }
  ];
  
  // Calculate profitability ratios
  const profitabilityRatios = [
    {
      name: 'Gross Profit Margin',
      category: 'PROFITABILITY',
      value: incomeStatement.grossProfit / incomeStatement.revenue * 100,
      formula: 'Gross Profit / Revenue * 100',
      benchmark: 30.0,
      status: (incomeStatement.grossProfit / incomeStatement.revenue * 100) >= 30.0 ? 'GOOD' : 'NEEDS_IMPROVEMENT'
    },
    {
      name: 'Net Profit Margin',
      category: 'PROFITABILITY',
      value: incomeStatement.netIncome / incomeStatement.revenue * 100,
      formula: 'Net Income / Revenue * 100',
      benchmark: 10.0,
      status: (incomeStatement.netIncome / incomeStatement.revenue * 100) >= 10.0 ? 'GOOD' : 'NEEDS_IMPROVEMENT'
    },
    {
      name: 'Return on Assets (ROA)',
      category: 'PROFITABILITY',
      value: incomeStatement.netIncome / balanceSheet.totalAssets * 100,
      formula: 'Net Income / Total Assets * 100',
      benchmark: 5.0,
      status: (incomeStatement.netIncome / balanceSheet.totalAssets * 100) >= 5.0 ? 'GOOD' : 'NEEDS_IMPROVEMENT'
    },
    {
      name: 'Return on Equity (ROE)',
      category: 'PROFITABILITY',
      value: incomeStatement.netIncome / balanceSheet.shareholdersEquity * 100,
      formula: 'Net Income / Shareholders Equity * 100',
      benchmark: 15.0,
      status: (incomeStatement.netIncome / balanceSheet.shareholdersEquity * 100) >= 15.0 ? 'GOOD' : 'NEEDS_IMPROVEMENT'
    }
  ];
  
  // Calculate solvency ratios
  const solvencyRatios = [
    {
      name: 'Debt to Equity Ratio',
      category: 'SOLVENCY',
      value: balanceSheet.totalLiabilities / balanceSheet.shareholdersEquity,
      formula: 'Total Liabilities / Shareholders Equity',
      benchmark: 1.0,
      status: (balanceSheet.totalLiabilities / balanceSheet.shareholdersEquity) <= 1.0 ? 'GOOD' : 'NEEDS_IMPROVEMENT'
    },
    {
      name: 'Debt Ratio',
      category: 'SOLVENCY',
      value: balanceSheet.totalLiabilities / balanceSheet.totalAssets,
      formula: 'Total Liabilities / Total Assets',
      benchmark: 0.5,
      status: (balanceSheet.totalLiabilities / balanceSheet.totalAssets) <= 0.5 ? 'GOOD' : 'NEEDS_IMPROVEMENT'
    },
    {
      name: 'Interest Coverage Ratio',
      category: 'SOLVENCY',
      value: incomeStatement.ebit / incomeStatement.interestExpense,
      formula: 'EBIT / Interest Expense',
      benchmark: 3.0,
      status: (incomeStatement.ebit / incomeStatement.interestExpense) >= 3.0 ? 'GOOD' : 'NEEDS_IMPROVEMENT'
    }
  ];
  
  // Calculate efficiency ratios
  const efficiencyRatios = [
    {
      name: 'Asset Turnover Ratio',
      category: 'EFFICIENCY',
      value: incomeStatement.revenue / balanceSheet.totalAssets,
      formula: 'Revenue / Total Assets',
      benchmark: 1.0,
      status: (incomeStatement.revenue / balanceSheet.totalAssets) >= 1.0 ? 'GOOD' : 'NEEDS_IMPROVEMENT'
    },
    {
      name: 'Inventory Turnover Ratio',
      category: 'EFFICIENCY',
      value: incomeStatement.costOfGoodsSold / balanceSheet.inventory,
      formula: 'Cost of Goods Sold / Inventory',
      benchmark: 6.0,
      status: (incomeStatement.costOfGoodsSold / balanceSheet.inventory) >= 6.0 ? 'GOOD' : 'NEEDS_IMPROVEMENT'
    },
    {
      name: 'Receivables Turnover Ratio',
      category: 'EFFICIENCY',
      value: incomeStatement.revenue / balanceSheet.accountsReceivable,
      formula: 'Revenue / Accounts Receivable',
      benchmark: 8.0,
      status: (incomeStatement.revenue / balanceSheet.accountsReceivable) >= 8.0 ? 'GOOD' : 'NEEDS_IMPROVEMENT'
    }
  ];
  
  // Calculate cash flow ratios if cash flow statement is provided
  let cashFlowRatios = [];
  if (cashFlowStatement) {
    cashFlowRatios = [
      {
        name: 'Operating Cash Flow Ratio',
        category: 'CASH_FLOW',
        value: cashFlowStatement.operatingCashFlow / balanceSheet.currentLiabilities,
        formula: 'Operating Cash Flow / Current Liabilities',
        benchmark: 1.0,
        status: (cashFlowStatement.operatingCashFlow / balanceSheet.currentLiabilities) >= 1.0 ? 'GOOD' : 'NEEDS_IMPROVEMENT'
      },
      {
        name: 'Cash Flow to Debt Ratio',
        category: 'CASH_FLOW',
        value: cashFlowStatement.operatingCashFlow / balanceSheet.totalLiabilities,
        formula: 'Operating Cash Flow / Total Liabilities',
        benchmark: 0.2,
        status: (cashFlowStatement.operatingCashFlow / balanceSheet.totalLiabilities) >= 0.2 ? 'GOOD' : 'NEEDS_IMPROVEMENT'
      },
      {
        name: 'Free Cash Flow to Operating Cash Flow Ratio',
        category: 'CASH_FLOW',
        value: cashFlowStatement.freeCashFlow / cashFlowStatement.operatingCashFlow,
        formula: 'Free Cash Flow / Operating Cash Flow',
        benchmark: 0.5,
        status: (cashFlowStatement.freeCashFlow / cashFlowStatement.operatingCashFlow) >= 0.5 ? 'GOOD' : 'NEEDS_IMPROVEMENT'
      }
    ];
  }
  
  // Calculate financial health score
  const allRatios = [...liquidityRatios, ...profitabilityRatios, ...solvencyRatios, ...efficiencyRatios, ...cashFlowRatios];
  const goodRatios = allRatios.filter(ratio => ratio.status === 'GOOD').length;
  const financialHealthScore = (goodRatios / allRatios.length) * 100;
  
  let financialHealthStatus = 'POOR';
  if (financialHealthScore >= 80) {
    financialHealthStatus = 'EXCELLENT';
  } else if (financialHealthScore >= 60) {
    financialHealthStatus = 'GOOD';
  } else if (financialHealthScore >= 40) {
    financialHealthStatus = 'FAIR';
  }
  
  // Generate insights and recommendations
  const insights = [];
  const recommendations = [];
  
  // Liquidity insights and recommendations
  const currentRatio = liquidityRatios.find(ratio => ratio.name === 'Current Ratio');
  if (currentRatio && currentRatio.status === 'NEEDS_IMPROVEMENT') {
    insights.push('The company may face challenges meeting short-term obligations.');
    recommendations.push('Consider reducing current liabilities or increasing current assets to improve liquidity.');
  }
  
  // Profitability insights and recommendations
  const netProfitMargin = profitabilityRatios.find(ratio => ratio.name === 'Net Profit Margin');
  if (netProfitMargin && netProfitMargin.status === 'NEEDS_IMPROVEMENT') {
    insights.push('The company\'s profitability is below industry benchmarks.');
    recommendations.push('Focus on cost reduction strategies and improving operational efficiency to increase profit margins.');
  }
  
  // Solvency insights and recommendations
  const debtToEquity = solvencyRatios.find(ratio => ratio.name === 'Debt to Equity Ratio');
  if (debtToEquity && debtToEquity.status === 'NEEDS_IMPROVEMENT') {
    insights.push('The company has a high level of debt relative to equity.');
    recommendations.push('Consider reducing debt or increasing equity to improve financial stability.');
  }
  
  // Efficiency insights and recommendations
  const assetTurnover = efficiencyRatios.find(ratio => ratio.name === 'Asset Turnover Ratio');
  if (assetTurnover && assetTurnover.status === 'NEEDS_IMPROVEMENT') {
    insights.push('The company is not efficiently using its assets to generate revenue.');
    recommendations.push('Review asset utilization and consider divesting underperforming assets.');
  }
  
  // Prepare the financial ratio analysis data
  const financialRatioData = {
    tenantId: req.user.tenantId,
    fiscalYear: req.body.fiscalYear,
    period: req.body.period,
    liquidityRatios,
    profitabilityRatios,
    solvencyRatios,
    efficiencyRatios,
    cashFlowRatios,
    financialHealthScore,
    financialHealthStatus,
    insights,
    recommendations,
    createdBy: req.user._id
  };
  
  // Check if financial ratio analysis already exists for the given period
  const existingAnalysis = await FinancialRatio.findOne({
    tenantId: req.user.tenantId,
    fiscalYear: req.body.fiscalYear,
    'period.type': req.body.period.type,
    'period.name': req.body.period.name
  });
  
  let financialRatio;
  
  if (existingAnalysis) {
    // Update existing analysis
    financialRatio = await FinancialRatio.findByIdAndUpdate(
      existingAnalysis._id,
      {
        ...financialRatioData,
        updatedBy: req.user._id
      },
      { new: true }
    );
  } else {
    // Create new analysis
    financialRatio = await FinancialRatio.create(financialRatioData);
  }
  
  res.status(200).json({
    success: true,
    data: financialRatio
  });
});

/**
 * @desc    Get financial ratio trends
 * @route   GET /api/v1/cfo/financial-ratios/trends
 * @access  Private (Requires authentication and authorization)
 */
exports.getFinancialRatioTrends = asyncHandler(async (req, res) => {
  // Validate request query parameters
  if (!req.query.ratioName) {
    return res.status(400).json({
      success: false,
      error: 'Ratio name is required'
    });
  }
  
  // Get fiscal year from query params or default to current fiscal year
  const today = new Date();
  const currentMonth = today.getMonth() + 1;
  const currentYear = today.getFullYear();
  const defaultFY = currentMonth >= 4 
    ? `${currentYear}-${(currentYear + 1).toString().substr(2, 2)}` 
    : `${currentYear - 1}-${currentYear.toString().substr(2, 2)}`;
  
  const fiscalYear = req.query.fiscalYear || defaultFY;
  const periodType = req.query.periodType || 'Quarter';
  const ratioName = req.query.ratioName;
  const ratioCategory = req.query.ratioCategory;
  
  // Build the filter
  const filter = { tenantId: req.user.tenantId };
  
  if (fiscalYear) {
    filter.fiscalYear = fiscalYear;
  }
  
  if (periodType) {
    filter['period.type'] = periodType;
  }
  
  // Find financial ratio analyses
  const financialRatios = await FinancialRatio.find(filter)
    .sort({ 'period.name': 1 });
  
  // Extract trend data for the specified ratio
  const trendData = [];
  
  financialRatios.forEach(ratio => {
    let ratioValue;
    
    if (ratioCategory === 'LIQUIDITY') {
      ratioValue = ratio.liquidityRatios.find(r => r.name === ratioName);
    } else if (ratioCategory === 'PROFITABILITY') {
      ratioValue = ratio.profitabilityRatios.find(r => r.name === ratioName);
    } else if (ratioCategory === 'SOLVENCY') {
      ratioValue = ratio.solvencyRatios.find(r => r.name === ratioName);
    } else if (ratioCategory === 'EFFICIENCY') {
      ratioValue = ratio.efficiencyRatios.find(r => r.name === ratioName);
    } else if (ratioCategory === 'CASH_FLOW') {
      ratioValue = ratio.cashFlowRatios.find(r => r.name === ratioName);
    } else {
      // If no category specified, search in all categories
      ratioValue = ratio.liquidityRatios.find(r => r.name === ratioName) ||
                  ratio.profitabilityRatios.find(r => r.name === ratioName) ||
                  ratio.solvencyRatios.find(r => r.name === ratioName) ||
                  ratio.efficiencyRatios.find(r => r.name === ratioName) ||
                  ratio.cashFlowRatios.find(r => r.name === ratioName);
    }
    
    if (ratioValue) {
      trendData.push({
        period: ratio.period.name,
        value: ratioValue.value,
        benchmark: ratioValue.benchmark,
        status: ratioValue.status
      });
    }
  });
  
  res.status(200).json({
    success: true,
    data: {
      ratioName,
      ratioCategory,
      fiscalYear,
      periodType,
      trend: trendData
    }
  });
});

/**
 * @desc    Get financial health score trends
 * @route   GET /api/v1/cfo/financial-ratios/health-trends
 * @access  Private (Requires authentication and authorization)
 */
exports.getFinancialHealthTrends = asyncHandler(async (req, res) => {
  // Get period type from query params or default to Quarter
  const periodType = req.query.periodType || 'Quarter';
  
  // Get the last 4 fiscal years
  const today = new Date();
  const currentYear = today.getFullYear();
  const fiscalYears = [];
  
  for (let i = 0; i < 4; i++) {
    const year = currentYear - i;
    fiscalYears.push(`${year}-${(year + 1).toString().substr(2, 2)}`);
  }
  
  // Build the filter
  const filter = { 
    tenantId: req.user.tenantId,
    fiscalYear: { $in: fiscalYears },
    'period.type': periodType
  };
  
  // Find financial ratio analyses
  const financialRatios = await FinancialRatio.find(filter)
    .sort({ fiscalYear: -1, 'period.name': 1 });
  
  // Extract health score trend data
  const trendData = [];
  
  financialRatios.forEach(ratio => {
    trendData.push({
      fiscalYear: ratio.fiscalYear,
      period: ratio.period.name,
      financialHealthScore: ratio.financialHealthScore,
      financialHealthStatus: ratio.financialHealthStatus
    });
  });
  
  res.status(200).json({
    success: true,
    data: {
      periodType,
      trend: trendData
    }
  });
});

/**
 * @desc    Get financial ratio statistics
 * @route   GET /api/v1/cfo/financial-ratios/statistics
 * @access  Private (Requires authentication and authorization)
 */
exports.getFinancialRatioStatistics = asyncHandler(async (req, res) => {
  // Get fiscal year from query params or default to current fiscal year
  const today = new Date();
  const currentMonth = today.getMonth() + 1;
  const currentYear = today.getFullYear();
  const defaultFY = currentMonth >= 4 
    ? `${currentYear}-${(currentYear + 1).toString().substr(2, 2)}` 
    : `${currentYear - 1}-${currentYear.toString().substr(2, 2)}`;
  
  const fiscalYear = req.query.fiscalYear || defaultFY;
  
  // Find the latest financial ratio analysis for the fiscal year
  const latestAnalysis = await FinancialRatio.findOne({
    tenantId: req.user.tenantId,
    fiscalYear: fiscalYear
  }).sort({ 'period.name': -1 });
  
  if (!latestAnalysis) {
    return res.status(404).json({
      success: false,
      error: `No financial ratio analysis found for fiscal year ${fiscalYear}`
    });
  }
  
  // Count ratios by category and status
  const ratioStats = {
    totalRatios: 0,
    goodRatios: 0,
    needsImprovementRatios: 0,
    byCategory: {
      LIQUIDITY: { total: 0, good: 0, needsImprovement: 0 },
      PROFITABILITY: { total: 0, good: 0, needsImprovement: 0 },
      SOLVENCY: { total: 0, good: 0, needsImprovement: 0 },
      EFFICIENCY: { total: 0, good: 0, needsImprovement: 0 },
      CASH_FLOW: { total: 0, good: 0, needsImprovement: 0 }
    }
  };
  
  // Process liquidity ratios
  latestAnalysis.liquidityRatios.forEach(ratio => {
    ratioStats.totalRatios++;
    ratioStats.byCategory.LIQUIDITY.total++;
    
    if (ratio.status === 'GOOD') {
      ratioStats.goodRatios++;
      ratioStats.byCategory.LIQUIDITY.good++;
    } else {
      ratioStats.needsImprovementRatios++;
      ratioStats.byCategory.LIQUIDITY.needsImprovement++;
    }
  });
  
  // Process profitability ratios
  latestAnalysis.profitabilityRatios.forEach(ratio => {
    ratioStats.totalRatios++;
    ratioStats.byCategory.PROFITABILITY.total++;
    
    if (ratio.status === 'GOOD') {
      ratioStats.goodRatios++;
      ratioStats.byCategory.PROFITABILITY.good++;
    } else {
      ratioStats.needsImprovementRatios++;
      ratioStats.byCategory.PROFITABILITY.needsImprovement++;
    }
  });
  
  // Process solvency ratios
  latestAnalysis.solvencyRatios.forEach(ratio => {
    ratioStats.totalRatios++;
    ratioStats.byCategory.SOLVENCY.total++;
    
    if (ratio.status === 'GOOD') {
      ratioStats.goodRatios++;
      ratioStats.byCategory.SOLVENCY.good++;
    } else {
      ratioStats.needsImprovementRatios++;
      ratioStats.byCategory.SOLVENCY.needsImprovement++;
    }
  });
  
  // Process efficiency ratios
  latestAnalysis.efficiencyRatios.forEach(ratio => {
    ratioStats.totalRatios++;
    ratioStats.byCategory.EFFICIENCY.total++;
    
    if (ratio.status === 'GOOD') {
      ratioStats.goodRatios++;
      ratioStats.byCategory.EFFICIENCY.good++;
    } else {
      ratioStats.needsImprovementRatios++;
      ratioStats.byCategory.EFFICIENCY.needsImprovement++;
    }
  });
  
  // Process cash flow ratios
  latestAnalysis.cashFlowRatios.forEach(ratio => {
    ratioStats.totalRatios++;
    ratioStats.byCategory.CASH_FLOW.total++;
    
    if (ratio.status === 'GOOD') {
      ratioStats.goodRatios++;
      ratioStats.byCategory.CASH_FLOW.good++;
    } else {
      ratioStats.needsImprovementRatios++;
      ratioStats.byCategory.CASH_FLOW.needsImprovement++;
    }
  });
  
  res.status(200).json({
    success: true,
    data: {
      fiscalYear,
      period: latestAnalysis.period,
      financialHealthScore: latestAnalysis.financialHealthScore,
      financialHealthStatus: latestAnalysis.financialHealthStatus,
      ratioStats
    }
  });
});