import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiChevronDown } from 'react-icons/fi';

// Sample data for dashboard widgets
const sampleData = {
  recentTransactions: [
    { id: 1, date: '2023-11-15', description: 'Office Supplies', amount: -450, type: 'expense' },
    { id: 2, date: '2023-11-14', description: 'Client Payment - ABC Corp', amount: 5000, type: 'income' },
    { id: 3, date: '2023-11-12', description: 'Utility Bill', amount: -120, type: 'expense' },
    { id: 4, date: '2023-11-10', description: 'Client Payment - XYZ Ltd', amount: 3200, type: 'income' },
  ],
  financialSummary: {
    income: 28500,
    expenses: 12350,
    profit: 16150,
    pendingInvoices: 8700,
  },
  accountBalances: [
    { id: 1, name: 'Main Checking Account', balance: 24500 },
    { id: 2, name: 'Business Savings', balance: 45000 },
    { id: 3, name: 'Tax Reserve', balance: 12000 },
  ],
  upcomingTasks: [
    { id: 1, title: 'GST Filing', dueDate: '2023-11-30', priority: 'high' },
    { id: 2, title: 'Quarterly Financial Review', dueDate: '2023-12-15', priority: 'medium' },
    { id: 3, title: 'Vendor Payment', dueDate: '2023-11-25', priority: 'low' },
  ],
  receivables: {
    current: 45000,
    overdue: 32500,
    invoices: [
      { id: 1, client: 'ABC Corp', amount: 15000, dueDate: '2023-12-10', status: 'current' },
      { id: 2, client: 'XYZ Ltd', amount: 12500, dueDate: '2023-12-15', status: 'current' },
      { id: 3, client: 'PQR Inc', amount: 17500, dueDate: '2023-11-30', status: 'current' },
      { id: 4, client: 'LMN Enterprises', amount: 18000, dueDate: '2023-11-15', status: 'overdue' },
      { id: 5, client: 'EFG Solutions', amount: 14500, dueDate: '2023-11-05', status: 'overdue' },
    ]
  },
};

// Dashboard component
const Dashboard = () => {
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
      <div className="h-full flex items-center justify-center bg-background p-6 rounded-card max-w-7xl mx-auto">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          <p className="mt-4 text-base-dark font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className=" px-4 py-6 bg-white">
      {/* Dashboard Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1">Welcome to your financial overview</p>
          </div>
          <div className="text-right">
            <h2 className="text-lg font-medium text-gray-700">Hello, divyeshy.work</h2>
            <p className="text-xs text-gray-500">Lynch Tyler Associates</p>
          </div>
        </div>
        <div className="h-px w-full bg-gray-200 mt-4"></div>
      </div>
      
      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Total Receivables Widget - Styled exactly as in the image */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="flex justify-between items-center px-4 py-3 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800">Total Receivables</h2>
            <Link to="/invoices" className="flex items-center text-blue-500 hover:text-blue-600">
              <FiPlus className="mr-1" size={20} /> <span>New</span>
            </Link>
          </div>
          
          <div className="p-4">
            <p className="text-gray-600 mb-2">Total Unpaid Invoices ₹{(dashboardData.receivables.current + dashboardData.receivables.overdue).toLocaleString('en-IN')}</p>
            
            {/* Progress bar */}
            <div className="bg-gray-100 h-2 rounded-full mb-6 w-full">
              <div 
                className="bg-blue-500 h-full rounded-full" 
                style={{ width: `${(dashboardData.receivables.current / (dashboardData.receivables.current + dashboardData.receivables.overdue)) * 100}%` }}
              ></div>
            </div>
            
            {/* Current and Overdue sections */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-sm font-medium text-blue-500">CURRENT</h3>
                <p className="text-2xl font-bold text-gray-800 mt-1">₹{dashboardData.receivables.current.toLocaleString('en-IN')}</p>
              </div>
              
              <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-sm font-medium text-red-500">OVERDUE</h3>
                <p className="text-2xl font-bold text-gray-800 mt-1 flex items-center">
                  ₹{dashboardData.receivables.overdue.toLocaleString('en-IN')} 
                  <FiChevronDown className="ml-1 text-red-500" size={16} />
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Financial Summary Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800">Financial Summary</h2>
          </div>
          <div className="p-4 space-y-4">
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Total Income</p>
                <p className="text-xl font-bold text-green-600">₹{dashboardData.financialSummary.income.toLocaleString('en-IN')}</p>
              </div>
              <div className="bg-green-100 p-2 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              </div>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Total Expenses</p>
                <p className="text-xl font-bold text-red-600">₹{dashboardData.financialSummary.expenses.toLocaleString('en-IN')}</p>
              </div>
              <div className="bg-red-100 p-2 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </div>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Net Profit</p>
                <p className="text-xl font-bold text-blue-600">₹{dashboardData.financialSummary.profit.toLocaleString('en-IN')}</p>
              </div>
              <div className="bg-blue-100 p-2 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
        
        {/* Account Balances Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="flex justify-between items-center px-4 py-3 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800">Account Balances</h2>
            <Link to="/accounts" className="text-blue-500 hover:text-blue-600 text-sm">
              View All
            </Link>
          </div>
          <div className="p-4">
            <div className="space-y-3">
              {dashboardData.accountBalances.map((account) => (
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
      
      {/* Second Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Recent Transactions */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="flex justify-between items-center px-4 py-3 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800">Recent Transactions</h2>
            <Link to="/transactions" className="text-blue-500 hover:text-blue-600 text-sm">
              View All
            </Link>
          </div>
          
          <div className="p-4 overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="py-3 px-4 text-left font-medium text-gray-600">Date</th>
                  <th className="py-3 px-4 text-left font-medium text-gray-600">Description</th>
                  <th className="py-3 px-4 text-right font-medium text-gray-600">Amount</th>
                </tr>
              </thead>
              <tbody>
                {dashboardData.recentTransactions.map((transaction) => (
                  <tr key={transaction.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 text-sm text-gray-700">{transaction.date}</td>
                    <td className="py-3 px-4 text-sm text-gray-700">{transaction.description}</td>
                    <td className={`py-3 px-4 text-sm text-right font-medium ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                      {transaction.type === 'income' ? '+' : '-'}₹{Math.abs(transaction.amount).toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Upcoming Tasks */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="flex justify-between items-center px-4 py-3 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800">Upcoming Tasks</h2>
            <Link to="/tasks" className="text-blue-500 hover:text-blue-600 text-sm">
              View All
            </Link>
          </div>
          <div className="p-4">
            <div className="space-y-3">
              {dashboardData.upcomingTasks.map((task) => (
                <div key={task.id} className="p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-800">{task.title}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${getPriorityClass(task.priority)}`}>
                      {task.priority}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Due: {task.dueDate}</p>
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
            <Link to="/transactions/create" className="p-4 border border-gray-200 rounded-lg text-center hover:bg-blue-50 hover:border-blue-200 transition-colors group">
              <div className="text-blue-500 mb-2 group-hover:scale-110 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <h3 className="font-medium text-gray-800 group-hover:text-blue-600 transition-colors">New Transaction</h3>
            </Link>
            
            <Link to="/invoices/create" className="p-4 border border-gray-200 rounded-lg text-center hover:bg-blue-50 hover:border-blue-200 transition-colors group">
              <div className="text-blue-500 mb-2 group-hover:scale-110 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="font-medium text-gray-800 group-hover:text-blue-600 transition-colors">New Invoice</h3>
            </Link>
            
            <Link to="/reports" className="p-4 border border-gray-200 rounded-lg text-center hover:bg-blue-50 hover:border-blue-200 transition-colors group">
              <div className="text-blue-500 mb-2 group-hover:scale-110 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="font-medium text-gray-800 group-hover:text-blue-600 transition-colors">Reports</h3>
            </Link>
            
            <Link to="/settings" className="p-4 border border-gray-200 rounded-lg text-center hover:bg-blue-50 hover:border-blue-200 transition-colors group">
              <div className="text-blue-500 mb-2 group-hover:scale-110 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="font-medium text-gray-800 group-hover:text-blue-600 transition-colors">Settings</h3>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function for priority styling
const getPriorityClass = (priority) => {
  switch (priority) {
    case 'high':
      return 'bg-error/10 text-error';
    case 'medium':
      return 'bg-warning/10 text-warning';
    case 'low':
      return 'bg-success/10 text-success';
    default:
      return 'bg-gray-100 text-gray-700';
  }
};

export default Dashboard;