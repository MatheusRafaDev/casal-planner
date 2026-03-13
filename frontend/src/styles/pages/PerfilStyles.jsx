
import styled from 'styled-components';

export const PerfilContainer = styled.div`
  min-height: 100vh;
  background: ${props => props.theme.background};
  padding: 2rem;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

export const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;

  h1 {
    font-size: 1.8rem;
    font-weight: 600;
    color: ${props => props.theme.text};
    margin: 0;

    @media (max-width: 768px) {
      font-size: 1.5rem;
    }
  }
`;

export const EditarButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: ${props => props.$primary ? props.theme.primary : props.theme.surface};
  color: ${props => props.$primary ? props.theme.surface : props.theme.text};
  border: ${props => props.$primary ? 'none' : `1px solid ${props.theme.border}`};
  border-radius: ${props => props.theme.radiusFull};
  font-size: 0.9rem;
  font-weight: 500;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  opacity: ${props => props.disabled ? 0.6 : 1};
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: ${props => props.$primary ? props.theme.primaryDark : props.theme.hover};
    transform: translateY(-2px);
    box-shadow: ${props => props.theme.shadowHover};
  }
`;

export const MensagemSucesso = styled.div`
  padding: 0.75rem 1.5rem;
  background: ${props => props.theme.success}15;
  border: 1px solid ${props => props.theme.success};
  border-radius: ${props => props.theme.radius};
  color: ${props => props.theme.success};
  font-size: 0.9rem;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  animation: slideIn 0.3s ease;

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

export const MensagemErro = styled.div`
  padding: 0.75rem 1.5rem;
  background: ${props => props.theme.error}10;
  border: 1px solid ${props => props.theme.error}30;
  border-radius: ${props => props.theme.radius};
  color: ${props => props.theme.error};
  font-size: 0.9rem;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  animation: slideIn 0.3s ease;
`;

export const PerfilCard = styled.div`
  background: ${props => props.theme.surface};
  border-radius: ${props => props.theme.radiusLg};
  padding: 2rem;
  margin-bottom: 1.5rem;
  box-shadow: ${props => props.theme.shadowCard};
  border: 1px solid ${props => props.theme.border};
  transition: all 0.3s ease;

  &:hover {
    box-shadow: ${props => props.theme.shadowHover};
  }

  @media (max-width: 768px) {
    padding: 1.5rem;
  }
`;

export const AvatarSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid ${props => props.theme.border};
`;

export const Avatar = styled.div`
  width: 80px;
  height: 80px;
  border-radius: ${props => props.theme.radiusFull};
  background: ${props => props.theme.primary}15;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 3px solid ${props => props.theme.primary};
`;

export const AvatarPlaceholder = styled.div`
  width: 100%;
  height: 100%;
  border-radius: ${props => props.theme.radiusFull};
  background: ${props => props.theme.primary};
  color: ${props => props.theme.surface};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: 600;
  text-transform: uppercase;
`;

export const UserInfo = styled.div`
  flex: 1;

  h2 {
    font-size: 1.25rem;
    font-weight: 600;
    color: ${props => props.theme.text};
    margin: 0 0 0.25rem 0;
  }

  p {
    font-size: 0.9rem;
    color: ${props => props.theme.textSoft};
    margin: 0;
  }
`;

export const InfoContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

export const InfoMembro = styled.div`
  background: ${props => props.theme.background}50;
  border-radius: ${props => props.theme.radius};
  padding: 1.5rem;

  h3 {
    font-size: 1.1rem;
    font-weight: 600;
    color: ${props => props.theme.text};
    margin: 0 0 1rem 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid ${props => props.theme.border};
  }
`;

export const InfoRow = styled.div`
  display: grid;
  grid-template-columns: ${props => props.$half ? '1fr 1fr' : '1fr'};
  gap: 1.5rem;
  margin-bottom: 1rem;

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

export const InfoGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

export const Label = styled.span`
  font-size: 0.75rem;
  font-weight: 500;
  color: ${props => props.theme.textSoft};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

export const Valor = styled.span`
  font-size: 1rem;
  color: ${props => props.theme.text};
  font-weight: 500;
  word-break: break-word;

  &.destaque {
    color: ${props => props.theme.primary};
    font-weight: 600;
    font-size: 1.1rem;
  }
`;

export const RendaTotalCard = styled.div`
  background: ${props => props.theme.primary}10;
  border-radius: ${props => props.theme.radius};
  padding: 1.5rem;
  margin-top: 0.5rem;
  border: 1px solid ${props => props.theme.primary}30;
  display: flex;
  justify-content: space-between;
  align-items: center;

  ${Label} {
    font-size: 0.9rem;
    color: ${props => props.theme.primary};
    text-transform: none;
  }

  ${Valor} {
    font-size: 1.5rem;
    font-weight: 600;
    color: ${props => props.theme.primary};
  }
`;

export const DataCriacao = styled.div`
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid ${props => props.theme.border};
  font-size: 0.8rem;
  color: ${props => props.theme.textLight};
  text-align: right;
`;

export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  margin-bottom: 1rem;
  width: 100%;
`;

export const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 0.5rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 0;
  }
`;

export const Input = styled.input`
  width: 100%;
  padding: 0.7rem 1rem;
  background: ${props => props.theme.surface};
  border: 1px solid ${props => props.theme.border};
  border-radius: ${props => props.theme.radius};
  font-size: 0.95rem;
  color: ${props => props.theme.text};
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.primary};
    box-shadow: 0 0 0 2px ${props => `${props.theme.primary}20`};
  }

  &:disabled {
    background: ${props => props.theme.hover};
    color: ${props => props.theme.textDisabled};
    cursor: not-allowed;
    border-color: ${props => props.theme.borderLight};
  }

  &.disabled {
    background: ${props => props.theme.hover};
    color: ${props => props.theme.textDisabled};
  }

  &::placeholder {
    color: ${props => props.theme.textLight};
  }
`;

export const Small = styled.small`
  font-size: 0.75rem;
  color: ${props => props.theme.textLight};
  margin-top: 0.25rem;
`;

export const Divider = styled.hr`
  margin: 2rem 0;
  border: none;
  border-top: 1px solid ${props => props.theme.border};
`;

export const FormActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid ${props => props.theme.border};
`;

export const CancelarButton = styled.button`
  padding: 0.7rem 2rem;
  background: transparent;
  border: 1px solid ${props => props.theme.border};
  border-radius: ${props => props.theme.radiusFull};
  color: ${props => props.theme.text};
  font-size: 0.9rem;
  font-weight: 500;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  opacity: ${props => props.disabled ? 0.6 : 1};
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: ${props => props.theme.hover};
    border-color: ${props => props.theme.textSoft};
  }
`;

export const SalvarButton = styled.button`
  padding: 0.7rem 2rem;
  background: ${props => props.theme.primary};
  border: none;
  border-radius: ${props => props.theme.radiusFull};
  color: ${props => props.theme.surface};
  font-size: 0.9rem;
  font-weight: 500;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  opacity: ${props => props.disabled ? 0.6 : 1};
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: ${props => props.theme.primaryDark};
    transform: translateY(-2px);
    box-shadow: ${props => props.theme.shadowHover};
  }
`;

export const SectionTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: ${props => props.theme.text};
  margin: 0 0 1.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid ${props => props.theme.border};
`;

export const AlterarSenhaButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.8rem;
  background: ${props => props.$danger ? props.theme.error + '10' : props.theme.hover};
  border: 1px solid ${props => props.$danger ? props.theme.error + '30' : props.theme.border};
  border-radius: ${props => props.theme.radius};
  color: ${props => props.$danger ? props.theme.error : props.theme.text};
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.$danger ? props.theme.error + '20' : props.theme.borderLight};
    transform: translateY(-2px);
  }
`;

export const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 3px solid ${props => props.theme.border};
  border-top-color: ${props => props.theme.primary};
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 2rem auto;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

export const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 1rem;

  p {
    color: ${props => props.theme.textSoft};
    font-size: 0.9rem;
    margin: 0;
  }
`;

export const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
  animation: fadeIn 0.2s ease;

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

export const ModalContent = styled.div`
  background: ${props => props.theme.surface};
  border-radius: ${props => props.theme.radiusLg};
  width: 100%;
  max-width: 450px;
  box-shadow: ${props => props.theme.shadowHover};
  animation: slideUp 0.3s ease;

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

export const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid ${props => props.theme.border};

  h2 {
    font-size: 1.25rem;
    font-weight: 600;
    color: ${props => props.theme.text};
    margin: 0;
  }
`;

export const ModalBody = styled.div`
  padding: 2rem;

  p {
    margin: 0 0 1rem 0;
    color: ${props => props.theme.text};
    line-height: 1.5;
    font-size: 0.95rem;

    &:last-child {
      margin-bottom: 0;
    }

    &.warning {
      color: ${props => props.theme.error};
      font-weight: 600;
    }
  }
`;

export const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem 2rem;
  border-top: 1px solid ${props => props.theme.border};
`;

export const FecharButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.theme.textLight};
  font-size: 1.5rem;
  cursor: pointer;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: ${props => props.theme.radiusFull};
  transition: all 0.2s;

  &:hover {
    background: ${props => props.theme.hover};
    color: ${props => props.theme.text};
  }
`;

export const ConfirmarButton = styled.button`
  padding: 0.7rem 2rem;
  background: ${props => props.$danger ? props.theme.error : props.theme.primary};
  border: none;
  border-radius: ${props => props.theme.radiusFull};
  color: ${props => props.theme.surface};
  font-size: 0.9rem;
  font-weight: 500;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  opacity: ${props => props.disabled ? 0.6 : 1};
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: ${props => props.$danger ? props.theme.error + 'dd' : props.theme.primaryDark};
    transform: translateY(-2px);
    box-shadow: ${props => props.theme.shadowHover};
  }
`;

export const InputIcon = styled.span`
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: ${props => props.theme.textLight};
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const InputWithIcon = styled(Input)`
  padding-left: 35px;
`;