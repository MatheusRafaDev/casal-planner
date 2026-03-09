// App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import styled from 'styled-components';
import { Toaster } from 'react-hot-toast';
import { ConfirmProvider } from './context/ConfirmContext';
import ConfirmModal from './components/ConfirmModal';

// Componentes
import Header from './components/Header';

// Páginas
import Inicio from './pages/Inicio';
import Perfil from './pages/Perfil';
import Home from './pages/Home';
import Login from './pages/Login';

import GlobalStyle from './styles/GlobalStyle';

// ================= CONTAINERS =================

const AppContainer = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.background};
`;

const MainContent = styled.main`
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem 20px;

  @media (max-width: 768px) {
    padding: 1rem 15px;
  }
`;

function AppRoutes() {
  const { estaAutenticado, loading } = useAuth();

  if (loading) {
    return <div className="loading">Carregando...</div>;
  }

  if (!estaAutenticado) {
    return (
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  return (
    <AppContainer>
      <Header />
      <MainContent>
        <Routes>
          <Route path="/inicio" element={<Inicio />} />
          <Route path="/perfil" element={<Perfil />} />
          <Route path="*" element={<Navigate to="/inicio" replace />} />
        </Routes>
      </MainContent>
    </AppContainer>
  );
}

function StyledThemeWrapper() {
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
        reverseOrder={false}
        gutter={8}
        toastOptions={{
          duration: 4000,
          style: {
            borderRadius: '12px',
            background: theme === 'dark' ? '#1e1e1e' : '#ffffff',
            color: theme === 'dark' ? '#e0e0e0' : '#333333',
            border: `1px solid ${theme === 'dark' ? '#333' : '#ddd'}`,
          },
          success: {
            duration: 3000,
          },
          error: {
            duration: 4000,
            icon: '',
          },
        }}
      />
    </StyledThemeProvider>
  );
}

function App() {
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <AuthProvider>
        <ThemeProvider>
          <StyledThemeWrapper />
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;