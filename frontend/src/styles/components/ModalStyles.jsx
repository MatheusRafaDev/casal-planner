import styled, { keyframes } from 'styled-components';

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideUp = keyframes`
  from { transform: translateY(24px) scale(0.97); opacity: 0; }
  to { transform: translateY(0) scale(1); opacity: 1; }
`;

export const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: ${fadeIn} 0.18s ease;
  padding: 1rem;
`;

export const ModalContent = styled.div`
  background: ${props => props.theme?.surface || '#ffffff'};
  border-radius: 1.5rem;
  padding: 2rem;
  max-width: 520px;
  width: 100%;
  max-height: 90dvh;
  overflow-y: auto;
  position: relative;
  box-shadow: 
    0 4px 6px rgba(0,0,0,0.07),
    0 20px 50px rgba(0,0,0,0.18),
    0 0 0 1px rgba(255,255,255,0.05);
  animation: ${slideUp} 0.25s cubic-bezier(0.34, 1.2, 0.64, 1);
  outline: none;

  /* Scrollbar elegante */
  scrollbar-width: thin;
  scrollbar-color: ${props => props.theme?.border || '#ddd'} transparent;
  &::-webkit-scrollbar { width: 5px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb {
    background: ${props => props.theme?.border || '#ddd'};
    border-radius: 4px;
  }

  @media (max-width: 480px) {
    padding: 1.5rem;
    border-radius: 1.25rem;
  }
`;

export const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  gap: 1rem;

  h2 {
    color: ${({ theme }) => theme?.text || '#1a1a1a'};
    font-size: 1.2rem;
    font-weight: 700;
    margin: 0;
    line-height: 1.3;
    flex: 1;
  }
`;

export const CloseButton = styled.button`
  background: ${props => props.theme?.border || '#f0f0f0'};
  border: none;
  font-size: 1rem;
  line-height: 1;
  cursor: pointer;
  color: ${props => props.theme?.textSoft || '#666'};
  width: 34px;
  height: 34px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.18s ease;

  &:hover {
    background: ${props => props.theme?.error || '#ef4444'}18;
    color: ${props => props.theme?.error || '#ef4444'};
    transform: scale(1.08);
  }
  &:active {
    transform: scale(0.94);
  }
  &:focus-visible {
    outline: 2px solid ${props => props.theme?.primary || '#e91e8c'};
    outline-offset: 2px;
  }
`;
