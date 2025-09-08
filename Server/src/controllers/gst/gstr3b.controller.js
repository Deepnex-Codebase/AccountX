/**
 * GSTR-3B Controller
 * Handles API requests for GSTR-3B return filing operations
 */

const GSTR3B = require('../../models/gst/gstr3b.model');
const PurchaseInvoice = require('../../models/gst/purchaseInvoice.model');
const SalesInvoice = require('../../models/gst/salesInvoice.model');
const GSTRegistration = require('../../models/gst/gstRegistration.model');
const { asyncHandler, AppError } = require('../../utils/appError');

/**
 * @desc    Create a new GSTR-3B return
 * @route   POST /api/v1/gst/gstr3b
 * @access  Private (Requires authentication and authorization)
 */
exports.createGSTR3B = asyncHandler(async (req, res) => {
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
  
  // Check if GSTR-3B already exists for the given period and GSTIN
  const existingReturn = await GSTR3B.findOne({
    tenantId: req.user.tenantId,
    gstRegistrationId: req.body.gstRegistrationId,
    returnPeriod: req.body.returnPeriod
  });
  
  if (existingReturn) {
    return res.status(400).json({
      success: false,
      error: 'GSTR-3B return already exists for this period and GSTIN'
    });
  }
  
  // Create the GSTR-3B return
  const gstr3b = await GSTR3B.create(req.body);
  
  res.status(201).json({
    success: true,
    data: gstr3b
  });
});

/**
 * @desc    Get all GSTR-3B returns
 * @route   GET /api/v1/gst/gstr3b
 * @access  Private (Requires authentication and authorization)
 */
exports.getGSTR3BReturns = asyncHandler(async (req, res) => {
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
  
  // Find GSTR-3B returns with filters and pagination
  const gstr3bReturns = await GSTR3B.find(filter)
    .populate('gstRegistrationId', 'gstin legalName')
    .sort({ returnPeriod: -1 })
    .skip(skip)
    .limit(limit);
  
  // Get total count for pagination
  const total = await GSTR3B.countDocuments(filter);
  
  res.status(200).json({
    success: true,
    count: gstr3bReturns.length,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    },
    data: gstr3bReturns
  });
});

/**
 * @desc    Get GSTR-3B return by ID
 * @route   GET /api/v1/gst/gstr3b/:id
 * @access  Private (Requires authentication and authorization)
 */
exports.getGSTR3BById = asyncHandler(async (req, res) => {
  const gstr3b = await GSTR3B.findOne({
    _id: req.params.id,
    tenantId: req.user.tenantId
  }).populate('gstRegistrationId', 'gstin legalName stateCode');
  
  if (!gstr3b) {
    return res.status(404).json({
      success: false,
      error: 'GSTR-3B return not found'
    });
  }
  
  res.status(200).json({
    success: true,
    data: gstr3b
  });
});

/**
 * @desc    Update GSTR-3B return
 * @route   PUT /api/v1/gst/gstr3b/:id
 * @access  Private (Requires authentication and authorization)
 */
exports.updateGSTR3B = asyncHandler(async (req, res) => {
  // Find the GSTR-3B return first to check if it's already filed
  const existingReturn = await GSTR3B.findOne({
    _id: req.params.id,
    tenantId: req.user.tenantId
  });
  
  if (!existingReturn) {
    return res.status(404).json({
      success: false,
      error: 'GSTR-3B return not found'
    });
  }
  
  // Check if return is already filed
  if (existingReturn.status === 'Filed') {
    return res.status(400).json({
      success: false,
      error: 'Cannot update GSTR-3B return that has already been filed'
    });
  }
  
  // Update the return
  req.body.updatedBy = req.user._id;
  const gstr3b = await GSTR3B.findOneAndUpdate(
    { _id: req.params.id, tenantId: req.user.tenantId },
    req.body,
    { new: true, runValidators: true }
  );
  
  res.status(200).json({
    success: true,
    data: gstr3b
  });
});

/**
 * @desc    Delete GSTR-3B return
 * @route   DELETE /api/v1/gst/gstr3b/:id
 * @access  Private (Requires authentication and authorization)
 */
exports.deleteGSTR3B = asyncHandler(async (req, res) => {
  // Find the GSTR-3B return first to check if it's already filed
  const existingReturn = await GSTR3B.findOne({
    _id: req.params.id,
    tenantId: req.user.tenantId
  });
  
  if (!existingReturn) {
    return res.status(404).json({
      success: false,
      error: 'GSTR-3B return not found'
    });
  }
  
  // Check if return is already filed
  if (existingReturn.status === 'Filed') {
    return res.status(400).json({
      success: false,
      error: 'Cannot delete GSTR-3B return that has already been filed'
    });
  }
  
  // Delete the return
  await GSTR3B.findOneAndDelete({
    _id: req.params.id,
    tenantId: req.user.tenantId
  });
  
  res.status(200).json({
    success: true,
    data: {}
  });
});

/**
 * @desc    Populate GSTR-3B return with transaction data
 * @route   POST /api/v1/gst/gstr3b/:id/populate
 * @access  Private (Requires authentication and authorization)
 */
exports.populateGSTR3B = asyncHandler(async (req, res) => {
  // Find the GSTR-3B return
  const gstr3b = await GSTR3B.findOne({
    _id: req.params.id,
    tenantId: req.user.tenantId
  }).populate('gstRegistrationId');

  if (!gstr3b) {
    return res.status(404).json({
      success: false,
      error: 'GSTR-3B return not found'
    });
  }

  // Check if return is already filed
  if (gstr3b.status === 'Filed') {
    return res.status(400).json({
      success: false,
      error: 'Cannot populate GSTR-3B return that has already been filed'
    });
  }

  // Extract month and year from return period
  const [month, year] = gstr3b.returnPeriod.split('-');
  const startDate = new Date(`${year}-${month}-01`);
  const endDate = new Date(startDate);
  endDate.setMonth(endDate.getMonth() + 1);
  endDate.setDate(0); // Last day of the month

  // Find sales and purchase invoices for the period
  const salesInvoices = await SalesInvoice.find({
    tenantId: req.user.tenantId,
    gstin: gstr3b.gstRegistrationId.gstin,
    invoiceDate: { $gte: startDate, $lte: endDate },
    status: 'Issued'
  });

  const purchaseInvoices = await PurchaseInvoice.find({
    tenantId: req.user.tenantId,
    gstin: gstr3b.gstRegistrationId.gstin,
    invoiceDate: { $gte: startDate, $lte: endDate },
    status: { $in: ['Recorded', 'Verified'] },
    itcEligibility: { $ne: 'Ineligible' }
  });

  // Aggregate sales
  let outwardTaxable = { taxableValue: 0, igstAmount: 0, cgstAmount: 0, sgstAmount: 0, cessAmount: 0 };
  let outwardZero = { taxableValue: 0, igstAmount: 0, cgstAmount: 0, sgstAmount: 0, cessAmount: 0 };
  let outwardNil = { taxableValue: 0, igstAmount: 0, cgstAmount: 0, sgstAmount: 0, cessAmount: 0 };
  salesInvoices.forEach(inv => {
    if (inv.invoiceType === 'Export' || inv.invoiceType === 'SEZ') {
      outwardZero.taxableValue += inv.totalTaxableValue;
      outwardZero.igstAmount += inv.totalIgstAmount;
      outwardZero.cgstAmount += inv.totalCgstAmount;
      outwardZero.sgstAmount += inv.totalSgstAmount;
      outwardZero.cessAmount += inv.totalCessAmount;
    } else if (inv.totalTaxableValue === 0) {
      outwardNil.taxableValue += inv.totalInvoiceValue;
    } else {
      outwardTaxable.taxableValue += inv.totalTaxableValue;
      outwardTaxable.igstAmount += inv.totalIgstAmount;
      outwardTaxable.cgstAmount += inv.totalCgstAmount;
      outwardTaxable.sgstAmount += inv.totalSgstAmount;
      outwardTaxable.cessAmount += inv.totalCessAmount;
    }
  });

  // Aggregate purchase (ITC)
  let itcAvailable = { igstAmount: 0, cgstAmount: 0, sgstAmount: 0, cessAmount: 0 };
  purchaseInvoices.forEach(inv => {
    itcAvailable.igstAmount += inv.totalIgstAmount;
    itcAvailable.cgstAmount += inv.totalCgstAmount;
    itcAvailable.sgstAmount += inv.totalSgstAmount;
    itcAvailable.cessAmount += inv.totalCessAmount;
  });

  // Update GSTR-3B document
  gstr3b.outwardSupplies = {
    taxableOutward: outwardTaxable,
    zeroRated: outwardZero,
    nilRatedExempted: outwardNil,
    reverseCharge: { taxableValue: 0, igstAmount: 0, cgstAmount: 0, sgstAmount: 0, cessAmount: 0 },
    nonGst: { taxableValue: 0, igstAmount: 0, cgstAmount: 0, sgstAmount: 0, cessAmount: 0 }
  };
  gstr3b.eligibleItc = {
    available: {
      importOfGoods: { igstAmount: 0, cgstAmount: 0, sgstAmount: 0, cessAmount: 0 },
      importOfServices: { igstAmount: 0, cgstAmount: 0, sgstAmount: 0, cessAmount: 0 },
      reverseCharge: { igstAmount: 0, cgstAmount: 0, sgstAmount: 0, cessAmount: 0 },
      inwardFromIsd: { igstAmount: 0, cgstAmount: 0, sgstAmount: 0, cessAmount: 0 },
      allOther: itcAvailable
    },
    reversed: {
      asPerRules: { igstAmount: 0, cgstAmount: 0, sgstAmount: 0, cessAmount: 0 },
      others: { igstAmount: 0, cgstAmount: 0, sgstAmount: 0, cessAmount: 0 }
    },
    netAvailable: itcAvailable,
    ineligible: {
      asPerSection: { igstAmount: 0, cgstAmount: 0, sgstAmount: 0, cessAmount: 0 },
      others: { igstAmount: 0, cgstAmount: 0, sgstAmount: 0, cessAmount: 0 }
    }
  };
  gstr3b.status = 'In Progress';
  await gstr3b.save();

  res.status(200).json({
    success: true,
    message: 'GSTR-3B populated successfully',
    data: gstr3b
  });
});

/**
 * @desc    Calculate tax liability and ITC
 * @route   POST /api/v1/gst/gstr3b/:id/calculate
 * @access  Private (Requires authentication and authorization)
 */
exports.calculateGSTR3B = asyncHandler(async (req, res) => {
  // Find the GSTR-3B return
  const gstr3b = await GSTR3B.findOne({
    _id: req.params.id,
    tenantId: req.user.tenantId
  });

  if (!gstr3b) {
    return res.status(404).json({
      success: false,
      error: 'GSTR-3B return not found'
    });
  }

  // Check if return is already filed
  if (gstr3b.status === 'Filed') {
    return res.status(400).json({
      success: false,
      error: 'Cannot recalculate GSTR-3B return that has already been filed'
    });
  }

  // Calculate totals using model method
  gstr3b.calculateTotals();
  gstr3b.status = 'Ready for Review';
  gstr3b.updatedBy = req.user._id;
  await gstr3b.save();

  res.status(200).json({
    success: true,
    message: 'GSTR-3B calculation completed',
    data: gstr3b
  });
});

/**
 * @desc    Generate JSON for GSTR-3B filing
 * @route   GET /api/v1/gst/gstr3b/:id/json
 * @access  Private (Requires authentication and authorization)
 */
exports.generateGSTR3BJSON = asyncHandler(async (req, res) => {
  // Find the GSTR-3B return
  const gstr3b = await GSTR3B.findOne({
    _id: req.params.id,
    tenantId: req.user.tenantId
  }).populate('gstRegistrationId');
  
  if (!gstr3b) {
    return res.status(404).json({
      success: false,
      error: 'GSTR-3B return not found'
    });
  }
  
  // TODO: Implement JSON generation logic for GSTR-3B filing
  // For now, we'll return a placeholder JSON structure
  
  const gstr3bJSON = {
    gstin: gstr3b.gstRegistrationId.gstin,
    ret_period: gstr3b.returnPeriod,
    sup_details: {
      osup_det: {
        txval: gstr3b.outwardSupplies.taxableValue || 0,
        iamt: gstr3b.outwardSupplies.igstAmount || 0,
        camt: gstr3b.outwardSupplies.cgstAmount || 0,
        samt: gstr3b.outwardSupplies.sgstAmount || 0,
        csamt: gstr3b.outwardSupplies.cessAmount || 0
      },
      osup_zero: {
        txval: gstr3b.outwardSupplies.zeroRated || 0,
        iamt: 0,
        csamt: 0
      },
      osup_nil_exmp: {
        txval: gstr3b.outwardSupplies.nilRated || 0
      },
      isup_rev: {
        txval: gstr3b.inwardSupplies.reverseCharge.taxableValue || 0,
        iamt: gstr3b.inwardSupplies.reverseCharge.igstAmount || 0,
        camt: gstr3b.inwardSupplies.reverseCharge.cgstAmount || 0,
        samt: gstr3b.inwardSupplies.reverseCharge.sgstAmount || 0,
        csamt: gstr3b.inwardSupplies.reverseCharge.cessAmount || 0
      }
    },
    itc_elg: {
      itc_avl: [
        {
          ty: 'IMPG',
          iamt: gstr3b.itcAvailed.imports.goods.igstAmount || 0,
          csamt: gstr3b.itcAvailed.imports.goods.cessAmount || 0
        },
        {
          ty: 'IMPS',
          iamt: gstr3b.itcAvailed.imports.services.igstAmount || 0,
          csamt: gstr3b.itcAvailed.imports.services.cessAmount || 0
        },
        {
          ty: 'ISRC',
          iamt: gstr3b.itcAvailed.inwardReverse.igstAmount || 0,
          camt: gstr3b.itcAvailed.inwardReverse.cgstAmount || 0,
          samt: gstr3b.itcAvailed.inwardReverse.sgstAmount || 0,
          csamt: gstr3b.itcAvailed.inwardReverse.cessAmount || 0
        },
        {
          ty: 'ISD',
          iamt: gstr3b.itcAvailed.inwardISD.igstAmount || 0,
          camt: gstr3b.itcAvailed.inwardISD.cgstAmount || 0,
          samt: gstr3b.itcAvailed.inwardISD.sgstAmount || 0,
          csamt: gstr3b.itcAvailed.inwardISD.cessAmount || 0
        },
        {
          ty: 'OTH',
          iamt: gstr3b.itcAvailed.inwardDomestic.igstAmount || 0,
          camt: gstr3b.itcAvailed.inwardDomestic.cgstAmount || 0,
          samt: gstr3b.itcAvailed.inwardDomestic.sgstAmount || 0,
          csamt: gstr3b.itcAvailed.inwardDomestic.cessAmount || 0
        }
      ]
    }
  };
  
  res.status(200).json({
    success: true,
    data: gstr3bJSON
  });
});

/**
 * @desc    Mark GSTR-3B as filed
 * @route   PATCH /api/v1/gst/gstr3b/:id/mark-filed
 * @access  Private (Requires authentication and authorization)
 */
exports.markGSTR3BFiled = asyncHandler(async (req, res) => {
  // Validate request body
  if (!req.body.acknowledgementNumber || !req.body.acknowledgementDate) {
    return res.status(400).json({
      success: false,
      error: 'Acknowledgement number and date are required'
    });
  }
  
  // Update filed status
  const gstr3b = await GSTR3B.findOneAndUpdate(
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
  
  if (!gstr3b) {
    return res.status(404).json({
      success: false,
      error: 'GSTR-3B return not found'
    });
  }
  
  res.status(200).json({
    success: true,
    data: gstr3b
  });
});

/**
 * @desc    Get GSTR-3B summary statistics
 * @route   GET /api/v1/gst/gstr3b/statistics
 * @access  Private (Requires authentication and authorization)
 */
exports.getGSTR3BStatistics = asyncHandler(async (req, res) => {
  // Get financial year from query params or default to current financial year
  const today = new Date();
  const currentMonth = today.getMonth() + 1;
  const currentYear = today.getFullYear();
  const defaultFY = currentMonth >= 4 
    ? `${currentYear}-${(currentYear + 1).toString().substr(2, 2)}` 
    : `${currentYear - 1}-${currentYear.toString().substr(2, 2)}`;
  
  const financialYear = req.query.financialYear || defaultFY;
  
  // Aggregate statistics
  const statistics = await GSTR3B.aggregate([
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
        totalTaxLiability: { $sum: '$totalTaxLiability' },
        totalITC: { $sum: '$totalITC' },
        totalPayable: { $sum: '$totalPayable' }
      }
    }
  ]);
  
  // Format response
  const result = {
    financialYear,
    totalReturns: 0,
    draftReturns: 0,
    filedReturns: 0,
    totalTaxLiability: 0,
    totalITC: 0,
    totalPayable: 0
  };
  
  statistics.forEach(stat => {
    result.totalReturns += stat.count;
    result.totalTaxLiability += stat.totalTaxLiability || 0;
    result.totalITC += stat.totalITC || 0;
    result.totalPayable += stat.totalPayable || 0;
    
    if (stat._id === 'Draft' || stat._id === 'Ready for Review') {
      result.draftReturns += stat.count;
    } else if (stat._id === 'Filed') {
      result.filedReturns = stat.count;
    }
  });
  
  res.status(200).json({
    success: true,
    data: result
  });
});