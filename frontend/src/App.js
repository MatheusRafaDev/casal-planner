import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import styled from 'styled-components';
import { StyleSheetManager } from 'styled-components';
import isPropValid from '@emotion/is-prop-valid';
import { Toaster } from 'react-hot-toast';
import { ConfirmProvider } from './context/ConfirmContext';
import ConfirmModal from './components/ConfirmModal';
import Header from './components/Header';
import usePageTitle from './hooks/usePageTitle';

import Planejamento from './pages/Planejamento';
import Perfil from './pages/Perfil';
import Home from './pages/Home';
import Login from './pages/Login';

import GlobalStyle from './styles/GlobalStyle';

const LoadingScreen = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: ${props => props.theme.background};
  color: ${props => props.theme.primary};
  font-size: 1.2rem;
`;

const AppContainer = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.background};
`;

const MainContent = styled.main`
  max-width: 1600px;
  margin: 0 auto;
  padding: 2rem 20px;

  @media (max-width: 768px) {
    padding: 1rem 15px;
  }
`;

function PrivateRoute({ children }) {
  const { estaAutenticado, loading } = useAuth();
  
  if (loading) {
    return <LoadingScreen>Carregando...</LoadingScreen>;
  }
  
  return estaAutenticado ? children : <Navigate to="/login" />;
}

function PublicRoute({ children }) {
  const { estaAutenticado, loading } = useAuth();
  
  if (loading) {
    return <LoadingScreen>Carregando...</LoadingScreen>;
  }
  
  return !estaAutenticado ? children : <Navigate to="/planejamento" />;
}

function AppRoutes() {
  const { loading } = useAuth();
  usePageTitle();


  if (loading) {
    return <LoadingScreen>Carregando...</LoadingScreen>;
  }

  return (
    <Routes>
      <Route path="/" element={
        <PublicRoute>
          <Home />
        </PublicRoute>
      } />
      
      <Route path="/login" element={
        <PublicRoute>
          <Login />
        </PublicRoute>
      } />
      
      <Route path="/planejamento" element={
        <PrivateRoute>
          <AppContainer>
            <Header />
            <MainContent>
              <Planejamento />
            </MainContent>
          </AppContainer>
        </PrivateRoute>
      } />
      
      <Route path="/perfil" element={
        <PrivateRoute>
          <AppContainer>
            <Header />
            <MainContent>
              <Perfil />
            </MainContent>
          </AppContainer>
        </PrivateRoute>
      } />
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
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
        }}
      />
    </StyledThemeProvider>
  );
}

function App() {
  return (
    <StyleSheetManager shouldForwardProp={isPropValid}>
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
    </StyleSheetManager>
  );
}

export default App;