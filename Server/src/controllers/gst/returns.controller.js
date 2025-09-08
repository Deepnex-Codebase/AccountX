/**
 * GST Returns Controller
 * Handles GST return filing operations
 */

const GSTReturn = require('../../models/gst/return.model');
const GSTInvoice = require('../../models/gst/invoice.model');
const AppError = require('../../utils/appError');
const mongoose = require('mongoose');

/**
 * Get all GST returns with filtering and pagination
 * @route GET /api/v1/returns
 * @access Private
 */
exports.getReturns = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, returnType, status, year, month } = req.query;
    const skip = (page - 1) * limit;

    // Build query
    const query = { tenant: req.tenantId };

    // Add return type filter if provided
    if (returnType) {
      query.returnType = returnType;
    }

    // Add status filter if provided
    if (status) {
      query.status = status;
    }

    // Add period filters if provided
    if (year) {
      query['period.year'] = parseInt(year);
    }

    if (month) {
      query['period.month'] = parseInt(month);
    }

    // Execute query with pagination
    const returns = await GSTReturn.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ 'period.year': -1, 'period.month': -1 })
      .select('-jsonData'); // Exclude large JSON data

    // Get total count for pagination
    const total = await GSTReturn.countDocuments(query);

    res.status(200).json({
      success: true,
      count: returns.length,
      total,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      },
      data: returns,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new GST return
 * @route POST /api/v1/returns
 * @access Private
 */
exports.createReturn = async (req, res, next) => {
  try {
    // Add tenant and creator to the return data
    req.body.tenant = req.tenantId;
    req.body.createdBy = req.user.id;
    req.body.lastUpdatedBy = req.user.id;

    // Validate period
    if (!req.body.period || !req.body.period.month || !req.body.period.year) {
      return next(new AppError('Period (month and year) is required', 400));
    }

    // Check if return already exists for the period
    const existingReturn = await GSTReturn.findOne({
      tenant: req.tenantId,
      returnType: req.body.returnType,
      'period.month': req.body.period.month,
      'period.year': req.body.period.year,
    });

    if (existingReturn) {
      return next(
        new AppError(
          `A ${req.body.returnType} return already exists for ${req.body.period.month}-${req.body.period.year}`,
          400
        )
      );
    }

    // Create new return
    const gstReturn = await GSTReturn.create(req.body);

    res.status(201).json({
      success: true,
      data: gstReturn,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a single GST return by ID
 * @route GET /api/v1/returns/:id
 * @access Private
 */
exports.getReturnById = async (req, res, next) => {
  try {
    const gstReturn = await GSTReturn.findOne({
      _id: req.params.id,
      tenant: req.tenantId,
    });

    if (!gstReturn) {
      return next(new AppError('GST return not found', 404));
    }

    res.status(200).json({
      success: true,
      data: gstReturn,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update a GST return
 * @route PUT /api/v1/returns/:id
 * @access Private
 */
exports.updateReturn = async (req, res, next) => {
  try {
    // Check if return is already filed
    const existingReturn = await GSTReturn.findOne({
      _id: req.params.id,
      tenant: req.tenantId,
    });

    if (!existingReturn) {
      return next(new AppError('GST return not found', 404));
    }

    if (existingReturn.status === 'Filed') {
      return next(new AppError('Cannot update a filed return', 400));
    }

    // Update last updated by
    req.body.lastUpdatedBy = req.user.id;

    // Find and update the return
    const gstReturn = await GSTReturn.findOneAndUpdate(
      { _id: req.params.id, tenant: req.tenantId },
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: gstReturn,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a GST return
 * @route DELETE /api/v1/returns/:id
 * @access Private
 */
exports.deleteReturn = async (req, res, next) => {
  try {
    // Check if return is already filed
    const existingReturn = await GSTReturn.findOne({
      _id: req.params.id,
      tenant: req.tenantId,
    });

    if (!existingReturn) {
      return next(new AppError('GST return not found', 404));
    }

    if (existingReturn.status === 'Filed') {
      return next(new AppError('Cannot delete a filed return', 400));
    }

    // Delete the return
    await GSTReturn.findOneAndDelete({
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
 * Populate GSTR-1 with invoices for the period
 * @route POST /api/v1/returns/:id/populate
 * @access Private
 */
exports.populateGSTR1 = async (req, res, next) => {
  try {
    // Find the return
    const gstReturn = await GSTReturn.findOne({
      _id: req.params.id,
      tenant: req.tenantId,
      returnType: 'GSTR-1',
    });

    if (!gstReturn) {
      return next(new AppError('GSTR-1 return not found', 404));
    }

    if (gstReturn.status === 'Filed') {
      return next(new AppError('Cannot populate a filed return', 400));
    }

    // Get the start and end date for the return period
    const startDate = new Date(gstReturn.period.year, gstReturn.period.month - 1, 1);
    const endDate = new Date(gstReturn.period.year, gstReturn.period.month, 0);

    // Find all sales invoices for the period
    const invoices = await GSTInvoice.find({
      tenant: req.tenantId,
      invoiceType: 'Sales',
      invoiceDate: { $gte: startDate, $lte: endDate },
    });

    // Categorize invoices
    const b2bInvoices = [];
    const b2clInvoices = [];
    const b2csInvoices = [];

    invoices.forEach((invoice) => {
      if (invoice.customerGstin && invoice.customerGstin.length === 15) {
        // B2B invoice (Business to Business)
        b2bInvoices.push(invoice._id);
      } else if (!invoice.customerGstin && invoice.placeOfSupply !== gstReturn.tenant.state) {
        // B2CL invoice (Business to Consumer Large - interstate)
        b2clInvoices.push(invoice._id);
      } else {
        // B2CS invoice (Business to Consumer Small)
        b2csInvoices.push(invoice._id);
      }
    });

    // Update the return with invoice references
    gstReturn.b2bInvoices = b2bInvoices;
    gstReturn.b2clInvoices = b2clInvoices;
    gstReturn.b2csInvoices = b2csInvoices;
    gstReturn.status = 'Generated';
    gstReturn.lastUpdatedBy = req.user.id;

    await gstReturn.save();

    // Mark invoices as reported in GSTR-1
    await GSTInvoice.updateMany(
      { _id: { $in: [...b2bInvoices, ...b2clInvoices, ...b2csInvoices] } },
      {
        'gstrStatus.gstr1': {
          reported: true,
          reportedOn: new Date(),
          period: `${gstReturn.period.month.toString().padStart(2, '0')}-${gstReturn.period.year}`,
        },
      }
    );

    res.status(200).json({
      success: true,
      message: 'GSTR-1 populated successfully',
      data: {
        id: gstReturn._id,
        returnType: gstReturn.returnType,
        period: gstReturn.period,
        status: gstReturn.status,
        invoiceCounts: {
          b2b: b2bInvoices.length,
          b2cl: b2clInvoices.length,
          b2cs: b2csInvoices.length,
          total: b2bInvoices.length + b2clInvoices.length + b2csInvoices.length,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Populate GSTR-3B with tax calculations for the period
 * @route POST /api/v1/returns/:id/populate
 * @access Private
 */
exports.populateGSTR3B = async (req, res, next) => {
  try {
    // Find the return
    const gstReturn = await GSTReturn.findOne({
      _id: req.params.id,
      tenant: req.tenantId,
      returnType: 'GSTR-3B',
    });

    if (!gstReturn) {
      return next(new AppError('GSTR-3B return not found', 404));
    }

    if (gstReturn.status === 'Filed') {
      return next(new AppError('Cannot populate a filed return', 400));
    }

    // Get the start and end date for the return period
    const startDate = new Date(gstReturn.period.year, gstReturn.period.month - 1, 1);
    const endDate = new Date(gstReturn.period.year, gstReturn.period.month, 0);

    // Calculate outward supplies (sales)
    const outwardSupplies = await GSTInvoice.aggregate([
      {
        $match: {
          tenant: mongoose.Types.ObjectId(req.tenantId),
          invoiceType: 'Sales',
          invoiceDate: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: null,
          taxableValue: { $sum: '$totalTaxableValue' },
          integratedTax: { $sum: '$totalIgstAmount' },
          centralTax: { $sum: '$totalCgstAmount' },
          stateTax: { $sum: '$totalSgstAmount' },
          cess: { $sum: '$totalCessAmount' },
        },
      },
    ]);

    // Calculate inward supplies (purchases)
    const inwardSupplies = await GSTInvoice.aggregate([
      {
        $match: {
          tenant: mongoose.Types.ObjectId(req.tenantId),
          invoiceType: 'Purchase',
          invoiceDate: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: null,
          taxableValue: { $sum: '$totalTaxableValue' },
          integratedTax: { $sum: '$totalIgstAmount' },
          centralTax: { $sum: '$totalCgstAmount' },
          stateTax: { $sum: '$totalSgstAmount' },
          cess: { $sum: '$totalCessAmount' },
        },
      },
    ]);

    // Calculate ITC availed
    const itcAvailed = await GSTInvoice.aggregate([
      {
        $match: {
          tenant: mongoose.Types.ObjectId(req.tenantId),
          invoiceType: 'Purchase',
          invoiceDate: { $gte: startDate, $lte: endDate },
          'itcDetails.eligibility': { $in: ['Eligible', 'Partial'] },
        },
      },
      {
        $group: {
          _id: null,
          integratedTax: {
            $sum: {
              $cond: [
                { $eq: ['$itcDetails.eligibility', 'Eligible'] },
                '$totalIgstAmount',
                { $multiply: ['$totalIgstAmount', { $divide: ['$itcDetails.eligibleAmount', '$totalAmount'] }] },
              ],
            },
          },
          centralTax: {
            $sum: {
              $cond: [
                { $eq: ['$itcDetails.eligibility', 'Eligible'] },
                '$totalCgstAmount',
                { $multiply: ['$totalCgstAmount', { $divide: ['$itcDetails.eligibleAmount', '$totalAmount'] }] },
              ],
            },
          },
          stateTax: {
            $sum: {
              $cond: [
                { $eq: ['$itcDetails.eligibility', 'Eligible'] },
                '$totalSgstAmount',
                { $multiply: ['$totalSgstAmount', { $divide: ['$itcDetails.eligibleAmount', '$totalAmount'] }] },
              ],
            },
          },
          cess: {
            $sum: {
              $cond: [
                { $eq: ['$itcDetails.eligibility', 'Eligible'] },
                '$totalCessAmount',
                { $multiply: ['$totalCessAmount', { $divide: ['$itcDetails.eligibleAmount', '$totalAmount'] }] },
              ],
            },
          },
        },
      },
    ]);

    // Calculate tax payable
    const outward = outwardSupplies.length > 0 ? outwardSupplies[0] : {
      taxableValue: 0,
      integratedTax: 0,
      centralTax: 0,
      stateTax: 0,
      cess: 0,
    };

    const itc = itcAvailed.length > 0 ? itcAvailed[0] : {
      integratedTax: 0,
      centralTax: 0,
      stateTax: 0,
      cess: 0,
    };

    const taxPayable = {
      integratedTax: Math.max(0, outward.integratedTax - itc.integratedTax),
      centralTax: Math.max(0, outward.centralTax - itc.centralTax),
      stateTax: Math.max(0, outward.stateTax - itc.stateTax),
      cess: Math.max(0, outward.cess - itc.cess),
    };

    // Update the return with calculated values
    gstReturn.outwardSupplies = outward;
    gstReturn.inwardSupplies = inwardSupplies.length > 0 ? inwardSupplies[0] : {
      taxableValue: 0,
      integratedTax: 0,
      centralTax: 0,
      stateTax: 0,
      cess: 0,
    };
    gstReturn.itcAvailed = itc;
    gstReturn.taxPayable = taxPayable;
    gstReturn.status = 'Generated';
    gstReturn.lastUpdatedBy = req.user.id;

    await gstReturn.save();

    // Mark invoices as reported in GSTR-3B
    await GSTInvoice.updateMany(
      {
        tenant: req.tenantId,
        invoiceDate: { $gte: startDate, $lte: endDate },
      },
      {
        'gstrStatus.gstr3b': {
          reported: true,
          reportedOn: new Date(),
          period: `${gstReturn.period.month.toString().padStart(2, '0')}-${gstReturn.period.year}`,
        },
      }
    );

    res.status(200).json({
      success: true,
      message: 'GSTR-3B populated successfully',
      data: {
        id: gstReturn._id,
        returnType: gstReturn.returnType,
        period: gstReturn.period,
        status: gstReturn.status,
        outwardSupplies: gstReturn.outwardSupplies,
        inwardSupplies: gstReturn.inwardSupplies,
        itcAvailed: gstReturn.itcAvailed,
        taxPayable: gstReturn.taxPayable,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Generate JSON for GST return filing
 * @route POST /api/v1/returns/:id/json
 * @access Private
 */
exports.generateJSON = async (req, res, next) => {
  try {
    // Find the return
    const gstReturn = await GSTReturn.findOne({
      _id: req.params.id,
      tenant: req.tenantId,
    });

    if (!gstReturn) {
      return next(new AppError('GST return not found', 404));
    }

    if (gstReturn.status !== 'Generated') {
      return next(new AppError('Return must be in Generated status to create JSON', 400));
    }

    // In a real implementation, this would generate the JSON format required by the GST portal
    // For now, we'll create a simplified JSON structure

    let jsonData;

    if (gstReturn.returnType === 'GSTR-1') {
      // Populate invoice details for GSTR-1
      const b2bInvoices = await GSTInvoice.find({
        _id: { $in: gstReturn.b2bInvoices },
      }).select('invoiceNumber invoiceDate customerName customerGstin totalTaxableValue totalIgstAmount totalCgstAmount totalSgstAmount totalAmount');

      const b2clInvoices = await GSTInvoice.find({
        _id: { $in: gstReturn.b2clInvoices },
      }).select('invoiceNumber invoiceDate placeOfSupply totalTaxableValue totalIgstAmount totalAmount');

      jsonData = {
        gstin: req.body.gstin, // GSTIN of the taxpayer
        fp: `${gstReturn.period.month.toString().padStart(2, '0')}${gstReturn.period.year}`, // Period (MMYYYY)
        b2b: b2bInvoices.map(invoice => ({
          ctin: invoice.customerGstin,
          inv: [
            {
              inum: invoice.invoiceNumber,
              idt: invoice.invoiceDate.toISOString().split('T')[0],
              val: invoice.totalAmount,
              pos: invoice.placeOfSupply.substring(0, 2), // First 2 characters of place of supply (state code)
              rchrg: 'N', // Reverse charge
              itms: [
                {
                  txval: invoice.totalTaxableValue,
                  iamt: invoice.totalIgstAmount,
                  camt: invoice.totalCgstAmount,
                  samt: invoice.totalSgstAmount,
                },
              ],
            },
          ],
        })),
        b2cl: b2clInvoices.map(invoice => ({
          pos: invoice.placeOfSupply.substring(0, 2), // First 2 characters of place of supply (state code)
          inv: [
            {
              inum: invoice.invoiceNumber,
              idt: invoice.invoiceDate.toISOString().split('T')[0],
              val: invoice.totalAmount,
              itms: [
                {
                  txval: invoice.totalTaxableValue,
                  iamt: invoice.totalIgstAmount,
                },
              ],
            },
          ],
        })),
        // Simplified B2CS section
        b2cs: [
          {
            sply_ty: 'INTRA', // Supply type (INTRA/INTER)
            pos: req.body.stateCode, // Place of supply (state code)
            txval: gstReturn.b2csInvoices.reduce((sum, id) => sum + id.totalTaxableValue, 0),
            camt: gstReturn.b2csInvoices.reduce((sum, id) => sum + id.totalCgstAmount, 0),
            samt: gstReturn.b2csInvoices.reduce((sum, id) => sum + id.totalSgstAmount, 0),
          },
        ],
      };
    } else if (gstReturn.returnType === 'GSTR-3B') {
      jsonData = {
        gstin: req.body.gstin, // GSTIN of the taxpayer
        ret_period: `${gstReturn.period.month.toString().padStart(2, '0')}${gstReturn.period.year}`, // Period (MMYYYY)
        sup_details: {
          osup_det: {
            txval: gstReturn.outwardSupplies.taxableValue,
            iamt: gstReturn.outwardSupplies.integratedTax,
            camt: gstReturn.outwardSupplies.centralTax,
            samt: gstReturn.outwardSupplies.stateTax,
            csamt: gstReturn.outwardSupplies.cess,
          },
          isup_rev: {
            txval: 0, // Reverse charge inward supplies - not implemented
            iamt: 0,
            camt: 0,
            samt: 0,
            csamt: 0,
          },
        },
        itc_elg: {
          itc_avl: [
            {
              ty: 'IMPG', // Import of goods
              iamt: 0, // Not implemented
              csamt: 0,
            },
            {
              ty: 'IMPS', // Import of services
              iamt: 0, // Not implemented
              csamt: 0,
            },
            {
              ty: 'ISRC', // ITC on reverse charge
              iamt: 0, // Not implemented
              camt: 0,
              samt: 0,
              csamt: 0,
            },
            {
              ty: 'ISD', // ITC received from ISD
              iamt: 0, // Not implemented
              camt: 0,
              samt: 0,
              csamt: 0,
            },
            {
              ty: 'OTH', // All other ITC
              iamt: gstReturn.itcAvailed.integratedTax,
              camt: gstReturn.itcAvailed.centralTax,
              samt: gstReturn.itcAvailed.stateTax,
              csamt: gstReturn.itcAvailed.cess,
            },
          ],
        },
        inward_sup: {
          isup_details: [
            {
              ty: 'GST', // GST supplies
              inter: gstReturn.inwardSupplies.integratedTax > 0 ? gstReturn.inwardSupplies.taxableValue : 0,
              intra: gstReturn.inwardSupplies.centralTax > 0 ? gstReturn.inwardSupplies.taxableValue : 0,
            },
          ],
        },
        tax_pmt: {
          ldg_details: [
            {
              ldg_id: 'IGST',
              ldg_val: gstReturn.taxPayable.integratedTax,
              trans_typ: 'DB', // Debit
            },
            {
              ldg_id: 'CGST',
              ldg_val: gstReturn.taxPayable.centralTax,
              trans_typ: 'DB', // Debit
            },
            {
              ldg_id: 'SGST',
              ldg_val: gstReturn.taxPayable.stateTax,
              trans_typ: 'DB', // Debit
            },
            {
              ldg_id: 'CESS',
              ldg_val: gstReturn.taxPayable.cess,
              trans_typ: 'DB', // Debit
            },
          ],
        },
      };
    }

    // Update the return with JSON data
    gstReturn.jsonData = jsonData;
    gstReturn.lastUpdatedBy = req.user.id;

    await gstReturn.save();

    res.status(200).json({
      success: true,
      message: `${gstReturn.returnType} JSON generated successfully`,
      data: {
        id: gstReturn._id,
        returnType: gstReturn.returnType,
        period: gstReturn.period,
        status: gstReturn.status,
        jsonData,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mark GST return as filed
 * @route PATCH /api/v1/returns/:id/file
 * @access Private
 */
exports.markAsFiled = async (req, res, next) => {
  try {
    const { acknowledgementNumber, filingDate } = req.body;

    if (!acknowledgementNumber) {
      return next(new AppError('Acknowledgement number is required', 400));
    }

    // Find the return
    const gstReturn = await GSTReturn.findOne({
      _id: req.params.id,
      tenant: req.tenantId,
    });

    if (!gstReturn) {
      return next(new AppError('GST return not found', 404));
    }

    if (gstReturn.status !== 'Generated') {
      return next(new AppError('Return must be in Generated status to mark as filed', 400));
    }

    // Update return status
    gstReturn.status = 'Filed';
    gstReturn.acknowledgementNumber = acknowledgementNumber;
    gstReturn.filingDate = filingDate || new Date();
    gstReturn.acknowledgementDate = new Date();
    gstReturn.lastUpdatedBy = req.user.id;

    await gstReturn.save();

    res.status(200).json({
      success: true,
      message: `${gstReturn.returnType} marked as filed successfully`,
      data: {
        id: gstReturn._id,
        returnType: gstReturn.returnType,
        period: gstReturn.period,
        status: gstReturn.status,
        acknowledgementNumber: gstReturn.acknowledgementNumber,
        filingDate: gstReturn.filingDate,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get GST return statistics
 * @route GET /api/v1/returns/stats
 * @access Private
 */
exports.getReturnStats = async (req, res, next) => {
  try {
    const { year } = req.query;

    // Build year filter
    const yearFilter = year ? { 'period.year': parseInt(year) } : {};

    // Get GSTR-1 statistics
    const gstr1Stats = await GSTReturn.aggregate([
      {
        $match: {
          tenant: mongoose.Types.ObjectId(req.tenantId),
          returnType: 'GSTR-1',
          ...yearFilter,
        },
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    // Get GSTR-3B statistics
    const gstr3bStats = await GSTReturn.aggregate([
      {
        $match: {
          tenant: mongoose.Types.ObjectId(req.tenantId),
          returnType: 'GSTR-3B',
          ...yearFilter,
        },
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    // Format statistics
    const formatStats = (stats) => {
      const result = {
        Draft: 0,
        Generated: 0,
        Filed: 0,
        Error: 0,
        total: 0,
      };

      stats.forEach((stat) => {
        result[stat._id] = stat.count;
        result.total += stat.count;
      });

      return result;
    };

    res.status(200).json({
      success: true,
      data: {
        gstr1: formatStats(gstr1Stats),
        gstr3b: formatStats(gstr3bStats),
      },
    });
  } catch (error) {
    next(error);
  }
};