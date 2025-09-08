/**
 * Risk Controller
 * Handles CRUD operations for risk items
 */

const asyncHandler = require('express-async-handler');
const RiskItem = require('../../models/cfo/riskItems.model');

/**
 * @desc    Create a new risk item
 * @route   POST /api/v1/cfo/risks
 * @access  Private
 */
exports.createRiskItem = asyncHandler(async (req, res) => {
  // Add tenant ID to the risk item data
  req.body.tenantId = req.tenantId;

  // Create the risk item
  const riskItem = await RiskItem.create(req.body);

  res.status(201).json({
    success: true,
    data: riskItem
  });
});

/**
 * @desc    Get all risk items
 * @route   GET /api/v1/cfo/risks
 * @access  Private
 */
exports.getRiskItems = asyncHandler(async (req, res) => {
  const { category, severity, status, sortBy, sortOrder, page = 1, limit = 10 } = req.query;
  
  // Build filter object
  const filter = { tenantId: req.tenantId };
  
  if (category) {
    filter.category = category;
  }
  
  if (severity) {
    filter.severity = severity;
  }
  
  if (status) {
    filter.status = status;
  }
  
  // Build sort options
  const sort = {};
  if (sortBy) {
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
  } else {
    sort.severity = -1; // Default sort by severity, highest first
  }
  
  // Calculate pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  // Find risk items with filters and pagination
  const riskItems = await RiskItem.find(filter)
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit));
  
  // Get total count for pagination
  const total = await RiskItem.countDocuments(filter);
  
  res.status(200).json({
    success: true,
    count: riskItems.length,
    total,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit))
    },
    data: riskItems
  });
});

/**
 * @desc    Get risk item by ID
 * @route   GET /api/v1/cfo/risks/:id
 * @access  Private
 */
exports.getRiskItemById = asyncHandler(async (req, res) => {
  const riskItem = await RiskItem.findOne({
    _id: req.params.id,
    tenantId: req.tenantId
  });

  if (!riskItem) {
    res.status(404);
    throw new Error('Risk item not found');
  }

  res.status(200).json({
    success: true,
    data: riskItem
  });
});

/**
 * @desc    Update risk item
 * @route   PUT /api/v1/cfo/risks/:id
 * @access  Private
 */
exports.updateRiskItem = asyncHandler(async (req, res) => {
  // Find the risk item first
  const existingRiskItem = await RiskItem.findOne({
    _id: req.params.id,
    tenantId: req.tenantId
  });

  if (!existingRiskItem) {
    res.status(404);
    throw new Error('Risk item not found');
  }

  // Update the risk item
  const riskItem = await RiskItem.findOneAndUpdate(
    { _id: req.params.id, tenantId: req.tenantId },
    req.body,
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    data: riskItem
  });
});

/**
 * @desc    Delete risk item
 * @route   DELETE /api/v1/cfo/risks/:id
 * @access  Private
 */
exports.deleteRiskItem = asyncHandler(async (req, res) => {
  // Find the risk item first
  const existingRiskItem = await RiskItem.findOne({
    _id: req.params.id,
    tenantId: req.tenantId
  });

  if (!existingRiskItem) {
    res.status(404);
    throw new Error('Risk item not found');
  }

  // Delete the risk item
  await RiskItem.findOneAndDelete({
    _id: req.params.id,
    tenantId: req.tenantId
  });

  res.status(200).json({
    success: true,
    data: {}
  });
});