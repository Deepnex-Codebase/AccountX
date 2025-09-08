/**
 * CFO Module Routes
 * Defines API routes for CFO module functionality
 */

const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/authMiddleware');
const { injectTenantId } = require('../middleware/tenantMiddleware');

// Import controllers
const budgetController = require('../controllers/cfo/budget.controller');
const cashFlowForecastController = require('../controllers/cfo/cashFlowForecast.controller');
const financialRatioController = require('../controllers/cfo/financialRatio.controller');

// Budget routes
router
  .route('/budgets')
  .get(protect, injectTenantId, budgetController.getBudgets)
  .post(protect, injectTenantId, budgetController.createBudget);

router
  .route('/budgets/:id')
  .get(protect, injectTenantId, budgetController.getBudgetById)
  .put(protect, injectTenantId, budgetController.updateBudget)
  .delete(protect, injectTenantId, budgetController.deleteBudget);

router
  .route('/budgets/:id/approve')
  .patch(protect, injectTenantId, restrictTo('cfo', 'finance-manager'), budgetController.approveBudget);

router
  .route('/budgets/:id/versions')
  .post(protect, injectTenantId, budgetController.createBudgetVersion);

router
  .route('/budgets/:id/comparison')
  .get(protect, injectTenantId, budgetController.getBudgetComparison);

router
  .route('/budgets/statistics')
  .get(protect, injectTenantId, budgetController.getBudgetStatistics);

// Cash Flow Forecast routes
router
  .route('/cash-flow-forecasts')
  .get(protect, injectTenantId, cashFlowForecastController.getCashFlowForecasts)
  .post(protect, injectTenantId, cashFlowForecastController.createCashFlowForecast);

router
  .route('/cash-flow-forecasts/:id')
  .get(protect, injectTenantId, cashFlowForecastController.getCashFlowForecastById)
  .put(protect, injectTenantId, cashFlowForecastController.updateCashFlowForecast)
  .delete(protect, injectTenantId, cashFlowForecastController.deleteCashFlowForecast);

router
  .route('/cash-flow-forecasts/:id/finalize')
  .patch(protect, injectTenantId, restrictTo('cfo', 'finance-manager'), cashFlowForecastController.finalizeCashFlowForecast);

router
  .route('/cash-flow-forecasts/:id/versions')
  .post(protect, injectTenantId, cashFlowForecastController.createCashFlowForecastVersion);

router
  .route('/cash-flow-forecasts/:id/comparison')
  .get(protect, injectTenantId, cashFlowForecastController.getCashFlowComparison);

router
  .route('/cash-flow-forecasts/statistics')
  .get(protect, injectTenantId, cashFlowForecastController.getCashFlowStatistics);

// Financial Ratio routes
router
  .route('/financial-ratios')
  .get(protect, injectTenantId, financialRatioController.getFinancialRatios)
  .post(protect, injectTenantId, financialRatioController.createFinancialRatio);

router
  .route('/financial-ratios/:id')
  .get(protect, injectTenantId, financialRatioController.getFinancialRatioById)
  .put(protect, injectTenantId, financialRatioController.updateFinancialRatio)
  .delete(protect, injectTenantId, financialRatioController.deleteFinancialRatio);

router
  .route('/financial-ratios/calculate')
  .post(protect, injectTenantId, financialRatioController.calculateFinancialRatios);

router
  .route('/financial-ratios/trends')
  .get(protect, injectTenantId, financialRatioController.getFinancialRatioTrends);

router
  .route('/financial-ratios/health-trends')
  .get(protect, injectTenantId, financialRatioController.getFinancialHealthTrends);

router
  .route('/financial-ratios/statistics')
  .get(protect, injectTenantId, financialRatioController.getFinancialRatioStatistics);

module.exports = router;