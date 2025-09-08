/**
 * GST E-Way Bill Controller
 * Handles e-way bill generation, extension, verification and cancellation
 */

const EWayBill = require('../../models/gst/ewaybill.model');
const GSTInvoice = require('../../models/gst/invoice.model');
const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');

/**
 * Get all e-way bills with filtering and pagination
 */
exports.getEWayBills = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  // Build filter object
  const filter = { tenant: req.tenant._id };
  
  // Status filter
  if (req.query.status) {
    filter.status = req.query.status;
  }

  // Date range filter
  if (req.query.startDate && req.query.endDate) {
    filter.createdAt = {
      $gte: new Date(req.query.startDate),
      $lte: new Date(req.query.endDate),
    };
  }

  // Document number filter
  if (req.query.documentNumber) {
    filter.documentNumber = { $regex: req.query.documentNumber, $options: 'i' };
  }

  // EWB number filter
  if (req.query.ewbNumber) {
    filter.ewbNumber = req.query.ewbNumber;
  }

  // Invoice reference filter
  if (req.query.invoice) {
    filter.invoice = req.query.invoice;
  }

  // Execute query with pagination
  const ewaybills = await EWayBill.find(filter)
    .populate({
      path: 'invoice',
      select: 'invoiceNumber invoiceDate customerName totalAmount',
    })
    .populate({
      path: 'createdBy',
      select: 'name email',
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  // Get total count for pagination
  const total = await EWayBill.countDocuments(filter);

  res.status(200).json({
    status: 'success',
    results: ewaybills.length,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    data: {
      ewaybills,
    },
  });
});

/**
 * Get e-way bill by ID
 */
exports.getEWayBillById = catchAsync(async (req, res, next) => {
  const ewaybill = await EWayBill.findOne({
    _id: req.params.id,
    tenant: req.tenant._id,
  })
    .populate({
      path: 'invoice',
      select: 'invoiceNumber invoiceDate customerName totalAmount items',
    })
    .populate({
      path: 'createdBy',
      select: 'name email',
    });

  if (!ewaybill) {
    return next(new AppError('E-way bill not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      ewaybill,
    },
  });
});

/**
 * Generate e-way bill from invoice
 */
exports.generateEWayBillFromInvoice = catchAsync(async (req, res, next) => {
  // Find the invoice
  const invoice = await GSTInvoice.findOne({
    _id: req.params.invoiceId,
    tenant: req.tenant._id,
  });

  if (!invoice) {
    return next(new AppError('Invoice not found', 404));
  }

  // Check if invoice is eligible for e-way bill
  if (invoice.invoiceType !== 'SALES') {
    return next(new AppError('Only sales invoices can have e-way bills', 400));
  }

  // Check if e-way bill already exists for this invoice
  let ewaybill = await EWayBill.findOne({
    invoice: invoice._id,
    tenant: req.tenant._id,
    status: { $in: ['PENDING', 'GENERATED'] },
  });

  if (ewaybill) {
    return next(new AppError(`E-way bill already ${ewaybill.status.toLowerCase()} for this invoice`, 400));
  }

  // Validate transport details from request body
  if (!req.body.transportMode) {
    return next(new AppError('Transport mode is required', 400));
  }

  if (req.body.transportMode === 'Road' && !req.body.vehicleNumber) {
    return next(new AppError('Vehicle number is required for road transport', 400));
  }

  if (req.body.transportMode !== 'Road' && (!req.body.documentNumber || !req.body.documentDate)) {
    return next(new AppError('Document number and date are required for non-road transport', 400));
  }

  if (!req.body.distance) {
    return next(new AppError('Distance is required', 400));
  }

  // Create e-way bill from invoice data
  ewaybill = new EWayBill({
    tenant: req.tenant._id,
    invoice: invoice._id,
    status: 'PENDING',
    
    // Document details
    documentType: 'INV',
    documentNumber: invoice.invoiceNumber,
    documentDate: invoice.invoiceDate,
    
    // Transaction type and supply type
    transactionType: 'Regular',
    supplyType: 'Outward',
    subSupplyType: req.body.subSupplyType || 'Supply',
    
    // From details (seller)
    fromGSTIN: invoice.sellerGSTIN,
    fromTraderName: invoice.sellerLegalName,
    fromAddress: invoice.sellerAddress,
    fromPlace: invoice.sellerCity,
    fromPincode: invoice.sellerPincode,
    fromStateCode: invoice.sellerStateCode,
    
    // To details (customer)
    toGSTIN: invoice.customerGSTIN,
    toTraderName: invoice.customerName,
    toAddress: invoice.customerAddress,
    toPlace: invoice.customerCity,
    toPincode: invoice.customerPincode,
    toStateCode: invoice.customerStateCode,
    
    // Items from invoice
    items: invoice.items.map(item => ({
      productName: item.description,
      description: item.description,
      hsnCode: item.hsnCode,
      quantity: item.quantity,
      unit: item.unit,
      taxableValue: item.taxableValue,
      taxRate: item.taxRate,
      cgstAmount: item.cgstAmount,
      sgstAmount: item.sgstAmount,
      igstAmount: item.igstAmount,
      cessAmount: item.cessAmount,
    })),
    
    // Transport details from request body
    transporterName: req.body.transporterName,
    transporterId: req.body.transporterId,
    transportMode: req.body.transportMode,
    vehicleType: req.body.vehicleType || 'Regular',
    vehicleNumber: req.body.vehicleNumber,
    documentNumber: req.body.documentNumber,
    documentDate: req.body.documentDate,
    
    // Distance and transaction value
    distance: req.body.distance,
    transactionValue: invoice.totalAmount,
    
    // Tracking
    generationAttempts: 1,
    lastAttemptDate: new Date(),
    createdBy: req.user._id,
    updatedBy: req.user._id,
  });

  // Prepare request payload for EWB API
  const requestPayload = prepareEWayBillRequestPayload(ewaybill);
  ewaybill.requestPayload = requestPayload;

  await ewaybill.save();

  // Simulate EWB API call
  try {
    // Simulate successful response
    const ewbResponse = simulateEWBResponse();

    // Update e-way bill with response data
    ewaybill.status = 'GENERATED';
    ewaybill.ewbNumber = ewbResponse.ewbNo;
    ewaybill.ewbDate = new Date();
    ewaybill.validUntil = new Date(Date.now() + 24 * 60 * 60 * 1000); // Valid for 1 day (for simulation)
    ewaybill.responsePayload = ewbResponse;
    ewaybill.updatedBy = req.user._id;

    await ewaybill.save();

    // Update invoice with e-way bill details
    invoice.ewaybill = {
      status: 'GENERATED',
      ewbNumber: ewbResponse.ewbNo,
      ewbDate: new Date(),
      validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000),
    };

    await invoice.save();

    res.status(200).json({
      status: 'success',
      message: 'E-way bill generated successfully',
      data: {
        ewaybill,
      },
    });
  } catch (error) {
    // Handle EWB API error
    ewaybill.status = 'FAILED';
    ewaybill.errorDetails = {
      errorCode: error.code || 'UNKNOWN',
      errorMessage: error.message || 'Unknown error occurred',
      timestamp: new Date(),
    };
    await ewaybill.save();

    return next(new AppError(`E-way bill generation failed: ${error.message}`, 500));
  }
});

/**
 * Create e-way bill without invoice
 */
exports.createEWayBill = catchAsync(async (req, res, next) => {
  // Validate required fields
  const requiredFields = [
    'documentType', 'documentNumber', 'documentDate', 'supplyType', 'subSupplyType',
    'fromGSTIN', 'fromTraderName', 'fromAddress', 'fromPlace', 'fromPincode', 'fromStateCode',
    'toTraderName', 'toAddress', 'toPlace', 'toPincode', 'toStateCode',
    'transportMode', 'distance', 'transactionValue'
  ];

  for (const field of requiredFields) {
    if (!req.body[field]) {
      return next(new AppError(`${field} is required`, 400));
    }
  }

  // Validate transport details
  if (req.body.transportMode === 'Road' && !req.body.vehicleNumber) {
    return next(new AppError('Vehicle number is required for road transport', 400));
  }

  if (req.body.transportMode !== 'Road' && (!req.body.documentNumber || !req.body.documentDate)) {
    return next(new AppError('Document number and date are required for non-road transport', 400));
  }

  // Validate items
  if (!req.body.items || !Array.isArray(req.body.items) || req.body.items.length === 0) {
    return next(new AppError('At least one item is required', 400));
  }

  // Create e-way bill
  const ewaybill = new EWayBill({
    tenant: req.tenant._id,
    status: 'PENDING',
    ...req.body,
    generationAttempts: 1,
    lastAttemptDate: new Date(),
    createdBy: req.user._id,
    updatedBy: req.user._id,
  });

  // Prepare request payload for EWB API
  const requestPayload = prepareEWayBillRequestPayload(ewaybill);
  ewaybill.requestPayload = requestPayload;

  await ewaybill.save();

  // Simulate EWB API call
  try {
    // Simulate successful response
    const ewbResponse = simulateEWBResponse();

    // Update e-way bill with response data
    ewaybill.status = 'GENERATED';
    ewaybill.ewbNumber = ewbResponse.ewbNo;
    ewaybill.ewbDate = new Date();
    ewaybill.validUntil = new Date(Date.now() + 24 * 60 * 60 * 1000); // Valid for 1 day (for simulation)
    ewaybill.responsePayload = ewbResponse;
    ewaybill.updatedBy = req.user._id;

    await ewaybill.save();

    res.status(201).json({
      status: 'success',
      message: 'E-way bill generated successfully',
      data: {
        ewaybill,
      },
    });
  } catch (error) {
    // Handle EWB API error
    ewaybill.status = 'FAILED';
    ewaybill.errorDetails = {
      errorCode: error.code || 'UNKNOWN',
      errorMessage: error.message || 'Unknown error occurred',
      timestamp: new Date(),
    };
    await ewaybill.save();

    return next(new AppError(`E-way bill generation failed: ${error.message}`, 500));
  }
});

/**
 * Update e-way bill
 */
exports.updateEWayBill = catchAsync(async (req, res, next) => {
  // Find the e-way bill
  const ewaybill = await EWayBill.findOne({
    _id: req.params.id,
    tenant: req.tenant._id,
  });

  if (!ewaybill) {
    return next(new AppError('E-way bill not found', 404));
  }

  // Check if e-way bill can be updated
  if (ewaybill.status !== 'PENDING') {
    return next(new AppError(`E-way bill in ${ewaybill.status} status cannot be updated`, 400));
  }

  // Update allowed fields
  const allowedFields = [
    'transporterName', 'transporterId', 'transportMode', 'vehicleType',
    'vehicleNumber', 'documentNumber', 'documentDate', 'distance',
    'fromPlace', 'toPlace', 'subSupplyType'
  ];

  allowedFields.forEach(field => {
    if (req.body[field] !== undefined) {
      ewaybill[field] = req.body[field];
    }
  });

  // Update items if provided
  if (req.body.items && Array.isArray(req.body.items) && req.body.items.length > 0) {
    ewaybill.items = req.body.items;
  }

  ewaybill.updatedBy = req.user._id;
  await ewaybill.save();

  res.status(200).json({
    status: 'success',
    message: 'E-way bill updated successfully',
    data: {
      ewaybill,
    },
  });
});

/**
 * Cancel e-way bill
 */
exports.cancelEWayBill = catchAsync(async (req, res, next) => {
  // Validate request body
  if (!req.body.cancellationReason) {
    return next(new AppError('Cancellation reason is required', 400));
  }

  // Find the e-way bill
  const ewaybill = await EWayBill.findOne({
    _id: req.params.id,
    tenant: req.tenant._id,
  });

  if (!ewaybill) {
    return next(new AppError('E-way bill not found', 404));
  }

  // Check if e-way bill can be cancelled
  if (ewaybill.status !== 'GENERATED') {
    return next(new AppError(`E-way bill in ${ewaybill.status} status cannot be cancelled`, 400));
  }

  // Prepare cancellation request
  const cancellationRequest = {
    ewbNo: ewaybill.ewbNumber,
    cancelReason: req.body.cancellationReason,
    cancelRemarks: req.body.cancellationRemarks || '',
  };

  // Simulate EWB cancellation API call
  try {
    // Simulate successful cancellation
    const cancellationResponse = simulateCancellationResponse(ewaybill.ewbNumber);

    // Update e-way bill with cancellation details
    ewaybill.status = 'CANCELLED';
    ewaybill.cancellationReason = req.body.cancellationReason;
    ewaybill.cancellationRemarks = req.body.cancellationRemarks;
    ewaybill.cancelledDate = new Date();
    ewaybill.updatedBy = req.user._id;

    await ewaybill.save();

    // Update invoice e-way bill status if invoice exists
    if (ewaybill.invoice) {
      const invoice = await GSTInvoice.findById(ewaybill.invoice);
      if (invoice) {
        invoice.ewaybill.status = 'CANCELLED';
        await invoice.save();
      }
    }

    res.status(200).json({
      status: 'success',
      message: 'E-way bill cancelled successfully',
      data: {
        ewaybill,
      },
    });
  } catch (error) {
    // Handle EWB API error
    return next(new AppError(`E-way bill cancellation failed: ${error.message}`, 500));
  }
});

/**
 * Extend e-way bill validity
 */
exports.extendEWayBill = catchAsync(async (req, res, next) => {
  // Validate request body
  if (!req.body.extensionRemarks) {
    return next(new AppError('Extension remarks are required', 400));
  }

  if (req.body.transportMode === 'Road' && !req.body.vehicleNumber) {
    return next(new AppError('Vehicle number is required for extension', 400));
  }

  // Find the e-way bill
  const ewaybill = await EWayBill.findOne({
    _id: req.params.id,
    tenant: req.tenant._id,
  });

  if (!ewaybill) {
    return next(new AppError('E-way bill not found', 404));
  }

  // Check if e-way bill can be extended
  if (ewaybill.status !== 'GENERATED') {
    return next(new AppError(`E-way bill in ${ewaybill.status} status cannot be extended`, 400));
  }

  // Check if already extended
  if (ewaybill.isExtended) {
    return next(new AppError('E-way bill has already been extended once', 400));
  }

  // Check if e-way bill is about to expire (within 4 hours)
  const currentTime = new Date();
  const expiryTime = new Date(ewaybill.validUntil);
  const timeRemaining = expiryTime - currentTime;

  if (timeRemaining > 4 * 60 * 60 * 1000) {
    return next(new AppError('E-way bill can only be extended within 4 hours of expiry', 400));
  }

  // Prepare extension request
  const extensionRequest = {
    ewbNo: ewaybill.ewbNumber,
    vehicleNo: req.body.vehicleNumber || ewaybill.vehicleNumber,
    fromPlace: req.body.fromPlace || ewaybill.fromPlace,
    fromState: req.body.fromStateCode || ewaybill.fromStateCode,
    remainingDistance: req.body.remainingDistance || ewaybill.distance,
    transDocNo: req.body.documentNumber || ewaybill.documentNumber,
    transDocDate: req.body.documentDate || ewaybill.documentDate,
    transMode: req.body.transportMode || ewaybill.transportMode,
    vehicleType: req.body.vehicleType || ewaybill.vehicleType,
    extensionRemarks: req.body.extensionRemarks,
  };

  // Simulate EWB extension API call
  try {
    // Simulate successful extension
    const extensionResponse = simulateExtensionResponse(ewaybill.ewbNumber);

    // Update e-way bill with extension details
    ewaybill.isExtended = true;
    ewaybill.extensionRemarks = req.body.extensionRemarks;
    ewaybill.extensionDate = new Date();
    ewaybill.originalValidUntil = ewaybill.validUntil;
    ewaybill.validUntil = new Date(Date.now() + 24 * 60 * 60 * 1000); // Extended for 1 more day
    ewaybill.status = 'EXTENDED';
    ewaybill.updatedBy = req.user._id;

    // Update transport details if provided
    if (req.body.vehicleNumber) ewaybill.vehicleNumber = req.body.vehicleNumber;
    if (req.body.transportMode) ewaybill.transportMode = req.body.transportMode;
    if (req.body.fromPlace) ewaybill.fromPlace = req.body.fromPlace;
    if (req.body.fromStateCode) ewaybill.fromStateCode = req.body.fromStateCode;

    await ewaybill.save();

    // Update invoice e-way bill status if invoice exists
    if (ewaybill.invoice) {
      const invoice = await GSTInvoice.findById(ewaybill.invoice);
      if (invoice) {
        invoice.ewaybill.status = 'EXTENDED';
        invoice.ewaybill.validUntil = ewaybill.validUntil;
        await invoice.save();
      }
    }

    res.status(200).json({
      status: 'success',
      message: 'E-way bill extended successfully',
      data: {
        ewaybill,
      },
    });
  } catch (error) {
    // Handle EWB API error
    return next(new AppError(`E-way bill extension failed: ${error.message}`, 500));
  }
});

/**
 * Verify e-way bill with EWB portal
 */
exports.verifyEWayBill = catchAsync(async (req, res, next) => {
  const { ewbNumber } = req.params;

  // Find the e-way bill
  const ewaybill = await EWayBill.findOne({
    ewbNumber,
    tenant: req.tenant._id,
  });

  if (!ewaybill) {
    return next(new AppError('E-way bill with provided number not found', 404));
  }

  // Simulate EWB verification API call
  try {
    // Simulate successful verification
    const verificationResponse = {
      verified: true,
      status: ewaybill.status,
      ewbNumber: ewaybill.ewbNumber,
      ewbDate: ewaybill.ewbDate,
      validUntil: ewaybill.validUntil,
      isExtended: ewaybill.isExtended,
    };

    res.status(200).json({
      status: 'success',
      data: {
        verification: verificationResponse,
      },
    });
  } catch (error) {
    return next(new AppError(`E-way bill verification failed: ${error.message}`, 500));
  }
});

/**
 * Get e-way bill statistics
 */
exports.getEWayBillStats = catchAsync(async (req, res, next) => {
  const stats = await EWayBill.aggregate([
    {
      $match: { tenant: req.tenant._id },
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      },
    },
  ]);

  // Format stats into an object
  const formattedStats = {
    PENDING: 0,
    GENERATED: 0,
    CANCELLED: 0,
    EXTENDED: 0,
    EXPIRED: 0,
    FAILED: 0,
  };

  stats.forEach((stat) => {
    formattedStats[stat._id] = stat.count;
  });

  // Get monthly trends
  const monthlyTrends = await EWayBill.aggregate([
    {
      $match: { tenant: req.tenant._id },
    },
    {
      $group: {
        _id: {
          month: { $month: '$createdAt' },
          year: { $year: '$createdAt' },
          status: '$status',
        },
        count: { $sum: 1 },
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
      stats: formattedStats,
      total: Object.values(formattedStats).reduce((a, b) => a + b, 0),
      monthlyTrends,
    },
  });
});

/**
 * Helper function to prepare e-way bill request payload
 */
function prepareEWayBillRequestPayload(ewaybill) {
  // This would format the e-way bill data according to EWB API specifications
  // For simulation purposes, we're creating a simplified version
  return {
    supplyType: ewaybill.supplyType,
    subSupplyType: ewaybill.subSupplyType,
    docType: ewaybill.documentType,
    docNo: ewaybill.documentNumber,
    docDate: ewaybill.documentDate.toISOString().split('T')[0],
    fromGstin: ewaybill.fromGSTIN,
    fromTrdName: ewaybill.fromTraderName,
    fromAddr1: ewaybill.fromAddress,
    fromPlace: ewaybill.fromPlace,
    fromPincode: ewaybill.fromPincode,
    fromStateCode: ewaybill.fromStateCode,
    toGstin: ewaybill.toGSTIN,
    toTrdName: ewaybill.toTraderName,
    toAddr1: ewaybill.toAddress,
    toPlace: ewaybill.toPlace,
    toPincode: ewaybill.toPincode,
    toStateCode: ewaybill.toStateCode,
    transMode: ewaybill.transportMode,
    transDistance: ewaybill.distance,
    transporterId: ewaybill.transporterId,
    transporterName: ewaybill.transporterName,
    vehicleNo: ewaybill.vehicleNumber,
    vehicleType: ewaybill.vehicleType,
    transDocNo: ewaybill.documentNumber,
    transDocDate: ewaybill.documentDate ? ewaybill.documentDate.toISOString().split('T')[0] : null,
    itemList: ewaybill.items.map((item, index) => ({
      itemNo: (index + 1).toString(),
      productName: item.productName,
      productDesc: item.description,
      hsnCode: item.hsnCode,
      quantity: item.quantity,
      qtyUnit: item.unit,
      taxableAmount: item.taxableValue,
      sgstRate: item.taxRate / 2,
      cgstRate: item.taxRate / 2,
      igstRate: item.taxRate,
      cessRate: 0,
    })),
    totalValue: ewaybill.transactionValue,
  };
}

/**
 * Helper function to simulate EWB response
 */
function simulateEWBResponse() {
  // Generate a random EWB number
  const ewbNo = Math.floor(Math.random() * 10000000000).toString().padStart(10, '0');

  return {
    success: true,
    message: 'E-way bill generated successfully',
    result: {
      ewbNo,
      ewbDate: new Date().toISOString(),
      validUpto: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    },
  };
}

/**
 * Helper function to simulate EWB cancellation response
 */
function simulateCancellationResponse(ewbNo) {
  return {
    success: true,
    message: 'E-way bill cancelled successfully',
    result: {
      ewbNo,
      cancelDate: new Date().toISOString(),
    },
  };
}

/**
 * Helper function to simulate EWB extension response
 */
function simulateExtensionResponse(ewbNo) {
  return {
    success: true,
    message: 'E-way bill extended successfully',
    result: {
      ewbNo,
      validUpto: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    },
  };
}