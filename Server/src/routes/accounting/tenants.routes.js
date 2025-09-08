const express = require('express');
const router = express.Router();
const { protect, hasPermission } = require('../../middleware/authMiddleware');
const tenantMiddleware = require('../../middleware/tenantMiddleware');
const tenantController = require('../../controllers/accounting/tenant.controller');

// Get tenant settings
router.get('/:tenantId/settings', protect, tenantMiddleware, tenantController.getTenantSettings);
// Update tenant settings
router.put('/:tenantId/settings', protect, tenantMiddleware, hasPermission('tenant:update'), tenantController.updateTenantSettings);

module.exports = router; 