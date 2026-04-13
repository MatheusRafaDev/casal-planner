// frontend/src/routes.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { useTheme } from './context/ThemeContext';
import styled from 'styled-components';
import Header from './components/Header';
import usePageTitle from './hooks/usePageTitle';

// Pages
import Planejamento from './pages/Planejamento';
import Perfil from './pages/Perfil';
import Home from './pages/Home';
import Login from './pages/Login';

// Styled Components
const LoadingScreen = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: ${props => props.theme.background};
  color: ${props => props.theme.primary};
  font-size: 1.2rem;
  font-weight: 500;
`;

const AppContainer = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.background};
  transition: background 0.3s ease;
`;

const MainContent = styled.main`
  max-width: 1600px;
  margin: 0 auto;
  padding: 2rem 20px;

  @media (max-width: 768px) {
    padding: 1rem 15px;
  }
`;

const PageTransition = styled.div`
  animation: pageTransition 0.3s ease;

  @keyframes pageTransition {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const ScrollContainer = styled.div`
  scroll-behavior: smooth;
  overflow-y: auto;
  max-height: calc(100vh - 80px);

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: ${props => props.theme.borderLight};
    border-radius: 10px;
  }

  &::-webkit-scrollbar-thumb {
    background: ${props => props.theme.textLight};
    border-radius: 10px;
  }
`;

// Componente de Rota Privada
export const PrivateRoute = ({ children }) => {
  const { estaAutenticado, loading } = useAuth();
  
  if (loading) {
    return <LoadingScreen>Carregando...</LoadingScreen>;
  }
  
  return estaAutenticado ? children : <Navigate to="/login" replace />;
};

// Componente de Rota Pública
export const PublicRoute = ({ children }) => {
  const { estaAutenticado, loading } = useAuth();
  
  if (loading) {
    return <LoadingScreen>Carregando...</LoadingScreen>;
  }
  
  return !estaAutenticado ? children : <Navigate to="/planejamento" replace />;
};

// Layout para rotas autenticadas
const AuthenticatedLayout = ({ children }) => {
  const { theme } = useTheme();
  
  return (
    <AppContainer theme={theme}>
      <Header />
      <MainContent>
        <PageTransition>
          <ScrollContainer>
            {children}
          </ScrollContainer>
        </PageTransition>
      </MainContent>
    </AppContainer>
  );
};

// Layout para rotas públicas (sem header)
const PublicLayout = ({ children }) => {
  return (
    <PageTransition>
      {children}
    </PageTransition>
  );
};

// Componente principal de rotas
export const AppRoutes = () => {
  const { loading } = useAuth();
  usePageTitle();

  if (loading) {
    return <LoadingScreen>Carregando...</LoadingScreen>;
  }

  return (
    <Routes>
      {/* Rotas Públicas */}
      <Route path="/" element={
        <PublicRoute>
          <PublicLayout>
            <Home />
          </PublicLayout>
        </PublicRoute>
      } />
      
      <Route path="/login" element={
        <PublicRoute>
          <PublicLayout>
            <Login />
          </PublicLayout>
        </PublicRoute>
      } />
      
      {/* Rotas Protegidas */}
      <Route path="/planejamento" element={
        <PrivateRoute>
          <AuthenticatedLayout>
            <Planejamento />
          </AuthenticatedLayout>
        </PrivateRoute>
      } />
      
      <Route path="/perfil" element={
        <PrivateRoute>
          <AuthenticatedLayout>
            <Perfil />
          </AuthenticatedLayout>
        </PrivateRoute>
      } />
      
      {/* Rota 404 - Redireciona para home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

// Hook para navegação protegida
export const useProtectedNavigation = () => {
  const { estaAutenticado } = useAuth();
  
  const navigateTo = (path) => {
    if (!estaAutenticado && path !== '/login' && path !== '/') {
      return '/login';
    }
    return path;
  };
  
  return { navigateTo };
};