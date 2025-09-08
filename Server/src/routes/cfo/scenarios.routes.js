/**
 * Scenario Routes
 * Defines API routes for scenario operations
 */

const express = require('express');
const router = express.Router();

// Import controllers
const scenarioController = require('../../controllers/cfo/scenario.controller');

// Import middleware
const { protect, restrictTo: authorize } = require('../../middleware/authMiddleware');
const { injectTenantId } = require('../../middleware/tenantMiddleware');

// Define routes

// Scenario routes
router
  .route('/')
  .get(
    protect,
    injectTenantId,
    authorize('cfo', 'finance-manager', 'finance-analyst'),
    scenarioController.getScenarios
  )
  .post(
    protect,
    injectTenantId,
    authorize('cfo', 'finance-manager'),
    scenarioController.createScenario
  );

router
  .route('/compare')
  .post(
    protect,
    injectTenantId,
    authorize('cfo', 'finance-manager', 'finance-analyst'),
    scenarioController.compareScenarios
  );

router
  .route('/:id')
  .get(
    protect,
    injectTenantId,
    authorize('cfo', 'finance-manager', 'finance-analyst'),
    scenarioController.getScenarioById
  )
  .put(
    protect,
    injectTenantId,
    authorize('cfo', 'finance-manager'),
    scenarioController.updateScenario
  )
  .delete(
    protect,
    injectTenantId,
    authorize('cfo'),
    scenarioController.deleteScenario
  );

// Variable routes
router
  .route('/:id/variables')
  .post(
    protect,
    injectTenantId,
    authorize('cfo', 'finance-manager'),
    scenarioController.addVariable
  );

router
  .route('/:id/variables/:variableId')
  .put(
    protect,
    injectTenantId,
    authorize('cfo', 'finance-manager'),
    scenarioController.updateVariable
  )
  .delete(
    protect,
    injectTenantId,
    authorize('cfo', 'finance-manager'),
    scenarioController.deleteVariable
  );

// Outcome routes
router
  .route('/:id/outcomes')
  .post(
    protect,
    injectTenantId,
    authorize('cfo', 'finance-manager'),
    scenarioController.addOutcome
  );

router
  .route('/:id/outcomes/:outcomeId')
  .put(
    protect,
    injectTenantId,
    authorize('cfo', 'finance-manager'),
    scenarioController.updateOutcome
  )
  .delete(
    protect,
    injectTenantId,
    authorize('cfo', 'finance-manager'),
    scenarioController.deleteOutcome
  );

module.exports = router;