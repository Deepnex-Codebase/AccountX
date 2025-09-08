// scripts/seedRoles.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Role = require('../src/models/role.model');
const Tenant = require('../src/models/tenant.model');

// Load environment variables
dotenv.config();

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

const ROLES = [
  {
    name: 'Admin',
    description: 'Full access to all features',
    permissions: ACCOUNTING_PERMISSIONS,
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
    permissions: [],
  },
  {
    name: 'finance-manager',
    description: 'Finance Manager role for CFO module',
    permissions: [],
  },
  {
    name: 'finance-analyst',
    description: 'Finance Analyst role for CFO module',
    permissions: [],
  },
];

async function seedRoles() {
  await mongoose.connect(process.env.MONGODB_URI);
  const tenants = await Tenant.find();
  if (!tenants.length) {
    console.log('No tenants found.');
    process.exit(0);
  }
  for (const tenant of tenants) {
    console.log(`\nSeeding roles for tenant: ${tenant.name} (${tenant._id})`);
    for (const roleData of ROLES) {
      const exists = await Role.findOne({ name: roleData.name, tenantId: tenant._id });
      if (exists) {
        console.log(`  Role '${roleData.name}' already exists.`);
        continue;
      }
      await Role.create({
        name: roleData.name,
        permissions: roleData.permissions,
        tenantId: tenant._id,
        description: roleData.description
      });
      console.log(`  Created role: ${roleData.name}`);
    }
  }
  await mongoose.disconnect();
  console.log('\nRole seeding complete!');
  process.exit(0);
}

seedRoles().catch(err => {
  console.error('Error seeding roles:', err);
  process.exit(1);
}); 