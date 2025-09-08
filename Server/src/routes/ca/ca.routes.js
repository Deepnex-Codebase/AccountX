/**
 * CA Module Routes
 * Defines API routes for Chartered Accountant module functionality
 */

const express = require('express');
const router = express.Router();
const { protect, hasPermission } = require('../../middleware/authMiddleware');
const tenantMiddleware = require('../../middleware/tenantMiddleware');

// Import controllers
const clientController = require('../../controllers/ca/client.controller');
const complianceController = require('../../controllers/ca/compliance.controller');
const taxFilingController = require('../../controllers/ca/taxFiling.controller');
const auditController = require('../../controllers/ca/audit.controller');

// Client Management routes
router
  .route('/clients')
  .get(protect, tenantMiddleware, clientController.getClients)
  .post(protect, tenantMiddleware, clientController.createClient);

router
  .route('/clients/:id')
  .get(protect, tenantMiddleware, clientController.getClientById)
  .put(protect, tenantMiddleware, clientController.updateClient)
  .delete(protect, tenantMiddleware, clientController.deleteClient);

// Compliance Calendar routes
router
  .route('/compliance-calendar')
  .get(protect, tenantMiddleware, complianceController.getComplianceCalendar)
  .post(protect, tenantMiddleware, complianceController.createComplianceTask);

router
  .route('/compliance-calendar/:id')
  .get(protect, tenantMiddleware, complianceController.getComplianceTaskById)
  .put(protect, tenantMiddleware, complianceController.updateComplianceTask)
  .delete(protect, tenantMiddleware, complianceController.deleteComplianceTask);

router
  .route('/compliance-calendar/:id/mark-complete')
  .patch(protect, tenantMiddleware, complianceController.markTaskComplete);

// Tax Filing routes
router
  .route('/tax-filings')
  .get(protect, tenantMiddleware, taxFilingController.getTaxFilings)
  .post(protect, tenantMiddleware, taxFilingController.createTaxFiling);

router
  .route('/tax-filings/:id')
  .get(protect, tenantMiddleware, taxFilingController.getTaxFilingById)
  .put(protect, tenantMiddleware, taxFilingController.updateTaxFiling)
  .delete(protect, tenantMiddleware, taxFilingController.deleteTaxFiling);

router
  .route('/tax-filings/:id/mark-filed')
  .patch(protect, tenantMiddleware, taxFilingController.markTaxFilingComplete);

// Audit routes
router
  .route('/audits')
  .get(protect, tenantMiddleware, auditController.getAudits)
  .post(protect, tenantMiddleware, auditController.createAudit);

router
  .route('/audits/:id')
  .get(protect, tenantMiddleware, auditController.getAuditById)
  .put(protect, tenantMiddleware, auditController.updateAudit)
  .delete(protect, tenantMiddleware, auditController.deleteAudit);

router
  .route('/audits/:id/findings')
  .post(protect, tenantMiddleware, auditController.addAuditFinding);

router
  .route('/audits/:id/findings/:findingId')
  .put(protect, tenantMiddleware, auditController.updateAuditFinding)
  .delete(protect, tenantMiddleware, auditController.deleteAuditFinding);

router
  .route('/audits/:id/complete')
  .patch(protect, tenantMiddleware, auditController.completeAudit);

module.exports = router;