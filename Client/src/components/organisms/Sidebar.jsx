import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

// SVG Icons
const DashboardIcon = ({ className = "w-5 h-5", collapsed }) => (
  <svg className={collapsed ? "w-5 h-5" : className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
  </svg>
);

const AccountingIcon = ({ className = "w-5 h-5", collapsed }) => (
  <svg className={collapsed ? "w-5 h-5" : className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
  </svg>
);

const TransactionsIcon = ({ className = "w-5 h-5", collapsed }) => (
  <svg className={collapsed ? "w-5 h-5" : className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
  </svg>
);

const MasterDataIcon = ({ className = "w-5 h-5", collapsed }) => (
  <svg className={collapsed ? "w-5 h-5" : className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
  </svg>
);

const ReportingIcon = ({ className = "w-5 h-5", collapsed }) => (
  <svg className={collapsed ? "w-5 h-5" : className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const AdminIcon = ({ className = "w-5 h-5", collapsed }) => (
  <svg className={collapsed ? "w-5 h-5" : className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);



const LogoutIcon = ({ className = "w-5 h-5", collapsed }) => (
  <svg className={collapsed ? "w-5 h-5" : className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);

const CollapseIcon = ({ className = "w-5 h-5", collapsed }) => (
  <svg className={collapsed ? "w-5 h-5" : className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={collapsed ? "M13 5l7 7-7 7M5 5l7 7-7 7" : "M11 19l-7-7 7-7m8 14l-7-7 7-7"} />
  </svg>
);

const Sidebar = ({ forceCollapsed = false, onCollapseChange }) => {
  const { logout } = useAuth();
  const { sidebarDarkMode } = useTheme();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  
  // Use forceCollapsed when chat is pinned
  const isCollapsed = forceCollapsed || collapsed;
  const [expandedSection, setExpandedSection] = useState(null);
  const [popupMenu, setPopupMenu] = useState({ visible: false, section: null, position: { top: 0, left: 0 } });
  
  // Determine active section based on current path
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/accounting')) setExpandedSection('accounting');
    else if (path.includes('/transactions')) setExpandedSection('transactions');
    else if (path.includes('/master-data')) setExpandedSection('masterData');
    else if (path.includes('/reporting')) setExpandedSection('reporting');
    else if (path.includes('/administration')) setExpandedSection('administration');
  }, [location]);
  
  // Toggle section expansion
  const toggleSection = (section, event) => {
    // Always prevent default behavior and stop propagation
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    if (isCollapsed) {
      // If sidebar is collapsed, only show popup menu, never expand the section
      if (event) {
        const buttonRect = event.currentTarget.getBoundingClientRect();
        // Toggle popup visibility or change section
        if (popupMenu.visible && popupMenu.section === section) {
          // If clicking the same section that's already open, close it
          setPopupMenu({ ...popupMenu, visible: false });
        } else {
          // Open popup for this section
          setPopupMenu({
            visible: true,
            section: section,
            position: {
              top: buttonRect.top - 5, // Adjust to align with the button
              left: buttonRect.right + 5 // 5px offset from the button
            }
          });
        }
      }
      // Important: Never set expandedSection when collapsed
      return;
    } else {
      // If sidebar is expanded, toggle section as before
      setExpandedSection(expandedSection === section ? null : section);
      // Hide popup menu when toggling sections in expanded mode
      setPopupMenu({ ...popupMenu, visible: false });
    }
  };
  
  // Close popup menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupMenu.visible && !event.target.closest('.popup-menu') && 
          !event.target.closest('.nav-button')) {
        setPopupMenu({ ...popupMenu, visible: false });
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [popupMenu]);
  
  // Toggle sidebar collapse
  const toggleCollapse = () => {
    if (!forceCollapsed) {
      setCollapsed(!collapsed);
      // Close expanded section and popup menu when toggling collapse
      if (!collapsed) {
        setExpandedSection(null);
      }
      setPopupMenu({ ...popupMenu, visible: false });
      
      // Notify parent about collapse change
      if (onCollapseChange) {
        onCollapseChange(!collapsed);
      }
    }
  };
  
  // Handle logout
  const handleLogout = () => {
    logout();
  };
  
  // Sidebar classes based on theme
  const sidebarClasses = sidebarDarkMode
    ? 'bg-[#21263C] text-white border-r border-gray-700'
    : 'bg-surface text-base-dark border-r border-gray-200';
  
  // Navigation items
  const navigationItems = [
    {
      section: 'dashboard',
      title: 'Dashboard',
      icon: <DashboardIcon />,
      path: '/',
      exact: true,
    },
    {
      section: 'accounting',
      title: 'Accounting',
      icon: <AccountingIcon />,
      children: [
        { title: 'Dashboard', path: '/accounting' },
        { title: 'General Ledger', path: '/accounting/general-ledger' },
        { title: 'Accounts Payable', path: '/accounting/accounts-payable' },
        { title: 'Accounts Receivable', path: '/accounting/accounts-receivable' },
      ],
    },
    {
      section: 'transactions',
      title: 'Transactions',
      icon: <TransactionsIcon />,
      children: [
        { title: 'Journal Entries', path: '/transactions/journal-entries' },
        { title: 'Cash Book', path: '/transactions/cash-book' },
        { title: 'Bank Book', path: '/transactions/bank-book' },
        { title: 'Purchase Book', path: '/transactions/purchase-book' },
        { title: 'Sales Book', path: '/transactions/sales-book' },
        { title: 'Petty Cash', path: '/transactions/petty-cash' },
      ],
    },
    {
      section: 'masterData',
      title: 'Master Data',
      icon: <MasterDataIcon />,
      children: [
        { title: 'Chart of Accounts', path: '/master-data/chart-of-accounts' },
        { title: 'Cost Centers', path: '/master-data/cost-centers' },
        { title: 'Templates', path: '/master-data/templates' },
        { title: 'Tax Codes', path: '/master-data/tax-codes' },
        { title: 'Currencies', path: '/master-data/currencies' },
      ],
    },
    {
      section: 'reporting',
      title: 'Reporting',
      icon: <ReportingIcon />,
      children: [
        { title: 'Trial Balance', path: '/reporting/trial-balance' },
        { title: 'Balance Sheet', path: '/reporting/balance-sheet' },
        { title: 'Profit & Loss', path: '/reporting/profit-and-loss' },
        { title: 'Cash Flow', path: '/reporting/cash-flow' },
        { title: 'General Ledger', path: '/reporting/general-ledger' },
        { title: 'Aging Reports', path: '/reporting/aging-reports' },
      ],
    },
    {
      section: 'administration',
      title: 'Administration',
      icon: <AdminIcon />,
      children: [
        { title: 'User Management', path: '/administration/user-management' },
        { title: 'Tenant Settings', path: '/administration/tenant-settings' },
        { title: 'Roles & Permissions', path: '/administration/roles-permissions' },
        { title: 'Audit Trail', path: '/administration/audit-trail' },
        { title: 'System Settings', path: '/administration/system-settings' },
      ],
    },
  ];
  
  // Check if a path is active (exact match only)
  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname === path;
  };
  
  // Check if a section should be highlighted (only if current route is in that section)
  const isSectionActive = (section) => {
    const path = location.pathname;
    if (section === 'dashboard') {
      return path === '/';
    }
    if (section === 'accounting') {
      return path.startsWith('/accounting');
    }
    if (section === 'transactions') {
      return path.startsWith('/transactions');
    }
    if (section === 'masterData') {
      return path.startsWith('/master-data');
    }
    if (section === 'reporting') {
      return path.startsWith('/reporting');
    }
    if (section === 'administration') {
      return path.startsWith('/administration');
    }
    return false;
  };
  
  return (
    <>
      <aside 
        className={`${sidebarClasses} ${isCollapsed ? 'w-20' : 'w-56'} h-screen flex flex-col transition-all duration-300 ease-in-out overflow-hidden`}
      >
      {/* Logo Section */}
      <div className={`${isCollapsed ? 'h-16 px-3' : 'h-16 px-3'} flex items-center justify-center border-b ${sidebarDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex flex-col items-center">
          {isCollapsed ? (
            <img 
              src="/src/Images/Favicon.png" 
              alt="Logo" 
              className="h-10 w-auto transition-all duration-300" 
            />
          ) : (
            <img 
              src="/src/Images/Logo.png" 
              alt="Logo" 
              className="h-10 w-auto transition-all duration-300" 
            />
          )}
        </div>
      </div>
      
      {/* Navigation */}
      <nav className={`flex-1 overflow-y-auto py-3 ${isCollapsed ? 'px-1' : 'px-2'}`}>
        <ul className={`${isCollapsed ? 'space-y-1.5' : 'space-y-0.5'}`}>
          {navigationItems.map((item) => {
            const active = isActive(item.path);
            const sectionActive = isSectionActive(item.section);
            const expanded = expandedSection === item.section;
            
            // Base classes for all nav items
            const baseClasses = `flex items-center ${isCollapsed ? 'p-1.5' : 'p-3'} rounded-lg transition-colors duration-200`;
            
            // Active and inactive classes based on theme
            const activeClasses = "bg-[#408DFB]/10 text-[#408DFB]";
            const inactiveClasses = sidebarDarkMode
              ? "text-gray-300 hover:bg-gray-700 hover:text-white"
              : "text-base-dark hover:bg-background hover:text-base-dark";
            
            // Classes for the main nav item - only highlight if section is active
            const itemClasses = `${baseClasses} ${sectionActive ? activeClasses : inactiveClasses}`;
            
            return (
              <li key={item.section}>
                {item.children ? (
                  <>
                    <button
                      onClick={(e) => toggleSection(item.section, e)}
                      className={`${itemClasses} w-full ${isCollapsed ? 'flex-col py-1.5' : 'justify-between'} nav-button`}
                    >
                      <div className={`flex ${isCollapsed ? 'flex-col items-center' : 'items-center'}`}>
                        <span className="flex-shrink-0">{React.cloneElement(item.icon, { collapsed: isCollapsed })}</span>
                        {isCollapsed ? 
                          <span className="mt-0.5 text-[10px] truncate max-w-[50px]" title={item.title}>{item.title}</span> :
                          <span className="ml-3">{item.title}</span>
                        }
                      </div>
                      {!isCollapsed ? (
                        <svg
                          className={`w-4 h-4 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      ) : (
                        <svg 
                          className="w-3 h-3 absolute right-1 top-1 opacity-70"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      )}
                    </button>
                    
                    {/* Submenu - Only show when sidebar is expanded */}
                    {expanded && !isCollapsed && (
                      <ul className="mt-0.5 pl-3 space-y-0.5">
                        {item.children.map((child) => {
                          const childActive = isActive(child.path);
                          const childClasses = `${baseClasses} ${childActive ? activeClasses : inactiveClasses}`;
                          
                          return (
                            <li key={child.path}>
                              <Link to={child.path} className={childClasses}>
                                <span className="w-1.5 h-1.5 rounded-full bg-current mr-2"></span>
                                <span>{child.title}</span>
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </>
                ) : (
                  <Link to={item.path} className={`${itemClasses} ${isCollapsed ? 'flex-col py-1.5 items-center' : ''}`}>
                    <span className="flex-shrink-0">{React.cloneElement(item.icon, { collapsed: isCollapsed })}</span>
                    {isCollapsed ? 
                      <span className="mt-0.5 text-[10px] truncate max-w-[60px]" title={item.title}>{item.title}</span> :
                      <span className="ml-3">{item.title}</span>
                    }
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
      
      {/* Bottom Section */}
      <div className={`${isCollapsed ? 'p-1.5' : 'p-3'} border-t ${sidebarDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        {/* Collapse Button */}
        <button
          onClick={toggleCollapse}
          disabled={forceCollapsed}
          className={`flex items-center justify-center w-full ${isCollapsed ? 'p-1.5' : 'p-2'} rounded-lg ${sidebarDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-base-dark hover:bg-background'} transition-colors duration-200 ${forceCollapsed ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <CollapseIcon collapsed={isCollapsed} />
        </button>
      </div>
    </aside>

    {/* Popup Menu */}
    {popupMenu.visible && isCollapsed && (
      <div 
        className="popup-menu fixed z-50 animate-fadeIn" 
        style={{
          top: `${popupMenu.position.top}px`,
          left: `${popupMenu.position.left}px`
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Triangle pointer */}
        <div 
          className="absolute w-0 h-0 border-solid" 
          style={{
            top: '15px',
            left: '-8px',
            borderWidth: '8px 8px 8px 0',
            borderColor: `transparent ${sidebarDarkMode ? '#21263C' : 'white'} transparent transparent`,
            filter: 'drop-shadow(-2px 0px 2px rgba(0,0,0,0.05))'
          }}
          onClick={(e) => e.stopPropagation()}
        ></div>
        <div 
          className={`${sidebarDarkMode ? 'bg-[#21263C] text-white border border-gray-700' : 'bg-surface text-base-dark border border-gray-200'} rounded-lg overflow-hidden shadow-lg w-56`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Popup Header */}
          <div 
            className={`px-4 py-3 font-medium border-b ${sidebarDarkMode ? 'border-gray-700' : 'border-gray-200'} flex items-center ${sidebarDarkMode ? 'bg-primary/5' : 'bg-primary/5'} ${
              isSectionActive(popupMenu.section) ? 'text-[#408DFB]' : sidebarDarkMode ? 'text-gray-300' : 'text-base-dark'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {(() => {
              const item = navigationItems.find(item => item.section === popupMenu.section);
              return (
                <>
                  <span className="mr-2">{React.cloneElement(item?.icon, { collapsed: false, className: 'w-5 h-5' })}</span>
                  <span>{item?.title}</span>
                </>
              );
            })()} 
          </div>
          <ul className="py-1.5 space-y-0.5" onClick={(e) => e.stopPropagation()}>
            {navigationItems.find(item => item.section === popupMenu.section)?.children?.map((child) => {
              const childActive = isActive(child.path);
              const childClasses = `flex items-center px-4 py-2.5 ${childActive ? 'bg-[#408DFB]/10 text-[#408DFB] font-medium' : sidebarDarkMode ? 'text-gray-300 hover:bg-gray-700/70 hover:text-white' : 'text-base-dark hover:bg-gray-100 hover:text-base-dark'} transition-colors duration-150 rounded-md mx-1`;
              
              return (
                <li key={child.path}>
                  <Link 
                    to={child.path} 
                    className={childClasses}
                    onClick={(e) => {
                      e.stopPropagation();
                      setPopupMenu({ ...popupMenu, visible: false });
                    }}
                  >
                    <span className={`w-2 h-2 rounded-full ${childActive ? 'bg-[#408DFB]' : 'bg-current opacity-70'} mr-3`}></span>
                    <span className={`${childActive ? 'font-medium' : ''}`}>{child.title}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    )}
    </>
  );
};

export default Sidebar;