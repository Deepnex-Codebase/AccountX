const express = require('express');
const router = express.Router();
const { protect, hasPermission } = require('../../middleware/authMiddleware');
const tenantMiddleware = require('../../middleware/tenantMiddleware');
const salesBookController = require('../../controllers/accounting/salesBook.controller');

// View sales book
router.get('/', protect, tenantMiddleware, salesBookController.getSalesBook);
// Record customer invoice
router.post('/', protect, tenantMiddleware, hasPermission('salesbook:create'), salesBookController.createSalesInvoice);

module.exports = router; 