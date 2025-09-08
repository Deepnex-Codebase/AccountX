import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { ChatWindowProvider } from './contexts/ChatWindowContext';
import LoadingSpinner from './components/atoms/LoadingSpinner';

// Layouts
const MainLayout = lazy(() => import('./components/layouts/MainLayout'));

// Pages - Lazy loaded for better performance
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Login = lazy(() => import('./pages/shared/Login'));
const Register = lazy(() => import('./pages/shared/Register'));
const NotFound = lazy(() => import('./pages/shared/NotFound'));
const Settings = lazy(() => import('./pages/shared/Settings'));

// Accounting Pages
const AccountingLayout = lazy(() => import('./pages/accounting/Layout'));
const AccountingDashboard = lazy(() => import('./pages/accounting/Dashboard'));
const GeneralLedger = lazy(() => import('./pages/accounting/GeneralLedger'));
const AccountsPayable = lazy(() => import('./pages/accounting/AccountsPayable'));
const AccountsReceivable = lazy(() => import('./pages/accounting/AccountsReceivable'));

// Master Data Pages
const ChartOfAccounts = lazy(() => import('./pages/masterData/ChartOfAccounts'));
const CostCenters = lazy(() => import('./pages/masterData/CostCenters'));
const Templates = lazy(() => import('./pages/masterData/Templates'));
const TaxCodes = lazy(() => import('./pages/masterData/TaxCodes'));
const Currencies = lazy(() => import('./pages/masterData/Currencies'));

// Transaction Pages
const JournalEntries = lazy(() => import('./pages/transactions/JournalEntries'));
const CashBook = lazy(() => import('./pages/transactions/CashBook'));
const BankBook = lazy(() => import('./pages/transactions/BankBook'));
const PurchaseBook = lazy(() => import('./pages/transactions/PurchaseBook'));
const SalesBook = lazy(() => import('./pages/transactions/SalesBook'));
const PettyCash = lazy(() => import('./pages/transactions/PettyCash'));

// Reporting Pages
const BalanceSheet = lazy(() => import('./pages/reporting/BalanceSheet'));
const TrialBalance = lazy(() => import('./pages/reporting/TrialBalance'));
const ProfitAndLoss = lazy(() => import('./pages/reporting/ProfitAndLoss'));
const CashFlow = lazy(() => import('./pages/reporting/CashFlow'));
const GeneralLedgerReport = lazy(() => import('./pages/reporting/GeneralLedgerReport'));
const AgingReports = lazy(() => import('./pages/reporting/AgingReports'));

// Administration Pages
const UserManagement = lazy(() => import('./pages/administration/Users'));
const TenantSettings = lazy(() => import('./pages/administration/TenantSettings'));
const RolesPermissions = lazy(() => import('./pages/administration/RolesPermissions'));
const AuditTrail = lazy(() => import('./pages/administration/AuditTrail'));
const SystemSettings = lazy(() => import('./pages/administration/SystemSettings'));

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <ChatWindowProvider>
            <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              {/* Auth Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Main App Routes */}
              <Route path="/" element={<MainLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="settings" element={<Settings />} />
                
                {/* Accounting Routes */}
                <Route path="accounting" element={<AccountingLayout />}>
                  <Route index element={<AccountingDashboard />} />
                  <Route path="general-ledger" element={<GeneralLedger />} />
                  <Route path="accounts-payable" element={<AccountsPayable />} />
                  <Route path="accounts-receivable" element={<AccountsReceivable />} />
                </Route>
                
                {/* Master Data Routes */}
                <Route path="master-data">
                  <Route path="chart-of-accounts" element={<ChartOfAccounts />} />
                  <Route path="cost-centers" element={<CostCenters />} />
                  <Route path="templates" element={<Templates />} />
                  <Route path="tax-codes" element={<TaxCodes />} />
                  <Route path="currencies" element={<Currencies />} />
                </Route>
                
                {/* Transaction Routes */}
                <Route path="transactions">
                  <Route path="journal-entries" element={<JournalEntries />} />
                  <Route path="cash-book" element={<CashBook />} />
                  <Route path="bank-book" element={<BankBook />} />
                  <Route path="purchase-book" element={<PurchaseBook />} />
                  <Route path="sales-book" element={<SalesBook />} />
                  <Route path="petty-cash" element={<PettyCash />} />
                </Route>
                
                {/* Reporting Routes */}
                <Route path="reporting">
                  <Route path="trial-balance" element={<TrialBalance />} />
                  <Route path="balance-sheet" element={<BalanceSheet />} />
                  <Route path="profit-and-loss" element={<ProfitAndLoss />} />
                  <Route path="cash-flow" element={<CashFlow />} />
                  <Route path="general-ledger" element={<GeneralLedgerReport />} />
                  <Route path="aging-reports" element={<AgingReports />} />
                </Route>
                
                {/* Administration Routes */}
                <Route path="administration">
                  <Route path="tenant-settings" element={
                    <Suspense fallback={<div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div></div>}>
                      <TenantSettings />
                    </Suspense>
                  } />
                  <Route path="user-management" element={
                    <Suspense fallback={<div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div></div>}>
                      <UserManagement />
                    </Suspense>
                  } />
                  <Route path="roles-permissions" element={
                  <Suspense fallback={<div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div></div>}>
                    <RolesPermissions />
                  </Suspense>
                } />
                <Route path="audit-trail" element={
                  <Suspense fallback={<div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div></div>}>
                    <AuditTrail />
                  </Suspense>
                } />
                <Route path="system-settings" element={
                  <Suspense fallback={<div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div></div>}>
                    <SystemSettings />
                  </Suspense>
                } />
                </Route>
              </Route>
              
              {/* 404 Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            </Suspense>
          </ChatWindowProvider>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;