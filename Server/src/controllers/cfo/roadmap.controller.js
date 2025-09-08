/**
 * Roadmap Controller
 * Handles CRUD operations for financial roadmaps
 */

const asyncHandler = require('express-async-handler');
const Roadmap = require('../../models/cfo/roadmaps.model');
const Scenario = require('../../models/cfo/scenarios.model');

/**
 * @desc    Create a new roadmap
 * @route   POST /api/v1/cfo/roadmaps
 * @access  Private
 */
exports.createRoadmap = asyncHandler(async (req, res) => {
  // Add tenant ID to the roadmap data
  req.body.tenantId = req.tenantId;

  // Check if roadmap with same name already exists for this tenant
  const existingRoadmap = await Roadmap.findOne({
    tenantId: req.tenantId,
    name: req.body.name
  });

  if (existingRoadmap) {
    res.status(400);
    throw new Error('Roadmap with this name already exists');
  }

  // Create the roadmap
  const roadmap = await Roadmap.create(req.body);

  res.status(201).json({
    success: true,
    data: roadmap
  });
});

/**
 * @desc    Get all roadmaps
 * @route   GET /api/v1/cfo/roadmaps
 * @access  Private
 */
exports.getRoadmaps = asyncHandler(async (req, res) => {
  const { fiscalYear, status, sortBy, sortOrder, page = 1, limit = 10 } = req.query;
  
  // Build filter object
  const filter = { tenantId: req.tenantId };
  
  if (fiscalYear) {
    filter.fiscalYear = fiscalYear;
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
  
  // Find roadmaps with filters and pagination
  const roadmaps = await Roadmap.find(filter)
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit));
  
  // Get total count for pagination
  const total = await Roadmap.countDocuments(filter);
  
  res.status(200).json({
    success: true,
    count: roadmaps.length,
    total,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit))
    },
    data: roadmaps
  });
});

/**
 * @desc    Get roadmap by ID
 * @route   GET /api/v1/cfo/roadmaps/:id
 * @access  Private
 */
exports.getRoadmapById = asyncHandler(async (req, res) => {
  const roadmap = await Roadmap.findOne({
    _id: req.params.id,
    tenantId: req.tenantId
  });

  if (!roadmap) {
    res.status(404);
    throw new Error('Roadmap not found');
  }

  res.status(200).json({
    success: true,
    data: roadmap
  });
});

/**
 * @desc    Update roadmap
 * @route   PUT /api/v1/cfo/roadmaps/:id
 * @access  Private
 */
exports.updateRoadmap = asyncHandler(async (req, res) => {
  // Find the roadmap first
  const existingRoadmap = await Roadmap.findOne({
    _id: req.params.id,
    tenantId: req.tenantId
  });

  if (!existingRoadmap) {
    res.status(404);
    throw new Error('Roadmap not found');
  }

  // If name is being updated, check for duplicates
  if (req.body.name && req.body.name !== existingRoadmap.name) {
    const duplicateRoadmap = await Roadmap.findOne({
      tenantId: req.tenantId,
      name: req.body.name,
      _id: { $ne: req.params.id }
    });

    if (duplicateRoadmap) {
      res.status(400);
      throw new Error('Roadmap with this name already exists');
    }
  }

  // Update the roadmap
  const roadmap = await Roadmap.findOneAndUpdate(
    { _id: req.params.id, tenantId: req.tenantId },
    req.body,
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    data: roadmap
  });
});

/**
 * @desc    Delete roadmap
 * @route   DELETE /api/v1/cfo/roadmaps/:id
 * @access  Private
 */
exports.deleteRoadmap = asyncHandler(async (req, res) => {
  // Find the roadmap first
  const existingRoadmap = await Roadmap.findOne({
    _id: req.params.id,
    tenantId: req.tenantId
  });

  if (!existingRoadmap) {
    res.status(404);
    throw new Error('Roadmap not found');
  }

  // Delete all associated scenarios first
  await Scenario.deleteMany({
    roadmapId: req.params.id,
    tenantId: req.tenantId
  });

  // Delete the roadmap
  await Roadmap.findOneAndDelete({
    _id: req.params.id,
    tenantId: req.tenantId
  });

  res.status(200).json({
    success: true,
    data: {}
  });
});

/**
 * @desc    Get scenarios for a roadmap
 * @route   GET /api/v1/cfo/roadmaps/:roadmapId/scenarios
 * @access  Private
 */
exports.getRoadmapScenarios = asyncHandler(async (req, res) => {
  // Check if roadmap exists
  const roadmap = await Roadmap.findOne({
    _id: req.params.roadmapId,
    tenantId: req.tenantId
  });

  if (!roadmap) {
    res.status(404);
    throw new Error('Roadmap not found');
  }

  // Get scenarios for this roadmap
  const scenarios = await Scenario.find({
    roadmapId: req.params.roadmapId,
    tenantId: req.tenantId
  });

  res.status(200).json({
    success: true,
    count: scenarios.length,
    data: scenarios
  });
});

/**
 * @desc    Add scenario to roadmap
 * @route   POST /api/v1/cfo/roadmaps/:roadmapId/scenarios
 * @access  Private
 */
exports.addScenarioToRoadmap = asyncHandler(async (req, res) => {
  // Check if roadmap exists
  const roadmap = await Roadmap.findOne({
    _id: req.params.roadmapId,
    tenantId: req.tenantId
  });

  if (!roadmap) {
    res.status(404);
    throw new Error('Roadmap not found');
  }

  // Add tenant ID and roadmap ID to the scenario data
  req.body.tenantId = req.tenantId;
  req.body.roadmapId = req.params.roadmapId;

  // Create the scenario
  const scenario = await Scenario.create(req.body);

  res.status(201).json({
    success: true,
    data: scenario
  });
});

/**
 * @desc    Update scenario
 * @route   PUT /api/v1/cfo/roadmaps/:roadmapId/scenarios/:id
 * @access  Private
 */
exports.updateScenario = asyncHandler(async (req, res) => {
  // Check if roadmap exists
  const roadmap = await Roadmap.findOne({
    _id: req.params.roadmapId,
    tenantId: req.tenantId
  });

  if (!roadmap) {
    res.status(404);
    throw new Error('Roadmap not found');
  }

  // Find the scenario
  const existingScenario = await Scenario.findOne({
    _id: req.params.id,
    roadmapId: req.params.roadmapId,
    tenantId: req.tenantId
  });

  if (!existingScenario) {
    res.status(404);
    throw new Error('Scenario not found');
  }

  // Update the scenario
  const scenario = await Scenario.findOneAndUpdate(
    {
      _id: req.params.id,
      roadmapId: req.params.roadmapId,
      tenantId: req.tenantId
    },
    req.body,
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    data: scenario
  });
});

/**
 * @desc    Delete scenario
 * @route   DELETE /api/v1/cfo/roadmaps/:roadmapId/scenarios/:id
 * @access  Private
 */
exports.deleteScenario = asyncHandler(async (req, res) => {
  // Check if roadmap exists
  const roadmap = await Roadmap.findOne({
    _id: req.params.roadmapId,
    tenantId: req.tenantId
  });

  if (!roadmap) {
    res.status(404);
    throw new Error('Roadmap not found');
  }

  // Find the scenario
  const existingScenario = await Scenario.findOne({
    _id: req.params.id,
    roadmapId: req.params.roadmapId,
    tenantId: req.tenantId
  });

  if (!existingScenario) {
    res.status(404);
    throw new Error('Scenario not found');
  }

  // Delete the scenario
  await Scenario.findOneAndDelete({
    _id: req.params.id,
    roadmapId: req.params.roadmapId,
    tenantId: req.tenantId
  });

  res.status(200).json({
    success: true,
    data: {}
  });
});