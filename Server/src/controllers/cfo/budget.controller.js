/**
 * Budget Controller
 * Handles API requests for budget management operations
 */

const Budget = require('../../models/cfo/budget.model');
const Account = require('../../models/accounting/account.model');
const CostCenter = require('../../models/accounting/costCenter.model');
const JournalEntry = require('../../models/accounting/journalEntry.model');
const { asyncHandler, AppError } = require('../../utils/appError');

/**
 * @desc    Create a new budget
 * @route   POST /api/v1/cfo/budgets
 * @access  Private (Requires authentication and authorization)
 */
exports.createBudget = asyncHandler(async (req, res) => {
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
  
  // Check if budget already exists for the given fiscal year and type
  const existingBudget = await Budget.findOne({
    tenantId: req.user.tenantId,
    fiscalYear: req.body.fiscalYear,
    type: req.body.type
  });
  
  if (existingBudget) {
    return res.status(400).json({
      success: false,
      error: `A ${req.body.type} budget already exists for fiscal year ${req.body.fiscalYear}`
    });
  }
  
  // Validate budget line items
  if (req.body.lineItems && req.body.lineItems.length > 0) {
    // Check if accounts exist
    const accountIds = req.body.lineItems.map(item => item.accountId);
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
    
    // Check if cost centers exist (if provided)
    const costCenterIds = req.body.lineItems
      .filter(item => item.costCenterId)
      .map(item => item.costCenterId);
    
    if (costCenterIds.length > 0) {
      const costCenters = await CostCenter.find({
        _id: { $in: costCenterIds },
        tenantId: req.user.tenantId
      });
      
      if (costCenters.length !== costCenterIds.length) {
        return res.status(400).json({
          success: false,
          error: 'One or more cost center IDs are invalid'
        });
      }
    }
  }
  
  // Create the budget
  const budget = await Budget.create(req.body);
  
  res.status(201).json({
    success: true,
    data: budget
  });
});

/**
 * @desc    Get all budgets
 * @route   GET /api/v1/cfo/budgets
 * @access  Private (Requires authentication and authorization)
 */
exports.getBudgets = asyncHandler(async (req, res) => {
  // Filter by tenant ID from authenticated user
  const filter = { tenantId: req.user.tenantId };
  
  // Add additional filters if provided
  if (req.query.fiscalYear) {
    filter.fiscalYear = req.query.fiscalYear;
  }
  if (req.query.type) {
    filter.type = req.query.type;
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
  
  // Find budgets with filters and pagination
  const budgets = await Budget.find(filter)
    .populate('createdBy', 'name email')
    .populate('approvedBy', 'name email')
    .sort({ fiscalYear: -1, version: -1 })
    .skip(skip)
    .limit(limit);
  
  // Get total count for pagination
  const total = await Budget.countDocuments(filter);
  
  res.status(200).json({
    success: true,
    count: budgets.length,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    },
    data: budgets
  });
});

/**
 * @desc    Get budget by ID
 * @route   GET /api/v1/cfo/budgets/:id
 * @access  Private (Requires authentication and authorization)
 */
exports.getBudgetById = asyncHandler(async (req, res) => {
  const budget = await Budget.findOne({
    _id: req.params.id,
    tenantId: req.user.tenantId
  })
    .populate('lineItems.accountId', 'name code type')
    .populate('lineItems.costCenterId', 'name code')
    .populate('createdBy', 'name email')
    .populate('approvedBy', 'name email')
    .populate('attachments');
  
  if (!budget) {
    return res.status(404).json({
      success: false,
      error: 'Budget not found'
    });
  }
  
  res.status(200).json({
    success: true,
    data: budget
  });
});

/**
 * @desc    Update budget
 * @route   PUT /api/v1/cfo/budgets/:id
 * @access  Private (Requires authentication and authorization)
 */
exports.updateBudget = asyncHandler(async (req, res) => {
  // Find the budget first to check if it's already approved
  const existingBudget = await Budget.findOne({
    _id: req.params.id,
    tenantId: req.user.tenantId
  });
  
  if (!existingBudget) {
    return res.status(404).json({
      success: false,
      error: 'Budget not found'
    });
  }
  
  // Check if budget is already approved
  if (existingBudget.status === 'Approved') {
    return res.status(400).json({
      success: false,
      error: 'Cannot update an approved budget. Create a new version instead.'
    });
  }
  
  // Validate budget line items if provided
  if (req.body.lineItems && req.body.lineItems.length > 0) {
    // Check if accounts exist
    const accountIds = req.body.lineItems.map(item => item.accountId);
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
    
    // Check if cost centers exist (if provided)
    const costCenterIds = req.body.lineItems
      .filter(item => item.costCenterId)
      .map(item => item.costCenterId);
    
    if (costCenterIds.length > 0) {
      const costCenters = await CostCenter.find({
        _id: { $in: costCenterIds },
        tenantId: req.user.tenantId
      });
      
      if (costCenters.length !== costCenterIds.length) {
        return res.status(400).json({
          success: false,
          error: 'One or more cost center IDs are invalid'
        });
      }
    }
  }
  
  // Update the budget
  req.body.updatedBy = req.user._id;
  const budget = await Budget.findOneAndUpdate(
    { _id: req.params.id, tenantId: req.user.tenantId },
    req.body,
    { new: true, runValidators: true }
  );
  
  res.status(200).json({
    success: true,
    data: budget
  });
});

/**
 * @desc    Delete budget
 * @route   DELETE /api/v1/cfo/budgets/:id
 * @access  Private (Requires authentication and authorization)
 */
exports.deleteBudget = asyncHandler(async (req, res) => {
  // Find the budget first to check if it's already approved
  const existingBudget = await Budget.findOne({
    _id: req.params.id,
    tenantId: req.user.tenantId
  });
  
  if (!existingBudget) {
    return res.status(404).json({
      success: false,
      error: 'Budget not found'
    });
  }
  
  // Check if budget is already approved
  if (existingBudget.status === 'Approved') {
    return res.status(400).json({
      success: false,
      error: 'Cannot delete an approved budget'
    });
  }
  
  // Delete the budget
  await Budget.findOneAndDelete({
    _id: req.params.id,
    tenantId: req.user.tenantId
  });
  
  res.status(200).json({
    success: true,
    data: {}
  });
});

/**
 * @desc    Approve budget
 * @route   PATCH /api/v1/cfo/budgets/:id/approve
 * @access  Private (Requires authentication and authorization with approval rights)
 */
exports.approveBudget = asyncHandler(async (req, res) => {
  // Find the budget first to check if it's already approved
  const existingBudget = await Budget.findOne({
    _id: req.params.id,
    tenantId: req.user.tenantId
  });
  
  if (!existingBudget) {
    return res.status(404).json({
      success: false,
      error: 'Budget not found'
    });
  }
  
  // Check if budget is already approved
  if (existingBudget.status === 'Approved') {
    return res.status(400).json({
      success: false,
      error: 'Budget is already approved'
    });
  }
  
  // Update the budget status to approved
  const budget = await Budget.findOneAndUpdate(
    { _id: req.params.id, tenantId: req.user.tenantId },
    {
      status: 'Approved',
      approvedBy: req.user._id,
      approvedAt: new Date(),
      updatedBy: req.user._id
    },
    { new: true }
  );
  
  res.status(200).json({
    success: true,
    data: budget
  });
});

/**
 * @desc    Create a new version of an existing budget
 * @route   POST /api/v1/cfo/budgets/:id/versions
 * @access  Private (Requires authentication and authorization)
 */
exports.createBudgetVersion = asyncHandler(async (req, res) => {
  // Find the original budget
  const originalBudget = await Budget.findOne({
    _id: req.params.id,
    tenantId: req.user.tenantId
  });
  
  if (!originalBudget) {
    return res.status(404).json({
      success: false,
      error: 'Budget not found'
    });
  }
  
  // Check if the original budget is approved
  if (originalBudget.status !== 'Approved') {
    return res.status(400).json({
      success: false,
      error: 'Only approved budgets can have new versions'
    });
  }
  
  // Get the highest version number for this fiscal year and type
  const highestVersion = await Budget.findOne({
    tenantId: req.user.tenantId,
    fiscalYear: originalBudget.fiscalYear,
    type: originalBudget.type
  }).sort({ version: -1 });
  
  // Create a new budget with incremented version number
  const newBudgetData = {
    tenantId: req.user.tenantId,
    fiscalYear: originalBudget.fiscalYear,
    type: originalBudget.type,
    version: highestVersion.version + 1,
    status: 'Draft',
    lineItems: req.body.lineItems || originalBudget.lineItems,
    notes: req.body.notes || originalBudget.notes,
    createdBy: req.user._id,
    previousVersionId: originalBudget._id
  };
  
  const newBudget = await Budget.create(newBudgetData);
  
  res.status(201).json({
    success: true,
    data: newBudget
  });
});

/**
 * @desc    Get budget vs actual comparison
 * @route   GET /api/v1/cfo/budgets/:id/comparison
 * @access  Private (Requires authentication and authorization)
 */
exports.getBudgetComparison = asyncHandler(async (req, res) => {
  // Find the budget
  const budget = await Budget.findOne({
    _id: req.params.id,
    tenantId: req.user.tenantId
  }).populate('lineItems.accountId', 'name code type');

  if (!budget) {
    return res.status(404).json({
      success: false,
      error: 'Budget not found'
    });
  }

  // Get fiscal year start and end
  const [startYear, endYearShort] = budget.fiscalYear.split('-');
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
      // For expense accounts, debits are actuals; for income, credits
      if (line.debit > 0) actualsByAccount[accId] += line.debit;
      if (line.credit > 0) actualsByAccount[accId] -= line.credit;
    });
  });

  // Build comparison data
  let totalBudgeted = 0;
  let totalActual = 0;
  const lineItems = budget.lineItems.map(item => {
    const accId = item.accountId._id.toString();
    const actual = actualsByAccount[accId] || 0;
    totalBudgeted += item.annualAmount;
    totalActual += actual;
    const variance = actual - item.annualAmount;
    const variancePercentage = item.annualAmount !== 0 ? (variance / item.annualAmount) * 100 : 0;
    return {
      accountId: accId,
      accountName: item.accountId.name,
      accountCode: item.accountId.code,
      costCenterId: item.costCenterId,
      annualBudget: item.annualAmount,
      actualToDate: actual,
      variance,
      variancePercentage,
      monthlyBudget: item.monthlyDistribution,
      monthlyActual: Array(12).fill(0), // For simplicity, not splitting by month here
      monthlyVariance: item.monthlyDistribution.map(amount => -amount)
    };
  });
  const comparisonData = {
    budgetId: budget._id,
    fiscalYear: budget.fiscalYear,
    type: budget.type,
    version: budget.version,
    totalBudgeted,
    totalActual,
    variance: totalActual - totalBudgeted,
    variancePercentage: totalBudgeted !== 0 ? ((totalActual - totalBudgeted) / totalBudgeted) * 100 : 0,
    lineItems
  };
  res.status(200).json({
    success: true,
    data: comparisonData
  });
});

/**
 * @desc    Get budget statistics
 * @route   GET /api/v1/cfo/budgets/statistics
 * @access  Private (Requires authentication and authorization)
 */
exports.getBudgetStatistics = asyncHandler(async (req, res) => {
  // Get fiscal year from query params or default to current fiscal year
  const today = new Date();
  const currentMonth = today.getMonth() + 1;
  const currentYear = today.getFullYear();
  const defaultFY = currentMonth >= 4 
    ? `${currentYear}-${(currentYear + 1).toString().substr(2, 2)}` 
    : `${currentYear - 1}-${currentYear.toString().substr(2, 2)}`;
  
  const fiscalYear = req.query.fiscalYear || defaultFY;
  
  // Aggregate statistics
  const statistics = await Budget.aggregate([
    {
      $match: {
        tenantId: req.user.tenantId,
        fiscalYear: fiscalYear
      }
    },
    {
      $group: {
        _id: {
          type: '$type',
          status: '$status'
        },
        count: { $sum: 1 },
        totalAmount: { $sum: '$totalAmount' }
      }
    }
  ]);
  
  // Format response
  const result = {
    fiscalYear,
    totalBudgets: 0,
    draftBudgets: 0,
    approvedBudgets: 0,
    operatingBudgets: {
      total: 0,
      draft: 0,
      approved: 0,
      amount: 0
    },
    capitalBudgets: {
      total: 0,
      draft: 0,
      approved: 0,
      amount: 0
    }
  };
  
  statistics.forEach(stat => {
    const type = stat._id.type;
    const status = stat._id.status;
    
    result.totalBudgets += stat.count;
    
    if (status === 'Draft') {
      result.draftBudgets += stat.count;
    } else if (status === 'Approved') {
      result.approvedBudgets += stat.count;
    }
    
    if (type === 'Operating') {
      result.operatingBudgets.total += stat.count;
      result.operatingBudgets.amount += stat.totalAmount || 0;
      
      if (status === 'Draft') {
        result.operatingBudgets.draft += stat.count;
      } else if (status === 'Approved') {
        result.operatingBudgets.approved += stat.count;
      }
    } else if (type === 'Capital') {
      result.capitalBudgets.total += stat.count;
      result.capitalBudgets.amount += stat.totalAmount || 0;
      
      if (status === 'Draft') {
        result.capitalBudgets.draft += stat.count;
      } else if (status === 'Approved') {
        result.capitalBudgets.approved += stat.count;
      }
    }
  });
  
  res.status(200).json({
    success: true,
    data: result
  });
});