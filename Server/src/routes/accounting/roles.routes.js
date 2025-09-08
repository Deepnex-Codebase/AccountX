const express = require('express');
const router = express.Router();
const { protect, hasPermission } = require('../../middleware/authMiddleware');
const tenantMiddleware = require('../../middleware/tenantMiddleware');
const roleController = require('../../controllers/accounting/role.controller');

// List roles
router.get('/', protect, tenantMiddleware, roleController.getRoles);
// Get role
router.get('/:id', protect, tenantMiddleware, roleController.getRoleById);
// Create role
router.post('/', protect, tenantMiddleware, hasPermission('role:create'), roleController.createRole);
// Update role
router.put('/:id', protect, tenantMiddleware, hasPermission('role:update'), roleController.updateRole);
// Delete role
router.delete('/:id', protect, tenantMiddleware, hasPermission('role:delete'), roleController.deleteRole);
// Assign users to a role
router.post('/:id/assign-users', protect, tenantMiddleware, hasPermission('role:assign'), roleController.assignUsersToRole);

module.exports = router; 