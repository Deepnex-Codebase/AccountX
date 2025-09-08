/**
 * System Routes
 * Defines API routes for system-level operations
 */

const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/authMiddleware');
const { injectTenantId } = require('../middleware/tenantMiddleware');
const {
  getFeatureFlags,
  updateFeatureFlag,
  createFeatureFlag,
  deleteFeatureFlag,
  getTenantFeatureFlags,
  updateTenantFeatureFlag
} = require('../controllers/system/featureFlag.controller');

// Feature flag routes
router
  .route('/feature-flags')
  .get(protect, restrictTo('admin'), getFeatureFlags)
  .post(protect, restrictTo('admin'), createFeatureFlag);

router
  .route('/feature-flags/:id')
  .put(protect, restrictTo('admin'), updateFeatureFlag)
  .delete(protect, restrictTo('admin'), deleteFeatureFlag);

// Tenant-specific feature flag routes
router
  .route('/feature-flags/tenant')
  .get(protect, injectTenantId, getTenantFeatureFlags);

router
  .route('/feature-flags/tenant/:name')
  .put(
    protect, 
    injectTenantId, 
    restrictTo('admin', 'cfo'), 
    updateTenantFeatureFlag
  );

module.exports = router;