import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext'; // ✅ Import useTheme
import styled from 'styled-components';

// Componentes
import Header from './components/Header';

// Páginas
import Inicio from './pages/Inicio';
import Perfil from './pages/Perfil';
import Home from './pages/Home';
import Login from './pages/Login';

import GlobalStyle from './styles/GlobalStyle';

// Container principal
const AppContainer = styled.div`
  min-height: 100vh;
  background: ${props => props.theme.background};
`;

// Conteúdo principal (para dar espaço do header)
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
  const { theme } = useTheme(); // ✅ Agora funciona

  if (loading) {
    return <div className="loading">Carregando...</div>;
  }

  // Rotas PÚBLICAS (usuário NÃO logado) - SEM HEADER
  if (!estaAutenticado) {
    return (
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  // Rotas PRIVADAS (usuário logado) - COM HEADER GLOBAL
  return (
    <AppContainer theme={theme}>
      <Header />
      <MainContent theme={theme}>
        <Routes>
          <Route path="/inicio" element={<Inicio />} />
          <Route path="/perfil" element={<Perfil />} />
          <Route path="*" element={<Navigate to="/inicio" replace />} />
        </Routes>
      </MainContent>
    </AppContainer>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <GlobalStyle />
          <AppRoutes />
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;