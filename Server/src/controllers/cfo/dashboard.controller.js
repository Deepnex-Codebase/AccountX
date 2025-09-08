/**
 * Dashboard Controller
 * Handles operations for dashboard metrics and quick actions
 */

const asyncHandler = require('express-async-handler');
const DashboardMetric = require('../../models/cfo/dashboardMetrics.model');
const Budget = require('../../models/cfo/budget.model');
const CashFlowForecast = require('../../models/cfo/cashFlowForecast.model');
const FinancialRatio = require('../../models/cfo/financialRatio.model');
const PurchaseInvoice = require('../../models/gst/purchaseInvoice.model');

/**
 * @desc    Get dashboard metrics
 * @route   GET /api/v1/cfo/dashboard/metrics
 * @access  Private
 */
exports.getDashboardMetrics = asyncHandler(async (req, res) => {
  const { type, asOf, page = 1, limit = 10 } = req.query;
  
  // Build filter object
  const filter = { tenantId: req.tenantId };
  
  if (type) {
    filter.type = type;
  }
  
  if (asOf) {
    filter.asOf = asOf;
  }
  
  // Calculate pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  // Find dashboard metrics with filters and pagination
  const metrics = await DashboardMetric.find(filter)
    .sort({ asOf: -1 }) // Default sort by asOf date, newest first
    .skip(skip)
    .limit(parseInt(limit));
  
  // Get total count for pagination
  const total = await DashboardMetric.countDocuments(filter);
  
  res.status(200).json({
    success: true,
    count: metrics.length,
    total,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit))
    },
    data: metrics
  });
});

/**
 * @desc    Create or update dashboard metric
 * @route   POST /api/v1/cfo/dashboard/metrics
 * @access  Private
 */
exports.createOrUpdateDashboardMetric = asyncHandler(async (req, res) => {
  // Add tenant ID to the metric data
  req.body.tenantId = req.tenantId;

  // Check if metric with same type and asOf already exists for this tenant
  const existingMetric = await DashboardMetric.findOne({
    tenantId: req.tenantId,
    type: req.body.type,
    asOf: req.body.asOf
  });

  let metric;
  
  if (existingMetric) {
    // Update existing metric
    metric = await DashboardMetric.findOneAndUpdate(
      { _id: existingMetric._id },
      req.body,
      { new: true, runValidators: true }
    );
  } else {
    // Create new metric
    metric = await DashboardMetric.create(req.body);
  }

  res.status(201).json({
    success: true,
    data: metric
  });
});

/**
 * @desc    Get dashboard summary
 * @route   GET /api/v1/cfo/dashboard/summary
 * @access  Private
 */
exports.getDashboardSummary = asyncHandler(async (req, res) => {
  // Get latest budget
  const latestBudget = await Budget.findOne({ tenantId: req.tenantId })
    .sort({ period: -1 })
    .limit(1);

  // Get latest cash flow forecast
  const latestCashFlow = await CashFlowForecast.findOne({ tenantId: req.tenantId })
    .sort({ forecastDate: -1 })
    .limit(1);

  // Get latest financial ratios
  const latestRatios = await FinancialRatio.findOne({ tenantId: req.tenantId })
    .sort({ calculatedAt: -1 })
    .limit(1);

  // Get recent dashboard metrics
  const recentMetrics = await DashboardMetric.find({ tenantId: req.tenantId })
    .sort({ asOf: -1 })
    .limit(5);

  res.status(200).json({
    success: true,
    data: {
      budget: latestBudget,
      cashFlow: latestCashFlow,
      financialRatios: latestRatios,
      recentMetrics
    }
  });
});

/**
 * @desc    Get ITC dashboard by supplier
 * @route   GET /api/v1/cfo/dashboard/itc-by-supplier
 * @access  Private
 */
exports.getItcDashboardBySupplier = asyncHandler(async (req, res) => {
  // Aggregate ITC by supplier from purchase invoices
  const tenantId = req.tenantId;
  const match = { tenantId, itcEligibility: { $ne: 'Ineligible' }, status: { $in: ['Recorded', 'Verified'] } };
  const itcBySupplier = await PurchaseInvoice.aggregate([
    { $match: match },
    { $group: {
      _id: { vendorName: "$vendorName", vendorGstin: "$vendorGstin" },
      totalInvoices: { $sum: 1 },
      totalTaxableValue: { $sum: "$totalTaxableValue" },
      totalCgst: { $sum: "$totalCgstAmount" },
      totalSgst: { $sum: "$totalSgstAmount" },
      totalIgst: { $sum: "$totalIgstAmount" },
      totalCess: { $sum: "$totalCessAmount" },
      totalItc: { $sum: { $add: ["$totalCgstAmount", "$totalSgstAmount", "$totalIgstAmount", "$totalCessAmount"] } }
    } },
    { $sort: { totalItc: -1 } }
  ]);
  res.status(200).json({
    success: true,
    data: itcBySupplier
  });
});

/**
 * @desc    Trigger cash flow forecast generation (quick action)
 * @route   POST /api/v1/cfo/actions/trigger-cash-flow-forecast
 * @access  Private
 */
exports.triggerCashFlowForecast = asyncHandler(async (req, res) => {
  // This is a placeholder for the trigger cash flow forecast action
  // In a real implementation, this would initiate the cash flow forecast generation process
  
  res.status(200).json({
    success: true,
    message: 'Cash flow forecast generation triggered',
    data: {
      jobId: 'forecast-' + Date.now(),
      status: 'initiated',
      estimatedCompletionTime: new Date(Date.now() + 5 * 60 * 1000) // 5 minutes from now
    }
  });
});

/**
 * @desc    Generate investor board deck (quick action)
 * @route   POST /api/v1/cfo/actions/generate-investor-deck
 * @access  Private
 */
exports.generateInvestorDeck = asyncHandler(async (req, res) => {
  // This is a placeholder for the generate investor deck action
  // In a real implementation, this would initiate the investor deck generation process
  
  res.status(200).json({
    success: true,
    message: 'Investor board deck generation initiated',
    data: {
      jobId: 'deck-' + Date.now(),
      status: 'initiated',
      estimatedCompletionTime: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes from now
    }
  });
});

/**
 * @desc    Launch what-if scenario (quick action)
 * @route   POST /api/v1/cfo/actions/launch-what-if-scenario
 * @access  Private
 */
exports.launchWhatIfScenario = asyncHandler(async (req, res) => {
  // This is a placeholder for the launch what-if scenario action
  // In a real implementation, this would initiate the what-if scenario analysis process
  
  res.status(200).json({
    success: true,
    message: 'What-if scenario analysis initiated',
    data: {
      jobId: 'scenario-' + Date.now(),
      status: 'initiated',
      estimatedCompletionTime: new Date(Date.now() + 15 * 60 * 1000) // 15 minutes from now
    }
  });
});