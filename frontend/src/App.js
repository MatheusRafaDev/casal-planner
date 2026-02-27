import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// Layout
import Layout from './components/Layout';

// Páginas (✅ APENAS AS QUE EXISTEM)
import Home from './pages/Home';
import Perfil from './pages/Perfil';
import Login from './components/Login';

import GlobalStyle from './styles/GlobalStyle';

function AppRoutes() {
  const { estaAutenticado, loading } = useAuth();

  if (loading) {
    return <div className="loading">Carregando...</div>;
  }

  if (!estaAutenticado) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/perfil" element={<Perfil />} />
      </Routes>
    </Layout>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <GlobalStyle />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/*" element={<AppRoutes />} />
          </Routes>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;