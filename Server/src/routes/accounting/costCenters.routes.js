const express = require('express');
const router = express.Router();
const { protect, hasPermission } = require('../../middleware/authMiddleware');
const tenantMiddleware = require('../../middleware/tenantMiddleware');
const costCenterController = require('../../controllers/accounting/costCenter.controller');

// List cost centers
router.get('/', protect, tenantMiddleware, costCenterController.getCostCenters);
// Create a new cost center
router.post('/', protect, tenantMiddleware, hasPermission('costcenter:create'), costCenterController.createCostCenter);
// Update cost center
router.put('/:id', protect, tenantMiddleware, hasPermission('costcenter:update'), costCenterController.updateCostCenter);
// Archive a cost center
router.post('/:id/archive', protect, tenantMiddleware, hasPermission('costcenter:archive'), costCenterController.archiveCostCenter);

module.exports = router; 