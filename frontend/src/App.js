// frontend/src/App.js
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { StyleSheetManager } from 'styled-components';
import isPropValid from '@emotion/is-prop-valid';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import { useAuth } from "./context/AuthContext";  
import useNetworkStatus from './hooks/useNetworkStatus';
// Contexts
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { ConfirmProvider } from './context/ConfirmContext';

// Components

import GlobalStyle from './styles/GlobalStyle';

// Routes
import { AppRoutes } from './routes';

// Wrapper que conecta ThemeProvider com isLogado do AuthContext
const ThemeWrapper = ({ children }) => {
  const { estaAutenticado } = useAuth();
  return (
    <ThemeProvider isLogado={estaAutenticado}>
      {children}
    </ThemeProvider>
  );
};

const StyledThemeWrapper = () => {
  const { theme } = useTheme();
  useNetworkStatus();
  return (
    <StyledThemeProvider theme={theme}>
      <GlobalStyle />
      <ConfirmProvider>
        <AppRoutes />
      </ConfirmProvider>
      <Toaster 
        /* CORREÇÃO iPhone: top-center evita notch, top-right fica atrás */
        position="top-center"
        toastOptions={{
          style: {
            background: theme.surface,
            color: theme.text,
          },
        }}
        /* CORREÇÃO iPhone: safe area inset para notch/dynamic island */
        containerStyle={{ top: 'max(16px, env(safe-area-inset-top, 16px))' }}
      />
    </StyledThemeProvider>
  );
};

function App() {
  return (
    <StyleSheetManager shouldForwardProp={isPropValid}>
      <BrowserRouter>
        <AuthProvider>
          <ThemeWrapper>
            <StyledThemeWrapper />
          </ThemeWrapper>
        </AuthProvider>
      </BrowserRouter>
    </StyleSheetManager>
  );
}

export default App;