/**
 * Models Routes
 * Defines API routes for financial models
 */

const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../../middleware/authMiddleware');
const { injectTenantId } = require('../../middleware/tenantMiddleware');
const {
  createModel,
  getModels,
  getModelById,
  updateModel,
  deleteModel,
  runModelSimulation
} = require('../../controllers/cfo/model.controller');

// Financial model routes
router
  .route('/')
  .get(protect, injectTenantId, getModels)
  .post(
    protect, 
    injectTenantId, 
    restrictTo('cfo', 'finance-manager', 'finance-analyst'), 
    createModel
  );

router
  .route('/:id')
  .get(protect, injectTenantId, getModelById)
  .put(
    protect, 
    injectTenantId, 
    restrictTo('cfo', 'finance-manager', 'finance-analyst'), 
    updateModel
  )
  .delete(
    protect, 
    injectTenantId, 
    restrictTo('cfo', 'finance-manager'), 
    deleteModel
  );

// Model simulation route
router
  .route('/:id/simulate')
  .post(
    protect, 
    injectTenantId, 
    restrictTo('cfo', 'finance-manager', 'finance-analyst'), 
    runModelSimulation
  );

module.exports = router;