import React, { useState, useEffect } from 'react';
import { PlusIcon, ArrowDownTrayIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { DocumentTextIcon } from '@heroicons/react/24/solid';

const CashBook = () => {
  const [transactions, setTransactions] = useState([
    { id: 1, date: '2024-01-15', description: 'Office Rent Payment', debit: 50000, credit: 0, balance: 50000 },
    { id: 2, date: '2024-01-16', description: 'Client Payment Received', debit: 0, credit: 75000, balance: -25000 },
    { id: 3, date: '2024-01-17', description: 'Utility Bill Payment', debit: 15000, credit: 0, balance: 40000 },
    { id: 4, date: '2024-01-18', description: 'Salary Payment', debit: 200000, credit: 0, balance: 240000 },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    account: 'all'
  });

  const [formData, setFormData] = useState({
    date: '',
    type: 'receipt',
    amount: '',
    description: ''
  });

  const accounts = ['Cash', 'Bank Account', 'Petty Cash'];

  const handleSubmit = (e) => {
    e.preventDefault();
    const newTransaction = {
      id: Date.now(),
      date: formData.date,
      description: formData.description,
      debit: formData.type === 'payment' ? parseFloat(formData.amount) : 0,
      credit: formData.type === 'receipt' ? parseFloat(formData.amount) : 0,
      balance: 0 // Calculate based on previous balance
    };
    setTransactions(prev => [...prev, newTransaction]);
    setShowForm(false);
    setFormData({ date: '', type: 'receipt', amount: '', description: '' });
  };

  const filteredTransactions = transactions.filter(transaction => {
    if (filters.dateFrom && transaction.date < filters.dateFrom) return false;
    if (filters.dateTo && transaction.date > filters.dateTo) return false;
    return true;
  });

  const calculateBalance = (transactions) => {
    let balance = 0;
    return transactions.map(transaction => {
      balance += transaction.credit - transaction.debit;
      return { ...transaction, balance };
    });
  };

  const transactionsWithBalance = calculateBalance(filteredTransactions);

  return (
    <div className="w-full px-4 py-6 bg-gray-50 rounded-lg">
      {/* Page Header */}
      <div className="mb-8 border-b border-gray-200 pb-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center">
            <div className="text-blue-600 mr-3">
              <DocumentTextIcon className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-800">
                Cash Book
              </h1>
              <p className="text-xs text-gray-500">Manage and track cash transactions</p>
            </div>
          </div>
          <div className="flex items-center">
            <span className="text-sm text-gray-600 mr-4">{new Date().toLocaleDateString('en-IN', {day: 'numeric', month: 'long', year: 'numeric'})}</span>
          </div>
        </div>
      </div>
      
      <div className="space-y-6">

      {/* Filter Section */}
      <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">Filters</h2>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="dateFrom" className="block text-sm font-medium text-gray-700 mb-1">Date From</label>
              <input
                type="date"
                id="dateFrom"
                value={filters.dateFrom}
                onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="dateTo" className="block text-sm font-medium text-gray-700 mb-1">Date To</label>
              <input
                type="date"
                id="dateTo"
                value={filters.dateTo}
                onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="account" className="block text-sm font-medium text-gray-700 mb-1">Account</label>
              <select
                id="account"
                value={filters.account}
                onChange={(e) => setFilters({...filters, account: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Accounts</option>
                {accounts.map(account => (
                  <option key={account} value={account}>{account}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="mt-4 flex justify-end space-x-3">
            <button
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              onClick={() => {
                setFilters({
                  dateFrom: '',
                  dateTo: '',
                  account: 'all'
                });
              }}
            >
              Clear Filters
            </button>
            <button
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="mb-6 flex flex-wrap justify-between items-center">
        <div className="flex space-x-3 mb-3 md:mb-0">
          <button 
            onClick={() => setShowForm(true)}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusIcon className="h-5 w-5 mr-2 inline" />
            New Transaction
          </button>
        </div>
        <div className="flex space-x-3">
          <button className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            <ArrowDownTrayIcon className="h-5 w-5 mr-2 inline" />
            Export
          </button>
          <button className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            Print
          </button>
        </div>
      </div>

      {/* Cash Book Table */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Debit (DR)
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Credit (CR)
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Balance
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactionsWithBalance.length > 0 ? (
                transactionsWithBalance.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(transaction.date).toLocaleDateString('en-IN')}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {transaction.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-red-600">
                      {transaction.debit > 0 ? `₹${transaction.debit.toLocaleString('en-IN')}` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-green-600">
                      {transaction.credit > 0 ? `₹${transaction.credit.toLocaleString('en-IN')}` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right">
                      <span className={transaction.balance >= 0 ? 'text-green-600' : 'text-red-600'}>
                        ₹{Math.abs(transaction.balance).toLocaleString('en-IN')}
                        <span className="text-xs ml-1">{transaction.balance >= 0 ? 'DR' : 'CR'}</span>
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                    No transactions found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Pagination */}
      {transactionsWithBalance.length > 0 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 rounded-lg shadow-sm mt-4">
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">1</span> to <span className="font-medium">{transactionsWithBalance.length}</span> of{' '}
                <span className="font-medium">{transactionsWithBalance.length}</span> results
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Add Transaction Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="relative mx-auto p-6 border w-full max-w-md shadow-xl rounded-lg bg-white">
            <div className="absolute top-0 right-0 pt-4 pr-4">
              <button
                onClick={() => {
                  setShowForm(false);
                  setFormData({ date: '', type: 'receipt', amount: '', description: '' });
                }}
                className="text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-5 text-center">
                Add New Transaction
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="transaction-date" className="block text-sm font-medium text-gray-700 mb-1">
                    Date
                  </label>
                  <input
                    id="transaction-date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Transaction Type
                  </label>
                  <div className="grid grid-cols-2 gap-3 mt-1">
                    <button
                      type="button"
                      className={`py-2 px-4 rounded-md text-sm font-medium ${formData.type === 'receipt' 
                        ? 'bg-green-100 text-green-800 border border-green-300' 
                        : 'bg-gray-100 text-gray-800 border border-gray-300 hover:bg-gray-200'}`}
                      onClick={() => setFormData({...formData, type: 'receipt'})}
                    >
                      Receipt (CR)
                    </button>
                    <button
                      type="button"
                      className={`py-2 px-4 rounded-md text-sm font-medium ${formData.type === 'payment' 
                        ? 'bg-red-100 text-red-800 border border-red-300' 
                        : 'bg-gray-100 text-gray-800 border border-gray-300 hover:bg-gray-200'}`}
                      onClick={() => setFormData({...formData, type: 'payment'})}
                    >
                      Payment (DR)
                    </button>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="transaction-amount" className="block text-sm font-medium text-gray-700 mb-1">
                    Amount (₹)
                  </label>
                  <div className="relative mt-1 rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">₹</span>
                    </div>
                    <input
                      id="transaction-amount"
                      type="number"
                      value={formData.amount}
                      onChange={(e) => setFormData({...formData, amount: e.target.value})}
                      className="block w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="transaction-description" className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    id="transaction-description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows={3}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter transaction details..."
                    required
                  />
                </div>
                
                <div className="pt-3 flex justify-center space-x-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setFormData({ date: '', type: 'receipt', amount: '', description: '' });
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Add Transaction
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  </div>
  );
};

export default CashBook;