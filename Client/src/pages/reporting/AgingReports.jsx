import React, { useState, useEffect } from 'react';
import { ArrowDownTrayIcon, DocumentTextIcon, PrinterIcon } from '@heroicons/react/24/outline';

const AgingReports = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);
  const [reportType, setReportType] = useState('receivables'); // 'receivables' or 'payables'
  
  // Sample data for Accounts Receivable Aging
  const receivablesData = [
    {
      id: 1,
      customerName: 'ABC Corporation',
      customerCode: 'CUST-001',
      totalDue: 125000,
      current: 50000,
      days1to30: 75000,
      days31to60: 0,
      days61to90: 0,
      days91Plus: 0,
      lastPaymentDate: '2023-03-25',
      creditLimit: 500000
    },
    {
      id: 2,
      customerName: 'XYZ Enterprises',
      customerCode: 'CUST-002',
      totalDue: 87500,
      current: 0,
      days1to30: 45000,
      days31to60: 42500,
      days61to90: 0,
      days91Plus: 0,
      lastPaymentDate: '2023-02-15',
      creditLimit: 300000
    },
    {
      id: 3,
      customerName: 'Global Trading Co.',
      customerCode: 'CUST-003',
      totalDue: 215000,
      current: 75000,
      days1to30: 65000,
      days31to60: 35000,
      days61to90: 40000,
      days91Plus: 0,
      lastPaymentDate: '2023-01-30',
      creditLimit: 500000
    },
    {
      id: 4,
      customerName: 'Tech Solutions Inc.',
      customerCode: 'CUST-004',
      totalDue: 178000,
      current: 0,
      days1to30: 0,
      days31to60: 68000,
      days61to90: 75000,
      days91Plus: 35000,
      lastPaymentDate: '2022-12-10',
      creditLimit: 400000
    },
    {
      id: 5,
      customerName: 'Innovative Systems',
      customerCode: 'CUST-005',
      totalDue: 92500,
      current: 92500,
      days1to30: 0,
      days31to60: 0,
      days61to90: 0,
      days91Plus: 0,
      lastPaymentDate: '2023-03-28',
      creditLimit: 250000
    },
    {
      id: 6,
      customerName: 'Premier Retail Ltd.',
      customerCode: 'CUST-006',
      totalDue: 143000,
      current: 58000,
      days1to30: 85000,
      days31to60: 0,
      days61to90: 0,
      days91Plus: 0,
      lastPaymentDate: '2023-03-15',
      creditLimit: 350000
    },
    {
      id: 7,
      customerName: 'Eastern Distributors',
      customerCode: 'CUST-007',
      totalDue: 267500,
      current: 0,
      days1to30: 0,
      days31to60: 0,
      days61to90: 125000,
      days91Plus: 142500,
      lastPaymentDate: '2022-11-05',
      creditLimit: 500000
    }
  ];
  
  // Sample data for Accounts Payable Aging
  const payablesData = [
    {
      id: 1,
      vendorName: 'Supplier Solutions',
      vendorCode: 'VEND-001',
      totalDue: 87500,
      current: 87500,
      days1to30: 0,
      days31to60: 0,
      days61to90: 0,
      days91Plus: 0,
      lastPaymentDate: '2023-03-20',
      creditTerms: 'Net 30'
    },
    {
      id: 2,
      vendorName: 'Quality Products Co.',
      vendorCode: 'VEND-002',
      totalDue: 156000,
      current: 45000,
      days1to30: 111000,
      days31to60: 0,
      days61to90: 0,
      days91Plus: 0,
      lastPaymentDate: '2023-03-05',
      creditTerms: 'Net 45'
    },
    {
      id: 3,
      vendorName: 'Industrial Supplies Ltd.',
      vendorCode: 'VEND-003',
      totalDue: 235000,
      current: 85000,
      days1to30: 75000,
      days31to60: 75000,
      days61to90: 0,
      days91Plus: 0,
      lastPaymentDate: '2023-02-10',
      creditTerms: 'Net 30'
    },
    {
      id: 4,
      vendorName: 'Tech Components Inc.',
      vendorCode: 'VEND-004',
      totalDue: 128500,
      current: 0,
      days1to30: 0,
      days31to60: 58500,
      days61to90: 70000,
      days91Plus: 0,
      lastPaymentDate: '2023-01-15',
      creditTerms: 'Net 60'
    },
    {
      id: 5,
      vendorName: 'Global Manufacturing',
      vendorCode: 'VEND-005',
      totalDue: 195000,
      current: 195000,
      days1to30: 0,
      days31to60: 0,
      days61to90: 0,
      days91Plus: 0,
      lastPaymentDate: '2023-03-25',
      creditTerms: 'Net 30'
    },
    {
      id: 6,
      vendorName: 'Logistics Partners',
      vendorCode: 'VEND-006',
      totalDue: 76500,
      current: 0,
      days1to30: 0,
      days31to60: 0,
      days61to90: 0,
      days91Plus: 76500,
      lastPaymentDate: '2022-10-30',
      creditTerms: 'Net 45'
    }
  ];
  
  // Calculate totals for each aging bucket
  const calculateTotals = (data) => {
    return data.reduce((totals, item) => {
      return {
        totalDue: totals.totalDue + item.totalDue,
        current: totals.current + item.current,
        days1to30: totals.days1to30 + item.days1to30,
        days31to60: totals.days31to60 + item.days31to60,
        days61to90: totals.days61to90 + item.days61to90,
        days91Plus: totals.days91Plus + item.days91Plus
      };
    }, {
      totalDue: 0,
      current: 0,
      days1to30: 0,
      days31to60: 0,
      days61to90: 0,
      days91Plus: 0
    });
  };
  
  // Calculate percentages for each aging bucket
  const calculatePercentages = (totals) => {
    const { totalDue } = totals;
    if (totalDue === 0) return totals;
    
    return {
      ...totals,
      currentPercent: (totals.current / totalDue * 100).toFixed(2),
      days1to30Percent: (totals.days1to30 / totalDue * 100).toFixed(2),
      days31to60Percent: (totals.days31to60 / totalDue * 100).toFixed(2),
      days61to90Percent: (totals.days61to90 / totalDue * 100).toFixed(2),
      days91PlusPercent: (totals.days91Plus / totalDue * 100).toFixed(2)
    };
  };
  
  // Get active data based on report type
  const activeData = reportType === 'receivables' ? receivablesData : payablesData;
  
  // Calculate totals and percentages
  const totals = calculateTotals(activeData);
  const percentages = calculatePercentages(totals);
  
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
            <h2 className="text-lg font-semibold text-gray-800">
              {reportType === 'receivables' ? 'Accounts Receivable Aging' : 'Accounts Payable Aging'}
            </h2>
            <p className="text-sm text-gray-600">
              {reportType === 'receivables' 
                ? 'Analysis of outstanding customer invoices by age' 
                : 'Analysis of outstanding vendor bills by age'}
            </p>
          </div>
        </div>
        
        {/* Report Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <div className="flex-1 max-w-xs">
            <label htmlFor="reportDate" className="block text-sm font-medium text-gray-700 mb-1">As of Date</label>
            <input
              type="date"
              id="reportDate"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={reportDate}
              onChange={(e) => setReportDate(e.target.value)}
            />
          </div>
          
          <div className="flex-1 max-w-xs">
            <label htmlFor="reportType" className="block text-sm font-medium text-gray-700 mb-1">Report Type</label>
            <select
              id="reportType"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
            >
              <option value="receivables">Accounts Receivable Aging</option>
              <option value="payables">Accounts Payable Aging</option>
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
      
      {/* Summary Cards */}
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <h4 className="text-sm font-medium text-gray-500 mb-1">Total Outstanding</h4>
            <p className="text-xl font-bold text-gray-900">₹{totals.totalDue.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-1">100%</p>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg shadow-sm border border-green-100">
            <h4 className="text-sm font-medium text-green-700 mb-1">Current</h4>
            <p className="text-xl font-bold text-green-800">₹{totals.current.toLocaleString()}</p>
            <p className="text-xs text-green-600 mt-1">{percentages.currentPercent}%</p>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg shadow-sm border border-blue-100">
            <h4 className="text-sm font-medium text-blue-700 mb-1">1-30 Days</h4>
            <p className="text-xl font-bold text-blue-800">₹{totals.days1to30.toLocaleString()}</p>
            <p className="text-xs text-blue-600 mt-1">{percentages.days1to30Percent}%</p>
          </div>
          
          <div className="bg-yellow-50 p-4 rounded-lg shadow-sm border border-yellow-100">
            <h4 className="text-sm font-medium text-yellow-700 mb-1">31-60 Days</h4>
            <p className="text-xl font-bold text-yellow-800">₹{totals.days31to60.toLocaleString()}</p>
            <p className="text-xs text-yellow-600 mt-1">{percentages.days31to60Percent}%</p>
          </div>
          
          <div className="bg-orange-50 p-4 rounded-lg shadow-sm border border-orange-100">
            <h4 className="text-sm font-medium text-orange-700 mb-1">61-90 Days</h4>
            <p className="text-xl font-bold text-orange-800">₹{totals.days61to90.toLocaleString()}</p>
            <p className="text-xs text-orange-600 mt-1">{percentages.days61to90Percent}%</p>
          </div>
          
          <div className="bg-red-50 p-4 rounded-lg shadow-sm border border-red-100">
            <h4 className="text-sm font-medium text-red-700 mb-1">91+ Days</h4>
            <p className="text-xl font-bold text-red-800">₹{totals.days91Plus.toLocaleString()}</p>
            <p className="text-xs text-red-600 mt-1">{percentages.days91PlusPercent}%</p>
          </div>
        </div>
        
        {/* Aging Chart - Simple bar representation */}
        <div className="mb-8">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Aging Distribution</h4>
          <div className="h-6 flex rounded-md overflow-hidden">
            {percentages.currentPercent > 0 && (
              <div 
                className="bg-green-500 h-full" 
                style={{ width: `${percentages.currentPercent}%` }}
                title={`Current: ${percentages.currentPercent}%`}
              ></div>
            )}
            {percentages.days1to30Percent > 0 && (
              <div 
                className="bg-blue-500 h-full" 
                style={{ width: `${percentages.days1to30Percent}%` }}
                title={`1-30 Days: ${percentages.days1to30Percent}%`}
              ></div>
            )}
            {percentages.days31to60Percent > 0 && (
              <div 
                className="bg-yellow-500 h-full" 
                style={{ width: `${percentages.days31to60Percent}%` }}
                title={`31-60 Days: ${percentages.days31to60Percent}%`}
              ></div>
            )}
            {percentages.days61to90Percent > 0 && (
              <div 
                className="bg-orange-500 h-full" 
                style={{ width: `${percentages.days61to90Percent}%` }}
                title={`61-90 Days: ${percentages.days61to90Percent}%`}
              ></div>
            )}
            {percentages.days91PlusPercent > 0 && (
              <div 
                className="bg-red-500 h-full" 
                style={{ width: `${percentages.days91PlusPercent}%` }}
                title={`91+ Days: ${percentages.days91PlusPercent}%`}
              ></div>
            )}
          </div>
          <div className="flex justify-between mt-1 text-xs text-gray-500">
            <div>0%</div>
            <div>25%</div>
            <div>50%</div>
            <div>75%</div>
            <div>100%</div>
          </div>
        </div>
      </div>
      
      {/* Detailed Aging Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-300">
          <thead>
            <tr className="bg-gray-50">
              {reportType === 'receivables' ? (
                <>
                  <th scope="col" className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Customer</th>
                  <th scope="col" className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Customer Code</th>
                </>
              ) : (
                <>
                  <th scope="col" className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Vendor</th>
                  <th scope="col" className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Vendor Code</th>
                </>
              )}
              <th scope="col" className="py-3 px-4 text-right text-sm font-semibold text-gray-700">Total Due</th>
              <th scope="col" className="py-3 px-4 text-right text-sm font-semibold text-green-700">Current</th>
              <th scope="col" className="py-3 px-4 text-right text-sm font-semibold text-blue-700">1-30 Days</th>
              <th scope="col" className="py-3 px-4 text-right text-sm font-semibold text-yellow-700">31-60 Days</th>
              <th scope="col" className="py-3 px-4 text-right text-sm font-semibold text-orange-700">61-90 Days</th>
              <th scope="col" className="py-3 px-4 text-right text-sm font-semibold text-red-700">91+ Days</th>
              <th scope="col" className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Last Payment</th>
              {reportType === 'receivables' ? (
                <th scope="col" className="py-3 px-4 text-right text-sm font-semibold text-gray-700">Credit Limit</th>
              ) : (
                <th scope="col" className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Credit Terms</th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {activeData.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50 transition duration-150">
                {reportType === 'receivables' ? (
                  <>
                    <td className="py-3 px-4 text-sm font-medium text-gray-900">{item.customerName}</td>
                    <td className="py-3 px-4 text-sm text-gray-500">{item.customerCode}</td>
                  </>
                ) : (
                  <>
                    <td className="py-3 px-4 text-sm font-medium text-gray-900">{item.vendorName}</td>
                    <td className="py-3 px-4 text-sm text-gray-500">{item.vendorCode}</td>
                  </>
                )}
                <td className="py-3 px-4 text-right text-sm font-medium text-gray-900">₹{item.totalDue.toLocaleString()}</td>
                <td className="py-3 px-4 text-right text-sm text-gray-700">
                  {item.current > 0 ? `₹${item.current.toLocaleString()}` : '-'}
                </td>
                <td className="py-3 px-4 text-right text-sm text-gray-700">
                  {item.days1to30 > 0 ? `₹${item.days1to30.toLocaleString()}` : '-'}
                </td>
                <td className="py-3 px-4 text-right text-sm text-gray-700">
                  {item.days31to60 > 0 ? `₹${item.days31to60.toLocaleString()}` : '-'}
                </td>
                <td className="py-3 px-4 text-right text-sm text-gray-700">
                  {item.days61to90 > 0 ? `₹${item.days61to90.toLocaleString()}` : '-'}
                </td>
                <td className="py-3 px-4 text-right text-sm text-gray-700">
                  {item.days91Plus > 0 ? `₹${item.days91Plus.toLocaleString()}` : '-'}
                </td>
                <td className="py-3 px-4 text-sm text-gray-500">
                  {new Date(item.lastPaymentDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                </td>
                {reportType === 'receivables' ? (
                  <td className="py-3 px-4 text-right text-sm text-gray-700">₹{item.creditLimit.toLocaleString()}</td>
                ) : (
                  <td className="py-3 px-4 text-sm text-gray-500">{item.creditTerms}</td>
                )}
              </tr>
            ))}
            
            {/* Totals Row */}
            <tr className="bg-gray-100 font-medium">
              <td colSpan="2" className="py-3 px-4 text-sm text-gray-800">Total</td>
              <td className="py-3 px-4 text-right text-sm text-gray-800">₹{totals.totalDue.toLocaleString()}</td>
              <td className="py-3 px-4 text-right text-sm text-green-800">₹{totals.current.toLocaleString()}</td>
              <td className="py-3 px-4 text-right text-sm text-blue-800">₹{totals.days1to30.toLocaleString()}</td>
              <td className="py-3 px-4 text-right text-sm text-yellow-800">₹{totals.days31to60.toLocaleString()}</td>
              <td className="py-3 px-4 text-right text-sm text-orange-800">₹{totals.days61to90.toLocaleString()}</td>
              <td className="py-3 px-4 text-right text-sm text-red-800">₹{totals.days91Plus.toLocaleString()}</td>
              <td colSpan="2"></td>
            </tr>
            
            {/* Percentage Row */}
            <tr className="bg-gray-50">
              <td colSpan="2" className="py-3 px-4 text-sm text-gray-600">Percentage</td>
              <td className="py-3 px-4 text-right text-sm text-gray-600">100%</td>
              <td className="py-3 px-4 text-right text-sm text-green-600">{percentages.currentPercent}%</td>
              <td className="py-3 px-4 text-right text-sm text-blue-600">{percentages.days1to30Percent}%</td>
              <td className="py-3 px-4 text-right text-sm text-yellow-600">{percentages.days31to60Percent}%</td>
              <td className="py-3 px-4 text-right text-sm text-orange-600">{percentages.days61to90Percent}%</td>
              <td className="py-3 px-4 text-right text-sm text-red-600">{percentages.days91PlusPercent}%</td>
              <td colSpan="2"></td>
            </tr>
          </tbody>
        </table>
      </div>
      
      {/* Notes */}
      <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200 mx-6 mb-6">
        <p className="font-medium text-gray-700 mb-2">Notes:</p>
        <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
          <li>This aging report has been prepared as of {new Date(reportDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}.</li>
          <li>All amounts are in Indian Rupees (₹).</li>
          <li>The aging buckets are calculated based on the invoice date.</li>
          {reportType === 'receivables' ? (
            <li>Customers with balances exceeding their credit limits or with amounts in the 91+ days bucket should be reviewed for collection action.</li>
          ) : (
            <li>Vendors with significant balances in the 91+ days bucket should be prioritized for payment to maintain good supplier relationships.</li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default AgingReports;