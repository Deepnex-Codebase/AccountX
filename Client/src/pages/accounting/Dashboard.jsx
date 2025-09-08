import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// Sample data for accounting dashboard
const sampleData = {
  accountingSummary: {
    assets: 1250000,
    liabilities: 450000,
    equity: 800000,
    revenue: 350000,
    expenses: 180000,
  },
  recentJournalEntries: [
    { id: 1, date: '2023-11-15', description: 'Office Rent Payment', debit: 25000, credit: 25000, status: 'posted' },
    { id: 2, date: '2023-11-14', description: 'Sales Revenue', debit: 45000, credit: 45000, status: 'posted' },
    { id: 3, date: '2023-11-12', description: 'Equipment Purchase', debit: 120000, credit: 120000, status: 'posted' },
    { id: 4, date: '2023-11-10', description: 'Utility Expenses', debit: 8500, credit: 8500, status: 'posted' },
  ],
  accountBalances: [
    { id: 1, code: '1000', name: 'Cash', type: 'Asset', balance: 350000 },
    { id: 2, code: '1200', name: 'Accounts Receivable', type: 'Asset', balance: 175000 },
    { id: 3, code: '2000', name: 'Accounts Payable', type: 'Liability', balance: 85000 },
    { id: 4, code: '3000', name: 'Owner\'s Equity', type: 'Equity', balance: 800000 },
    { id: 5, code: '4000', name: 'Revenue', type: 'Revenue', balance: 350000 },
    { id: 6, code: '5000', name: 'Expenses', type: 'Expense', balance: 180000 },
  ],
};

const AccountingDashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  
  // Simulate data loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setDashboardData(sampleData);
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Loading state
  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-background p-6 rounded-card w-full">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          <p className="mt-4 text-base-dark font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }
  
  
  return (
    <div className="w-full px-4 py-6 bg-white">
      {/* Dashboard Header */}
      <div className="mb-8 border-b border-gray-200 pb-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center">
            <div className="text-blue-600 mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-800">
                Accounting Dashboard
              </h1>
              <p className="text-xs text-gray-500">Financial data overview</p>
            </div>
          </div>
          <div className="flex items-center">
            <span className="text-sm text-gray-600 mr-4">{new Date().toLocaleDateString('en-IN', {day: 'numeric', month: 'long', year: 'numeric'})}</span>
          </div>
        </div>
      </div>
      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Assets Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800">Financial Summary</h2>
          </div>
          <div className="p-4 space-y-4">
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Total Assets</p>
                <p className="text-xl font-bold text-green-600">₹{dashboardData.accountingSummary.assets.toLocaleString('en-IN')}</p>
              </div>
              <div className="bg-green-100 p-2 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              </div>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Total Liabilities</p>
                <p className="text-xl font-bold text-red-600">₹{dashboardData.accountingSummary.liabilities.toLocaleString('en-IN')}</p>
              </div>
              <div className="bg-red-100 p-2 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </div>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Owners Equity</p>
                <p className="text-xl font-bold text-blue-600">₹{dashboardData.accountingSummary.equity.toLocaleString('en-IN')}</p>
              </div>
              <div className="bg-blue-100 p-2 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
        
        {/* Revenue and Expenses Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800">Income Summary</h2>
          </div>
          <div className="p-4 space-y-6">
            {/* Revenue Section */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center">
                  <div className="bg-green-100 p-1.5 rounded-full mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-gray-700">Revenue</p>
                </div>
                <p className="text-lg font-bold text-green-600">₹{dashboardData.accountingSummary.revenue.toLocaleString('en-IN')}</p>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-green-500 h-2.5 rounded-full" style={{ width: '100%' }}></div>
              </div>
            </div>
            
            {/* Expenses Section */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center">
                  <div className="bg-red-100 p-1.5 rounded-full mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-gray-700">Expenses</p>
                </div>
                <p className="text-lg font-bold text-red-600">₹{dashboardData.accountingSummary.expenses.toLocaleString('en-IN')}</p>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-red-500 h-2.5 rounded-full" style={{ width: `${(dashboardData.accountingSummary.expenses / dashboardData.accountingSummary.revenue) * 100}%` }}></div>
              </div>
            </div>
            
            {/* Net Income Section - Minimal Design */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="bg-green-100 p-1.5 rounded-full mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-gray-800">Net Income</p>
                </div>
                <div className="flex flex-col items-end">
                  <p className={`text-lg font-bold ${(dashboardData.accountingSummary.revenue - dashboardData.accountingSummary.expenses) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ₹{(dashboardData.accountingSummary.revenue - dashboardData.accountingSummary.expenses).toLocaleString('en-IN')}
                  </p>
                  <div className="flex items-center">
                    <span className="text-xs text-gray-500">{Math.round((dashboardData.accountingSummary.revenue - dashboardData.accountingSummary.expenses) / dashboardData.accountingSummary.revenue * 100)}% margin</span>
                    {(dashboardData.accountingSummary.revenue - dashboardData.accountingSummary.expenses) >= 0 ? (
                      <span className="ml-1 text-xs text-green-600">↑</span>
                    ) : (
                      <span className="ml-1 text-xs text-red-600">↓</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Account Balances Preview */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="flex justify-between items-center px-4 py-3 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800">Account Balances</h2>
            <Link to="/master-data/chart-of-accounts" className="text-blue-500 hover:text-blue-600 text-sm">
              View All
            </Link>
          </div>
          <div className="p-4">
            <div className="space-y-3">
              {dashboardData.accountBalances.slice(0, 3).map((account) => (
                <div key={account.id} className="p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-800">{account.name}</span>
                    <span className="font-bold text-green-600">₹{account.balance.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800">Quick Actions</h2>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link to="/transactions/journal-entries/create" className="p-4 border border-gray-200 rounded-lg text-center hover:bg-blue-50 hover:border-blue-200 transition-colors group">
              <div className="text-blue-500 mb-2 group-hover:scale-110 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <h3 className="font-medium text-gray-800 group-hover:text-blue-600 transition-colors">New Journal Entry</h3>
            </Link>
            
            <Link to="/master-data/chart-of-accounts" className="p-4 border border-gray-200 rounded-lg text-center hover:bg-blue-50 hover:border-blue-200 transition-colors group">
              <div className="text-blue-500 mb-2 group-hover:scale-110 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="font-medium text-gray-800 group-hover:text-blue-600 transition-colors">Chart of Accounts</h3>
            </Link>
            
            <Link to="/reporting/trial-balance" className="p-4 border border-gray-200 rounded-lg text-center hover:bg-blue-50 hover:border-blue-200 transition-colors group">
              <div className="text-blue-500 mb-2 group-hover:scale-110 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="font-medium text-gray-800 group-hover:text-blue-600 transition-colors">Trial Balance</h3>
            </Link>
            
            <Link to="/reporting/balance-sheet" className="p-4 border border-gray-200 rounded-lg text-center hover:bg-blue-50 hover:border-blue-200 transition-colors group">
              <div className="text-blue-500 mb-2 group-hover:scale-110 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="font-medium text-gray-800 group-hover:text-blue-600 transition-colors">Balance Sheet</h3>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Recent Journal Entries */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="flex justify-between items-center px-4 py-3 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800">Recent Journal Entries</h2>
            <Link to="/transactions/journal-entries" className="text-blue-500 hover:text-blue-600 text-sm">
              View All
            </Link>
          </div>
          
          <div className="p-4 overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="py-3 px-4 text-left font-medium text-gray-600">Date</th>
                  <th className="py-3 px-4 text-left font-medium text-gray-600">Description</th>
                  <th className="py-3 px-4 text-right font-medium text-gray-600">Debit</th>
                  <th className="py-3 px-4 text-right font-medium text-gray-600">Credit</th>
                  <th className="py-3 px-4 text-center font-medium text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody>
                {dashboardData.recentJournalEntries.map((entry, index) => (
                  <tr key={entry.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 text-sm text-gray-700">{entry.date}</td>
                    <td className="py-3 px-4 text-sm text-gray-700">{entry.description}</td>
                    <td className="py-3 px-4 text-sm text-right font-medium text-red-600">₹{entry.debit.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4 text-sm text-right font-medium text-green-600">₹{entry.credit.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4 text-sm text-center">
                      <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-600">
                        {entry.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Account Balances */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="flex justify-between items-center px-4 py-3 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800">Key Account Balances</h2>
            <Link to="/master-data/chart-of-accounts" className="text-blue-500 hover:text-blue-600 text-sm">
              View All
            </Link>
          </div>
          
          <div className="p-4 space-y-3">
            {dashboardData.accountBalances.map((account) => (
              <div key={account.id} className="p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-800">{account.name}</span>
                  <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-600">
                    {account.type}
                  </span>
                </div>
                <div className="flex justify-between mt-2 items-center">
                  <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">{account.code}</span>
                  <span className="font-bold">
                    {account.type === 'Liability' || account.type === 'Expense' ? 
                      <span className="text-red-600">₹{account.balance.toLocaleString('en-IN')}</span> : 
                      <span className="text-green-600">₹{account.balance.toLocaleString('en-IN')}</span>
                    }
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountingDashboard;