// frontend/src/App.js
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { StyleSheetManager } from 'styled-components';
import isPropValid from '@emotion/is-prop-valid';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import { useAuth } from "./context/AuthContext";  
// Contexts
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { ConfirmProvider } from './context/ConfirmContext';

// Components
import ConfirmModal from './components/ConfirmModal';
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
  return (
    <StyledThemeProvider theme={theme}>
      <GlobalStyle />
      <ConfirmProvider>
        <AppRoutes />
        <ConfirmModal theme={theme} />
      </ConfirmProvider>
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: theme.surface,
            color: theme.text,
          },
        }}
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