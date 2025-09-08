# Account_X - Comprehensive Accounting & GST Solution

Account_X is a powerful ME*N-stack (MongoDB, Express, Node.js) application designed for Indian businesses, providing comprehensive accounting, GST compliance, and financial management capabilities.

Below is the **Backend PRD** for the application, organized **module-wise**. Each module follows the requested format:

---

## 📦 GST Module

### 1. Purpose & Objectives

- **Purpose**: Provide comprehensive GST compliance and management capabilities for Indian businesses.
- **Objectives**:
    - Enable GST registration management and verification.
    - Facilitate GST invoice creation, e-invoicing, and e-way bill generation.
    - Streamline GST return filing (GSTR-1, GSTR-3B).
    - Manage Input Tax Credit (ITC) eligibility, claims, and reversals.
    - Generate GST-related reports and statistics.

### 2. Scope

- **Registration**: GST Registration Management, Verification
- **Invoicing**: GST Invoices (Sales/Purchase), E-Invoicing, E-Way Bills
- **Returns**: GSTR-1, GSTR-3B Filing, JSON Generation
- **ITC**: Eligibility Determination, Claim Management, Reversals
- **Reporting**: GST Analytics, Monthly Trends, Compliance Status

### 3. Detailed Architecture Overview

- **API Layer**: Express controllers with role-based access control
- **Service Layer**: Business logic for GST compliance rules
- **Integration**: Simulated IRP (Invoice Registration Portal) and EWB (E-Way Bill) Portal APIs
- **Validation**: Strict validation for GST-specific rules (GSTIN format, tax calculations)
- **Tenant Isolation**: All GST data segregated by tenant

### 4. Data Model (Core Entities)

### 4.1 GST Registration

**Collection**: `gstRegistrations`

| Field | Type | Description | Index |
| --- | --- | --- | --- |
| `_id` | ObjectId | Unique identifier | |
| `tenant` | ObjectId | References `tenants._id` | **tenant** |
| `gstin` | String | GST Identification Number | **tenant + gstin (unique)** |
| `legalName` | String | Legal name as per GST registration | |
| `tradeName` | String | Trade/business name | |
| `status` | String | Active/Cancelled/Suspended | **tenant + status** |
| `address` | Object | Registered address details | |
| `portalCredentials` | Object | GST portal login credentials (encrypted) | |
| `createdBy` | ObjectId | References `users._id` | |
| `createdAt` | ISODate | Record creation timestamp | |
| `updatedAt` | ISODate | Record update timestamp | |

### 4.2 GST Invoice

**Collection**: `gstInvoices`

| Field | Type | Description | Index |
| --- | --- | --- | --- |
| `_id` | ObjectId | Unique identifier | |
| `tenant` | ObjectId | References `tenants._id` | **tenant** |
| `invoiceType` | String | Sales/Purchase | **tenant + invoiceType** |
| `invoiceNumber` | String | Invoice number | **tenant + invoiceNumber + invoiceType (unique)** |
| `invoiceDate` | Date | Invoice date | |
| `customerName`/`vendorName` | String | Customer/vendor name | |
| `customerGstin`/`vendorGstin` | String | Customer/vendor GSTIN | |
| `placeOfSupply` | String | State code for place of supply | |
| `items` | [Object] | Line items with HSN, tax rates | |
| `totalTaxableValue` | Number | Total taxable value | |
| `totalCgstAmount` | Number | Total CGST amount | |
| `totalSgstAmount` | Number | Total SGST amount | |
| `totalIgstAmount` | Number | Total IGST amount | |
| `totalAmount` | Number | Total invoice amount | |
| `createdBy` | ObjectId | References `users._id` | |
| `createdAt` | ISODate | Record creation timestamp | |
| `updatedAt` | ISODate | Record update timestamp | |

### 4.3 GST Return

**Collection**: `gstReturns`

| Field | Type | Description | Index |
| --- | --- | --- | --- |
| `_id` | ObjectId | Unique identifier | |
| `tenant` | ObjectId | References `tenants._id` | **tenant** |
| `returnType` | String | GSTR-1/GSTR-3B | **tenant + returnType** |
| `period` | Object | Month and year | **tenant + returnType + period (unique)** |
| `status` | String | Draft/Generated/Filed/Error | **tenant + status** |
| `filingDate` | Date | Date of filing | |
| `acknowledgementNumber` | String | Filing acknowledgement number | |
| `jsonData` | Object | JSON data for filing | |
| `createdBy` | ObjectId | References `users._id` | |
| `createdAt` | ISODate | Record creation timestamp | |
| `updatedAt` | ISODate | Record update timestamp | |

### 4.4 E-Invoice

**Collection**: `eInvoices`

| Field | Type | Description | Index |
| --- | --- | --- | --- |
| `_id` | ObjectId | Unique identifier | |
| `tenant` | ObjectId | References `tenants._id` | **tenant** |
| `invoice` | ObjectId | References `gstInvoices._id` | **tenant + invoice (unique)** |
| `status` | String | PENDING/GENERATED/CANCELLED/FAILED | **tenant + status** |
| `irn` | String | Invoice Reference Number | **irn (unique)** |
| `qrCode` | String | QR code data (base64) | |
| `acknowledgementNumber` | String | IRN acknowledgement number | |
| `acknowledgementDate` | Date | IRN generation date | |
| `signedInvoice` | String | Signed invoice data | |
| `createdBy` | ObjectId | References `users._id` | |
| `createdAt` | ISODate | Record creation timestamp | |
| `updatedAt` | ISODate | Record update timestamp | |

### 4.5 E-Way Bill

**Collection**: `eWayBills`

| Field | Type | Description | Index |
| --- | --- | --- | --- |
| `_id` | ObjectId | Unique identifier | |
| `tenant` | ObjectId | References `tenants._id` | **tenant** |
| `invoice` | ObjectId | References `gstInvoices._id` | **tenant + invoice** |
| `ewbNumber` | String | E-way bill number | **ewbNumber (unique)** |
| `ewbDate` | Date | E-way bill generation date | |
| `validUntil` | Date | E-way bill validity date | |
| `status` | String | GENERATED/CANCELLED/EXPIRED | **tenant + status** |
| `documentType` | String | Invoice/Bill/Challan | |
| `documentNumber` | String | Document number | **tenant + documentNumber + documentDate** |
| `documentDate` | Date | Document date | |
| `fromGstin` | String | Sender GSTIN | |
| `toGstin` | String | Recipient GSTIN | |
| `transportDetails` | Object | Mode, vehicle number, etc. | |
| `createdBy` | ObjectId | References `users._id` | |
| `createdAt` | ISODate | Record creation timestamp | |
| `updatedAt` | ISODate | Record update timestamp | |

### 4.6 Input Tax Credit (ITC)

**Collection**: `itc`

| Field | Type | Description | Index |
| --- | --- | --- | --- |
| `_id` | ObjectId | Unique identifier | |
| `tenant` | ObjectId | References `tenants._id` | **tenant** |
| `invoice` | ObjectId | References `gstInvoices._id` | **tenant + invoice (unique)** |
| `eligibilityStatus` | String | ELIGIBLE/INELIGIBLE/BLOCKED/etc. | **tenant + eligibilityStatus** |
| `claimStatus` | String | NOT_CLAIMED/CLAIMED/etc. | **tenant + claimStatus** |
| `itcType` | String | INPUT/CAPITAL/INPUT_SERVICE | **tenant + itcType** |
| `eligibleAmount` | Number | Total eligible ITC amount | |
| `claimedAmount` | Number | Total claimed ITC amount | |
| `claimPeriod` | Object | Month and year of claim | **tenant + claimPeriod** |
| `gstrMatchingStatus` | String | MATCHED/MISMATCHED/etc. | **tenant + gstrMatchingStatus** |
| `createdBy` | ObjectId | References `users._id` | |
| `createdAt` | ISODate | Record creation timestamp | |
| `updatedAt` | ISODate | Record update timestamp | |

---

## 📦 Accounting Module

### 1. Purpose & Objectives

- **Purpose**: Provide core bookkeeping and reporting capabilities for multi-tenant organizations.
- **Objectives**:
    - Enable creation, approval, and management of journal entries and subsidiary books.
    - Maintain master data (chart of accounts, cost centers, recurring templates).
    - Generate key financial reports (trial balance, balance sheet, P&L).
    - Enforce RBAC and tenant isolation.

### 2. Scope

- **Master Data**: Chart of Accounts, Cost Centers, Recurring Templates
- **Transactions**: Journal Entries, Cash Book, Bank Book, Purchase Book, Sales Book
- **Reporting**: Trial Balance, Balance Sheet, Profit & Loss, Exports
- **Administration**: Tenant Settings, User & Role Management

### 3. Detailed Architecture Overview

- **API Layer**: Express 5 controllers → service layer → Mongoose models
- **Auth & RBAC**: JWT auth middleware + permission middleware per route
- **Multi-Tenancy**: `tenantId` header injected into every query filter
- **Error Handling**: Centralized `AppError` & `asyncHandler`
- **Logging & Audits**: Mongoose middleware for change history on key models

### 4. Data Model (Core Entities)

### 4.1 Tenants

**Collection**: `tenants`

| Field | Type | Description | Index |
| --- | --- | --- | --- |
| `_id` | ObjectId | Unique identifier |  |
| `name` | String | Tenant display name |  |
| `domain` | String | Tenant domain or subdomain | **domain (unique)** |
| `financialYearStart` | Date | First day of tenant’s financial year |  |
| `currency` | String | Default currency code (e.g. “INR”) |  |
| `decimalPrecision` | Number | Number of decimal places for amounts |  |
| `createdAt` | ISODate | Record creation timestamp | **createdAt** |
| `updatedAt` | ISODate | Record update timestamp | **updatedAt** |

### 4.2 Users

**Collection**: `users`

| Field | Type | Description | Index |
| --- | --- | --- | --- |
| `_id` | ObjectId | Unique identifier |  |
| `email` | String | User login email | **email (unique)** |
| `passwordHash` | String | Hashed password |  |
| `roles` | [ObjectId] | References `roles._id` |  |
| `tenantId` | ObjectId | References `tenants._id` | **tenantId** |
| `isActive` | Boolean | Active/inactive flag |  |
| `createdAt` | ISODate | Record creation timestamp | **createdAt** |
| `updatedAt` | ISODate | Record update timestamp | **updatedAt** |

### 4.3 Roles

**Collection**: `roles`

| Field | Type | Description | Index |
| --- | --- | --- | --- |
| `_id` | ObjectId | Unique identifier |  |
| `name` | String | Role name (e.g. “Accountant”) |  |
| `permissions` | [String] | E.g. `["journal:create","report:view"]` |  |
| `tenantId` | ObjectId | References `tenants._id` | **tenantId** |
| `createdAt` | ISODate | Record creation timestamp | **createdAt** |
| `updatedAt` | ISODate | Record update timestamp | **updatedAt** |

### 4.4 Accounts

**Collection**: `accounts`

| Field | Type | Description | Index |
| --- | --- | --- | --- |
| `_id` | ObjectId | Unique identifier |  |
| `code` | String | Account code (e.g. “1001”) |  |
| `name` | String | Account name (e.g. “Cash”) |  |
| `type` | String | One of Asset/Liability/Equity/Income/Expense |  |
| `parentAccount` | ObjectId | References parent `accounts._id` |  |
| `tenantId` | ObjectId | References `tenants._id` | **tenantId + code (unique)** |
| `isArchived` | Boolean | Soft‐delete flag |  |
| `createdAt` | ISODate | Record creation timestamp | **createdAt** |
| `updatedAt` | ISODate | Record update timestamp | **updatedAt** |

### 4.5 Cost Centers

**Collection**: `costCenters`

| Field | Type | Description | Index |
| --- | --- | --- | --- |
| `_id` | ObjectId | Unique identifier |  |
| `name` | String | Cost center name |  |
| `description` | String | Optional description |  |
| `assignedAccounts` | [ObjectId] | References `accounts._id` |  |
| `tenantId` | ObjectId | References `tenants._id` | **tenantId** |
| `createdAt` | ISODate | Record creation timestamp | **createdAt** |
| `updatedAt` | ISODate | Record update timestamp | **updatedAt** |

### 4.6 Recurring Templates

**Collection**: `templates`

| Field | Type | Description | Index |
| --- | --- | --- | --- |
| `_id` | ObjectId | Unique identifier |  |
| `name` | String | Template name (e.g. “Monthly Rent”) |  |
| `frequency` | String | DAILY/WEEKLY/MONTHLY/QUARTERLY/YEARLY |  |
| `entries` | [Sub-doc] | Each with `account`, `debit`, `credit` |  |
| `isEnabled` | Boolean | Active/inactive flag |  |
| `tenantId` | ObjectId | References `tenants._id` | **tenantId** |
| `createdAt` | ISODate | Record creation timestamp | **createdAt** |
| `updatedAt` | ISODate | Record update timestamp | **updatedAt** |

### 4.7 Journal Entries

**Collection**: `journalEntries`

| Field | Type | Description | Index |
| --- | --- | --- | --- |
| `_id` | ObjectId | Unique identifier |  |
| `date` | Date | Posting date | **tenantId + date** |
| `lines` | [Sub-doc] | Each with `account`, `debit`, `credit` |  |
| `narration` | String | Optional description |  |
| `attachments` | [ObjectId] | References `attachments._id` |  |
| `status` | String | Draft/Posted | **tenantId + status** |
| `tenantId` | ObjectId | References `tenants._id` | **tenantId** |
| `createdBy` | ObjectId | References `users._id` |  |
| `approvedBy` | ObjectId | References `users._id` |  |
| `approvedAt` | Date | Approval timestamp |  |
| `createdAt` | ISODate | Record creation timestamp | **createdAt** |
| `updatedAt` | ISODate | Record update timestamp | **updatedAt** |

### 4.8 Cash Book Entries

**Collection**: `cashBookEntries`

| Field | Type | Description | Index |
| --- | --- | --- | --- |
| `_id` | ObjectId | Unique identifier |  |
| `journalEntryId` | ObjectId | References `journalEntries._id` | **journalEntryId (unique)** |
| `type` | String | Auto/Manual |  |
| `amount` | Number | Transaction amount |  |
| `date` | Date | Transaction date | **tenantId + date** |
| `tenantId` | ObjectId | References `tenants._id` | **tenantId** |
| `createdAt` | ISODate | Record creation timestamp | **createdAt** |
| `updatedAt` | ISODate | Record update timestamp | **updatedAt** |

### 4.9 Bank Book Entries

**Collection**: `bankBookEntries`

| Field | Type | Description | Index |
| --- | --- | --- | --- |
| `_id` | ObjectId | Unique identifier |  |
| `journalEntryId` | ObjectId | References `journalEntries._id` | **journalEntryId (unique)** |
| `statementRef` | String | Bank statement reference |  |
| `statementDate` | Date | Date on bank statement | **tenantId + statementDate** |
| `reconciled` | Boolean | Flag indicating reconciliation status | **tenantId + reconciled** |
| `tenantId` | ObjectId | References `tenants._id` | **tenantId** |
| `createdAt` | ISODate | Record creation timestamp | **createdAt** |
| `updatedAt` | ISODate | Record update timestamp | **updatedAt** |

### 4.10 Purchase Book Entries

**Collection**: `purchaseBookEntries`

| Field | Type | Description | Index |
| --- | --- | --- | --- |
| `_id` | ObjectId | Unique identifier |  |
| `supplierInvoiceNo` | String | Supplier invoice number |  |
| `date` | Date | Invoice date | **tenantId + date** |
| `amount` | Number | Total invoice amount |  |
| `gstDetails` | Sub-doc | `{ igst, cgst, sgst }` |  |
| `tenantId` | ObjectId | References `tenants._id` | **tenantId** |
| `createdAt` | ISODate | Record creation timestamp | **createdAt** |
| `updatedAt` | ISODate | Record update timestamp | **updatedAt** |

### 4.11 Sales Book Entries

**Collection**: `salesBookEntries`

| Field | Type | Description | Index |
| --- | --- | --- | --- |
| `_id` | ObjectId | Unique identifier |  |
| `customerInvoiceNo` | String | Customer invoice number |  |
| `date` | Date | Invoice date | **tenantId + date** |
| `amount` | Number | Total invoice amount |  |
| `gstDetails` | Sub-doc | `{ igst, cgst, sgst }` |  |
| `tenantId` | ObjectId | References `tenants._id` | **tenantId** |
| `createdAt` | ISODate | Record creation timestamp | **createdAt** |
| `updatedAt` | ISODate | Record update timestamp | **updatedAt** |

### 4.12 Attachments

**Collection**: `attachments`

| Field | Type | Description | Index |
| --- | --- | --- | --- |
| `_id` | ObjectId | Unique identifier |  |
| `tenantId` | ObjectId | Tenant isolation | **tenantId + entity + entityId** |
| `entity` | String | Parent collection name (e.g. `JournalEntry`) |  |
| `entityId` | ObjectId | ID of the referenced document |  |
| `fileName` | String | Original filename |  |
| `fileUrl` | String | S3/Blob storage URL |  |
| `uploadedBy` | ObjectId | References `users._id` |  |
| `uploadedAt` | ISODate | Upload timestamp |  |

---

### 5. API Endpoints

## 🔐 Authentication & Authorization

| Method | Path | Description |
| --- | --- | --- |
| POST | /api/v1/auth/register | Create a new user account |
| POST | /api/v1/auth/login | Authenticate and issue JWT |
| POST | /api/v1/auth/logout | Invalidate current JWT |
| GET | /api/v1/auth/me | Fetch current user profile |
| POST | /api/v1/auth/refresh | Refresh access token |
| GET | /api/v1/auth/permissions | List permissions for current user |

---

## 📦 Accounting Module

### Master Data

| Method | Path | Description |
| --- | --- | --- |
| GET | /api/v1/accounts | List all accounts |
| POST | /api/v1/accounts | Create a new account |
| PUT | /api/v1/accounts/:id | Update account details |
| POST | /api/v1/accounts/:id/archive | Archive (soft-delete) an account |
| POST | /api/v1/accounts/bulk-upload | Bulk upload accounts via CSV |
| GET | /api/v1/cost-centers | List cost centers |
| POST | /api/v1/cost-centers | Create a new cost center |
| PUT | /api/v1/cost-centers/:id | Update cost center |
| POST | /api/v1/cost-centers/:id/archive | Archive a cost center |
| GET | /api/v1/templates | List recurring templates |
| POST | /api/v1/templates | Create a new template |
| PUT | /api/v1/templates/:id | Update template |
| DELETE | /api/v1/templates/:id | Delete template |
| POST | /api/v1/templates/:id/enable | Enable a template |
| POST | /api/v1/templates/:id/disable | Disable a template |

### Transactions

| Method | Path | Description |
| --- | --- | --- |
| POST | /api/v1/journal-entries | Create journal entry |
| GET | /api/v1/journal-entries | List journal entries (filterable) |
| GET | /api/v1/journal-entries/:id | Retrieve single entry |
| PUT | /api/v1/journal-entries/:id | Update journal entry |
| DELETE | /api/v1/journal-entries/:id | Delete journal entry |
| POST | /api/v1/journal-entries/:id/post | Post entry |
| POST | /api/v1/journal-entries/:id/unpost | Unpost entry |
| POST | /api/v1/journal-entries/:id/submit-for-approval | Submit for approval |
| POST | /api/v1/journal-entries/:id/approve | Approve entry |
| POST | /api/v1/journal-entries/:id/reject | Reject entry |
| GET | /api/v1/cash-book | View cash book |
| POST | /api/v1/cash-book/manual | Record manual cash receipt/payment |
| GET | /api/v1/bank-book | View bank book |
| POST | /api/v1/bank-book/import-statement | Import bank statement (CSV/OFX) |
| POST | /api/v1/bank-book/:id/reconcile | Auto-reconcile a transaction |
| POST | /api/v1/bank-book/manual-adjustment | Record manual adjustment |
| GET | /api/v1/purchase-book | View purchase book |
| POST | /api/v1/purchase-book | Record supplier invoice |
| GET | /api/v1/sales-book | View sales book |
| POST | /api/v1/sales-book | Record customer invoice |

### Reporting

| Method | Path | Description |
| --- | --- | --- |
| GET | /api/v1/reports/trial-balance?from=YYYY-MM-DD&to=YYYY-MM-DD | Generate trial balance |
| GET | /api/v1/reports/balance-sheet?asOf=YYYY-MM-DD | Generate balance sheet |
| GET | /api/v1/reports/profit-loss?from=YYYY-MM-DD&to=YYYY-MM-DD | Generate P&L statement |
| GET | /api/v1/reports/:type/export?format=pdf|excel | Export any report |
| POST | /api/v1/reports/schedule | Schedule recurring report delivery |

### Administration

| Method | Path | Description |
| --- | --- | --- |
| GET | /api/v1/tenants/:tenantId/settings | Get tenant settings |
| PUT | /api/v1/tenants/:tenantId/settings | Update tenant settings |
| GET | /api/v1/users | List users |
| GET | /api/v1/users/:id | Get user details |
| POST | /api/v1/users | Invite/create user |
| PUT | /api/v1/users/:id | Update user |
| DELETE | /api/v1/users/:id | Deactivate user |
| GET | /api/v1/roles | List roles |
| GET | /api/v1/roles/:id | Get role |
| POST | /api/v1/roles | Create role |
| PUT | /api/v1/roles/:id | Update role |
| DELETE | /api/v1/roles/:id | Delete role |
| POST | /api/v1/roles/:id/assign-users | Assign users to a role |

---

## 📋 CA & GST Module

### 1. Purpose & Objectives

- **Purpose**: Automate Indian GST compliance and e-invoicing workflows.
- **Objectives**:
    - Manage GSTIN profiles, HSN/SAC codes, tax‐rate configs.
    - Create and validate sales/purchase invoices with E-Invoice/E-Way-Bill.
    - Prepare, file, and track GSTR-1, GSTR-3B, other returns.
    - Reconcile ITC and compute liabilities.

### 2. Scope

- **Master Data**: GST Registrations, HSN/SAC Codes, Tax Rates
- **Invoice Management**: Sales & Purchase Invoices, Credit/Debit Notes
- **Return Filing**: GSTR-1, GSTR-3B, GSTR-4/9, JSON export for IRP
- **E-Invoice & E-Way Bill**
- **ITC Reconciliation**: Import 2A/2B, mismatch resolution, utilization
- **Payments & Liabilities**: Liability computation, challan generation
- **Reporting & Analytics**
- **Administration**: Module-level RBAC, portal credentials

### 3. Detailed Architecture Overview

- **Shared Services**: GSTN‐sync service, OCR/PDF extractor service
- **Webhook Integration**: IRP callbacks, E-Way bill status updates
- **Scheduler**: CRON jobs for automated return‐due reminders
- **RBAC & Multi-Tenant**: Enforced via middleware

### 4. Data Model (Core Entities)

### 4.1 GST Registrations

**Collection**: `gstRegistrations`

| Field | Type | Description | Index |
| --- | --- | --- | --- |
| `_id` | ObjectId | Unique identifier |  |
| `tenantId` | ObjectId | Tenant isolation | **tenantId + gstin (unique)** |
| `gstin` | String | GSTIN number |  |
| `branchName` | String | Branch or location name |  |
| `address` | String | Registered address |  |
| `status` | String | “Active” or “Inactive” |  |
| `createdAt` | ISODate | Record creation timestamp | **createdAt** |
| `updatedAt` | ISODate | Record update timestamp | **updatedAt** |

### 4.2 HSN / SAC Codes

**Collection**: `hsnCodes`

| Field | Type | Description | Index |
| --- | --- | --- | --- |
| `_id` | ObjectId | Unique identifier |  |
| `tenantId` | ObjectId | Tenant isolation | **tenantId + code (unique)** |
| `code` | String | HSN or SAC code |  |
| `description` | String | Item description |  |
| `taxRate` | Number | Applicable tax rate (%) |  |
| `createdAt` | ISODate | Record creation timestamp | **createdAt** |
| `updatedAt` | ISODate | Record update timestamp | **updatedAt** |

### 4.3 Tax Rates

**Collection**: `taxRates`

| Field | Type | Description | Index |
| --- | --- | --- | --- |
| `_id` | ObjectId | Unique identifier |  |
| `tenantId` | ObjectId | Tenant isolation | **tenantId** |
| `type` | String | One of Standard|Reduced|Exempt|Nil |  |
| `ratePercent` | Number | Main rate (%) |  |
| `surcharge` | Number | Surcharge rate (%) |  |
| `cess` | Number | Cess rate (%) |  |
| `createdAt` | ISODate | Record creation timestamp | **createdAt** |
| `updatedAt` | ISODate | Record update timestamp | **updatedAt** |

### 4.4 Sales Invoices

**Collection**: `salesInvoices`

| Field | Type | Description | Index |
| --- | --- | --- | --- |
| `_id` | ObjectId | Unique identifier |  |
| `tenantId` | ObjectId | Tenant isolation | **tenantId + invoiceNo (unique)** |
| `invoiceNo` | String | Invoice number |  |
| `date` | Date | Invoice date | **tenantId + date** |
| `customerGSTIN` | String | Customer’s GSTIN |  |
| `lineItems` | Array | Sub-docs: `{ description, quantity, rate, amount, hsnCode, taxRate }` |  |
| `totalAmount` | Number | Sum of line amounts |  |
| `eInvoiceIRN` | String | IRN returned by GSTN |  |
| `eInvoiceStatus` | String | “Generated”|“Cancelled” |  |
| `eInvoiceQrCodeUrl` | String | URL to QR code |  |
| `createdAt` | ISODate | Record creation timestamp | **createdAt** |
| `updatedAt` | ISODate | Record update timestamp | **updatedAt** |

### 4.5 Purchase Invoices

**Collection**: `purchaseInvoices`

| Field | Type | Description | Index |
| --- | --- | --- | --- |
| `_id` | ObjectId | Unique identifier |  |
| `tenantId` | ObjectId | Tenant isolation | **tenantId + invoiceNo (unique)** |
| `invoiceNo` | String | Supplier invoice number |  |
| `date` | Date | Invoice date | **tenantId + date** |
| `supplierGSTIN` | String | Supplier’s GSTIN |  |
| `ocrData` | String | Raw OCR/extracted JSON |  |
| `lineItems` | Array | Sub-docs: same structure as sales lineItems |  |
| `totalAmount` | Number | Sum of line amounts |  |
| `flagIneligibleITC` | Boolean | True if ITC is ineligible |  |
| `createdAt` | ISODate | Record creation timestamp | **createdAt** |
| `updatedAt` | ISODate | Record update timestamp | **updatedAt** |

### 4.6 GSTR-1 Returns

**Collection**: `gstr1Returns`

| Field | Type | Description | Index |
| --- | --- | --- | --- |
| `_id` | ObjectId | Unique identifier |  |
| `tenantId` | ObjectId | Tenant isolation | **tenantId + period** |
| `period` | String | Return period (e.g. “2025-07”) |  |
| `b2bSummary` | Array | Sub-docs: `{ gstin, invoiceCount, taxableValue, taxAmount }` |  |
| `b2cSummary` | Array | Sub-docs: `{ invoiceType, invoiceCount, taxableValue, taxAmount }` |  |
| `errors` | Array | Validation errors |  |
| `createdAt` | ISODate | Record creation timestamp | **createdAt** |
| `updatedAt` | ISODate | Record update timestamp | **updatedAt** |

### 4.7 GSTR-3B Returns

**Collection**: `gstr3bReturns`

| Field | Type | Description | Index |
| --- | --- | --- | --- |
| `_id` | ObjectId | Unique identifier |  |
| `tenantId` | ObjectId | Tenant isolation | **tenantId + period** |
| `period` | String | Return period (e.g. “2025-07”) |  |
| `autoPopulated` | Object | `{ outwardSupplies, inwardSupplies }` |  |
| `adjustments` | Object | `{ lateFees, interest }` |  |
| `ackNo` | String | Acknowledgement number |  |
| `filedAt` | Date | Filing timestamp |  |
| `createdAt` | ISODate | Record creation timestamp | **createdAt** |
| `updatedAt` | ISODate | Record update timestamp | **updatedAt** |

### 4.8 E-Invoices

**Collection**: `eInvoices`

| Field | Type | Description | Index |
| --- | --- | --- | --- |
| `_id` | ObjectId | Unique identifier |  |
| `tenantId` | ObjectId | Tenant isolation | **tenantId + irn (unique)** |
| `irn` | String | Invoice Reference Number |  |
| `qrCodeUrl` | String | URL to QR code image |  |
| `status` | String | “Generated”|“Cancelled” |  |
| `generatedAt` | Date | IRN generation timestamp |  |
| `cancelledAt` | Date | IRN cancellation timestamp |  |
| `createdAt` | ISODate | Record creation timestamp | **createdAt** |
| `updatedAt` | ISODate | Record update timestamp | **updatedAt** |

### 4.9 E-Way Bills

**Collection**: `eWayBills`

| Field | Type | Description | Index |
| --- | --- | --- | --- |
| `_id` | ObjectId | Unique identifier |  |
| `tenantId` | ObjectId | Tenant isolation | **tenantId + billNo (unique)** |
| `billNo` | String | E-Way Bill number |  |
| `validityFrom` | Date | Start of validity |  |
| `validityTo` | Date | End of validity |  |
| `consignment` | Object | `{ vehicleNo, fromAddress, toAddress }` |  |
| `status` | String | “Active”|“Cancelled” |  |
| `cancelledAt` | Date | Cancellation timestamp |  |
| `createdAt` | ISODate | Record creation timestamp | **createdAt** |
| `updatedAt` | ISODate | Record update timestamp | **updatedAt** |

### 4.10 ITC Records

**Collection**: `itcRecords`

| Field | Type | Description | Index |
| --- | --- | --- | --- |
| `_id` | ObjectId | Unique identifier |  |
| `tenantId` | ObjectId | Tenant isolation | **tenantId** |
| `sourceInvoiceId` | ObjectId | References `purchaseInvoices._id` |  |
| `matchedInvoiceId` | ObjectId | References `purchaseInvoices._id` (nullable) |  |
| `status` | String | “Matched”|“Unmatched” | **tenantId + status** |
| `mismatchReason` | String | Reason for mismatch |  |
| `createdAt` | ISODate | Record creation timestamp | **createdAt** |
| `updatedAt` | ISODate | Record update timestamp | **updatedAt** |

### 4.11 Challans

**Collection**: `challans`

| Field | Type | Description | Index |
| --- | --- | --- | --- |
| `_id` | ObjectId | Unique identifier |  |
| `tenantId` | ObjectId | Tenant isolation | **tenantId + challanNo (unique)** |
| `challanNo` | String | Challan number (PMT-06) |  |
| `period` | String | Liability period (e.g. “2025-07”) |  |
| `amount` | Number | Tax amount to be paid |  |
| `paymentDate` | Date | Date of payment |  |
| `status` | String | “Created”|“Paid”|“Failed” |  |
| `createdAt` | ISODate | Record creation timestamp | **createdAt** |
| `updatedAt` | ISODate | Record update timestamp | **updatedAt** |

### 5. API Endpoints

### Master Data

| Method | Path | Description |
| --- | --- | --- |
| GET | /api/v1/gst/registrations | List GSTIN profiles |
| GET | /api/v1/gst/registrations/:id | Get single GSTIN |
| POST | /api/v1/gst/registrations | Add GSTIN profile |
| PUT | /api/v1/gst/registrations/:id | Update GSTIN profile |
| DELETE | /api/v1/gst/registrations/:id | Archive GSTIN profile |
| GET | /api/v1/gst/hsn-codes | List HSN/SAC codes |
| GET | /api/v1/gst/hsn-codes/:id | Get single code |
| POST | /api/v1/gst/hsn-codes | Add HSN/SAC code |
| PUT | /api/v1/gst/hsn-codes/:id | Update code |
| DELETE | /api/v1/gst/hsn-codes/:id | Delete code |
| GET | /api/v1/gst/tax-rates | List tax rates |
| GET | /api/v1/gst/tax-rates/:id | Get single rate |
| POST | /api/v1/gst/tax-rates | Create tax rate |
| PUT | /api/v1/gst/tax-rates/:id | Update tax rate |
| DELETE | /api/v1/gst/tax-rates/:id | Delete tax rate |

### Invoice Management

| Method | Path | Description |
| --- | --- | --- |
| GET | /api/v1/invoices/sales | List sales invoices |
| GET | /api/v1/invoices/sales/:id | Get sales invoice |
| POST | /api/v1/invoices/sales | Create sales invoice |
| PUT | /api/v1/invoices/sales/:id | Update sales invoice |
| DELETE | /api/v1/invoices/sales/:id | Delete sales invoice |
| POST | /api/v1/invoices/sales/:id/credit-note | Generate credit note |
| POST | /api/v1/invoices/sales/:id/e-invoice | Generate IRN & QR code |
| GET | /api/v1/invoices/sales/:id/e-invoice/status | Check E-Invoice status |
| POST | /api/v1/invoices/sales/:id/e-invoice/cancel | Cancel E-Invoice |
| GET | /api/v1/invoices/purchase | List purchase invoices |
| GET | /api/v1/invoices/purchase/:id | Get purchase invoice |
| POST | /api/v1/invoices/purchase/upload | Upload/OCR-extract supplier invoice |
| PUT | /api/v1/invoices/purchase/:id | Update purchase invoice |
| DELETE | /api/v1/invoices/purchase/:id | Delete purchase invoice |
| POST | /api/v1/invoices/purchase/:id/flag-ineligible-itc | Flag ineligible ITC |

### Return Filing

| Method | Path | Description |
| --- | --- | --- |
| GET | /api/v1/returns/gstr1?period=YYYY-MM | Draft GSTR-1 summary |
| POST | /api/v1/returns/gstr1/validate | Validate GSTR-1 |
| POST | /api/v1/returns/gstr1/export-json | Export JSON for IRP |
| POST | /api/v1/returns/gstr1/file | File GSTR-1 |
| GET | /api/v1/returns/gstr3b?period=YYYY-MM | Draft GSTR-3B |
| POST | /api/v1/returns/gstr3b/file | File GSTR-3B |
| GET | /api/v1/returns/gstr4?period=YYYY-YY | Draft GSTR-4 |
| POST | /api/v1/returns/gstr4/file | File GSTR-4 |
| GET | /api/v1/returns/gstr9?year=YYYY | Draft GSTR-9 / 9C |
| POST | /api/v1/returns/gstr9/file | File GSTR-9 / 9C |

### E-Invoice & E-Way Bill

| Method | Path | Description |
| --- | --- | --- |
| POST | /api/v1/einvoice/generate | Generate IRN & QR code |
| GET | /api/v1/einvoice/:irn/status | Check IRP acknowledgement |
| POST | /api/v1/einvoice/:irn/cancel | Cancel E-Invoice |
| POST | /api/v1/ewaybill/create | Create E-Way Bill |
| GET | /api/v1/ewaybill/:billNo/status | Track validity/status |
| POST | /api/v1/ewaybill/:billNo/cancel | Cancel E-Way Bill |

### ITC Reconciliation

| Method | Path | Description |
| --- | --- | --- |
| POST | /api/v1/itc/import-2a | Import GSTR-2A data |
| POST | /api/v1/itc/import-2b | Import GSTR-2B data |
| GET | /api/v1/itc/records | List all ITC records |
| GET | /api/v1/itc/mismatches | List unmatched ITC |
| POST | /api/v1/itc/:id/resolve | Resolve an ITC mismatch |

### Payments & Liabilities

| Method | Path | Description |
| --- | --- | --- |
| GET | /api/v1/tax/liability?period=YYYY-MM | Compute tax liability |
| POST | /api/v1/tax/challan | Generate PMT-06 challan |
| GET | /api/v1/tax/challan/:challanNo | View challan status |

### CA Module

| Method | Path | Description |
| --- | --- | --- |
| GET | /api/v1/ca/clients | List clients |
| GET | /api/v1/ca/clients/:id | Get client details |
| POST | /api/v1/ca/clients | Create client |
| PUT | /api/v1/ca/clients/:id | Update client |
| DELETE | /api/v1/ca/clients/:id | Delete client |
| GET | /api/v1/ca/compliance | List compliance tasks |
| GET | /api/v1/ca/compliance/:id | Get compliance task |
| POST | /api/v1/ca/compliance | Create compliance task |
| PUT | /api/v1/ca/compliance/:id | Update compliance task |
| DELETE | /api/v1/ca/compliance/:id | Delete compliance task |
| PATCH | /api/v1/ca/compliance/:id/complete | Mark compliance task as complete |
| GET | /api/v1/ca/tax-filings | List tax filings |
| GET | /api/v1/ca/tax-filings/:id | Get tax filing details |
| POST | /api/v1/ca/tax-filings | Create tax filing |
| PUT | /api/v1/ca/tax-filings/:id | Update tax filing |
| DELETE | /api/v1/ca/tax-filings/:id | Delete tax filing |
| PATCH | /api/v1/ca/tax-filings/:id/complete | Mark tax filing as complete |
| GET | /api/v1/ca/audits | List audits |
| GET | /api/v1/ca/audits/:id | Get audit details |
| POST | /api/v1/ca/audits | Create audit |
| PUT | /api/v1/ca/audits/:id | Update audit |
| DELETE | /api/v1/ca/audits/:id | Delete audit |
| POST | /api/v1/ca/audits/:id/findings | Add audit finding |
| PUT | /api/v1/ca/audits/:id/findings/:findingId | Update audit finding |
| DELETE | /api/v1/ca/audits/:id/findings/:findingId | Delete audit finding |
| PATCH | /api/v1/ca/audits/:id/complete | Complete audit |
| POST | /api/v1/tax/challan/:challanNo/refund | Process refund/reversal |

### Reports & Analytics

| Method | Path | Description |
| --- | --- | --- |
| GET | /api/v1/reports/gst/summary?period=YYYY-MM | Monthly liability vs. payments |
| GET | /api/v1/reports/gst/itc-by-supplier | ITC dashboard by supplier |
| GET | /api/v1/reports/gst/exceptions?type=[missing | late] |
| GET | /api/v1/reports/gst/audit-trail?from=…&to=… | Full audit log |

### Administration

| Method | Path | Description |
| --- | --- | --- |
| GET | /api/v1/gst/users | List module users |
| POST | /api/v1/gst/users | Invite/create user |
| PUT | /api/v1/gst/users/:id | Update user |
| DELETE | /api/v1/gst/users/:id | Deactivate user |
| GET | /api/v1/gst/filing-settings | Get default filing frequencies/settings |
| PUT | /api/v1/gst/filing-settings | Update filing settings |
| GET | /api/v1/integrations/gstn-credentials | Get GSTN portal credentials |
| PUT | /api/v1/integrations/gstn-credentials | Update GSTN portal credentials |

---

## 📈 CFO Module

### 1. Purpose & Objectives

- **Purpose**: Empower finance leaders with strategic planning, forecasting, and risk-management tools.
- **Objectives**:
    - Deliver executive dashboards (EBITDA, cash‐flow, variances).
    - Streamline budgeting, rolling forecasts, variance analysis.
    - Support scenario planning, what-if simulations, Monte Carlo analysis.
    - Manage treasury operations, FX exposure, and capital markets workflows.
    - Provide tax planning, intercompany modeling, and audit‐ready controls.

### 2. Scope

- **Dashboard**: Key metrics, alerts, quick actions
- **Strategic Planning**: Roadmaps, capital allocation, investment scoring
- **Budgeting & Forecasting**: Annual budgets, rolling forecasts, variance analysis
- **Cash Flow & Treasury**: Positioning, forecasting, bank connectivity
- **Modeling & Scenario Analysis**: DCF, LBO, sensitivity, Monte Carlo
- **Performance Management**: KPI library, board reports, narrative generation
- **Risk & Compliance**: Risk register, SOX controls, regulatory calendar
- **Capital Markets & IR**: Fundraising pipeline, cap-table, investor comms
- **Tax Planning**: Entity modeling, effective tax rate, provision schedules
- **Integration & Admin**: ERP/BI connectors, SSO, feature flags

### 3. Detailed Architecture Overview

- **Modular Services**: Separate Express routers per domain (forecast, treasury, risk…)
- **Analytics Engine**: Aggregation pipelines in Mongo + optional BI sync
- **LLM Integration**: Narrative/commentary generator via prompt‐enhancer webhook
- **Simulation Engine**: Batch jobs for Monte Carlo, sensitivity runs
- **SSO/Auth**: SAML/OAuth2 broker + JWT for APIs

### 4. Data Model (Core Entities)

### 4.1 Dashboard Metrics

**Collection**: `dashboardMetrics`

| Field | Type | Description | Index |
| --- | --- | --- | --- |
| `_id` | ObjectId | Unique identifier |  |
| `tenantId` | ObjectId | Tenant isolation | **tenantId + type + asOf** |
| `type` | String | Metric type (e.g. “EBITDA”, “FreeCashFlow”) |  |
| `value` | Number | Metric value |  |
| `asOf` | Date | Date of the metric |  |
| `createdAt` | ISODate | Record creation timestamp | **createdAt** |
| `updatedAt` | ISODate | Record update timestamp | **updatedAt** |

### 4.2 Roadmaps

**Collection**: `roadmaps`

| Field | Type | Description | Index |
| --- | --- | --- | --- |
| `_id` | ObjectId | Unique identifier |  |
| `tenantId` | ObjectId | Tenant isolation | **tenantId** |
| `name` | String | Roadmap name |  |
| `horizonYears` | Number | Planning horizon in years (e.g. 3, 5) |  |
| `createdAt` | ISODate | Record creation timestamp | **createdAt** |
| `updatedAt` | ISODate | Record update timestamp | **updatedAt** |

### 4.3 Scenarios

**Collection**: `scenarios`

| Field | Type | Description | Index |
| --- | --- | --- | --- |
| `_id` | ObjectId | Unique identifier |  |
| `tenantId` | ObjectId | Tenant isolation | **tenantId + roadmapId** |
| `roadmapId` | ObjectId | References `roadmaps._id` |  |
| `type` | String | Base/Upside/Downside |  |
| `assumptions` | Mixed JSON | Input assumptions for scenario |  |
| `results` | Mixed JSON | Computed results (e.g. financial projections) |  |
| `createdAt` | ISODate | Record creation timestamp | **createdAt** |
| `updatedAt` | ISODate | Record update timestamp | **updatedAt** |

### 4.4 Budgets

**Collection**: `budgets`

| Field | Type | Description | Index |
| --- | --- | --- | --- |
| `_id` | ObjectId | Unique identifier |  |
| `tenantId` | ObjectId | Tenant isolation | **tenantId + period + version** |
| `department` | String | Department name |  |
| `period` | String | Budget year (e.g. “2025”) |  |
| `lineItems` | Array | Sub-docs: `{ accountId, amount }` |  |
| `version` | Number | Version number |  |
| `createdBy` | ObjectId | References `users._id` |  |
| `createdAt` | ISODate | Record creation timestamp | **createdAt** |
| `updatedAt` | ISODate | Record update timestamp | **updatedAt** |

### 4.5 Forecasts

**Collection**: `forecasts`

| Field | Type | Description | Index |
| --- | --- | --- | --- |
| `_id` | ObjectId | Unique identifier |  |
| `tenantId` | ObjectId | Tenant isolation | **tenantId + period + version** |
| `driverInputs` | Mixed JSON | Key drivers for forecast (volume, price, etc.) |  |
| `actualsLink` | Mixed JSON | Reference to actuals data |  |
| `period` | String | Forecast period (e.g. “2025-Q3”) |  |
| `version` | Number | Version number |  |
| `createdAt` | ISODate | Record creation timestamp | **createdAt** |
| `updatedAt` | ISODate | Record update timestamp | **updatedAt** |

### 4.6 Cash Flow Models

**Collection**: `cashFlowModels`

| Field | Type | Description | Index |
| --- | --- | --- | --- |
| `_id` | ObjectId | Unique identifier |  |
| `tenantId` | ObjectId | Tenant isolation | **tenantId + timeFrameDays** |
| `timeFrameDays` | Number | Number of days (e.g. 30, 60, 90) |  |
| `inflows` | Array | `{ source, amount, date }` |  |
| `outflows` | Array | `{ category, amount, date }` |  |
| `balances` | Array | `{ date, balance }` |  |
| `createdAt` | ISODate | Record creation timestamp | **createdAt** |
| `updatedAt` | ISODate | Record update timestamp | **updatedAt** |

### 4.7 KPIs

**Collection**: `kpis`

| Field | Type | Description | Index |
| --- | --- | --- | --- |
| `_id` | ObjectId | Unique identifier |  |
| `tenantId` | ObjectId | Tenant isolation | **tenantId + period + name** |
| `name` | String | KPI name (e.g. “ROIC”) |  |
| `value` | Number | Current value |  |
| `target` | Number | Target value |  |
| `period` | String | Measurement period (e.g. “2025-Q2”) |  |
| `createdAt` | ISODate | Record creation timestamp | **createdAt** |
| `updatedAt` | ISODate | Record update timestamp | **updatedAt** |

### 4.8 Risk Items

**Collection**: `riskItems`

| Field | Type | Description | Index |
| --- | --- | --- | --- |
| `_id` | ObjectId | Unique identifier |  |
| `tenantId` | ObjectId | Tenant isolation | **tenantId + status** |
| `description` | String | Risk description |  |
| `score` | Number | Risk score (e.g. 1–10) |  |
| `mitigationPlan` | String | Planned mitigation actions |  |
| `status` | String | Open/Mitigating/Closed |  |
| `createdAt` | ISODate | Record creation timestamp | **createdAt** |
| `updatedAt` | ISODate | Record update timestamp | **updatedAt** |

### 4.9 Controls

**Collection**: `controls`

| Field | Type | Description | Index |
| --- | --- | --- | --- |
| `_id` | ObjectId | Unique identifier |  |
| `tenantId` | ObjectId | Tenant isolation | **tenantId + name** |
| `name` | String | Control name (e.g. “SOX Test A”) |  |
| `type` | String | Process/IT/Financial |  |
| `testingSchedule` | Object | `{ frequency, nextTestDate }` |  |
| `status` | String | e.g. “Active”, “Exception” |  |
| `createdAt` | ISODate | Record creation timestamp | **createdAt** |
| `updatedAt` | ISODate | Record update timestamp | **updatedAt** |

### 4.10 Fundraising Items

**Collection**: `fundraisingItems`

| Field | Type | Description | Index |
| --- | --- | --- | --- |
| `_id` | ObjectId | Unique identifier |  |
| `tenantId` | ObjectId | Tenant isolation | **tenantId + investor + stage** |
| `investor` | String | Investor name or ID |  |
| `stage` | String | Funding stage (e.g. “Seed”, “Series A”) |  |
| `amount` | Number | Amount sought/closed |  |
| `expectedCloseDate` | Date | Anticipated close date |  |
| `status` | String | e.g. “Open”, “Committed”, “Closed” |  |
| `createdAt` | ISODate | Record creation timestamp | **createdAt** |
| `updatedAt` | ISODate | Record update timestamp | **updatedAt** |

### 4.11 Cap Table Entries

**Collection**: `capTableEntries`

| Field | Type | Description | Index |
| --- | --- | --- | --- |
| `_id` | ObjectId | Unique identifier |  |
| `tenantId` | ObjectId | Tenant isolation | **tenantId + entity + shareClass** |
| `entity` | String | Owner (e.g. “Founder”, “Employee”, “Investor”) |  |
| `shares` | Number | Number of shares |  |
| `ownershipPct` | Number | Percentage ownership |  |
| `shareClass` | String | Class (e.g. “Common”, “Preferred”) |  |
| `createdAt` | ISODate | Record creation timestamp | **createdAt** |
| `updatedAt` | ISODate | Record update timestamp | **updatedAt** |

### 4.12 Tax Provisions

**Collection**: `taxProvisions`

| Field | Type | Description | Index |
| --- | --- | --- | --- |
| `_id` | ObjectId | Unique identifier |  |
| `tenantId` | ObjectId | Tenant isolation | **tenantId + period + entity** |
| `entity` | String | Entity name (e.g. “HoldingCo”, “OpCo”) |  |
| `period` | String | Period (e.g. “2025-Q2”) |  |
| `amount` | Number | Provision amount |  |
| `workpapers` | [String] | URLs to supporting workpapers |  |
| `createdAt` | ISODate | Record creation timestamp | **createdAt** |
| `updatedAt` | ISODate | Record update timestamp | **updatedAt** |

### 5. API Endpoints

### Dashboard & Quick Actions

| Method | Path | Description |
| --- | --- | --- |
| GET | /api/v1/cfo/metrics?types[]=&asOf=YYYY-MM-DD | Fetch executive metrics |
| POST | /api/v1/cfo/alerts/acknowledge | Acknowledge an alert |
| POST | /api/v1/cfo/actions/run-cashflow-forecast | Trigger cash-flow forecast |
| POST | /api/v1/cfo/actions/generate-board-deck | Generate investor board deck |
| POST | /api/v1/cfo/actions/launch-what-if | Launch a what-if scenario |

### Strategic Planning

| Method | Path | Description |
| --- | --- | --- |
| GET | /api/v1/cfo/roadmaps | List all financial roadmaps |
| POST | /api/v1/cfo/roadmaps | Create roadmap |
| GET | /api/v1/cfo/roadmaps/:id | Get roadmap details |
| PUT | /api/v1/cfo/roadmaps/:id | Update roadmap |
| DELETE | /api/v1/cfo/roadmaps/:id | Delete roadmap |
| GET | /api/v1/cfo/roadmaps/:roadmapId/scenarios | List scenarios |
| POST | /api/v1/cfo/roadmaps/:roadmapId/scenarios | Add scenario to roadmap |
| PUT | /api/v1/cfo/roadmaps/:roadmapId/scenarios/:id | Update scenario |
| DELETE | /api/v1/cfo/roadmaps/:roadmapId/scenarios/:id | Delete scenario |

### Budgeting & Forecasting

| Method | Path | Description |
| --- | --- | --- |
| GET | /api/v1/cfo/budgets?year=YYYY | List budgets for year |
| POST | /api/v1/cfo/budgets | Create budget |
| GET | /api/v1/cfo/budgets/:id | Get budget |
| PUT | /api/v1/cfo/budgets/:id | Update budget |
| DELETE | /api/v1/cfo/budgets/:id | Delete budget |
| GET | /api/v1/cfo/forecasts?period=YYYY-MM | List forecasts |
| POST | /api/v1/cfo/forecasts | Create forecast |
| GET | /api/v1/cfo/forecasts/:id | Get forecast |
| PUT | /api/v1/cfo/forecasts/:id | Update forecast |
| DELETE | /api/v1/cfo/forecasts/:id | Delete forecast |

### Cash Flow & Treasury

| Method | Path | Description |
| --- | --- | --- |
| GET | /api/v1/cfo/cashflow?timeFrame=30|60|90 | Fetch short-term cash-flow model |
| GET | /api/v1/cfo/cashflow/:id | Get model details |
| POST | /api/v1/cfo/treasury/bank-connections | Add bank connection |
| GET | /api/v1/cfo/treasury/bank-connections/:id | Get bank connection |
| PUT | /api/v1/cfo/treasury/bank-connections/:id | Update bank connection |
| DELETE | /api/v1/cfo/treasury/bank-connections/:id | Remove bank connection |
| POST | /api/v1/cfo/treasury/hedge-recommendations | Request FX hedge recommendations |

### Modeling & Scenario Analysis

| Method | Path | Description |
| --- | --- | --- |
| POST | /api/v1/cfo/models/dcf | Run DCF valuation |
| POST | /api/v1/cfo/models/monte-carlo | Run Monte Carlo simulation |
| GET | /api/v1/cfo/models/:modelId/results | Fetch simulation results |

### Performance Management

| Method | Path | Description |
| --- | --- | --- |
| GET | /api/v1/cfo/kpis | List all KPIs |
| POST | /api/v1/cfo/kpis | Create KPI |
| GET | /api/v1/cfo/kpis/:id | Get KPI |
| PUT | /api/v1/cfo/kpis/:id | Update KPI |
| DELETE | /api/v1/cfo/kpis/:id | Delete KPI |
| POST | /api/v1/cfo/reports/board-deck | Generate board deck |
| GET | /api/v1/cfo/reports/board-deck/:id | Fetch board deck |

### Risk & Compliance

| Method | Path | Description |
| --- | --- | --- |
| GET | /api/v1/cfo/risks | List risk items |
| POST | /api/v1/cfo/risks | Create risk item |
| PUT | /api/v1/cfo/risks/:id | Update risk item |
| DELETE | /api/v1/cfo/risks/:id | Delete risk item |
| GET | /api/v1/cfo/controls | List internal controls |
| POST | /api/v1/cfo/controls | Create control |
| PUT | /api/v1/cfo/controls/:id | Update control |
| DELETE | /api/v1/cfo/controls/:id | Delete control |
| GET | /api/v1/cfo/compliance/calendar?from=…&to=… | Regulatory calendar entries |
| POST | /api/v1/cfo/compliance/calendar | Add calendar reminder |

### Capital Markets & IR

| Method | Path | Description |
| --- | --- | --- |
| GET | /api/v1/cfo/fundraising | List fundraising pipeline |
| POST | /api/v1/cfo/fundraising | Add fundraising item |
| GET | /api/v1/cfo/fundraising/:id | Get pipeline item |
| PUT | /api/v1/cfo/fundraising/:id | Update pipeline item |
| DELETE | /api/v1/cfo/fundraising/:id | Remove pipeline item |
| GET | /api/v1/cfo/captable | View cap-table |
| POST | /api/v1/cfo/captable | Add cap-table entry |
| PUT | /api/v1/cfo/captable/:id | Update cap-table entry |
| DELETE | /api/v1/cfo/captable/:id | Delete cap-table entry |
| POST | /api/v1/cfo/ir/earnings-release | Generate earnings release |
| GET | /api/v1/cfo/ir/earnings-release/:id | Fetch earnings release |
| POST | /api/v1/cfo/ir/qna | Submit shareholder Q&A |

### Tax Planning & Optimization

| Method | Path | Description |
| --- | --- | --- |
| GET | /api/v1/cfo/tax-provisions?period=YYYY-MM | List tax provisions |
| GET | /api/v1/cfo/tax-provisions/:id | Get single provision |
| POST | /api/v1/cfo/tax-provisions | Create tax provision |
| PUT | /api/v1/cfo/tax-provisions/:id | Update tax provision |
| DELETE | /api/v1/cfo/tax-provisions/:id | Delete tax provision |

### Integrations & Feature Flags

| Method | Path | Description |
| --- | --- | --- |
| GET | /api/v1/integrations/connectors | List all external connectors |
| GET | /api/v1/integrations/connectors/:id | Get connector details |
| POST | /api/v1/integrations/connectors | Activate new connector |
| PUT | /api/v1/integrations/connectors/:id | Update connector settings |
| DELETE | /api/v1/integrations/connectors/:id | Remove connector |
| GET | /api/v1/system/feature-flags | List feature flags |
| PUT | /api/v1/system/feature-flags | Update feature-flag state |

---

This PRD lays out **all core features**, data models, and RESTful endpoints for your three Phase 1 modules—ensuring a scalable, maintainable ME*N-stack backend ready for multi-tenant, role-based operations.

---

## 📋 CA Module Data Models

### CA Clients

**Collection**: `clients`

| Field | Type | Description | Index |
| --- | --- | --- | --- |
| `_id` | ObjectId | Unique identifier |  |
| `tenantId` | ObjectId | Tenant isolation | **tenantId + pan (unique)** |
| `name` | String | Client name |  |
| `pan` | String | PAN number |  |
| `gstin` | String | GSTIN number (optional) |  |
| `clientType` | String | Individual/Company/Partnership/LLP/HUF/Trust/AOP/Other |  |
| `contactPerson` | String | Primary contact person |  |
| `email` | String | Contact email |  |
| `phone` | String | Contact phone |  |
| `address` | String | Registered address |  |
| `city` | String | City |  |
| `state` | String | State |  |
| `pincode` | String | PIN code |  |
| `status` | String | Active/Inactive |  |
| `dateOfBirth` | Date | Date of birth (for individuals) |  |
| `dateOfIncorporation` | Date | Date of incorporation (for entities) |  |
| `financialYearEnd` | String | Financial year end date (e.g. "31-03") |  |
| `assessmentYearEnd` | String | Assessment year end |  |
| `notes` | String | Additional notes |  |
| `assignedTo` | ObjectId | References `users._id` |  |
| `createdAt` | ISODate | Record creation timestamp | **createdAt** |
| `updatedAt` | ISODate | Record update timestamp | **updatedAt** |

### CA Compliance Tasks

**Collection**: `compliance`

| Field | Type | Description | Index |
| --- | --- | --- | --- |
| `_id` | ObjectId | Unique identifier |  |
| `tenantId` | ObjectId | Tenant isolation | **tenantId** |
| `clientId` | ObjectId | References `clients._id` | **clientId** |
| `taskName` | String | Task name |  |
| `description` | String | Task description |  |
| `category` | String | Income Tax/GST/Company Law/ROC/Audit/Other |  |
| `dueDate` | Date | Due date | **dueDate** |
| `priority` | String | Low/Medium/High/Urgent |  |
| `status` | String | Pending/In Progress/Completed/Delayed/Cancelled |  |
| `assignedTo` | ObjectId | References `users._id` |  |
| `completedDate` | Date | Date of completion |  |
| `completedBy` | ObjectId | References `users._id` |  |
| `reminderDate` | Date | Reminder date |  |
| `recurrence` | String | None/Daily/Weekly/Monthly/Quarterly/Half-Yearly/Yearly |  |
| `attachments` | Array | Sub-docs: `{ fileName, fileUrl, uploadedBy, uploadedAt }` |  |
| `notes` | Array | Sub-docs: `{ text, addedBy, addedAt }` |  |
| `fiscalYear` | String | Fiscal year (e.g. "2023-24") |  |
| `assessmentYear` | String | Assessment year |  |
| `createdAt` | ISODate | Record creation timestamp | **createdAt** |
| `updatedAt` | ISODate | Record update timestamp | **updatedAt** |

### CA Tax Filings

**Collection**: `taxFilings`

| Field | Type | Description | Index |
| --- | --- | --- | --- |
| `_id` | ObjectId | Unique identifier |  |
| `tenantId` | ObjectId | Tenant isolation | **tenantId** |
| `clientId` | ObjectId | References `clients._id` | **clientId** |
| `filingType` | String | Income Tax Return/TDS Return/GST Return/ROC Filing/Other |  |
| `subType` | String | Specific return type |  |
| `period` | String | Filing period | **period** |
| `dueDate` | Date | Due date | **dueDate** |
| `extendedDueDate` | Date | Extended due date |  |
| `status` | String | Pending/In Progress/Filed/Verified/Rejected/Cancelled |  |
| `filedDate` | Date | Date of filing |  |
| `filedBy` | ObjectId | References `users._id` |  |
| `acknowledgmentNo` | String | Acknowledgment number |  |
| `acknowledgmentFile` | Object | Sub-doc: `{ fileName, fileUrl, uploadedAt }` |  |
| `taxAmount` | Number | Tax amount |  |
| `refundAmount` | Number | Refund amount |  |
| `paymentDetails` | Array | Sub-docs: `{ paymentMode, paymentDate, amount, referenceNo }` |  |
| `documents` | Array | Sub-docs: `{ documentType, fileName, fileUrl, uploadedBy, uploadedAt }` |  |
| `notes` | Array | Sub-docs: `{ text, addedBy, addedAt }` |  |
| `assignedTo` | ObjectId | References `users._id` |  |
| `fiscalYear` | String | Fiscal year (e.g. "2023-24") |  |
| `assessmentYear` | String | Assessment year |  |
| `createdAt` | ISODate | Record creation timestamp | **createdAt** |
| `updatedAt` | ISODate | Record update timestamp | **updatedAt** |

### CA Audits

**Collection**: `audits`

| Field | Type | Description | Index |
| --- | --- | --- | --- |
| `_id` | ObjectId | Unique identifier |  |
| `tenantId` | ObjectId | Tenant isolation | **tenantId** |
| `clientId` | ObjectId | References `clients._id` | **clientId** |
| `auditName` | String | Audit name |  |
| `auditType` | String | Statutory/Internal/Tax/GST/Stock/Special Purpose/Other |  |
| `fiscalYear` | String | Fiscal year (e.g. "2023-24") |  |
| `startDate` | Date | Start date |  |
| `endDate` | Date | End date |  |
| `status` | String | Planned/In Progress/Under Review/Completed/Cancelled |  |
| `scope` | String | Audit scope |  |
| `objectives` | Array | Audit objectives |  |
| `team` | Array | Sub-docs: `{ userId, role }` |  |
| `findings` | Array | Sub-docs: `{ title, description, severity, recommendation, status, managementResponse, createdAt, updatedAt }` |  |
| `documents` | Array | Sub-docs: `{ documentType, fileName, fileUrl, uploadedBy, uploadedAt }` |  |
| `notes` | Array | Sub-docs: `{ text, addedBy, addedAt }` |  |
| `completedDate` | Date | Date of completion |  |
| `completedBy` | ObjectId | References `users._id` |  |
| `conclusion` | String | Audit conclusion |  |
| `assignedTo` | ObjectId | References `users._id` |  |
| `createdAt` | ISODate | Record creation timestamp | **createdAt** |
| `updatedAt` | ISODate | Record update timestamp | **updatedAt** |