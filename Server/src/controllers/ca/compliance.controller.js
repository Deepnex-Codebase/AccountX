/**
 * Compliance Controller
 * Handles CRUD operations for compliance calendar and tasks
 */

const asyncHandler = require('express-async-handler');
const ComplianceTask = require('../../models/ca/compliance.model');

/**
 * @desc    Create a new compliance task
 * @route   POST /api/v1/ca/compliance-calendar
 * @access  Private
 */
exports.createComplianceTask = asyncHandler(async (req, res) => {
  // Add tenant ID to the task data
  req.body.tenantId = req.tenantId;

  // Create the compliance task
  const task = await ComplianceTask.create(req.body);

  res.status(201).json({
    success: true,
    data: task
  });
});

/**
 * @desc    Get compliance calendar (all tasks)
 * @route   GET /api/v1/ca/compliance-calendar
 * @access  Private
 */
exports.getComplianceCalendar = asyncHandler(async (req, res) => {
  const { clientId, taskType, status, dueFrom, dueTo, page = 1, limit = 10 } = req.query;
  
  // Build filter object
  const filter = { tenantId: req.tenantId };
  
  if (clientId) {
    filter.clientId = clientId;
  }
  
  if (taskType) {
    filter.taskType = taskType;
  }
  
  if (status) {
    filter.status = status;
  }
  
  // Date range filtering
  if (dueFrom || dueTo) {
    filter.dueDate = {};
    
    if (dueFrom) {
      filter.dueDate.$gte = new Date(dueFrom);
    }
    
    if (dueTo) {
      filter.dueDate.$lte = new Date(dueTo);
    }
  }
  
  // Build sort options
  const sort = {};
  sort.dueDate = 1; // Default sort by due date, earliest first
  
  // Calculate pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  // Find tasks with filters and pagination
  const tasks = await ComplianceTask.find(filter)
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit))
    .populate('clientId', 'name pan');
  
  // Get total count for pagination
  const total = await ComplianceTask.countDocuments(filter);
  
  res.status(200).json({
    success: true,
    count: tasks.length,
    total,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit))
    },
    data: tasks
  });
});

/**
 * @desc    Get compliance task by ID
 * @route   GET /api/v1/ca/compliance-calendar/:id
 * @access  Private
 */
exports.getComplianceTaskById = asyncHandler(async (req, res) => {
  const task = await ComplianceTask.findOne({
    _id: req.params.id,
    tenantId: req.tenantId
  }).populate('clientId', 'name pan');

  if (!task) {
    res.status(404);
    throw new Error('Compliance task not found');
  }

  res.status(200).json({
    success: true,
    data: task
  });
});

/**
 * @desc    Update compliance task
 * @route   PUT /api/v1/ca/compliance-calendar/:id
 * @access  Private
 */
exports.updateComplianceTask = asyncHandler(async (req, res) => {
  // Find the task first
  const existingTask = await ComplianceTask.findOne({
    _id: req.params.id,
    tenantId: req.tenantId
  });

  if (!existingTask) {
    res.status(404);
    throw new Error('Compliance task not found');
  }

  // Update the task
  const task = await ComplianceTask.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  ).populate('clientId', 'name pan');

  res.status(200).json({
    success: true,
    data: task
  });
});

/**
 * @desc    Delete compliance task
 * @route   DELETE /api/v1/ca/compliance-calendar/:id
 * @access  Private
 */
exports.deleteComplianceTask = asyncHandler(async (req, res) => {
  const task = await ComplianceTask.findOne({
    _id: req.params.id,
    tenantId: req.tenantId
  });

  if (!task) {
    res.status(404);
    throw new Error('Compliance task not found');
  }

  await task.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});

/**
 * @desc    Mark compliance task as complete
 * @route   PATCH /api/v1/ca/compliance-calendar/:id/mark-complete
 * @access  Private
 */
exports.markTaskComplete = asyncHandler(async (req, res) => {
  const task = await ComplianceTask.findOne({
    _id: req.params.id,
    tenantId: req.tenantId
  });

  if (!task) {
    res.status(404);
    throw new Error('Compliance task not found');
  }

  task.status = 'Completed';
  task.completedDate = new Date();
  task.completedBy = req.user._id;
  task.comments = req.body.comments || task.comments;

  await task.save();

  res.status(200).json({
    success: true,
    data: task
  });
});