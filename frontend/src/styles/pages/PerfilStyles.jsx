// src/styles/pages/PerfilStyles.js
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
    font-size: 1.75rem;
    font-weight: 700;
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
  background: ${props => props.theme.primary};
  color: white;
  border: none;
  border-radius: ${props => props.theme.radius};
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.theme.primaryDark};
    transform: translateY(-2px);
    box-shadow: ${props => props.theme.shadowHover};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

export const MensagemSucesso = styled.div`
  padding: 1rem;
  background: ${props => props.theme.success};
  color: white;
  border-radius: ${props => props.theme.radius};
  margin-bottom: 1rem;
  text-align: center;
  animation: fadeIn 0.3s ease;
`;

export const MensagemErro = styled.div`
  padding: 1rem;
  background: ${props => props.theme.error};
  color: white;
  border-radius: ${props => props.theme.radius};
  margin-bottom: 1rem;
  text-align: center;
  animation: fadeIn 0.3s ease;
`;

export const PerfilCard = styled.div`
  background: ${props => props.theme.card};
  border: 1px solid ${props => props.theme.border};
  border-radius: ${props => props.theme.radiusLg || '12px'};
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: ${props => props.theme.shadowCard};
`;

export const Avatar = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 2rem;
`;

export const AvatarPlaceholder = styled.div`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: ${props => props.theme.primary};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  font-weight: bold;
  box-shadow: ${props => props.theme.shadowHover};
`;

export const InfoContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

export const InfoGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: ${props => props.$half ? '1' : 'none'};
`;

export const InfoRow = styled.div`
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
  }
`;

export const Label = styled.label`
  font-size: 0.875rem;
  color: ${props => props.theme.textSoft};
  font-weight: 500;
`;

export const Valor = styled.p`
  font-size: 1.125rem;
  color: ${props => props.theme.text};
  margin: 0;
  font-weight: 400;
`;

export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: ${props => props.$half ? '1' : 'none'};
`;

export const FormRow = styled.div`
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
  }
`;

export const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid ${props => props.theme.border};
  border-radius: ${props => props.theme.radius};
  font-size: 1rem;
  background: ${props => props.theme.surface};
  color: ${props => props.theme.text};
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.primaryLight};
  }

  &:disabled, &.disabled {
    background: ${props => props.theme.hover};
    color: ${props => props.theme.textDisabled};
    cursor: not-allowed;
    border-color: ${props => props.theme.borderLight};
  }

  &::placeholder {
    color: ${props => props.theme.textLight};
  }
`;

export const Select = styled.select`
  padding: 0.75rem;
  border: 1px solid ${props => props.theme.border};
  border-radius: ${props => props.theme.radius};
  font-size: 1rem;
  background: ${props => props.theme.surface};
  color: ${props => props.theme.text};
  cursor: pointer;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.primaryLight};
  }

  option {
    background: ${props => props.theme.surface};
    color: ${props => props.theme.text};
  }
`;

export const Small = styled.small`
  font-size: 0.75rem;
  color: ${props => props.theme.textLight};
`;

export const FormActions = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1rem;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

export const CancelarButton = styled.button`
  padding: 0.75rem 1.5rem;
  background: transparent;
  color: ${props => props.theme.text};
  border: 1px solid ${props => props.theme.border};
  border-radius: ${props => props.theme.radius};
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: ${props => props.theme.hover};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const SalvarButton = styled.button`
  padding: 0.75rem 1.5rem;
  background: ${props => props.theme.primary};
  color: white;
  border: none;
  border-radius: ${props => props.theme.radius};
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: ${props => props.theme.primaryDark};
    transform: translateY(-2px);
    box-shadow: ${props => props.theme.shadowHover};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

export const SectionTitle = styled.h2`
  font-size: 1.5rem;
  color: ${props => props.theme.text};
  margin: 0 0 1.5rem 0;
  font-weight: 600;
`;

export const AlterarSenhaButton = styled.button`
  width: 100%;
  padding: 1rem;
  background: ${props => props.danger ? props.theme.error : 'transparent'};
  color: ${props => props.danger ? 'white' : props.theme.text};
  border: ${props => props.danger ? 'none' : `1px solid ${props.theme.border}`};
  border-radius: ${props => props.theme.radius};
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  &:hover:not(:disabled) {
    background: ${props => props.danger ? props.theme.accentDark : props.theme.hover};
    transform: translateY(-2px);
    box-shadow: ${props => props.theme.shadowHover};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const InfoMembro = styled.div`
  background: ${props => props.theme.surface};
  padding: 1.5rem;
  border-radius: ${props => props.theme.radiusLg || '12px'};
  margin-bottom: 1.5rem;
  border: 1px solid ${props => props.theme.border};

  h3 {
    color: ${props => props.theme.primary};
    margin: 0 0 1.5rem 0;
    font-size: 1.25rem;
    font-weight: 600;
  }
`;

export const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
  
  &::after {
    content: '';
    width: 40px;
    height: 40px;
    border: 3px solid ${props => props.theme.border};
    border-top-color: ${props => props.theme.primary};
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

// MODAL
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
  animation: fadeIn 0.3s ease;
`;

export const ModalContent = styled.div`
  background: ${props => props.theme.card};
  border-radius: ${props => props.theme.radiusLg || '12px'};
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: ${props => props.theme.shadowHover};
  animation: slideUp 0.3s ease;
`;

export const ModalHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid ${props => props.theme.border};
  display: flex;
  justify-content: space-between;
  align-items: center;

  h2 {
    margin: 0;
    font-size: 1.5rem;
    color: ${props => props.theme.text};
  }
`;

export const FecharButton = styled.button`
  background: transparent;
  border: none;
  font-size: 2rem;
  line-height: 1;
  color: ${props => props.theme.textLight};
  cursor: pointer;
  padding: 0.5rem;
  transition: all 0.2s ease;

  &:hover {
    color: ${props => props.theme.text};
    transform: scale(1.1);
  }
`;

export const ModalBody = styled.div`
  padding: 1.5rem;
  color: ${props => props.theme.text};

  p {
    margin: 0 0 1rem 0;
    line-height: 1.6;
  }
`;

export const ModalFooter = styled.div`
  padding: 1.5rem;
  border-top: 1px solid ${props => props.theme.border};
  display: flex;
  justify-content: flex-end;
  gap: 1rem;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

export const ConfirmarButton = styled.button`
  padding: 0.75rem 1.5rem;
  background: ${props => props.theme.error};
  color: white;
  border: none;
  border-radius: ${props => props.theme.radius};
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: ${props => props.theme.accentDark};
    transform: translateY(-2px);
    box-shadow: ${props => props.theme.shadowHover};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

// Estatísticas (caso queira adicionar depois)
export const EstatisticasGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-top: 1rem;
`;

export const EstatisticaItem = styled.div`
  background: ${props => props.theme.surface};
  padding: 1.5rem;
  border-radius: ${props => props.theme.radiusLg || '12px'};
  text-align: center;
  border: 1px solid ${props => props.theme.border};
`;

export const EstatisticaValor = styled.div`
  font-size: 2rem;
  font-weight: bold;
  color: ${props => props.theme.primary};
  margin-bottom: 0.5rem;
`;

export const EstatisticaLabel = styled.div`
  font-size: 0.875rem;
  color: ${props => props.theme.textSoft};
`;