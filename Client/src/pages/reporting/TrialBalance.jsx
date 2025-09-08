import React, { useState } from 'react';
import { DocumentTextIcon } from '@heroicons/react/24/solid';

const TrialBalance = () => {
  const [dateRange, setDateRange] = useState({
    from: '2023-01-01',
    to: '2023-12-31'
  });
  const [isLoading, setIsLoading] = useState(false);

  const [trialBalance, setTrialBalance] = useState([
    { account: 'Cash', debit: 150000, credit: 0, balance: 150000 },
    { account: 'Accounts Receivable', debit: 250000, credit: 0, balance: 250000 },
    { account: 'Inventory', debit: 300000, credit: 0, balance: 300000 },
    { account: 'Fixed Assets', debit: 500000, credit: 0, balance: 500000 },
    { account: 'Accounts Payable', debit: 0, credit: 180000, balance: -180000 },
    { account: 'Bank Loan', debit: 0, credit: 400000, balance: -400000 },
    { account: 'Capital', debit: 0, credit: 300000, balance: -300000 },
    { account: 'Sales Revenue', debit: 0, credit: 800000, balance: -800000 },
    { account: 'Cost of Goods Sold', debit: 450000, credit: 0, balance: 450000 },
    { account: 'Operating Expenses', debit: 200000, credit: 0, balance: 200000 },
  ]);

  const handleGenerateReport = () => {
    // In real app, this would call API to generate trial balance
    console.log('Generating trial balance for:', dateRange);
  };

  const handleExport = () => {
    // In a real application, this would generate and download an Excel file
    alert('Exporting trial balance to Excel...');
    
    // Example implementation (in a real app, you would use a library like xlsx)
    // const worksheet = XLSX.utils.json_to_sheet(trialBalance);
    // const workbook = XLSX.utils.book_new();
    // XLSX.utils.book_append_sheet(workbook, worksheet, "Trial Balance");
    // XLSX.writeFile(workbook, "trial_balance.xlsx");
  };

  const totalDebit = trialBalance.reduce((sum, item) => sum + item.debit, 0);
  const totalCredit = trialBalance.reduce((sum, item) => sum + item.credit, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {isLoading && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg shadow-lg flex items-center">
            <svg className="animate-spin h-5 w-5 mr-3 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Loading...</span>
          </div>
        </div>
      )}
      {/* Page Header */}
      <div className="mb-8 border-b border-gray-200 pb-4">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Trial Balance</h1>
            <p className="mt-2 text-sm text-gray-600">
              View the trial balance for a specific period to ensure your debits and credits are balanced.
            </p>
          </div>
          <div className="text-sm text-gray-500">
            <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="flex justify-end items-center mb-6">
        <div className="flex space-x-4">
          <button
            onClick={handleGenerateReport}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <DocumentTextIcon className="-ml-1 mr-2 h-5 w-5" />
            Generate Report
          </button>
          <button
            onClick={handleExport}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <DocumentTextIcon className="-ml-1 mr-2 h-5 w-5 text-gray-500" />
            Export
          </button>
        </div>
      </div>

      {/* Date Range Picker */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Select Date Range</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="from-date" className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
            <input
              type="date"
              id="from-date"
              value={dateRange.from}
              onChange={(e) => setDateRange({...dateRange, from: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded-md shadow focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="to-date" className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
            <input
              type="date"
              id="to-date"
              value={dateRange.to}
              onChange={(e) => setDateRange({...dateRange, to: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded-md shadow focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Trial Balance Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 bg-gray-100 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Trial Balance Details</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Debit (₹)</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Credit (₹)</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Balance (₹)</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {trialBalance.length > 0 ? (
                trialBalance.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.account}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">
                      {item.debit > 0 ? item.debit.toLocaleString('en-IN') : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">
                      {item.credit > 0 ? item.credit.toLocaleString('en-IN') : '-'}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-medium ${item.balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                      {Math.abs(item.balance).toLocaleString('en-IN')}
                      {item.balance < 0 && ' (Cr)'}
                      {item.balance > 0 && ' (Dr)'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-sm text-gray-500">
                    No data available. Generate a report to view the trial balance.
                  </td>
                </tr>
              )}
            </tbody>
            {trialBalance.length > 0 && (
              <tfoot className="bg-gray-100">
                <tr>
                  <th scope="row" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  <td className="px-6 py-3 text-right text-xs font-medium text-gray-900">
                    ₹{totalDebit.toLocaleString('en-IN')}
                  </td>
                  <td className="px-6 py-3 text-right text-xs font-medium text-gray-900">
                    ₹{totalCredit.toLocaleString('en-IN')}
                  </td>
                  <td className="px-6 py-3 text-right text-xs font-medium text-gray-900">
                    ₹{Math.abs(totalDebit - totalCredit).toLocaleString('en-IN')}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Total Debit</h3>
            <div className="p-2 bg-blue-100 rounded-full">
              <DocumentTextIcon className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-blue-600">
            ₹{totalDebit.toLocaleString('en-IN')}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Total Credit</h3>
            <div className="p-2 bg-green-100 rounded-full">
              <DocumentTextIcon className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-green-600">
            ₹{totalCredit.toLocaleString('en-IN')}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Difference</h3>
            <div className={`p-2 rounded-full ${totalDebit - totalCredit === 0 ? 'bg-green-100' : 'bg-red-100'}`}>
              <DocumentTextIcon className={`h-6 w-6 ${totalDebit - totalCredit === 0 ? 'text-green-600' : 'text-red-600'}`} />
            </div>
          </div>
          <p className={`text-3xl font-bold ${totalDebit - totalCredit === 0 ? 'text-green-600' : 'text-red-600'}`}>
            ₹{Math.abs(totalDebit - totalCredit).toLocaleString('en-IN')}
            {totalDebit - totalCredit === 0 && ' (Balanced)'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default TrialBalance;