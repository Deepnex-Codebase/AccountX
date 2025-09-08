/**
 * GST Registration Routes
 * Defines API routes for GST registration management
 */

const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../../middleware/authMiddleware');
const tenantMiddleware = require('../../middleware/tenantMiddleware');
const registrationsController = require('../../controllers/gst/registrations.controller');

// Apply middleware to all routes
router.use(protect);
router.use(tenantMiddleware);

// GST Registration routes
router
  .route('/')
  .get(registrationsController.getRegistrations)
  .post(
    restrictTo('admin', 'gst-manager', 'finance-manager'),
    registrationsController.createRegistration
  );

router
  .route('/:id')
  .get(registrationsController.getRegistrationById)
  .put(
    restrictTo('admin', 'gst-manager', 'finance-manager'),
    registrationsController.updateRegistration
  )
  .delete(
    restrictTo('admin', 'gst-manager'),
    registrationsController.deleteRegistration
  );

// Update registration status
router
  .route('/:id/status')
  .patch(
    restrictTo('admin', 'gst-manager', 'finance-manager'),
    registrationsController.updateStatus
  );

// Store GST portal credentials
router
  .route('/:id/credentials')
  .patch(
    restrictTo('admin', 'gst-manager'),
    registrationsController.storeCredentials
  );

// Verify GST registration with government portal
router
  .route('/:id/verify')
  .post(
    restrictTo('admin', 'gst-manager', 'finance-manager'),
    registrationsController.verifyRegistration
  );

module.exports = router;