const express = require('express');
const router = express.Router();
const { protect } = require('../../middleware/authMiddleware');
const tenantMiddleware = require('../../middleware/tenantMiddleware');
const reportsController = require('../../controllers/accounting/reports.controller');

// Trial Balance
router.get('/trial-balance', protect, tenantMiddleware, reportsController.getTrialBalance);
// Balance Sheet
router.get('/balance-sheet', protect, tenantMiddleware, reportsController.getBalanceSheet);
// Profit & Loss
router.get('/profit-loss', protect, tenantMiddleware, reportsController.getProfitLoss);
// Export any report
router.get('/:type/export', protect, tenantMiddleware, reportsController.exportReport);
// Schedule recurring report delivery
router.post('/schedule', protect, tenantMiddleware, reportsController.scheduleReport);

module.exports = router; 