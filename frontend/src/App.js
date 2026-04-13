// frontend/src/App.jsx (versão simplificada sem routes separado)
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { StyleSheetManager } from 'styled-components';
import isPropValid from '@emotion/is-prop-valid';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import { ConfirmProvider } from './context/ConfirmContext';
import ConfirmModal from './components/ConfirmModal';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import GlobalStyle from './styles/GlobalStyle';
import styled from 'styled-components';

// Pages
import Planejamento from './pages/Planejamento';
import Perfil from './pages/Perfil';
import Home from './pages/Home';
import Login from './pages/Login';
import usePageTitle from './hooks/usePageTitle';

// Styled Components
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
    padding: 1rem 15px 5rem;
  }
`;

// Componentes de rota
const PrivateRoute = ({ children }) => {
  const { estaAutenticado, loading } = useAuth();
  if (loading) return <LoadingScreen>Carregando...</LoadingScreen>;
  return estaAutenticado ? children : <Navigate to="/login" />;
};

const PublicRoute = ({ children }) => {
  const { estaAutenticado, loading } = useAuth();
  if (loading) return <LoadingScreen>Carregando...</LoadingScreen>;
  return !estaAutenticado ? children : <Navigate to="/planejamento" />;
};

// Componente principal de rotas
const AppRoutes = () => {
  const { loading } = useAuth();
  usePageTitle();

  if (loading) return <LoadingScreen>Carregando...</LoadingScreen>;

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
            <BottomNav />
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
            <BottomNav />
          </AppContainer>
        </PrivateRoute>
      } />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

// Wrapper de tema
const StyledThemeWrapper = () => {
  const { theme } = useTheme();
  return (
    <StyledThemeProvider theme={theme}>
      <GlobalStyle />
      <ConfirmProvider>
        <AppRoutes />
        <ConfirmModal theme={theme} />
      </ConfirmProvider>
      <Toaster position="top-right" />
    </StyledThemeProvider>
  );
};

// App principal
function App() {
  return (
    <StyleSheetManager shouldForwardProp={isPropValid}>
      <BrowserRouter>
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