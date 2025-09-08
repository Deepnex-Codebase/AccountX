/**
 * Cap Table Controller
 * Handles API requests for cap table operations
 */

const CapTableEntry = require('../../models/cfo/capTableEntries.model');
const { asyncHandler, AppError } = require('../../utils/appError');

/**
 * @desc    Get all cap table entries
 * @route   GET /api/v1/cfo/captable
 * @access  Private (Requires authentication and authorization)
 */
exports.getCapTableEntries = asyncHandler(async (req, res) => {
  // Filter by tenant ID from authenticated user
  const filter = { tenantId: req.user.tenantId };
  
  // Add additional filters if provided
  if (req.query.shareClass) {
    filter.shareClass = req.query.shareClass;
  }
  
  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;
  
  // Find cap table entries with filters and pagination
  const capTableEntries = await CapTableEntry.find(filter)
    .sort({ ownershipPct: -1 })
    .skip(skip)
    .limit(limit);
  
  // Get total count for pagination
  const total = await CapTableEntry.countDocuments(filter);
  
  res.status(200).json({
    success: true,
    count: capTableEntries.length,
    total,
    pagination: {
      page,
      limit,
      pages: Math.ceil(total / limit)
    },
    data: capTableEntries
  });
});

/**
 * @desc    Create a new cap table entry
 * @route   POST /api/v1/cfo/captable
 * @access  Private (Requires authentication and authorization)
 */
exports.createCapTableEntry = asyncHandler(async (req, res) => {
  // Add tenant ID from authenticated user
  req.body.tenantId = req.user.tenantId;
  
  // Check if entry already exists for the entity and share class
  const existingEntry = await CapTableEntry.findOne({
    tenantId: req.user.tenantId,
    entity: req.body.entity,
    shareClass: req.body.shareClass
  });
  
  if (existingEntry) {
    return res.status(400).json({
      success: false,
      error: `A cap table entry already exists for ${req.body.entity} with share class ${req.body.shareClass}`
    });
  }
  
  // Create the cap table entry
  const capTableEntry = await CapTableEntry.create(req.body);
  
  res.status(201).json({
    success: true,
    data: capTableEntry
  });
});

/**
 * @desc    Get a single cap table entry
 * @route   GET /api/v1/cfo/captable/:id
 * @access  Private (Requires authentication and authorization)
 */
exports.getCapTableEntryById = asyncHandler(async (req, res) => {
  const capTableEntry = await CapTableEntry.findOne({
    _id: req.params.id,
    tenantId: req.user.tenantId
  });
  
  if (!capTableEntry) {
    return res.status(404).json({
      success: false,
      error: 'Cap table entry not found'
    });
  }
  
  res.status(200).json({
    success: true,
    data: capTableEntry
  });
});

/**
 * @desc    Update a cap table entry
 * @route   PUT /api/v1/cfo/captable/:id
 * @access  Private (Requires authentication and authorization)
 */
exports.updateCapTableEntry = asyncHandler(async (req, res) => {
  // Find and update the cap table entry
  const capTableEntry = await CapTableEntry.findOneAndUpdate(
    {
      _id: req.params.id,
      tenantId: req.user.tenantId
    },
    req.body,
    {
      new: true,
      runValidators: true
    }
  );
  
  if (!capTableEntry) {
    return res.status(404).json({
      success: false,
      error: 'Cap table entry not found'
    });
  }
  
  res.status(200).json({
    success: true,
    data: capTableEntry
  });
});

/**
 * @desc    Delete a cap table entry
 * @route   DELETE /api/v1/cfo/captable/:id
 * @access  Private (Requires authentication and authorization)
 */
exports.deleteCapTableEntry = asyncHandler(async (req, res) => {
  const capTableEntry = await CapTableEntry.findOneAndDelete({
    _id: req.params.id,
    tenantId: req.user.tenantId
  });
  
  if (!capTableEntry) {
    return res.status(404).json({
      success: false,
      error: 'Cap table entry not found'
    });
  }
  
  res.status(200).json({
    success: true,
    data: {}
  });
});