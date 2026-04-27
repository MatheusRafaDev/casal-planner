// frontend/src/styles/RoutesStyles.js
import styled from 'styled-components';

// Tela de loading
export const LoadingScreen = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.primary};
  font-size: 1.2rem;
  font-weight: 500;
`;
export const PageWrapper = styled.div`
  width: 100%;
  height: 100%;
  animation: fadeSlide 0.25s ease;

  @keyframes fadeSlide {
    from {
      opacity: 0;
      transform: translateY(8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

// Container principal
export const AppContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: ${({ theme }) => theme.background};
  transition: background 0.3s ease;
  overflow: hidden;
`;

// Conteúdo principal
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
    padding: 1rem;
  }
`;

// Transição de página
export const PageTransition = styled.div`
  width: 100%;
  height: 100%;
  animation: fadeSlide 0.25s ease;

  @keyframes fadeSlide {
    from {
      opacity: 0;
      transform: translateY(8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

// Scroll customizado
export const ScrollContainer = styled.div`
  width: 100%;
  height: 100%;
  overflow-y: auto;
  scroll-behavior: smooth;

  &::-webkit-scrollbar {
    width: 6px;
  }

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