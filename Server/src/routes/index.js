/**
 * Routes Index
 * Exports all routes for easy importing
 */

// Auth Routes
const authRoutes = require('./auth.routes');

// Accounting Routes
const accountsRoutes = require('./accounting/accounts.routes');
const costCentersRoutes = require('./accounting/costCenters.routes');
const templatesRoutes = require('./accounting/templates.routes');
const journalEntriesRoutes = require('./accounting/journalEntries.routes');
const cashBookRoutes = require('./accounting/cashBook.routes');
const bankBookRoutes = require('./accounting/bankBook.routes');
const purchaseBookRoutes = require('./accounting/purchaseBook.routes');
const salesBookRoutes = require('./accounting/salesBook.routes');
const reportsRoutes = require('./accounting/reports.routes');
const tenantsRoutes = require('./accounting/tenants.routes');
const usersRoutes = require('./accounting/users.routes');
const rolesRoutes = require('./accounting/roles.routes');

// GST Routes
const gstRoutes = require('./gst/gst.routes');
const gstRegistrationsRoutes = require('./gst/registrations.routes');
const gstInvoicesRoutes = require('./gst/invoices.routes');
const gstReturnsRoutes = require('./gst/returns.routes');
const einvoiceRoutes = require('./gst/einvoice.routes');
const ewaybillRoutes = require('./gst/ewaybill.routes');
const itcRoutes = require('./gst/itc.routes');
const hsnCodesRoutes = require('./hsnCodes.routes');
const taxRatesRoutes = require('./taxRates.routes');

// CA Routes
const caRoutes = require('./ca/ca.routes');

// CFO Routes
const cfoRoutes = require('./cfo.routes');
const roadmapsRoutes = require('./cfo/roadmaps.routes');
const scenariosRoutes = require('./cfo/scenarios.routes');
const modelsRoutes = require('./cfo/models.routes');
const kpisRoutes = require('./cfo/kpis.routes');
const risksRoutes = require('./cfo/risks.routes');
const controlsRoutes = require('./cfo/controls.routes');
const fundraisingRoutes = require('./cfo/fundraising.routes');
const dashboardRoutes = require('./cfo/dashboard.routes');
const captableRoutes = require('./cfo/captable.routes');

// System Routes
const systemRoutes = require('./system.routes');

// Integration Routes
const integrationsRoutes = require('./integrations.routes');

module.exports = {
  // Auth Routes
  authRoutes,
  
  // Accounting Routes
  accountsRoutes,
  costCentersRoutes,
  templatesRoutes,
  journalEntriesRoutes,
  cashBookRoutes,
  bankBookRoutes,
  purchaseBookRoutes,
  salesBookRoutes,
  reportsRoutes,
  tenantsRoutes,
  usersRoutes,
  rolesRoutes,
  
  // GST Routes
  gstRoutes,
  gstRegistrationsRoutes,
  gstInvoicesRoutes,
  gstReturnsRoutes,
  einvoiceRoutes,
  ewaybillRoutes,
  itcRoutes,
  hsnCodesRoutes,
  taxRatesRoutes,
  
  // CA Routes
  caRoutes,
  
  // CFO Routes
  cfoRoutes,
  roadmapsRoutes,
  scenariosRoutes,
  modelsRoutes,
  kpisRoutes,
  risksRoutes,
  controlsRoutes,
  fundraisingRoutes,
  dashboardRoutes,
  captableRoutes,
  
  // System Routes
  systemRoutes,
  
  // Integration Routes
  integrationsRoutes
};