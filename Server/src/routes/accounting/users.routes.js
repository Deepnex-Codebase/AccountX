const express = require('express');
const router = express.Router();
const { protect, hasPermission } = require('../../middleware/authMiddleware');
const tenantMiddleware = require('../../middleware/tenantMiddleware');
const userController = require('../../controllers/accounting/user.controller');

// List users
router.get('/', protect, tenantMiddleware, userController.getUsers);
// Get user details
router.get('/:id', protect, tenantMiddleware, userController.getUserById);
// Invite/create user
router.post('/', protect, tenantMiddleware, hasPermission('user:create'), userController.createUser);
// Update user
router.put('/:id', protect, tenantMiddleware, hasPermission('user:update'), userController.updateUser);
// Deactivate user
router.delete('/:id', protect, tenantMiddleware, hasPermission('user:delete'), userController.deactivateUser);

module.exports = router; 