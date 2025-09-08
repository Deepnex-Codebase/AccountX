/**
 * Audit Controller
 * Handles CRUD operations for audit management
 */

const asyncHandler = require('express-async-handler');
const Audit = require('../../models/ca/audit.model');

/**
 * @desc    Create a new audit
 * @route   POST /api/v1/ca/audits
 * @access  Private
 */
exports.createAudit = asyncHandler(async (req, res) => {
  // Add tenant ID to the audit data
  req.body.tenantId = req.tenantId;

  // Create the audit
  const audit = await Audit.create(req.body);

  res.status(201).json({
    success: true,
    data: audit
  });
});

/**
 * @desc    Get all audits
 * @route   GET /api/v1/ca/audits
 * @access  Private
 */
exports.getAudits = asyncHandler(async (req, res) => {
  const { clientId, auditType, status, fiscalYear, page = 1, limit = 10 } = req.query;
  
  // Build filter object
  const filter = { tenantId: req.tenantId };
  
  if (clientId) {
    filter.clientId = clientId;
  }
  
  if (auditType) {
    filter.auditType = auditType;
  }
  
  if (status) {
    filter.status = status;
  }
  
  if (fiscalYear) {
    filter.fiscalYear = fiscalYear;
  }
  
  // Build sort options
  const sort = {};
  sort.createdAt = -1; // Default sort by creation date, newest first
  
  // Calculate pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  // Find audits with filters and pagination
  const audits = await Audit.find(filter)
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit))
    .populate('clientId', 'name pan');
  
  // Get total count for pagination
  const total = await Audit.countDocuments(filter);
  
  res.status(200).json({
    success: true,
    count: audits.length,
    total,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit))
    },
    data: audits
  });
});

/**
 * @desc    Get audit by ID
 * @route   GET /api/v1/ca/audits/:id
 * @access  Private
 */
exports.getAuditById = asyncHandler(async (req, res) => {
  const audit = await Audit.findOne({
    _id: req.params.id,
    tenantId: req.tenantId
  }).populate('clientId', 'name pan');

  if (!audit) {
    res.status(404);
    throw new Error('Audit not found');
  }

  res.status(200).json({
    success: true,
    data: audit
  });
});

/**
 * @desc    Update audit
 * @route   PUT /api/v1/ca/audits/:id
 * @access  Private
 */
exports.updateAudit = asyncHandler(async (req, res) => {
  // Find the audit first
  const existingAudit = await Audit.findOne({
    _id: req.params.id,
    tenantId: req.tenantId
  });

  if (!existingAudit) {
    res.status(404);
    throw new Error('Audit not found');
  }

  // Update the audit
  const audit = await Audit.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  ).populate('clientId', 'name pan');

  res.status(200).json({
    success: true,
    data: audit
  });
});

/**
 * @desc    Delete audit
 * @route   DELETE /api/v1/ca/audits/:id
 * @access  Private
 */
exports.deleteAudit = asyncHandler(async (req, res) => {
  const audit = await Audit.findOne({
    _id: req.params.id,
    tenantId: req.tenantId
  });

  if (!audit) {
    res.status(404);
    throw new Error('Audit not found');
  }

  await audit.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});

/**
 * @desc    Add audit finding
 * @route   POST /api/v1/ca/audits/:id/findings
 * @access  Private
 */
exports.addAuditFinding = asyncHandler(async (req, res) => {
  const audit = await Audit.findOne({
    _id: req.params.id,
    tenantId: req.tenantId
  });

  if (!audit) {
    res.status(404);
    throw new Error('Audit not found');
  }

  // Add the finding to the audit
  audit.findings.push({
    title: req.body.title,
    description: req.body.description,
    severity: req.body.severity,
    recommendation: req.body.recommendation,
    status: 'Open'
  });

  await audit.save();

  res.status(200).json({
    success: true,
    data: audit
  });
});

/**
 * @desc    Update audit finding
 * @route   PUT /api/v1/ca/audits/:id/findings/:findingId
 * @access  Private
 */
exports.updateAuditFinding = asyncHandler(async (req, res) => {
  const audit = await Audit.findOne({
    _id: req.params.id,
    tenantId: req.tenantId
  });

  if (!audit) {
    res.status(404);
    throw new Error('Audit not found');
  }

  // Find the finding
  const finding = audit.findings.id(req.params.findingId);

  if (!finding) {
    res.status(404);
    throw new Error('Audit finding not found');
  }

  // Update the finding
  finding.title = req.body.title || finding.title;
  finding.description = req.body.description || finding.description;
  finding.severity = req.body.severity || finding.severity;
  finding.recommendation = req.body.recommendation || finding.recommendation;
  finding.status = req.body.status || finding.status;
  finding.managementResponse = req.body.managementResponse || finding.managementResponse;

  await audit.save();

  res.status(200).json({
    success: true,
    data: audit
  });
});

/**
 * @desc    Delete audit finding
 * @route   DELETE /api/v1/ca/audits/:id/findings/:findingId
 * @access  Private
 */
exports.deleteAuditFinding = asyncHandler(async (req, res) => {
  const audit = await Audit.findOne({
    _id: req.params.id,
    tenantId: req.tenantId
  });

  if (!audit) {
    res.status(404);
    throw new Error('Audit not found');
  }

  // Find and remove the finding
  const finding = audit.findings.id(req.params.findingId);

  if (!finding) {
    res.status(404);
    throw new Error('Audit finding not found');
  }

  finding.remove();
  await audit.save();

  res.status(200).json({
    success: true,
    data: audit
  });
});

/**
 * @desc    Complete audit
 * @route   PATCH /api/v1/ca/audits/:id/complete
 * @access  Private
 */
exports.completeAudit = asyncHandler(async (req, res) => {
  const audit = await Audit.findOne({
    _id: req.params.id,
    tenantId: req.tenantId
  });

  if (!audit) {
    res.status(404);
    throw new Error('Audit not found');
  }

  audit.status = 'Completed';
  audit.completedDate = new Date();
  audit.completedBy = req.user._id;
  audit.conclusion = req.body.conclusion;

  await audit.save();

  res.status(200).json({
    success: true,
    data: audit
  });
});