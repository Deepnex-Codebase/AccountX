import React, { useState, useEffect } from 'react';
import { ArrowDownTrayIcon, DocumentTextIcon, PrinterIcon } from '@heroicons/react/24/outline';

const GeneralLedgerReport = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [selectedAccount, setSelectedAccount] = useState('all');
  
  // Sample accounts for dropdown
  const accounts = [
    { id: 'all', name: 'All Accounts' },
    { id: '1001', name: '1001 - Cash' },
    { id: '1002', name: '1002 - Bank Account' },
    { id: '1200', name: '1200 - Accounts Receivable' },
    { id: '1300', name: '1300 - Inventory' },
    { id: '2001', name: '2001 - Accounts Payable' },
    { id: '3001', name: '3001 - Share Capital' },
    { id: '4001', name: '4001 - Sales Revenue' },
    { id: '5001', name: '5001 - Cost of Goods Sold' },
    { id: '6001', name: '6001 - Salaries Expense' }
  ];
  
  // Sample general ledger data
  const ledgerData = [
    {
      accountId: '1001',
      accountName: 'Cash',
      openingBalance: 250000,
      transactions: [
        { id: 1, date: '2023-04-01', description: 'Sales Receipt', reference: 'SR-001', debit: 15000, credit: 0 },
        { id: 2, date: '2023-04-03', description: 'Office Supplies', reference: 'EXP-001', debit: 0, credit: 2500 },
        { id: 3, date: '2023-04-07', description: 'Sales Receipt', reference: 'SR-002', debit: 8500, credit: 0 },
        { id: 4, date: '2023-04-12', description: 'Rent Payment', reference: 'EXP-002', debit: 0, credit: 25000 },
        { id: 5, date: '2023-04-15', description: 'Sales Receipt', reference: 'SR-003', debit: 12000, credit: 0 },
        { id: 6, date: '2023-04-18', description: 'Utility Bill', reference: 'EXP-003', debit: 0, credit: 3500 },
        { id: 7, date: '2023-04-22', description: 'Sales Receipt', reference: 'SR-004', debit: 9500, credit: 0 },
        { id: 8, date: '2023-04-25', description: 'Office Supplies', reference: 'EXP-004', debit: 0, credit: 1800 },
        { id: 9, date: '2023-04-28', description: 'Sales Receipt', reference: 'SR-005', debit: 11000, credit: 0 },
        { id: 10, date: '2023-04-30', description: 'Salary Payment', reference: 'EXP-005', debit: 0, credit: 45000 }
      ]
    },
    {
      accountId: '1002',
      accountName: 'Bank Account',
      openingBalance: 750000,
      transactions: [
        { id: 1, date: '2023-04-02', description: 'Loan Disbursement', reference: 'LN-001', debit: 200000, credit: 0 },
        { id: 2, date: '2023-04-05', description: 'Vendor Payment', reference: 'AP-001', debit: 0, credit: 35000 },
        { id: 3, date: '2023-04-10', description: 'Customer Payment', reference: 'AR-001', debit: 45000, credit: 0 },
        { id: 4, date: '2023-04-15', description: 'Vendor Payment', reference: 'AP-002', debit: 0, credit: 28000 },
        { id: 5, date: '2023-04-20', description: 'Customer Payment', reference: 'AR-002', debit: 32000, credit: 0 },
        { id: 6, date: '2023-04-25', description: 'Loan Repayment', reference: 'LN-002', debit: 0, credit: 15000 },
        { id: 7, date: '2023-04-28', description: 'Interest Income', reference: 'INT-001', debit: 5000, credit: 0 }
      ]
    },
    {
      accountId: '1200',
      accountName: 'Accounts Receivable',
      openingBalance: 350000,
      transactions: [
        { id: 1, date: '2023-04-01', description: 'Invoice to Customer A', reference: 'INV-001', debit: 25000, credit: 0 },
        { id: 2, date: '2023-04-05', description: 'Payment from Customer B', reference: 'REC-001', debit: 0, credit: 18000 },
        { id: 3, date: '2023-04-10', description: 'Invoice to Customer C', reference: 'INV-002', debit: 32000, credit: 0 },
        { id: 4, date: '2023-04-15', description: 'Payment from Customer A', reference: 'REC-002', debit: 0, credit: 25000 },
        { id: 5, date: '2023-04-20', description: 'Invoice to Customer D', reference: 'INV-003', debit: 15000, credit: 0 },
        { id: 6, date: '2023-04-25', description: 'Payment from Customer C', reference: 'REC-003', debit: 0, credit: 32000 },
        { id: 7, date: '2023-04-28', description: 'Invoice to Customer E', reference: 'INV-004', debit: 28000, credit: 0 }
      ]
    },
    {
      accountId: '4001',
      accountName: 'Sales Revenue',
      openingBalance: 0,
      transactions: [
        { id: 1, date: '2023-04-01', description: 'Sales to Customer A', reference: 'INV-001', debit: 0, credit: 25000 },
        { id: 2, date: '2023-04-10', description: 'Sales to Customer C', reference: 'INV-002', debit: 0, credit: 32000 },
        { id: 3, date: '2023-04-15', description: 'Sales to Customer B', reference: 'INV-003', debit: 0, credit: 18000 },
        { id: 4, date: '2023-04-20', description: 'Sales to Customer D', reference: 'INV-004', debit: 0, credit: 15000 },
        { id: 5, date: '2023-04-28', description: 'Sales to Customer E', reference: 'INV-005', debit: 0, credit: 28000 }
      ]
    },
    {
      accountId: '5001',
      accountName: 'Cost of Goods Sold',
      openingBalance: 0,
      transactions: [
        { id: 1, date: '2023-04-01', description: 'COGS for INV-001', reference: 'COGS-001', debit: 15000, credit: 0 },
        { id: 2, date: '2023-04-10', description: 'COGS for INV-002', reference: 'COGS-002', debit: 19200, credit: 0 },
        { id: 3, date: '2023-04-15', description: 'COGS for INV-003', reference: 'COGS-003', debit: 10800, credit: 0 },
        { id: 4, date: '2023-04-20', description: 'COGS for INV-004', reference: 'COGS-004', debit: 9000, credit: 0 },
        { id: 5, date: '2023-04-28', description: 'COGS for INV-005', reference: 'COGS-005', debit: 16800, credit: 0 }
      ]
    }
  ];
  
  // Filter ledger data based on selected account
  const filteredLedger = selectedAccount === 'all' 
    ? ledgerData 
    : ledgerData.filter(account => account.accountId === selectedAccount);
  
  // Calculate account totals and balances
  const calculateAccountSummary = (account) => {
    const totalDebit = account.transactions.reduce((sum, transaction) => sum + transaction.debit, 0);
    const totalCredit = account.transactions.reduce((sum, transaction) => sum + transaction.credit, 0);
    const closingBalance = account.openingBalance + totalDebit - totalCredit;
    
    return {
      totalDebit,
      totalCredit,
      closingBalance
    };
  };
  
  // Simulate loading data
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Handle date range change
  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 bg-white">
      {/* Report Header */}
      <div className="mb-8 border-b border-gray-200 pb-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">AccountX Company</h1>
            <h2 className="text-lg font-semibold text-gray-800">General Ledger Report</h2>
            <p className="text-sm text-gray-600">Detailed record of all financial transactions</p>
          </div>
        </div>
        
        {/* Report Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <div className="flex-1 max-w-xs">
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={dateRange.startDate}
              onChange={handleDateChange}
            />
          </div>
          
          <div className="flex-1 max-w-xs">
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={dateRange.endDate}
              onChange={handleDateChange}
            />
          </div>
          
          <div className="flex-1 max-w-xs">
            <label htmlFor="account" className="block text-sm font-medium text-gray-700 mb-1">Account</label>
            <select
              id="account"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={selectedAccount}
              onChange={(e) => setSelectedAccount(e.target.value)}
            >
              {accounts.map(account => (
                <option key={account.id} value={account.id}>{account.name}</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-end ml-auto gap-2">
            <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              <ArrowDownTrayIcon className="-ml-0.5 mr-2 h-4 w-4" aria-hidden="true" />
              Export PDF
            </button>
            <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              <DocumentTextIcon className="-ml-0.5 mr-2 h-4 w-4" aria-hidden="true" />
              Export Excel
            </button>
            <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              <PrinterIcon className="-ml-0.5 mr-2 h-4 w-4" aria-hidden="true" />
              Print
            </button>
          </div>
        </div>
      </div>
      
      {/* Report Content */}
      <div className="overflow-x-auto">
        {filteredLedger.map(account => {
          const summary = calculateAccountSummary(account);
          
          return (
            <div key={account.accountId} className="mb-8">
              <div className="bg-gray-100 p-4 border-b border-gray-300">
                <h3 className="text-lg font-bold text-gray-800">{account.accountId} - {account.accountName}</h3>
              </div>
              
              <div className="inline-block min-w-full align-middle">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead>
                    <tr className="bg-gray-50">
                      <th scope="col" className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Date</th>
                      <th scope="col" className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Description</th>
                      <th scope="col" className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Reference</th>
                      <th scope="col" className="py-3 px-4 text-right text-sm font-semibold text-gray-700">Debit</th>
                      <th scope="col" className="py-3 px-4 text-right text-sm font-semibold text-gray-700">Credit</th>
                      <th scope="col" className="py-3 px-4 text-right text-sm font-semibold text-gray-700">Balance</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {/* Opening Balance */}
                    <tr className="bg-gray-50">
                      <td className="py-2 px-4 text-sm text-gray-700">{dateRange.startDate}</td>
                      <td className="py-2 px-4 text-sm font-medium text-gray-700">Opening Balance</td>
                      <td className="py-2 px-4 text-sm text-gray-500">-</td>
                      <td className="py-2 px-4 text-right text-sm text-gray-500">-</td>
                      <td className="py-2 px-4 text-right text-sm text-gray-500">-</td>
                      <td className="py-2 px-4 text-right text-sm font-medium text-gray-700">₹{account.openingBalance.toLocaleString()}</td>
                    </tr>
                    
                    {/* Transactions */}
                    {account.transactions.map((transaction, index) => {
                      // Calculate running balance
                      const previousTransactions = account.transactions.slice(0, index);
                      const previousDebits = previousTransactions.reduce((sum, t) => sum + t.debit, 0);
                      const previousCredits = previousTransactions.reduce((sum, t) => sum + t.credit, 0);
                      const runningBalance = account.openingBalance + previousDebits - previousCredits + transaction.debit - transaction.credit;
                      
                      return (
                        <tr key={transaction.id} className="hover:bg-gray-50 transition duration-150">
                          <td className="py-2 px-4 text-sm text-gray-700">{transaction.date}</td>
                          <td className="py-2 px-4 text-sm text-gray-700">{transaction.description}</td>
                          <td className="py-2 px-4 text-sm text-gray-500">{transaction.reference}</td>
                          <td className="py-2 px-4 text-right text-sm text-gray-700">
                            {transaction.debit > 0 ? `₹${transaction.debit.toLocaleString()}` : '-'}
                          </td>
                          <td className="py-2 px-4 text-right text-sm text-gray-700">
                            {transaction.credit > 0 ? `₹${transaction.credit.toLocaleString()}` : '-'}
                          </td>
                          <td className="py-2 px-4 text-right text-sm font-medium text-gray-700">₹{runningBalance.toLocaleString()}</td>
                        </tr>
                      );
                    })}
                    
                    {/* Totals */}
                    <tr className="bg-blue-50 font-medium">
                      <td colSpan="3" className="py-3 px-4 text-sm text-blue-800">Total</td>
                      <td className="py-3 px-4 text-right text-sm text-blue-800">₹{summary.totalDebit.toLocaleString()}</td>
                      <td className="py-3 px-4 text-right text-sm text-blue-800">₹{summary.totalCredit.toLocaleString()}</td>
                      <td className="py-3 px-4 text-right text-sm text-blue-800">₹{summary.closingBalance.toLocaleString()}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Summary */}
      <div className="p-6 bg-gray-50 border-t border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {filteredLedger.map(account => {
            const summary = calculateAccountSummary(account);
            
            return (
              <div key={account.accountId} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <h4 className="font-medium text-gray-700 mb-2">{account.accountId} - {account.accountName}</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-gray-500">Opening Balance:</p>
                    <p className="font-medium">₹{account.openingBalance.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Closing Balance:</p>
                    <p className="font-medium">₹{summary.closingBalance.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Total Debits:</p>
                    <p className="font-medium">₹{summary.totalDebit.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Total Credits:</p>
                    <p className="font-medium">₹{summary.totalCredit.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Notes */}
      <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200 mx-6 mb-6">
        <p className="font-medium text-gray-700 mb-2">Notes:</p>
        <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
          <li>This general ledger report has been prepared in accordance with Generally Accepted Accounting Principles (GAAP).</li>
          <li>All amounts are in Indian Rupees (₹).</li>
          <li>The report covers the period from {new Date(dateRange.startDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} to {new Date(dateRange.endDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}.</li>
        </ul>
      </div>
    </div>
  );
};

export default GeneralLedgerReport;