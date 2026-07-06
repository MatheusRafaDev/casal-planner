import React, { createContext, useState, useContext, useEffect } from 'react';
import { lightTheme, darkTheme } from '../styles/theme.jsx';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  // Default to dark mode - will be updated on client side
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false);

  const theme = isDarkMode ? darkTheme : lightTheme;

  useEffect(() => {
    // Only run on client side
    const saved = localStorage.getItem('darkMode');
    if (saved !== null) {
      setIsDarkMode(JSON.parse(saved));
    }
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
      const meta = document.querySelector('meta[name="theme-color"]:not([media])') 
        || document.querySelector('meta[name="theme-color"]');
      if (meta) meta.setAttribute('content', isDarkMode ? '#18181B' : '#F9FAFB');
    }
  }, [isDarkMode, isHydrated]);

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme, theme }}>
      {children}
    </ThemeContext.Provider>
  );
};