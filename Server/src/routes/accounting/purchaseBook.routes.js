const express = require('express');
const router = express.Router();
const { protect, hasPermission } = require('../../middleware/authMiddleware');
const tenantMiddleware = require('../../middleware/tenantMiddleware');
const purchaseBookController = require('../../controllers/accounting/purchaseBook.controller');

// View purchase book
router.get('/', protect, tenantMiddleware, purchaseBookController.getPurchaseBook);
// Record supplier invoice
router.post('/', protect, tenantMiddleware, hasPermission('purchasebook:create'), purchaseBookController.createPurchaseInvoice);

module.exports = router; 