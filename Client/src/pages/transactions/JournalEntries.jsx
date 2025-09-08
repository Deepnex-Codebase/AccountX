import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// Sample data for journal entries
const sampleJournalEntries = [
  { 
    id: 1, 
    date: '2023-11-15', 
    reference: 'JE-2023-001', 
    description: 'Office Rent Payment', 
    totalAmount: 25000, 
    status: 'posted',
    createdBy: 'Rahul Sharma',
    lines: [
      { id: 1, accountCode: '5200', accountName: 'Rent Expense', debit: 25000, credit: 0 },
      { id: 2, accountCode: '1000', accountName: 'Cash', debit: 0, credit: 25000 }
    ]
  },
  { 
    id: 2, 
    date: '2023-11-14', 
    reference: 'JE-2023-002', 
    description: 'Sales Revenue', 
    totalAmount: 45000, 
    status: 'posted',
    createdBy: 'Priya Patel',
    lines: [
      { id: 3, accountCode: '1100', accountName: 'Bank Account', debit: 45000, credit: 0 },
      { id: 4, accountCode: '4000', accountName: 'Sales Revenue', debit: 0, credit: 45000 }
    ]
  },
  { 
    id: 3, 
    date: '2023-11-12', 
    reference: 'JE-2023-003', 
    description: 'Equipment Purchase', 
    totalAmount: 120000, 
    status: 'posted',
    createdBy: 'Rahul Sharma',
    lines: [
      { id: 5, accountCode: '1500', accountName: 'Office Equipment', debit: 120000, credit: 0 },
      { id: 6, accountCode: '2000', accountName: 'Accounts Payable', debit: 0, credit: 120000 }
    ]
  },
  { 
    id: 4, 
    date: '2023-11-10', 
    reference: 'JE-2023-004', 
    description: 'Utility Expenses', 
    totalAmount: 8500, 
    status: 'posted',
    createdBy: 'Priya Patel',
    lines: [
      { id: 7, accountCode: '5300', accountName: 'Utilities Expense', debit: 8500, credit: 0 },
      { id: 8, accountCode: '1000', accountName: 'Cash', debit: 0, credit: 8500 }
    ]
  },
  { 
    id: 5, 
    date: '2023-11-08', 
    reference: 'JE-2023-005', 
    description: 'Salary Payment', 
    totalAmount: 75000, 
    status: 'posted',
    createdBy: 'Rahul Sharma',
    lines: [
      { id: 9, accountCode: '5100', accountName: 'Salaries Expense', debit: 75000, credit: 0 },
      { id: 10, accountCode: '1100', accountName: 'Bank Account', debit: 0, credit: 75000 }
    ]
  },
  { 
    id: 6, 
    date: '2023-11-05', 
    reference: 'JE-2023-006', 
    description: 'Loan Interest Payment', 
    totalAmount: 5000, 
    status: 'posted',
    createdBy: 'Priya Patel',
    lines: [
      { id: 11, accountCode: '5600', accountName: 'Interest Expense', debit: 5000, credit: 0 },
      { id: 12, accountCode: '1000', accountName: 'Cash', debit: 0, credit: 5000 }
    ]
  },
  { 
    id: 7, 
    date: '2023-11-03', 
    reference: 'JE-2023-007', 
    description: 'Customer Payment Received', 
    totalAmount: 35000, 
    status: 'posted',
    createdBy: 'Rahul Sharma',
    lines: [
      { id: 13, accountCode: '1100', accountName: 'Bank Account', debit: 35000, credit: 0 },
      { id: 14, accountCode: '1200', accountName: 'Accounts Receivable', debit: 0, credit: 35000 }
    ]
  },
  { 
    id: 8, 
    date: '2023-11-01', 
    reference: 'JE-2023-008', 
    description: 'Advertising Expense', 
    totalAmount: 12000, 
    status: 'draft',
    createdBy: 'Priya Patel',
    lines: [
      { id: 15, accountCode: '5500', accountName: 'Advertising Expense', debit: 12000, credit: 0 },
      { id: 16, accountCode: '1000', accountName: 'Cash', debit: 0, credit: 12000 }
    ]
  },
];

const JournalEntries = () => {
  const [journalEntries, setJournalEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [expandedEntryId, setExpandedEntryId] = useState(null);
  
  // Simulate data loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setJournalEntries(sampleJournalEntries);
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Filter journal entries based on search term and status
  const filteredEntries = journalEntries.filter(entry => {
    const matchesSearch = 
      entry.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.reference.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'All' || entry.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });
  
  // Toggle expanded entry
  const toggleExpandEntry = (entryId) => {
    if (expandedEntryId === entryId) {
      setExpandedEntryId(null);
    } else {
      setExpandedEntryId(entryId);
    }
  };
  
  // Loading state
  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-background p-6 rounded-card w-full">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          <p className="mt-4 text-base-dark font-medium">Loading journal entries data...</p>
        </div>
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
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-800">
                Journal Entries
              </h1>
              <p className="text-xs text-gray-500">Manage and view all journal entries</p>
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
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <div className="relative">
                <input
                  type="text"
                  id="search"
                  placeholder="Search by reference or description..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </span>
              </div>
            </div>
            
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select 
                id="status"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="All">All Status</option>
                <option value="draft">Draft</option>
                <option value="posted">Posted</option>
              </select>
            </div>
          </div>
          
          <div className="mt-4 flex justify-end space-x-3">
            <button
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              onClick={() => {
                setSearchTerm('');
                setFilterStatus('All');
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
          <Link to="/transactions/journal-entries/create" className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            New Journal Entry
          </Link>
        </div>
        <div className="flex space-x-3">
          <button className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            Export
          </button>
          <button className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            Print
          </button>
        </div>
      </div>
      
      {/* Journal Entries List */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-10"></th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEntries.map((entry) => (
                <>
                  <tr key={entry.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button 
                        onClick={() => toggleExpandEntry(entry.id)}
                        className="p-1 rounded-full hover:bg-gray-200"
                      >
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          className={`h-5 w-5 transition-transform ${expandedEntryId === entry.id ? 'rotate-180' : ''}`} 
                          fill="none" 
                          viewBox="0 0 24 24" 
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{entry.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{entry.reference}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{entry.description}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-gray-900">₹{entry.totalAmount.toLocaleString('en-IN')}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${entry.status === 'posted' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {entry.status === 'posted' ? 'Posted' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      <div className="flex justify-center space-x-2">
                        <button className="text-blue-600 hover:text-blue-900 mr-3">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        <button className="text-red-600 hover:text-red-900">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expandedEntryId === entry.id && (
                    <tr>
                      <td colSpan="7" className="py-0">
                        <div className="bg-gray-50 p-4 border-b border-gray-100">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <p className="text-sm text-gray-500">Created By</p>
                              <p className="font-medium text-gray-900">{entry.createdBy}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Created Date</p>
                              <p className="font-medium text-gray-900">{entry.date}</p>
                            </div>
                          </div>
                          
                          <h4 className="font-medium mb-2 text-gray-900">Journal Entry Lines</h4>
                          <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead>
                                <tr className="bg-gray-100">
                                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account Code</th>
                                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account Name</th>
                                  <th scope="col" className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Debit</th>
                                  <th scope="col" className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Credit</th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {entry.lines.map((line) => (
                                  <tr key={line.id}>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{line.accountCode}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{line.accountName}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-right text-gray-500">
                                      {line.debit > 0 ? `₹${line.debit.toLocaleString('en-IN')}` : '-'}
                                    </td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-right text-gray-500">
                                      {line.credit > 0 ? `₹${line.credit.toLocaleString('en-IN')}` : '-'}
                                    </td>
                                  </tr>
                                ))}
                                <tr className="bg-gray-100 font-medium">
                                  <td colSpan="2" className="px-3 py-2 whitespace-nowrap text-sm text-right text-gray-900">Total</td>
                                  <td className="px-3 py-2 whitespace-nowrap text-sm text-right text-gray-900">
                                    ₹{entry.lines.reduce((sum, line) => sum + line.debit, 0).toLocaleString('en-IN')}
                                  </td>
                                  <td className="px-3 py-2 whitespace-nowrap text-sm text-right text-gray-900">
                                    ₹{entry.lines.reduce((sum, line) => sum + line.credit, 0).toLocaleString('en-IN')}
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredEntries.length === 0 && (
          <div className="py-8 text-center">
            <p className="text-gray-500">No journal entries found matching your filters.</p>
          </div>
        )}
      </div>
      
      {/* Pagination */}
      <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 rounded-lg shadow-sm mt-4">
        <div className="flex-1 flex justify-between sm:hidden">
          <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
            Previous
          </button>
          <button className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
            Next
          </button>
        </div>
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredEntries.length}</span> of{' '}
              <span className="font-medium">{filteredEntries.length}</span> results
            </p>
          </div>
          <div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                <span className="sr-only">Previous</span>
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </button>
              <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                1
              </button>
              <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                <span className="sr-only">Next</span>
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  </div>
  );
};

export default JournalEntries;