// styles/App.styles.js
import styled from 'styled-components';

export const LoadingScreen = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: ${props => props.theme.background};
  color: ${props => props.theme.primary};
  font-size: 1.2rem;
  font-weight: 500;
  animation: fadeIn 0.3s ease;

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

export const AppContainer = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.background};
  transition: background 0.3s ease;
`;

export const MainContent = styled.main`
  max-width: 1600px;
  margin: 0 auto;
  padding: 2rem 20px;

  @media (max-width: 768px) {
    padding: 1rem 15px;
  }

  @media (max-width: 480px) {
    padding: 0.75rem 12px;
  }
`;

// Componente para animação de transição de página
export const PageTransition = styled.div`
  animation: pageTransition 0.3s ease;

  @keyframes pageTransition {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

// Componente para conteúdo com scroll suave
export const ScrollContainer = styled.div`
  scroll-behavior: smooth;
  overflow-y: auto;
  max-height: calc(100vh - 80px);

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: ${props => props.theme.borderLight};
    border-radius: 10px;
  }

  &::-webkit-scrollbar-thumb {
    background: ${props => props.theme.textLight};
    border-radius: 10px;
    transition: background 0.2s;

    &:hover {
      background: ${props => props.theme.primary};
    }
  }
`;