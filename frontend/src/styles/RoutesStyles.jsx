import styled from 'styled-components';

export const LoadingScreen = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  height: 100dvh;
  background: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.primary};
  font-size: 1.2rem;
  font-weight: 500;
`;

export const PageWrapper = styled.div`
  width: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;

  @keyframes fadeSlide {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }
`;

/* ─── App Container: horizontal on desktop ─────────────── */
export const AppContainer = styled.div`
  height: 100vh;
  height: 100dvh;
  display: flex;
  flex-direction: row;
  background: ${({ theme }) => theme.background};
  transition: background 0.3s ease;
  overflow: hidden; /* Prevents whole page scroll */

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

/* ─── Main wrapper: flex column right of sidebar ───────── */
export const MainWrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: 100vh;
  height: 100dvh;

  @media (max-width: 768px) {
    height: auto;
    flex: 1;
  }
`;

/* ─── Main content area ────────────────────────────────── */
export const MainContent = styled.main`
  flex: 1;
  width: 100%;
  overflow-y: auto;
  display: flex;
  flex-direction: column;

  @media (max-width: 1024px) {
    padding: 1.5rem;
  }

  @media (max-width: 768px) {
    padding: 0rem;
    padding-top: calc(env(safe-area-inset-top, 0px) + 0.5rem);
    /* Espaço para o BottomNav (60px) + safe area */
    padding-bottom: calc(70px + env(safe-area-inset-bottom, 0px) + 0.5rem);
  }
`;

export const PageTransition = styled.div`
  width: 100%;
  height: 100%;

  @keyframes fadeSlide {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }
`;

export const ScrollContainer = styled.div`
  width: 100%;
  height: 100%;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  scroll-behavior: smooth;

  &::-webkit-scrollbar { width: 6px; }
  &::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.borderLight};
    border-radius: 8px;
  }
  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.textLight};
    border-radius: 8px;
  }
  &::-webkit-scrollbar-thumb:hover {
    background: ${({ theme }) => theme.primary};
  }
`;
