/**
 * GSTR-1 Controller
 * Handles API requests for GSTR-1 return filing operations
 */

const GSTR1 = require('../../models/gst/gstr1.model');
const SalesInvoice = require('../../models/gst/salesInvoice.model');
const GSTRegistration = require('../../models/gst/gstRegistration.model');
const { asyncHandler, AppError } = require('../../utils/appError');

/**
 * @desc    Create a new GSTR-1 return
 * @route   POST /api/v1/gst/gstr1
 * @access  Private (Requires authentication and authorization)
 */
exports.createGSTR1 = asyncHandler(async (req, res) => {
  // Add tenant ID from authenticated user
  req.body.tenantId = req.user.tenantId;
  req.body.createdBy = req.user._id;
  
  // Validate return period format (MM-YYYY)
  const periodRegex = /^(0[1-9]|1[0-2])-\d{4}$/;
  if (!periodRegex.test(req.body.returnPeriod)) {
    return res.status(400).json({
      success: false,
      error: 'Return period must be in MM-YYYY format'
    });
  }
  
  // Validate financial year format (YYYY-YY)
  const fyRegex = /^\d{4}-\d{2}$/;
  if (!fyRegex.test(req.body.financialYear)) {
    return res.status(400).json({
      success: false,
      error: 'Financial year must be in YYYY-YY format'
    });
  }
  
  // Check if GSTR-1 already exists for the given period and GSTIN
  const existingReturn = await GSTR1.findOne({
    tenantId: req.user.tenantId,
    gstRegistrationId: req.body.gstRegistrationId,
    returnPeriod: req.body.returnPeriod
  });
  
  if (existingReturn) {
    return res.status(400).json({
      success: false,
      error: 'GSTR-1 return already exists for this period and GSTIN'
    });
  }
  
  // Create the GSTR-1 return
  const gstr1 = await GSTR1.create(req.body);
  
  res.status(201).json({
    success: true,
    data: gstr1
  });
});

/**
 * @desc    Get all GSTR-1 returns
 * @route   GET /api/v1/gst/gstr1
 * @access  Private (Requires authentication and authorization)
 */
exports.getGSTR1Returns = asyncHandler(async (req, res) => {
  // Filter by tenant ID from authenticated user
  const filter = { tenantId: req.user.tenantId };
  
  // Add additional filters if provided
  if (req.query.gstRegistrationId) {
    filter.gstRegistrationId = req.query.gstRegistrationId;
  }
  if (req.query.returnPeriod) {
    filter.returnPeriod = req.query.returnPeriod;
  }
  if (req.query.financialYear) {
    filter.financialYear = req.query.financialYear;
  }
  if (req.query.status) {
    filter.status = req.query.status;
  }
  
  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;
  
  // Find GSTR-1 returns with filters and pagination
  const gstr1Returns = await GSTR1.find(filter)
    .populate('gstRegistrationId', 'gstin legalName')
    .sort({ returnPeriod: -1 })
    .skip(skip)
    .limit(limit);
  
  // Get total count for pagination
  const total = await GSTR1.countDocuments(filter);
  
  res.status(200).json({
    success: true,
    count: gstr1Returns.length,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    },
    data: gstr1Returns
  });
});

/**
 * @desc    Get GSTR-1 return by ID
 * @route   GET /api/v1/gst/gstr1/:id
 * @access  Private (Requires authentication and authorization)
 */
exports.getGSTR1ById = asyncHandler(async (req, res) => {
  const gstr1 = await GSTR1.findOne({
    _id: req.params.id,
    tenantId: req.user.tenantId
  }).populate('gstRegistrationId', 'gstin legalName stateCode');
  
  if (!gstr1) {
    return res.status(404).json({
      success: false,
      error: 'GSTR-1 return not found'
    });
  }
  
  res.status(200).json({
    success: true,
    data: gstr1
  });
});

/**
 * @desc    Update GSTR-1 return
 * @route   PUT /api/v1/gst/gstr1/:id
 * @access  Private (Requires authentication and authorization)
 */
exports.updateGSTR1 = asyncHandler(async (req, res) => {
  // Find the GSTR-1 return first to check if it's already filed
  const existingReturn = await GSTR1.findOne({
    _id: req.params.id,
    tenantId: req.user.tenantId
  });
  
  if (!existingReturn) {
    return res.status(404).json({
      success: false,
      error: 'GSTR-1 return not found'
    });
  }
  
  // Check if return is already filed
  if (existingReturn.status === 'Filed') {
    return res.status(400).json({
      success: false,
      error: 'Cannot update GSTR-1 return that has already been filed'
    });
  }
  
  // Update the return
  req.body.updatedBy = req.user._id;
  const gstr1 = await GSTR1.findOneAndUpdate(
    { _id: req.params.id, tenantId: req.user.tenantId },
    req.body,
    { new: true, runValidators: true }
  );
  
  res.status(200).json({
    success: true,
    data: gstr1
  });
});

/**
 * @desc    Delete GSTR-1 return
 * @route   DELETE /api/v1/gst/gstr1/:id
 * @access  Private (Requires authentication and authorization)
 */
exports.deleteGSTR1 = asyncHandler(async (req, res) => {
  // Find the GSTR-1 return first to check if it's already filed
  const existingReturn = await GSTR1.findOne({
    _id: req.params.id,
    tenantId: req.user.tenantId
  });
  
  if (!existingReturn) {
    return res.status(404).json({
      success: false,
      error: 'GSTR-1 return not found'
    });
  }
  
  // Check if return is already filed
  if (existingReturn.status === 'Filed') {
    return res.status(400).json({
      success: false,
      error: 'Cannot delete GSTR-1 return that has already been filed'
    });
  }
  
  // Delete the return
  await GSTR1.findOneAndDelete({
    _id: req.params.id,
    tenantId: req.user.tenantId
  });
  
  res.status(200).json({
    success: true,
    data: {}
  });
});

/**
 * @desc    Populate GSTR-1 return with sales invoice data
 * @route   POST /api/v1/gst/gstr1/:id/populate
 * @access  Private (Requires authentication and authorization)
 */
exports.populateGSTR1 = asyncHandler(async (req, res) => {
  // Find the GSTR-1 return
  const gstr1 = await GSTR1.findOne({
    _id: req.params.id,
    tenantId: req.user.tenantId
  }).populate('gstRegistrationId');

  if (!gstr1) {
    return res.status(404).json({
      success: false,
      error: 'GSTR-1 return not found'
    });
  }

  // Check if return is already filed
  if (gstr1.status === 'Filed') {
    return res.status(400).json({
      success: false,
      error: 'Cannot populate GSTR-1 return that has already been filed'
    });
  }

  // Extract month and year from return period
  const [month, year] = gstr1.returnPeriod.split('-');
  const startDate = new Date(`${year}-${month}-01`);
  const endDate = new Date(startDate);
  endDate.setMonth(endDate.getMonth() + 1);
  endDate.setDate(0); // Last day of the month

  // Find sales invoices for the period
  const salesInvoices = await SalesInvoice.find({
    tenantId: req.user.tenantId,
    gstin: gstr1.gstRegistrationId.gstin,
    invoiceDate: { $gte: startDate, $lte: endDate },
    status: 'Issued'
  });

  // Categorize invoices
  const b2bInvoices = [];
  const b2cLargeInvoices = [];
  const b2cSmallMap = {};
  const exportInvoices = [];
  salesInvoices.forEach(inv => {
    if (inv.invoiceType === 'Export' || inv.invoiceType === 'SEZ') {
      exportInvoices.push({
        invoiceId: inv._id,
        invoiceNumber: inv.invoiceNumber,
        invoiceDate: inv.invoiceDate,
        exportType: inv.invoiceType === 'Export' ? 'With Payment' : 'Without Payment',
        portCode: '',
        shippingBillNumber: '',
        shippingBillDate: null,
        invoiceValue: inv.totalInvoiceValue,
        taxableValue: inv.totalTaxableValue,
        igstAmount: inv.totalIgstAmount
      });
    } else if (inv.customerGstin && inv.customerGstin.length === 15) {
      b2bInvoices.push({
        invoiceId: inv._id,
        invoiceNumber: inv.invoiceNumber,
        invoiceDate: inv.invoiceDate,
        customerGstin: inv.customerGstin,
        customerName: inv.customerName,
        placeOfSupply: inv.placeOfSupply,
        reverseCharge: inv.reverseCharge,
        invoiceValue: inv.totalInvoiceValue,
        taxableValue: inv.totalTaxableValue,
        igstAmount: inv.totalIgstAmount,
        cgstAmount: inv.totalCgstAmount,
        sgstAmount: inv.totalSgstAmount
      });
    } else if (inv.totalInvoiceValue > 250000) {
      b2cLargeInvoices.push({
        invoiceId: inv._id,
        invoiceNumber: inv.invoiceNumber,
        invoiceDate: inv.invoiceDate,
        placeOfSupply: inv.placeOfSupply,
        invoiceValue: inv.totalInvoiceValue,
        taxableValue: inv.totalTaxableValue,
        igstAmount: inv.totalIgstAmount
      });
    } else {
      // B2C Small (consolidated by place of supply and GST rate)
      inv.items.forEach(item => {
        const key = `${inv.placeOfSupply}_${item.gstRate}`;
        if (!b2cSmallMap[key]) {
          b2cSmallMap[key] = {
            placeOfSupply: inv.placeOfSupply,
            gstRate: item.gstRate,
            taxableValue: 0,
            igstAmount: 0,
            cgstAmount: 0,
            sgstAmount: 0,
            invoiceCount: 0
          };
        }
        b2cSmallMap[key].taxableValue += item.taxableValue;
        b2cSmallMap[key].igstAmount += item.igstAmount;
        b2cSmallMap[key].cgstAmount += item.cgstAmount;
        b2cSmallMap[key].sgstAmount += item.sgstAmount;
        b2cSmallMap[key].invoiceCount += 1;
      });
    }
  });
  const b2cSmall = Object.values(b2cSmallMap);

  // Update GSTR-1 document
  gstr1.b2bInvoices = b2bInvoices;
  gstr1.b2cLargeInvoices = b2cLargeInvoices;
  gstr1.b2cSmall = b2cSmall;
  gstr1.exportInvoices = exportInvoices;
  gstr1.status = 'In Progress';
  await gstr1.save();

  res.status(200).json({
    success: true,
    message: 'GSTR-1 populated successfully',
    data: gstr1
  });
});

/**
 * @desc    Generate JSON for GSTR-1 filing
 * @route   GET /api/v1/gst/gstr1/:id/json
 * @access  Private (Requires authentication and authorization)
 */
exports.generateGSTR1JSON = asyncHandler(async (req, res) => {
  // Find the GSTR-1 return
  const gstr1 = await GSTR1.findOne({
    _id: req.params.id,
    tenantId: req.user.tenantId
  }).populate('gstRegistrationId');

  if (!gstr1) {
    return res.status(404).json({
      success: false,
      error: 'GSTR-1 return not found'
    });
  }

  // Use the model's generateFilingJson method
  const gstr1JSON = gstr1.generateFilingJson();

  res.status(200).json({
    success: true,
    data: gstr1JSON
  });
});

/**
 * @desc    Mark GSTR-1 as filed
 * @route   PATCH /api/v1/gst/gstr1/:id/mark-filed
 * @access  Private (Requires authentication and authorization)
 */
exports.markGSTR1Filed = asyncHandler(async (req, res) => {
  // Validate request body
  if (!req.body.acknowledgementNumber || !req.body.acknowledgementDate) {
    return res.status(400).json({
      success: false,
      error: 'Acknowledgement number and date are required'
    });
  }
  
  // Update filed status
  const gstr1 = await GSTR1.findOneAndUpdate(
    { _id: req.params.id, tenantId: req.user.tenantId },
    { 
      status: 'Filed',
      acknowledgementNumber: req.body.acknowledgementNumber,
      acknowledgementDate: new Date(req.body.acknowledgementDate),
      filedBy: req.user._id,
      filedAt: new Date(),
      updatedBy: req.user._id
    },
    { new: true }
  );
  
  if (!gstr1) {
    return res.status(404).json({
      success: false,
      error: 'GSTR-1 return not found'
    });
  }
  
  // TODO: Mark all included sales invoices as reported in GSTR-1
  
  res.status(200).json({
    success: true,
    data: gstr1
  });
});

/**
 * @desc    Get GSTR-1 summary statistics
 * @route   GET /api/v1/gst/gstr1/statistics
 * @access  Private (Requires authentication and authorization)
 */
exports.getGSTR1Statistics = asyncHandler(async (req, res) => {
  // Get financial year from query params or default to current financial year
  const today = new Date();
  const currentMonth = today.getMonth() + 1;
  const currentYear = today.getFullYear();
  const defaultFY = currentMonth >= 4 
    ? `${currentYear}-${(currentYear + 1).toString().substr(2, 2)}` 
    : `${currentYear - 1}-${currentYear.toString().substr(2, 2)}`;
  
  const financialYear = req.query.financialYear || defaultFY;
  
  // Aggregate statistics
  const statistics = await GSTR1.aggregate([
    {
      $match: {
        tenantId: req.user.tenantId,
        financialYear: financialYear
      }
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalTaxableValue: { $sum: '$totalTaxableValue' },
        totalTaxAmount: { $sum: '$totalTaxAmount' }
      }
    }
  ]);
  
  // Format response
  const result = {
    financialYear,
    totalReturns: 0,
    draftReturns: 0,
    filedReturns: 0,
    totalTaxableValue: 0,
    totalTaxAmount: 0
  };
  
  statistics.forEach(stat => {
    result.totalReturns += stat.count;
    result.totalTaxableValue += stat.totalTaxableValue || 0;
    result.totalTaxAmount += stat.totalTaxAmount || 0;
    
    if (stat._id === 'Draft') {
      result.draftReturns = stat.count;
    } else if (stat._id === 'Filed') {
      result.filedReturns = stat.count;
    }
  });
  
  res.status(200).json({
    success: true,
    data: result
  });
});