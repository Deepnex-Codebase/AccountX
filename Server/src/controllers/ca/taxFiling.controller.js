/**
 * Tax Filing Controller
 * Handles CRUD operations for tax filing management
 */

const asyncHandler = require('express-async-handler');
const TaxFiling = require('../../models/ca/taxFiling.model');

/**
 * @desc    Create a new tax filing
 * @route   POST /api/v1/ca/tax-filings
 * @access  Private
 */
exports.createTaxFiling = asyncHandler(async (req, res) => {
  // Add tenant ID to the tax filing data
  req.body.tenantId = req.tenantId;

  // Create the tax filing
  const taxFiling = await TaxFiling.create(req.body);

  res.status(201).json({
    success: true,
    data: taxFiling
  });
});

/**
 * @desc    Get all tax filings
 * @route   GET /api/v1/ca/tax-filings
 * @access  Private
 */
exports.getTaxFilings = asyncHandler(async (req, res) => {
  const { clientId, taxType, status, dueFrom, dueTo, page = 1, limit = 10 } = req.query;
  
  // Build filter object
  const filter = { tenantId: req.tenantId };
  
  if (clientId) {
    filter.clientId = clientId;
  }
  
  if (taxType) {
    filter.taxType = taxType;
  }
  
  if (status) {
    filter.status = status;
  }
  
  // Date range filtering
  if (dueFrom || dueTo) {
    filter.dueDate = {};
    
    if (dueFrom) {
      filter.dueDate.$gte = new Date(dueFrom);
    }
    
    if (dueTo) {
      filter.dueDate.$lte = new Date(dueTo);
    }
  }
  
  // Build sort options
  const sort = {};
  sort.dueDate = 1; // Default sort by due date, earliest first
  
  // Calculate pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  // Find tax filings with filters and pagination
  const taxFilings = await TaxFiling.find(filter)
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit))
    .populate('clientId', 'name pan');
  
  // Get total count for pagination
  const total = await TaxFiling.countDocuments(filter);
  
  res.status(200).json({
    success: true,
    count: taxFilings.length,
    total,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit))
    },
    data: taxFilings
  });
});

/**
 * @desc    Get tax filing by ID
 * @route   GET /api/v1/ca/tax-filings/:id
 * @access  Private
 */
exports.getTaxFilingById = asyncHandler(async (req, res) => {
  const taxFiling = await TaxFiling.findOne({
    _id: req.params.id,
    tenantId: req.tenantId
  }).populate('clientId', 'name pan');

  if (!taxFiling) {
    res.status(404);
    throw new Error('Tax filing not found');
  }

  res.status(200).json({
    success: true,
    data: taxFiling
  });
});

/**
 * @desc    Update tax filing
 * @route   PUT /api/v1/ca/tax-filings/:id
 * @access  Private
 */
exports.updateTaxFiling = asyncHandler(async (req, res) => {
  // Find the tax filing first
  const existingTaxFiling = await TaxFiling.findOne({
    _id: req.params.id,
    tenantId: req.tenantId
  });

  if (!existingTaxFiling) {
    res.status(404);
    throw new Error('Tax filing not found');
  }

  // Update the tax filing
  const taxFiling = await TaxFiling.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  ).populate('clientId', 'name pan');

  res.status(200).json({
    success: true,
    data: taxFiling
  });
});

/**
 * @desc    Delete tax filing
 * @route   DELETE /api/v1/ca/tax-filings/:id
 * @access  Private
 */
exports.deleteTaxFiling = asyncHandler(async (req, res) => {
  const taxFiling = await TaxFiling.findOne({
    _id: req.params.id,
    tenantId: req.tenantId
  });

  if (!taxFiling) {
    res.status(404);
    throw new Error('Tax filing not found');
  }

  await taxFiling.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});

/**
 * @desc    Mark tax filing as complete
 * @route   PATCH /api/v1/ca/tax-filings/:id/mark-filed
 * @access  Private
 */
exports.markTaxFilingComplete = asyncHandler(async (req, res) => {
  const taxFiling = await TaxFiling.findOne({
    _id: req.params.id,
    tenantId: req.tenantId
  });

  if (!taxFiling) {
    res.status(404);
    throw new Error('Tax filing not found');
  }

  taxFiling.status = 'Filed';
  taxFiling.filedDate = new Date();
  taxFiling.filedBy = req.user._id;
  taxFiling.acknowledgmentNo = req.body.acknowledgmentNo;
  taxFiling.notes = req.body.notes || taxFiling.notes;

  await taxFiling.save();

  res.status(200).json({
    success: true,
    data: taxFiling
  });
});