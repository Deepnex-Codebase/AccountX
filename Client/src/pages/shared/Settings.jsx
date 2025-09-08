import { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

const Settings = () => {
  const {
    sidebarDarkMode,
    navbarDarkMode,
    toggleSidebarTheme,
    toggleNavbarTheme,
    toggleBothThemes,
  } = useTheme();
  
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>
      
      <div className="card mb-8">
        <h2 className="text-xl font-semibold mb-4">Appearance</h2>
        
        <div className="space-y-6">
          {/* Theme Settings */}
          <div>
            <h3 className="text-lg font-medium mb-4">Theme Settings</h3>
            
            <div className="space-y-4">
              {/* Sidebar Theme */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Sidebar Dark Mode</p>
                  <p className="text-sm text-muted">Enable dark mode for the sidebar</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={sidebarDarkMode}
                    onChange={toggleSidebarTheme}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
              
              {/* Navbar Theme */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Navbar Dark Mode</p>
                  <p className="text-sm text-muted">Enable dark mode for the top navigation bar</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={navbarDarkMode}
                    onChange={toggleNavbarTheme}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
              
              {/* Toggle Both */}
              <div className="pt-2">
                <button
                  onClick={toggleBothThemes}
                  className="btn btn-outline"
                >
                  {sidebarDarkMode && navbarDarkMode
                    ? 'Switch Both to Light Mode'
                    : 'Switch Both to Dark Mode'}
                </button>
              </div>
            </div>
          </div>
          
          <hr className="border-gray-200" />
          
          {/* Font Size */}
          <div>
            <h3 className="text-lg font-medium mb-4">Text Size</h3>
            
            <div className="flex items-center space-x-4">
              <button className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100">
                <span className="text-sm">A</span>
              </button>
              <button className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100">
                <span className="text-base">A</span>
              </button>
              <button className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100">
                <span className="text-lg">A</span>
              </button>
              <button className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100">
                <span className="text-xl">A</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Account Preferences</h2>
        
        <div className="space-y-6">
          {/* Language */}
          <div>
            <h3 className="text-lg font-medium mb-4">Language</h3>
            
            <select className="form-input">
              <option value="en">English</option>
              <option value="hi">Hindi</option>
              <option value="es">Spanish</option>
            </select>
          </div>
          
          <hr className="border-gray-200" />
          
          {/* Notifications */}
          <div>
            <h3 className="text-lg font-medium mb-4">Notifications</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Email Notifications</p>
                  <p className="text-sm text-muted">Receive email notifications for important updates</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Push Notifications</p>
                  <p className="text-sm text-muted">Receive push notifications in the browser</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;