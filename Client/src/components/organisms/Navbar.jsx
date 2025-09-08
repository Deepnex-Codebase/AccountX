import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useChatWindow } from '../../contexts/ChatWindowContext';

// SVG Icons
const SearchIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const BellIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
);

const SettingsIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const SunIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const MoonIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
  </svg>
);

const UserIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const ChevronDownIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

const ChatIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a9.954 9.954 0 01-4.951-1.322A3.5 3.5 0 013 13.5V7a4 4 0 014-4h9a4 4 0 014 4v5z" />
  </svg>
);

const LogoutIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);

const Navbar = () => {
  const { navbarDarkMode, toggleBothThemes } = useTheme();
  const { user, logout } = useAuth();
  const { isOpen, isPinned, toggleChat, unpinChat } = useChatWindow();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchWidth, setSearchWidth] = useState('w-60');
  const location = useLocation();
  
  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showProfileMenu && !event.target.closest('.profile-dropdown')) {
        setShowProfileMenu(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showProfileMenu]);
  
  // Close profile menu when navigating
  useEffect(() => {
    setShowProfileMenu(false);
  }, [location]);
  
  // Navbar theme classes based on PRD color palette
  const navbarClasses = navbarDarkMode
    ? 'bg-base-dark text-white border-b border-gray-800 shadow-md'
    : 'bg-surface border-b border-gray-200 shadow-sm';
  
  return (
    <header className={`h-16 flex items-center justify-between px-6 ${navbarClasses} transition-colors duration-200 sticky top-0 z-50 shadow-card`}>
      {/* Left side - Breadcrumbs or page title */}
      <div className="flex items-center">
        <h1 className="text-lg font-medium">
          {/* Dynamic page title based on route */}
          {location.pathname === '/' && 'Dashboard'}
          {location.pathname.includes('/accounting') && 'Accounting'}
          {location.pathname.includes('/transactions') && 'Transactions'}
          {location.pathname.includes('/master-data') && 'Master Data'}
          {location.pathname.includes('/reporting') && 'Reporting'}
          {location.pathname.includes('/administration') && 'Administration'}
          {location.pathname.includes('/settings') && 'Settings'}
          {location.pathname.includes('/profile') && 'Profile'}
        </h1>
      </div>
      
      {/* Right side - Search, notifications, settings, profile */}
      <div className="flex items-center space-x-5">
       
        
        {/* Notifications */}
        <button className="p-2.5 rounded-lg hover:bg-background dark:hover:bg-gray-700 transition-colors duration-200 hover:text-primary dark:hover:text-white relative">
          <BellIcon />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-error rounded-full border-2 border-surface dark:border-base-dark"></span>
        </button>
        
        {/* Chat Toggle */}
        <button 
          onClick={() => {
            if (isPinned && isOpen) {
              // If chat is pinned and open, unpin it
              unpinChat();
            } else {
              // Otherwise, toggle normally
              toggleChat();
            }
          }}
          className={`p-2.5 rounded-lg transition-colors duration-200 ${
            isOpen 
              ? 'bg-primary text-white hover:bg-primary/90' 
              : 'hover:bg-background dark:hover:bg-gray-700 hover:text-primary dark:hover:text-white'
          }`}
          aria-label={isPinned && isOpen ? "Unpin chat window" : "Toggle chat window"}
        >
          <ChatIcon />
        </button>
        
        {/* Settings */}
        <Link to="/settings" className="p-2.5 rounded-lg hover:bg-background dark:hover:bg-gray-700 transition-colors duration-200 hover:text-primary dark:hover:text-white">
          <SettingsIcon />
        </Link>
        
        {/* Dark Mode Toggle */}
        <button
          onClick={toggleBothThemes}
          className="p-2.5 rounded-lg hover:bg-background dark:hover:bg-gray-700 transition-colors duration-200 hover:text-primary dark:hover:text-white"
          aria-label={navbarDarkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
          {navbarDarkMode ? <SunIcon /> : <MoonIcon />}
        </button>
        
        {/* Profile Dropdown */}
        <div className="relative profile-dropdown">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center space-x-3 p-2 rounded-lg hover:bg-background dark:hover:bg-gray-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/40 dark:focus:ring-primary/30 dark:focus:ring-offset-base-dark"
            aria-expanded={showProfileMenu}
            aria-haspopup="true"
          >
            <div className="w-9 h-9 rounded-full bg-primary/10 dark:bg-primary/30 flex items-center justify-center text-primary dark:text-primary font-bold text-sm border-2 border-primary/20 dark:border-primary/40 shadow-sm">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="hidden md:block text-left">
              <p className="font-medium text-sm">{user?.name || 'User'}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">{user?.email || 'user@example.com'}</p>
            </div>
            <ChevronDownIcon className="w-4 h-4 dark:text-white" />
          </button>
          
          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-60 bg-surface dark:bg-base-dark rounded-xl shadow-xl py-1.5 z-10 border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-200 ease-in-out transform origin-top-right">
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-background dark:bg-gray-800">
                <p className="text-sm font-medium">{user?.name || 'User'}</p>
                <p className="text-xs text-gray-600 dark:text-gray-300">{user?.email || 'user@example.com'}</p>
              </div>
              
              <Link
                to="/profile"
                className="flex items-center px-4 py-2.5 text-sm hover:bg-background dark:hover:bg-gray-700 transition-colors duration-200"
                onClick={() => setShowProfileMenu(false)}
              >
                <UserIcon className="w-4 h-4 mr-3 dark:text-white" />
                Your Profile
              </Link>
              <Link
                to="/settings"
                className="flex items-center px-4 py-2.5 text-sm hover:bg-background dark:hover:bg-gray-700 transition-colors duration-200"
                onClick={() => setShowProfileMenu(false)}
              >
                <SettingsIcon className="w-4 h-4 mr-3 dark:text-white" />
                Settings
              </Link>
              <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  logout();
                }}
                className="flex items-center w-full text-left px-4 py-2.5 text-sm text-error dark:text-error hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200 font-medium"
              >
                <LogoutIcon className="w-4 h-4 mr-3 dark:text-white" />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;