/**
 * GST Registration Controller
 * Handles API requests for GST Registration operations
 */

const GSTRegistration = require('../../models/gst/gstRegistration.model');
const { asyncHandler, AppError } = require('../../utils/appError');

/**
 * @desc    Create a new GST registration
 * @route   POST /api/v1/gst/registrations
 * @access  Private (Requires authentication and authorization)
 */
exports.createGSTRegistration = asyncHandler(async (req, res) => {
  // Add tenant ID from authenticated user
  req.body.tenantId = req.user.tenantId;
  
  // Create the GST registration
  const gstRegistration = await GSTRegistration.create(req.body);
  
  res.status(201).json({
    success: true,
    data: gstRegistration
  });
});

/**
 * @desc    Get all GST registrations
 * @route   GET /api/v1/gst/registrations
 * @access  Private (Requires authentication and authorization)
 */
exports.getGSTRegistrations = asyncHandler(async (req, res) => {
  // Filter by tenant ID from authenticated user
  const filter = { tenantId: req.user.tenantId };
  
  // Add additional filters if provided
  if (req.query.status) filter.status = req.query.status;
  if (req.query.registrationType) filter.registrationType = req.query.registrationType;
  if (req.query.stateCode) filter.stateCode = req.query.stateCode;
  
  // Find GST registrations with filters
  const gstRegistrations = await GSTRegistration.find(filter)
    .sort({ gstin: 1 });
  
  res.status(200).json({
    success: true,
    count: gstRegistrations.length,
    data: gstRegistrations
  });
});

/**
 * @desc    Get GST registration by ID
 * @route   GET /api/v1/gst/registrations/:id
 * @access  Private (Requires authentication and authorization)
 */
exports.getGSTRegistrationById = asyncHandler(async (req, res) => {
  const gstRegistration = await GSTRegistration.findOne({
    _id: req.params.id,
    tenantId: req.user.tenantId
  });
  
  if (!gstRegistration) {
    return res.status(404).json({
      success: false,
      error: 'GST registration not found'
    });
  }
  
  res.status(200).json({
    success: true,
    data: gstRegistration
  });
});

/**
 * @desc    Get GST registration by GSTIN
 * @route   GET /api/v1/gst/registrations/gstin/:gstin
 * @access  Private (Requires authentication and authorization)
 */
exports.getGSTRegistrationByGSTIN = asyncHandler(async (req, res) => {
  const gstRegistration = await GSTRegistration.findOne({
    gstin: req.params.gstin,
    tenantId: req.user.tenantId
  });
  
  if (!gstRegistration) {
    return res.status(404).json({
      success: false,
      error: 'GST registration not found'
    });
  }
  
  res.status(200).json({
    success: true,
    data: gstRegistration
  });
});

/**
 * @desc    Update GST registration
 * @route   PUT /api/v1/gst/registrations/:id
 * @access  Private (Requires authentication and authorization)
 */
exports.updateGSTRegistration = asyncHandler(async (req, res) => {
  // Find and update the GST registration
  const gstRegistration = await GSTRegistration.findOneAndUpdate(
    { _id: req.params.id, tenantId: req.user.tenantId },
    req.body,
    { new: true, runValidators: true }
  );
  
  if (!gstRegistration) {
    return res.status(404).json({
      success: false,
      error: 'GST registration not found'
    });
  }
  
  res.status(200).json({
    success: true,
    data: gstRegistration
  });
});

/**
 * @desc    Delete GST registration
 * @route   DELETE /api/v1/gst/registrations/:id
 * @access  Private (Requires authentication and authorization)
 */
exports.deleteGSTRegistration = asyncHandler(async (req, res) => {
  // TODO: Check if GST registration is used in invoices or returns
  // If it is, prevent deletion
  
  // Delete the GST registration
  const gstRegistration = await GSTRegistration.findOneAndDelete({
    _id: req.params.id,
    tenantId: req.user.tenantId
  });
  
  if (!gstRegistration) {
    return res.status(404).json({
      success: false,
      error: 'GST registration not found'
    });
  }
  
  res.status(200).json({
    success: true,
    data: {}
  });
});

/**
 * @desc    Update GST registration status
 * @route   PATCH /api/v1/gst/registrations/:id/status
 * @access  Private (Requires authentication and authorization)
 */
exports.updateGSTRegistrationStatus = asyncHandler(async (req, res) => {
  // Validate request body
  if (!req.body.status || !['Active', 'Inactive'].includes(req.body.status)) {
    return res.status(400).json({
      success: false,
      error: 'Status must be either Active or Inactive'
    });
  }
  
  // Find the GST registration
  const gstRegistration = await GSTRegistration.findOne({
    _id: req.params.id,
    tenantId: req.user.tenantId
  });
  
  if (!gstRegistration) {
    return res.status(404).json({
      success: false,
      error: 'GST registration not found'
    });
  }
  
  // Update status
  gstRegistration.status = req.body.status;
  await gstRegistration.save();
  
  res.status(200).json({
    success: true,
    data: gstRegistration
  });
});

/**
 * @desc    Store GST portal credentials
 * @route   PATCH /api/v1/gst/registrations/:id/credentials
 * @access  Private (Requires authentication and authorization)
 */
exports.storeGSTPortalCredentials = asyncHandler(async (req, res) => {
  // Validate request body
  if (!req.body.username || !req.body.password) {
    return res.status(400).json({
      success: false,
      error: 'Username and password are required'
    });
  }
  
  // Find the GST registration
  const gstRegistration = await GSTRegistration.findOne({
    _id: req.params.id,
    tenantId: req.user.tenantId
  });
  
  if (!gstRegistration) {
    return res.status(404).json({
      success: false,
      error: 'GST registration not found'
    });
  }
  
  // Update portal credentials
  gstRegistration.portalCredentials = {
    username: req.body.username,
    password: req.body.password,
    isStored: true
  };
  
  await gstRegistration.save();
  
  res.status(200).json({
    success: true,
    data: {
      _id: gstRegistration._id,
      gstin: gstRegistration.gstin,
      portalCredentials: {
        username: gstRegistration.portalCredentials.username,
        isStored: gstRegistration.portalCredentials.isStored
      }
    }
  });
});

/**
 * @desc    Verify GST registration with GST portal
 * @route   POST /api/v1/gst/registrations/verify
 * @access  Private (Requires authentication and authorization)
 */
exports.verifyGSTRegistration = asyncHandler(async (req, res) => {
  // Validate request body
  if (!req.body.gstin) {
    return res.status(400).json({
      success: false,
      error: 'GSTIN is required'
    });
  }
  
  // TODO: Implement GST verification API integration
  // This would typically involve calling an external API to verify the GSTIN
  // For now, we'll simulate a successful verification
  
  const verificationResult = {
    valid: true,
    gstin: req.body.gstin,
    legalName: 'Sample Business Name',
    tradeName: 'Sample Trade Name',
    address: 'Sample Address, City, State - 123456',
    stateCode: req.body.gstin.substring(0, 2),
    registrationType: 'Regular',
    registrationDate: new Date('2020-01-01'),
    lastVerifiedAt: new Date()
  };
  
  res.status(200).json({
    success: true,
    data: verificationResult
  });
});