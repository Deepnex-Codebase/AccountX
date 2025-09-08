/**
 * KPI Controller
 * Handles CRUD operations for Key Performance Indicators
 */

const asyncHandler = require('express-async-handler');
const Kpi = require('../../models/cfo/kpis.model');

/**
 * @desc    Create a new KPI
 * @route   POST /api/v1/cfo/kpis
 * @access  Private
 */
exports.createKpi = asyncHandler(async (req, res) => {
  // Add tenant ID to the KPI data
  req.body.tenantId = req.tenantId;

  // Check if KPI with same name and period already exists for this tenant
  const existingKpi = await Kpi.findOne({
    tenantId: req.tenantId,
    name: req.body.name,
    period: req.body.period
  });

  if (existingKpi) {
    res.status(400);
    throw new Error('KPI with this name and period already exists');
  }

  // Create the KPI
  const kpi = await Kpi.create(req.body);

  res.status(201).json({
    success: true,
    data: kpi
  });
});

/**
 * @desc    Get all KPIs
 * @route   GET /api/v1/cfo/kpis
 * @access  Private
 */
exports.getKpis = asyncHandler(async (req, res) => {
  const { period, category, status, sortBy, sortOrder, page = 1, limit = 10 } = req.query;
  
  // Build filter object
  const filter = { tenantId: req.tenantId };
  
  if (period) {
    filter.period = period;
  }
  
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
    sort.period = -1; // Default sort by period, newest first
  }
  
  // Calculate pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  // Find KPIs with filters and pagination
  const kpis = await Kpi.find(filter)
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit));
  
  // Get total count for pagination
  const total = await Kpi.countDocuments(filter);
  
  res.status(200).json({
    success: true,
    count: kpis.length,
    total,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit))
    },
    data: kpis
  });
});

/**
 * @desc    Get KPI by ID
 * @route   GET /api/v1/cfo/kpis/:id
 * @access  Private
 */
exports.getKpiById = asyncHandler(async (req, res) => {
  const kpi = await Kpi.findOne({
    _id: req.params.id,
    tenantId: req.tenantId
  });

  if (!kpi) {
    res.status(404);
    throw new Error('KPI not found');
  }

  res.status(200).json({
    success: true,
    data: kpi
  });
});

/**
 * @desc    Update KPI
 * @route   PUT /api/v1/cfo/kpis/:id
 * @access  Private
 */
exports.updateKpi = asyncHandler(async (req, res) => {
  // Find the KPI first
  const existingKpi = await Kpi.findOne({
    _id: req.params.id,
    tenantId: req.tenantId
  });

  if (!existingKpi) {
    res.status(404);
    throw new Error('KPI not found');
  }

  // If name or period is being updated, check for duplicates
  if ((req.body.name && req.body.name !== existingKpi.name) || 
      (req.body.period && req.body.period !== existingKpi.period)) {
    const duplicateKpi = await Kpi.findOne({
      tenantId: req.tenantId,
      name: req.body.name || existingKpi.name,
      period: req.body.period || existingKpi.period,
      _id: { $ne: req.params.id }
    });

    if (duplicateKpi) {
      res.status(400);
      throw new Error('KPI with this name and period already exists');
    }
  }

  // Update the KPI
  const kpi = await Kpi.findOneAndUpdate(
    { _id: req.params.id, tenantId: req.tenantId },
    req.body,
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    data: kpi
  });
});

/**
 * @desc    Delete KPI
 * @route   DELETE /api/v1/cfo/kpis/:id
 * @access  Private
 */
exports.deleteKpi = asyncHandler(async (req, res) => {
  // Find the KPI first
  const existingKpi = await Kpi.findOne({
    _id: req.params.id,
    tenantId: req.tenantId
  });

  if (!existingKpi) {
    res.status(404);
    throw new Error('KPI not found');
  }

  // Delete the KPI
  await Kpi.findOneAndDelete({
    _id: req.params.id,
    tenantId: req.tenantId
  });

  res.status(200).json({
    success: true,
    data: {}
  });
});