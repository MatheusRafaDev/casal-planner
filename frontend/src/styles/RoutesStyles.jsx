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
  height: 100%;

  @keyframes fadeSlide {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }
`;

export const AppContainer = styled.div`
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  background: ${({ theme }) => theme.background};
  transition: background 0.3s ease;
  overflow: hidden;
`;

export const MainContent = styled.main`
  flex: 1;
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;

  @media (max-width: 1024px) {
    padding: 1.5rem;
  }

  @media (max-width: 768px) {
    padding: 0.5rem;
    /* Espaço para o BottomNav (60px) + safe area */
    padding-bottom: calc(60px + env(safe-area-inset-bottom, 0px) + 0.5rem);
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
