// styles/App.styles.js
import styled from 'styled-components';

export const LoadingScreen = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  /* CORREÇÃO iPhone: sequência completa de fallback para viewport height */
  min-height: 100vh;
  min-height: 100dvh;
  min-height: -webkit-fill-available;
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
  /* CORREÇÃO iPhone: sequência completa de fallback para viewport height */
  min-height: 100vh;
  min-height: 100dvh;
  min-height: -webkit-fill-available;
  background: ${({ theme }) => theme.background};
  transition: background 0.3s ease;
  /* CORREÇÃO iPhone: removido overflow: hidden para não cortar conteúdo quando teclado sobe */
`;

export const MainContent = styled.main`
  max-width: 1600px;
  margin: 0 auto;
  padding: 2rem 20px;

  @media (max-width: 768px) {
    padding: 1rem 15px;
    padding-top: calc(env(safe-area-inset-top, 0px) + 1rem);
    /* CORREÇÃO iPhone: safe area inset para conteúdo mobile com BottomNav */
    padding-bottom: calc(60px + env(safe-area-inset-bottom, 16px) + 0.75rem);
  }

  @media (max-width: 480px) {
    padding: 0.75rem 12px;
    padding-top: calc(env(safe-area-inset-top, 0px) + 0.75rem);
    /* CORREÇÃO iPhone: safe area inset para conteúdo mobile com BottomNav */
    padding-bottom: calc(60px + env(safe-area-inset-bottom, 16px) + 0.75rem);
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
  /* CORREÇÃO iPhone: usar dvh para recalcular quando teclado sobe */
  max-height: calc(100dvh - 80px);

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