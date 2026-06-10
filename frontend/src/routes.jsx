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
import { AppContainer, MainContent, PageWrapper } from "./styles/RoutesStyles";

// ─── Skeleton 2.0 - Mais profissional ─────────────────────────────────────────

const shimmerKeyframes = `
  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
`;

const SkeletonItem = ({ width, height, borderRadius = "8px", marginBottom = "0" }) => {
  const { theme } = useTheme();
  const isDark = theme !== "light";
  const bg = isDark
    ? "linear-gradient(90deg, #2a2a2a 0%, #3f3f46 50%, #2a2a2a 100%)"
    : "linear-gradient(90deg, #e8e8e8 0%, #f5f5f5 50%, #e8e8e8 100%)";

  return (
    <div
      style={{
        width: width || "100%",
        height: height || "16px",
        borderRadius,
        background: bg,
        backgroundSize: "200% 100%",
        animation: "shimmer 1.2s ease-in-out infinite",
        marginBottom,
      }}
    />
  );
};

// Skeleton para rotas PÚBLICAS
const PublicSkeleton = () => {
  const { theme } = useTheme();
  const isDark = theme !== "light";
  
  const bgColor = isDark ? "#1a1a1a" : "#ffffff";
  const cardBg = isDark ? "#2a2a2a" : "#f7f7f7";
  return (
    <>
      <style>{shimmerKeyframes}</style>
      <div style={{ 
        minHeight: "100vh", 
        backgroundColor: bgColor,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px"
      }}>
        <div style={{ 
          width: "100%", 
          maxWidth: "400px", 
          textAlign: "center" 
        }}>
          {/* Logo placeholder */}
          <div style={{ marginBottom: "40px" }}>
            <SkeletonItem width="120px" height="32px" borderRadius="8px" marginBottom="8px" />
          </div>
          
          {/* Card de login */}
          <div style={{ 
            backgroundColor: cardBg,
            borderRadius: "16px",
            padding: "32px 24px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
          }}>
            <SkeletonItem width="60%" height="24px" marginBottom="32px" />
            <SkeletonItem height="48px" borderRadius="12px" marginBottom="16px" />
            <SkeletonItem height="48px" borderRadius="12px" marginBottom="24px" />
            <SkeletonItem height="48px" borderRadius="12px" marginBottom="16px" />
            <SkeletonItem width="50%" height="16px" marginBottom="0" />
          </div>
        </div>
      </div>
    </>
  );
};

// Skeleton para rotas PRIVADAS
const PrivateSkeleton = () => {
  const { theme } = useTheme();
  const isDark = theme !== "light";
  
  const bgColor = isDark ? "#121212" : "#f8f9fa";
  const headerBg = isDark ? "#1e1e1e" : "#ffffff";
  const cardBg = isDark ? "#2a2a2a" : "#ffffff";
  return (
    <>
      <style>{shimmerKeyframes}</style>
      <div style={{ 
        minHeight: "100vh", 
        backgroundColor: bgColor,
        display: "flex", 
        flexDirection: "column" 
      }}>
        {/* Header */}
        <div style={{ 
          backgroundColor: headerBg,
          borderBottom: `1px solid ${isDark ? "#2a2a2a" : "#eee"}`,
          padding: "12px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          zIndex: 100
        }}>
          <SkeletonItem width="100px" height="28px" borderRadius="6px" />
          <SkeletonItem width="40px" height="40px" borderRadius="50%" />
        </div>

        {/* Main content */}
        <div style={{ flex: 1, padding: "20px", maxWidth: "600px", margin: "0 auto", width: "100%" }}>
          {/* Welcome section */}
          <div style={{ marginBottom: "24px" }}>
            <SkeletonItem width="70%" height="28px" marginBottom="12px" />
            <SkeletonItem width="50%" height="20px" />
          </div>

          {/* Stats cards */}
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(2, 1fr)", 
            gap: "12px",
            marginBottom: "24px"
          }}>
            <div style={{ 
              backgroundColor: cardBg,
              borderRadius: "12px",
              padding: "16px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
            }}>
              <SkeletonItem width="80%" height="20px" marginBottom="8px" />
              <SkeletonItem width="40%" height="32px" borderRadius="8px" />
            </div>
            <div style={{ 
              backgroundColor: cardBg,
              borderRadius: "12px",
              padding: "16px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
            }}>
              <SkeletonItem width="80%" height="20px" marginBottom="8px" />
              <SkeletonItem width="40%" height="32px" borderRadius="8px" />
            </div>
          </div>

          {/* List items */}
          {[1, 2, 3].map((i) => (
            <div 
              key={i}
              style={{
                backgroundColor: cardBg,
                borderRadius: "12px",
                padding: "16px",
                marginBottom: "12px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                <SkeletonItem width="60%" height="20px" />
                <SkeletonItem width="40px" height="20px" borderRadius="4px" />
              </div>
              <SkeletonItem width="90%" height="16px" marginBottom="8px" />
              <SkeletonItem width="70%" height="16px" />
            </div>
          ))}
        </div>

        {/* Bottom Navigation */}
        <div style={{
          backgroundColor: headerBg,
          borderTop: `1px solid ${isDark ? "#2a2a2a" : "#eee"}`,
          padding: "8px 16px",
          paddingBottom: "calc(8px + env(safe-area-inset-bottom, 0px))",
          display: "flex",
          justifyContent: "space-around",
          alignItems: "center",
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          maxWidth: "600px",
          margin: "0 auto"
        }}>
          {[1, 2, 3].map((i) => (
            <div key={i} style={{ textAlign: "center", flex: 1 }}>
              <div style={{ marginBottom: "4px" }}>
                <SkeletonItem width="24px" height="24px" borderRadius="6px" marginBottom="0" />
              </div>
              <SkeletonItem width="40px" height="12px" borderRadius="4px" marginBottom="0" />
            </div>
          ))}
        </div>
        
        {/* Padding bottom para não esconder conteúdo */}
        <div style={{ height: "70px" }} />
      </div>
    </>
  );
};


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

  // Loading global inicial
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