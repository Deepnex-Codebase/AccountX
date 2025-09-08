## 1. Purpose & Background

Your multi-tenant financial SaaS platform combines Accounting, CA/GST compliance, and CFO analytics. The frontend must be modular, performant, and ready to scale as new modules roll out rapidly.

## 2. Objectives

- **Scalability**: Rapid onboarding of new pages/modules.
- **Performance**: <1 s Time to Interactive on core dashboards.
- **Developer DX**: Fast HMR, clear conventions, automated tests.
- **UX Excellence**: Responsive, accessible, polished interfaces.
- **Maintainability**: Logical folder structure, reusable components.

## 3. Technology Stack

- **Framework**: React.jsx (latest) + Vite
- **Styling**: Tailwind CSS with custom theme
- **Language**: JavaScript (ES6+)
- **Routing**: React Router v6
- **State**: Zustand + React Query
- **Forms**: React Hook Form + Zod
- **Testing**: Jest + React Testing Library + Playwright
- **Lint/Format**: ESLint, Prettier, Husky + lint-staged
- **CI/CD**: GitHub Actions → Vercel/Netlify

## 4. Architecture & Folder Structure

Adopt atomic design; all pages under `src/pages`, shared UI under `src/components`.

```
src/
├── assets/           # static images, icons, fonts
├── components/       # atoms, molecules, organisms (JS)
│   ├── atoms/
│   ├── molecules/
│   └── organisms/
├── contexts/         # React Contexts (auth, theme)
├── hooks/            # custom hooks (useAuth.jsx, useFetch.jsx)
├── pages/            # route-driven pages
│   ├── accounting/
│   │   ├── Dashboard.jsx
│   │   ├── MasterData/
│   │   │   ├── ChartOfAccounts.jsx
│   │   │   ├── CostCenters.jsx
│   │   │   └── Templates.jsx
│   │   ├── Transactions/
│   │   │   ├── JournalEntries/
│   │   │   │   ├── CreateEntry.jsx
│   │   │   │   └── EntryList.jsx
│   │   │   ├── CashBook.jsx
│   │   │   ├── BankBook.jsx
│   │   │   ├── PurchaseBook.jsx
│   │   │   └── SalesBook.jsx
│   │   ├── Reporting/
│   │   │   ├── TrialBalance.jsx
│   │   │   ├── BalanceSheet.jsx
│   │   │   └── ProfitAndLoss.jsx
│   │   └── Administration/
│   │       ├── TenantSettings.jsx
│   │       ├── UserManagement.jsx
│   │       └── RolesPermissions.jsx
│   ├── gst/
│   │   ├── Dashboard.jsx
│   │   ├── QuickActions/
│   │   │   ├── CreateSalesInvoice.jsx
│   │   │   └── UploadPurchaseInvoices.jsx
│   │   ├── MasterData/
│   │   │   ├── GstRegistrations.jsx
│   │   │   ├── HsnSacCodes.jsx
│   │   │   └── TaxRateConfig.jsx
│   │   ├── Invoices/
│   │   │   ├── SalesInvoices.jsx
│   │   │   └── PurchaseInvoices.jsx
│   │   ├── Returns/
│   │   │   ├── Gstr1.jsx
│   │   │   ├── Gstr3b.jsx
│   │   │   └── OtherReturns.jsx
│   │   ├── EInvoice/
│   │   │   ├── GenerateIRN.jsx
│   │   │   └── EwayBill.jsx
│   │   ├── Reconciliation/
│   │   │   ├── Itc2a2b.jsx
│   │   │   └── MismatchResolution.jsx
│   │   └── Administration/
│   │       ├── RolesPermissions.jsx
│   │       └── SyncSettings.jsx
│   ├── cfo/
│   │   ├── Dashboard.jsx
│   │   ├── Strategic/
│   │   │   ├── LongTermRoadmap.jsx
│   │   │   └── ScenarioLibrary.jsx
│   │   ├── Budgeting/
│   │   │   ├── AnnualBudget.jsx
│   │   │   └── RollingForecast.jsx
│   │   ├── CashFlow/
│   │   │   ├── CashPosition.jsx
│   │   │   └── TreasuryOperations.jsx
│   │   ├── Modeling/
│   │   │   ├── DCFModel.jsx
│   │   │   └── MonteCarloSimulation.jsx
│   │   ├── Valuation/
│   │   │   ├── ComparableAnalysis.jsx
│   │   │   └── CapTable.jsx
│   │   ├── Performance/
│   │   │   ├── KpiDashboard.jsx
│   │   │   └── Reports.jsx
│   │   ├── Risk/
│   │   │   ├── RiskRegister.jsx
│   │   │   └── SoxControls.jsx
│   │   └── IR/
│   │       ├── FundraisingPipeline.jsx
│   │       └── InvestorRelations.jsx
│   └── shared/
│       ├── Login.jsx
│   └── shared/
│       ├── Login.jsx
│       ├── NotFound.jsx
│       └── Settings.jsx
├── services/         # API clients (axios)
├── styles/           # tailwind.config.jsx, globals.css
├── utils/            # helpers, constants
├── App.jsx            # Application shell + Router
└── main.jsx           # Vite entry
```

## 5. 🎨 AccountX Final Color Palette

| Role               | Name                | HEX       | Usage                            |
| ------------------ | ------------------- | --------- | -------------------------------- |
| **Primary Accent** | Sky Blue            | `#408DFB` | CTA buttons, links, highlights   |
| **Base Dark**      | Deep Navy           | `#21263C` | Header, sidebar text             |
| **Background**     | Light Lavender Mist | `#F7F7FE` | Page backgrounds, light sections |
| **Card Surface**   | White               | `#FFFFFF` | Cards, containers                |
| **Muted Text**     | Cool Gray           | `#6E7280` | Labels, helper text              |
| **Success**        | Fresh Green         | `#30B37C` | Status tags, success messages    |
| **Error**          | Coral Red           | `#F3736C` | Validation errors, alerts        |

## 6. 🧠 Style Guidelines

- **Fonts**: `Figtree`, `Open Sans`
- **Shadows & Corners**:
  - Box shadow: `0 4px 12px rgba(0,0,0,0.06)`
  - Border-radius: `12px`
- **Layout Tips**:
  - Header & sidebar default light (`#F7F7FE`), dark mode activated only after toggle in Settings
  - Buttons & links accent (`#408DFB`)
  - Pages use background `#F7F7FE`; cards on `#FFFFFF`

## 7. Component Library

- **Custom atoms/molecules** only (no external UI libs)
- Use Tailwind utility classes for styling
- Document components in Storybook

## 8. Routing & Navigation (JS Example)

```js
// src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AccountingLayout from './pages/accounting/Layout';
import AccountingDashboard from './pages/accounting/Dashboard';
import Settings from './pages/shared/Settings';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/settings" element={<Settings />} />
        <Route path="/accounting" element={<AccountingLayout />}>  
          <Route index element={<AccountingDashboard />} />
          {/* ...nested routes*/}
        </Route>
        {/* gst and cfo routes similarly */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
export default App;
```

## 9. UI/UX Guidelines

- **Responsive**: mobile-first breakpoints
- **Dark Mode**: only for sidebar & navbar via Settings toggle
- **Accessibility**: WCAG 2.1 AA, ARIA attributes
- **Loading**: skeletons/spinners
- **Errors**: inline messages + retry buttons

## 10. State & Data Fetching

- **Server**: React Query for caching & background sync
- **Client**: Zustand for auth, UI state (sidebar dark)
- **Forms**: React Hook Form + Zod schemas

## 11. Performance & Scalability

- Code-split per route
- Lazy-load heavy components
- Use `loading="lazy"` for images
- Analyze bundle size with `vite-plugin-visualizer`

## 12. Testing Strategy

- **Unit**: Jest & React Testing Library
- **E2E**: Playwright scripts for key flows
- **Coverage**: >80% threshold

## 13. CI/CD & Deployment

- **GitHub Actions**:
  - PR lint & tests
  - Auto-deploy to preview on branch
  - Merge to main → production deploy

## 14. Security & Permissions

- **RBAC**: enforce UI-level (show/hide) and via API
- **Auth**: OAuth/SSO integration
- **CSRF/XSS**: React safe practices

## 15. Page Content & Forms

### 15.1 Accounting Module

- **Dashboard.jsx**

  - KPI Cards: Total Transactions (this month), Pending Approvals
  - Recent Activity Feed: chronological list of journal entries, logins, edits
  - Quick Actions: buttons for Create Journal Entry, Upload Bank Statement, Run Trial Balance

- **MasterData/ChartOfAccounts.jsx**

  - Table: Account Code, Name, Type, Balance
  - Form Fields: Account Code (text), Account Name (text), Account Type (select: Asset/Liability/Equity/Income/Expense), Description (textarea), Parent Account (select)

- **MasterData/CostCenters.jsx**

  - Table: Center Code, Name, Description
  - Form Fields: Cost Center Code (text), Name (text), Description (textarea), Assigned Accounts (multi-select)

- **MasterData/Templates.jsx**

  - Table: Template Name, Frequency, Amount, Active
  - Form Fields: Template Name (text), Frequency (select: Daily/Weekly/Monthly/Yearly), Accounts (multi-select), Amount (number), Active (toggle)

- **Transactions/JournalEntries/CreateEntry.jsx**

  - Form Fields: Date (date picker), Reference No (text), Line Items: [{Account (select), Debit (number), Credit (number), Description (text)}], Attachment (file upload), Submit (button)

- **Transactions/JournalEntries/EntryList.jsx**

  - Table: Ref No, Date, Total Debit, Total Credit, Status, Actions (Edit/Delete/Post)

- **Transactions/CashBook.jsx**

  - Filters: Date Range, Account
  - Table: Date, Description, Debit, Credit, Balance
  - Form: new receipt/payment with Date, Type, Amount, Description

- **Transactions/BankBook.jsx**

  - Import CSV/OFX (file upload)
  - Reconciliation Table: Bank Statement Line vs. Journal Entry match

- **Transactions/PurchaseBook.jsx**

  - Table: Supplier, Invoice No, Date, Amount, GST Rate, ITC Eligible
  - Form Fields: Supplier (select), Invoice No (text), Date (date), Amount (number), GST Rate (select), ITC Eligible (toggle)

- **Transactions/SalesBook.jsx**

  - Table: Customer, Invoice No, Date, Amount, GST Rate, Status
  - Form Fields: Customer (select), Invoice No (text), Date (date), Amount (number), GST Rate (select)

- **Reporting/TrialBalance.jsx**

  - Date Range Picker, Generate Report button, Export options

- **Reporting/BalanceSheet.jsx**

  - Date Selector, Compare Period dropdown, View button

- **Reporting/ProfitAndLoss.jsx**

  - Period Selector (Monthly/Quarterly/Yearly), View Gross vs. Net toggle

- **Administration/TenantSettings.jsx**

  - Form Fields: Company Name, Address, GSTIN, Financial Year Start, Currency, Decimal Precision

- **Administration/UserManagement.jsx**

  - Table: Name, Email, Role, Status, Actions
  - Form Fields (invite): Name, Email, Role (select), Send Invite button

- **Administration/RolesPermissions.jsx**

  - Form: Role Name (text), Permissions Checklist (module toggles)

### 15.2 CA/GST Module

- **Dashboard.jsx**

  - Widgets: Return Due Dates, ITC Utilization vs. Available, Recent Filings
  - Quick Actions: Create Sales Invoice, Upload Purchase Invoices, Generate GSTR-1

- **QuickActions/CreateSalesInvoice.jsx**

  - Form Fields: Customer, Invoice No, Date, Amount, Apply E-Invoice (toggle)

- **QuickActions/UploadPurchaseInvoices.jsx**

  - File Upload (PDF/CSV), OCR Extract Start button

- **MasterData/GstRegistrations.jsx**

  - Table: GSTIN, Branch, Status
  - Form Fields: GSTIN (text), Branch Name, Address, Status (select)

- **MasterData/HsnSacCodes.jsx**

  - Table: Code, Description, Rate
  - Form: Add New Code (Code, Description, Rate)

- **MasterData/TaxRateConfig.jsx**

  - Table: Rate Type, % Value, Surcharge, Cess
  - Form Fields: Rate Type (select), Value (number), Surcharge (number), Cess (number)

- **Invoices/SalesInvoices.jsx** & **PurchaseInvoices.jsx**

  - Tables listing invoices with filters (date, party, status)
  - Forms: Party (select), Invoice No, Date, Amount, GST Details, Save/Submit

- **Returns/Gstr1.jsx**, **Gstr3b.jsx**, **OtherReturns.jsx**

  - Summary cards, Data grids, Bulk Edit modals, Export JSON button

- **EInvoice/GenerateIRN.jsx**

  - Form: Select Invoice, Generate IRN button, Display IRN & QR Code

- **EInvoice/EwayBill.jsx**

  - Form: Consignment No, Vehicle No, Date, Generate/Cancel actions

- **Reconciliation/Itc2a2b.jsx**

  - Import GSTR-2A/2B, Auto-Match results table, Flag mismatches

- **Reconciliation/MismatchResolution.jsx**

  - Table of mismatches, Edit link to correct entries, Notify Supplier button

- **Administration/SyncSettings.jsx**

  - Form Fields: GSTN Credentials (username, password/API key), Sync Frequency (select)

### 15.3 CFO Module

- **Dashboard.jsx**

  - KPI Cards: EBITDA, FCF, ROE, D/E Ratio, Cash Burn Rate
  - Alerts Panel: Deviations, Covenant Breaches, Upcoming Dates
  - Quick Actions: Run Forecast, Generate Board Deck, Launch What-If

- **Strategic/LongTermRoadmap.jsx**

  - Timeline View, Add Scenario modal (Name, Description, Start & End Dates)

- **Strategic/ScenarioLibrary.jsx**

  - List of scenarios, Create New Scenario form (base/upside/downside)

- **Budgeting/AnnualBudget.jsx**

  - Table: Department, Budgeted Amount, Spent
  - Form Fields: Department (select), Amount (number), Year (select)

- **Budgeting/RollingForecast.jsx**

  - Chart & Table view, Forecast Drivers (input fields for volume, price)

- **CashFlow/CashPosition.jsx**

  - Date Picker, Account Selector, Table: Opening Balance, Inflows, Outflows, Closing Balance

- **CashFlow/TreasuryOperations.jsx**

  - Form: Bank (select), API Key (text), Connect button, FX Exposure table

- **Modeling/DCFModel.jsx**

  - Inputs: Cash Flow Projections (table), Discount Rate (number), Terminal Value (number), Run Valuation button

- **Modeling/MonteCarloSimulation.jsx**

  - Inputs: Number of Simulations (number), Variable Ranges (min/max), Start Simulation button

- **Valuation/ComparableAnalysis.jsx**

  - Input: Ticker List (multi-text), Fetch Data, Table of Multiples

- **Valuation/CapTable.jsx**

  - Table: Stakeholder, Shares, Ownership %, Form: Add Stakeholder (Name, Shares)

- **Performance/KpiDashboard.jsx**

  - KPI Selector (multi-select), Date Range, Display as Cards or Charts

- **Performance/Reports.jsx**

  - Ad-hoc Report Builder: Drag & Drop fields, Generate Report button

- **Risk/RiskRegister.jsx**

  - Table: Risk, Likelihood, Impact, Mitigation, Actions
  - Form: Add Risk (Name, Description, Likelihood, Impact, Mitigation)

- **Risk/SoxControls.jsx**

  - Table: Control, Test Frequency, Owner, Status
  - Form: Add Control (Name, Frequency, Owner)

- **IR/FundraisingPipeline.jsx**

  - Pipeline Board (Kanban): Round, Target, Status
  - Form: New Round (Name, Target Amount, Close Date)

- **IR/InvestorRelations.jsx**

  - Table: Investor, Contact, Investment, Status
  - Form: Add Investor (Name, Contact Info, Notes)

## 16. Future Enhancements

- Plugin architecture for new modules
- Feature flags for gradual rollouts
- Micro-frontend readiness

