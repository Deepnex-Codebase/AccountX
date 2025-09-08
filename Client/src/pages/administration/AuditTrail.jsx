import React, { useState, useEffect } from 'react';
import { ClockIcon, ArrowPathIcon, FunnelIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

const AuditTrail = () => {
  const [auditLogs, setAuditLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // State for filters
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState('all');
  const [actionFilter, setActionFilter] = useState('all');
  const [userFilter, setUserFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  // Sample data for audit logs
  const sampleAuditLogs = [
    {
      id: 1,
      timestamp: new Date(new Date().setDate(new Date().getDate() - 1)),
      user: 'Rahul Sharma',
      userRole: 'Administrator',
      action: 'create',
      resource: 'Invoice',
      resourceId: 'INV-2023-001',
      details: 'Created new invoice for client ABC Corp',
      ipAddress: '192.168.1.101'
    },
    {
      id: 2,
      timestamp: new Date(new Date().setDate(new Date().getDate() - 2)),
      user: 'Priya Patel',
      userRole: 'Accountant',
      action: 'update',
      resource: 'Journal Entry',
      resourceId: 'JE-2023-042',
      details: 'Updated amount from ₹15,000 to ₹17,500',
      ipAddress: '192.168.1.105'
    },
    {
      id: 3,
      timestamp: new Date(new Date().setDate(new Date().getDate() - 3)),
      user: 'Vikram Singh',
      userRole: 'Manager',
      action: 'view',
      resource: 'Financial Report',
      resourceId: 'FR-Q2-2023',
      details: 'Viewed Q2 2023 financial report',
      ipAddress: '192.168.1.110'
    },
    {
      id: 4,
      timestamp: new Date(new Date().setDate(new Date().getDate() - 4)),
      user: 'Rahul Sharma',
      userRole: 'Administrator',
      action: 'delete',
      resource: 'Draft Invoice',
      resourceId: 'DRAFT-2023-007',
      details: 'Deleted draft invoice for client XYZ Ltd',
      ipAddress: '192.168.1.101'
    },
    {
      id: 5,
      timestamp: new Date(new Date().setDate(new Date().getDate() - 5)),
      user: 'Neha Gupta',
      userRole: 'Accountant',
      action: 'update',
      resource: 'Customer',
      resourceId: 'CUST-2023-054',
      details: 'Updated customer contact information',
      ipAddress: '192.168.1.108'
    },
    {
      id: 6,
      timestamp: new Date(new Date().setDate(new Date().getDate() - 6)),
      user: 'Amit Kumar',
      userRole: 'Auditor',
      action: 'view',
      resource: 'Transaction Log',
      resourceId: 'TL-2023-Q2',
      details: 'Viewed Q2 2023 transaction logs',
      ipAddress: '192.168.1.115'
    },
    {
      id: 7,
      timestamp: new Date(new Date().setDate(new Date().getDate() - 10)),
      user: 'Priya Patel',
      userRole: 'Accountant',
      action: 'create',
      resource: 'Expense Claim',
      resourceId: 'EXP-2023-028',
      details: 'Created new expense claim for ₹12,500',
      ipAddress: '192.168.1.105'
    },
    {
      id: 8,
      timestamp: new Date(new Date().setDate(new Date().getDate() - 12)),
      user: 'Rahul Sharma',
      userRole: 'Administrator',
      action: 'update',
      resource: 'User',
      resourceId: 'USER-021',
      details: 'Updated user role from Viewer to Accountant',
      ipAddress: '192.168.1.101'
    },
    {
      id: 9,
      timestamp: new Date(new Date().setDate(new Date().getDate() - 15)),
      user: 'Vikram Singh',
      userRole: 'Manager',
      action: 'create',
      resource: 'Budget',
      resourceId: 'BUD-2023-Q3',
      details: 'Created Q3 2023 budget',
      ipAddress: '192.168.1.110'
    },
    {
      id: 10,
      timestamp: new Date(new Date().setDate(new Date().getDate() - 18)),
      user: 'Neha Gupta',
      userRole: 'Accountant',
      action: 'update',
      resource: 'Tax Settings',
      resourceId: 'TAX-GST-001',
      details: 'Updated GST rate from 18% to 12% for category B items',
      ipAddress: '192.168.1.108'
    },
    {
      id: 11,
      timestamp: new Date(new Date().setDate(new Date().getDate() - 22)),
      user: 'Amit Kumar',
      userRole: 'Auditor',
      action: 'view',
      resource: 'Audit Report',
      resourceId: 'AR-2023-H1',
      details: 'Viewed H1 2023 audit report',
      ipAddress: '192.168.1.115'
    },
    {
      id: 12,
      timestamp: new Date(new Date().setDate(new Date().getDate() - 25)),
      user: 'Rahul Sharma',
      userRole: 'Administrator',
      action: 'update',
      resource: 'System Settings',
      resourceId: 'SYS-EMAIL',
      details: 'Updated email notification settings',
      ipAddress: '192.168.1.101'
    },
    {
      id: 13,
      timestamp: new Date(2023, 6, 9, 14, 30),
      user: 'Priya Patel',
      userRole: 'Accountant',
      action: 'create',
      resource: 'Journal Entry',
      resourceId: 'JE-2023-043',
      details: 'Created month-end adjustment entry',
      ipAddress: '192.168.1.105'
    },
    {
      id: 14,
      timestamp: new Date(2023, 6, 9, 16, 15),
      user: 'Neha Gupta',
      userRole: 'Accountant',
      action: 'delete',
      resource: 'Draft Payment',
      resourceId: 'PAY-DRAFT-012',
      details: 'Deleted draft payment record',
      ipAddress: '192.168.1.108'
    },
    {
      id: 15,
      timestamp: new Date(2023, 6, 8, 10, 20),
      user: 'Vikram Singh',
      userRole: 'Manager',
      action: 'view',
      resource: 'Dashboard',
      resourceId: 'DASH-MAIN',
      details: 'Viewed main dashboard',
      ipAddress: '192.168.1.110'
    }
  ];

  // Unique users for filter
  const uniqueUsers = [...new Set(sampleAuditLogs.map(log => log.user))];

  // Load audit logs
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setAuditLogs(sampleAuditLogs);
      setIsLoading(false);
    }, 1000);
  }, [sampleAuditLogs]);

  // Filter logs based on search term, date range, action, and user
  const getFilteredLogs = () => {
    return auditLogs.filter(log => {
      // Search term filter
      const searchMatch = 
        log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.resource.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.resourceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.details.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Date range filter
      let dateMatch = true;
      const now = new Date();
      const logDate = new Date(log.timestamp);
      
      switch(dateRange) {
        case 'today':
          dateMatch = logDate.toDateString() === now.toDateString();
          break;
        case 'yesterday': {
          const yesterday = new Date(now);
          yesterday.setDate(now.getDate() - 1);
          dateMatch = logDate.toDateString() === yesterday.toDateString();
          break;
        }
        case 'last7days': {
          const last7Days = new Date(now);
          last7Days.setDate(now.getDate() - 7);
          dateMatch = logDate >= last7Days;
          break;
        }
        case 'last30days': {
          const last30Days = new Date(now);
          last30Days.setDate(now.getDate() - 30);
          dateMatch = logDate >= last30Days;
          break;
        }
        default:
          dateMatch = true;
      }
      
      // Action filter
      const actionMatch = actionFilter === 'all' || log.action === actionFilter;
      
      // User filter
      const userMatch = userFilter === 'all' || log.user === userFilter;
      
      return searchMatch && dateMatch && actionMatch && userMatch;
    });
  };

  const filteredLogs = getFilteredLogs();

  // Format date for display
  const formatDate = (date) => {
    return new Date(date).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  // Get action badge color
  const getActionColor = (action) => {
    switch(action) {
      case 'create': return 'bg-green-100 text-green-800';
      case 'update': return 'bg-yellow-100 text-yellow-800';
      case 'delete': return 'bg-red-100 text-red-800';
      case 'view': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Export audit logs as CSV
  const exportAsCsv = () => {
    const headers = ['Date & Time', 'User', 'Role', 'Action', 'Resource', 'Resource ID', 'Details', 'IP Address'];
    
    const csvData = filteredLogs.map(log => [
      formatDate(log.timestamp),
      log.user,
      log.userRole,
      log.action,
      log.resource,
      log.resourceId,
      log.details,
      log.ipAddress
    ]);
    
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `audit_logs_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Audit Trail</h1>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors shadow-sm flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <FunnelIcon className="h-5 w-5 text-gray-500" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
          <button
            onClick={exportAsCsv}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <DocumentTextIcon className="h-5 w-5" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
              placeholder="Search by user, resource, or details"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {showFilters && (
          <div className="p-4 bg-gray-50 border-b border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="date-range" className="block text-sm font-medium text-gray-700 mb-1">
                Date Range
              </label>
              <select
                id="date-range"
                className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
              >
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="last7days">Last 7 Days</option>
                <option value="last30days">Last 30 Days</option>
                <option value="all">All Time</option>
              </select>
            </div>
            <div>
              <label htmlFor="action-filter" className="block text-sm font-medium text-gray-700 mb-1">
                Action
              </label>
              <select
                id="action-filter"
                className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
              >
                <option value="all">All Actions</option>
                <option value="create">Create</option>
                <option value="update">Update</option>
                <option value="delete">Delete</option>
                <option value="view">View</option>
              </select>
            </div>
            <div>
              <label htmlFor="user-filter" className="block text-sm font-medium text-gray-700 mb-1">
                User
              </label>
              <select
                id="user-filter"
                className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                value={userFilter}
                onChange={(e) => setUserFilter(e.target.value)}
              >
                <option value="all">All Users</option>
                {uniqueUsers.map((user, index) => (
                  <option key={index} value={user}>{user}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {filteredLogs.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date & Time
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Resource
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Details
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      IP Address
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <ClockIcon className="h-4 w-4 text-gray-400 mr-2" />
                          {formatDate(log.timestamp)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{log.user}</div>
                        <div className="text-sm text-gray-500">{log.userRole}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getActionColor(log.action)}`}>
                          {log.action.charAt(0).toUpperCase() + log.action.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{log.resource}</div>
                        <div className="text-sm text-gray-500">{log.resourceId}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate">{log.details}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {log.ipAddress}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-12 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No audit logs found</h3>
              <p className="mt-1 text-sm text-gray-500">Try adjusting your search criteria or filters.</p>
              <div className="mt-6">
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setDateRange('all');
                    setActionFilter('all');
                    setUserFilter('all');
                  }}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <ArrowPathIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                  Reset Filters
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Pagination - simplified for this example */}
      {filteredLogs.length > 0 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 rounded-lg shadow">
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredLogs.length}</span> of{' '}
                <span className="font-medium">{filteredLogs.length}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <a
                  href="#"
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  <span className="sr-only">Previous</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </a>
                <a
                  href="#"
                  aria-current="page"
                  className="z-10 bg-blue-50 border-blue-500 text-blue-600 relative inline-flex items-center px-4 py-2 border text-sm font-medium"
                >
                  1
                </a>
                <a
                  href="#"
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  <span className="sr-only">Next</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </a>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditTrail;