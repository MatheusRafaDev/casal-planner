import styled from 'styled-components';

export const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${(props) => props.theme.border};
  backdrop-filter: blur(8px);
  animation: fadeIn 0.2s ease;

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

export const ModalContainer = styled.div`
  background: ${props => props.theme.surface};
  border-radius: 1rem;
  padding: 1.5rem;
  width: 100%;
  max-width: 28rem;
  margin: 0 1rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  border: 1px solid ${props => props.theme.border};
  animation: slideIn 0.3s ease;

  @keyframes slideIn {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
`;

export const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;

  h2 {
    font-size: 1.25rem;
    font-weight: 600;
    color: ${props => props.theme.textLight};
    margin: 0;
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

  &:hover {
    background: ${props => props.theme.textLight};
    color: ${props => props.theme.text};
  }
`;

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

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

  &:focus {
    outline: none;
    border-color: ${(props) => props.theme.primary};
  }
`;

export const IconsGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
`;

export const IconButton = styled.button`
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 8px;
  font-size: 1.125rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  border: 2px solid ${props => props.$active 
    ? props.theme.primary 
    : props.theme.border};
  cursor: pointer;
  background: ${props => props.$active 
    ? `${props.theme.primary}10` 
    : props.theme.surface};
  color: ${props => props.theme.text};

  &:hover {
    border-color: ${props => props.theme.primary};
    transform: scale(1.05);
  }
`;

export const ColorsGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
`;

export const ColorButton = styled.button`
  width: 2rem;
  height: 2rem;
  border-radius: 8px;
  transition: all 0.2s;
  border: 2px solid ${props => props.$active 
    ? props.theme.primary 
    : 'transparent'};
  cursor: pointer;
  background: ${props => props.color};

  &:hover {
    transform: scale(1.1);
    border-color: ${props => props.theme.primary};
  }
`;

export const ModalButtons = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
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

  &:hover {
    background: ${(props) => props.theme.textLight};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const CriarButton = styled(CancelarButton)`
  background: ${(props) => props.theme.primary};
  color: white;

  &:hover {
    background: ${(props) => props.theme.primary}cc;
  }
`;