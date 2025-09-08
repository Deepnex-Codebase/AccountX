/**
 * Controls Routes
 * Defines API routes for control items
 */

const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../../middleware/authMiddleware');
const { injectTenantId } = require('../../middleware/tenantMiddleware');
const {
  createControlItem,
  getControlItems,
  getControlItemById,
  updateControlItem,
  deleteControlItem
} = require('../../controllers/cfo/control.controller');

// Control routes
router
  .route('/')
  .get(protect, injectTenantId, getControlItems)
  .post(
    protect, 
    injectTenantId, 
    restrictTo('cfo', 'finance-manager', 'finance-analyst'), 
    createControlItem
  );

router
  .route('/:id')
  .get(protect, injectTenantId, getControlItemById)
  .put(
    protect, 
    injectTenantId, 
    restrictTo('cfo', 'finance-manager', 'finance-analyst'), 
    updateControlItem
  )
  .delete(
    protect, 
    injectTenantId, 
    restrictTo('cfo', 'finance-manager'), 
    deleteControlItem
  );

module.exports = router;