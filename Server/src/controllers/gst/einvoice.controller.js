/**
 * GST E-Invoice Controller
 * Handles e-invoice generation, verification and cancellation
 */

const EInvoice = require('../../models/gst/einvoice.model');
const GSTInvoice = require('../../models/gst/invoice.model');
const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');

/**
 * Get all e-invoices with filtering and pagination
 */
exports.getEInvoices = catchAsync(async (req, res, next) => {
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

  // Invoice reference filter
  if (req.query.invoice) {
    filter.invoice = req.query.invoice;
  }

  // Execute query with pagination
  const einvoices = await EInvoice.find(filter)
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
  const total = await EInvoice.countDocuments(filter);

  res.status(200).json({
    status: 'success',
    results: einvoices.length,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    data: {
      einvoices,
    },
  });
});

/**
 * Get e-invoice by ID
 */
exports.getEInvoiceById = catchAsync(async (req, res, next) => {
  const einvoice = await EInvoice.findOne({
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

  if (!einvoice) {
    return next(new AppError('E-Invoice not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      einvoice,
    },
  });
});

/**
 * Generate e-invoice for an invoice
 */
exports.generateEInvoice = catchAsync(async (req, res, next) => {
  // Find the invoice
  const invoice = await GSTInvoice.findOne({
    _id: req.params.invoiceId,
    tenant: req.tenant._id,
  });

  if (!invoice) {
    return next(new AppError('Invoice not found', 404));
  }

  // Check if invoice is eligible for e-invoicing
  if (invoice.invoiceType !== 'SALES') {
    return next(new AppError('Only sales invoices can be e-invoiced', 400));
  }

  if (invoice.totalAmount < 50000) {
    return next(new AppError('E-invoicing is required only for invoices above ₹50,000', 400));
  }

  // Check if e-invoice already exists
  let einvoice = await EInvoice.findOne({
    invoice: invoice._id,
    tenant: req.tenant._id,
  });

  if (einvoice && ['GENERATED', 'PENDING'].includes(einvoice.status)) {
    return next(new AppError(`E-invoice already ${einvoice.status.toLowerCase()} for this invoice`, 400));
  }

  // If cancelled, create a new one
  if (einvoice && einvoice.status === 'CANCELLED') {
    einvoice = null;
  }

  // Prepare invoice data for IRP (Invoice Registration Portal)
  const invoiceData = prepareInvoiceDataForIRP(invoice);

  // Create or update e-invoice record
  if (!einvoice) {
    einvoice = new EInvoice({
      tenant: req.tenant._id,
      invoice: invoice._id,
      status: 'PENDING',
      requestPayload: invoiceData,
      generationAttempts: 1,
      lastAttemptDate: new Date(),
      createdBy: req.user._id,
      updatedBy: req.user._id,
    });
  } else {
    einvoice.status = 'PENDING';
    einvoice.requestPayload = invoiceData;
    einvoice.generationAttempts += 1;
    einvoice.lastAttemptDate = new Date();
    einvoice.updatedBy = req.user._id;
  }

  await einvoice.save();

  // Simulate IRP API call
  // In a real implementation, this would be an actual API call to the GST IRP
  try {
    // Simulate successful response
    const irpResponse = simulateIRPResponse(invoice);

    // Update e-invoice with response data
    einvoice.status = 'GENERATED';
    einvoice.irn = irpResponse.Irn;
    einvoice.acknowledgementNumber = irpResponse.AckNo;
    einvoice.acknowledgementDate = new Date(irpResponse.AckDt);
    einvoice.signedInvoice = irpResponse.SignedInvoice;
    einvoice.qrCode = irpResponse.QRCode;
    einvoice.responsePayload = irpResponse;
    einvoice.updatedBy = req.user._id;

    await einvoice.save();

    // Update invoice with e-invoice details
    invoice.einvoice = {
      status: 'GENERATED',
      irn: irpResponse.Irn,
      acknowledgementNumber: irpResponse.AckNo,
      acknowledgementDate: new Date(irpResponse.AckDt),
    };

    await invoice.save();

    res.status(200).json({
      status: 'success',
      message: 'E-invoice generated successfully',
      data: {
        einvoice,
      },
    });
  } catch (error) {
    // Handle IRP API error
    einvoice.status = 'FAILED';
    einvoice.errorDetails = {
      errorCode: error.code || 'UNKNOWN',
      errorMessage: error.message || 'Unknown error occurred',
      timestamp: new Date(),
    };
    await einvoice.save();

    return next(new AppError(`E-invoice generation failed: ${error.message}`, 500));
  }
});

/**
 * Cancel e-invoice
 */
exports.cancelEInvoice = catchAsync(async (req, res, next) => {
  // Validate request body
  if (!req.body.cancellationReason) {
    return next(new AppError('Cancellation reason is required', 400));
  }

  // Find the e-invoice
  const einvoice = await EInvoice.findOne({
    _id: req.params.id,
    tenant: req.tenant._id,
  });

  if (!einvoice) {
    return next(new AppError('E-invoice not found', 404));
  }

  // Check if e-invoice can be cancelled
  if (einvoice.status !== 'GENERATED') {
    return next(new AppError(`E-invoice in ${einvoice.status} status cannot be cancelled`, 400));
  }

  // Prepare cancellation request
  const cancellationRequest = {
    Irn: einvoice.irn,
    CnlRsn: req.body.cancellationReason,
    CnlRem: req.body.cancellationRemarks || '',
  };

  // Simulate IRP cancellation API call
  try {
    // Simulate successful cancellation
    const cancellationResponse = simulateCancellationResponse(einvoice.irn);

    // Update e-invoice with cancellation details
    einvoice.status = 'CANCELLED';
    einvoice.cancellationReason = req.body.cancellationReason;
    einvoice.cancellationRemarks = req.body.cancellationRemarks;
    einvoice.cancelledDate = new Date();
    einvoice.updatedBy = req.user._id;

    await einvoice.save();

    // Update invoice e-invoice status
    const invoice = await GSTInvoice.findById(einvoice.invoice);
    if (invoice) {
      invoice.einvoice.status = 'CANCELLED';
      await invoice.save();
    }

    res.status(200).json({
      status: 'success',
      message: 'E-invoice cancelled successfully',
      data: {
        einvoice,
      },
    });
  } catch (error) {
    // Handle IRP API error
    return next(new AppError(`E-invoice cancellation failed: ${error.message}`, 500));
  }
});

/**
 * Get e-invoice statistics
 */
exports.getEInvoiceStats = catchAsync(async (req, res, next) => {
  const stats = await EInvoice.aggregate([
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
    FAILED: 0,
  };

  stats.forEach((stat) => {
    formattedStats[stat._id] = stat.count;
  });

  // Get monthly trends
  const monthlyTrends = await EInvoice.aggregate([
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
 * Verify e-invoice with IRP
 */
exports.verifyEInvoice = catchAsync(async (req, res, next) => {
  const { irn } = req.params;

  // Find the e-invoice
  const einvoice = await EInvoice.findOne({
    irn,
    tenant: req.tenant._id,
  });

  if (!einvoice) {
    return next(new AppError('E-invoice with provided IRN not found', 404));
  }

  // Simulate IRP verification API call
  try {
    // Simulate successful verification
    const verificationResponse = {
      verified: true,
      status: einvoice.status,
      irn: einvoice.irn,
      acknowledgementNumber: einvoice.acknowledgementNumber,
      acknowledgementDate: einvoice.acknowledgementDate,
    };

    res.status(200).json({
      status: 'success',
      data: {
        verification: verificationResponse,
      },
    });
  } catch (error) {
    return next(new AppError(`E-invoice verification failed: ${error.message}`, 500));
  }
});

/**
 * Helper function to prepare invoice data for IRP
 */
function prepareInvoiceDataForIRP(invoice) {
  // This would format the invoice data according to IRP API specifications
  // For simulation purposes, we're creating a simplified version
  return {
    Version: '1.1',
    TranDtls: {
      TaxSch: 'GST',
      SupTyp: 'B2B',
      RegRev: 'N',
      EcmGstin: null,
    },
    DocDtls: {
      Typ: 'INV',
      No: invoice.invoiceNumber,
      Dt: invoice.invoiceDate.toISOString().split('T')[0],
    },
    SellerDtls: {
      Gstin: invoice.sellerGSTIN,
      LglNm: invoice.sellerLegalName,
      Addr1: invoice.sellerAddress,
      Loc: invoice.sellerCity,
      Pin: invoice.sellerPincode,
      Stcd: invoice.sellerStateCode,
    },
    BuyerDtls: {
      Gstin: invoice.customerGSTIN,
      LglNm: invoice.customerName,
      Addr1: invoice.customerAddress,
      Loc: invoice.customerCity,
      Pin: invoice.customerPincode,
      Stcd: invoice.customerStateCode,
    },
    ItemList: invoice.items.map((item, index) => ({
      SlNo: (index + 1).toString(),
      PrdDesc: item.description,
      HsnCd: item.hsnCode,
      Qty: item.quantity,
      Unit: item.unit,
      UnitPrice: item.rate,
      TotAmt: item.amount,
      Discount: item.discount || 0,
      AssAmt: item.taxableValue,
      GstRt: item.taxRate,
      CgstAmt: item.cgstAmount,
      SgstAmt: item.sgstAmount,
      IgstAmt: item.igstAmount,
      CesRt: item.cessRate || 0,
      CesAmt: item.cessAmount || 0,
      TotItemVal: item.totalAmount,
    })),
    ValDtls: {
      AssVal: invoice.taxableAmount,
      CgstVal: invoice.cgstAmount,
      SgstVal: invoice.sgstAmount,
      IgstVal: invoice.igstAmount,
      CesVal: invoice.cessAmount || 0,
      StCesVal: 0,
      Discount: invoice.discountAmount || 0,
      OthChrg: invoice.otherCharges || 0,
      RndOffAmt: invoice.roundOffAmount || 0,
      TotInvVal: invoice.totalAmount,
    },
  };
}

/**
 * Helper function to simulate IRP response
 */
function simulateIRPResponse(invoice) {
  // Generate a random IRN (in real implementation, this would come from IRP)
  const irn = Array(64)
    .fill(0)
    .map(() => Math.floor(Math.random() * 16).toString(16))
    .join('');

  // Generate a random acknowledgement number
  const ackNo = Math.floor(Math.random() * 10000000000).toString().padStart(10, '0');

  return {
    Success: 'Y',
    AckNo: ackNo,
    AckDt: new Date().toISOString(),
    Irn: irn,
    SignedInvoice: 'BASE64_ENCODED_SIGNED_INVOICE_DATA',
    SignedQRCode: 'BASE64_ENCODED_SIGNED_QR_CODE',
    QRCode: 'BASE64_ENCODED_QR_CODE',
    Status: 'ACT',
    EwbNo: null,
    EwbDt: null,
    EwbValidTill: null,
  };
}

/**
 * Helper function to simulate IRP cancellation response
 */
function simulateCancellationResponse(irn) {
  return {
    Success: 'Y',
    CancelDate: new Date().toISOString(),
    Irn: irn,
  };
}