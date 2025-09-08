/**
 * GST Module Routes
 * Defines API routes for GST module functionality
 */

const express = require('express');
const router = express.Router();
const { protect, hasPermission } = require('../../middleware/authMiddleware');
const tenantMiddleware = require('../../middleware/tenantMiddleware');

// Import controllers
const gstRegistrationController = require('../../controllers/gst/gstRegistration.controller');
const salesInvoiceController = require('../../controllers/gst/salesInvoice.controller');
const purchaseInvoiceController = require('../../controllers/gst/purchaseInvoice.controller');
const gstr1Controller = require('../../controllers/gst/gstr1.controller');
const gstr3bController = require('../../controllers/gst/gstr3b.controller');

// GST Registration routes
router
  .route('/registrations')
  .get(protect, tenantMiddleware, gstRegistrationController.getGSTRegistrations)
  .post(protect, tenantMiddleware, gstRegistrationController.createGSTRegistration);

router
  .route('/registrations/:id')
  .get(protect, tenantMiddleware, gstRegistrationController.getGSTRegistrationById)
  .put(protect, tenantMiddleware, gstRegistrationController.updateGSTRegistration)
  .delete(protect, tenantMiddleware, gstRegistrationController.deleteGSTRegistration);

router
  .route('/registrations/:id/update-status')
  .patch(protect, tenantMiddleware, gstRegistrationController.updateGSTRegistrationStatus);

router
  .route('/registrations/:id/portal-credentials')
  .patch(protect, tenantMiddleware, gstRegistrationController.storeGSTPortalCredentials);

router
  .route('/registrations/verify')
  .post(protect, tenantMiddleware, gstRegistrationController.verifyGSTRegistration);

// Sales Invoice routes
router
  .route('/sales-invoices')
  .get(protect, tenantMiddleware, salesInvoiceController.getSalesInvoices)
  .post(protect, tenantMiddleware, salesInvoiceController.createSalesInvoice);

router
  .route('/sales-invoices/:id')
  .get(protect, tenantMiddleware, salesInvoiceController.getSalesInvoiceById)
  .put(protect, tenantMiddleware, salesInvoiceController.updateSalesInvoice)
  .delete(protect, tenantMiddleware, salesInvoiceController.deleteSalesInvoice);

router
  .route('/sales-invoices/:id/payment-status')
  .patch(protect, tenantMiddleware, salesInvoiceController.updatePaymentStatus);

router
  .route('/sales-invoices/:id/mark-reported')
  .patch(protect, tenantMiddleware, salesInvoiceController.markAsReportedInGSTR);

router
  .route('/sales-invoices/:id/generate-einvoice')
  .post(protect, tenantMiddleware, salesInvoiceController.generateEInvoice);

router
  .route('/sales-invoices/:id/generate-eway-bill')
  .post(protect, tenantMiddleware, salesInvoiceController.generateEWayBill);

router
  .route('/sales-invoices/:id/generate-journal-entry')
  .post(protect, tenantMiddleware, salesInvoiceController.generateJournalEntry);

router
  .route('/sales-invoices/statistics')
  .get(protect, tenantMiddleware, salesInvoiceController.getSalesInvoiceStatistics);

// Purchase Invoice routes
router
  .route('/purchase-invoices')
  .get(protect, tenantMiddleware, purchaseInvoiceController.getPurchaseInvoices)
  .post(protect, tenantMiddleware, purchaseInvoiceController.createPurchaseInvoice);

router
  .route('/purchase-invoices/:id')
  .get(protect, tenantMiddleware, purchaseInvoiceController.getPurchaseInvoiceById)
  .put(protect, tenantMiddleware, purchaseInvoiceController.updatePurchaseInvoice)
  .delete(protect, tenantMiddleware, purchaseInvoiceController.deletePurchaseInvoice);

router
  .route('/purchase-invoices/:id/payment-status')
  .patch(protect, tenantMiddleware, purchaseInvoiceController.updatePaymentStatus);

router
  .route('/purchase-invoices/:id/itc-eligibility')
  .patch(protect, tenantMiddleware, purchaseInvoiceController.updateITCEligibility);

router
  .route('/purchase-invoices/:id/mark-reported')
  .patch(protect, tenantMiddleware, purchaseInvoiceController.markAsReportedInGSTR);

router
  .route('/purchase-invoices/:id/generate-journal-entry')
  .post(protect, tenantMiddleware, purchaseInvoiceController.generateJournalEntry);

router
  .route('/purchase-invoices/statistics')
  .get(protect, tenantMiddleware, purchaseInvoiceController.getPurchaseInvoiceStatistics);

// GSTR-1 routes
router
  .route('/gstr1')
  .get(protect, tenantMiddleware, gstr1Controller.getGSTR1Returns)
  .post(protect, tenantMiddleware, gstr1Controller.createGSTR1);

router
  .route('/gstr1/:id')
  .get(protect, tenantMiddleware, gstr1Controller.getGSTR1ById)
  .put(protect, tenantMiddleware, gstr1Controller.updateGSTR1)
  .delete(protect, tenantMiddleware, gstr1Controller.deleteGSTR1);

router
  .route('/gstr1/:id/populate')
  .post(protect, tenantMiddleware, gstr1Controller.populateGSTR1);

router
  .route('/gstr1/:id/json')
  .get(protect, tenantMiddleware, gstr1Controller.generateGSTR1JSON);

router
  .route('/gstr1/:id/mark-filed')
  .patch(protect, tenantMiddleware, gstr1Controller.markGSTR1Filed);

router
  .route('/gstr1/statistics')
  .get(protect, tenantMiddleware, gstr1Controller.getGSTR1Statistics);

// GSTR-3B routes
router
  .route('/gstr3b')
  .get(protect, tenantMiddleware, gstr3bController.getGSTR3BReturns)
  .post(protect, tenantMiddleware, gstr3bController.createGSTR3B);

router
  .route('/gstr3b/:id')
  .get(protect, tenantMiddleware, gstr3bController.getGSTR3BById)
  .put(protect, tenantMiddleware, gstr3bController.updateGSTR3B)
  .delete(protect, tenantMiddleware, gstr3bController.deleteGSTR3B);

router
  .route('/gstr3b/:id/populate')
  .post(protect, tenantMiddleware, gstr3bController.populateGSTR3B);

router
  .route('/gstr3b/:id/calculate')
  .post(protect, tenantMiddleware, gstr3bController.calculateGSTR3B);

router
  .route('/gstr3b/:id/json')
  .get(protect, tenantMiddleware, gstr3bController.generateGSTR3BJSON);

router
  .route('/gstr3b/:id/mark-filed')
  .patch(protect, tenantMiddleware, gstr3bController.markGSTR3BFiled);

router
  .route('/gstr3b/statistics')
  .get(protect, tenantMiddleware, gstr3bController.getGSTR3BStatistics);

module.exports = router;