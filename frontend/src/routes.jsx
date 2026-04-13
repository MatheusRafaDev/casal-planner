import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { useTheme } from './context/ThemeContext';
import usePageTitle from './hooks/usePageTitle';

// Components
import Header from './components/Header';

// Pages
import Planejamento from './pages/Planejamento';
import Perfil from './pages/Perfil';
import Home from './pages/Home';
import Login from './pages/Login';

// Styles
import {
  LoadingScreen,
  AppContainer,
  MainContent,
  PageTransition,
  ScrollContainer
} from './styles/routesStyles';

// ================= ROTAS =================

// Rota privada
export const PrivateRoute = ({ children }) => {
  const { estaAutenticado, loading } = useAuth();

  if (loading) {
    return <LoadingScreen>Carregando...</LoadingScreen>;
  }

  return estaAutenticado ? children : <Navigate to="/login" replace />;
};

// Rota pública
export const PublicRoute = ({ children }) => {
  const { estaAutenticado, loading } = useAuth();

  if (loading) {
    return <LoadingScreen>Carregando...</LoadingScreen>;
  }

  return !estaAutenticado ? children : <Navigate to="/planejamento" replace />;
};

// Layout autenticado
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

// Layout público
const PublicLayout = ({ children }) => (
  <PageTransition>{children}</PageTransition>
);

// ================= APP ROUTES =================

export const AppRoutes = () => {
  const { loading } = useAuth();

  usePageTitle();

  if (loading) {
    return <LoadingScreen>Carregando...</LoadingScreen>;
  }

  return (
    <Routes>
      {/* Públicas */}
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

      {/* Privadas */}
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

      {/* 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

// Hook navegação protegida
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
