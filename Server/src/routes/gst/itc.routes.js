/**
 * GST ITC (Input Tax Credit) Routes
 * Defines API routes for ITC management
 */

const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../../middleware/authMiddleware');
const tenantMiddleware = require('../../middleware/tenantMiddleware');
const itcController = require('../../controllers/gst/itc.controller');

// Apply middleware to all routes
router.use(protect);
router.use(tenantMiddleware);

// ITC statistics
router.get(
  '/stats',
  restrictTo('admin', 'gst-manager', 'finance-manager', 'finance-analyst'),
  itcController.getITCStats
);

// Bulk operations
router.patch(
  '/bulk-update-eligibility',
  restrictTo('admin', 'gst-manager'),
  itcController.bulkUpdateITCEligibility
);

router.patch(
  '/bulk-mark-claimed',
  restrictTo('admin', 'gst-manager'),
  itcController.bulkMarkITCAsClaimed
);

// Create ITC record for an invoice
router.post(
  '/invoice/:invoiceId',
  restrictTo('admin', 'gst-manager', 'finance-manager'),
  itcController.createITCRecord
);

// ITC CRUD routes
router
  .route('/')
  .get(itcController.getITCRecords);

router
  .route('/:id')
  .get(itcController.getITCById);

// ITC operations
router
  .route('/:id/eligibility')
  .patch(
    restrictTo('admin', 'gst-manager', 'finance-manager'),
    itcController.updateITCEligibility
  );

router
  .route('/:id/verify')
  .patch(
    restrictTo('admin', 'gst-manager'),
    itcController.verifyITC
  );

router
  .route('/:id/gstr-matching')
  .patch(
    restrictTo('admin', 'gst-manager'),
    itcController.updateGSTRMatchingStatus
  );

router
  .route('/:id/claim')
  .patch(
    restrictTo('admin', 'gst-manager'),
    itcController.markITCAsClaimed
  );

router
  .route('/:id/reverse')
  .patch(
    restrictTo('admin', 'gst-manager'),
    itcController.reverseITC
  );

module.exports = router;