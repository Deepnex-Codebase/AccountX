/**
 * Fundraising Controller
 * Handles CRUD operations for fundraising items
 */

const asyncHandler = require('express-async-handler');
const FundraisingItem = require('../../models/cfo/fundraisingItems.model');

/**
 * @desc    Create a new fundraising item
 * @route   POST /api/v1/cfo/fundraising
 * @access  Private
 */
exports.createFundraisingItem = asyncHandler(async (req, res) => {
  // Add tenant ID to the fundraising item data
  req.body.tenantId = req.tenantId;

  // Check if fundraising item with same investor and stage already exists for this tenant
  const existingItem = await FundraisingItem.findOne({
    tenantId: req.tenantId,
    investor: req.body.investor,
    stage: req.body.stage
  });

  if (existingItem) {
    res.status(400);
    throw new Error('Fundraising item with this investor and stage already exists');
  }

  // Create the fundraising item
  const fundraisingItem = await FundraisingItem.create(req.body);

  res.status(201).json({
    success: true,
    data: fundraisingItem
  });
});

/**
 * @desc    Get all fundraising items
 * @route   GET /api/v1/cfo/fundraising
 * @access  Private
 */
exports.getFundraisingItems = asyncHandler(async (req, res) => {
  const { investor, stage, status, sortBy, sortOrder, page = 1, limit = 10 } = req.query;
  
  // Build filter object
  const filter = { tenantId: req.tenantId };
  
  if (investor) {
    filter.investor = investor;
  }
  
  if (stage) {
    filter.stage = stage;
  }
  
  if (status) {
    filter.status = status;
  }
  
  // Build sort options
  const sort = {};
  if (sortBy) {
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
  } else {
    sort.updatedAt = -1; // Default sort by last update, newest first
  }
  
  // Calculate pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  // Find fundraising items with filters and pagination
  const fundraisingItems = await FundraisingItem.find(filter)
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit));
  
  // Get total count for pagination
  const total = await FundraisingItem.countDocuments(filter);
  
  res.status(200).json({
    success: true,
    count: fundraisingItems.length,
    total,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit))
    },
    data: fundraisingItems
  });
});

/**
 * @desc    Get fundraising item by ID
 * @route   GET /api/v1/cfo/fundraising/:id
 * @access  Private
 */
exports.getFundraisingItemById = asyncHandler(async (req, res) => {
  const fundraisingItem = await FundraisingItem.findOne({
    _id: req.params.id,
    tenantId: req.tenantId
  });

  if (!fundraisingItem) {
    res.status(404);
    throw new Error('Fundraising item not found');
  }

  res.status(200).json({
    success: true,
    data: fundraisingItem
  });
});

/**
 * @desc    Update fundraising item
 * @route   PUT /api/v1/cfo/fundraising/:id
 * @access  Private
 */
exports.updateFundraisingItem = asyncHandler(async (req, res) => {
  // Find the fundraising item first
  const existingItem = await FundraisingItem.findOne({
    _id: req.params.id,
    tenantId: req.tenantId
  });

  if (!existingItem) {
    res.status(404);
    throw new Error('Fundraising item not found');
  }

  // If investor or stage is being updated, check for duplicates
  if ((req.body.investor && req.body.investor !== existingItem.investor) || 
      (req.body.stage && req.body.stage !== existingItem.stage)) {
    const duplicateItem = await FundraisingItem.findOne({
      tenantId: req.tenantId,
      investor: req.body.investor || existingItem.investor,
      stage: req.body.stage || existingItem.stage,
      _id: { $ne: req.params.id }
    });

    if (duplicateItem) {
      res.status(400);
      throw new Error('Fundraising item with this investor and stage already exists');
    }
  }

  // Update the fundraising item
  const fundraisingItem = await FundraisingItem.findOneAndUpdate(
    { _id: req.params.id, tenantId: req.tenantId },
    req.body,
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    data: fundraisingItem
  });
});

/**
 * @desc    Delete fundraising item
 * @route   DELETE /api/v1/cfo/fundraising/:id
 * @access  Private
 */
exports.deleteFundraisingItem = asyncHandler(async (req, res) => {
  // Find the fundraising item first
  const existingItem = await FundraisingItem.findOne({
    _id: req.params.id,
    tenantId: req.tenantId
  });

  if (!existingItem) {
    res.status(404);
    throw new Error('Fundraising item not found');
  }

  // Delete the fundraising item
  await FundraisingItem.findOneAndDelete({
    _id: req.params.id,
    tenantId: req.tenantId
  });

  res.status(200).json({
    success: true,
    data: {}
  });
});