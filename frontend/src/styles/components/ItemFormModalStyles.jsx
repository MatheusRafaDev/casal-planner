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
  border-radius: 1.5rem;
  width: 90%;
  max-width: 500px;
  max-height: 85vh;
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
    border-radius: 1.5rem 1.5rem 0 0;
    max-height: 90vh;
    animation: slideUp 0.28s cubic-bezier(0.32, 0.72, 0, 1);

    @keyframes slideUp {
      from {
        transform: translateY(100%);
      }
      to {
        transform: translateY(0);
      }
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
    margin: 12px auto 8px;
  }
`;

export const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  background: ${props => props.theme.surface};
  border-bottom: 1px solid ${props => props.theme.border};
  flex-shrink: 0;

  h2 {
    font-size: 1.25rem;
    font-weight: 700;
    color: ${props => props.theme.text};
    margin: 0;
  }

  @media (max-width: 600px) {
    padding: 0.875rem 1.25rem;
    
    h2 {
      font-size: 1.125rem;
    }
  }
`;

export const CloseButton = styled.button`
  width: 36px;
  height: 36px;
  background: ${props => props.theme.hover};
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
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

export const ScrollContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 0;

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

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem;

  @media (max-width: 600px) {
    gap: 0.875rem;
    padding: 1.25rem;
  }
`;

export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
`;

export const Label = styled.label`
  font-size: 0.75rem;
  font-weight: 600;
  color: ${props => props.theme.textSoft};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

export const Input = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  background: ${props => props.theme.background};
  border: 1.5px solid ${props => props.theme.border};
  border-radius: 12px;
  font-size: 1rem;
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
    box-shadow: 0 0 0 3px ${props => `${props.theme.primary}20`};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  @media (max-width: 600px) {
    padding: 0.7rem 0.875rem;
    font-size: 16px; /* Evita zoom no iOS */
  }
`;

export const Select = styled.select`
  width: 100%;
  padding: 0.75rem 1rem;
  background: ${props => props.theme.background};
  border: 1.5px solid ${props => props.theme.border};
  border-radius: 12px;
  font-size: 1rem;
  color: ${props => props.theme.text};
  transition: all 0.2s;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 1rem center;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.primary};
    box-shadow: 0 0 0 3px ${props => `${props.theme.primary}20`};
  }

  @media (max-width: 600px) {
    padding: 0.7rem 0.875rem;
    font-size: 16px;
  }
`;

// Componentes para Quantidade com botões
export const QuantidadeWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: ${props => props.theme.background};
  border: 1.5px solid ${props => props.theme.border};
  border-radius: 12px;
  padding: 0.25rem;
`;

export const QuantidadeButton = styled.button`
  width: 44px;
  height: 44px;
  background: ${props => props.theme.surface};
  border: none;
  border-radius: 10px;
  font-size: 1.5rem;
  font-weight: 600;
  color: ${props => props.theme.primary};
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  touch-action: manipulation;

  &:hover:not(:disabled) {
    background: ${props => props.theme.hover};
  }

  &:active:not(:disabled) {
    transform: scale(0.95);
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  @media (max-width: 600px) {
    width: 48px;
    height: 48px;
  }
`;

export const QuantidadeInput = styled.input`
  flex: 1;
  text-align: center;
  font-size: 1.125rem;
  font-weight: 600;
  background: transparent;
  border: none;
  color: ${props => props.theme.text};
  padding: 0.5rem;

  &:focus {
    outline: none;
  }

  /* Remove setas do input number */
  &::-webkit-inner-spin-button,
  &::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  input[type=number] {
    -moz-appearance: textfield;
  }
`;

export const TwoColumnGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.875rem;

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 0.875rem;
  }
`;

export const ImageContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 0.5rem;
  padding: 0.75rem;
  background: ${props => props.theme.hover};
  border-radius: 12px;
`;

export const Image = styled.img`
  max-width: 100%;
  max-height: 150px;
  border-radius: 8px;
  object-fit: contain;
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
  padding: 0.875rem;
  background: ${props => props.theme.hover};
  border: 1.5px solid ${props => props.theme.border};
  border-radius: 12px;
  font-size: 1rem;
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

  @media (max-width: 600px) {
    padding: 0.75rem;
    font-size: 0.9375rem;
  }
`;

export const SalvarButton = styled(CancelarButton)`
  background: ${props => props.theme.primary};
  border-color: ${props => props.theme.primary};
  color: white;

  &:hover:not(:disabled) {
    background: ${props => props.theme.primaryDark};
  }
`;

export const ErrorMessage = styled.span`
  font-size: 0.7rem;
  color: ${props => props.theme.error || '#dc3545'};
  margin-top: 0.25rem;
  display: block;
`;

export const RowGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.875rem;

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;