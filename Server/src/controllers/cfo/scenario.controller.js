/**
 * Scenario Controller
 * Handles business logic for scenario operations
 */

const Scenario = require('../../models/cfo/scenario.model');
const Roadmap = require('../../models/cfo/roadmap.model');
const { AppError, asyncHandler } = require('../../utils/appError');

/**
 * Get all scenarios with filtering, sorting, and pagination
 */
exports.getScenarios = asyncHandler(async (req, res) => {
  const { 
    page = 1, 
    limit = 10, 
    sortBy = 'createdAt', 
    sortOrder = 'desc',
    roadmapId,
    type,
    status,
    probabilityMin,
    probabilityMax,
    search
  } = req.query;
  const filter = { tenantId: req.tenantId };
  if (roadmapId) filter.roadmapId = roadmapId;
  if (type) filter.type = type;
  if (status) filter.status = status;
  if (probabilityMin !== undefined || probabilityMax !== undefined) {
    filter.probability = {};
    if (probabilityMin !== undefined) filter.probability.$gte = parseFloat(probabilityMin);
    if (probabilityMax !== undefined) filter.probability.$lte = parseFloat(probabilityMax);
  }
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const sort = {};
  sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
  const scenarios = await Scenario.find(filter)
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit))
    .populate('roadmapId', 'name')
    .populate('createdBy', 'name email')
    .populate('lastModifiedBy', 'name email');
  const total = await Scenario.countDocuments(filter);
  res.status(200).json({
    success: true,
    count: scenarios.length,
    total,
    totalPages: Math.ceil(total / parseInt(limit)),
    currentPage: parseInt(page),
    data: scenarios
  });
});

/**
 * Get a single scenario by ID
 */
exports.getScenarioById = asyncHandler(async (req, res) => {
  const scenario = await Scenario.findOne({
    _id: req.params.id,
    tenantId: req.tenantId
  })
    .populate('roadmapId', 'name startDate endDate status')
    .populate('createdBy', 'name email')
    .populate('lastModifiedBy', 'name email');
  if (!scenario) {
    throw new AppError('Scenario not found', 404);
  }
  res.status(200).json({
    success: true,
    data: scenario
  });
});

/**
 * Create a new scenario
 */
exports.createScenario = asyncHandler(async (req, res) => {
  if (req.body.roadmapId) {
    const roadmap = await Roadmap.findOne({
      _id: req.body.roadmapId,
      tenantId: req.tenantId
    });
    if (!roadmap) {
      throw new AppError('Roadmap not found', 404);
    }
  }
  if (req.body.roadmapId && req.body.name) {
    const existingScenario = await Scenario.findOne({
      roadmapId: req.body.roadmapId,
      name: req.body.name,
      tenantId: req.tenantId
    });
    if (existingScenario) {
      throw new AppError('A scenario with this name already exists for this roadmap', 400);
    }
  }
  const scenario = new Scenario({
    ...req.body,
    tenantId: req.tenantId,
    createdBy: req.user.id,
    lastModifiedBy: req.user.id
  });
  await scenario.save();
  res.status(201).json({
    success: true,
    data: scenario
  });
});

/**
 * Update an existing scenario
 */
exports.updateScenario = asyncHandler(async (req, res) => {
  let scenario = await Scenario.findOne({
    _id: req.params.id,
    tenantId: req.tenantId
  });
  if (!scenario) {
    throw new AppError('Scenario not found', 404);
  }
  if (req.body.roadmapId && req.body.roadmapId !== scenario.roadmapId.toString()) {
    const roadmap = await Roadmap.findOne({
      _id: req.body.roadmapId,
      tenantId: req.tenantId
    });
    if (!roadmap) {
      throw new AppError('Roadmap not found', 404);
    }
  }
  if (req.body.name && req.body.name !== scenario.name) {
    const roadmapId = req.body.roadmapId || scenario.roadmapId;
    const existingScenario = await Scenario.findOne({
      roadmapId,
      name: req.body.name,
      tenantId: req.tenantId,
      _id: { $ne: req.params.id }
    });
    if (existingScenario) {
      throw new AppError('A scenario with this name already exists for this roadmap', 400);
    }
  }
  scenario = await Scenario.findOneAndUpdate(
    { _id: req.params.id, tenantId: req.tenantId },
    { 
      ...req.body,
      lastModifiedBy: req.user.id 
    },
    { new: true, runValidators: true }
  );
  res.status(200).json({
    success: true,
    data: scenario
  });
});

/**
 * Delete a scenario
 */
exports.deleteScenario = asyncHandler(async (req, res) => {
  const scenario = await Scenario.findOne({
    _id: req.params.id,
    tenantId: req.tenantId
  });
  if (!scenario) {
    throw new AppError('Scenario not found', 404);
  }
  await Scenario.findOneAndDelete({
    _id: req.params.id,
    tenantId: req.tenantId
  });
  res.status(200).json({
    success: true,
    message: 'Scenario deleted successfully'
  });
});

/**
 * Add a variable to a scenario
 */
exports.addVariable = asyncHandler(async (req, res) => {
  const scenario = await Scenario.findOne({
    _id: req.params.id,
    tenantId: req.tenantId
  });
  if (!scenario) {
    throw new AppError('Scenario not found', 404);
  }
  scenario.variables.push({
    ...req.body,
    createdBy: req.user.id,
    createdAt: new Date()
  });
  await scenario.save();
  res.status(200).json({
    success: true,
    data: scenario
  });
});

/**
 * Update a variable in a scenario
 */
exports.updateVariable = asyncHandler(async (req, res) => {
  const scenario = await Scenario.findOne({
    _id: req.params.id,
    tenantId: req.tenantId,
    'variables._id': req.params.variableId
  });
  if (!scenario) {
    throw new AppError('Scenario or variable not found', 404);
  }
  const variableIndex = scenario.variables.findIndex(
    variable => variable._id.toString() === req.params.variableId
  );
  if (variableIndex === -1) {
    throw new AppError('Variable not found', 404);
  }
  Object.keys(req.body).forEach(key => {
    scenario.variables[variableIndex][key] = req.body[key];
  });
  scenario.variables[variableIndex].lastModifiedBy = req.user.id;
  scenario.variables[variableIndex].lastModifiedAt = new Date();
  await scenario.save();
  res.status(200).json({
    success: true,
    data: scenario
  });
});

/**
 * Delete a variable from a scenario
 */
exports.deleteVariable = asyncHandler(async (req, res) => {
  const scenario = await Scenario.findOne({
    _id: req.params.id,
    tenantId: req.tenantId
  });
  if (!scenario) {
    throw new AppError('Scenario not found', 404);
  }
  const variableIndex = scenario.variables.findIndex(
    variable => variable._id.toString() === req.params.variableId
  );
  if (variableIndex === -1) {
    throw new AppError('Variable not found', 404);
  }
  scenario.variables.splice(variableIndex, 1);
  await scenario.save();
  res.status(200).json({
    success: true,
    message: 'Variable deleted successfully'
  });
});

/**
 * Add an outcome to a scenario
 */
exports.addOutcome = asyncHandler(async (req, res) => {
  const scenario = await Scenario.findOne({
    _id: req.params.id,
    tenantId: req.tenantId
  });
  if (!scenario) {
    throw new AppError('Scenario not found', 404);
  }
  scenario.outcomes.push({
    ...req.body,
    createdBy: req.user.id,
    createdAt: new Date()
  });
  await scenario.save();
  res.status(200).json({
    success: true,
    data: scenario
  });
});

/**
 * Update an outcome in a scenario
 */
exports.updateOutcome = asyncHandler(async (req, res) => {
  const scenario = await Scenario.findOne({
    _id: req.params.id,
    tenantId: req.tenantId,
    'outcomes._id': req.params.outcomeId
  });
  if (!scenario) {
    throw new AppError('Scenario or outcome not found', 404);
  }
  const outcomeIndex = scenario.outcomes.findIndex(
    outcome => outcome._id.toString() === req.params.outcomeId
  );
  if (outcomeIndex === -1) {
    throw new AppError('Outcome not found', 404);
  }
  Object.keys(req.body).forEach(key => {
    scenario.outcomes[outcomeIndex][key] = req.body[key];
  });
  scenario.outcomes[outcomeIndex].lastModifiedBy = req.user.id;
  scenario.outcomes[outcomeIndex].lastModifiedAt = new Date();
  await scenario.save();
  res.status(200).json({
    success: true,
    data: scenario
  });
});

/**
 * Delete an outcome from a scenario
 */
exports.deleteOutcome = asyncHandler(async (req, res) => {
  const scenario = await Scenario.findOne({
    _id: req.params.id,
    tenantId: req.tenantId
  });
  if (!scenario) {
    throw new AppError('Scenario not found', 404);
  }
  const outcomeIndex = scenario.outcomes.findIndex(
    outcome => outcome._id.toString() === req.params.outcomeId
  );
  if (outcomeIndex === -1) {
    throw new AppError('Outcome not found', 404);
  }
  scenario.outcomes.splice(outcomeIndex, 1);
  await scenario.save();
  res.status(200).json({
    success: true,
    message: 'Outcome deleted successfully'
  });
});

/**
 * Get scenarios by roadmap ID
 */
exports.getScenariosByRoadmap = asyncHandler(async (req, res) => {
  const { 
    page = 1, 
    limit = 10, 
    sortBy = 'createdAt', 
    sortOrder = 'desc'
  } = req.query;
  const roadmap = await Roadmap.findOne({
    _id: req.params.roadmapId,
    tenantId: req.tenantId
  });
  if (!roadmap) {
    throw new AppError('Roadmap not found', 404);
  }
  const filter = { 
    tenantId: req.tenantId,
    roadmapId: req.params.roadmapId
  };
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const sort = {};
  sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
  const scenarios = await Scenario.find(filter)
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit))
    .populate('createdBy', 'name email')
    .populate('lastModifiedBy', 'name email');
  const total = await Scenario.countDocuments(filter);
  res.status(200).json({
    success: true,
    count: scenarios.length,
    total,
    totalPages: Math.ceil(total / parseInt(limit)),
    currentPage: parseInt(page),
    data: scenarios
  });
});

/**
 * Compare multiple scenarios
 */
exports.compareScenarios = asyncHandler(async (req, res) => {
  const { scenarioIds } = req.body;
  if (!scenarioIds || !Array.isArray(scenarioIds) || scenarioIds.length < 2) {
    throw new AppError('Please provide at least two scenario IDs for comparison', 400);
  }
  const scenarios = await Scenario.find({
    _id: { $in: scenarioIds },
    tenantId: req.tenantId
  }).select('name type probability variables outcomes');
  if (scenarios.length !== scenarioIds.length) {
    throw new AppError('One or more scenarios not found', 404);
  }
  const comparison = scenarios.map(scenario => {
    const financialOutcomes = {};
    scenario.outcomes.forEach(outcome => {
      if (outcome.category === 'financial' && outcome.value !== undefined) {
        financialOutcomes[outcome.name] = outcome.value;
      }
    });
    const keyVariables = {};
    scenario.variables.forEach(variable => {
      keyVariables[variable.name] = variable.value;
    });
    return {
      id: scenario._id,
      name: scenario.name,
      type: scenario.type,
      probability: scenario.probability,
      financialOutcomes,
      keyVariables
    };
  });
  res.status(200).json({
    success: true,
    data: comparison
  });
});