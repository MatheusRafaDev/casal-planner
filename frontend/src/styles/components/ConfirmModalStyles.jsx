// src/styles/components/ConfirmModalStyles.jsx
import styled from 'styled-components';

export const ConfirmOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease;

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

export const ConfirmContainer = styled.div`
  background: ${({ theme }) => theme?.surface || '#fff'};
  border-radius: 1rem;
  width: 90%;
  max-width: 450px;
  box-shadow: 0 20px 35px -8px rgba(0, 0, 0, 0.3);
  animation: slideIn 0.25s ease;
  outline: none;

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(-20px) scale(0.96);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
`;

export const ConfirmHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid ${({ theme }) => theme?.border || '#E5E7EB'};

  h2 {
    margin: 0;
    font-size: 1.125rem;
    font-weight: 700;
    color: ${({ theme }) => theme?.text || '#111827'};
  }
`;

export const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.375rem;
  color: ${({ theme }) => theme?.textLight || '#9CA3AF'};
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme?.hover || '#F3F4F6'};
    color: ${({ theme }) => theme?.text || '#111827'};
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
`;

export const ConfirmContent = styled.div`
  padding: 1.5rem;
`;

export const WarningBox = styled.div`
  display: flex;
  gap: 0.875rem;
  padding: 1rem;
  background: ${({ theme }) => theme?.error + '10' || '#EF444410'};
  border-left: 3px solid ${({ theme }) => theme?.error || '#EF4444'};
  border-radius: 0.75rem;
  margin-bottom: 1.5rem;
`;

export const WarningIcon = styled.div`
  color: ${({ theme }) => theme?.error || '#EF4444'};
  flex-shrink: 0;
  margin-top: 0.125rem;
`;

export const WarningTexts = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

export const Message = styled.p`
  margin: 0;
  font-size: 0.9375rem;
  color: ${({ theme }) => theme?.text || '#111827'};
  line-height: 1.4;
`;

export const WarningNote = styled.small`
  font-size: 0.75rem;
  color: ${({ theme }) => theme?.error || '#EF4444'};
  font-weight: 500;
`;

export const ButtonGroup = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-top: 0.5rem;

  @media (max-width: 380px) {
    flex-direction: column-reverse;
  }
`;

export const CancelButton = styled.button`
  flex: 1;
  padding: 0.6875rem 1.25rem;
  background: ${({ theme }) => theme?.hover || '#F3F4F6'};
  color: ${({ theme }) => theme?.text || '#374151'};
  border: 1px solid ${({ theme }) => theme?.border || '#E5E7EB'};
  border-radius: 0.625rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme?.border || '#E5E7EB'};
    transform: translateY(-1px);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const DeleteButton = styled.button`
  flex: 1;
  padding: 0.6875rem 1.25rem;
  background: ${({ theme }) => theme?.error || '#EF4444'};
  color: white;
  border: none;
  border-radius: 0.625rem;
  font-size: 0.875rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 6px rgba(239, 68, 68, 0.3);

  &:hover:not(:disabled) {
    filter: brightness(1.08);
    transform: translateY(-1px);
    box-shadow: 0 4px 10px rgba(239, 68, 68, 0.4);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
    filter: brightness(0.96);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    box-shadow: none;
  }
`;