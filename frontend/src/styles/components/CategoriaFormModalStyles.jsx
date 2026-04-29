import styled from 'styled-components';

export const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 99999;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  background: rgba(0, 0, 0, 0.55);
  /* SEM backdrop-filter: causa glitch no Safari iOS */
  animation: fadeIn 0.2s ease;

  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  @media (min-width: 600px) {
    align-items: center;
    padding: 1rem;
  }
`;

export const ModalContainer = styled.div`
  position: relative;
  background: ${props => props.theme.surface};
  border-radius: 1.5rem 1.5rem 0 0;
  padding: 1.25rem 1.5rem 0;
  padding-bottom: calc(1.5rem + env(safe-area-inset-bottom, 0px));
  width: 100%;
  max-width: 100%;
  /* Limita altura para não cobrir a tela inteira */
  max-height: 92dvh;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  box-shadow: 0 -4px 32px rgba(0,0,0,0.18);
  border: 1px solid ${props => props.theme.border};
  animation: sheetUp 0.28s cubic-bezier(0.32, 0.72, 0, 1);

  @keyframes sheetUp {
    from { transform: translateY(100%); }
    to   { transform: translateY(0); }
  }

  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb {
    background: ${props => props.theme.border};
    border-radius: 4px;
  }

  @media (min-width: 600px) {
    border-radius: 1.5rem;
    max-width: 35rem;
    max-height: 90dvh;
    padding: 2rem;
    padding-bottom: 2rem;
    animation: slideUp 0.25s ease;

    @keyframes slideUp {
      from { transform: translateY(24px) scale(0.97); opacity: 0; }
      to   { transform: translateY(0)    scale(1);    opacity: 1; }
    }
  }
`;

/* Alça de drag (sheet handle) — dica visual iOS */
export const SheetHandle = styled.div`
  width: 36px;
  height: 4px;
  border-radius: 2px;
  background: ${props => props.theme.border};
  margin: 0 auto 1.25rem;

  @media (min-width: 600px) { display: none; }
`;

export const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.25rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid ${props => props.theme.border};

  h2 {
    font-size: 1.2rem;
    font-weight: 700;
    color: ${props => props.theme.text};
    margin: 0;
  }
`;

export const CloseButton = styled.button`
  padding: 0;
  width: 36px;
  height: 36px;
  color: ${props => props.theme.textSoft};
  background: ${props => props.theme.border};
  border: none;
  cursor: pointer;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  flex-shrink: 0;

  &:active { transform: scale(0.92); }
  &:hover  { background: ${props => props.theme.textLight}; color: ${props => props.theme.text}; }
`;

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
`;

export const Label = styled.label`
  color: ${props => props.theme.textSoft};
  font-weight: 600;
  font-size: 0.82rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
`;

export const Input = styled.input`
  width: 100%;
  padding: 0.8rem 1rem;
  border: 2px solid ${props => props.theme.border};
  border-radius: 12px;
  /* MUST be ≥16px to prevent iOS zoom on focus */
  font-size: 16px;
  background: ${props => props.theme.surface};
  color: ${props => props.theme.text};
  transition: border-color 0.2s, box-shadow 0.2s;
  font-family: inherit;
  -webkit-appearance: none;
  appearance: none;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.primary};
    box-shadow: 0 0 0 3px ${props => `${props.theme.primary}20`};
  }
  &:disabled { opacity: 0.6; cursor: not-allowed; }
  &::placeholder { color: ${props => props.theme.textLight}; }
`;

export const IconsGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.4rem;
`;

export const IconButton = styled.button`
  width: 44px;
  height: 44px;
  border-radius: 12px;
  font-size: 1.3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
  border: 2px solid ${props => props.$active ? props.theme.primary : props.theme.border};
  cursor: pointer;
  background: ${props => props.$active ? `${props.theme.primary}15` : props.theme.surface};
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;

  &:active { transform: scale(0.9); }
  &:hover  { border-color: ${props => props.theme.primary}; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

export const ColorsGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.4rem;
`;

export const ColorButton = styled.button`
  width: 36px;
  height: 36px;
  border-radius: 10px;
  transition: all 0.15s;
  border: 2px solid ${props => props.$active ? props.theme.primary : 'transparent'};
  cursor: pointer;
  background: ${props => props.color};
  box-shadow: ${props => props.$active ? `0 0 0 2px ${props.theme.background}, 0 0 0 4px ${props.theme.primary}` : 'none'};
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;

  &:active { transform: scale(0.88); }
  &:hover  { transform: scale(1.1); }
  &:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
`;

export const ModalButtons = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-top: 1.5rem;
  padding-bottom: 0.5rem;

  @media (max-width: 480px) {
    flex-direction: column-reverse;
    gap: 0.5rem;
  }
`;

export const CancelarButton = styled.button`
  flex: 1;
  padding: 0.875rem 1rem;
  background: ${props => props.theme.border};
  color: ${props => props.theme.text};
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  min-height: 50px;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  font-size: 0.95rem;

  &:active { transform: scale(0.97); }
  &:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
`;

export const CriarButton = styled(CancelarButton)`
  background: ${props => props.theme.primary};
  color: white;

  &:hover:not(:disabled) { background: ${props => props.theme.primaryDark}; }
`;

export const SalvarButton = CriarButton;
