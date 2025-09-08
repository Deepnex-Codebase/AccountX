/**
 * Integrations Routes
 * Defines API routes for external integrations
 */

const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/authMiddleware');
const { injectTenantId } = require('../middleware/tenantMiddleware');
const {
  getIntegrations,
  getIntegrationById,
  createIntegration,
  updateIntegration,
  deleteIntegration,
  saveGstnCredentials,
  getGstnCredentials,
  connectExternalSystem
} = require('../controllers/integrations/integration.controller');

// General integration routes
router
  .route('/')
  .get(protect, injectTenantId, getIntegrations)
  .post(
    protect, 
    injectTenantId, 
    restrictTo('admin', 'cfo', 'finance-manager'), 
    createIntegration
  );

router
  .route('/:id')
  .get(protect, injectTenantId, getIntegrationById)
  .put(
    protect, 
    injectTenantId, 
    restrictTo('admin', 'cfo', 'finance-manager'), 
    updateIntegration
  )
  .delete(
    protect, 
    injectTenantId, 
    restrictTo('admin', 'cfo'), 
    deleteIntegration
  );

// GSTN credentials routes
router
  .route('/gstn-credentials')
  .get(protect, injectTenantId, getGstnCredentials)
  .post(
    protect, 
    injectTenantId, 
    restrictTo('admin', 'cfo', 'finance-manager'), 
    saveGstnCredentials
  );

// External connector routes
router
  .route('/connect/:connectorType')
  .post(
    protect, 
    injectTenantId, 
    restrictTo('admin', 'cfo', 'finance-manager'), 
    connectExternalSystem
  );

module.exports = router;