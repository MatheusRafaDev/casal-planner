import styled from 'styled-components';

export const LoginContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.theme.background};
  padding: 1rem;
`;

export const LoginCard = styled.div`
  background: ${props => props.theme.surface};
  border-radius: 16px;
  padding: 2rem;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
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
  font-size: 0.95rem;
  cursor: pointer;
  color: ${props => props.active ? props.theme.primary : props.theme.textSoft};
  font-weight: ${props => props.active ? '600' : '400'};
  border-bottom: 2px solid ${props => props.active ? props.theme.primary : 'transparent'};

  svg {
    width: 16px;
    height: 16px;
    margin-right: 4px;
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
  flex: ${props => props.half ? '1' : 'auto'};
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
  font-size: 0.95rem;
  transition: 0.2s;
  background: ${props => props.theme.surface};
  color: ${props => props.theme.text};

  &:focus {
    outline: none;
    border-color: ${props => props.theme.primary};
  }

  &::placeholder {
    color: ${props => props.theme.textLight};
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
  transition: 0.2s;

  &:hover:not(:disabled) {
    background: ${props => props.theme.primaryDark};
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

  &:hover {
    color: ${props => props.theme.primary};
  }
`;