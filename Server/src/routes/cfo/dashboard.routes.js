/**
 * Dashboard Routes
 * Defines API routes for dashboard metrics and quick actions
 */

const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../../middleware/authMiddleware');
const { injectTenantId } = require('../../middleware/tenantMiddleware');
const {
  getDashboardMetrics,
  createOrUpdateDashboardMetric,
  getDashboardSummary,
  getItcDashboardBySupplier,
  triggerCashFlowForecast,
  generateInvestorDeck,
  launchWhatIfScenario
} = require('../../controllers/cfo/dashboard.controller');

// Dashboard metrics routes
router
  .route('/metrics')
  .get(protect, injectTenantId, getDashboardMetrics)
  .post(
    protect, 
    injectTenantId, 
    restrictTo('cfo', 'finance-manager'), 
    createOrUpdateDashboardMetric
  );

// Dashboard summary route
router
  .route('/summary')
  .get(protect, injectTenantId, getDashboardSummary);

// ITC dashboard by supplier route
router
  .route('/itc-by-supplier')
  .get(protect, injectTenantId, getItcDashboardBySupplier);

// Quick actions routes
router
  .route('/actions/trigger-cash-flow-forecast')
  .post(
    protect, 
    injectTenantId, 
    restrictTo('cfo', 'finance-manager'), 
    triggerCashFlowForecast
  );

router
  .route('/actions/generate-investor-deck')
  .post(
    protect, 
    injectTenantId, 
    restrictTo('cfo', 'finance-manager'), 
    generateInvestorDeck
  );

router
  .route('/actions/launch-what-if-scenario')
  .post(
    protect, 
    injectTenantId, 
    restrictTo('cfo', 'finance-manager'), 
    launchWhatIfScenario
  );

module.exports = router;