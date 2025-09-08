/**
 * Purchase Invoice Controller
 * Handles API requests for Purchase Invoice operations with GST compliance
 */

const PurchaseInvoice = require('../../models/gst/purchaseInvoice.model');
const GSTRegistration = require('../../models/gst/gstRegistration.model');
const JournalEntry = require('../../models/accounting/journalEntry.model');
const { asyncHandler, AppError } = require('../../utils/appError');

/**
 * @desc    Create a new purchase invoice
 * @route   POST /api/v1/gst/purchase-invoices
 * @access  Private (Requires authentication and authorization)
 */
exports.createPurchaseInvoice = asyncHandler(async (req, res) => {
  // Add tenant ID from authenticated user
  req.body.tenantId = req.user.tenantId;
  req.body.createdBy = req.user._id;
  
  // Validate GSTIN if provided
  if (req.body.vendorGstin) {
    // Check if the GSTIN format is valid
    const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    if (!gstinRegex.test(req.body.vendorGstin)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid GSTIN format'
      });
    }
  }
  
  // Create the purchase invoice
  const purchaseInvoice = await PurchaseInvoice.create(req.body);
  
  // TODO: Create corresponding journal entry if autoCreateJournalEntry is true
  
  res.status(201).json({
    success: true,
    data: purchaseInvoice
  });
});

/**
 * @desc    Get purchase invoice statistics
 * @route   GET /api/v1/gst/purchase-invoices/statistics
 * @access  Private (Requires authentication and authorization)
 */
exports.getPurchaseInvoiceStatistics = asyncHandler(async (req, res) => {
  // Filter by tenant ID from authenticated user
  const filter = { tenantId: req.user.tenantId };
  
  // Add date range filter if provided
  if (req.query.startDate && req.query.endDate) {
    filter.invoiceDate = {
      $gte: new Date(req.query.startDate),
      $lte: new Date(req.query.endDate)
    };
  }
  
  // Get total count
  const totalCount = await PurchaseInvoice.countDocuments(filter);
  
  // Get total invoice value
  const totalValueResult = await PurchaseInvoice.aggregate([
    { $match: filter },
    { $group: {
      _id: null,
      totalValue: { $sum: "$totalInvoiceValue" },
      totalTaxableValue: { $sum: "$totalTaxableValue" },
      totalCgstAmount: { $sum: "$totalCgstAmount" },
      totalSgstAmount: { $sum: "$totalSgstAmount" },
      totalIgstAmount: { $sum: "$totalIgstAmount" }
    }}
  ]);
  
  // Get count by status
  const statusCounts = await PurchaseInvoice.aggregate([
    { $match: filter },
    { $group: {
      _id: "$status",
      count: { $sum: 1 }
    }}
  ]);
  
  // Get count by month (for the last 6 months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  
  const monthlyStats = await PurchaseInvoice.aggregate([
    { 
      $match: { 
        ...filter,
        invoiceDate: { $gte: sixMonthsAgo }
      } 
    },
    {
      $group: {
        _id: { 
          year: { $year: "$invoiceDate" },
          month: { $month: "$invoiceDate" }
        },
        count: { $sum: 1 },
        totalValue: { $sum: "$totalInvoiceValue" }
      }
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } }
  ]);
  
  // Get ITC eligibility statistics
  const itcStats = await PurchaseInvoice.aggregate([
    { $match: filter },
    { $group: {
      _id: "$itcEligibility",
      count: { $sum: 1 },
      totalValue: { $sum: "$totalInvoiceValue" }
    }}
  ]);
  
  res.status(200).json({
    success: true,
    data: {
      totalCount,
      totalValue: totalValueResult.length > 0 ? totalValueResult[0] : {
        totalValue: 0,
        totalTaxableValue: 0,
        totalCgstAmount: 0,
        totalSgstAmount: 0,
        totalIgstAmount: 0
      },
      statusCounts,
      monthlyStats,
      itcStats
    }
  });
});

/**
 * @desc    Get all purchase invoices
 * @route   GET /api/v1/gst/purchase-invoices
 * @access  Private (Requires authentication and authorization)
 */
exports.getPurchaseInvoices = asyncHandler(async (req, res) => {
  // Filter by tenant ID from authenticated user
  const filter = { tenantId: req.user.tenantId };
  
  // Add additional filters if provided
  if (req.query.vendorName) {
    filter.vendorName = { $regex: req.query.vendorName, $options: 'i' };
  }
  if (req.query.invoiceNumber) {
    filter.invoiceNumber = { $regex: req.query.invoiceNumber, $options: 'i' };
  }
  if (req.query.gstRegistrationId) {
    filter.gstRegistrationId = req.query.gstRegistrationId;
  }
  if (req.query.fromDate && req.query.toDate) {
    filter.invoiceDate = {
      $gte: new Date(req.query.fromDate),
      $lte: new Date(req.query.toDate)
    };
  }
  if (req.query.minAmount && req.query.maxAmount) {
    filter.totalAmount = {
      $gte: parseFloat(req.query.minAmount),
      $lte: parseFloat(req.query.maxAmount)
    };
  }
  if (req.query.paymentStatus) {
    filter.paymentStatus = req.query.paymentStatus;
  }
  if (req.query.itcEligibility) {
    filter.itcEligibility = req.query.itcEligibility;
  }
  if (req.query.reportedInGSTR) {
    filter.reportedInGSTR2 = req.query.reportedInGSTR === 'true';
  }
  
  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;
  
  // Find purchase invoices with filters and pagination
  const purchaseInvoices = await PurchaseInvoice.find(filter)
    .populate('gstRegistrationId', 'gstin legalName')
    .populate('journalEntryId', 'entryNumber')
    .sort({ invoiceDate: -1 })
    .skip(skip)
    .limit(limit);
  
  // Get total count for pagination
  const total = await PurchaseInvoice.countDocuments(filter);
  
  res.status(200).json({
    success: true,
    count: purchaseInvoices.length,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    },
    data: purchaseInvoices
  });
});

/**
 * @desc    Get purchase invoice by ID
 * @route   GET /api/v1/gst/purchase-invoices/:id
 * @access  Private (Requires authentication and authorization)
 */
exports.getPurchaseInvoiceById = asyncHandler(async (req, res) => {
  const purchaseInvoice = await PurchaseInvoice.findOne({
    _id: req.params.id,
    tenantId: req.user.tenantId
  })
    .populate('gstRegistrationId', 'gstin legalName stateCode')
    .populate('journalEntryId')
    .populate('attachments')
    .populate('createdBy', 'name email');
  
  if (!purchaseInvoice) {
    return res.status(404).json({
      success: false,
      error: 'Purchase invoice not found'
    });
  }
  
  res.status(200).json({
    success: true,
    data: purchaseInvoice
  });
});

/**
 * @desc    Update purchase invoice
 * @route   PUT /api/v1/gst/purchase-invoices/:id
 * @access  Private (Requires authentication and authorization)
 */
exports.updatePurchaseInvoice = asyncHandler(async (req, res) => {
  // Find the purchase invoice first to check if it's already reported in GSTR
  const existingInvoice = await PurchaseInvoice.findOne({
    _id: req.params.id,
    tenantId: req.user.tenantId
  });
  
  if (!existingInvoice) {
    return res.status(404).json({
      success: false,
      error: 'Purchase invoice not found'
    });
  }
  
  // Check if invoice is already reported in GSTR
  if (existingInvoice.reportedInGSTR2) {
    return res.status(400).json({
      success: false,
      error: 'Cannot update invoice that has already been reported in GSTR-2'
    });
  }
  
  // Update the invoice
  req.body.updatedBy = req.user._id;
  const purchaseInvoice = await PurchaseInvoice.findOneAndUpdate(
    { _id: req.params.id, tenantId: req.user.tenantId },
    req.body,
    { new: true, runValidators: true }
  );
  
  // TODO: Update corresponding journal entry if it exists
  
  res.status(200).json({
    success: true,
    data: purchaseInvoice
  });
});

/**
 * @desc    Delete purchase invoice
 * @route   DELETE /api/v1/gst/purchase-invoices/:id
 * @access  Private (Requires authentication and authorization)
 */
exports.deletePurchaseInvoice = asyncHandler(async (req, res) => {
  // Find the purchase invoice first to check if it's already reported in GSTR
  const existingInvoice = await PurchaseInvoice.findOne({
    _id: req.params.id,
    tenantId: req.user.tenantId
  });
  
  if (!existingInvoice) {
    return res.status(404).json({
      success: false,
      error: 'Purchase invoice not found'
    });
  }
  
  // Check if invoice is already reported in GSTR
  if (existingInvoice.reportedInGSTR2) {
    return res.status(400).json({
      success: false,
      error: 'Cannot delete invoice that has already been reported in GSTR-2'
    });
  }
  
  // Check if invoice has a journal entry
  if (existingInvoice.journalEntryId) {
    // TODO: Delete the corresponding journal entry or prevent deletion
    // For now, we'll prevent deletion if there's a journal entry
    return res.status(400).json({
      success: false,
      error: 'Cannot delete invoice that has an associated journal entry. Delete the journal entry first.'
    });
  }
  
  // Delete the invoice
  await PurchaseInvoice.findOneAndDelete({
    _id: req.params.id,
    tenantId: req.user.tenantId
  });
  
  res.status(200).json({
    success: true,
    data: {}
  });
});

/**
 * @desc    Update purchase invoice payment status
 * @route   PATCH /api/v1/gst/purchase-invoices/:id/payment-status
 * @access  Private (Requires authentication and authorization)
 */
exports.updatePaymentStatus = asyncHandler(async (req, res) => {
  // Validate request body
  if (!req.body.paymentStatus || !['Unpaid', 'Partially Paid', 'Paid'].includes(req.body.paymentStatus)) {
    return res.status(400).json({
      success: false,
      error: 'Payment status must be one of: Unpaid, Partially Paid, Paid'
    });
  }
  
  // Update payment status
  const purchaseInvoice = await PurchaseInvoice.findOneAndUpdate(
    { _id: req.params.id, tenantId: req.user.tenantId },
    { 
      paymentStatus: req.body.paymentStatus,
      paidAmount: req.body.paidAmount || 0,
      paymentDate: req.body.paymentDate || null,
      paymentReference: req.body.paymentReference || null,
      updatedBy: req.user._id
    },
    { new: true }
  );
  
  if (!purchaseInvoice) {
    return res.status(404).json({
      success: false,
      error: 'Purchase invoice not found'
    });
  }
  
  res.status(200).json({
    success: true,
    data: purchaseInvoice
  });
});

/**
 * @desc    Update ITC eligibility
 * @route   PATCH /api/v1/gst/purchase-invoices/:id/itc-eligibility
 * @access  Private (Requires authentication and authorization)
 */
exports.updateITCEligibility = asyncHandler(async (req, res) => {
  // Validate request body
  if (!req.body.itcEligibility || !['Eligible', 'Ineligible', 'Partial'].includes(req.body.itcEligibility)) {
    return res.status(400).json({
      success: false,
      error: 'ITC eligibility must be one of: Eligible, Ineligible, Partial'
    });
  }
  
  // Update ITC eligibility
  const purchaseInvoice = await PurchaseInvoice.findOneAndUpdate(
    { _id: req.params.id, tenantId: req.user.tenantId },
    { 
      itcEligibility: req.body.itcEligibility,
      itcRemarks: req.body.itcRemarks || '',
      updatedBy: req.user._id
    },
    { new: true }
  );
  
  if (!purchaseInvoice) {
    return res.status(404).json({
      success: false,
      error: 'Purchase invoice not found'
    });
  }
  
  res.status(200).json({
    success: true,
    data: purchaseInvoice
  });
});

/**
 * @desc    Mark invoice as reported in GSTR-2
 * @route   PATCH /api/v1/gst/purchase-invoices/:id/mark-reported
 * @access  Private (Requires authentication and authorization)
 */
exports.markAsReportedInGSTR = asyncHandler(async (req, res) => {
  // Update reported status
  const purchaseInvoice = await PurchaseInvoice.findOneAndUpdate(
    { _id: req.params.id, tenantId: req.user.tenantId },
    { 
      reportedInGSTR2: true,
      reportedInGSTR2Date: new Date(),
      reportedInGSTR2By: req.user._id,
      updatedBy: req.user._id
    },
    { new: true }
  );
  
  if (!purchaseInvoice) {
    return res.status(404).json({
      success: false,
      error: 'Purchase invoice not found'
    });
  }
  
  res.status(200).json({
    success: true,
    data: purchaseInvoice
  });
});

/**
 * @desc    Generate journal entry for purchase invoice
 * @route   POST /api/v1/gst/purchase-invoices/:id/generate-journal
 * @access  Private (Requires authentication and authorization)
 */
exports.generateJournalEntry = asyncHandler(async (req, res) => {
  // Find the purchase invoice
  const purchaseInvoice = await PurchaseInvoice.findOne({
    _id: req.params.id,
    tenantId: req.user.tenantId
  }).populate('gstRegistrationId');
  
  if (!purchaseInvoice) {
    return res.status(404).json({
      success: false,
      error: 'Purchase invoice not found'
    });
  }
  
  // Check if journal entry already exists
  if (purchaseInvoice.journalEntryId) {
    return res.status(400).json({
      success: false,
      error: 'Journal entry already exists for this invoice'
    });
  }
  
  // TODO: Implement journal entry generation logic
  // This would typically involve creating a journal entry with appropriate accounts
  // For now, we'll return a placeholder response
  
  res.status(200).json({
    success: true,
    message: 'Journal entry generation endpoint is under development',
    data: {
      invoiceId: purchaseInvoice._id,
      invoiceNumber: purchaseInvoice.invoiceNumber,
      vendorName: purchaseInvoice.vendorName,
      totalAmount: purchaseInvoice.totalAmount
    }
  });
});

/**
 * @desc    Get purchase invoice statistics
 * @route   GET /api/v1/gst/purchase-invoices/statistics
 * @access  Private (Requires authentication and authorization)
 */
exports.getPurchaseInvoiceStatistics = asyncHandler(async (req, res) => {
  // Get date range from query params or default to current month
  const today = new Date();
  const startDate = req.query.startDate 
    ? new Date(req.query.startDate) 
    : new Date(today.getFullYear(), today.getMonth(), 1);
  const endDate = req.query.endDate 
    ? new Date(req.query.endDate) 
    : new Date(today.getFullYear(), today.getMonth() + 1, 0);
  
  // Aggregate statistics
  const statistics = await PurchaseInvoice.aggregate([
    {
      $match: {
        tenantId: req.user.tenantId,
        invoiceDate: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: null,
        totalInvoices: { $sum: 1 },
        totalAmount: { $sum: '$totalAmount' },
        totalTaxableValue: { $sum: '$totalTaxableValue' },
        totalCGST: { $sum: '$totalCGST' },
        totalSGST: { $sum: '$totalSGST' },
        totalIGST: { $sum: '$totalIGST' },
        totalCess: { $sum: '$totalCess' },
        paidInvoices: {
          $sum: { $cond: [{ $eq: ['$paymentStatus', 'Paid'] }, 1, 0] }
        },
        unpaidInvoices: {
          $sum: { $cond: [{ $eq: ['$paymentStatus', 'Unpaid'] }, 1, 0] }
        },
        partiallyPaidInvoices: {
          $sum: { $cond: [{ $eq: ['$paymentStatus', 'Partially Paid'] }, 1, 0] }
        },
        reportedInvoices: {
          $sum: { $cond: ['$reportedInGSTR2', 1, 0] }
        },
        unreportedInvoices: {
          $sum: { $cond: ['$reportedInGSTR2', 0, 1] }
        }
      }
    }
  ]);
  
  // Format response
  const result = statistics.length > 0 ? statistics[0] : {
    totalInvoices: 0,
    totalAmount: 0,
    totalTaxableValue: 0,
    totalCGST: 0,
    totalSGST: 0,
    totalIGST: 0,
    totalCess: 0,
    paidInvoices: 0,
    unpaidInvoices: 0,
    partiallyPaidInvoices: 0,
    reportedInvoices: 0,
    unreportedInvoices: 0
  };
  
  // Remove _id field from result
  if (result._id !== undefined) {
    delete result._id;
  }
  
  res.status(200).json({
    success: true,
    data: result
  });
});