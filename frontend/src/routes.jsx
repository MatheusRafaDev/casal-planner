// frontend/src/routes.jsx
import React, { Suspense } from "react";
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
import { AppContainer, MainContent, PageWrapper } from "./styles/RoutesStyles";

// ─── Skeleton ────────────────────────────────────────────────────────────────

const shimmer = `
  @keyframes shimmer {
    0%   { background-position: -600px 0; }
    100% { background-position:  600px 0; }
  }
`;

const SkeletonBlock = ({ width = "100%", height = "1rem", radius = "6px", style = {} }) => (
  <div
    style={{
      width,
      height,
      borderRadius: radius,
      background: "linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%)",
      backgroundSize: "600px 100%",
      animation: "shimmer 1.4s infinite linear",
      ...style,
    }}
  />
);

// Skeleton para rotas PÚBLICAS (sem Header/BottomNav)
const PublicSkeleton = () => (
  <>
    <style>{shimmer}</style>
    <div style={{ minHeight: "100vh", padding: "2rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <SkeletonBlock width="160px" height="2rem" />
      <SkeletonBlock height="3rem" />
      <SkeletonBlock height="3rem" />
      <SkeletonBlock width="80%" height="2.5rem" radius="8px" style={{ marginTop: "1rem" }} />
    </div>
  </>
);

// Skeleton para rotas PRIVADAS (simula Header + conteúdo + BottomNav)
const PrivateSkeleton = () => (
  <>
    <style>{shimmer}</style>
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Header placeholder */}
      <div style={{ height: "56px", padding: "0 1rem", display: "flex", alignItems: "center", gap: "1rem", borderBottom: "1px solid #eee" }}>
        <SkeletonBlock width="120px" height="1.5rem" />
        <SkeletonBlock width="32px" height="32px" radius="50%" style={{ marginLeft: "auto" }} />
      </div>

      {/* Conteúdo placeholder */}
      <div style={{ flex: 1, padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
        <SkeletonBlock height="1.5rem" width="50%" />
        <SkeletonBlock height="120px" radius="12px" />
        <SkeletonBlock height="120px" radius="12px" />
        <SkeletonBlock height="80px" radius="12px" />
      </div>

      {/* BottomNav placeholder */}
      <div style={{ height: "60px", display: "flex", justifyContent: "space-around", alignItems: "center", borderTop: "1px solid #eee", padding: "0 1rem" }}>
        {[...Array(3)].map((_, i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
            <SkeletonBlock width="24px" height="24px" radius="6px" />
            <SkeletonBlock width="40px" height="10px" />
          </div>
        ))}
      </div>
    </div>
  </>
);

// ─── Auth loading skeleton (antes de saber se está autenticado) ───────────────

const AuthSkeleton = ({ isPrivate }) =>
  isPrivate ? <PrivateSkeleton /> : <PublicSkeleton />;

// ─── Route Guards ─────────────────────────────────────────────────────────────

export const PrivateRoute = ({ children }) => {
  const { estaAutenticado, loading } = useAuth();
  if (loading) return <PrivateSkeleton />;
  return estaAutenticado ? children : <Navigate to="/login" replace />;
};

export const PublicRoute = ({ children }) => {
  const { estaAutenticado, loading } = useAuth();
  if (loading) return <PublicSkeleton />;
  return !estaAutenticado ? children : <Navigate to="/inicio" replace />;
};

// ─── Layouts ──────────────────────────────────────────────────────────────────

const PublicLayout = ({ children }) => <PageWrapper>{children}</PageWrapper>;

const PrivateLayout = ({ children }) => {
  const location = useLocation();
  return (
    <AppContainer>
      <Header />
      <MainContent>
        <PageWrapper key={location.pathname}>{children}</PageWrapper>
      </MainContent>
      <BottomNav />
    </AppContainer>
  );
};

// ─── App Routes ───────────────────────────────────────────────────────────────

export const AppRoutes = () => {
  const { loading } = useAuth();
  usePageTitle();

  // Loading global inicial — ainda não sabemos a rota destino
  if (loading) return <PrivateSkeleton />;

  return (
    <Routes>
      {/* ── PÚBLICAS ── */}
      <Route path="/" element={
        <PublicRoute><PublicLayout><Home /></PublicLayout></PublicRoute>
      } />
      <Route path="/login" element={
        <PublicRoute><PublicLayout><Login /></PublicLayout></PublicRoute>
      } />
      <Route path="/recuperar-senha" element={
        <PublicRoute><PublicLayout><EsqueciSenha /></PublicLayout></PublicRoute>
      } />

      {/* ── PRIVADAS ── */}
      <Route path="/inicio" element={
        <PrivateRoute><PrivateLayout><Inicio /></PrivateLayout></PrivateRoute>
      } />
      <Route path="/planejamento" element={
        <PrivateRoute><PrivateLayout><Planejamento /></PrivateLayout></PrivateRoute>
      } />
      <Route path="/perfil" element={
        <PrivateRoute><PrivateLayout><Perfil /></PrivateLayout></PrivateRoute>
      } />

      {/* ── 404 ── */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};