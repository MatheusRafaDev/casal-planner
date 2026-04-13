import styled, { keyframes } from 'styled-components';

const fadeIn = keyframes`
  from { opacity: 0; }
  to   { opacity: 1; }
`;

const slideUp = keyframes`
  from { transform: translateY(28px) scale(0.96); opacity: 0; }
  to   { transform: translateY(0)    scale(1);    opacity: 1; }
`;

// No mobile o modal sobe do fundo como um bottom sheet
const sheetUp = keyframes`
  from { transform: translateY(100%); }
  to   { transform: translateY(0); }
`;

export const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: ${fadeIn} 0.15s ease;
  padding: 1rem;

  @media (max-width: 480px) {
    align-items: flex-end;
    padding: 0;
  }
`;

export const ModalContent = styled.div`
  background: ${(p) => p.theme?.surface || '#ffffff'};
  border-radius: 1.5rem;
  padding: 2rem;
  max-width: 520px;
  width: 100%;
  /* dvh garante que o modal nunca fique atrás do teclado virtual */
  max-height: 88dvh;
  overflow-y: auto;
  overflow-x: hidden;
  position: relative;
  box-shadow:
    0 4px 6px rgba(0,0,0,0.07),
    0 20px 50px rgba(0,0,0,0.18);
  animation: ${slideUp} 0.22s cubic-bezier(0.34, 1.2, 0.64, 1);
  outline: none;
  /* Scroll com momentum iOS */
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;

  /* Scrollbar fina */
  scrollbar-width: thin;
  scrollbar-color: ${(p) => p.theme?.border || '#ddd'} transparent;
  &::-webkit-scrollbar        { width: 4px; }
  &::-webkit-scrollbar-track  { background: transparent; }
  &::-webkit-scrollbar-thumb  { background: ${(p) => p.theme?.border || '#ddd'}; border-radius: 4px; }

  @media (max-width: 480px) {
    padding: 0 1.25rem 2rem;
    padding-bottom: calc(1.5rem + env(safe-area-inset-bottom));
    border-radius: 1.5rem 1.5rem 0 0;
    /* Em telas pequenas ocupa até 95% da altura disponível */
    max-height: 95dvh;
    width: 100%;
    max-width: 100%;
    animation: ${sheetUp} 0.28s cubic-bezier(0.32, 0.72, 0, 1);
  }
`;

/* Handle visual de arraste no topo do sheet (mobile) */
export const SheetHandle = styled.div`
  display: none;

  @media (max-width: 480px) {
    display: block;
    width: 40px;
    height: 4px;
    background: ${(p) => p.theme?.border || '#ddd'};
    border-radius: 2px;
    margin: 0.875rem auto 1.25rem;
  }
`;

export const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  gap: 1rem;
  /* Sticky no topo do scroll do modal */
  position: sticky;
  top: 0;
  background: ${(p) => p.theme?.surface || '#fff'};
  z-index: 1;
  padding-top: 0.25rem;
  padding-bottom: 0.75rem;
  margin-left: -0.25rem;
  margin-right: -0.25rem;
  padding-left: 0.25rem;
  padding-right: 0.25rem;

  h2 {
    color: ${({ theme }) => theme?.text || '#1a1a1a'};
    font-size: 1.15rem;
    font-weight: 700;
    margin: 0;
    line-height: 1.3;
    flex: 1;
  }
`;

export const CloseButton = styled.button`
  background: ${(p) => p.theme?.borderLight || '#f0f0f0'};
  border: none;
  cursor: pointer;
  color: ${(p) => p.theme?.textSoft || '#666'};
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background 0.15s, transform 0.1s;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;

  @media (max-width: 480px) {
    width: 44px;
    height: 44px;
  }

  &:hover  { background: ${(p) => (p.theme?.error || '#ef4444') + '18'}; color: ${(p) => p.theme?.error || '#ef4444'}; }
  &:active { transform: scale(0.9); }

  &:focus-visible {
    outline: 2px solid ${(p) => p.theme?.primary || '#A78BFA'};
    outline-offset: 2px;
  }
`;
