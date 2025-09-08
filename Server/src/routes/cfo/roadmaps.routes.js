/**
 * Roadmaps Routes
 * Defines API routes for roadmaps and scenarios
 */

const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../../middleware/authMiddleware');
const { injectTenantId } = require('../../middleware/tenantMiddleware');
const {
  createRoadmap,
  getRoadmaps,
  getRoadmapById,
  updateRoadmap,
  deleteRoadmap,
  getRoadmapScenarios,
  addScenarioToRoadmap,
  updateScenario,
  deleteScenario
} = require('../../controllers/cfo/roadmap.controller');

// Roadmap routes
router
  .route('/')
  .get(protect, injectTenantId, getRoadmaps)
  .post(
    protect, 
    injectTenantId, 
    restrictTo('cfo', 'finance-manager', 'finance-analyst'), 
    createRoadmap
  );

router
  .route('/:id')
  .get(protect, injectTenantId, getRoadmapById)
  .put(
    protect, 
    injectTenantId, 
    restrictTo('cfo', 'finance-manager', 'finance-analyst'), 
    updateRoadmap
  )
  .delete(
    protect, 
    injectTenantId, 
    restrictTo('cfo', 'finance-manager'), 
    deleteRoadmap
  );

// Scenario routes
router
  .route('/:roadmapId/scenarios')
  .get(protect, injectTenantId, getRoadmapScenarios)
  .post(
    protect, 
    injectTenantId, 
    restrictTo('cfo', 'finance-manager', 'finance-analyst'), 
    addScenarioToRoadmap
  );

router
  .route('/:roadmapId/scenarios/:id')
  .put(
    protect, 
    injectTenantId, 
    restrictTo('cfo', 'finance-manager', 'finance-analyst'), 
    updateScenario
  )
  .delete(
    protect, 
    injectTenantId, 
    restrictTo('cfo', 'finance-manager'), 
    deleteScenario
  );

module.exports = router;