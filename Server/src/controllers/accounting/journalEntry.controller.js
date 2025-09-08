/**
 * Journal Entry Controller
 * Handles API requests for Journal Entry operations
 */

const JournalEntry = require('../../models/accounting/journalEntry.model');
const Account = require('../../models/accounting/account.model');
const { asyncHandler, AppError } = require('../../utils/appError');

/**
 * @desc    Create a new journal entry
 * @route   POST /api/v1/accounting/journal-entries
 * @access  Private (Requires authentication and authorization)
 */
exports.createJournalEntry = asyncHandler(async (req, res) => {
  // Add tenant ID and created by from authenticated user
  req.body.tenantId = req.user.tenantId;
  req.body.createdBy = req.user._id;
  
  // Validate that debits equal credits
  const totalDebit = req.body.entries.reduce((sum, entry) => sum + (entry.debit || 0), 0);
  const totalCredit = req.body.entries.reduce((sum, entry) => sum + (entry.credit || 0), 0);
  
  if (Math.abs(totalDebit - totalCredit) > 0.001) {
    return res.status(400).json({
      success: false,
      error: 'Total debits must equal total credits'
    });
  }
  
  // Create the journal entry
  const journalEntry = await JournalEntry.create(req.body);
  
  res.status(201).json({
    success: true,
    data: journalEntry
  });
});

/**
 * @desc    Get all journal entries
 * @route   GET /api/v1/accounting/journal-entries
 * @access  Private (Requires authentication and authorization)
 */
exports.getJournalEntries = asyncHandler(async (req, res) => {
  // Filter by tenant ID from authenticated user
  const filter = { tenantId: req.user.tenantId };
  
  // Add additional filters if provided
  if (req.query.status) filter.status = req.query.status;
  if (req.query.entryDate) {
    const startDate = new Date(req.query.entryDate);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(req.query.entryDate);
    endDate.setHours(23, 59, 59, 999);
    
    filter.entryDate = { $gte: startDate, $lte: endDate };
  }
  if (req.query.startDate && req.query.endDate) {
    const startDate = new Date(req.query.startDate);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(req.query.endDate);
    endDate.setHours(23, 59, 59, 999);
    
    filter.entryDate = { $gte: startDate, $lte: endDate };
  }
  if (req.query.account) {
    filter['entries.account'] = req.query.account;
  }
  if (req.query.costCenter) {
    filter['entries.costCenter'] = req.query.costCenter;
  }
  if (req.query.reference) {
    filter.reference = { $regex: req.query.reference, $options: 'i' };
  }
  
  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 25;
  const startIndex = (page - 1) * limit;
  
  // Find journal entries with filters
  const journalEntries = await JournalEntry.find(filter)
    .populate('entries.account', 'name code')
    .populate('entries.costCenter', 'name')
    .populate('createdBy', 'name')
    .populate('approvedBy', 'name')
    .sort({ entryDate: -1, createdAt: -1 })
    .skip(startIndex)
    .limit(limit);
  
  // Get total count for pagination
  const total = await JournalEntry.countDocuments(filter);
  
  res.status(200).json({
    success: true,
    count: journalEntries.length,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    },
    data: journalEntries
  });
});

/**
 * @desc    Get journal entry by ID
 * @route   GET /api/v1/accounting/journal-entries/:id
 * @access  Private (Requires authentication and authorization)
 */
exports.getJournalEntryById = asyncHandler(async (req, res) => {
  const journalEntry = await JournalEntry.findOne({
    _id: req.params.id,
    tenantId: req.user.tenantId
  })
    .populate('entries.account', 'name code')
    .populate('entries.costCenter', 'name')
    .populate('createdBy', 'name')
    .populate('approvedBy', 'name')
    .populate('attachments');
  
  if (!journalEntry) {
    return res.status(404).json({
      success: false,
      error: 'Journal entry not found'
    });
  }
  
  res.status(200).json({
    success: true,
    data: journalEntry
  });
});

/**
 * @desc    Update journal entry
 * @route   PUT /api/v1/accounting/journal-entries/:id
 * @access  Private (Requires authentication and authorization)
 */
exports.updateJournalEntry = asyncHandler(async (req, res) => {
  // Find the journal entry
  const journalEntry = await JournalEntry.findOne({
    _id: req.params.id,
    tenantId: req.user.tenantId
  });
  
  if (!journalEntry) {
    return res.status(404).json({
      success: false,
      error: 'Journal entry not found'
    });
  }
  
  // Check if journal entry can be updated
  if (journalEntry.status !== 'Draft') {
    return res.status(400).json({
      success: false,
      error: 'Only draft journal entries can be updated'
    });
  }
  
  // Validate that debits equal credits if entries are provided
  if (req.body.entries) {
    const totalDebit = req.body.entries.reduce((sum, entry) => sum + (entry.debit || 0), 0);
    const totalCredit = req.body.entries.reduce((sum, entry) => sum + (entry.credit || 0), 0);
    
    if (Math.abs(totalDebit - totalCredit) > 0.001) {
      return res.status(400).json({
        success: false,
        error: 'Total debits must equal total credits'
      });
    }
  }
  
  // Update the journal entry
  const updatedJournalEntry = await JournalEntry.findOneAndUpdate(
    { _id: req.params.id, tenantId: req.user.tenantId },
    req.body,
    { new: true, runValidators: true }
  )
    .populate('entries.account', 'name code')
    .populate('entries.costCenter', 'name')
    .populate('createdBy', 'name')
    .populate('approvedBy', 'name');
  
  res.status(200).json({
    success: true,
    data: updatedJournalEntry
  });
});

/**
 * @desc    Delete journal entry
 * @route   DELETE /api/v1/accounting/journal-entries/:id
 * @access  Private (Requires authentication and authorization)
 */
exports.deleteJournalEntry = asyncHandler(async (req, res) => {
  // Find the journal entry
  const journalEntry = await JournalEntry.findOne({
    _id: req.params.id,
    tenantId: req.user.tenantId
  });
  
  if (!journalEntry) {
    return res.status(404).json({
      success: false,
      error: 'Journal entry not found'
    });
  }
  
  // Check if journal entry can be deleted
  if (journalEntry.status !== 'Draft') {
    return res.status(400).json({
      success: false,
      error: 'Only draft journal entries can be deleted'
    });
  }
  
  // Delete the journal entry
  await journalEntry.remove();
  
  res.status(200).json({
    success: true,
    data: {}
  });
});

/**
 * @desc    Approve journal entry
 * @route   PATCH /api/v1/accounting/journal-entries/:id/approve
 * @access  Private (Requires authentication and authorization)
 */
exports.approveJournalEntry = asyncHandler(async (req, res) => {
  // Find the journal entry
  const journalEntry = await JournalEntry.findOne({
    _id: req.params.id,
    tenantId: req.user.tenantId
  });
  
  if (!journalEntry) {
    return res.status(404).json({
      success: false,
      error: 'Journal entry not found'
    });
  }
  
  // Check if journal entry can be approved
  if (journalEntry.status !== 'Draft') {
    return res.status(400).json({
      success: false,
      error: 'Only draft journal entries can be approved'
    });
  }
  
  // Update status and approver
  journalEntry.status = 'Approved';
  journalEntry.approvedBy = req.user._id;
  journalEntry.approvedAt = Date.now();
  
  await journalEntry.save();
  
  // Populate references
  await journalEntry
    .populate('entries.account', 'name code')
    .populate('entries.costCenter', 'name')
    .populate('createdBy', 'name')
    .populate('approvedBy', 'name')
    .execPopulate();
  
  res.status(200).json({
    success: true,
    data: journalEntry
  });
});

/**
 * @desc    Get general ledger report
 * @route   GET /api/v1/accounting/reports/general-ledger
 * @access  Private (Requires authentication and authorization)
 */
exports.getGeneralLedger = asyncHandler(async (req, res) => {
  // Validate required parameters
  if (!req.query.startDate || !req.query.endDate) {
    return res.status(400).json({
      success: false,
      error: 'Start date and end date are required'
    });
  }
  
  const startDate = new Date(req.query.startDate);
  startDate.setHours(0, 0, 0, 0);
  
  const endDate = new Date(req.query.endDate);
  endDate.setHours(23, 59, 59, 999);
  
  // Filter by tenant ID and date range
  const filter = {
    tenantId: req.user.tenantId,
    status: 'Approved',
    entryDate: { $gte: startDate, $lte: endDate }
  };
  
  // Add account filter if provided
  if (req.query.account) {
    filter['entries.account'] = req.query.account;
  }
  
  // Find approved journal entries within date range
  const journalEntries = await JournalEntry.find(filter)
    .populate('entries.account', 'name code type')
    .populate('entries.costCenter', 'name')
    .sort({ entryDate: 1, createdAt: 1 });
  
  // Process entries for general ledger format
  const ledgerEntries = [];
  
  journalEntries.forEach(entry => {
    entry.entries.forEach(line => {
      ledgerEntries.push({
        entryDate: entry.entryDate,
        journalEntryId: entry._id,
        reference: entry.reference,
        account: line.account,
        description: line.description || entry.description,
        debit: line.debit || 0,
        credit: line.credit || 0,
        costCenter: line.costCenter
      });
    });
  });
  
  res.status(200).json({
    success: true,
    count: ledgerEntries.length,
    data: ledgerEntries
  });
});

/**
 * @desc    Get trial balance report
 * @route   GET /api/v1/accounting/reports/trial-balance
 * @access  Private (Requires authentication and authorization)
 */
exports.getTrialBalance = asyncHandler(async (req, res) => {
  // Validate required parameters
  if (!req.query.asOfDate) {
    return res.status(400).json({
      success: false,
      error: 'As of date is required'
    });
  }
  
  const asOfDate = new Date(req.query.asOfDate);
  asOfDate.setHours(23, 59, 59, 999);
  
  // Filter by tenant ID and date
  const filter = {
    tenantId: req.user.tenantId,
    status: 'Approved',
    entryDate: { $lte: asOfDate }
  };
  
  // Find all approved journal entries up to the specified date
  const journalEntries = await JournalEntry.find(filter)
    .populate('entries.account', 'name code type')
    .select('entries');
  
  // Get all accounts
  const accounts = await Account.find({ tenantId: req.user.tenantId })
    .sort({ code: 1 });
  
  // Calculate account balances
  const accountBalances = {};
  
  // Initialize account balances
  accounts.forEach(account => {
    accountBalances[account._id] = {
      _id: account._id,
      code: account.code,
      name: account.name,
      type: account.type,
      debitTotal: 0,
      creditTotal: 0,
      balance: 0
    };
  });
  
  // Calculate totals from journal entries
  journalEntries.forEach(entry => {
    entry.entries.forEach(line => {
      const accountId = line.account._id || line.account;
      
      if (accountBalances[accountId]) {
        accountBalances[accountId].debitTotal += line.debit || 0;
        accountBalances[accountId].creditTotal += line.credit || 0;
      }
    });
  });
  
  // Calculate final balances
  Object.values(accountBalances).forEach(account => {
    // For asset and expense accounts, debit increases the balance
    if (account.type === 'Asset' || account.type === 'Expense') {
      account.balance = account.debitTotal - account.creditTotal;
    }
    // For liability, equity, and revenue accounts, credit increases the balance
    else {
      account.balance = account.creditTotal - account.debitTotal;
    }
  });
  
  // Convert to array and filter out accounts with zero balance if requested
  let trialBalanceData = Object.values(accountBalances);
  
  if (req.query.excludeZeroBalances === 'true') {
    trialBalanceData = trialBalanceData.filter(account => account.balance !== 0);
  }
  
  // Calculate totals
  const totals = {
    debitTotal: trialBalanceData.reduce((sum, account) => sum + account.debitTotal, 0),
    creditTotal: trialBalanceData.reduce((sum, account) => sum + account.creditTotal, 0),
    netBalance: trialBalanceData.reduce((sum, account) => sum + account.balance, 0)
  };
  
  res.status(200).json({
    success: true,
    count: trialBalanceData.length,
    asOfDate,
    totals,
    data: trialBalanceData
  });
});

/**
 * @desc    Post journal entry (set status to 'Posted' if currently 'Approved')
 */
exports.postJournalEntry = asyncHandler(async (req, res) => {
  const journalEntry = await JournalEntry.findOne({
    _id: req.params.id,
    tenantId: req.user.tenantId
  });
  if (!journalEntry) {
    return res.status(404).json({ success: false, message: 'Journal entry not found.' });
  }
  if (journalEntry.status !== 'Approved') {
    return res.status(400).json({ success: false, message: 'Only approved journal entries can be posted.' });
  }
  journalEntry.status = 'Posted';
  await journalEntry.save();
  res.status(200).json({ success: true, data: journalEntry });
});

/**
 * @desc    Unpost journal entry (set status to 'Approved' if currently 'Posted')
 */
exports.unpostJournalEntry = asyncHandler(async (req, res) => {
  const journalEntry = await JournalEntry.findOne({
    _id: req.params.id,
    tenantId: req.user.tenantId
  });
  if (!journalEntry) {
    return res.status(404).json({ success: false, message: 'Journal entry not found.' });
  }
  if (journalEntry.status !== 'Posted') {
    return res.status(400).json({ success: false, message: 'Only posted journal entries can be unposted.' });
  }
  journalEntry.status = 'Approved';
  await journalEntry.save();
  res.status(200).json({ success: true, data: journalEntry });
});

/**
 * @desc    Submit journal entry for approval (set status to 'Pending Approval' if currently 'Draft')
 */
exports.submitForApproval = asyncHandler(async (req, res) => {
  const journalEntry = await JournalEntry.findOne({
    _id: req.params.id,
    tenantId: req.user.tenantId
  });
  if (!journalEntry) {
    return res.status(404).json({ success: false, message: 'Journal entry not found.' });
  }
  if (journalEntry.status !== 'Draft') {
    return res.status(400).json({ success: false, message: 'Only draft journal entries can be submitted for approval.' });
  }
  journalEntry.status = 'Pending Approval';
  await journalEntry.save();
  res.status(200).json({ success: true, data: journalEntry });
});

/**
 * @desc    Reject journal entry (set status to 'Rejected' and save reason)
 */
exports.rejectJournalEntry = asyncHandler(async (req, res) => {
  const journalEntry = await JournalEntry.findOne({
    _id: req.params.id,
    tenantId: req.user.tenantId
  });
  if (!journalEntry) {
    return res.status(404).json({ success: false, message: 'Journal entry not found.' });
  }
  if (journalEntry.status !== 'Pending Approval') {
    return res.status(400).json({ success: false, message: 'Only pending approval journal entries can be rejected.' });
  }
  journalEntry.status = 'Rejected';
  journalEntry.rejectionReason = req.body.reason || 'No reason provided';
  await journalEntry.save();
  res.status(200).json({ success: true, data: journalEntry });
});