# Automatic Tenant System

## Overview

The system now automatically generates tenant IDs when an admin logs in, eliminating the need to manually pass tenant IDs in headers for all subsequent operations.

## How It Works

### 1. Admin Login Process

When an admin user logs in:

1. **Check for existing tenant**: If the user already has a `tenantId`, use it
2. **Auto-generate tenant**: If no tenant exists, automatically create one
3. **Create Admin role**: Automatically create an Admin role with full permissions
4. **Assign tenant and role**: Update the user with the new tenant and role

### 2. Tenant Generation Logic

```javascript
// When admin logs in without tenant:
const emailParts = user.email.split('@');
const username = emailParts[0];
const domain = `${username}.${emailParts[1]}`;

const tenant = await Tenant.create({
  name: `${username}'s Tenant`,
  domain,
  financialYearStart: new Date(),
  currency: 'INR',
  decimalPrecision: 2
});
```

### 3. Automatic Role Creation

When an admin registers or logs in, ALL roles are automatically created with proper permissions:

**Admin Role** - Full access to all features
- All accounting permissions (user, role, account, journal, cost center, template, sales, purchase, bank, cash, tenant management)
- All GST permissions (registration, sales, purchase, returns, e-invoice, e-waybill, ITC)
- All CFO permissions (dashboard, KPIs, scenarios, models, risks, controls, fundraising, cap table, roadmaps)
- All CA permissions (clients, compliance, audit, tax filing)

**Accountant Role** - Accounting operations only
- Account management (create, update, archive, bulk upload)
- Journal entries (create, update, delete, post, unpost, submit)
- Cost centers (create, update, archive)
- Sales/Purchase books (create)
- Bank/Cash books (import, reconcile, manual)
- Templates (create, update, enable, disable)

**Viewer Role** - Read-only access
- View-only permissions for all modules

**CFO Module Roles**
- `cfo` - CFO role with full CFO permissions + basic accounting
- `finance-manager` - Finance Manager with full CFO permissions + basic accounting
- `finance-analyst` - Finance Analyst with view-only CFO permissions

**GST Module Roles**
- `gst-manager` - GST Manager with full GST permissions + basic accounting
- `gst-operator` - GST Operator with GST operations (sales, purchase, returns, e-invoice, e-waybill, ITC)

**CA Module Roles**
- `ca-manager` - CA Manager with full CA permissions + basic accounting
- `ca-operator` - CA Operator with CA operations (clients, compliance, audit, tax filing)

All roles are created with the same tenant ID as the admin user.

## Key Changes Made

### 1. Auth Controller Updates

**File**: `src/controllers/auth.controller.js`

- Added `createAllRolesForTenant()` helper function (imports roles from roleSeeder utility)
- Added `setupAdminTenant()` helper function
- Added `isAdminUser()` helper function
- Added `generateUniqueDomain()` helper function
- Modified `login()` to auto-generate tenant and all roles for admins
- Modified `register()` to create all roles for admin users
- Updated `createSendToken()` to include tenantId in response
- Enhanced `getMe()` to populate tenant information

### 2. New Role Seeder Utility

**File**: `src/utils/roleSeeder.js`

- Centralized role and permission definitions
- Exports `ROLES` array for use across the application
- Maintains consistency with `scripts/seedRoles.js`

### 2. Tenant Middleware Updates

**File**: `src/middleware/tenantMiddleware.js`

- Now automatically extracts tenant ID from authenticated user
- No longer requires `x-tenant-id` header
- Provides `req.tenantId` for all controllers

### 3. New Tenant Helper Utilities

**File**: `src/utils/tenantHelper.js`

- `addTenantFilter()` - Add tenant filter to queries
- `findWithTenant()` - Create tenant-aware find queries
- `findOneWithTenant()` - Create tenant-aware findOne queries
- `createWithTenant()` - Create tenant-aware create operations
- `isValidTenantId()` - Validate tenant ID format

## Usage Examples

### 1. Admin Registration Flow

```javascript
// POST /api/v1/auth/register (Admin)
{
  "email": "admin@company.com",
  "password": "password123",
  "isAdmin": true
}

// Response includes tenantId and assigned role
{
  "success": true,
  "token": "jwt_token_here",
  "user": { ... },
  "tenantId": "507f1f77bcf86cd799439011",
  "assignedRole": "Admin"
}
```

### 2. User Registration with Specific Role

```javascript
// POST /api/v1/auth/register (Specific Role)
{
  "email": "accountant@company.com",
  "password": "password123",
  "roleName": "Accountant",
  "tenantId": "507f1f77bcf86cd799439011"
}

// Response includes assigned role
{
  "success": true,
  "token": "jwt_token_here",
  "user": { ... },
  "tenantId": "507f1f77bcf86cd799439011",
  "assignedRole": "Accountant"
}
```

### 3. Available Roles for Registration

- **Admin**: Full access to all features
- **Accountant**: Accounting operations only
- **Viewer**: Read-only access
- **cfo**: CFO role with full CFO permissions
- **finance-manager**: Finance Manager with CFO permissions
- **finance-analyst**: Finance Analyst with view-only CFO permissions
- **gst-manager**: GST Manager with full GST permissions
- **gst-operator**: GST Operator with GST operations
- **ca-manager**: CA Manager with full CA permissions
- **ca-operator**: CA Operator with CA operations

### 4. Get Available Roles

```javascript
// GET /api/v1/auth/roles
// Returns all available roles for the current tenant
{
  "success": true,
  "data": [
    {
      "name": "Admin",
      "description": "Full access to all features",
      "permissions": [...]
    },
    {
      "name": "Accountant", 
      "description": "Accounting operations only",
      "permissions": [...]
    }
  ]
}
```

### 2. Controller Usage

```javascript
// In any controller, tenant is automatically available
exports.createInvoice = async (req, res, next) => {
  // req.tenantId is automatically set by middleware
  const invoice = await Invoice.create({
    ...req.body,
    tenantId: req.tenantId, // Automatically included
    createdBy: req.user.id
  });
  
  res.status(201).json({
    success: true,
    data: invoice
  });
};
```

### 3. Query with Tenant Filter

```javascript
// Using tenant helper utilities
const { findWithTenant } = require('../utils/tenantHelper');

exports.getInvoices = async (req, res, next) => {
  const invoices = await findWithTenant(
    Invoice, 
    { status: 'active' }, 
    req.tenantId
  );
  
  res.status(200).json({
    success: true,
    data: invoices
  });
};
```

## Benefits

1. **Automatic Setup**: No manual tenant creation required
2. **Seamless Experience**: Admins get full access immediately upon login
3. **Security**: Tenant isolation is enforced automatically
4. **Simplicity**: No need to pass tenant IDs in headers
5. **Consistency**: All operations use the same tenant context

## Testing

Run the test script to see the tenant system in action:

```bash
node test_tenant_system.js
```

This will demonstrate:
- Admin user creation
- Automatic tenant generation
- Role assignment
- Tenant-aware operations

## Migration Notes

### For Existing Users

- Existing users with tenants will continue to work normally
- Users without tenants will get automatic tenant generation on next login
- All existing data remains intact

### For New Implementations

- No need to manually create tenants
- No need to pass tenant IDs in headers
- Controllers automatically use the authenticated user's tenant

## Security Considerations

- Tenant isolation is enforced at the middleware level
- Users can only access data within their assigned tenant
- Admin roles are scoped to specific tenants
- All database queries automatically include tenant filters 