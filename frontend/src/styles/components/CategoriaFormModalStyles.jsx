import styled from 'styled-components';

export const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 99999;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  animation: fadeIn 0.2s ease;
  padding: 0;

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @media (max-width: 600px) {
    align-items: flex-end;
  }
`;

export const ModalContainer = styled.div`
  background: ${props => props.theme.surface};
  border-radius: 1.25rem;
  width: 90%;
  max-width: 480px;
  max-height: 95vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: scaleIn 0.25s cubic-bezier(0.34, 1.2, 0.64, 1);
  overflow: hidden;

  @keyframes scaleIn {
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  @media (max-width: 600px) {
    width: 100%;
    max-width: 100%;
    border-radius: 1.25rem 1.25rem 0 0;
    max-height: 85vh;
    animation: slideUp 0.28s cubic-bezier(0.32, 0.72, 0, 1);

    @keyframes slideUp {
      from { transform: translateY(100%); }
      to { transform: translateY(0); }
    }
  }
`;

export const SheetHandle = styled.div`
  display: none;

  @media (max-width: 600px) {
    display: block;
    width: 40px;
    height: 4px;
    background: ${props => props.theme.border};
    border-radius: 2px;
    margin: 10px auto 6px;
  }
`;

export const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1.25rem;
  background: ${props => props.theme.surface};
  border-bottom: 1px solid ${props => props.theme.border};
  flex-shrink: 0;

  h2 {
    font-size: 1.125rem;
    font-weight: 700;
    color: ${props => props.theme.text};
    margin: 0;
  }
`;

export const CloseButton = styled.button`
  width: 32px;
  height: 32px;
  background: ${props => props.theme.hover};
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.125rem;
  color: ${props => props.theme.textSoft};
  transition: all 0.2s;
  flex-shrink: 0;

  &:hover {
    background: ${props => props.theme.border};
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.95);
  }
`;

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1rem 1.25rem 1.25rem;
  overflow-y: auto;
  flex: 1;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: ${props => props.theme.border};
    border-radius: 4px;
  }
`;

export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
`;

export const Label = styled.label`
  font-size: 0.7rem;
  font-weight: 600;
  color: ${props => props.theme.textSoft};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

export const Input = styled.input`
  width: 100%;
  padding: 0.625rem 0.875rem;
  background: ${props => props.theme.background};
  border: 1.5px solid ${props => props.theme.border};
  border-radius: 10px;
  font-size: 0.9375rem;
  color: ${props => props.theme.text};
  transition: all 0.2s;
  font-family: inherit;

  &::placeholder {
    color: ${props => props.theme.textLight};
    opacity: 0.6;
  }

  &:focus {
    outline: none;
    border-color: ${props => props.theme.primary};
    box-shadow: 0 0 0 2px ${props => `${props.theme.primary}20`};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  @media (max-width: 600px) {
    padding: 0.6rem 0.875rem;
    font-size: 16px;
  }
`;

// GRID DE ÍCONES - MENOR
export const IconsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 0.375rem;

  @media (max-width: 600px) {
    grid-template-columns: repeat(6, 1fr);
    gap: 0.375rem;
  }
`;

// BOTÃO DE ÍCONE - MENOR
export const IconButton = styled.button`
  aspect-ratio: 1;
  background: ${props => props.$active ? props.theme.primary : props.theme.background};
  border: 1.5px solid ${props => props.$active ? props.theme.primary : props.theme.border};
  border-radius: 8px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  touch-action: manipulation;

  &:hover {
    transform: scale(1.05);
    background: ${props => props.$active ? props.theme.primary : props.theme.hover};
  }

  &:active {
    transform: scale(0.95);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

// GRID DE CORES
export const ColorsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  gap: 0.375rem;

  @media (max-width: 600px) {
    grid-template-columns: repeat(8, 1fr);
    gap: 0.375rem;
  }
`;

// BOTÃO DE COR - MENOR
export const ColorButton = styled.button`
  aspect-ratio: 1;
  background: ${props => props.$bgColor};
  border: 2px solid ${props => props.$active ? props.theme.primary : 'transparent'};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
  }

  &:active {
    transform: scale(0.95);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const ModalButtons = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-top: 0.5rem;

  @media (max-width: 480px) {
    flex-direction: column-reverse;
    gap: 0.5rem;
  }
`;

export const CancelarButton = styled.button`
  flex: 1;
  padding: 0.75rem;
  background: ${props => props.theme.hover};
  border: 1.5px solid ${props => props.theme.border};
  border-radius: 10px;
  font-size: 0.9375rem;
  font-weight: 600;
  color: ${props => props.theme.text};
  cursor: pointer;
  transition: all 0.2s;
  touch-action: manipulation;

  &:active {
    transform: scale(0.98);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const CriarButton = styled(CancelarButton)`
  background: ${props => props.theme.primary};
  border-color: ${props => props.theme.primary};
  color: white;

  &:hover:not(:disabled) {
    background: ${props => props.theme.primaryDark};
  }
`;

export const ErrorMessage = styled.span`
  font-size: 0.65rem;
  color: ${props => props.theme.error || '#dc3545'};
  margin-top: 0.125rem;
  display: block;
`;

export const VisuallyHidden = styled.div`
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
`;