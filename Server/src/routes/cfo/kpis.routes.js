/**
 * KPIs Routes
 * Defines API routes for Key Performance Indicators
 */

const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../../middleware/authMiddleware');
const { injectTenantId } = require('../../middleware/tenantMiddleware');
const {
  createKpi,
  getKpis,
  getKpiById,
  updateKpi,
  deleteKpi
} = require('../../controllers/cfo/kpi.controller');

// KPI routes
router
  .route('/')
  .get(protect, injectTenantId, getKpis)
  .post(
    protect, 
    injectTenantId, 
    restrictTo('cfo', 'finance-manager', 'finance-analyst'), 
    createKpi
  );

router
  .route('/:id')
  .get(protect, injectTenantId, getKpiById)
  .put(
    protect, 
    injectTenantId, 
    restrictTo('cfo', 'finance-manager', 'finance-analyst'), 
    updateKpi
  )
  .delete(
    protect, 
    injectTenantId, 
    restrictTo('cfo', 'finance-manager'), 
    deleteKpi
  );

module.exports = router;