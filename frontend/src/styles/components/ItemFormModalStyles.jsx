// ItemFormModalStyles.js
import styled from 'styled-components';

export const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 99999;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  padding: 1rem;
  margin: 0;
  box-sizing: border-box;

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  animation: fadeIn 0.2s ease;

  @media (max-width: 768px) {
    padding: 0.75rem;
  }
`;

export const ModalContainer = styled.div`
  position: relative;
  background: ${props => props.theme.surface};
  border-radius: 1.5rem;
  padding: 2rem;
  width: 100%;
  max-width: 35rem;
  max-height: 90dvh;
  overflow-y: auto;
  box-shadow: 0 4px 6px rgba(0,0,0,0.07), 0 20px 50px rgba(0,0,0,0.18), 0 0 0 1px rgba(255,255,255,0.05);
  border: 1px solid ${props => props.theme.border};
  margin: auto;
  transform: translateZ(0);
  will-change: transform;

  @keyframes slideUp {
    from { transform: translateY(24px) scale(0.97); opacity: 0; }
    to { transform: translateY(0) scale(1); opacity: 1; }
  }
  
  animation: slideUp 0.25s ease;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: ${props => props.theme.borderLight};
    border-radius: 10px;
  }

  &::-webkit-scrollbar-thumb {
    background: ${props => props.theme.primary};
    border-radius: 10px;
  }

  @media (max-width: 480px) {
    padding: 1.5rem;
    border-radius: 1.25rem;
    max-height: 85dvh;
  }
`;

export const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid ${props => props.theme.border};

  h2 {
    font-size: 1.25rem;
    font-weight: 600;
    color: ${props => props.theme.text};
    margin: 0;
  }

  @media (max-width: 480px) {
    margin-bottom: 1rem;
    
    h2 {
      font-size: 1.125rem;
    }
  }
`;

export const CloseButton = styled.button`
  padding: 0.5rem;
  color: ${props => props.theme.textSoft};
  background: ${props => props.theme.border};
  border: none;
  cursor: pointer;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  min-width: 36px;
  min-height: 36px;
  font-size: 1rem;

  &:hover {
    background: ${props => props.theme.textLight};
    color: ${props => props.theme.text};
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.95);
  }
`;

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

export const Label = styled.label`
  color: ${props => props.theme.textSoft};
  font-weight: 500;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

export const Input = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid ${props => props.theme.border};
  border-radius: 12px;
  font-size: 1rem;
  background: ${props => props.theme.surface};
  color: ${props => props.theme.text};
  transition: all 0.2s;
  font-family: inherit;

  /* ✅ Estilos para autocomplete */
  &:-webkit-autofill,
  &:-webkit-autofill:hover,
  &:-webkit-autofill:focus,
  &:-webkit-autofill:active {
    -webkit-box-shadow: 0 0 0 30px ${props => props.theme.surface} inset !important;
    -webkit-text-fill-color: ${props => props.theme.text} !important;
    background-color: ${props => props.theme.surface} !important;
    caret-color: ${props => props.theme.text} !important;
    border-color: ${props => props.theme.primary} !important;
  }

  /* Firefox */
  &:-moz-autofill {
    background-color: ${props => props.theme.surface} !important;
    color: ${props => props.theme.text} !important;
  }

  &:focus {
    outline: none;
    border-color: ${props => props.theme.primary};
    box-shadow: 0 0 0 3px ${props => `${props.theme.primary}20`};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &::placeholder {
    color: ${props => props.theme.textLight};
  }
`;

export const TextArea = styled.textarea`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid ${props => props.theme.border};
  border-radius: 12px;
  font-size: 1rem;
  background: ${props => props.theme.surface};
  color: ${props => props.theme.text};
  transition: all 0.2s;
  font-family: inherit;
  resize: vertical;
  min-height: 80px;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.primary};
    box-shadow: 0 0 0 3px ${props => `${props.theme.primary}20`};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &::placeholder {
    color: ${props => props.theme.textLight};
  }
`;

export const Select = styled.select`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid ${props => props.theme.border};
  border-radius: 12px;
  font-size: 1rem;
  background: ${props => props.theme.surface};
  color: ${props => props.theme.text};
  transition: all 0.2s;
  font-family: inherit;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.primary};
    box-shadow: 0 0 0 3px ${props => `${props.theme.primary}20`};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const ImageContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;
  padding: 1rem;
  background: ${props => props.theme.borderLight};
  border-radius: 12px;
`;

export const Image = styled.img`
  max-width: 100%;
  max-height: 200px;
  border-radius: 8px;
  object-fit: contain;
  border: 1px solid ${props => props.theme.border};
  padding: 4px;
  background-color: ${props => props.theme.surface};
`;

export const ImageFallback = styled.div`
  max-width: 100%;
  max-height: 200px;
  border-radius: 8px;
  object-fit: contain;
  border: 1px solid ${props => props.theme.border};
  padding: 4px;
  background-color: ${props => props.theme.borderLight};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.theme.textLight};
  font-size: 14px;
  padding: 20px;
`;

export const ModalButtons = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
  padding-top: 0.5rem;

  @media (max-width: 480px) {
    flex-direction: column-reverse;
    gap: 0.75rem;
    margin-top: 1rem;
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
  min-height: 48px;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  font-size: 0.875rem;

  &:hover:not(:disabled) {
    background: ${props => props.theme.textLight};
    transform: translateY(-1px);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

export const SalvarButton = styled(CancelarButton)`
  background: ${props => props.theme.primary};
  color: white;

  &:hover:not(:disabled) {
    background: ${props => props.theme.primaryDark};
    filter: brightness(1.05);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

// Componente para mensagens de erro
export const ErrorMessage = styled.span`
  color: #dc3545;
  font-size: 0.75rem;
  margin-top: 0.25rem;
  display: block;
  
  ${props => props.theme === 'dark' && `
    color: #ff6b6b;
  `}
`;

// Grid para campos em linha (ex: preço e quantidade)
export const RowGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }
`;

// Badge para status
export const StatusBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: ${props => props.$comprado ? '#28a74520' : '#ffc10720'};
  border-radius: 8px;
  font-size: 0.875rem;
  color: ${props => props.$comprado ? '#28a745' : '#ffc107'};
  margin-bottom: 1rem;
`;

// Link estilizado
export const StyledLink = styled.a`
  color: ${props => props.theme.primary};
  text-decoration: none;
  font-size: 0.875rem;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  
  &:hover {
    text-decoration: underline;
  }
`;