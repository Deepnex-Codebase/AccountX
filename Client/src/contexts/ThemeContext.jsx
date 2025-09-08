import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  // Only sidebar and navbar can have dark mode as per PRD
  const [sidebarDarkMode, setSidebarDarkMode] = useState(true);
  const [navbarDarkMode, setNavbarDarkMode] = useState(true);
  
  // Load theme preferences from localStorage on initial render
  useEffect(() => {
    const storedSidebarTheme = localStorage.getItem('sidebarDarkMode');
    const storedNavbarTheme = localStorage.getItem('navbarDarkMode');
    
    if (storedSidebarTheme) {
      setSidebarDarkMode(storedSidebarTheme === 'true');
    }
    
    if (storedNavbarTheme) {
      setNavbarDarkMode(storedNavbarTheme === 'true');
    }
  }, []);
  
  // Toggle sidebar dark mode
  const toggleSidebarTheme = () => {
    const newValue = !sidebarDarkMode;
    setSidebarDarkMode(newValue);
    localStorage.setItem('sidebarDarkMode', newValue.toString());
  };
  
  // Toggle navbar dark mode
  const toggleNavbarTheme = () => {
    const newValue = !navbarDarkMode;
    setNavbarDarkMode(newValue);
    localStorage.setItem('navbarDarkMode', newValue.toString());
  };
  
  // Toggle both sidebar and navbar dark mode together
  const toggleBothThemes = () => {
    const newNavbarValue = !navbarDarkMode;
    const newSidebarValue = !sidebarDarkMode;
    
    // When navbar is light, sidebar should be dark and vice versa
    setNavbarDarkMode(newNavbarValue);
    setSidebarDarkMode(!newNavbarValue);
    
    localStorage.setItem('navbarDarkMode', newNavbarValue.toString());
    localStorage.setItem('sidebarDarkMode', (!newNavbarValue).toString());
  };
  
  const value = {
    sidebarDarkMode,
    navbarDarkMode,
    toggleSidebarTheme,
    toggleNavbarTheme,
    toggleBothThemes,
  };
  
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};