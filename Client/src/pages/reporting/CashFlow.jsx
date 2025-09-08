import React, { useState, useEffect } from 'react';
import { ArrowDownTrayIcon, DocumentTextIcon, PrinterIcon } from '@heroicons/react/24/outline';

const CashFlow = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showComparison, setShowComparison] = useState(true);
  
  // Sample data for cash flow statement
  const cashFlowData = {
    asOfDate: new Date(),
    previousPeriod: {
      asOfDate: new Date(new Date().setFullYear(new Date().getFullYear() - 1)),
      totalOperatingActivities: 520000,
      totalInvestingActivities: -350000,
      totalFinancingActivities: -80000,
      netCashFlow: 90000,
      beginningCashBalance: 250000,
      endingCashBalance: 340000
    },
    operatingActivities: [
      { id: 1, name: 'Net Income', amount: 400000 },
      { id: 2, name: 'Depreciation and Amortization', amount: 65000 },
      { id: 3, name: 'Increase in Accounts Receivable', amount: -45000 },
      { id: 4, name: 'Decrease in Inventory', amount: 35000 },
      { id: 5, name: 'Increase in Accounts Payable', amount: 25000 },
      { id: 6, name: 'Decrease in Accrued Expenses', amount: -15000 },
      { id: 7, name: 'Other Operating Activities', amount: 10000 }
    ],
    investingActivities: [
      { id: 1, name: 'Purchase of Property and Equipment', amount: -250000 },
      { id: 2, name: 'Sale of Investments', amount: 75000 },
      { id: 3, name: 'Purchase of Investments', amount: -150000 },
      { id: 4, name: 'Other Investing Activities', amount: -25000 }
    ],
    financingActivities: [
      { id: 1, name: 'Proceeds from Long-term Debt', amount: 200000 },
      { id: 2, name: 'Repayment of Long-term Debt', amount: -150000 },
      { id: 3, name: 'Dividends Paid', amount: -100000 },
      { id: 4, name: 'Repurchase of Common Stock', amount: -50000 },
      { id: 5, name: 'Other Financing Activities', amount: 20000 }
    ],
    beginningCashBalance: 300000
  };
  
  // Calculate totals
  const calculateTotals = () => {
    const totalOperatingActivities = cashFlowData.operatingActivities.reduce((sum, item) => sum + item.amount, 0);
    const totalInvestingActivities = cashFlowData.investingActivities.reduce((sum, item) => sum + item.amount, 0);
    const totalFinancingActivities = cashFlowData.financingActivities.reduce((sum, item) => sum + item.amount, 0);
    const netCashFlow = totalOperatingActivities + totalInvestingActivities + totalFinancingActivities;
    const endingCashBalance = cashFlowData.beginningCashBalance + netCashFlow;
    
    return {
      totalOperatingActivities,
      totalInvestingActivities,
      totalFinancingActivities,
      netCashFlow,
      beginningCashBalance: cashFlowData.beginningCashBalance,
      endingCashBalance
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
    <div className="max-w-7xl mx-auto px-4 py-6 bg-white">
      {/* Report Header */}
      <div className="mb-8 border-b border-gray-200 pb-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">AccountX Company</h1>
            <h2 className="text-lg font-semibold text-gray-800">Cash Flow Statement</h2>
            <p className="text-sm text-gray-600">Cash inflows and outflows for the selected period</p>
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
                <th scope="col" className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Description</th>
                <th scope="col" className="py-3 px-4 text-right text-sm font-semibold text-gray-700">{new Date(selectedDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</th>
                {showComparison && (
                  <>
                    <th scope="col" className="py-3 px-4 text-right text-sm font-semibold text-gray-700">{new Date(cashFlowData.previousPeriod.asOfDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</th>
                    <th scope="col" className="py-3 px-4 text-right text-sm font-semibold text-gray-700">% Change</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {/* Operating Activities Section */}
              <tr className="bg-gray-100">
                <td colSpan={showComparison ? 4 : 2} className="py-3 px-4 font-bold text-lg text-gray-800">Cash Flows from Operating Activities</td>
              </tr>
              
              {cashFlowData.operatingActivities.map((item) => (
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
              
              {/* Total Operating Activities */}
              <tr className="border-t-2 border-gray-200 font-bold bg-blue-50">
                <td className="py-3 px-4 text-blue-800">Net Cash from Operating Activities</td>
                <td className="py-3 px-4 text-right text-blue-800">₹{totals.totalOperatingActivities.toLocaleString()}</td>
                {showComparison && (
                  <>
                    <td className="py-3 px-4 text-right text-blue-700">₹{cashFlowData.previousPeriod.totalOperatingActivities.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right text-green-600">
                      +{(((totals.totalOperatingActivities - cashFlowData.previousPeriod.totalOperatingActivities) / cashFlowData.previousPeriod.totalOperatingActivities) * 100).toFixed(1)}%
                    </td>
                  </>
                )}
              </tr>
              
              {/* Investing Activities Section */}
              <tr className="bg-gray-100">
                <td colSpan={showComparison ? 4 : 2} className="py-3 px-4 font-bold text-lg text-gray-800">Cash Flows from Investing Activities</td>
              </tr>
              
              {cashFlowData.investingActivities.map((item) => (
                <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50 transition duration-150">
                  <td className="py-2 px-8 text-sm text-gray-700">{item.name}</td>
                  <td className="py-2 px-4 text-right text-sm font-medium text-gray-800">₹{item.amount.toLocaleString()}</td>
                  {showComparison && (
                    <>
                      <td className="py-2 px-4 text-right text-sm text-gray-600">₹{(item.amount * 0.95).toFixed(0).toLocaleString()}</td>
                      <td className="py-2 px-4 text-right text-sm font-medium text-red-600">{item.amount < 0 ? '-5%' : '+5%'}</td>
                    </>
                  )}
                </tr>
              ))}
              
              {/* Total Investing Activities */}
              <tr className="border-t-2 border-gray-200 font-bold bg-blue-50">
                <td className="py-3 px-4 text-blue-800">Net Cash from Investing Activities</td>
                <td className="py-3 px-4 text-right text-blue-800">₹{totals.totalInvestingActivities.toLocaleString()}</td>
                {showComparison && (
                  <>
                    <td className="py-3 px-4 text-right text-blue-700">₹{cashFlowData.previousPeriod.totalInvestingActivities.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right text-red-600">
                      {(((totals.totalInvestingActivities - cashFlowData.previousPeriod.totalInvestingActivities) / Math.abs(cashFlowData.previousPeriod.totalInvestingActivities)) * 100).toFixed(1)}%
                    </td>
                  </>
                )}
              </tr>
              
              {/* Financing Activities Section */}
              <tr className="bg-gray-100">
                <td colSpan={showComparison ? 4 : 2} className="py-3 px-4 font-bold text-lg text-gray-800">Cash Flows from Financing Activities</td>
              </tr>
              
              {cashFlowData.financingActivities.map((item) => (
                <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50 transition duration-150">
                  <td className="py-2 px-8 text-sm text-gray-700">{item.name}</td>
                  <td className="py-2 px-4 text-right text-sm font-medium text-gray-800">₹{item.amount.toLocaleString()}</td>
                  {showComparison && (
                    <>
                      <td className="py-2 px-4 text-right text-sm text-gray-600">₹{(item.amount * 0.95).toFixed(0).toLocaleString()}</td>
                      <td className="py-2 px-4 text-right text-sm font-medium text-red-600">{item.amount < 0 ? '-5%' : '+5%'}</td>
                    </>
                  )}
                </tr>
              ))}
              
              {/* Total Financing Activities */}
              <tr className="border-t-2 border-gray-200 font-bold bg-blue-50">
                <td className="py-3 px-4 text-blue-800">Net Cash from Financing Activities</td>
                <td className="py-3 px-4 text-right text-blue-800">₹{totals.totalFinancingActivities.toLocaleString()}</td>
                {showComparison && (
                  <>
                    <td className="py-3 px-4 text-right text-blue-700">₹{cashFlowData.previousPeriod.totalFinancingActivities.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right text-red-600">
                      {(((totals.totalFinancingActivities - cashFlowData.previousPeriod.totalFinancingActivities) / Math.abs(cashFlowData.previousPeriod.totalFinancingActivities)) * 100).toFixed(1)}%
                    </td>
                  </>
                )}
              </tr>
              
              {/* Net Increase/Decrease in Cash */}
              <tr className="border-t-2 border-gray-300 font-bold bg-blue-50">
                <td className="py-3 px-4 text-blue-800">Net Increase (Decrease) in Cash</td>
                <td className="py-3 px-4 text-right text-blue-800">₹{totals.netCashFlow.toLocaleString()}</td>
                {showComparison && (
                  <>
                    <td className="py-3 px-4 text-right text-blue-700">₹{cashFlowData.previousPeriod.netCashFlow.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right text-green-600">
                      +{(((totals.netCashFlow - cashFlowData.previousPeriod.netCashFlow) / cashFlowData.previousPeriod.netCashFlow) * 100).toFixed(1)}%
                    </td>
                  </>
                )}
              </tr>
              
              {/* Beginning Cash Balance */}
              <tr className="border-b border-gray-100">
                <td className="py-2 px-4 text-sm font-medium text-gray-700">Cash at Beginning of Period</td>
                <td className="py-2 px-4 text-right text-sm font-medium text-gray-800">₹{totals.beginningCashBalance.toLocaleString()}</td>
                {showComparison && (
                  <>
                    <td className="py-2 px-4 text-right text-sm text-gray-600">₹{cashFlowData.previousPeriod.beginningCashBalance.toLocaleString()}</td>
                    <td className="py-2 px-4 text-right text-sm font-medium text-green-600">
                      +{(((totals.beginningCashBalance - cashFlowData.previousPeriod.beginningCashBalance) / cashFlowData.previousPeriod.beginningCashBalance) * 100).toFixed(1)}%
                    </td>
                  </>
                )}
              </tr>
              
              {/* Ending Cash Balance */}
              <tr className="border-t-2 border-b-2 border-gray-300 font-bold bg-green-50">
                <td className="py-3 px-4 text-green-800">Cash at End of Period</td>
                <td className="py-3 px-4 text-right text-green-800">₹{totals.endingCashBalance.toLocaleString()}</td>
                {showComparison && (
                  <>
                    <td className="py-3 px-4 text-right text-green-700">₹{cashFlowData.previousPeriod.endingCashBalance.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right text-green-600">
                      +{(((totals.endingCashBalance - cashFlowData.previousPeriod.endingCashBalance) / cashFlowData.previousPeriod.endingCashBalance) * 100).toFixed(1)}%
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
          <li>This cash flow statement has been prepared in accordance with Generally Accepted Accounting Principles (GAAP).</li>
          <li>All amounts are in Indian Rupees (₹).</li>
          <li>Comparative figures for the period ending {new Date(cashFlowData.previousPeriod.asOfDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}.</li>
        </ul>
      </div>
    </div>
  );
};

export default CashFlow;