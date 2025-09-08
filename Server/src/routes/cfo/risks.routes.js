/**
 * Risks Routes
 * Defines API routes for risk items
 */

const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../../middleware/authMiddleware');
const { injectTenantId } = require('../../middleware/tenantMiddleware');
const {
  createRiskItem,
  getRiskItems,
  getRiskItemById,
  updateRiskItem,
  deleteRiskItem
} = require('../../controllers/cfo/risk.controller');

// Risk routes
router
  .route('/')
  .get(protect, injectTenantId, getRiskItems)
  .post(
    protect, 
    injectTenantId, 
    restrictTo('cfo', 'finance-manager', 'finance-analyst'), 
    createRiskItem
  );

router
  .route('/:id')
  .get(protect, injectTenantId, getRiskItemById)
  .put(
    protect, 
    injectTenantId, 
    restrictTo('cfo', 'finance-manager', 'finance-analyst'), 
    updateRiskItem
  )
  .delete(
    protect, 
    injectTenantId, 
    restrictTo('cfo', 'finance-manager'), 
    deleteRiskItem
  );

module.exports = router;