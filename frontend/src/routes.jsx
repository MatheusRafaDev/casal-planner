// frontend/src/routes.jsx
import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./context/AuthContext"; 
import { useTheme } from "./context/ThemeContext";


// Components
import Header from "./components/Header";
import BottomNav from "./components/BottomNav";

// Pages
import Planejamento from "./pages/Planejamento";
import Perfil from "./pages/Perfil";
import Home from "./pages/Home";
import Inicio from "./pages/Inicio";
import Login from "./pages/Login";
import EsqueciSenha from "./pages/RecuperarSenha";

// Hooks
import usePageTitle from "./hooks/usePageTitle";
import { AppContainer, MainContent, LoadingScreen, PageWrapper } from "./styles/RoutesStyles";

// Componentes de Rota
export const PrivateRoute = ({ children }) => {
  const { estaAutenticado, loading } = useAuth();
  const { theme } = useTheme();

  if (loading) {
    return <LoadingScreen theme={theme}>Carregando...</LoadingScreen>;
  }

  return estaAutenticado ? children : <Navigate to="/login" replace />;
};

export const PublicRoute = ({ children }) => {
  const { estaAutenticado, loading } = useAuth();
  const { theme } = useTheme();

  if (loading) {
    return <LoadingScreen theme={theme}>Carregando...</LoadingScreen>;
  }

  return !estaAutenticado ? children : <Navigate to="/inicio" replace />;
};

// Layouts
const PublicLayout = ({ children }) => {
  return <PageWrapper>{children}</PageWrapper>;
};

const PrivateLayout = ({ children }) => {
  const location = useLocation();
  
  return (
    <AppContainer>
      <Header />
      <MainContent>
        <PageWrapper key={location.pathname}>
          {children}
        </PageWrapper>
      </MainContent>
      <BottomNav />
    </AppContainer>
  );
};

// Componente principal de rotas
export const AppRoutes = () => {
  const { loading } = useAuth();
  const { theme } = useTheme();
  usePageTitle();

  if (loading) {
    return <LoadingScreen theme={theme}>Carregando...</LoadingScreen>;
  }

  return (
    <Routes>
      {/* ========== ROTAS PÚBLICAS ========== */}
      
      {/* Home/Landing Page */}
      <Route 
        path="/" 
        element={
          <PublicRoute>
            <PublicLayout>
              <Home />
            </PublicLayout>
          </PublicRoute>
        } 
      />
      
      {/* Login */}
      <Route 
        path="/login" 
        element={
          <PublicRoute>
            <PublicLayout>
              <Login />
            </PublicLayout>
          </PublicRoute>
        } 
      />
      
      {/* Recuperar Senha */}
      <Route 
        path="/recuperar-senha" 
        element={
          <PublicRoute>
            <PublicLayout>
              <EsqueciSenha />
            </PublicLayout>
          </PublicRoute>
        } 
      />

      {/* ========== ROTAS PRIVADAS (REQUER AUTENTICAÇÃO) ========== */}
      
      {/* Início / Dashboard */}
      <Route 
        path="/inicio" 
        element={
          <PrivateRoute>
            <PrivateLayout>
              <Inicio />
            </PrivateLayout>
          </PrivateRoute>
        } 
      />
      
      {/* Planejamento */}
      <Route 
        path="/planejamento" 
        element={
          <PrivateRoute>
            <PrivateLayout>
              <Planejamento />
            </PrivateLayout>
          </PrivateRoute>
        } 
      />
      
      {/* Perfil */}
      <Route 
        path="/perfil" 
        element={
          <PrivateRoute>
            <PrivateLayout>
              <Perfil />
            </PrivateLayout>
          </PrivateRoute>
        } 
      />

      {/* ========== ROTA 404 ========== */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};