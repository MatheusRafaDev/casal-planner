import styled from 'styled-components';

export const LoginContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 1rem;
`;

export const LoginCard = styled.div`
  background: ${props => props.darkMode ? '#2d3748' : 'white'};
  border-radius: 32px;
  padding: 2.5rem;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0,0,0,0.2);
  scrollbar-width: thin;
  scrollbar-color: #27ae60 #ecf0f1;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: #ecf0f1;
    border-radius: 10px;
  }

  &::-webkit-scrollbar-thumb {
    background: #27ae60;
    border-radius: 10px;
  }

  @media (max-width: 768px) {
    padding: 1.5rem;
    max-width: 100%;
  }
`;

export const Title = styled.h1`
  text-align: center;
  font-size: 2.5rem;
  margin-bottom: 0.3rem;
  background: linear-gradient(135deg, #27ae60, #2980b9);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

export const Subtitle = styled.p`
  text-align: center;
  color: ${props => props.darkMode ? '#a0aec0' : '#7f8c8d'};
  margin-bottom: 2rem;
  font-size: 1rem;
`;

export const TabsContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  border-bottom: 2px solid #ecf0f1;
  padding-bottom: 0.5rem;
`;

export const Tab = styled.button`
  flex: 1;
  background: none;
  border: none;
  padding: 0.8rem;
  font-size: 1rem;
  cursor: pointer;
  color: ${props => props.active ? '#27ae60' : '#7f8c8d'};
  font-weight: ${props => props.active ? '600' : '400'};
  border-bottom: 3px solid ${props => props.active ? '#27ae60' : 'transparent'};
  transition: 0.2s;

  &:hover {
    color: #27ae60;
  }
`;

export const ErrorMessage = styled.div`
  background: #fee;
  color: #c33;
  padding: 0.8rem;
  border-radius: 12px;
  margin-bottom: 1rem;
  text-align: center;
  font-size: 0.9rem;
  border: 1px solid #fcc;
`;

export const Form = styled.form`
  width: 100%;
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

export const Label = styled.label`
  display: block;
  margin-bottom: 0.3rem;
  color: ${props => props.darkMode ? '#a0aec0' : '#7f8c8d'};
  font-weight: 500;
  font-size: 0.9rem;
`;

export const Input = styled.input`
  width: 100%;
  padding: 0.8rem 1rem;
  border: 2px solid ${props => props.darkMode ? '#4a5568' : '#ecf0f1'};
  border-radius: 16px;
  font-size: 1rem;
  transition: 0.2s;
  background: ${props => props.darkMode ? '#1a202c' : 'white'};
  color: ${props => props.darkMode ? '#e2e8f0' : '#2c3e50'};

  &:focus {
    outline: none;
    border-color: #27ae60;
    box-shadow: 0 0 0 3px rgba(39, 174, 96, 0.1);
  }

  &::placeholder {
    color: ${props => props.darkMode ? '#718096' : '#bdc3c7'};
  }

  &:disabled {
    background: ${props => props.darkMode ? '#2d3748' : '#f8f9fa'};
    cursor: not-allowed;
  }
`;

export const CheckboxGroup = styled.div`
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: ${props => props.darkMode ? '#1a202c' : '#f8f9fa'};
  border-radius: 16px;
  border: 1px solid ${props => props.darkMode ? '#4a5568' : '#ecf0f1'};
`;

export const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  color: ${props => props.darkMode ? '#e2e8f0' : '#2c3e50'};
  font-weight: 500;

  input[type="checkbox"] {
    width: 20px;
    height: 20px;
    cursor: pointer;
    accent-color: #27ae60;
  }
`;

export const CheckboxHelper = styled.p`
  margin-top: 0.5rem;
  font-size: 0.8rem;
  color: ${props => props.darkMode ? '#a0aec0' : '#7f8c8d'};
  line-height: 1.4;
`;

export const FormSectionTitle = styled.h3`
  font-size: 1.1rem;
  color: ${props => props.darkMode ? '#e2e8f0' : '#2c3e50'};
  margin: 1.5rem 0 1rem 0;
  padding-bottom: 0.3rem;
  border-bottom: 2px solid ${props => props.darkMode ? '#4a5568' : '#ecf0f1'};
`;

export const LoginButton = styled.button`
  width: 100%;
  padding: 1rem;
  background: #27ae60;
  color: white;
  border: none;
  border-radius: 16px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s;

  &:hover:not(:disabled) {
    background: #219a52;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(39, 174, 96, 0.3);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

export const InfoText = styled.p`
  text-align: center;
  margin-top: 1rem;
  font-size: 0.9rem;
  color: ${props => props.darkMode ? '#a0aec0' : '#7f8c8d'};
`;