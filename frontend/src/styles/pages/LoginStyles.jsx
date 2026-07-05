import styled from 'styled-components';

export const LoginContainer = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.theme.background};
  padding: env(safe-area-inset-top, 1rem) 1rem env(safe-area-inset-bottom, 1rem);
`;

export const LoginCard = styled.div`
  background: ${props => props.theme.surface};
  border-radius: 16px;
  padding: 2rem;
  width: 100%;
  max-width: 500px;
  /* CORREÇÃO iPhone: usar dvh para recalcular quando teclado sobe */
  max-height: 90dvh;
  /* CORREÇÃO iPhone: safe area inset para home indicator */
  padding-bottom: calc(env(safe-area-inset-bottom, 0px) + 1rem);
  overflow-y: auto;
  box-shadow: ${props => props.theme.shadowCard};
  animation: slideUp 0.3s ease;
  border: 1px solid ${props => props.theme.border};

  @keyframes slideUp {
    from {
      transform: translateY(10px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: ${props => props.theme.borderLight};
    border-radius: 10px;
  }

  &::-webkit-scrollbar-thumb {
    background: ${props => props.theme.textLight};
    border-radius: 10px;
  }

  @media (max-width: 768px) {
    padding: 1.5rem;
  }
`;

export const LogoWrapper = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;
`;

export const LogoIcon = styled.div`
  width: 56px;
  height: 56px;
  background: ${props => props.theme.primary};
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    color: ${props => props.theme.surface};
  }
`;

export const Title = styled.h1`
  text-align: center;
  font-size: 1.8rem;
  font-weight: 600;
  color: ${props => props.theme.text};
  margin-bottom: 0.25rem;
`;

export const Subtitle = styled.p`
  text-align: center;
  color: ${props => props.theme.textSoft};
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
`;

export const TabsContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid ${props => props.theme.border};
  padding-bottom: 0.5rem;
`;

export const Tab = styled.button`
  flex: 1;
  background: none;
  border: none;
  padding: 0.5rem;
  font-size: 16px;
  cursor: pointer;
  color: ${props => props.$active ? props.theme.primary : props.theme.textSoft};
  font-weight: ${props => props.$active ? '600' : '400'};
  border-bottom: 2px solid ${props => props.$active ? props.theme.primary : 'transparent'};
  transition: all 0.2s;

  svg {
    width: 16px;
    height: 16px;
    margin-right: 4px;
    vertical-align: middle;
  }

  span {
    vertical-align: middle;
  }

  &:hover {
    color: ${props => props.theme.primary};
  }
`;

export const ErrorMessage = styled.div`
  background: ${props => props.theme.error}10;
  color: ${props => props.theme.error};
  padding: 0.75rem;
  border-radius: 6px;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  border: 1px solid ${props => props.theme.error}30;
`;

export const Form = styled.form`
  width: 100%;
`;

export const FormGroup = styled.div`
  margin-bottom: 1rem;
  flex: ${props => props.$half ? '1' : 'auto'};
  width: 100%;
`;

export const FormRow = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 0.5rem;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 0;
  }
`;

export const Label = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.3rem;
  color: ${props => props.theme.textSoft};
  font-weight: 500;
  font-size: 0.9rem;
`;

export const InputWrapper = styled.div`
  position: relative;
  width: 100%;
`;

export const Input = styled.input`
  width: 100%;
  padding: 0.7rem 0.9rem;
  border: 1px solid ${props => props.theme.border};
  border-radius: 6px;
  font-size: 16px;
  transition: all 0.2s;
  background: ${props => props.theme.surface};
  color: ${props => props.theme.text};

  &:focus {
    outline: none;
    border-color: ${props => props.theme.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.primary}20;
    background: ${props => props.theme.surface};
    color: ${props => props.theme.text};
  }

  /* Estilo para autocomplete do navegador */
  &:-webkit-autofill,
  &:-webkit-autofill:hover,
  &:-webkit-autofill:focus,
  &:-webkit-autofill:active {
    -webkit-box-shadow: 0 0 0 30px ${props => props.theme.surface} inset !important;
    -webkit-text-fill-color: ${props => props.theme.text} !important;
    caret-color: ${props => props.theme.text};
    border: 1px solid ${props => props.theme.border};
  }

  &:focus:-webkit-autofill {
    border-color: ${props => props.theme.primary};
    -webkit-box-shadow: 0 0 0 30px ${props => props.theme.surface} inset, 0 0 0 3px ${props => props.theme.primary}20 !important;
  }

  &::placeholder {
    color: ${props => props.theme.textLight};
  }

  /* Remove fundo amarelo do autocomplete no Edge */
  &:-internal-autofill-selected {
    background-color: ${props => props.theme.surface} !important;
    color: ${props => props.theme.text} !important;
  }

  /* Estilo para campo com erro */
  &[aria-invalid="true"] {
    border-color: ${props => props.theme.error};
    
    &:focus {
      box-shadow: 0 0 0 3px ${props => props.theme.error}20;
    }
  }
`;

export const PasswordToggle = styled.button`
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: ${props => props.theme.textSoft};
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;
  z-index: 2;

  &:hover {
    color: ${props => props.theme.primary};
  }
`;

export const CheckboxWrapper = styled.div`
  margin-bottom: 1.5rem;
  padding: 0.8rem;
  background: ${props => props.theme.borderLight};
  border-radius: 6px;
  border: 1px solid ${props => props.theme.border};
`;

export const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  color: ${props => props.theme.text};
  font-weight: 500;

  input[type="checkbox"] {
    width: 16px;
    height: 16px;
    cursor: pointer;
    accent-color: ${props => props.theme.primary};
  }

  svg {
    color: ${props => props.theme.primary};
  }
`;

export const CheckboxHelper = styled.p`
  margin-top: 0.5rem;
  margin-left: 1.6rem;
  font-size: 0.8rem;
  color: ${props => props.theme.textSoft};
`;

export const SectionTitle = styled.h3`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
  color: ${props => props.theme.text};
  margin: 1.2rem 0 0.8rem 0;
  padding-bottom: 0.3rem;
  border-bottom: 1px solid ${props => props.theme.border};

  svg {
    color: ${props => props.theme.primary};
  }
`;

export const LoginButton = styled.button`
  width: 100%;
  padding: 0.8rem;
  background: ${props => props.theme.primary};
  color: ${props => props.theme.surface};
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 0.5rem;
  min-height: 48px;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;

  &:hover:not(:disabled) {
    background: ${props => props.theme.primaryDark};
    transform: translateY(-1px);
    box-shadow: ${props => props.theme.shadowHover};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const InfoMessage = styled.div`
  text-align: center;
  margin-top: 1.2rem;
  font-size: 0.8rem;
  color: ${props => props.theme.textSoft};
  background: ${props => props.theme.borderLight};
  padding: 0.6rem;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  svg {
    color: ${props => props.theme.success};
  }

  button {
    background: none;
    border: none;
    color: ${props => props.theme.primary};
    cursor: pointer;
    font-weight: bold;
    padding: 0;
    margin: 0;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

export const BackLink = styled.button`
  width: 100%;
  padding: 0.6rem;
  background: transparent;
  border: none;
  color: ${props => props.theme.textSoft};
  font-size: 0.9rem;
  cursor: pointer;
  margin-top: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: color 0.2s;

  &:hover {
    color: ${props => props.theme.primary};
  }

  svg {
    transition: transform 0.2s;
  }

  &:hover svg {
    transform: translateX(-3px);
  }
`;

// Export adicional para campos com erro
export const FieldError = styled.span`
  display: block;
  margin-top: 0.3rem;
  font-size: 0.75rem;
  color: ${props => props.theme.error};
  padding-left: 0.5rem;
`;

// Export para spinner no botão
export const Spinner = styled.div`
  width: 16px;
  height: 16px;
  border: 2px solid ${props => props.theme.surface};
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
  display: inline-block;
  margin-right: 0.5rem;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

export const ForgotPasswordLink = styled.span`
  display: block;
  text-align: right;
  margin-top: 8px;
  font-size: 0.8rem;
  color: ${props => props.theme.primary};
  cursor: pointer;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.8;
    text-decoration: underline;
  }
`;
