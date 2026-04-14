import React, { createContext, useState, useContext, useEffect } from 'react';
import { lightTheme, darkTheme } from '../styles/theme';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

// ThemeProvider recebe isLogado como prop para evitar dependência circular
export const ThemeProvider = ({ children, isLogado }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (!isLogado) return true; // deslogado: sempre dark
    const saved = localStorage.getItem('darkMode');
    return saved !== null ? JSON.parse(saved) : true; // padrão dark
  });

  // Se deslogou, força dark mode
  useEffect(() => {
    if (!isLogado) {
      setIsDarkMode(true);
    }
  }, [isLogado]);

  const theme = isDarkMode ? darkTheme : lightTheme;

  useEffect(() => {
    if (isLogado) {
      localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
    }
  }, [isDarkMode, isLogado]);

  const toggleTheme = () => {
    if (!isLogado) return; // bloqueado para deslogados
    setIsDarkMode(prev => !prev);
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme, theme, canToggleTheme: isLogado }}>
      {children}
    </ThemeContext.Provider>
  );
};
