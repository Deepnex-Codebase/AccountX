const express = require('express');
const router = express.Router();
const { protect, hasPermission } = require('../../middleware/authMiddleware');
const tenantMiddleware = require('../../middleware/tenantMiddleware');
const bankBookController = require('../../controllers/accounting/bankBook.controller');

// View bank book
router.get('/', protect, tenantMiddleware, bankBookController.getBankBook);
// Import bank statement (CSV/OFX)
router.post('/import-statement', protect, tenantMiddleware, hasPermission('bankbook:import'), bankBookController.importBankStatement);
// Auto-reconcile a transaction
router.post('/:id/reconcile', protect, tenantMiddleware, hasPermission('bankbook:reconcile'), bankBookController.reconcileTransaction);
// Record manual adjustment
router.post('/manual-adjustment', protect, tenantMiddleware, hasPermission('bankbook:manual'), bankBookController.recordManualAdjustment);

module.exports = router; 