/**
 * GST Returns Routes
 * Defines API routes for GST return filing
 */

const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../../middleware/authMiddleware');
const tenantMiddleware = require('../../middleware/tenantMiddleware');
const returnsController = require('../../controllers/gst/returns.controller');

// Apply middleware to all routes
router.use(protect);
router.use(tenantMiddleware);

// Return statistics
router.get(
  '/stats',
  restrictTo('admin', 'gst-manager', 'finance-manager', 'finance-analyst'),
  returnsController.getReturnStats
);

// GST Return CRUD routes
router
  .route('/')
  .get(returnsController.getReturns)
  .post(
    restrictTo('admin', 'gst-manager'),
    returnsController.createReturn
  );

router
  .route('/:id')
  .get(returnsController.getReturnById)
  .put(
    restrictTo('admin', 'gst-manager'),
    returnsController.updateReturn
  )
  .delete(
    restrictTo('admin', 'gst-manager'),
    returnsController.deleteReturn
  );

// Populate return with data
router
  .route('/:id/populate')
  .post(
    restrictTo('admin', 'gst-manager'),
    async (req, res, next) => {
      try {
        // Determine which populate method to use based on return type
        const returnType = req.query.returnType;
        
        if (returnType === 'GSTR-1') {
          await returnsController.populateGSTR1(req, res, next);
        } else if (returnType === 'GSTR-3B') {
          await returnsController.populateGSTR3B(req, res, next);
        } else {
          return next(new Error('Invalid return type specified'));
        }
      } catch (error) {
        next(error);
      }
    }
  );

// Generate JSON for filing
router
  .route('/:id/json')
  .post(
    restrictTo('admin', 'gst-manager'),
    returnsController.generateJSON
  );

// Mark return as filed
router
  .route('/:id/file')
  .patch(
    restrictTo('admin', 'gst-manager'),
    returnsController.markAsFiled
  );

module.exports = router;