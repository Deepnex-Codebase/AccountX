/**
 * Integration Controller
 * Handles operations for external integrations
 */

const { asyncHandler } = require('../../utils/appError');
const Integration = require('../../models/integrations/integration.model');

/**
 * @desc    Get all integrations
 * @route   GET /api/v1/integrations
 * @access  Private
 */
exports.getIntegrations = asyncHandler(async (req, res) => {
  const { type, status, page = 1, limit = 10 } = req.query;
  
  // Build filter object
  const filter = { tenantId: req.tenantId };
  
  if (type) {
    filter.type = type;
  }
  
  if (status) {
    filter.status = status;
  }
  
  // Calculate pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  // Find integrations with filters and pagination
  const integrations = await Integration.find(filter)
    .sort({ createdAt: -1 }) // Default sort by creation date, newest first
    .skip(skip)
    .limit(parseInt(limit));
  
  // Get total count for pagination
  const total = await Integration.countDocuments(filter);
  
  res.status(200).json({
    success: true,
    count: integrations.length,
    total,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit))
    },
    data: integrations
  });
});

/**
 * @desc    Get integration by ID
 * @route   GET /api/v1/integrations/:id
 * @access  Private
 */
exports.getIntegrationById = asyncHandler(async (req, res) => {
  const integration = await Integration.findOne({
    _id: req.params.id,
    tenantId: req.tenantId
  });

  if (!integration) {
    res.status(404);
    throw new Error('Integration not found');
  }

  res.status(200).json({
    success: true,
    data: integration
  });
});

/**
 * @desc    Create a new integration
 * @route   POST /api/v1/integrations
 * @access  Private
 */
exports.createIntegration = asyncHandler(async (req, res) => {
  // Add tenant ID to the integration data
  req.body.tenantId = req.tenantId;

  // Create the integration
  const integration = await Integration.create(req.body);

  res.status(201).json({
    success: true,
    data: integration
  });
});

/**
 * @desc    Update integration
 * @route   PUT /api/v1/integrations/:id
 * @access  Private
 */
exports.updateIntegration = asyncHandler(async (req, res) => {
  // Find the integration first
  const existingIntegration = await Integration.findOne({
    _id: req.params.id,
    tenantId: req.tenantId
  });

  if (!existingIntegration) {
    res.status(404);
    throw new Error('Integration not found');
  }

  // Update the integration
  const integration = await Integration.findOneAndUpdate(
    { _id: req.params.id, tenantId: req.tenantId },
    req.body,
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    data: integration
  });
});

/**
 * @desc    Delete integration
 * @route   DELETE /api/v1/integrations/:id
 * @access  Private
 */
exports.deleteIntegration = asyncHandler(async (req, res) => {
  // Find the integration first
  const existingIntegration = await Integration.findOne({
    _id: req.params.id,
    tenantId: req.tenantId
  });

  if (!existingIntegration) {
    res.status(404);
    throw new Error('Integration not found');
  }

  // Delete the integration
  await Integration.findOneAndDelete({
    _id: req.params.id,
    tenantId: req.tenantId
  });

  res.status(200).json({
    success: true,
    data: {}
  });
});

/**
 * @desc    Save GSTN credentials
 * @route   POST /api/v1/integrations/gstn-credentials
 * @access  Private
 */
exports.saveGstnCredentials = asyncHandler(async (req, res) => {
  // Add tenant ID to the GSTN credentials data
  req.body.tenantId = req.tenantId;
  req.body.type = 'gstn';

  // Check if GSTN credentials already exist for this tenant
  const existingCredentials = await Integration.findOne({
    tenantId: req.tenantId,
    type: 'gstn'
  });

  let credentials;

  if (existingCredentials) {
    // Update existing credentials
    credentials = await Integration.findOneAndUpdate(
      { _id: existingCredentials._id },
      req.body,
      { new: true, runValidators: true }
    );
  } else {
    // Create new credentials
    credentials = await Integration.create(req.body);
  }

  res.status(201).json({
    success: true,
    data: credentials
  });
});

/**
 * @desc    Get GSTN credentials
 * @route   GET /api/v1/integrations/gstn-credentials
 * @access  Private
 */
exports.getGstnCredentials = asyncHandler(async (req, res) => {
  const credentials = await Integration.findOne({
    tenantId: req.tenantId,
    type: 'gstn'
  });

  if (!credentials) {
    res.status(404);
    throw new Error('GSTN credentials not found');
  }

  res.status(200).json({
    success: true,
    data: credentials
  });
});

/**
 * @desc    Connect to external system
 * @route   POST /api/v1/integrations/connect/:connectorType
 * @access  Private
 */
exports.connectExternalSystem = asyncHandler(async (req, res) => {
  const { connectorType } = req.params;
  
  // Add tenant ID and connector type to the integration data
  req.body.tenantId = req.tenantId;
  req.body.type = connectorType;

  // Check if connection already exists for this tenant and connector type
  const existingConnection = await Integration.findOne({
    tenantId: req.tenantId,
    type: connectorType
  });

  let connection;

  if (existingConnection) {
    // Update existing connection
    connection = await Integration.findOneAndUpdate(
      { _id: existingConnection._id },
      req.body,
      { new: true, runValidators: true }
    );
  } else {
    // Create new connection
    connection = await Integration.create(req.body);
  }

  res.status(201).json({
    success: true,
    data: connection
  });
});