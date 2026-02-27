import styled from 'styled-components';

export const PerfilContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

export const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;

  h1 {
    font-size: 2rem;
    color: ${props => props.darkMode ? '#e2e8f0' : '#2c3e50'};
  }

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
`;

export const EditarButton = styled.button`
  padding: 0.8rem 1.5rem;
  background: #27ae60;
  color: white;
  border: none;
  border-radius: 30px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s;

  &:hover {
    background: #219a52;
    transform: translateY(-2px);
  }
`;

export const MensagemSucesso = styled.div`
  background: #d4edda;
  color: #155724;
  padding: 1rem;
  border-radius: 12px;
  margin-bottom: 1.5rem;
  border: 1px solid #c3e6cb;
`;

export const MensagemErro = styled.div`
  background: #f8d7da;
  color: #721c24;
  padding: 1rem;
  border-radius: 12px;
  margin-bottom: 1.5rem;
  border: 1px solid #f5c6cb;
`;

export const PerfilCard = styled.div`
  background: ${props => props.darkMode ? '#2d3748' : 'white'};
  border-radius: 24px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
`;

export const Avatar = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 2rem;
`;

export const AvatarPlaceholder = styled.div`
  width: 100px;
  height: 100px;
  background: linear-gradient(135deg, #27ae60, #2980b9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  color: white;
  font-weight: 600;
`;

export const InfoContainer = styled.div`
  max-width: 600px;
  margin: 0 auto;
`;

export const InfoGroup = styled.div`
  margin-bottom: 1.5rem;
  flex: ${props => props.half ? '1' : 'auto'};
`;

export const InfoRow = styled.div`
  display: flex;
  gap: 2rem;
  margin-bottom: 1.5rem;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
  }
`;

export const Label = styled.label`
  display: block;
  color: ${props => props.darkMode ? '#a0aec0' : '#7f8c8d'};
  font-size: 0.9rem;
  margin-bottom: 0.3rem;
`;

export const Valor = styled.p`
  font-size: 1.1rem;
  color: ${props => props.darkMode ? '#e2e8f0' : '#2c3e50'};
  font-weight: 500;
  padding: 0.5rem 0;
  border-bottom: 1px solid ${props => props.darkMode ? '#4a5568' : '#ecf0f1'};
`;

export const FormGroup = styled.div`
  margin-bottom: 1.2rem;
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

export const Input = styled.input`
  width: 100%;
  padding: 0.8rem 1rem;
  border: 2px solid ${props => props.darkMode ? '#4a5568' : '#ecf0f1'};
  border-radius: 12px;
  font-size: 1rem;
  background: ${props => props.darkMode ? '#1a202c' : 'white'};
  color: ${props => props.darkMode ? '#e2e8f0' : '#2c3e50'};
  transition: 0.2s;

  &:focus {
    outline: none;
    border-color: #27ae60;
  }

  &:disabled {
    background: ${props => props.darkMode ? '#2d3748' : '#f8f9fa'};
    cursor: not-allowed;
  }
`;

export const Small = styled.small`
  display: block;
  color: ${props => props.darkMode ? '#a0aec0' : '#7f8c8d'};
  font-size: 0.8rem;
  margin-top: 0.3rem;
`;

export const FormActions = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 2rem;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

export const CancelarButton = styled.button`
  flex: 1;
  padding: 1rem;
  background: #ecf0f1;
  color: #2c3e50;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s;

  &:hover {
    background: #bdc3c7;
  }

  @media (max-width: 768px) {
    width: 100%;
  }
`;

export const SalvarButton = styled(CancelarButton)`
  background: #27ae60;
  color: white;

  &:hover {
    background: #219a52;
  }
`;

export const SectionTitle = styled.h2`
  margin-bottom: 1.5rem;
  color: ${props => props.darkMode ? '#e2e8f0' : '#2c3e50'};
`;

export const AlterarSenhaButton = styled.button`
  padding: 1rem;
  background: #27ae60;
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s;
  width: 100%;

  &:hover {
    background: #219a52;
  }
`;

export const EstatisticasGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;

  @media (min-width: 768px) {
    grid-template-columns: repeat(4, 1fr);
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

export const EstatisticaItem = styled.div`
  text-align: center;
  padding: 1rem;
  background: ${props => props.darkMode ? '#1a202c' : '#f8f9fa'};
  border-radius: 16px;
`;

export const EstatisticaValor = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: #27ae60;
  margin-bottom: 0.3rem;
`;

export const EstatisticaLabel = styled.div`
  font-size: 0.9rem;
  color: ${props => props.darkMode ? '#a0aec0' : '#7f8c8d'};
`;

export const InfoMembro = styled.div`
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid ${props => props.darkMode ? '#4a5568' : '#ecf0f1'};
  color: ${props => props.darkMode ? '#a0aec0' : '#7f8c8d'};
  font-size: 0.9rem;

  p {
    margin-bottom: 0.3rem;
  }
`;