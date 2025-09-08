const express = require('express');
const router = express.Router();
const { protect, hasPermission } = require('../../middleware/authMiddleware');
const tenantMiddleware = require('../../middleware/tenantMiddleware');
const cashBookController = require('../../controllers/accounting/cashBook.controller');

// View cash book
router.get('/', protect, tenantMiddleware, cashBookController.getCashBook);
// Record manual cash receipt/payment
router.post('/manual', protect, tenantMiddleware, hasPermission('cashbook:manual'), cashBookController.recordManualCashEntry);

module.exports = router; 