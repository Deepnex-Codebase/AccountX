/**
 * Client Controller
 * Handles CRUD operations for CA client management
 */

const asyncHandler = require('express-async-handler');
const Client = require('../../models/ca/client.model');

/**
 * @desc    Create a new client
 * @route   POST /api/v1/ca/clients
 * @access  Private
 */
exports.createClient = asyncHandler(async (req, res) => {
  // Add tenant ID to the client data
  req.body.tenantId = req.tenantId;

  // Check if client with same PAN already exists for this tenant
  const existingClient = await Client.findOne({
    tenantId: req.tenantId,
    pan: req.body.pan
  });

  if (existingClient) {
    res.status(400);
    throw new Error('Client with this PAN already exists');
  }

  // Create the client
  const client = await Client.create(req.body);

  res.status(201).json({
    success: true,
    data: client
  });
});

/**
 * @desc    Get all clients
 * @route   GET /api/v1/ca/clients
 * @access  Private
 */
exports.getClients = asyncHandler(async (req, res) => {
  const { clientType, status, sortBy, sortOrder, page = 1, limit = 10 } = req.query;
  
  // Build filter object
  const filter = { tenantId: req.tenantId };
  
  if (clientType) {
    filter.clientType = clientType;
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
  
  // Find clients with filters and pagination
  const clients = await Client.find(filter)
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit));
  
  // Get total count for pagination
  const total = await Client.countDocuments(filter);
  
  res.status(200).json({
    success: true,
    count: clients.length,
    total,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit))
    },
    data: clients
  });
});

/**
 * @desc    Get client by ID
 * @route   GET /api/v1/ca/clients/:id
 * @access  Private
 */
exports.getClientById = asyncHandler(async (req, res) => {
  const client = await Client.findOne({
    _id: req.params.id,
    tenantId: req.tenantId
  });

  if (!client) {
    res.status(404);
    throw new Error('Client not found');
  }

  res.status(200).json({
    success: true,
    data: client
  });
});

/**
 * @desc    Update client
 * @route   PUT /api/v1/ca/clients/:id
 * @access  Private
 */
exports.updateClient = asyncHandler(async (req, res) => {
  // Find the client first
  const existingClient = await Client.findOne({
    _id: req.params.id,
    tenantId: req.tenantId
  });

  if (!existingClient) {
    res.status(404);
    throw new Error('Client not found');
  }

  // If PAN is being updated, check for duplicates
  if (req.body.pan && req.body.pan !== existingClient.pan) {
    const duplicatePan = await Client.findOne({
      tenantId: req.tenantId,
      pan: req.body.pan,
      _id: { $ne: req.params.id }
    });

    if (duplicatePan) {
      res.status(400);
      throw new Error('Another client with this PAN already exists');
    }
  }

  // Update the client
  const client = await Client.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    data: client
  });
});

/**
 * @desc    Delete client
 * @route   DELETE /api/v1/ca/clients/:id
 * @access  Private
 */
exports.deleteClient = asyncHandler(async (req, res) => {
  const client = await Client.findOne({
    _id: req.params.id,
    tenantId: req.tenantId
  });

  if (!client) {
    res.status(404);
    throw new Error('Client not found');
  }

  await client.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});