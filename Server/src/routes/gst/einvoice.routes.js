/**
 * GST E-Invoice Routes
 * Defines API routes for e-invoice generation and management
 */

const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../../middleware/authMiddleware');
const tenantMiddleware = require('../../middleware/tenantMiddleware');
const einvoiceController = require('../../controllers/gst/einvoice.controller');

// Apply middleware to all routes
router.use(protect);
router.use(tenantMiddleware);

// E-Invoice statistics
router.get(
  '/stats',
  restrictTo('admin', 'gst-manager', 'finance-manager', 'finance-analyst'),
  einvoiceController.getEInvoiceStats
);

// Verify e-invoice by IRN
router.get(
  '/verify/:irn',
  restrictTo('admin', 'gst-manager', 'finance-manager'),
  einvoiceController.verifyEInvoice
);

// Generate e-invoice for an invoice
router.post(
  '/generate/:invoiceId',
  restrictTo('admin', 'gst-manager'),
  einvoiceController.generateEInvoice
);

// E-Invoice CRUD routes
router
  .route('/')
  .get(einvoiceController.getEInvoices);

router
  .route('/:id')
  .get(einvoiceController.getEInvoiceById);

// Cancel e-invoice
router
  .route('/:id/cancel')
  .post(
    restrictTo('admin', 'gst-manager'),
    einvoiceController.cancelEInvoice
  );

module.exports = router;