import { useState, useEffect } from 'react';
import { ArrowDownTrayIcon, DocumentTextIcon, PrinterIcon } from '@heroicons/react/24/outline';

// Sample data for balance sheet
const sampleBalanceSheetData = {
  asOfDate: '2023-11-30',
  assets: {
    currentAssets: [
      { id: 1, code: '1000', name: 'Cash', amount: 350000 },
      { id: 2, code: '1100', name: 'Bank Account', amount: 725000 },
      { id: 3, code: '1200', name: 'Accounts Receivable', amount: 175000 },
      { id: 4, code: '1300', name: 'Inventory', amount: 250000 },
    ],
    fixedAssets: [
      { id: 5, code: '1500', name: 'Office Equipment', amount: 320000 },
      { id: 6, code: '1510', name: 'Accumulated Depreciation - Equipment', amount: -80000 },
      { id: 7, code: '1600', name: 'Vehicles', amount: 450000 },
      { id: 8, code: '1610', name: 'Accumulated Depreciation - Vehicles', amount: -120000 },
    ],
    otherAssets: [
      { id: 9, code: '1800', name: 'Prepaid Expenses', amount: 45000 },
      { id: 10, code: '1900', name: 'Security Deposits', amount: 35000 },
    ]
  },
  liabilities: {
    currentLiabilities: [
      { id: 11, code: '2000', name: 'Accounts Payable', amount: 85000 },
      { id: 12, code: '2100', name: 'Accrued Expenses', amount: 35000 },
      { id: 13, code: '2200', name: 'Wages Payable', amount: 45000 },
      { id: 14, code: '2300', name: 'Interest Payable', amount: 5000 },
    ],
    longTermLiabilities: [
      { id: 15, code: '2500', name: 'Long-term Loan', amount: 280000 },
    ]
  },
  equity: [
    { id: 16, code: '3000', name: 'Owner\'s Equity', amount: 800000 },
    { id: 17, code: '3100', name: 'Retained Earnings', amount: 170000 },
    { id: 18, code: '3900', name: 'Current Year Earnings', amount: 155000 },
  ],
  previousPeriod: {
    asOfDate: '2022-11-30',
    totalAssets: 1950000,
    totalLiabilities: 400000,
    totalEquity: 1550000
  }
};

const BalanceSheet = () => {
  const [balanceSheetData, setBalanceSheetData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState('2023-11-30');
  const [showComparison, setShowComparison] = useState(false);
  
  // Simulate data loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setBalanceSheetData(sampleBalanceSheetData);
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Calculate totals
  const calculateTotals = (data) => {
    if (!data) return {};
    
    const totalCurrentAssets = data.assets.currentAssets.reduce((sum, item) => sum + item.amount, 0);
    const totalFixedAssets = data.assets.fixedAssets.reduce((sum, item) => sum + item.amount, 0);
    const totalOtherAssets = data.assets.otherAssets.reduce((sum, item) => sum + item.amount, 0);
    const totalAssets = totalCurrentAssets + totalFixedAssets + totalOtherAssets;
    
    const totalCurrentLiabilities = data.liabilities.currentLiabilities.reduce((sum, item) => sum + item.amount, 0);
    const totalLongTermLiabilities = data.liabilities.longTermLiabilities.reduce((sum, item) => sum + item.amount, 0);
    const totalLiabilities = totalCurrentLiabilities + totalLongTermLiabilities;
    
    const totalEquity = data.equity.reduce((sum, item) => sum + item.amount, 0);
    
    return {
      totalCurrentAssets,
      totalFixedAssets,
      totalOtherAssets,
      totalAssets,
      totalCurrentLiabilities,
      totalLongTermLiabilities,
      totalLiabilities,
      totalEquity,
      totalLiabilitiesAndEquity: totalLiabilities + totalEquity
    };
  };
  
  const totals = calculateTotals(balanceSheetData);
  
  // Loading state
  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" role="status">
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Page Header */}
      <div className="mb-8 border-b border-gray-200 pb-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center">
            <div className="text-blue-600 mr-3">
              <DocumentTextIcon className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-800">
                Balance Sheet
              </h1>
              <p className="text-xs text-gray-500">Financial position statement showing assets, liabilities, and equity</p>
            </div>
          </div>
          <div className="flex items-center">
            <span className="text-sm text-gray-600 mr-4">{new Date().toLocaleDateString('en-IN', {day: 'numeric', month: 'long', year: 'numeric'})}</span>
          </div>
        </div>
      </div>
      
      {/* Report Controls */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div>
              <label htmlFor="date-select" className="block text-xs font-medium text-gray-500 mb-1">As of Date</label>
              <select 
                id="date-select"
                className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              >
                <option value="2023-11-30">November 30, 2023</option>
                <option value="2023-10-31">October 31, 2023</option>
                <option value="2023-09-30">September 30, 2023</option>
              </select>
            </div>
            
            <div className="flex items-end">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  checked={showComparison}
                  onChange={(e) => setShowComparison(e.target.checked)}
                />
                <span className="ml-2 text-sm text-gray-700">Show Comparison with Previous Year</span>
              </label>
            </div>
          </div>
          
          <div className="flex items-end gap-2">
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500">
              <ArrowDownTrayIcon className="-ml-1 mr-2 h-5 w-5 text-gray-500" />
              Export PDF
            </button>
            
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500">
              <ArrowDownTrayIcon className="-ml-1 mr-2 h-5 w-5 text-gray-500" />
              Export Excel
            </button>
            
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500">
              <PrinterIcon className="-ml-1 mr-2 h-5 w-5 text-gray-500" />
              Print
            </button>
          </div>
        </div>
      </div>
      
      {/* Report Header */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">AccountX Company</h2>
        <h3 className="text-xl font-semibold mt-1 text-gray-700">Balance Sheet</h3>
        <p className="text-gray-600">As of {new Date(selectedDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
      </div>
      
      {/* Balance Sheet Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b-2 border-gray-200">
                <th className="py-3 px-4 text-left font-semibold text-gray-700">Account</th>
                <th className="py-3 px-4 text-right font-semibold text-gray-700">{new Date(selectedDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</th>
                {showComparison && (
                  <>
                    <th className="py-3 px-4 text-right font-semibold text-gray-700">{new Date(balanceSheetData.previousPeriod.asOfDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</th>
                    <th className="py-3 px-4 text-right font-semibold text-gray-700">% Change</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {/* Assets Section */}
              <tr className="bg-gray-100">
                <td colSpan={showComparison ? 4 : 2} className="py-3 px-4 font-bold text-lg text-gray-800">Assets</td>
              </tr>
              
              {/* Current Assets */}
              <tr className="bg-gray-50">
                <td colSpan={showComparison ? 4 : 2} className="py-2 px-4 font-semibold text-gray-700">Current Assets</td>
              </tr>
              
              {balanceSheetData.assets.currentAssets.map((asset) => (
                <tr key={asset.id} className="border-b border-gray-100 hover:bg-gray-50 transition duration-150">
                  <td className="py-2 px-8 text-sm text-gray-700">{asset.name}</td>
                  <td className="py-2 px-4 text-right text-sm font-medium text-gray-800">₹{asset.amount.toLocaleString()}</td>
                  {showComparison && (
                    <>
                      <td className="py-2 px-4 text-right text-sm text-gray-600">₹{(asset.amount * 0.9).toFixed(0).toLocaleString()}</td>
                      <td className="py-2 px-4 text-right text-sm font-medium text-green-600">+10%</td>
                    </>
                  )}
                </tr>
              ))}
              
              <tr className="border-t border-gray-200 font-medium bg-gray-50">
                <td className="py-2 px-4 text-gray-800">Total Current Assets</td>
                <td className="py-2 px-4 text-right font-semibold text-gray-800">₹{totals.totalCurrentAssets.toLocaleString()}</td>
                {showComparison && (
                  <>
                    <td className="py-2 px-4 text-right text-gray-700">₹{(totals.totalCurrentAssets * 0.9).toFixed(0).toLocaleString()}</td>
                    <td className="py-2 px-4 text-right font-medium text-green-600">+10%</td>
                  </>
                )}
              </tr>
              
              {/* Fixed Assets */}
              <tr className="bg-gray-50">
                <td colSpan={showComparison ? 4 : 2} className="py-2 px-4 font-semibold text-gray-700">Fixed Assets</td>
              </tr>
              
              {balanceSheetData.assets.fixedAssets.map((asset) => (
                <tr key={asset.id} className="border-b border-gray-100 hover:bg-gray-50 transition duration-150">
                  <td className="py-2 px-8 text-sm text-gray-700">{asset.name}</td>
                  <td className="py-2 px-4 text-right text-sm font-medium text-gray-800">₹{asset.amount.toLocaleString()}</td>
                  {showComparison && (
                    <>
                      <td className="py-2 px-4 text-right text-sm text-gray-600">₹{(asset.amount * 0.95).toFixed(0).toLocaleString()}</td>
                      <td className="py-2 px-4 text-right text-sm font-medium text-green-600">+5%</td>
                    </>
                  )}
                </tr>
              ))}
              
              <tr className="border-t border-gray-200 font-medium bg-gray-50">
                <td className="py-2 px-4 text-gray-800">Total Fixed Assets</td>
                <td className="py-2 px-4 text-right font-semibold text-gray-800">₹{totals.totalFixedAssets.toLocaleString()}</td>
                {showComparison && (
                  <>
                    <td className="py-2 px-4 text-right text-gray-700">₹{(totals.totalFixedAssets * 0.95).toFixed(0).toLocaleString()}</td>
                    <td className="py-2 px-4 text-right font-medium text-green-600">+5%</td>
                  </>
                )}
              </tr>
              
              {/* Other Assets */}
              <tr className="bg-gray-50">
                <td colSpan={showComparison ? 4 : 2} className="py-2 px-4 font-semibold text-gray-700">Other Assets</td>
              </tr>
              
              {balanceSheetData.assets.otherAssets.map((asset) => (
                <tr key={asset.id} className="border-b border-gray-100 hover:bg-gray-50 transition duration-150">
                  <td className="py-2 px-8 text-sm text-gray-700">{asset.name}</td>
                  <td className="py-2 px-4 text-right text-sm font-medium text-gray-800">₹{asset.amount.toLocaleString()}</td>
                  {showComparison && (
                    <>
                      <td className="py-2 px-4 text-right text-sm text-gray-600">₹{(asset.amount * 0.85).toFixed(0).toLocaleString()}</td>
                      <td className="py-2 px-4 text-right text-sm font-medium text-green-600">+15%</td>
                    </>
                  )}
                </tr>
              ))}
              
              <tr className="border-t border-gray-200 font-medium bg-gray-50">
                <td className="py-2 px-4 text-gray-800">Total Other Assets</td>
                <td className="py-2 px-4 text-right font-semibold text-gray-800">₹{totals.totalOtherAssets.toLocaleString()}</td>
                {showComparison && (
                  <>
                    <td className="py-2 px-4 text-right text-gray-700">₹{(totals.totalOtherAssets * 0.85).toFixed(0).toLocaleString()}</td>
                    <td className="py-2 px-4 text-right font-medium text-green-600">+15%</td>
                  </>
                )}
              </tr>
              
              {/* Total Assets */}
              <tr className="border-t-2 border-b-2 border-gray-200 font-bold bg-blue-50">
                <td className="py-3 px-4 text-blue-800">TOTAL ASSETS</td>
                <td className="py-3 px-4 text-right text-blue-800">₹{totals.totalAssets.toLocaleString()}</td>
                {showComparison && (
                  <>
                    <td className="py-3 px-4 text-right text-blue-700">₹{balanceSheetData.previousPeriod.totalAssets.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right text-green-600">
                      +{(((totals.totalAssets - balanceSheetData.previousPeriod.totalAssets) / balanceSheetData.previousPeriod.totalAssets) * 100).toFixed(1)}%
                    </td>
                  </>
                )}
              </tr>
              
              {/* Liabilities Section */}
              <tr className="bg-gray-100">
                <td colSpan={showComparison ? 4 : 2} className="py-3 px-4 font-bold text-lg text-gray-800">Liabilities</td>
              </tr>
              
              {/* Current Liabilities */}
              <tr className="bg-gray-50">
                <td colSpan={showComparison ? 4 : 2} className="py-2 px-4 font-semibold text-gray-700">Current Liabilities</td>
              </tr>
              
              {balanceSheetData.liabilities.currentLiabilities.map((liability) => (
                <tr key={liability.id} className="border-b border-gray-100 hover:bg-gray-50 transition duration-150">
                  <td className="py-2 px-8 text-sm text-gray-700">{liability.name}</td>
                  <td className="py-2 px-4 text-right text-sm font-medium text-gray-800">₹{liability.amount.toLocaleString()}</td>
                  {showComparison && (
                    <>
                      <td className="py-2 px-4 text-right text-sm text-gray-600">₹{(liability.amount * 0.92).toFixed(0).toLocaleString()}</td>
                      <td className="py-2 px-4 text-right text-sm font-medium text-green-600">+8%</td>
                    </>
                  )}
                </tr>
              ))}
              
              <tr className="border-t border-gray-200 font-medium bg-gray-50">
                <td className="py-2 px-4 text-gray-800">Total Current Liabilities</td>
                <td className="py-2 px-4 text-right font-semibold text-gray-800">₹{totals.totalCurrentLiabilities.toLocaleString()}</td>
                {showComparison && (
                  <>
                    <td className="py-2 px-4 text-right text-gray-700">₹{(totals.totalCurrentLiabilities * 0.92).toFixed(0).toLocaleString()}</td>
                    <td className="py-2 px-4 text-right font-medium text-green-600">+8%</td>
                  </>
                )}
              </tr>
              
              {/* Long-term Liabilities */}
              <tr className="bg-gray-50">
                <td colSpan={showComparison ? 4 : 2} className="py-2 px-4 font-semibold text-gray-700">Long-term Liabilities</td>
              </tr>
              
              {balanceSheetData.liabilities.longTermLiabilities.map((liability) => (
                <tr key={liability.id} className="border-b border-gray-100 hover:bg-gray-50 transition duration-150">
                  <td className="py-2 px-8 text-sm text-gray-700">{liability.name}</td>
                  <td className="py-2 px-4 text-right text-sm font-medium text-gray-800">₹{liability.amount.toLocaleString()}</td>
                  {showComparison && (
                    <>
                      <td className="py-2 px-4 text-right text-sm text-gray-600">₹{(liability.amount * 1.05).toFixed(0).toLocaleString()}</td>
                      <td className="py-2 px-4 text-right text-sm font-medium text-green-600">-5%</td>
                    </>
                  )}
                </tr>
              ))}
              
              <tr className="border-t border-gray-200 font-medium bg-gray-50">
                <td className="py-2 px-4 text-gray-800">Total Long-term Liabilities</td>
                <td className="py-2 px-4 text-right font-semibold text-gray-800">₹{totals.totalLongTermLiabilities.toLocaleString()}</td>
                {showComparison && (
                  <>
                    <td className="py-2 px-4 text-right text-gray-700">₹{(totals.totalLongTermLiabilities * 1.05).toFixed(0).toLocaleString()}</td>
                    <td className="py-2 px-4 text-right font-medium text-green-600">-5%</td>
                  </>
                )}
              </tr>
              
              {/* Total Liabilities */}
              <tr className="border-t-2 border-gray-200 font-bold bg-blue-50">
                <td className="py-3 px-4 text-blue-800">TOTAL LIABILITIES</td>
                <td className="py-3 px-4 text-right text-blue-800">₹{totals.totalLiabilities.toLocaleString()}</td>
                {showComparison && (
                  <>
                    <td className="py-3 px-4 text-right text-blue-700">₹{balanceSheetData.previousPeriod.totalLiabilities.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right text-green-600">
                      +{(((totals.totalLiabilities - balanceSheetData.previousPeriod.totalLiabilities) / balanceSheetData.previousPeriod.totalLiabilities) * 100).toFixed(1)}%
                    </td>
                  </>
                )}
              </tr>
              
              {/* Equity Section */}
              <tr className="bg-gray-100">
                <td colSpan={showComparison ? 4 : 2} className="py-3 px-4 font-bold text-lg text-gray-800">Equity</td>
              </tr>
              
              {balanceSheetData.equity.map((item) => (
                <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50 transition duration-150">
                  <td className="py-2 px-8 text-sm text-gray-700">{item.name}</td>
                  <td className="py-2 px-4 text-right text-sm font-medium text-gray-800">₹{item.amount.toLocaleString()}</td>
                  {showComparison && (
                    <>
                      <td className="py-2 px-4 text-right text-sm text-gray-600">₹{(item.code === '3900' ? item.amount * 0.7 : item.amount * 0.85).toFixed(0).toLocaleString()}</td>
                      <td className="py-2 px-4 text-right text-sm font-medium text-green-600">+{item.code === '3900' ? '30' : '15'}%</td>
                    </>
                  )}
                </tr>
              ))}
              
              {/* Total Equity */}
              <tr className="border-t-2 border-gray-200 font-bold bg-blue-50">
                <td className="py-3 px-4 text-blue-800">TOTAL EQUITY</td>
                <td className="py-3 px-4 text-right text-blue-800">₹{totals.totalEquity.toLocaleString()}</td>
                {showComparison && (
                  <>
                    <td className="py-3 px-4 text-right text-blue-700">₹{balanceSheetData.previousPeriod.totalEquity.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right text-green-600">
                      +{(((totals.totalEquity - balanceSheetData.previousPeriod.totalEquity) / balanceSheetData.previousPeriod.totalEquity) * 100).toFixed(1)}%
                    </td>
                  </>
                )}
              </tr>
              
              {/* Total Liabilities and Equity */}
              <tr className="border-t-2 border-b-2 border-gray-300 font-bold bg-blue-50">
                <td className="py-3 px-4 text-blue-800">TOTAL LIABILITIES AND EQUITY</td>
                <td className="py-3 px-4 text-right text-blue-800">₹{totals.totalLiabilitiesAndEquity.toLocaleString()}</td>
                {showComparison && (
                  <>
                    <td className="py-3 px-4 text-right text-blue-700">₹{(balanceSheetData.previousPeriod.totalLiabilities + balanceSheetData.previousPeriod.totalEquity).toLocaleString()}</td>
                    <td className="py-3 px-4 text-right text-green-600">
                      +{(((totals.totalLiabilitiesAndEquity - (balanceSheetData.previousPeriod.totalLiabilities + balanceSheetData.previousPeriod.totalEquity)) / (balanceSheetData.previousPeriod.totalLiabilities + balanceSheetData.previousPeriod.totalEquity)) * 100).toFixed(1)}%
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
          <li>This balance sheet has been prepared in accordance with Generally Accepted Accounting Principles (GAAP).</li>
          <li>All amounts are in Indian Rupees (₹).</li>
          <li>Comparative figures as of {new Date(balanceSheetData.previousPeriod.asOfDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}.</li>
        </ul>
      </div>
    </div>
  );
};

export default BalanceSheet;