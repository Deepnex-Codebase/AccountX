const express = require('express');
const router = express.Router();
const { protect, hasPermission } = require('../../middleware/authMiddleware');
const tenantMiddleware = require('../../middleware/tenantMiddleware');
const accountController = require('../../controllers/accounting/account.controller');

// List all accounts
router.get('/', protect, tenantMiddleware, accountController.getAccounts);
// Create a new account
router.post('/', protect, tenantMiddleware, hasPermission('account:create'), accountController.createAccount);
// Get account by ID
router.get('/:id', protect, tenantMiddleware, accountController.getAccountById);
// Update account details
router.put('/:id', protect, tenantMiddleware, hasPermission('account:update'), accountController.updateAccount);
// Archive (soft-delete) an account
router.post('/:id/archive', protect, tenantMiddleware, hasPermission('account:archive'), accountController.toggleArchiveAccount);
// Bulk upload accounts via CSV (placeholder, implement logic in controller)
router.post('/bulk-upload', protect, tenantMiddleware, hasPermission('account:bulk-upload'), accountController.bulkUploadAccounts);
// Get account hierarchy (chart of accounts)
router.get('/hierarchy', protect, tenantMiddleware, accountController.getAccountHierarchy);

module.exports = router; 