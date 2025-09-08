/**
 * Fundraising Routes
 * Defines API routes for fundraising items
 */

const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../../middleware/authMiddleware');
const { injectTenantId } = require('../../middleware/tenantMiddleware');
const {
  createFundraisingItem,
  getFundraisingItems,
  getFundraisingItemById,
  updateFundraisingItem,
  deleteFundraisingItem
} = require('../../controllers/cfo/fundraising.controller');

// Fundraising routes
router
  .route('/')
  .get(protect, injectTenantId, getFundraisingItems)
  .post(
    protect, 
    injectTenantId, 
    restrictTo('cfo', 'finance-manager', 'finance-analyst'), 
    createFundraisingItem
  );

router
  .route('/:id')
  .get(protect, injectTenantId, getFundraisingItemById)
  .put(
    protect, 
    injectTenantId, 
    restrictTo('cfo', 'finance-manager', 'finance-analyst'), 
    updateFundraisingItem
  )
  .delete(
    protect, 
    injectTenantId, 
    restrictTo('cfo', 'finance-manager'), 
    deleteFundraisingItem
  );

module.exports = router;