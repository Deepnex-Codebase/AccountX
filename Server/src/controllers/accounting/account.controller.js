/**
 * Account Controller
 * Handles API requests for Account operations
 */

const Account = require('../../models/accounting/account.model');
const { asyncHandler } = require('../../utils/appError');

/**
 * @desc    Create a new account
 * @route   POST /api/v1/accounting/accounts
 * @access  Private (Requires authentication and authorization)
 */
exports.createAccount = asyncHandler(async (req, res) => {
  // Add tenant ID from authenticated user
  req.body.tenantId = req.user.tenantId;
  
  // Create the account
  const account = await Account.create(req.body);
  
  res.status(201).json({
    success: true,
    data: account
  });
});

/**
 * @desc    Get all accounts
 * @route   GET /api/v1/accounting/accounts
 * @access  Private (Requires authentication and authorization)
 */
exports.getAccounts = asyncHandler(async (req, res) => {
  // Filter by tenant ID from authenticated user
  const filter = { tenantId: req.user.tenantId };
  
  // Add additional filters if provided
  if (req.query.type) filter.type = req.query.type;
  if (req.query.isArchived) filter.isArchived = req.query.isArchived === 'true';
  if (req.query.parentAccount) filter.parentAccount = req.query.parentAccount;
  
  // Find accounts with filters
  const accounts = await Account.find(filter)
    .populate('parentAccount', 'name code')
    .sort({ code: 1 });
  
  res.status(200).json({
    success: true,
    count: accounts.length,
    data: accounts
  });
});

/**
 * @desc    Get account by ID
 * @route   GET /api/v1/accounting/accounts/:id
 * @access  Private (Requires authentication and authorization)
 */
exports.getAccountById = asyncHandler(async (req, res) => {
  const account = await Account.findOne({
    _id: req.params.id,
    tenantId: req.user.tenantId
  }).populate('parentAccount', 'name code');
  
  if (!account) {
    return res.status(404).json({
      success: false,
      error: 'Account not found'
    });
  }
  
  res.status(200).json({
    success: true,
    data: account
  });
});

/**
 * @desc    Update account
 * @route   PUT /api/v1/accounting/accounts/:id
 * @access  Private (Requires authentication and authorization)
 */
exports.updateAccount = asyncHandler(async (req, res) => {
  // Find and update the account
  const account = await Account.findOneAndUpdate(
    { _id: req.params.id, tenantId: req.user.tenantId },
    req.body,
    { new: true, runValidators: true }
  );
  
  if (!account) {
    return res.status(404).json({
      success: false,
      error: 'Account not found'
    });
  }
  
  res.status(200).json({
    success: true,
    data: account
  });
});

/**
 * @desc    Delete account
 * @route   DELETE /api/v1/accounting/accounts/:id
 * @access  Private (Requires authentication and authorization)
 */
exports.deleteAccount = asyncHandler(async (req, res) => {
  // Check if account has child accounts
  const childAccounts = await Account.countDocuments({
    parentAccount: req.params.id,
    tenantId: req.user.tenantId
  });
  
  if (childAccounts > 0) {
    return res.status(400).json({
      success: false,
      error: 'Cannot delete account with child accounts. Archive it instead.'
    });
  }
  
  // TODO: Check if account is used in transactions
  // If it is, prevent deletion and suggest archiving instead
  
  // Delete the account
  const account = await Account.findOneAndDelete({
    _id: req.params.id,
    tenantId: req.user.tenantId
  });
  
  if (!account) {
    return res.status(404).json({
      success: false,
      error: 'Account not found'
    });
  }
  
  res.status(200).json({
    success: true,
    data: {}
  });
});

/**
 * @desc    Archive/Unarchive account
 * @route   PATCH /api/v1/accounting/accounts/:id/archive
 * @access  Private (Requires authentication and authorization)
 */
exports.toggleArchiveAccount = asyncHandler(async (req, res) => {
  // Find the account
  const account = await Account.findOne({
    _id: req.params.id,
    tenantId: req.user.tenantId
  });
  
  if (!account) {
    return res.status(404).json({
      success: false,
      error: 'Account not found'
    });
  }
  
  // Toggle archive status
  account.isArchived = !account.isArchived;
  await account.save();
  
  res.status(200).json({
    success: true,
    data: account
  });
});

/**
 * @desc    Get account hierarchy (chart of accounts)
 * @route   GET /api/v1/accounting/accounts/hierarchy
 * @access  Private (Requires authentication and authorization)
 */
exports.getAccountHierarchy = asyncHandler(async (req, res) => {
  // Get all accounts for the tenant
  const accounts = await Account.find({ tenantId: req.user.tenantId })
    .sort({ code: 1 });
  
  // Build hierarchy
  const accountMap = {};
  const rootAccounts = [];
  
  // First pass: create a map of all accounts
  accounts.forEach(account => {
    accountMap[account._id] = {
      _id: account._id,
      name: account.name,
      code: account.code,
      type: account.type,
      description: account.description,
      isArchived: account.isArchived,
      children: []
    };
  });
  
  // Second pass: build the hierarchy
  accounts.forEach(account => {
    if (account.parentAccount && accountMap[account.parentAccount]) {
      // Add to parent's children
      accountMap[account.parentAccount].children.push(accountMap[account._id]);
    } else {
      // Root account
      rootAccounts.push(accountMap[account._id]);
    }
  });
  
  res.status(200).json({
    success: true,
    data: rootAccounts
  });
});

/**
 * @desc    Bulk upload accounts (placeholder)
 * @route   POST /api/v1/accounting/accounts/bulk-upload
 * @access  Private (Requires authentication and authorization)
 */
exports.bulkUploadAccounts = (req, res) => {
  res.status(501).json({ success: false, message: 'Bulk upload not implemented yet.' });
};