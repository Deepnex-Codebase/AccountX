/**
 * Cap Table Routes
 * Defines API routes for cap table operations
 */

const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../../middleware/authMiddleware');
const { injectTenantId } = require('../../middleware/tenantMiddleware');
const capTableController = require('../../controllers/cfo/capTable.controller');

// Cap Table routes
router
  .route('/')
  .get(protect, injectTenantId, capTableController.getCapTableEntries)
  .post(protect, injectTenantId, restrictTo('cfo', 'finance-manager'), capTableController.createCapTableEntry);

router
  .route('/:id')
  .get(protect, injectTenantId, capTableController.getCapTableEntryById)
  .put(protect, injectTenantId, restrictTo('cfo', 'finance-manager'), capTableController.updateCapTableEntry)
  .delete(protect, injectTenantId, restrictTo('cfo', 'finance-manager'), capTableController.deleteCapTableEntry);

module.exports = router;