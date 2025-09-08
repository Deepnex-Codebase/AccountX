/**
 * Feature Flag Controller
 * Handles operations for system feature flags
 */

const asyncHandler = require('express-async-handler');
const FeatureFlag = require('../../models/system/featureFlag.model');

/**
 * @desc    Get all feature flags
 * @route   GET /api/v1/system/feature-flags
 * @access  Private/Admin
 */
exports.getFeatureFlags = asyncHandler(async (req, res) => {
  // Find all feature flags
  const featureFlags = await FeatureFlag.find();
  
  res.status(200).json({
    success: true,
    count: featureFlags.length,
    data: featureFlags
  });
});

/**
 * @desc    Update feature flag
 * @route   PUT /api/v1/system/feature-flags/:id
 * @access  Private/Admin
 */
exports.updateFeatureFlag = asyncHandler(async (req, res) => {
  // Find the feature flag first
  const existingFlag = await FeatureFlag.findById(req.params.id);

  if (!existingFlag) {
    res.status(404);
    throw new Error('Feature flag not found');
  }

  // Only allow updating the enabled status and description
  const updateData = {
    enabled: req.body.enabled !== undefined ? req.body.enabled : existingFlag.enabled
  };
  
  if (req.body.description) {
    updateData.description = req.body.description;
  }

  // Update the feature flag
  const featureFlag = await FeatureFlag.findByIdAndUpdate(
    req.params.id,
    updateData,
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    data: featureFlag
  });
});

/**
 * @desc    Create a new feature flag (admin only)
 * @route   POST /api/v1/system/feature-flags
 * @access  Private/Admin
 */
exports.createFeatureFlag = asyncHandler(async (req, res) => {
  // Check if feature flag with same name already exists
  const existingFlag = await FeatureFlag.findOne({
    name: req.body.name
  });

  if (existingFlag) {
    res.status(400);
    throw new Error('Feature flag with this name already exists');
  }

  // Create the feature flag
  const featureFlag = await FeatureFlag.create(req.body);

  res.status(201).json({
    success: true,
    data: featureFlag
  });
});

/**
 * @desc    Delete feature flag (admin only)
 * @route   DELETE /api/v1/system/feature-flags/:id
 * @access  Private/Admin
 */
exports.deleteFeatureFlag = asyncHandler(async (req, res) => {
  // Find the feature flag first
  const existingFlag = await FeatureFlag.findById(req.params.id);

  if (!existingFlag) {
    res.status(404);
    throw new Error('Feature flag not found');
  }

  // Delete the feature flag
  await FeatureFlag.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    data: {}
  });
});

/**
 * @desc    Get feature flags for tenant
 * @route   GET /api/v1/system/feature-flags/tenant
 * @access  Private
 */
exports.getTenantFeatureFlags = asyncHandler(async (req, res) => {
  // Find all global feature flags
  const globalFlags = await FeatureFlag.find({ scope: 'global' });
  
  // Find tenant-specific feature flags
  const tenantFlags = await FeatureFlag.find({ 
    scope: 'tenant',
    tenantId: req.tenantId 
  });
  
  // Combine and format the results
  const featureFlags = {};
  
  // Process global flags
  globalFlags.forEach(flag => {
    featureFlags[flag.name] = flag.enabled;
  });
  
  // Process tenant flags (these override global flags)
  tenantFlags.forEach(flag => {
    featureFlags[flag.name] = flag.enabled;
  });
  
  res.status(200).json({
    success: true,
    data: featureFlags
  });
});

/**
 * @desc    Update tenant feature flag
 * @route   PUT /api/v1/system/feature-flags/tenant/:name
 * @access  Private/Admin
 */
exports.updateTenantFeatureFlag = asyncHandler(async (req, res) => {
  const { name } = req.params;
  const { enabled } = req.body;
  
  if (enabled === undefined) {
    res.status(400);
    throw new Error('Enabled status is required');
  }
  
  // Check if the feature flag exists globally
  const globalFlag = await FeatureFlag.findOne({ name, scope: 'global' });
  
  if (!globalFlag) {
    res.status(404);
    throw new Error('Feature flag not found');
  }
  
  // Check if tenant-specific flag already exists
  let tenantFlag = await FeatureFlag.findOne({ 
    name,
    scope: 'tenant',
    tenantId: req.tenantId 
  });
  
  if (tenantFlag) {
    // Update existing tenant flag
    tenantFlag = await FeatureFlag.findOneAndUpdate(
      { _id: tenantFlag._id },
      { enabled },
      { new: true }
    );
  } else {
    // Create new tenant flag
    tenantFlag = await FeatureFlag.create({
      name,
      description: globalFlag.description,
      enabled,
      scope: 'tenant',
      tenantId: req.tenantId
    });
  }
  
  res.status(200).json({
    success: true,
    data: tenantFlag
  });
});