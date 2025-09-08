/**
 * GST E-Way Bill Routes
 * Defines API routes for e-way bill generation and management
 */

const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../../middleware/authMiddleware');
const tenantMiddleware = require('../../middleware/tenantMiddleware');
const ewaybillController = require('../../controllers/gst/ewaybill.controller');

// Apply middleware to all routes
router.use(protect);
router.use(tenantMiddleware);

// E-Way Bill statistics
router.get(
  '/stats',
  restrictTo('admin', 'gst-manager', 'finance-manager', 'finance-analyst'),
  ewaybillController.getEWayBillStats
);

// Verify e-way bill by number
router.get(
  '/verify/:ewbNumber',
  restrictTo('admin', 'gst-manager', 'finance-manager'),
  ewaybillController.verifyEWayBill
);

// Generate e-way bill from invoice
router.post(
  '/generate/invoice/:invoiceId',
  restrictTo('admin', 'gst-manager'),
  ewaybillController.generateEWayBillFromInvoice
);

// E-Way Bill CRUD routes
router
  .route('/')
  .get(ewaybillController.getEWayBills)
  .post(
    restrictTo('admin', 'gst-manager'),
    ewaybillController.createEWayBill
  );

router
  .route('/:id')
  .get(ewaybillController.getEWayBillById)
  .put(
    restrictTo('admin', 'gst-manager'),
    ewaybillController.updateEWayBill
  );

// Cancel e-way bill
router
  .route('/:id/cancel')
  .post(
    restrictTo('admin', 'gst-manager'),
    ewaybillController.cancelEWayBill
  );

// Extend e-way bill validity
router
  .route('/:id/extend')
  .post(
    restrictTo('admin', 'gst-manager'),
    ewaybillController.extendEWayBill
  );

module.exports = router;