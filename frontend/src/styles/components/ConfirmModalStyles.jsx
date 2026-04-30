import styled from 'styled-components';

export const ConfirmOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.18s ease;

  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  @media (min-width: 480px) {
    align-items: center;
    padding: 1rem;
  }
`;

export const ConfirmContainer = styled.div`
  background: ${({ theme }) => theme?.surface || '#fff'};
  border-radius: 1.25rem 1.25rem 0 0;
  width: 100%;
  max-width: 100%;
  padding-bottom: env(safe-area-inset-bottom, 0px);
  box-shadow: 0 -4px 32px rgba(0,0,0,0.18);
  animation: sheetUp 0.25s cubic-bezier(0.32, 0.72, 0, 1);
  outline: none;

  @keyframes sheetUp {
    from { transform: translateY(100%); }
    to   { transform: translateY(0); }
  }

  @media (min-width: 480px) {
    border-radius: 1.25rem;
    max-width: 420px;
    padding-bottom: 0;
    animation: slideIn 0.22s ease;

    @keyframes slideIn {
      from { opacity: 0; transform: scale(0.96) translateY(-8px); }
      to   { opacity: 1; transform: scale(1)    translateY(0); }
    }
  }
`;

export const ConfirmHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.5rem 1rem;
  border-bottom: 1px solid ${({ theme }) => theme?.border || '#E5E7EB'};

  /* Handle de drag no mobile */
  &::before {
    content: '';
    position: absolute;
    top: 10px;
    left: 50%;
    transform: translateX(-50%);
    width: 36px;
    height: 4px;
    border-radius: 2px;
    background: ${({ theme }) => theme?.border || '#E5E7EB'};

    @media (min-width: 480px) { display: none; }
  }

  position: relative;
  padding-top: 1.75rem;

  @media (min-width: 480px) { padding-top: 1.25rem; }

  h2 {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 700;
    color: ${({ theme }) => theme?.text || '#111827'};
  }
`;

export const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: ${({ theme }) => theme?.border || '#F3F4F6'};
  color: ${({ theme }) => theme?.textLight || '#9CA3AF'};
  transition: all 0.2s;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  flex-shrink: 0;

  &:active { transform: scale(0.92); }
  &:hover:not(:disabled) { background: ${({ theme }) => theme?.hover || '#E5E7EB'}; }
  &:disabled { cursor: not-allowed; opacity: 0.5; }
`;

export const ConfirmContent = styled.div`
  padding: 1.25rem 1.5rem 1.5rem;
`;

export const WarningBox = styled.div`
  display: flex;
  gap: 0.875rem;
  padding: 1rem;
  background: ${({ theme }) => (theme?.error || '#EF4444') + '10'};
  border-left: 3px solid ${({ theme }) => theme?.error || '#EF4444'};
  border-radius: 0.75rem;
  margin-bottom: 1.25rem;
`;

export const WarningIcon = styled.div`
  color: ${({ theme }) => theme?.error || '#EF4444'};
  flex-shrink: 0;
  margin-top: 0.125rem;
`;

export const WarningTexts = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
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

  @media (max-width: 380px) { flex-direction: column-reverse; }
`;

export const CancelButton = styled.button`
  flex: 1;
  padding: 0.875rem 1.25rem;
  background: ${({ theme }) => theme?.hover || '#F3F4F6'};
  color: ${({ theme }) => theme?.text || '#374151'};
  border: 1px solid ${({ theme }) => theme?.border || '#E5E7EB'};
  border-radius: 0.75rem;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  min-height: 50px;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;

  &:active { transform: scale(0.97); }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

export const DeleteButton = styled.button`
  flex: 1;
  padding: 0.875rem 1.25rem;
  background: ${({ theme }) => theme?.error || '#EF4444'};
  color: white;
  border: none;
  border-radius: 0.75rem;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  min-height: 50px;
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;

  &:active { transform: scale(0.97); filter: brightness(0.95); }
  &:hover:not(:disabled) { filter: brightness(1.06); }
  &:disabled { opacity: 0.6; cursor: not-allowed; box-shadow: none; }
`;

