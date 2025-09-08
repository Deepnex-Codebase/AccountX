import React, { useState, useEffect } from 'react';
import { ShieldCheckIcon, PlusIcon, DocumentCheckIcon } from '@heroicons/react/24/outline';

const RolesPermissions = () => {
  const [roles, setRoles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [showAddRoleModal, setShowAddRoleModal] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Sample data for roles
  const sampleRoles = [
    {
      id: 1,
      name: 'Administrator',
      description: 'Full system access with all permissions',
      userCount: 3,
      permissions: {
        dashboard: ['view', 'edit'],
        accounting: ['view', 'edit', 'create', 'delete'],
        reports: ['view', 'export'],
        users: ['view', 'edit', 'create', 'delete'],
        settings: ['view', 'edit']
      }
    },
    {
      id: 2,
      name: 'Accountant',
      description: 'Access to accounting features and reports',
      userCount: 8,
      permissions: {
        dashboard: ['view'],
        accounting: ['view', 'edit', 'create'],
        reports: ['view', 'export'],
        users: ['view'],
        settings: ['view']
      }
    },
    {
      id: 3,
      name: 'Manager',
      description: 'Access to reports and limited accounting features',
      userCount: 5,
      permissions: {
        dashboard: ['view'],
        accounting: ['view'],
        reports: ['view', 'export'],
        users: ['view'],
        settings: ['view']
      }
    },
    {
      id: 4,
      name: 'Viewer',
      description: 'Read-only access to reports and dashboard',
      userCount: 12,
      permissions: {
        dashboard: ['view'],
        accounting: ['view'],
        reports: ['view'],
        users: [],
        settings: []
      }
    },
    {
      id: 5,
      name: 'Auditor',
      description: 'Access to audit reports and transaction history',
      userCount: 2,
      permissions: {
        dashboard: ['view'],
        accounting: ['view'],
        reports: ['view', 'export'],
        users: ['view'],
        settings: []
      }
    }
  ];

  // Modules for permission management
  const modules = [
    {
      id: 'dashboard',
      name: 'Dashboard',
      permissions: ['view', 'edit']
    },
    {
      id: 'accounting',
      name: 'Accounting',
      permissions: ['view', 'edit', 'create', 'delete']
    },
    {
      id: 'reports',
      name: 'Reports',
      permissions: ['view', 'export']
    },
    {
      id: 'users',
      name: 'User Management',
      permissions: ['view', 'edit', 'create', 'delete']
    },
    {
      id: 'settings',
      name: 'Settings',
      permissions: ['view', 'edit']
    }
  ];

  // Load roles data
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setRoles(sampleRoles);
      setIsLoading(false);
    }, 1000);
  }, []);

  // Filter roles based on search term
  const filteredRoles = roles.filter(role =>
    role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle role selection
  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setIsEditing(false);
  };

  // Handle permission toggle
  const handlePermissionToggle = (moduleId, permission) => {
    if (!isEditing || !selectedRole) return;

    setSelectedRole(prevRole => {
      const updatedPermissions = { ...prevRole.permissions };
      
      if (updatedPermissions[moduleId].includes(permission)) {
        updatedPermissions[moduleId] = updatedPermissions[moduleId].filter(p => p !== permission);
      } else {
        updatedPermissions[moduleId] = [...updatedPermissions[moduleId], permission];
      }
      
      return { ...prevRole, permissions: updatedPermissions };
    });
  };

  // Save role changes
  const handleSaveChanges = () => {
    // In a real app, this would save to backend
    setRoles(prevRoles => 
      prevRoles.map(role => 
        role.id === selectedRole.id ? selectedRole : role
      )
    );
    setIsEditing(false);
  };

  // Add new role
  const handleAddRole = () => {
    if (!newRoleName.trim()) return;
    
    const newRole = {
      id: roles.length + 1,
      name: newRoleName.trim(),
      description: 'New role description',
      userCount: 0,
      permissions: {
        dashboard: ['view'],
        accounting: ['view'],
        reports: ['view'],
        users: [],
        settings: []
      }
    };
    
    setRoles([...roles, newRole]);
    setNewRoleName('');
    setShowAddRoleModal(false);
    setSelectedRole(newRole);
  };

  // Get permission label color
  const getPermissionColor = (permission) => {
    switch(permission) {
      case 'view': return 'bg-blue-100 text-blue-800';
      case 'edit': return 'bg-yellow-100 text-yellow-800';
      case 'create': return 'bg-green-100 text-green-800';
      case 'delete': return 'bg-red-100 text-red-800';
      case 'export': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Roles & Permissions</h1>
        <button
          onClick={() => setShowAddRoleModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-sm"
        >
          <PlusIcon className="h-5 w-5" />
          Add New Role
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Roles List */}
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
                  placeholder="Search roles"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <ul className="divide-y divide-gray-200 max-h-[500px] overflow-y-auto">
              {filteredRoles.length > 0 ? (
                filteredRoles.map((role) => (
                  <li 
                    key={role.id} 
                    className={`cursor-pointer hover:bg-gray-50 transition-colors ${selectedRole?.id === role.id ? 'bg-blue-50' : ''}`}
                    onClick={() => handleRoleSelect(role)}
                  >
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <ShieldCheckIcon className={`h-5 w-5 mr-3 ${selectedRole?.id === role.id ? 'text-blue-600' : 'text-gray-400'}`} />
                          <p className="text-sm font-medium text-gray-900 truncate">{role.name}</p>
                        </div>
                        <div className="ml-2 flex-shrink-0 flex">
                          <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            {role.userCount} {role.userCount === 1 ? 'user' : 'users'}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <p className="flex items-center text-sm text-gray-500 truncate">
                            {role.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  </li>
                ))
              ) : (
                <li className="px-4 py-6 text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="mt-2 text-gray-700 font-medium">No roles found</p>
                  <p className="text-gray-500 text-sm">Try adjusting your search criteria</p>
                </li>
              )}
            </ul>
          </div>

          {/* Role Details */}
          <div className="lg:col-span-2">
            {selectedRole ? (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <ShieldCheckIcon className="h-6 w-6 text-blue-600 mr-3" />
                      <h2 className="text-xl font-semibold text-gray-900">{selectedRole.name}</h2>
                    </div>
                    {isEditing ? (
                      <div className="flex space-x-3">
                        <button
                          onClick={() => {
                            setIsEditing(false);
                            setSelectedRole(roles.find(r => r.id === selectedRole.id));
                          }}
                          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSaveChanges}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 flex items-center gap-2"
                        >
                          <DocumentCheckIcon className="h-5 w-5" />
                          Save Changes
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Edit Permissions
                      </button>
                    )}
                  </div>
                  <p className="mt-2 text-gray-600">{selectedRole.description}</p>
                  <p className="mt-1 text-sm text-gray-500">{selectedRole.userCount} {selectedRole.userCount === 1 ? 'user' : 'users'} with this role</p>
                </div>
                
                <div className="p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Permissions</h3>
                  <div className="space-y-6">
                    {modules.map((module) => (
                      <div key={module.id} className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="text-md font-medium text-gray-900 mb-3">{module.name}</h4>
                        <div className="flex flex-wrap gap-3">
                          {module.permissions.map((permission) => (
                            <label 
                              key={`${module.id}-${permission}`}
                              className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium cursor-pointer transition-colors ${selectedRole.permissions[module.id]?.includes(permission) 
                                ? getPermissionColor(permission) 
                                : 'bg-gray-100 text-gray-500'} ${isEditing ? 'hover:bg-gray-200' : ''}`}
                              onClick={() => handlePermissionToggle(module.id, permission)}
                            >
                              <input 
                                type="checkbox" 
                                className="sr-only" 
                                checked={selectedRole.permissions[module.id]?.includes(permission) || false}
                                readOnly
                              />
                              <span className="capitalize">{permission}</span>
                              {selectedRole.permissions[module.id]?.includes(permission) && (
                                <svg className="ml-1.5 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              )}
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center justify-center h-full min-h-[300px]">
                <ShieldCheckIcon className="h-16 w-16 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">No Role Selected</h3>
                <p className="text-gray-500 text-center max-w-md">Select a role from the list to view and manage its permissions</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Role Modal */}
      {showAddRoleModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative">
            <button 
              onClick={() => setShowAddRoleModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-500 focus:outline-none"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="flex items-center mb-5">
              <ShieldCheckIcon className="h-6 w-6 text-blue-600 mr-3" />
              <h3 className="text-lg font-medium text-gray-900">Add New Role</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label htmlFor="role-name" className="block text-sm font-medium text-gray-700 mb-1">
                  Role Name
                </label>
                <input
                  type="text"
                  id="role-name"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter role name"
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="role-description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  id="role-description"
                  rows="3"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter role description"
                ></textarea>
              </div>
              <p className="text-sm text-gray-500">You can configure permissions after creating the role.</p>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowAddRoleModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={handleAddRole}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center gap-2"
                disabled={!newRoleName.trim()}
              >
                <PlusIcon className="h-5 w-5" />
                Add Role
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RolesPermissions;