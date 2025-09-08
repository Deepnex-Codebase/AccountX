/**
 * Control Controller
 * Handles CRUD operations for control items
 */

const asyncHandler = require('express-async-handler');
const ControlItem = require('../../models/cfo/controlItems.model');

/**
 * @desc    Create a new control item
 * @route   POST /api/v1/cfo/controls
 * @access  Private
 */
exports.createControlItem = asyncHandler(async (req, res) => {
  // Add tenant ID to the control item data
  req.body.tenantId = req.tenantId;

  // Create the control item
  const controlItem = await ControlItem.create(req.body);

  res.status(201).json({
    success: true,
    data: controlItem
  });
});

/**
 * @desc    Get all control items
 * @route   GET /api/v1/cfo/controls
 * @access  Private
 */
exports.getControlItems = asyncHandler(async (req, res) => {
  const { category, type, status, sortBy, sortOrder, page = 1, limit = 10 } = req.query;
  
  // Build filter object
  const filter = { tenantId: req.tenantId };
  
  if (category) {
    filter.category = category;
  }
  
  if (type) {
    filter.type = type;
  }
  
  if (status) {
    filter.status = status;
  }
  
  // Build sort options
  const sort = {};
  if (sortBy) {
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
  } else {
    sort.createdAt = -1; // Default sort by creation date, newest first
  }
  
  // Calculate pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  // Find control items with filters and pagination
  const controlItems = await ControlItem.find(filter)
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit));
  
  // Get total count for pagination
  const total = await ControlItem.countDocuments(filter);
  
  res.status(200).json({
    success: true,
    count: controlItems.length,
    total,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit))
    },
    data: controlItems
  });
});

/**
 * @desc    Get control item by ID
 * @route   GET /api/v1/cfo/controls/:id
 * @access  Private
 */
exports.getControlItemById = asyncHandler(async (req, res) => {
  const controlItem = await ControlItem.findOne({
    _id: req.params.id,
    tenantId: req.tenantId
  });

  if (!controlItem) {
    res.status(404);
    throw new Error('Control item not found');
  }

  res.status(200).json({
    success: true,
    data: controlItem
  });
});

/**
 * @desc    Update control item
 * @route   PUT /api/v1/cfo/controls/:id
 * @access  Private
 */
exports.updateControlItem = asyncHandler(async (req, res) => {
  // Find the control item first
  const existingControlItem = await ControlItem.findOne({
    _id: req.params.id,
    tenantId: req.tenantId
  });

  if (!existingControlItem) {
    res.status(404);
    throw new Error('Control item not found');
  }

  // Update the control item
  const controlItem = await ControlItem.findOneAndUpdate(
    { _id: req.params.id, tenantId: req.tenantId },
    req.body,
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    data: controlItem
  });
});

/**
 * @desc    Delete control item
 * @route   DELETE /api/v1/cfo/controls/:id
 * @access  Private
 */
exports.deleteControlItem = asyncHandler(async (req, res) => {
  // Find the control item first
  const existingControlItem = await ControlItem.findOne({
    _id: req.params.id,
    tenantId: req.tenantId
  });

  if (!existingControlItem) {
    res.status(404);
    throw new Error('Control item not found');
  }

  // Delete the control item
  await ControlItem.findOneAndDelete({
    _id: req.params.id,
    tenantId: req.tenantId
  });

  res.status(200).json({
    success: true,
    data: {}
  });
});