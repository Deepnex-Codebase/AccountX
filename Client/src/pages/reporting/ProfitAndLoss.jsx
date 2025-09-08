import React, { useState, useEffect } from 'react';
import { ArrowDownTrayIcon, DocumentTextIcon, PrinterIcon } from '@heroicons/react/24/outline';

const ProfitAndLoss = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showComparison, setShowComparison] = useState(true);
  
  // Sample data for profit and loss statement
  const profitAndLossData = {
    asOfDate: new Date(),
    previousPeriod: {
      asOfDate: new Date(new Date().setFullYear(new Date().getFullYear() - 1)),
      totalRevenue: 1850000,
      totalExpenses: 1450000,
      netProfit: 400000
    },
    revenue: [
      { id: 1, code: '4100', name: 'Sales Revenue', amount: 1800000 },
      { id: 2, code: '4200', name: 'Service Revenue', amount: 250000 },
      { id: 3, code: '4300', name: 'Interest Income', amount: 15000 },
      { id: 4, code: '4400', name: 'Rental Income', amount: 60000 },
      { id: 5, code: '4500', name: 'Other Income', amount: 25000 }
    ],
    expenses: [
      { id: 1, code: '5100', name: 'Cost of Goods Sold', amount: 950000 },
      { id: 2, code: '5200', name: 'Salaries and Wages', amount: 450000 },
      { id: 3, code: '5300', name: 'Rent Expense', amount: 120000 },
      { id: 4, code: '5400', name: 'Utilities', amount: 75000 },
      { id: 5, code: '5500', name: 'Advertising and Marketing', amount: 85000 },
      { id: 6, code: '5600', name: 'Office Supplies', amount: 35000 },
      { id: 7, code: '5700', name: 'Insurance', amount: 45000 },
      { id: 8, code: '5800', name: 'Depreciation', amount: 65000 },
      { id: 9, code: '5900', name: 'Interest Expense', amount: 25000 },
      { id: 10, code: '6000', name: 'Other Expenses', amount: 30000 }
    ]
  };
  
  // Calculate totals
  const calculateTotals = () => {
    const totalRevenue = profitAndLossData.revenue.reduce((sum, item) => sum + item.amount, 0);
    const totalExpenses = profitAndLossData.expenses.reduce((sum, item) => sum + item.amount, 0);
    const netProfit = totalRevenue - totalExpenses;
    
    return {
      totalRevenue,
      totalExpenses,
      netProfit
    };
  };
  
  const totals = calculateTotals();
  
  // Simulate loading data
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* Report Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">AccountX Company</h1>
            <h2 className="text-lg font-semibold text-gray-800">Profit & Loss Statement</h2>
            <p className="text-sm text-gray-600">Financial performance for the selected period</p>
          </div>
        </div>
        
        {/* Report Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <div className="flex-1 max-w-xs">
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">As of Date</label>
            <input
              type="date"
              id="date"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
          
          <div className="flex items-end">
            <div className="flex items-center">
              <input
                id="comparison"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                checked={showComparison}
                onChange={(e) => setShowComparison(e.target.checked)}
              />
              <label htmlFor="comparison" className="ml-2 block text-sm text-gray-700">
                Show Previous Year Comparison
              </label>
            </div>
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
        <div className="inline-block min-w-full align-middle">
          <table className="min-w-full divide-y divide-gray-300">
            <thead>
              <tr>
                <th scope="col" className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Account</th>
                <th scope="col" className="py-3 px-4 text-right text-sm font-semibold text-gray-700">{new Date(selectedDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</th>
                {showComparison && (
                  <>
                    <th scope="col" className="py-3 px-4 text-right text-sm font-semibold text-gray-700">{new Date(profitAndLossData.previousPeriod.asOfDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</th>
                    <th scope="col" className="py-3 px-4 text-right text-sm font-semibold text-gray-700">% Change</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {/* Revenue Section */}
              <tr className="bg-gray-100">
                <td colSpan={showComparison ? 4 : 2} className="py-3 px-4 font-bold text-lg text-gray-800">Revenue</td>
              </tr>
              
              {profitAndLossData.revenue.map((item) => (
                <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50 transition duration-150">
                  <td className="py-2 px-8 text-sm text-gray-700">{item.name}</td>
                  <td className="py-2 px-4 text-right text-sm font-medium text-gray-800">₹{item.amount.toLocaleString()}</td>
                  {showComparison && (
                    <>
                      <td className="py-2 px-4 text-right text-sm text-gray-600">₹{(item.amount * 0.9).toFixed(0).toLocaleString()}</td>
                      <td className="py-2 px-4 text-right text-sm font-medium text-green-600">+10%</td>
                    </>
                  )}
                </tr>
              ))}
              
              {/* Total Revenue */}
              <tr className="border-t-2 border-gray-200 font-bold bg-blue-50">
                <td className="py-3 px-4 text-blue-800">TOTAL REVENUE</td>
                <td className="py-3 px-4 text-right text-blue-800">₹{totals.totalRevenue.toLocaleString()}</td>
                {showComparison && (
                  <>
                    <td className="py-3 px-4 text-right text-blue-700">₹{profitAndLossData.previousPeriod.totalRevenue.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right text-green-600">
                      +{(((totals.totalRevenue - profitAndLossData.previousPeriod.totalRevenue) / profitAndLossData.previousPeriod.totalRevenue) * 100).toFixed(1)}%
                    </td>
                  </>
                )}
              </tr>
              
              {/* Expenses Section */}
              <tr className="bg-gray-100">
                <td colSpan={showComparison ? 4 : 2} className="py-3 px-4 font-bold text-lg text-gray-800">Expenses</td>
              </tr>
              
              {profitAndLossData.expenses.map((item) => (
                <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50 transition duration-150">
                  <td className="py-2 px-8 text-sm text-gray-700">{item.name}</td>
                  <td className="py-2 px-4 text-right text-sm font-medium text-gray-800">₹{item.amount.toLocaleString()}</td>
                  {showComparison && (
                    <>
                      <td className="py-2 px-4 text-right text-sm text-gray-600">₹{(item.amount * 0.95).toFixed(0).toLocaleString()}</td>
                      <td className="py-2 px-4 text-right text-sm font-medium text-red-600">+5%</td>
                    </>
                  )}
                </tr>
              ))}
              
              {/* Total Expenses */}
              <tr className="border-t-2 border-gray-200 font-bold bg-blue-50">
                <td className="py-3 px-4 text-blue-800">TOTAL EXPENSES</td>
                <td className="py-3 px-4 text-right text-blue-800">₹{totals.totalExpenses.toLocaleString()}</td>
                {showComparison && (
                  <>
                    <td className="py-3 px-4 text-right text-blue-700">₹{profitAndLossData.previousPeriod.totalExpenses.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right text-red-600">
                      +{(((totals.totalExpenses - profitAndLossData.previousPeriod.totalExpenses) / profitAndLossData.previousPeriod.totalExpenses) * 100).toFixed(1)}%
                    </td>
                  </>
                )}
              </tr>
              
              {/* Net Profit */}
              <tr className="border-t-2 border-b-2 border-gray-300 font-bold bg-green-50">
                <td className="py-3 px-4 text-green-800">NET PROFIT</td>
                <td className="py-3 px-4 text-right text-green-800">₹{totals.netProfit.toLocaleString()}</td>
                {showComparison && (
                  <>
                    <td className="py-3 px-4 text-right text-green-700">₹{profitAndLossData.previousPeriod.netProfit.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right text-green-600">
                      +{(((totals.netProfit - profitAndLossData.previousPeriod.netProfit) / profitAndLossData.previousPeriod.netProfit) * 100).toFixed(1)}%
                    </td>
                  </>
                )}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Notes */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <p className="font-medium text-gray-700 mb-2">Notes:</p>
        <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
          <li>This profit and loss statement has been prepared in accordance with Generally Accepted Accounting Principles (GAAP).</li>
          <li>All amounts are in Indian Rupees (₹).</li>
          <li>Comparative figures for the period ending {new Date(profitAndLossData.previousPeriod.asOfDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}.</li>
        </ul>
      </div>
    </div>
  );
};

export default ProfitAndLoss;