/**
 * Role Seeder Utility
 * Imports roles and permissions from seedRoles.js for use in auth controller
 */

// All permissions used in the codebase
const ACCOUNTING_PERMISSIONS = [
  // Users
  'user:create', 'user:update', 'user:delete',
  // Roles
  'role:create', 'role:update', 'role:delete', 'role:assign',
  // Accounts
  'account:create', 'account:update', 'account:archive', 'account:bulk-upload',
  // Journal Entries
  'journal:create', 'journal:update', 'journal:delete', 'journal:post', 'journal:unpost', 'journal:submit', 'journal:approve', 'journal:reject',
  // Cost Centers
  'costcenter:create', 'costcenter:update', 'costcenter:archive',
  // Templates
  'template:create', 'template:update', 'template:delete', 'template:enable', 'template:disable',
  // Sales Book
  'salesbook:create',
  // Purchase Book
  'purchasebook:create',
  // Bank Book
  'bankbook:import', 'bankbook:reconcile', 'bankbook:manual',
  // Cash Book
  'cashbook:manual',
  // Tenants
  'tenant:update'
];

// GST permissions (based on GST routes)
const GST_PERMISSIONS = [
  'gst:registration:create', 'gst:registration:update', 'gst:registration:delete',
  'gst:sales:create', 'gst:sales:update', 'gst:sales:delete',
  'gst:purchase:create', 'gst:purchase:update', 'gst:purchase:delete',
  'gst:returns:generate', 'gst:returns:file',
  'gst:einvoice:generate', 'gst:ewaybill:generate',
  'gst:itc:manage', 'gst:itc:reconcile'
];

// CFO permissions (based on CFO routes)
const CFO_PERMISSIONS = [
  'cfo:dashboard:view', 'cfo:dashboard:manage',
  'cfo:kpis:view', 'cfo:kpis:manage',
  'cfo:scenarios:view', 'cfo:scenarios:manage',
  'cfo:models:view', 'cfo:models:manage',
  'cfo:risks:view', 'cfo:risks:manage',
  'cfo:controls:view', 'cfo:controls:manage',
  'cfo:fundraising:view', 'cfo:fundraising:manage',
  'cfo:captable:view', 'cfo:captable:manage',
  'cfo:roadmaps:view', 'cfo:roadmaps:manage'
];

// CA permissions (based on CA routes)
const CA_PERMISSIONS = [
  'ca:clients:view', 'ca:clients:manage',
  'ca:compliance:view', 'ca:compliance:manage',
  'ca:audit:view', 'ca:audit:manage',
  'ca:taxfiling:view', 'ca:taxfiling:manage'
];

const ROLES = [
  {
    name: 'Admin',
    description: 'Full access to all features',
    permissions: [
      ...ACCOUNTING_PERMISSIONS,
      ...GST_PERMISSIONS,
      ...CFO_PERMISSIONS,
      ...CA_PERMISSIONS
    ],
  },
  {
    name: 'Accountant',
    description: 'Accounting operations only',
    permissions: [
      'account:create', 'account:update', 'account:archive', 'account:bulk-upload',
      'journal:create', 'journal:update', 'journal:delete', 'journal:post', 'journal:unpost', 'journal:submit',
      'costcenter:create', 'costcenter:update', 'costcenter:archive',
      'salesbook:create', 'purchasebook:create',
      'bankbook:import', 'bankbook:reconcile', 'bankbook:manual',
      'cashbook:manual',
      'template:create', 'template:update', 'template:enable', 'template:disable'
    ],
  },
  {
    name: 'Viewer',
    description: 'Read-only access',
    permissions: [], // Only read endpoints, which are not permission-protected
  },
  // CFO module roles (role name based)
  {
    name: 'cfo',
    description: 'CFO role for CFO module',
    permissions: [
      ...CFO_PERMISSIONS,
      // Basic accounting permissions for CFO
      'account:create', 'account:update',
      'journal:create', 'journal:update', 'journal:post',
      'costcenter:create', 'costcenter:update'
    ],
  },
  {
    name: 'finance-manager',
    description: 'Finance Manager role for CFO module',
    permissions: [
      'cfo:dashboard:view', 'cfo:dashboard:manage',
      'cfo:kpis:view', 'cfo:kpis:manage',
      'cfo:scenarios:view', 'cfo:scenarios:manage',
      'cfo:models:view', 'cfo:models:manage',
      'cfo:risks:view', 'cfo:risks:manage',
      'cfo:controls:view', 'cfo:controls:manage',
      'cfo:fundraising:view', 'cfo:fundraising:manage',
      'cfo:captable:view', 'cfo:captable:manage',
      'cfo:roadmaps:view', 'cfo:roadmaps:manage',
      // Basic accounting permissions
      'account:create', 'account:update',
      'journal:create', 'journal:update', 'journal:post',
      'costcenter:create', 'costcenter:update'
    ],
  },
  {
    name: 'finance-analyst',
    description: 'Finance Analyst role for CFO module',
    permissions: [
      'cfo:dashboard:view',
      'cfo:kpis:view',
      'cfo:scenarios:view',
      'cfo:models:view',
      'cfo:risks:view',
      'cfo:controls:view',
      'cfo:fundraising:view',
      'cfo:captable:view',
      'cfo:roadmaps:view'
    ],
  },
  // GST specific roles
  {
    name: 'gst-manager',
    description: 'GST Manager role for GST module',
    permissions: [
      ...GST_PERMISSIONS,
      // Basic accounting permissions for GST
      'account:create', 'account:update',
      'journal:create', 'journal:update', 'journal:post'
    ],
  },
  {
    name: 'gst-operator',
    description: 'GST Operator role for GST module',
    permissions: [
      'gst:sales:create', 'gst:sales:update',
      'gst:purchase:create', 'gst:purchase:update',
      'gst:returns:generate',
      'gst:einvoice:generate', 'gst:ewaybill:generate',
      'gst:itc:manage'
    ],
  },
  // CA specific roles
  {
    name: 'ca-manager',
    description: 'CA Manager role for CA module',
    permissions: [
      ...CA_PERMISSIONS,
      // Basic accounting permissions for CA
      'account:create', 'account:update',
      'journal:create', 'journal:update', 'journal:post'
    ],
  },
  {
    name: 'ca-operator',
    description: 'CA Operator role for CA module',
    permissions: [
      'ca:clients:view', 'ca:clients:manage',
      'ca:compliance:view', 'ca:compliance:manage',
      'ca:audit:view',
      'ca:taxfiling:view', 'ca:taxfiling:manage'
    ],
  }
];

module.exports = {
  ACCOUNTING_PERMISSIONS,
  GST_PERMISSIONS,
  CFO_PERMISSIONS,
  CA_PERMISSIONS,
  ROLES
}; 