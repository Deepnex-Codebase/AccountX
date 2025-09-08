/**
 * Model Controller
 * Handles CRUD operations for financial models
 */

const asyncHandler = require('express-async-handler');
const FinancialModel = require('../../models/cfo/financialModel.model');

/**
 * @desc    Create a new financial model
 * @route   POST /api/v1/cfo/models
 * @access  Private
 */
exports.createModel = asyncHandler(async (req, res) => {
  // Add tenant ID to the model data
  req.body.tenantId = req.tenantId;

  // Check if model with same name already exists for this tenant
  const existingModel = await FinancialModel.findOne({
    tenantId: req.tenantId,
    name: req.body.name
  });

  if (existingModel) {
    res.status(400);
    throw new Error('Financial model with this name already exists');
  }

  // Create the financial model
  const financialModel = await FinancialModel.create(req.body);

  res.status(201).json({
    success: true,
    data: financialModel
  });
});

/**
 * @desc    Get all financial models
 * @route   GET /api/v1/cfo/models
 * @access  Private
 */
exports.getModels = asyncHandler(async (req, res) => {
  const { category, status, sortBy, sortOrder, page = 1, limit = 10 } = req.query;
  
  // Build filter object
  const filter = { tenantId: req.tenantId };
  
  if (category) {
    filter.category = category;
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
  
  // Find financial models with filters and pagination
  const models = await FinancialModel.find(filter)
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit));
  
  // Get total count for pagination
  const total = await FinancialModel.countDocuments(filter);
  
  res.status(200).json({
    success: true,
    count: models.length,
    total,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit))
    },
    data: models
  });
});

/**
 * @desc    Get financial model by ID
 * @route   GET /api/v1/cfo/models/:id
 * @access  Private
 */
exports.getModelById = asyncHandler(async (req, res) => {
  const model = await FinancialModel.findOne({
    _id: req.params.id,
    tenantId: req.tenantId
  });

  if (!model) {
    res.status(404);
    throw new Error('Financial model not found');
  }

  res.status(200).json({
    success: true,
    data: model
  });
});

/**
 * @desc    Update financial model
 * @route   PUT /api/v1/cfo/models/:id
 * @access  Private
 */
exports.updateModel = asyncHandler(async (req, res) => {
  // Find the financial model first
  const existingModel = await FinancialModel.findOne({
    _id: req.params.id,
    tenantId: req.tenantId
  });

  if (!existingModel) {
    res.status(404);
    throw new Error('Financial model not found');
  }

  // If name is being updated, check for duplicates
  if (req.body.name && req.body.name !== existingModel.name) {
    const duplicateModel = await FinancialModel.findOne({
      tenantId: req.tenantId,
      name: req.body.name,
      _id: { $ne: req.params.id }
    });

    if (duplicateModel) {
      res.status(400);
      throw new Error('Financial model with this name already exists');
    }
  }

  // Update the financial model
  const model = await FinancialModel.findOneAndUpdate(
    { _id: req.params.id, tenantId: req.tenantId },
    req.body,
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    data: model
  });
});

/**
 * @desc    Delete financial model
 * @route   DELETE /api/v1/cfo/models/:id
 * @access  Private
 */
exports.deleteModel = asyncHandler(async (req, res) => {
  // Find the financial model first
  const existingModel = await FinancialModel.findOne({
    _id: req.params.id,
    tenantId: req.tenantId
  });

  if (!existingModel) {
    res.status(404);
    throw new Error('Financial model not found');
  }

  // Delete the financial model
  await FinancialModel.findOneAndDelete({
    _id: req.params.id,
    tenantId: req.tenantId
  });

  res.status(200).json({
    success: true,
    data: {}
  });
});

/**
 * @desc    Run financial model simulation
 * @route   POST /api/v1/cfo/models/:id/simulate
 * @access  Private
 */
exports.runModelSimulation = asyncHandler(async (req, res) => {
  // Find the financial model first
  const model = await FinancialModel.findOne({
    _id: req.params.id,
    tenantId: req.tenantId
  });

  if (!model) {
    res.status(404);
    throw new Error('Financial model not found');
  }

  // This is a placeholder for the model simulation functionality
  // In a real implementation, this would execute the model's logic
  // and return the results
  
  // For now, we'll just return a success message
  res.status(200).json({
    success: true,
    message: 'Model simulation initiated',
    data: {
      jobId: 'simulation-' + Date.now(),
      status: 'processing',
      estimatedCompletionTime: new Date(Date.now() + 5 * 60 * 1000) // 5 minutes from now
    }
  });
});