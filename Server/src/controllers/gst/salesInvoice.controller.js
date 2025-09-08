/**
 * Sales Invoice Controller
 * Handles API requests for Sales Invoice operations with GST compliance
 */

const SalesInvoice = require('../../models/gst/salesInvoice.model');
const GSTRegistration = require('../../models/gst/gstRegistration.model');
const JournalEntry = require('../../models/accounting/journalEntry.model');
const { asyncHandler, AppError } = require('../../utils/appError');

/**
 * @desc    Create a new sales invoice
 * @route   POST /api/v1/gst/sales-invoices
 * @access  Private (Requires authentication and authorization)
 */
exports.createSalesInvoice = asyncHandler(async (req, res) => {
  // Add tenant ID from authenticated user
  req.body.tenantId = req.user.tenantId;
  req.body.createdBy = req.user._id;
  
  // Validate GSTIN if provided
  if (req.body.customerGstin) {
    // Check if the GSTIN format is valid
    const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    if (!gstinRegex.test(req.body.customerGstin)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid GSTIN format'
      });
    }
  }
  
  // Create the sales invoice
  const salesInvoice = await SalesInvoice.create(req.body);
  
  // TODO: Create corresponding journal entry if autoCreateJournalEntry is true
  
  res.status(201).json({
    success: true,
    data: salesInvoice
  });
});

/**
 * @desc    Get sales invoice statistics
 * @route   GET /api/v1/gst/sales-invoices/statistics
 * @access  Private (Requires authentication and authorization)
 */
exports.getSalesInvoiceStatistics = asyncHandler(async (req, res) => {
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
  const totalCount = await SalesInvoice.countDocuments(filter);
  
  // Get total invoice value
  const totalValueResult = await SalesInvoice.aggregate([
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
  const statusCounts = await SalesInvoice.aggregate([
    { $match: filter },
    { $group: {
      _id: "$status",
      count: { $sum: 1 }
    }}
  ]);
  
  // Get count by month (for the last 6 months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  
  const monthlyStats = await SalesInvoice.aggregate([
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
      monthlyStats
    }
  });
});

/**
 * @desc    Get all sales invoices
 * @route   GET /api/v1/gst/sales-invoices
 * @access  Private (Requires authentication and authorization)
 */
exports.getSalesInvoices = asyncHandler(async (req, res) => {
  // Filter by tenant ID from authenticated user
  const filter = { tenantId: req.user.tenantId };
  
  // Add additional filters if provided
  if (req.query.customerName) {
    filter.customerName = { $regex: req.query.customerName, $options: 'i' };
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
  if (req.query.reportedInGSTR) {
    filter.reportedInGSTR1 = req.query.reportedInGSTR === 'true';
  }
  if (req.query.eInvoiceStatus) {
    filter['eInvoice.status'] = req.query.eInvoiceStatus;
  }
  
  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;
  
  // Find sales invoices with filters and pagination
  const salesInvoices = await SalesInvoice.find(filter)
    .populate('gstRegistrationId', 'gstin legalName')
    .populate('journalEntryId', 'entryNumber')
    .sort({ invoiceDate: -1 })
    .skip(skip)
    .limit(limit);
  
  // Get total count for pagination
  const total = await SalesInvoice.countDocuments(filter);
  
  res.status(200).json({
    success: true,
    count: salesInvoices.length,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    },
    data: salesInvoices
  });
});

/**
 * @desc    Get sales invoice by ID
 * @route   GET /api/v1/gst/sales-invoices/:id
 * @access  Private (Requires authentication and authorization)
 */
exports.getSalesInvoiceById = asyncHandler(async (req, res) => {
  const salesInvoice = await SalesInvoice.findOne({
    _id: req.params.id,
    tenantId: req.user.tenantId
  })
    .populate('gstRegistrationId', 'gstin legalName stateCode')
    .populate('journalEntryId')
    .populate('attachments')
    .populate('createdBy', 'name email');
  
  if (!salesInvoice) {
    return res.status(404).json({
      success: false,
      error: 'Sales invoice not found'
    });
  }
  
  res.status(200).json({
    success: true,
    data: salesInvoice
  });
});

/**
 * @desc    Update sales invoice
 * @route   PUT /api/v1/gst/sales-invoices/:id
 * @access  Private (Requires authentication and authorization)
 */
exports.updateSalesInvoice = asyncHandler(async (req, res) => {
  // Find the sales invoice first to check if it's already reported in GSTR
  const existingInvoice = await SalesInvoice.findOne({
    _id: req.params.id,
    tenantId: req.user.tenantId
  });
  
  if (!existingInvoice) {
    return res.status(404).json({
      success: false,
      error: 'Sales invoice not found'
    });
  }
  
  // Check if invoice is already reported in GSTR
  if (existingInvoice.reportedInGSTR1) {
    return res.status(400).json({
      success: false,
      error: 'Cannot update invoice that has already been reported in GSTR-1'
    });
  }
  
  // Check if e-invoice is already generated
  if (existingInvoice.eInvoice && existingInvoice.eInvoice.status === 'Generated') {
    return res.status(400).json({
      success: false,
      error: 'Cannot update invoice that has already generated e-invoice'
    });
  }
  
  // Update the invoice
  req.body.updatedBy = req.user._id;
  const salesInvoice = await SalesInvoice.findOneAndUpdate(
    { _id: req.params.id, tenantId: req.user.tenantId },
    req.body,
    { new: true, runValidators: true }
  );
  
  // TODO: Update corresponding journal entry if it exists
  
  res.status(200).json({
    success: true,
    data: salesInvoice
  });
});

/**
 * @desc    Delete sales invoice
 * @route   DELETE /api/v1/gst/sales-invoices/:id
 * @access  Private (Requires authentication and authorization)
 */
exports.deleteSalesInvoice = asyncHandler(async (req, res) => {
  // Find the sales invoice first to check if it's already reported in GSTR
  const existingInvoice = await SalesInvoice.findOne({
    _id: req.params.id,
    tenantId: req.user.tenantId
  });
  
  if (!existingInvoice) {
    return res.status(404).json({
      success: false,
      error: 'Sales invoice not found'
    });
  }
  
  // Check if invoice is already reported in GSTR
  if (existingInvoice.reportedInGSTR1) {
    return res.status(400).json({
      success: false,
      error: 'Cannot delete invoice that has already been reported in GSTR-1'
    });
  }
  
  // Check if e-invoice is already generated
  if (existingInvoice.eInvoice && existingInvoice.eInvoice.status === 'Generated') {
    return res.status(400).json({
      success: false,
      error: 'Cannot delete invoice that has already generated e-invoice'
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
  await SalesInvoice.findOneAndDelete({
    _id: req.params.id,
    tenantId: req.user.tenantId
  });
  
  res.status(200).json({
    success: true,
    data: {}
  });
});

/**
 * @desc    Update sales invoice payment status
 * @route   PATCH /api/v1/gst/sales-invoices/:id/payment-status
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
  const salesInvoice = await SalesInvoice.findOneAndUpdate(
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
  
  if (!salesInvoice) {
    return res.status(404).json({
      success: false,
      error: 'Sales invoice not found'
    });
  }
  
  res.status(200).json({
    success: true,
    data: salesInvoice
  });
});

/**
 * @desc    Mark invoice as reported in GSTR-1
 * @route   PATCH /api/v1/gst/sales-invoices/:id/mark-reported
 * @access  Private (Requires authentication and authorization)
 */
exports.markAsReportedInGSTR = asyncHandler(async (req, res) => {
  // Update reported status
  const salesInvoice = await SalesInvoice.findOneAndUpdate(
    { _id: req.params.id, tenantId: req.user.tenantId },
    { 
      reportedInGSTR1: true,
      reportedInGSTR1Date: new Date(),
      reportedInGSTR1By: req.user._id,
      updatedBy: req.user._id
    },
    { new: true }
  );
  
  if (!salesInvoice) {
    return res.status(404).json({
      success: false,
      error: 'Sales invoice not found'
    });
  }
  
  res.status(200).json({
    success: true,
    data: salesInvoice
  });
});

/**
 * @desc    Generate e-invoice for sales invoice
 * @route   POST /api/v1/gst/sales-invoices/:id/generate-einvoice
 * @access  Private (Requires authentication and authorization)
 */
exports.generateEInvoice = asyncHandler(async (req, res) => {
  // Find the sales invoice
  const salesInvoice = await SalesInvoice.findOne({
    _id: req.params.id,
    tenantId: req.user.tenantId
  }).populate('gstRegistrationId');
  
  if (!salesInvoice) {
    return res.status(404).json({
      success: false,
      error: 'Sales invoice not found'
    });
  }
  
  // Check if e-invoice is already generated
  if (salesInvoice.eInvoice && salesInvoice.eInvoice.status === 'Generated') {
    return res.status(400).json({
      success: false,
      error: 'E-invoice already generated for this invoice'
    });
  }
  
  // Check if GST registration has portal credentials
  if (!salesInvoice.gstRegistrationId || !salesInvoice.gstRegistrationId.portalCredentials || !salesInvoice.gstRegistrationId.portalCredentials.isStored) {
    return res.status(400).json({
      success: false,
      error: 'GST portal credentials not found. Please set up portal credentials for the GST registration.'
    });
  }
  
  // TODO: Implement e-invoice generation logic with GST API integration
  // For now, we'll simulate a successful e-invoice generation
  
  const eInvoice = {
    status: 'Generated',
    irn: `${Math.floor(Math.random() * 1000000000000).toString().padStart(12, '0')}`,
    acknowledgementNumber: `${Math.floor(Math.random() * 1000000000).toString().padStart(9, '0')}`,
    acknowledgementDate: new Date(),
    signedQRCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
    signedInvoice: 'data:application/pdf;base64,PLACEHOLDER'
  };
  
  // Update the sales invoice with e-invoice details
  const updatedSalesInvoice = await SalesInvoice.findOneAndUpdate(
    { _id: req.params.id, tenantId: req.user.tenantId },
    { eInvoice },
    { new: true }
  );
  
  res.status(200).json({
    success: true,
    data: updatedSalesInvoice
  });
});

/**
 * @desc    Generate e-way bill for sales invoice
 * @route   POST /api/v1/gst/sales-invoices/:id/generate-eway-bill
 * @access  Private (Requires authentication and authorization)
 */
exports.generateEWayBill = asyncHandler(async (req, res) => {
  // Find the sales invoice
  const salesInvoice = await SalesInvoice.findOne({
    _id: req.params.id,
    tenantId: req.user.tenantId
  }).populate('gstRegistrationId');
  
  if (!salesInvoice) {
    return res.status(404).json({
      success: false,
      error: 'Sales invoice not found'
    });
  }
  
  // Check if e-way bill is already generated
  if (salesInvoice.eWayBill && salesInvoice.eWayBill.status === 'Generated') {
    return res.status(400).json({
      success: false,
      error: 'E-way bill already generated for this invoice'
    });
  }
  
  // Check if GST registration has portal credentials
  if (!salesInvoice.gstRegistrationId || !salesInvoice.gstRegistrationId.portalCredentials || !salesInvoice.gstRegistrationId.portalCredentials.isStored) {
    return res.status(400).json({
      success: false,
      error: 'GST portal credentials not found. Please set up portal credentials for the GST registration.'
    });
  }
  
  // Validate required fields for e-way bill
  if (!req.body.transporterName || !req.body.transportMode || !req.body.vehicleNumber) {
    return res.status(400).json({
      success: false,
      error: 'Transporter name, transport mode, and vehicle number are required for e-way bill generation'
    });
  }
  
  // TODO: Implement e-way bill generation logic with GST API integration
  // For now, we'll simulate a successful e-way bill generation
  
  const eWayBill = {
    status: 'Generated',
    eWayBillNumber: `${Math.floor(Math.random() * 1000000000000).toString().padStart(12, '0')}`,
    generatedDate: new Date(),
    validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000), // Valid for 24 hours
    transporterName: req.body.transporterName,
    transportMode: req.body.transportMode,
    vehicleNumber: req.body.vehicleNumber,
    fromPlace: req.body.fromPlace || salesInvoice.placeOfSupply,
    toPlace: req.body.toPlace || salesInvoice.customerAddress
  };
  
  // Update the sales invoice with e-way bill details
  const updatedSalesInvoice = await SalesInvoice.findOneAndUpdate(
    { _id: req.params.id, tenantId: req.user.tenantId },
    { eWayBill },
    { new: true }
  );
  
  res.status(200).json({
    success: true,
    data: updatedSalesInvoice
  });
});

/**
 * @desc    Generate journal entry for sales invoice
 * @route   POST /api/v1/gst/sales-invoices/:id/generate-journal-entry
 * @access  Private (Requires authentication and authorization)
 */
exports.generateJournalEntry = asyncHandler(async (req, res) => {
  // Find the sales invoice
  const salesInvoice = await SalesInvoice.findOne({
    _id: req.params.id,
    tenantId: req.user.tenantId
  });
  
  if (!salesInvoice) {
    return res.status(404).json({
      success: false,
      error: 'Sales invoice not found'
    });
  }
  
  // Check if journal entry already exists
  if (salesInvoice.journalEntryId) {
    return res.status(400).json({
      success: false,
      error: 'Journal entry already exists for this invoice'
    });
  }
  
  // Create journal entry lines
  const journalEntryLines = [];
  
  // Add debit entry for Accounts Receivable
  journalEntryLines.push({
    account: req.body.accountsReceivableId, // This should be provided or fetched from settings
    debit: salesInvoice.totalInvoiceValue,
    credit: 0,
    description: `Invoice ${salesInvoice.invoiceNumber} - ${salesInvoice.customerName}`
  });
  
  // Add credit entry for Sales Revenue
  journalEntryLines.push({
    account: req.body.salesRevenueId, // This should be provided or fetched from settings
    debit: 0,
    credit: salesInvoice.totalTaxableValue,
    description: `Invoice ${salesInvoice.invoiceNumber} - Sales Revenue`
  });
  
  // Add credit entries for taxes if applicable
  if (salesInvoice.totalCgstAmount > 0) {
    journalEntryLines.push({
      account: req.body.cgstAccountId, // This should be provided or fetched from settings
      debit: 0,
      credit: salesInvoice.totalCgstAmount,
      description: `Invoice ${salesInvoice.invoiceNumber} - CGST`
    });
  }
  
  if (salesInvoice.totalSgstAmount > 0) {
    journalEntryLines.push({
      account: req.body.sgstAccountId, // This should be provided or fetched from settings
      debit: 0,
      credit: salesInvoice.totalSgstAmount,
      description: `Invoice ${salesInvoice.invoiceNumber} - SGST`
    });
  }
  
  if (salesInvoice.totalIgstAmount > 0) {
    journalEntryLines.push({
      account: req.body.igstAccountId, // This should be provided or fetched from settings
      debit: 0,
      credit: salesInvoice.totalIgstAmount,
      description: `Invoice ${salesInvoice.invoiceNumber} - IGST`
    });
  }
  
  // Create the journal entry
  const journalEntry = await JournalEntry.create({
    date: salesInvoice.invoiceDate,
    lines: journalEntryLines,
    narration: `Sales Invoice ${salesInvoice.invoiceNumber} - ${salesInvoice.customerName}`,
    referenceNumber: salesInvoice.invoiceNumber,
    sourceType: 'System',
    status: 'Posted',
    tenantId: req.user.tenantId,
    createdBy: req.user._id
  });
  
  // Update the sales invoice with journal entry ID
  const updatedSalesInvoice = await SalesInvoice.findOneAndUpdate(
    { _id: req.params.id, tenantId: req.user.tenantId },
    { journalEntryId: journalEntry._id },
    { new: true }
  );
  
  res.status(200).json({
    success: true,
    data: {
      salesInvoice: updatedSalesInvoice,
      journalEntry
    }
  });
});