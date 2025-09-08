/**
 * Cash Flow Forecast Controller
 * Handles API requests for cash flow forecasting operations
 */

const CashFlowForecast = require('../../models/cfo/cashFlowForecast.model');
const Account = require('../../models/accounting/account.model');
const JournalEntry = require('../../models/accounting/journalEntry.model');
const { asyncHandler, AppError } = require('../../utils/appError');

/**
 * @desc    Create a new cash flow forecast
 * @route   POST /api/v1/cfo/cash-flow-forecasts
 * @access  Private (Requires authentication and authorization)
 */
exports.createCashFlowForecast = asyncHandler(async (req, res) => {
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
  
  // Check if cash flow forecast already exists for the given fiscal year
  const existingForecast = await CashFlowForecast.findOne({
    tenantId: req.user.tenantId,
    fiscalYear: req.body.fiscalYear
  });
  
  if (existingForecast) {
    return res.status(400).json({
      success: false,
      error: `A cash flow forecast already exists for fiscal year ${req.body.fiscalYear}`
    });
  }
  
  // Validate cash flow line items
  if (req.body.lineItems && req.body.lineItems.length > 0) {
    // Check if accounts exist (if account IDs are provided)
    const accountIds = req.body.lineItems
      .filter(item => item.accountId)
      .map(item => item.accountId);
    
    if (accountIds.length > 0) {
      const accounts = await Account.find({
        _id: { $in: accountIds },
        tenantId: req.user.tenantId
      });
      
      if (accounts.length !== accountIds.length) {
        return res.status(400).json({
          success: false,
          error: 'One or more account IDs are invalid'
        });
      }
    }
  }
  
  // Create the cash flow forecast
  const cashFlowForecast = await CashFlowForecast.create(req.body);
  
  res.status(201).json({
    success: true,
    data: cashFlowForecast
  });
});

/**
 * @desc    Get all cash flow forecasts
 * @route   GET /api/v1/cfo/cash-flow-forecasts
 * @access  Private (Requires authentication and authorization)
 */
exports.getCashFlowForecasts = asyncHandler(async (req, res) => {
  // Filter by tenant ID from authenticated user
  const filter = { tenantId: req.user.tenantId };
  
  // Add additional filters if provided
  if (req.query.fiscalYear) {
    filter.fiscalYear = req.query.fiscalYear;
  }
  if (req.query.status) {
    filter.status = req.query.status;
  }
  if (req.query.version) {
    filter.version = parseInt(req.query.version, 10);
  }
  
  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;
  
  // Find cash flow forecasts with filters and pagination
  const forecasts = await CashFlowForecast.find(filter)
    .populate('createdBy', 'name email')
    .sort({ fiscalYear: -1, version: -1 })
    .skip(skip)
    .limit(limit);
  
  // Get total count for pagination
  const total = await CashFlowForecast.countDocuments(filter);
  
  res.status(200).json({
    success: true,
    count: forecasts.length,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    },
    data: forecasts
  });
});

/**
 * @desc    Get cash flow forecast by ID
 * @route   GET /api/v1/cfo/cash-flow-forecasts/:id
 * @access  Private (Requires authentication and authorization)
 */
exports.getCashFlowForecastById = asyncHandler(async (req, res) => {
  const forecast = await CashFlowForecast.findOne({
    _id: req.params.id,
    tenantId: req.user.tenantId
  })
    .populate('lineItems.accountId', 'name code type')
    .populate('createdBy', 'name email')
    .populate('attachments');
  
  if (!forecast) {
    return res.status(404).json({
      success: false,
      error: 'Cash flow forecast not found'
    });
  }
  
  res.status(200).json({
    success: true,
    data: forecast
  });
});

/**
 * @desc    Update cash flow forecast
 * @route   PUT /api/v1/cfo/cash-flow-forecasts/:id
 * @access  Private (Requires authentication and authorization)
 */
exports.updateCashFlowForecast = asyncHandler(async (req, res) => {
  // Find the forecast first to check if it's finalized
  const existingForecast = await CashFlowForecast.findOne({
    _id: req.params.id,
    tenantId: req.user.tenantId
  });
  
  if (!existingForecast) {
    return res.status(404).json({
      success: false,
      error: 'Cash flow forecast not found'
    });
  }
  
  // Check if forecast is already finalized
  if (existingForecast.status === 'Finalized') {
    return res.status(400).json({
      success: false,
      error: 'Cannot update a finalized cash flow forecast. Create a new version instead.'
    });
  }
  
  // Validate cash flow line items if provided
  if (req.body.lineItems && req.body.lineItems.length > 0) {
    // Check if accounts exist (if account IDs are provided)
    const accountIds = req.body.lineItems
      .filter(item => item.accountId)
      .map(item => item.accountId);
    
    if (accountIds.length > 0) {
      const accounts = await Account.find({
        _id: { $in: accountIds },
        tenantId: req.user.tenantId
      });
      
      if (accounts.length !== accountIds.length) {
        return res.status(400).json({
          success: false,
          error: 'One or more account IDs are invalid'
        });
      }
    }
  }
  
  // Update the forecast
  req.body.updatedBy = req.user._id;
  const forecast = await CashFlowForecast.findOneAndUpdate(
    { _id: req.params.id, tenantId: req.user.tenantId },
    req.body,
    { new: true, runValidators: true }
  );
  
  res.status(200).json({
    success: true,
    data: forecast
  });
});

/**
 * @desc    Delete cash flow forecast
 * @route   DELETE /api/v1/cfo/cash-flow-forecasts/:id
 * @access  Private (Requires authentication and authorization)
 */
exports.deleteCashFlowForecast = asyncHandler(async (req, res) => {
  // Find the forecast first to check if it's finalized
  const existingForecast = await CashFlowForecast.findOne({
    _id: req.params.id,
    tenantId: req.user.tenantId
  });
  
  if (!existingForecast) {
    return res.status(404).json({
      success: false,
      error: 'Cash flow forecast not found'
    });
  }
  
  // Check if forecast is already finalized
  if (existingForecast.status === 'Finalized') {
    return res.status(400).json({
      success: false,
      error: 'Cannot delete a finalized cash flow forecast'
    });
  }
  
  // Delete the forecast
  await CashFlowForecast.findOneAndDelete({
    _id: req.params.id,
    tenantId: req.user.tenantId
  });
  
  res.status(200).json({
    success: true,
    data: {}
  });
});

/**
 * @desc    Finalize cash flow forecast
 * @route   PATCH /api/v1/cfo/cash-flow-forecasts/:id/finalize
 * @access  Private (Requires authentication and authorization)
 */
exports.finalizeCashFlowForecast = asyncHandler(async (req, res) => {
  // Find the forecast first to check if it's already finalized
  const existingForecast = await CashFlowForecast.findOne({
    _id: req.params.id,
    tenantId: req.user.tenantId
  });
  
  if (!existingForecast) {
    return res.status(404).json({
      success: false,
      error: 'Cash flow forecast not found'
    });
  }
  
  // Check if forecast is already finalized
  if (existingForecast.status === 'Finalized') {
    return res.status(400).json({
      success: false,
      error: 'Cash flow forecast is already finalized'
    });
  }
  
  // Update the forecast status to finalized
  const forecast = await CashFlowForecast.findOneAndUpdate(
    { _id: req.params.id, tenantId: req.user.tenantId },
    {
      status: 'Finalized',
      finalizedBy: req.user._id,
      finalizedAt: new Date(),
      updatedBy: req.user._id
    },
    { new: true }
  );
  
  res.status(200).json({
    success: true,
    data: forecast
  });
});

/**
 * @desc    Create a new version of an existing cash flow forecast
 * @route   POST /api/v1/cfo/cash-flow-forecasts/:id/versions
 * @access  Private (Requires authentication and authorization)
 */
exports.createCashFlowForecastVersion = asyncHandler(async (req, res) => {
  // Find the original forecast
  const originalForecast = await CashFlowForecast.findOne({
    _id: req.params.id,
    tenantId: req.user.tenantId
  });
  
  if (!originalForecast) {
    return res.status(404).json({
      success: false,
      error: 'Cash flow forecast not found'
    });
  }
  
  // Check if the original forecast is finalized
  if (originalForecast.status !== 'Finalized') {
    return res.status(400).json({
      success: false,
      error: 'Only finalized forecasts can have new versions'
    });
  }
  
  // Get the highest version number for this fiscal year
  const highestVersion = await CashFlowForecast.findOne({
    tenantId: req.user.tenantId,
    fiscalYear: originalForecast.fiscalYear
  }).sort({ version: -1 });
  
  // Create a new forecast with incremented version number
  const newForecastData = {
    tenantId: req.user.tenantId,
    fiscalYear: originalForecast.fiscalYear,
    version: highestVersion.version + 1,
    status: 'Draft',
    openingBalance: req.body.openingBalance || originalForecast.openingBalance,
    lineItems: req.body.lineItems || originalForecast.lineItems,
    notes: req.body.notes || originalForecast.notes,
    createdBy: req.user._id,
    previousVersionId: originalForecast._id
  };
  
  const newForecast = await CashFlowForecast.create(newForecastData);
  
  res.status(201).json({
    success: true,
    data: newForecast
  });
});

/**
 * @desc    Get cash flow forecast vs actual comparison
 * @route   GET /api/v1/cfo/cash-flow-forecasts/:id/comparison
 * @access  Private (Requires authentication and authorization)
 */
exports.getCashFlowComparison = asyncHandler(async (req, res) => {
  // Find the forecast
  const forecast = await CashFlowForecast.findOne({
    _id: req.params.id,
    tenantId: req.user.tenantId
  }).populate('lineItems.accountId', 'name code type');

  if (!forecast) {
    return res.status(404).json({
      success: false,
      error: 'Cash flow forecast not found'
    });
  }

  // Get fiscal year start and end
  const [startYear, endYearShort] = forecast.fiscalYear.split('-');
  const startDate = new Date(`${startYear}-04-01`);
  const endDate = new Date(`${parseInt(startYear) + 1}-03-31T23:59:59.999Z`);

  // For each line item, sum actuals from posted journal entries
  const actualsByAccount = {};
  const journalEntries = await JournalEntry.find({
    tenantId: req.user.tenantId,
    status: 'Posted',
    date: { $gte: startDate, $lte: endDate }
  });
  journalEntries.forEach(entry => {
    entry.lines.forEach(line => {
      const accId = line.account.toString();
      if (!actualsByAccount[accId]) actualsByAccount[accId] = 0;
      // For cash flow, debits are inflows, credits are outflows
      actualsByAccount[accId] += (line.debit || 0) - (line.credit || 0);
    });
  });

  // Build comparison data
  let totalForecastInflow = 0;
  let totalActualInflow = 0;
  let totalForecastOutflow = 0;
  let totalActualOutflow = 0;
  const lineItems = forecast.lineItems.map(item => {
    const accId = item.accountId ? item.accountId._id.toString() : null;
    const actual = actualsByAccount[accId] || 0;
    // Assume positive forecast is inflow, negative is outflow
    if (item.annualAmount >= 0) {
      totalForecastInflow += item.annualAmount;
      totalActualInflow += actual;
    } else {
      totalForecastOutflow += Math.abs(item.annualAmount);
      totalActualOutflow += Math.abs(actual);
    }
    const variance = actual - item.annualAmount;
    const variancePercentage = item.annualAmount !== 0 ? (variance / item.annualAmount) * 100 : 0;
    return {
      description: item.description,
      activityType: item.activityType,
      accountId: accId,
      accountName: item.accountId ? item.accountId.name : null,
      annualForecast: item.annualAmount,
      actualToDate: actual,
      variance,
      variancePercentage,
      monthlyForecast: item.monthlyDistribution,
      monthlyActual: Array(12).fill(0), // For simplicity, not splitting by month here
      monthlyVariance: item.monthlyDistribution.map(amount => -amount)
    };
  });
  const comparisonData = {
    forecastId: forecast._id,
    fiscalYear: forecast.fiscalYear,
    version: forecast.version,
    openingBalance: forecast.openingBalance,
    actualOpeningBalance: forecast.openingBalance, // Not calculated here
    forecastClosingBalance: forecast.closingBalance,
    actualClosingBalance: 0, // Not calculated here
    totalForecastInflow,
    totalActualInflow,
    totalForecastOutflow,
    totalActualOutflow,
    lineItems
  };
  res.status(200).json({
    success: true,
    data: comparisonData
  });
});

/**
 * @desc    Get cash flow forecast statistics
 * @route   GET /api/v1/cfo/cash-flow-forecasts/statistics
 * @access  Private (Requires authentication and authorization)
 */
exports.getCashFlowStatistics = asyncHandler(async (req, res) => {
  // Get fiscal year from query params or default to current fiscal year
  const today = new Date();
  const currentMonth = today.getMonth() + 1;
  const currentYear = today.getFullYear();
  const defaultFY = currentMonth >= 4 
    ? `${currentYear}-${(currentYear + 1).toString().substr(2, 2)}` 
    : `${currentYear - 1}-${currentYear.toString().substr(2, 2)}`;
  
  const fiscalYear = req.query.fiscalYear || defaultFY;
  
  // Aggregate statistics
  const statistics = await CashFlowForecast.aggregate([
    {
      $match: {
        tenantId: req.user.tenantId,
        fiscalYear: fiscalYear
      }
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalInflow: { $sum: '$totalInflow' },
        totalOutflow: { $sum: '$totalOutflow' },
        netCashFlow: { $sum: { $subtract: ['$totalInflow', '$totalOutflow'] } }
      }
    }
  ]);
  
  // Format response
  const result = {
    fiscalYear,
    totalForecasts: 0,
    draftForecasts: 0,
    finalizedForecasts: 0,
    totalInflow: 0,
    totalOutflow: 0,
    netCashFlow: 0
  };
  
  statistics.forEach(stat => {
    result.totalForecasts += stat.count;
    
    if (stat._id === 'Draft') {
      result.draftForecasts = stat.count;
    } else if (stat._id === 'Finalized') {
      result.finalizedForecasts = stat.count;
      result.totalInflow = stat.totalInflow || 0;
      result.totalOutflow = stat.totalOutflow || 0;
      result.netCashFlow = stat.netCashFlow || 0;
    }
  });
  
  res.status(200).json({
    success: true,
    data: result
  });
});