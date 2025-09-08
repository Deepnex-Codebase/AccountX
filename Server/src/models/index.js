/**
 * Models Index
 * Exports all models for easy importing
 */

// Accounting Models
const User = require('./user.model');
const Tenant = require('./tenant.model');
const Role = require('./role.model');
const Account = require('./accounting/account.model');
const JournalEntry = require('./accounting/journalEntry.model');
const CostCenter = require('./accounting/costCenter.model');
const Template = require('./accounting/template.model');

// GST Models
const GSTRegistration = require('./gst/registration.model');
const GSTInvoice = require('./gst/invoice.model');
const GSTReturn = require('./gst/return.model');
const EInvoice = require('./gst/einvoice.model');
const EWayBill = require('./gst/ewaybill.model');
const ITC = require('./gst/itc.model');

// CA Models
const CAClient = require('./ca/client.model');
const ComplianceTask = require('./ca/complianceTask.model');

// CFO Models
const FinancialModel = require('./cfo/financialModel.model');
const KPI = require('./cfo/kpi.model');
const Roadmap = require('./cfo/roadmap.model');
const Scenario = require('./cfo/scenario.model');
const Risk = require('./cfo/risk.model');
const Control = require('./cfo/control.model');
const Fundraising = require('./cfo/fundraising.model');
const CapTable = require('./cfo/capTable.model');

// System Models
const FeatureFlag = require('./system/featureFlag.model');
const SystemLog = require('./system/systemLog.model');

// Integration Models
const Integration = require('./integration.model');

module.exports = {
  // Accounting Models
  User,
  Tenant,
  Role,
  Account,
  JournalEntry,
  CostCenter,
  Template,
  
  // GST Models
  GSTRegistration,
  GSTInvoice,
  GSTReturn,
  EInvoice,
  EWayBill,
  ITC,
  
  // CA Models
  CAClient,
  ComplianceTask,
  
  // CFO Models
  FinancialModel,
  KPI,
  Roadmap,
  Scenario,
  Risk,
  Control,
  Fundraising,
  CapTable,
  
  // System Models
  FeatureFlag,
  SystemLog,
  
  // Integration Models
  Integration
};