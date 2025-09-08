/**
 * GST Invoice Routes
 * Defines API routes for GST invoice management
 */

const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../../middleware/authMiddleware');
const tenantMiddleware = require('../../middleware/tenantMiddleware');
const invoicesController = require('../../controllers/gst/invoices.controller');

// Apply middleware to all routes
router.use(protect);
router.use(tenantMiddleware);

// Invoice statistics
router.get(
  '/stats',
  restrictTo('admin', 'gst-manager', 'finance-manager', 'finance-analyst'),
  invoicesController.getInvoiceStats
);

// E-Invoice verification by IRN
router.get(
  '/einvoice/:irn',
  restrictTo('admin', 'gst-manager', 'finance-manager'),
  invoicesController.verifyEInvoiceByIRN
);

// E-Way Bill verification by number
router.get(
  '/ewaybill/:ewbNumber',
  restrictTo('admin', 'gst-manager', 'finance-manager'),
  invoicesController.verifyEWayBillByNumber
);

// Invoice CRUD routes
router
  .route('/')
  .get(invoicesController.getInvoices)
  .post(
    restrictTo('admin', 'gst-manager', 'finance-manager'),
    invoicesController.createInvoice
  );

router
  .route('/:id')
  .get(invoicesController.getInvoiceById)
  .put(
    restrictTo('admin', 'gst-manager', 'finance-manager'),
    invoicesController.updateInvoice
  )
  .delete(
    restrictTo('admin', 'gst-manager'),
    invoicesController.deleteInvoice
  );

// Update payment status
router
  .route('/:id/payment')
  .patch(
    restrictTo('admin', 'gst-manager', 'finance-manager'),
    invoicesController.updatePaymentStatus
  );

// Generate e-invoice
router
  .route('/:id/einvoice')
  .post(
    restrictTo('admin', 'gst-manager'),
    invoicesController.generateEInvoice
  );

// Generate e-way bill
router
  .route('/:id/ewaybill')
  .post(
    restrictTo('admin', 'gst-manager'),
    invoicesController.generateEWayBill
  );

// Mark ITC eligibility for purchase invoices
router
  .route('/:id/itc')
  .patch(
    restrictTo('admin', 'gst-manager', 'finance-manager'),
    invoicesController.markITCEligibility
  );

// Mark invoice as reported in GSTR
router
  .route('/:id/gstr')
  .patch(
    restrictTo('admin', 'gst-manager'),
    invoicesController.markGSTRReported
  );

// Generate journal entry
router
  .route('/:id/journal')
  .post(
    restrictTo('admin', 'gst-manager', 'finance-manager'),
    invoicesController.generateJournalEntry
  );

module.exports = router;