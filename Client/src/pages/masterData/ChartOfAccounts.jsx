import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  DocumentTextIcon, 
  MagnifyingGlassIcon, 
  PlusIcon, 
  PencilIcon, 
  TrashIcon 
} from '@heroicons/react/24/outline';

// Sample data for chart of accounts
const sampleAccounts = [
  // Assets (1000-1999)
  { id: 1, code: '1000', name: 'Cash', type: 'Asset', category: 'Current Asset', balance: 350000, active: true },
  { id: 2, code: '1100', name: 'Bank Account', type: 'Asset', category: 'Current Asset', balance: 725000, active: true },
  { id: 3, code: '1200', name: 'Accounts Receivable', type: 'Asset', category: 'Current Asset', balance: 175000, active: true },
  { id: 4, code: '1300', name: 'Inventory', type: 'Asset', category: 'Current Asset', balance: 250000, active: true },
  { id: 5, code: '1500', name: 'Office Equipment', type: 'Asset', category: 'Fixed Asset', balance: 320000, active: true },
  { id: 6, code: '1510', name: 'Accumulated Depreciation - Equipment', type: 'Asset', category: 'Fixed Asset', balance: -80000, active: true },
  { id: 7, code: '1600', name: 'Vehicles', type: 'Asset', category: 'Fixed Asset', balance: 450000, active: true },
  { id: 8, code: '1610', name: 'Accumulated Depreciation - Vehicles', type: 'Asset', category: 'Fixed Asset', balance: -120000, active: true },
  
  // Liabilities (2000-2999)
  { id: 9, code: '2000', name: 'Accounts Payable', type: 'Liability', category: 'Current Liability', balance: 85000, active: true },
  { id: 10, code: '2100', name: 'Accrued Expenses', type: 'Liability', category: 'Current Liability', balance: 35000, active: true },
  { id: 11, code: '2200', name: 'Wages Payable', type: 'Liability', category: 'Current Liability', balance: 45000, active: true },
  { id: 12, code: '2300', name: 'Interest Payable', type: 'Liability', category: 'Current Liability', balance: 5000, active: true },
  { id: 13, code: '2500', name: 'Long-term Loan', type: 'Liability', category: 'Long-term Liability', balance: 280000, active: true },
  
  // Equity (3000-3999)
  { id: 14, code: '3000', name: 'Owner\'s Equity', type: 'Equity', category: 'Equity', balance: 800000, active: true },
  { id: 15, code: '3100', name: 'Retained Earnings', type: 'Equity', category: 'Equity', balance: 170000, active: true },
  
  // Revenue (4000-4999)
  { id: 16, code: '4000', name: 'Sales Revenue', type: 'Revenue', category: 'Revenue', balance: 350000, active: true },
  { id: 17, code: '4100', name: 'Service Revenue', type: 'Revenue', category: 'Revenue', balance: 125000, active: true },
  { id: 18, code: '4200', name: 'Interest Income', type: 'Revenue', category: 'Revenue', balance: 5000, active: true },
  { id: 19, code: '4900', name: 'Other Income', type: 'Revenue', category: 'Revenue', balance: 12000, active: true },
  
  // Expenses (5000-5999)
  { id: 20, code: '5000', name: 'Cost of Goods Sold', type: 'Expense', category: 'Direct Expense', balance: 180000, active: true },
  { id: 21, code: '5100', name: 'Salaries Expense', type: 'Expense', category: 'Operating Expense', balance: 250000, active: true },
  { id: 22, code: '5200', name: 'Rent Expense', type: 'Expense', category: 'Operating Expense', balance: 60000, active: true },
  { id: 23, code: '5300', name: 'Utilities Expense', type: 'Expense', category: 'Operating Expense', balance: 25000, active: true },
  { id: 24, code: '5400', name: 'Depreciation Expense', type: 'Expense', category: 'Operating Expense', balance: 40000, active: true },
  { id: 25, code: '5500', name: 'Advertising Expense', type: 'Expense', category: 'Operating Expense', balance: 35000, active: true },
  { id: 26, code: '5600', name: 'Interest Expense', type: 'Expense', category: 'Financial Expense', balance: 15000, active: true },
];

const ChartOfAccounts = () => {
  const [accounts, setAccounts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  
  // Simulate data loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setAccounts(sampleAccounts);
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Filter accounts based on search term and type
  const filteredAccounts = accounts.filter(account => {
    const matchesSearch = 
      account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.code.includes(searchTerm);
    
    const matchesType = filterType === 'All' || account.type === filterType;
    
    return matchesSearch && matchesType;
  });
  
  // Group accounts by type for summary
  const accountSummary = accounts.reduce((summary, account) => {
    if (!summary[account.type]) {
      summary[account.type] = {
        count: 0,
        balance: 0
      };
    }
    
    summary[account.type].count += 1;
    summary[account.type].balance += account.balance;
    
    return summary;
  }, {});
  
  // Loading state
  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  return (
    <div className="w-full px-4 py-6 bg-white">
      {/* Page Header */}
      <div className="mb-8 border-b border-gray-200 pb-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center">
            <div className="text-blue-600 mr-3">
              <DocumentTextIcon className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-800">
                Chart of Accounts
              </h1>
              <p className="text-xs text-gray-500">Manage your financial accounts structure</p>
            </div>
          </div>
          <div className="flex items-center">
            <span className="text-sm text-gray-600 mr-4">{new Date().toLocaleDateString('en-IN', {day: 'numeric', month: 'long', year: 'numeric'})}</span>
          </div>
        </div>
      </div>
      
      <div className="space-y-6">
        {/* Filter Section */}
        <div className="mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="searchTerm" className="block text-xs font-medium text-gray-500 mb-1">Search</label>
              <div className="relative rounded-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="searchTerm"
                  placeholder="Search accounts..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="filterType" className="block text-xs font-medium text-gray-500 mb-1">Account Type</label>
              <select 
                id="filterType"
                className="block w-full pl-3 pr-10 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="All">All Types</option>
                <option value="Asset">Asset</option>
                <option value="Liability">Liability</option>
                <option value="Equity">Equity</option>
                <option value="Revenue">Revenue</option>
                <option value="Expense">Expense</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="status" className="block text-xs font-medium text-gray-500 mb-1">Status</label>
              <select
                id="status"
                className="block w-full pl-3 pr-10 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            
            <div className="md:col-span-3 flex justify-end">
              <button
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 mr-2"
                onClick={() => {
                  setSearchTerm('');
                  setFilterType('All');
                }}
              >
                Clear Filters
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex space-x-2">
            <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              <PlusIcon className="h-5 w-5 mr-2" />
              Add Account
            </button>
            <button className="flex items-center px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50">
              <DocumentTextIcon className="h-5 w-5 mr-2 text-gray-500" />
              Import Accounts
            </button>
          </div>
          <div>
            <button className="flex items-center px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          {Object.entries(accountSummary).map(([type, data]) => (
            <div key={type} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h3 className="text-sm font-medium text-gray-500">{type} Accounts</h3>
              <p className="text-2xl font-bold mt-1" style={{ color: getTypeTitleColor(type) }}>{data.count}</p>
              <p className="text-sm text-gray-500 mt-1">₹{data.balance.toLocaleString('en-IN')}</p>
            </div>
          ))}
        </div>
        
        {/* Accounts Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAccounts.length > 0 ? (
                  filteredAccounts.map((account) => (
                    <tr key={account.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{account.code}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{account.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeBadgeColor(account.type)}`}>
                          {account.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{account.category}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                        <span className={account.balance < 0 ? 'text-red-600' : 'text-gray-900'}>
                          ₹{account.balance.toLocaleString('en-IN')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${account.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
                          {account.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button className="text-blue-600 hover:text-blue-900">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          <button className="text-gray-600 hover:text-gray-900">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                      No accounts found matching your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Pagination */}
        {filteredAccounts.length > 0 && (
          <div className="mt-5 flex justify-between items-center">
            <div className="text-sm text-gray-500">
              Showing <span className="font-medium">1</span> to <span className="font-medium">10</span> of{' '}
              <span className="font-medium">{filteredAccounts.length}</span> accounts
            </div>
            <div className="flex space-x-1">
              <button className="px-2 py-1 border border-gray-300 rounded text-sm text-gray-500 bg-white hover:bg-gray-50 disabled:opacity-50" disabled>
                Previous
              </button>
              <button className="px-2 py-1 border border-gray-300 rounded text-sm text-gray-500 bg-white hover:bg-gray-50">
                1
              </button>
              <button className="px-2 py-1 border border-transparent rounded text-sm text-white bg-blue-600 hover:bg-blue-700">
                2
              </button>
              <button className="px-2 py-1 border border-gray-300 rounded text-sm text-gray-500 bg-white hover:bg-gray-50">
                3
              </button>
              <button className="px-2 py-1 border border-gray-300 rounded text-sm text-gray-500 bg-white hover:bg-gray-50">
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper function to get background color based on account type
function getTypeColor(type) {
  switch (type) {
    case 'Asset': return 'bg-blue-50';
    case 'Liability': return 'bg-red-50';
    case 'Equity': return 'bg-purple-50';
    case 'Revenue': return 'bg-green-50';
    case 'Expense': return 'bg-yellow-50';
    default: return 'bg-gray-50';
  }
}

// Helper function to get badge color based on account type
function getTypeBadgeColor(type) {
  switch (type) {
    case 'Asset': return 'bg-blue-100 text-blue-800';
    case 'Liability': return 'bg-red-100 text-red-800';
    case 'Equity': return 'bg-purple-100 text-purple-800';
    case 'Revenue': return 'bg-green-100 text-green-800';
    case 'Expense': return 'bg-yellow-100 text-yellow-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}

// Helper function to get title text color based on account type
function getTypeTitleColor(type) {
  switch (type) {
    case 'Asset': return '#3b82f6'; // blue-500
    case 'Liability': return '#ef4444'; // red-500
    case 'Equity': return '#8b5cf6'; // purple-500
    case 'Revenue': return '#22c55e'; // green-500
    case 'Expense': return '#eab308'; // yellow-500
    default: return '#6b7280'; // gray-500
  }
}

export default ChartOfAccounts;