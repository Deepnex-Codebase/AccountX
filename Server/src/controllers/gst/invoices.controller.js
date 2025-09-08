/**
 * GST Invoice Controller
 * Handles GST invoice related operations for both sales and purchases
 */

const GSTInvoice = require('../../models/gst/invoice.model');
const AppError = require('../../utils/appError');

/**
 * Get all invoices with filtering and pagination
 * @route GET /api/v1/invoices
 * @access Private
 */
exports.getInvoices = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      invoiceType,
      startDate,
      endDate,
      paymentStatus,
      search,
    } = req.query;
    const skip = (page - 1) * limit;

    // Build query
    const query = { tenant: req.tenantId };

    // Add invoice type filter if provided
    if (invoiceType) {
      query.invoiceType = invoiceType;
    }

    // Add date range filter if provided
    if (startDate || endDate) {
      query.invoiceDate = {};
      if (startDate) {
        query.invoiceDate.$gte = new Date(startDate);
      }
      if (endDate) {
        query.invoiceDate.$lte = new Date(endDate);
      }
    }

    // Add payment status filter if provided
    if (paymentStatus) {
      query.paymentStatus = paymentStatus;
    }

    // Add search filter if provided
    if (search) {
      query.$or = [
        { invoiceNumber: { $regex: search, $options: 'i' } },
        { customerName: { $regex: search, $options: 'i' } },
        { customerGstin: { $regex: search, $options: 'i' } },
        { vendorName: { $regex: search, $options: 'i' } },
        { vendorGstin: { $regex: search, $options: 'i' } },
      ];
    }

    // Execute query with pagination
    const invoices = await GSTInvoice.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ invoiceDate: -1 })
      .select('-items'); // Exclude items array to reduce response size

    // Get total count for pagination
    const total = await GSTInvoice.countDocuments(query);

    res.status(200).json({
      success: true,
      count: invoices.length,
      total,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      },
      data: invoices,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new invoice
 * @route POST /api/v1/invoices
 * @access Private
 */
exports.createInvoice = async (req, res, next) => {
  try {
    // Add tenant and creator to the invoice data
    req.body.tenant = req.tenantId;
    req.body.createdBy = req.user.id;

    // Validate invoice items
    if (!req.body.items || !Array.isArray(req.body.items) || req.body.items.length === 0) {
      return next(new AppError('Invoice must have at least one item', 400));
    }

    // Create new invoice
    const invoice = await GSTInvoice.create(req.body);

    res.status(201).json({
      success: true,
      data: invoice,
    });
  } catch (error) {
    // Handle duplicate invoice number error
    if (error.code === 11000) {
      return next(new AppError('An invoice with this number already exists', 400));
    }
    next(error);
  }
};

/**
 * Get a single invoice by ID
 * @route GET /api/v1/invoices/:id
 * @access Private
 */
exports.getInvoiceById = async (req, res, next) => {
  try {
    const invoice = await GSTInvoice.findOne({
      _id: req.params.id,
      tenant: req.tenantId,
    });

    if (!invoice) {
      return next(new AppError('Invoice not found', 404));
    }

    res.status(200).json({
      success: true,
      data: invoice,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update an invoice
 * @route PUT /api/v1/invoices/:id
 * @access Private
 */
exports.updateInvoice = async (req, res, next) => {
  try {
    // Check if e-invoice or e-way bill is already generated
    const existingInvoice = await GSTInvoice.findOne({
      _id: req.params.id,
      tenant: req.tenantId,
    });

    if (!existingInvoice) {
      return next(new AppError('Invoice not found', 404));
    }

    // Prevent updates if e-invoice is already generated
    if (existingInvoice.eInvoice && existingInvoice.eInvoice.isGenerated) {
      return next(
        new AppError('Cannot update invoice after e-invoice has been generated', 400)
      );
    }

    // Prevent updates if e-way bill is already generated
    if (existingInvoice.eWayBill && existingInvoice.eWayBill.isGenerated) {
      return next(
        new AppError('Cannot update invoice after e-way bill has been generated', 400)
      );
    }

    // Find and update the invoice
    const invoice = await GSTInvoice.findOneAndUpdate(
      { _id: req.params.id, tenant: req.tenantId },
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: invoice,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete an invoice
 * @route DELETE /api/v1/invoices/:id
 * @access Private
 */
exports.deleteInvoice = async (req, res, next) => {
  try {
    // Check if e-invoice or e-way bill is already generated
    const existingInvoice = await GSTInvoice.findOne({
      _id: req.params.id,
      tenant: req.tenantId,
    });

    if (!existingInvoice) {
      return next(new AppError('Invoice not found', 404));
    }

    // Prevent deletion if e-invoice is already generated
    if (existingInvoice.eInvoice && existingInvoice.eInvoice.isGenerated) {
      return next(
        new AppError('Cannot delete invoice after e-invoice has been generated', 400)
      );
    }

    // Prevent deletion if e-way bill is already generated
    if (existingInvoice.eWayBill && existingInvoice.eWayBill.isGenerated) {
      return next(
        new AppError('Cannot delete invoice after e-way bill has been generated', 400)
      );
    }

    // Prevent deletion if invoice is reported in GSTR
    if (
      (existingInvoice.gstrStatus.gstr1 && existingInvoice.gstrStatus.gstr1.reported) ||
      (existingInvoice.gstrStatus.gstr2 && existingInvoice.gstrStatus.gstr2.reported) ||
      (existingInvoice.gstrStatus.gstr3b && existingInvoice.gstrStatus.gstr3b.reported)
    ) {
      return next(
        new AppError('Cannot delete invoice that has been reported in GST returns', 400)
      );
    }

    // Delete the invoice
    await GSTInvoice.findOneAndDelete({
      _id: req.params.id,
      tenant: req.tenantId,
    });

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update invoice payment status
 * @route PATCH /api/v1/invoices/:id/payment
 * @access Private
 */
exports.updatePaymentStatus = async (req, res, next) => {
  try {
    const { paymentStatus, paymentDetails } = req.body;

    if (!paymentStatus) {
      return next(new AppError('Payment status is required', 400));
    }

    // Find the invoice
    const invoice = await GSTInvoice.findOne({
      _id: req.params.id,
      tenant: req.tenantId,
    });

    if (!invoice) {
      return next(new AppError('Invoice not found', 404));
    }

    // Update payment status
    invoice.paymentStatus = paymentStatus;

    // Add payment details if provided
    if (paymentDetails) {
      if (!Array.isArray(paymentDetails)) {
        return next(new AppError('Payment details must be an array', 400));
      }

      // Add new payment details
      invoice.paymentDetails.push(...paymentDetails);
    }

    await invoice.save();

    res.status(200).json({
      success: true,
      data: invoice,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Generate e-invoice for a sales invoice
 * @route POST /api/v1/invoices/:id/einvoice
 * @access Private
 */
exports.generateEInvoice = async (req, res, next) => {
  try {
    // Find the invoice
    const invoice = await GSTInvoice.findOne({
      _id: req.params.id,
      tenant: req.tenantId,
      invoiceType: 'Sales', // Only sales invoices can have e-invoices
    });

    if (!invoice) {
      return next(new AppError('Sales invoice not found', 404));
    }

    // Check if e-invoice is already generated
    if (invoice.eInvoice && invoice.eInvoice.isGenerated) {
      return next(new AppError('E-invoice has already been generated for this invoice', 400));
    }

    // In a real implementation, this would call an external API to generate the e-invoice
    // For now, we'll simulate a successful e-invoice generation
    const eInvoiceResult = {
      success: true,
      irn: `${Date.now()}${Math.floor(Math.random() * 10000)}`,
      acknowledgementNumber: `${Math.floor(Math.random() * 1000000000000)}`,
      acknowledgementDate: new Date(),
      signedQRCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...', // Simulated QR code
      signedInvoice: 'data:application/pdf;base64,JVBERi0xLjcKJ...', // Simulated signed invoice
    };

    // Update e-invoice details
    invoice.eInvoice = {
      isGenerated: true,
      irn: eInvoiceResult.irn,
      acknowledgementNumber: eInvoiceResult.acknowledgementNumber,
      acknowledgementDate: eInvoiceResult.acknowledgementDate,
      signedQRCode: eInvoiceResult.signedQRCode,
      signedInvoice: eInvoiceResult.signedInvoice,
      status: 'Generated',
    };

    await invoice.save();

    res.status(200).json({
      success: true,
      message: 'E-invoice generated successfully',
      data: {
        id: invoice._id,
        invoiceNumber: invoice.invoiceNumber,
        irn: invoice.eInvoice.irn,
        acknowledgementNumber: invoice.eInvoice.acknowledgementNumber,
        acknowledgementDate: invoice.eInvoice.acknowledgementDate,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Verify e-invoice by IRN
 * @route GET /api/v1/invoices/einvoice/:irn
 * @access Private
 */
exports.verifyEInvoiceByIRN = async (req, res, next) => {
  try {
    // Find the invoice by IRN
    const invoice = await GSTInvoice.findOne({
      'eInvoice.irn': req.params.irn,
      tenant: req.tenantId,
    });

    if (!invoice) {
      return next(new AppError('E-invoice with the provided IRN not found', 404));
    }

    // In a real implementation, this would call an external API to verify the e-invoice
    // For now, we'll return the existing e-invoice details

    res.status(200).json({
      success: true,
      data: {
        id: invoice._id,
        invoiceNumber: invoice.invoiceNumber,
        invoiceDate: invoice.invoiceDate,
        irn: invoice.eInvoice.irn,
        acknowledgementNumber: invoice.eInvoice.acknowledgementNumber,
        acknowledgementDate: invoice.eInvoice.acknowledgementDate,
        status: invoice.eInvoice.status,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Generate e-way bill for an invoice
 * @route POST /api/v1/invoices/:id/ewaybill
 * @access Private
 */
exports.generateEWayBill = async (req, res, next) => {
  try {
    // Find the invoice
    const invoice = await GSTInvoice.findOne({
      _id: req.params.id,
      tenant: req.tenantId,
    });

    if (!invoice) {
      return next(new AppError('Invoice not found', 404));
    }

    // Check if e-way bill is already generated
    if (invoice.eWayBill && invoice.eWayBill.isGenerated) {
      return next(new AppError('E-way bill has already been generated for this invoice', 400));
    }

    // Validate transport details
    const { transportDetails } = req.body;
    if (!transportDetails) {
      return next(new AppError('Transport details are required for e-way bill generation', 400));
    }

    // In a real implementation, this would call an external API to generate the e-way bill
    // For now, we'll simulate a successful e-way bill generation
    const eWayBillResult = {
      success: true,
      ewbNumber: `${Math.floor(Math.random() * 10000000000)}`,
      ewbDate: new Date(),
      validUpto: new Date(Date.now() + 24 * 60 * 60 * 1000), // Valid for 1 day
    };

    // Update e-way bill details
    invoice.eWayBill = {
      isGenerated: true,
      ewbNumber: eWayBillResult.ewbNumber,
      ewbDate: eWayBillResult.ewbDate,
      validUpto: eWayBillResult.validUpto,
      status: 'Generated',
      transportDetails: transportDetails,
    };

    await invoice.save();

    res.status(200).json({
      success: true,
      message: 'E-way bill generated successfully',
      data: {
        id: invoice._id,
        invoiceNumber: invoice.invoiceNumber,
        ewbNumber: invoice.eWayBill.ewbNumber,
        ewbDate: invoice.eWayBill.ewbDate,
        validUpto: invoice.eWayBill.validUpto,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Verify e-way bill by EWB number
 * @route GET /api/v1/invoices/ewaybill/:ewbNumber
 * @access Private
 */
exports.verifyEWayBillByNumber = async (req, res, next) => {
  try {
    // Find the invoice by EWB number
    const invoice = await GSTInvoice.findOne({
      'eWayBill.ewbNumber': req.params.ewbNumber,
      tenant: req.tenantId,
    });

    if (!invoice) {
      return next(new AppError('E-way bill with the provided number not found', 404));
    }

    // In a real implementation, this would call an external API to verify the e-way bill
    // For now, we'll return the existing e-way bill details

    res.status(200).json({
      success: true,
      data: {
        id: invoice._id,
        invoiceNumber: invoice.invoiceNumber,
        invoiceDate: invoice.invoiceDate,
        ewbNumber: invoice.eWayBill.ewbNumber,
        ewbDate: invoice.eWayBill.ewbDate,
        validUpto: invoice.eWayBill.validUpto,
        status: invoice.eWayBill.status,
        transportDetails: invoice.eWayBill.transportDetails,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mark ITC eligibility for a purchase invoice
 * @route PATCH /api/v1/invoices/:id/itc
 * @access Private
 */
exports.markITCEligibility = async (req, res, next) => {
  try {
    const { eligibility, eligibleAmount, ineligibleAmount, reason } = req.body;

    if (!eligibility) {
      return next(new AppError('ITC eligibility status is required', 400));
    }

    // Find the invoice
    const invoice = await GSTInvoice.findOne({
      _id: req.params.id,
      tenant: req.tenantId,
      invoiceType: 'Purchase', // Only purchase invoices can have ITC details
    });

    if (!invoice) {
      return next(new AppError('Purchase invoice not found', 404));
    }

    // Update ITC details
    invoice.itcDetails = {
      eligibility,
      eligibleAmount: eligibleAmount || 0,
      ineligibleAmount: ineligibleAmount || 0,
      reason: reason || '',
    };

    await invoice.save();

    res.status(200).json({
      success: true,
      message: 'ITC eligibility marked successfully',
      data: invoice,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mark invoice as reported in GSTR
 * @route PATCH /api/v1/invoices/:id/gstr
 * @access Private
 */
exports.markGSTRReported = async (req, res, next) => {
  try {
    const { gstrType, period, reported } = req.body;

    if (!gstrType || !period) {
      return next(new AppError('GSTR type and period are required', 400));
    }

    // Validate GSTR type
    if (!['gstr1', 'gstr2', 'gstr3b'].includes(gstrType)) {
      return next(new AppError('Invalid GSTR type', 400));
    }

    // Validate period format (MM-YYYY)
    if (!/^\d{2}-\d{4}$/.test(period)) {
      return next(new AppError('Period must be in MM-YYYY format', 400));
    }

    // Find the invoice
    const invoice = await GSTInvoice.findOne({
      _id: req.params.id,
      tenant: req.tenantId,
    });

    if (!invoice) {
      return next(new AppError('Invoice not found', 404));
    }

    // Update GSTR reporting status
    invoice.gstrStatus[gstrType] = {
      reported: reported !== false, // Default to true if not explicitly set to false
      reportedOn: new Date(),
      period,
    };

    await invoice.save();

    res.status(200).json({
      success: true,
      message: `Invoice marked as ${reported !== false ? 'reported' : 'not reported'} in ${gstrType.toUpperCase()}`,
      data: invoice,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Generate journal entry for an invoice
 * @route POST /api/v1/invoices/:id/journal
 * @access Private
 */
exports.generateJournalEntry = async (req, res, next) => {
  try {
    // Find the invoice
    const invoice = await GSTInvoice.findOne({
      _id: req.params.id,
      tenant: req.tenantId,
    });

    if (!invoice) {
      return next(new AppError('Invoice not found', 404));
    }

    // Check if journal entry already exists
    if (invoice.journalEntry) {
      return next(new AppError('Journal entry already exists for this invoice', 400));
    }

    // In a real implementation, this would create a journal entry in the accounting module
    // For now, we'll simulate a successful journal entry creation
    const journalEntryId = new mongoose.Types.ObjectId();

    // Update invoice with journal entry reference
    invoice.journalEntry = journalEntryId;
    await invoice.save();

    res.status(200).json({
      success: true,
      message: 'Journal entry generated successfully',
      data: {
        id: invoice._id,
        invoiceNumber: invoice.invoiceNumber,
        journalEntryId: invoice.journalEntry,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get invoice statistics
 * @route GET /api/v1/invoices/stats
 * @access Private
 */
exports.getInvoiceStats = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    // Build date range filter
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.invoiceDate = {};
      if (startDate) {
        dateFilter.invoiceDate.$gte = new Date(startDate);
      }
      if (endDate) {
        dateFilter.invoiceDate.$lte = new Date(endDate);
      }
    }

    // Get sales invoice statistics
    const salesStats = await GSTInvoice.aggregate([
      {
        $match: {
          tenant: mongoose.Types.ObjectId(req.tenantId),
          invoiceType: 'Sales',
          ...dateFilter,
        },
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' },
          totalTaxableValue: { $sum: '$totalTaxableValue' },
          totalCgstAmount: { $sum: '$totalCgstAmount' },
          totalSgstAmount: { $sum: '$totalSgstAmount' },
          totalIgstAmount: { $sum: '$totalIgstAmount' },
          unpaid: {
            $sum: {
              $cond: [{ $eq: ['$paymentStatus', 'Unpaid'] }, 1, 0],
            },
          },
          unpaidAmount: {
            $sum: {
              $cond: [{ $eq: ['$paymentStatus', 'Unpaid'] }, '$totalAmount', 0],
            },
          },
          partiallyPaid: {
            $sum: {
              $cond: [{ $eq: ['$paymentStatus', 'Partially Paid'] }, 1, 0],
            },
          },
          paid: {
            $sum: {
              $cond: [{ $eq: ['$paymentStatus', 'Paid'] }, 1, 0],
            },
          },
          eInvoiceGenerated: {
            $sum: {
              $cond: [{ $eq: ['$eInvoice.isGenerated', true] }, 1, 0],
            },
          },
          eWayBillGenerated: {
            $sum: {
              $cond: [{ $eq: ['$eWayBill.isGenerated', true] }, 1, 0],
            },
          },
        },
      },
    ]);

    // Get purchase invoice statistics
    const purchaseStats = await GSTInvoice.aggregate([
      {
        $match: {
          tenant: mongoose.Types.ObjectId(req.tenantId),
          invoiceType: 'Purchase',
          ...dateFilter,
        },
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' },
          totalTaxableValue: { $sum: '$totalTaxableValue' },
          totalCgstAmount: { $sum: '$totalCgstAmount' },
          totalSgstAmount: { $sum: '$totalSgstAmount' },
          totalIgstAmount: { $sum: '$totalIgstAmount' },
          unpaid: {
            $sum: {
              $cond: [{ $eq: ['$paymentStatus', 'Unpaid'] }, 1, 0],
            },
          },
          unpaidAmount: {
            $sum: {
              $cond: [{ $eq: ['$paymentStatus', 'Unpaid'] }, '$totalAmount', 0],
            },
          },
          partiallyPaid: {
            $sum: {
              $cond: [{ $eq: ['$paymentStatus', 'Partially Paid'] }, 1, 0],
            },
          },
          paid: {
            $sum: {
              $cond: [{ $eq: ['$paymentStatus', 'Paid'] }, 1, 0],
            },
          },
          itcEligible: {
            $sum: {
              $cond: [{ $eq: ['$itcDetails.eligibility', 'Eligible'] }, 1, 0],
            },
          },
          itcIneligible: {
            $sum: {
              $cond: [{ $eq: ['$itcDetails.eligibility', 'Ineligible'] }, 1, 0],
            },
          },
          itcPartial: {
            $sum: {
              $cond: [{ $eq: ['$itcDetails.eligibility', 'Partial'] }, 1, 0],
            },
          },
          itcEligibleAmount: {
            $sum: '$itcDetails.eligibleAmount',
          },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        sales: salesStats.length > 0 ? salesStats[0] : {
          count: 0,
          totalAmount: 0,
          totalTaxableValue: 0,
          totalCgstAmount: 0,
          totalSgstAmount: 0,
          totalIgstAmount: 0,
          unpaid: 0,
          unpaidAmount: 0,
          partiallyPaid: 0,
          paid: 0,
          eInvoiceGenerated: 0,
          eWayBillGenerated: 0,
        },
        purchases: purchaseStats.length > 0 ? purchaseStats[0] : {
          count: 0,
          totalAmount: 0,
          totalTaxableValue: 0,
          totalCgstAmount: 0,
          totalSgstAmount: 0,
          totalIgstAmount: 0,
          unpaid: 0,
          unpaidAmount: 0,
          partiallyPaid: 0,
          paid: 0,
          itcEligible: 0,
          itcIneligible: 0,
          itcPartial: 0,
          itcEligibleAmount: 0,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};