import styled from 'styled-components';

export const FormGroup = styled.div`
  margin-bottom: 1.2rem;
`;

export const Label = styled.label`
  display: block;
  margin-bottom: 0.3rem;
  color: ${(props) => props.theme.textSoft};
  font-weight: 500;
  font-size: 0.9rem;
`;

export const Input = styled.input`
  width: 100%;
  padding: 0.8rem 1rem;
  border: 2px solid ${(props) => props.theme.border};
  border-radius: 12px;
  font-size: 1rem;
  background: ${(props) => props.theme.surface};
  color: ${(props) => props.theme.text};
  transition: 0.2s;

  &::placeholder {
    color: ${(props) => props.theme.textLight};
    opacity: 0.7;
  }

  /* 🔥 CORREÇÃO: Autofill do navegador */
  &:-webkit-autofill,
  &:-webkit-autofill:hover,
  &:-webkit-autofill:focus,
  &:-webkit-autofill:active {
    -webkit-box-shadow: 0 0 0 30px ${(props) => props.theme.surface} inset !important;
    -webkit-text-fill-color: ${(props) => props.theme.text} !important;
    box-shadow: 0 0 0 30px ${(props) => props.theme.surface} inset !important;
    background-color: ${(props) => props.theme.surface} !important;
    color: ${(props) => props.theme.text} !important;
    border-color: ${(props) => props.theme.border};
    transition: background-color 5000s ease-in-out 0s;
  }

  /* Para Firefox */
  &:-moz-autofill {
    filter: none;
    background-color: ${(props) => props.theme.surface} !important;
    color: ${(props) => props.theme.text} !important;
  }

  &:focus {
    outline: none;
    border-color: ${(props) => props.theme.primary};
    box-shadow: 0 0 0 2px ${(props) => props.theme.primary}33;
    
    /* Mantém a correção do autofill durante o focus */
    &:-webkit-autofill {
      -webkit-box-shadow: 0 0 0 30px ${(props) => props.theme.surface} inset, 0 0 0 2px ${(props) => props.theme.primary}33 !important;
    }
  }

  &.error {
    border-color: #dc3545 !important;
    
    &:-webkit-autofill {
      -webkit-box-shadow: 0 0 0 30px ${(props) => props.theme.surface} inset !important;
      border-color: #dc3545 !important;
    }
    
    &:focus {
      box-shadow: 0 0 0 2px rgba(220, 53, 69, 0.2);
      
      &:-webkit-autofill {
        -webkit-box-shadow: 0 0 0 30px ${(props) => props.theme.surface} inset, 0 0 0 2px rgba(220, 53, 69, 0.2) !important;
      }
    }
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    background: ${(props) => props.theme.background};
    
    &:-webkit-autofill {
      -webkit-box-shadow: 0 0 0 30px ${(props) => props.theme.background} inset !important;
      -webkit-text-fill-color: ${(props) => props.theme.textLight} !important;
    }
  }
`;

export const Select = styled.select`
  width: 100%;
  padding: 0.8rem 1rem;
  border: 2px solid ${(props) => props.theme.border};
  border-radius: 12px;
  font-size: 1rem;
  background: ${(props) => props.theme.surface};
  color: ${(props) => props.theme.text};
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: ${(props) => props.theme.primary};
  }

  option {
    background: ${(props) => props.theme.surface};
    color: ${(props) => props.theme.text};
  }
`;

export const ModalButtons = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 2rem;

  @media (max-width: 480px) {
    flex-direction: column-reverse;
    gap: 0.75rem;
  }
`;

export const CancelarButton = styled.button`
  flex: 1;
  padding: 1rem;
  background: ${(props) => props.theme.border};
  color: ${(props) => props.theme.text};
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s;
  min-height: 48px;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;

  &:hover:not(:disabled) {
    background: ${(props) => props.theme.textLight};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const SalvarButton = styled(CancelarButton)`
  background: ${(props) => props.theme.primary};
  color: ${({ theme }) => theme.name === 'dark' ? '#ffffff' : theme.text};

  &:hover:not(:disabled) {
    background: ${(props) => props.theme.primary}cc;
  }
`;

export const ErrorMessage = styled.span`
  color: #dc3545;
  font-size: 0.85rem;
  margin-top: 0.25rem;
  display: block;
  
  ${props => props.theme.name === 'dark' && `
    color: #ff6b6b;
  `}
`;