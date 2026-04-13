import React, { Suspense } from 'react';
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
import styled, { keyframes } from 'styled-components';

import usePageTitle from './hooks/usePageTitle';
import useNetworkStatus from './hooks/useNetworkStatus';

// Lazy load das páginas — divide o bundle e carrega sob demanda
const Planejamento = React.lazy(() => import('./pages/Planejamento'));
const Perfil        = React.lazy(() => import('./pages/Perfil'));
const Home          = React.lazy(() => import('./pages/Home'));
const Login         = React.lazy(() => import('./pages/Login'));



// ── Loading screen ──────────────────────────────────────────
const spin = keyframes`to { transform: rotate(360deg); }`;

const LoadingScreen = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  height: 100vh;
  background: ${(p) => p.theme?.background || '#F9FAFB'};
`;

const Spinner = styled.div`
  width: 36px;
  height: 36px;
  border: 3px solid ${(p) => p.theme?.border || '#e5e7eb'};
  border-top-color: ${(p) => p.theme?.primary || '#A78BFA'};
  border-radius: 50%;
  animation: ${spin} 0.8s linear infinite;
`;

const LoadingLabel = styled.p`
  font-size: 0.875rem;
  color: ${(p) => p.theme?.textSoft || '#6b7280'};
  margin: 0;
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

// ── Rotas ───────────────────────────────────────────────────
const PrivateRoute = ({ children }) => {
  const { estaAutenticado, loading } = useAuth();
  const { theme } = useTheme();
  if (loading) return (
    <LoadingScreen theme={theme}>
      <Spinner theme={theme} />
      <LoadingLabel theme={theme}>Carregando…</LoadingLabel>
    </LoadingScreen>
  );
  return estaAutenticado ? children : <Navigate to="/login" />;
};

const PublicRoute = ({ children }) => {
  const { estaAutenticado, loading } = useAuth();
  const { theme } = useTheme();
  if (loading) return (
    <LoadingScreen theme={theme}>
      <Spinner theme={theme} />
      <LoadingLabel theme={theme}>Carregando…</LoadingLabel>
    </LoadingScreen>
  );
  return !estaAutenticado ? children : <Navigate to="/planejamento" />;
};

// Fallback do Suspense — mesmo visual do loading de auth
const PageFallback = () => {
  const { theme } = useTheme();
  return (
    <LoadingScreen theme={theme}>
      <Spinner theme={theme} />
    </LoadingScreen>
  );
};

const AppRoutes = () => {
  const { loading } = useAuth();
  const { theme } = useTheme();
  usePageTitle();
  useNetworkStatus(); // Monitora conexão mobile

  if (loading) return (
    <LoadingScreen theme={theme}>
      <Spinner theme={theme} />
      <LoadingLabel theme={theme}>Carregando…</LoadingLabel>
    </LoadingScreen>
  );

  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        <Route path="/" element={<PublicRoute><Home /></PublicRoute>} />
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route
          path="/planejamento"
          element={
            <PrivateRoute>
              <AppContainer>
                <Header />
                <MainContent><Planejamento /></MainContent>
                <BottomNav />
              </AppContainer>
            </PrivateRoute>
          }
        />
        <Route
          path="/perfil"
          element={
            <PrivateRoute>
              <AppContainer>
                <Header />
                <MainContent><Perfil /></MainContent>
                <BottomNav />
              </AppContainer>
            </PrivateRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};

// ── Wrapper de tema ─────────────────────────────────────────
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
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: '12px',
            fontWeight: 500,
            fontSize: '0.9rem',
            maxWidth: '90vw',
          },
          success: { iconTheme: { primary: theme.primary, secondary: '#fff' } },
        }}
        containerStyle={{
          // Desce um pouco em mobile para não cobrir conteúdo importante
          top: 'max(env(safe-area-inset-top, 0px) + 8px, 16px)',
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
          <ThemeProvider>
            <StyledThemeWrapper />
          </ThemeProvider>
        </AuthProvider>
      </BrowserRouter>
    </StyleSheetManager>
  );
}

export default App;
