/**
 * GST ITC (Input Tax Credit) Controller
 * Handles ITC eligibility, verification, and claim management
 */

const ITC = require('../../models/gst/itc.model');
const GSTInvoice = require('../../models/gst/invoice.model');
const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');

/**
 * Get all ITC records with filtering and pagination
 */
exports.getITCRecords = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  // Build filter object
  const filter = { tenant: req.tenant._id };
  
  // Status filters
  if (req.query.eligibilityStatus) {
    filter.eligibilityStatus = req.query.eligibilityStatus;
  }

  if (req.query.claimStatus) {
    filter.claimStatus = req.query.claimStatus;
  }

  if (req.query.itcType) {
    filter.itcType = req.query.itcType;
  }

  if (req.query.gstrMatchingStatus) {
    filter.gstrMatchingStatus = req.query.gstrMatchingStatus;
  }

  // Date range filter
  if (req.query.startDate && req.query.endDate) {
    filter.createdAt = {
      $gte: new Date(req.query.startDate),
      $lte: new Date(req.query.endDate),
    };
  }

  // Return period filter
  if (req.query.month && req.query.year) {
    filter['claimPeriod.month'] = parseInt(req.query.month, 10);
    filter['claimPeriod.year'] = parseInt(req.query.year, 10);
  }

  // Execute query with pagination
  const itcRecords = await ITC.find(filter)
    .populate({
      path: 'invoice',
      select: 'invoiceNumber invoiceDate vendorName totalAmount',
    })
    .populate({
      path: 'createdBy',
      select: 'name email',
    })
    .populate({
      path: 'verificationDetails.verifiedBy',
      select: 'name email',
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  // Get total count for pagination
  const total = await ITC.countDocuments(filter);

  res.status(200).json({
    status: 'success',
    results: itcRecords.length,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    data: {
      itcRecords,
    },
  });
});

/**
 * Get ITC record by ID
 */
exports.getITCById = catchAsync(async (req, res, next) => {
  const itcRecord = await ITC.findOne({
    _id: req.params.id,
    tenant: req.tenant._id,
  })
    .populate({
      path: 'invoice',
      select: 'invoiceNumber invoiceDate vendorName vendorGSTIN totalAmount items',
    })
    .populate({
      path: 'createdBy',
      select: 'name email',
    })
    .populate({
      path: 'updatedBy',
      select: 'name email',
    })
    .populate({
      path: 'verificationDetails.verifiedBy',
      select: 'name email',
    })
    .populate({
      path: 'claimReturn',
      select: 'returnType period status',
    })
    .populate({
      path: 'reversalDetails.reversalReturn',
      select: 'returnType period status',
    });

  if (!itcRecord) {
    return next(new AppError('ITC record not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      itcRecord,
    },
  });
});

/**
 * Create ITC record for an invoice
 */
exports.createITCRecord = catchAsync(async (req, res, next) => {
  // Find the invoice
  const invoice = await GSTInvoice.findOne({
    _id: req.params.invoiceId,
    tenant: req.tenant._id,
  });

  if (!invoice) {
    return next(new AppError('Invoice not found', 404));
  }

  // Check if invoice is eligible for ITC
  if (invoice.invoiceType !== 'PURCHASE') {
    return next(new AppError('Only purchase invoices can have ITC', 400));
  }

  // Check if ITC record already exists
  const existingITC = await ITC.findOne({
    invoice: invoice._id,
    tenant: req.tenant._id,
  });

  if (existingITC) {
    return next(new AppError('ITC record already exists for this invoice', 400));
  }

  // Validate ITC type
  if (!req.body.itcType) {
    return next(new AppError('ITC type is required', 400));
  }

  // Calculate eligible amounts based on request or default to invoice amounts
  const eligibleAmount = req.body.eligibleAmount || invoice.taxableAmount;
  const cgstEligible = req.body.cgstEligible || invoice.cgstAmount;
  const sgstEligible = req.body.sgstEligible || invoice.sgstAmount;
  const igstEligible = req.body.igstEligible || invoice.igstAmount;
  const cessEligible = req.body.cessEligible || invoice.cessAmount || 0;

  // Calculate ineligible amounts
  const ineligibleAmount = invoice.taxableAmount - eligibleAmount;
  const cgstIneligible = invoice.cgstAmount - cgstEligible;
  const sgstIneligible = invoice.sgstAmount - sgstEligible;
  const igstIneligible = invoice.igstAmount - igstEligible;
  const cessIneligible = (invoice.cessAmount || 0) - cessEligible;

  // Create ITC record
  const itcRecord = new ITC({
    tenant: req.tenant._id,
    invoice: invoice._id,
    eligibilityStatus: req.body.eligibilityStatus || 'PENDING_VERIFICATION',
    claimStatus: 'NOT_CLAIMED',
    itcType: req.body.itcType,
    
    // Eligible amounts
    eligibleAmount,
    cgstEligible,
    sgstEligible,
    igstEligible,
    cessEligible,
    
    // Ineligible amounts
    ineligibleAmount,
    cgstIneligible,
    sgstIneligible,
    igstIneligible,
    cessIneligible,
    
    // Ineligibility reason if applicable
    ineligibilityReason: req.body.ineligibilityReason,
    
    // Notes
    notes: req.body.notes,
    
    // Creator tracking
    createdBy: req.user._id,
    updatedBy: req.user._id,
  });

  await itcRecord.save();

  // Update invoice with ITC details
  invoice.itc = {
    eligibilityStatus: itcRecord.eligibilityStatus,
    claimStatus: itcRecord.claimStatus,
    eligibleAmount: itcRecord.eligibleAmount,
    claimedAmount: 0,
  };

  await invoice.save();

  res.status(201).json({
    status: 'success',
    message: 'ITC record created successfully',
    data: {
      itcRecord,
    },
  });
});

/**
 * Update ITC eligibility
 */
exports.updateITCEligibility = catchAsync(async (req, res, next) => {
  // Find the ITC record
  const itcRecord = await ITC.findOne({
    _id: req.params.id,
    tenant: req.tenant._id,
  });

  if (!itcRecord) {
    return next(new AppError('ITC record not found', 404));
  }

  // Check if ITC can be updated
  if (itcRecord.claimStatus === 'CLAIMED') {
    return next(new AppError('Cannot update eligibility for already claimed ITC', 400));
  }

  // Validate eligibility status
  if (!req.body.eligibilityStatus) {
    return next(new AppError('Eligibility status is required', 400));
  }

  // Update ITC type if provided
  if (req.body.itcType) {
    itcRecord.itcType = req.body.itcType;
  }

  // Update eligibility status
  itcRecord.eligibilityStatus = req.body.eligibilityStatus;

  // Update eligible amounts if provided
  if (req.body.eligibleAmount !== undefined) itcRecord.eligibleAmount = req.body.eligibleAmount;
  if (req.body.cgstEligible !== undefined) itcRecord.cgstEligible = req.body.cgstEligible;
  if (req.body.sgstEligible !== undefined) itcRecord.sgstEligible = req.body.sgstEligible;
  if (req.body.igstEligible !== undefined) itcRecord.igstEligible = req.body.igstEligible;
  if (req.body.cessEligible !== undefined) itcRecord.cessEligible = req.body.cessEligible;

  // Update ineligible amounts
  const invoice = await GSTInvoice.findById(itcRecord.invoice);
  if (invoice) {
    itcRecord.ineligibleAmount = invoice.taxableAmount - itcRecord.eligibleAmount;
    itcRecord.cgstIneligible = invoice.cgstAmount - itcRecord.cgstEligible;
    itcRecord.sgstIneligible = invoice.sgstAmount - itcRecord.sgstEligible;
    itcRecord.igstIneligible = invoice.igstAmount - itcRecord.igstEligible;
    itcRecord.cessIneligible = (invoice.cessAmount || 0) - itcRecord.cessEligible;
  }

  // Update ineligibility reason if applicable
  if (req.body.ineligibilityReason) {
    itcRecord.ineligibilityReason = req.body.ineligibilityReason;
  }

  // Update notes if provided
  if (req.body.notes) {
    itcRecord.notes = req.body.notes;
  }

  itcRecord.updatedBy = req.user._id;
  await itcRecord.save();

  res.status(200).json({
    status: 'success',
    message: 'ITC eligibility updated successfully',
    data: {
      itcRecord,
    },
  });
});

/**
 * Verify ITC record
 */
exports.verifyITC = catchAsync(async (req, res, next) => {
  // Find the ITC record
  const itcRecord = await ITC.findOne({
    _id: req.params.id,
    tenant: req.tenant._id,
  });

  if (!itcRecord) {
    return next(new AppError('ITC record not found', 404));
  }

  // Update verification details
  itcRecord.verificationDetails = {
    isVerified: true,
    verificationDate: new Date(),
    verificationRemarks: req.body.verificationRemarks || 'Verified',
    verifiedBy: req.user._id,
  };

  // Update eligibility status if pending verification
  if (itcRecord.eligibilityStatus === 'PENDING_VERIFICATION') {
    itcRecord.eligibilityStatus = req.body.eligibilityStatus || 'ELIGIBLE';
  }

  itcRecord.updatedBy = req.user._id;
  await itcRecord.save();

  res.status(200).json({
    status: 'success',
    message: 'ITC verified successfully',
    data: {
      itcRecord,
    },
  });
});

/**
 * Update GSTR-2A/2B matching status
 */
exports.updateGSTRMatchingStatus = catchAsync(async (req, res, next) => {
  // Find the ITC record
  const itcRecord = await ITC.findOne({
    _id: req.params.id,
    tenant: req.tenant._id,
  });

  if (!itcRecord) {
    return next(new AppError('ITC record not found', 404));
  }

  // Validate matching status
  if (!req.body.gstrMatchingStatus) {
    return next(new AppError('GSTR matching status is required', 400));
  }

  // Update GSTR matching status
  itcRecord.gstrMatchingStatus = req.body.gstrMatchingStatus;

  // Update GSTR details
  itcRecord.gstrDetails = {
    isAvailableIn2A: req.body.isAvailableIn2A || false,
    isAvailableIn2B: req.body.isAvailableIn2B || false,
    matchedDate: new Date(),
    invoiceValueIn2A: req.body.invoiceValueIn2A,
    taxValueIn2A: req.body.taxValueIn2A,
    invoiceValueIn2B: req.body.invoiceValueIn2B,
    taxValueIn2B: req.body.taxValueIn2B,
    mismatchRemarks: req.body.mismatchRemarks,
  };

  itcRecord.updatedBy = req.user._id;
  await itcRecord.save();

  res.status(200).json({
    status: 'success',
    message: 'GSTR matching status updated successfully',
    data: {
      itcRecord,
    },
  });
});

/**
 * Mark ITC as claimed in return
 */
exports.markITCAsClaimed = catchAsync(async (req, res, next) => {
  // Find the ITC record
  const itcRecord = await ITC.findOne({
    _id: req.params.id,
    tenant: req.tenant._id,
  });

  if (!itcRecord) {
    return next(new AppError('ITC record not found', 404));
  }

  // Check if ITC is eligible for claiming
  if (!['ELIGIBLE', 'PARTIAL'].includes(itcRecord.eligibilityStatus)) {
    return next(new AppError(`ITC with ${itcRecord.eligibilityStatus} status cannot be claimed`, 400));
  }

  // Validate claim period
  if (!req.body.month || !req.body.year) {
    return next(new AppError('Claim period (month and year) is required', 400));
  }

  // Validate claim return
  if (!req.body.claimReturn) {
    return next(new AppError('Claim return reference is required', 400));
  }

  // Validate claimed amounts
  if (!req.body.claimedAmount) {
    return next(new AppError('Claimed amount is required', 400));
  }

  // Update claim status and amounts
  const totalEligible = itcRecord.cgstEligible + itcRecord.sgstEligible + itcRecord.igstEligible + itcRecord.cessEligible;
  const totalClaimed = req.body.cgstClaimed + req.body.sgstClaimed + req.body.igstClaimed + req.body.cessClaimed;

  itcRecord.claimStatus = totalClaimed >= totalEligible ? 'CLAIMED' : 'PARTIALLY_CLAIMED';
  itcRecord.claimedAmount = req.body.claimedAmount;
  itcRecord.cgstClaimed = req.body.cgstClaimed || 0;
  itcRecord.sgstClaimed = req.body.sgstClaimed || 0;
  itcRecord.igstClaimed = req.body.igstClaimed || 0;
  itcRecord.cessClaimed = req.body.cessClaimed || 0;

  // Update claim period and return reference
  itcRecord.claimPeriod = {
    month: req.body.month,
    year: req.body.year,
  };
  itcRecord.claimReturn = req.body.claimReturn;

  itcRecord.updatedBy = req.user._id;
  await itcRecord.save();

  // Update invoice ITC claim status
  const invoice = await GSTInvoice.findById(itcRecord.invoice);
  if (invoice) {
    invoice.itc.claimStatus = itcRecord.claimStatus;
    invoice.itc.claimedAmount = itcRecord.claimedAmount;
    await invoice.save();
  }

  res.status(200).json({
    status: 'success',
    message: 'ITC marked as claimed successfully',
    data: {
      itcRecord,
    },
  });
});

/**
 * Reverse ITC
 */
exports.reverseITC = catchAsync(async (req, res, next) => {
  // Find the ITC record
  const itcRecord = await ITC.findOne({
    _id: req.params.id,
    tenant: req.tenant._id,
  });

  if (!itcRecord) {
    return next(new AppError('ITC record not found', 404));
  }

  // Check if ITC can be reversed
  if (!['CLAIMED', 'PARTIALLY_CLAIMED'].includes(itcRecord.claimStatus)) {
    return next(new AppError('Only claimed ITC can be reversed', 400));
  }

  // Validate reversal reason
  if (!req.body.reversalReason) {
    return next(new AppError('Reversal reason is required', 400));
  }

  // Validate reversal amounts
  if (!req.body.reversalAmount) {
    return next(new AppError('Reversal amount is required', 400));
  }

  // Update reversal details
  itcRecord.reversalDetails = {
    isReversed: true,
    reversalDate: new Date(),
    reversalReason: req.body.reversalReason,
    reversalAmount: req.body.reversalAmount,
    cgstReversed: req.body.cgstReversed || 0,
    sgstReversed: req.body.sgstReversed || 0,
    igstReversed: req.body.igstReversed || 0,
    cessReversed: req.body.cessReversed || 0,
    reversalRemarks: req.body.reversalRemarks,
    reversalReturn: req.body.reversalReturn,
  };

  // Update eligibility status
  itcRecord.eligibilityStatus = 'REVERSED';

  itcRecord.updatedBy = req.user._id;
  await itcRecord.save();

  // Update invoice ITC status
  const invoice = await GSTInvoice.findById(itcRecord.invoice);
  if (invoice) {
    invoice.itc.eligibilityStatus = 'REVERSED';
    await invoice.save();
  }

  res.status(200).json({
    status: 'success',
    message: 'ITC reversed successfully',
    data: {
      itcRecord,
    },
  });
});

/**
 * Get ITC statistics
 */
exports.getITCStats = catchAsync(async (req, res, next) => {
  // Get eligibility status stats
  const eligibilityStats = await ITC.aggregate([
    {
      $match: { tenant: req.tenant._id },
    },
    {
      $group: {
        _id: '$eligibilityStatus',
        count: { $sum: 1 },
        totalEligibleAmount: { $sum: '$eligibleAmount' },
        totalCGST: { $sum: '$cgstEligible' },
        totalSGST: { $sum: '$sgstEligible' },
        totalIGST: { $sum: '$igstEligible' },
        totalCess: { $sum: '$cessEligible' },
      },
    },
  ]);

  // Get claim status stats
  const claimStats = await ITC.aggregate([
    {
      $match: { tenant: req.tenant._id },
    },
    {
      $group: {
        _id: '$claimStatus',
        count: { $sum: 1 },
        totalClaimedAmount: { $sum: '$claimedAmount' },
        totalCGSTClaimed: { $sum: '$cgstClaimed' },
        totalSGSTClaimed: { $sum: '$sgstClaimed' },
        totalIGSTClaimed: { $sum: '$igstClaimed' },
        totalCessClaimed: { $sum: '$cessClaimed' },
      },
    },
  ]);

  // Get ITC type stats
  const typeStats = await ITC.aggregate([
    {
      $match: { tenant: req.tenant._id },
    },
    {
      $group: {
        _id: '$itcType',
        count: { $sum: 1 },
        totalEligibleAmount: { $sum: '$eligibleAmount' },
      },
    },
  ]);

  // Get GSTR matching stats
  const gstrStats = await ITC.aggregate([
    {
      $match: { tenant: req.tenant._id },
    },
    {
      $group: {
        _id: '$gstrMatchingStatus',
        count: { $sum: 1 },
      },
    },
  ]);

  // Get monthly trends
  const monthlyTrends = await ITC.aggregate([
    {
      $match: { tenant: req.tenant._id },
    },
    {
      $group: {
        _id: {
          month: { $month: '$createdAt' },
          year: { $year: '$createdAt' },
        },
        count: { $sum: 1 },
        totalEligibleAmount: { $sum: '$eligibleAmount' },
        totalClaimedAmount: { $sum: '$claimedAmount' },
      },
    },
    {
      $sort: {
        '_id.year': 1,
        '_id.month': 1,
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      eligibilityStats,
      claimStats,
      typeStats,
      gstrStats,
      monthlyTrends,
    },
  });
});

/**
 * Bulk update ITC eligibility
 */
exports.bulkUpdateITCEligibility = catchAsync(async (req, res, next) => {
  // Validate request body
  if (!req.body.ids || !Array.isArray(req.body.ids) || req.body.ids.length === 0) {
    return next(new AppError('ITC record IDs are required', 400));
  }

  if (!req.body.eligibilityStatus) {
    return next(new AppError('Eligibility status is required', 400));
  }

  // Update multiple ITC records
  const result = await ITC.updateMany(
    {
      _id: { $in: req.body.ids },
      tenant: req.tenant._id,
      claimStatus: { $ne: 'CLAIMED' }, // Skip already claimed ITC
    },
    {
      $set: {
        eligibilityStatus: req.body.eligibilityStatus,
        updatedBy: req.user._id,
      },
    }
  );

  // Update invoice ITC status for all affected invoices
  const itcRecords = await ITC.find({
    _id: { $in: req.body.ids },
    tenant: req.tenant._id,
  });

  for (const record of itcRecords) {
    await GSTInvoice.findByIdAndUpdate(record.invoice, {
      'itc.eligibilityStatus': req.body.eligibilityStatus,
    });
  }

  res.status(200).json({
    status: 'success',
    message: `${result.nModified} ITC records updated successfully`,
    data: {
      modifiedCount: result.nModified,
    },
  });
});

/**
 * Bulk mark ITC as claimed
 */
exports.bulkMarkITCAsClaimed = catchAsync(async (req, res, next) => {
  // Validate request body
  if (!req.body.ids || !Array.isArray(req.body.ids) || req.body.ids.length === 0) {
    return next(new AppError('ITC record IDs are required', 400));
  }

  if (!req.body.month || !req.body.year) {
    return next(new AppError('Claim period (month and year) is required', 400));
  }

  if (!req.body.claimReturn) {
    return next(new AppError('Claim return reference is required', 400));
  }

  // Get eligible ITC records
  const eligibleRecords = await ITC.find({
    _id: { $in: req.body.ids },
    tenant: req.tenant._id,
    eligibilityStatus: { $in: ['ELIGIBLE', 'PARTIAL'] },
    claimStatus: { $ne: 'CLAIMED' },
  });

  if (eligibleRecords.length === 0) {
    return next(new AppError('No eligible ITC records found', 404));
  }

  // Update each record individually to handle claimed amounts correctly
  const updatedRecords = [];
  for (const record of eligibleRecords) {
    record.claimStatus = 'CLAIMED';
    record.claimedAmount = record.eligibleAmount;
    record.cgstClaimed = record.cgstEligible;
    record.sgstClaimed = record.sgstEligible;
    record.igstClaimed = record.igstEligible;
    record.cessClaimed = record.cessEligible;
    record.claimPeriod = {
      month: req.body.month,
      year: req.body.year,
    };
    record.claimReturn = req.body.claimReturn;
    record.updatedBy = req.user._id;

    await record.save();
    updatedRecords.push(record);

    // Update invoice ITC claim status
    await GSTInvoice.findByIdAndUpdate(record.invoice, {
      'itc.claimStatus': 'CLAIMED',
      'itc.claimedAmount': record.claimedAmount,
    });
  }

  res.status(200).json({
    status: 'success',
    message: `${updatedRecords.length} ITC records marked as claimed successfully`,
    data: {
      modifiedCount: updatedRecords.length,
    },
  });
});