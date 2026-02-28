import styled from 'styled-components';

export const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(4px);
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
  margin-bottom: 1rem;

  h3 {
    font-size: 1.125rem;
    font-weight: 600;
    color: ${props => props.theme.text};
  }
`;

export const CloseButton = styled.button`
  padding: 0.25rem;
  color: ${props => props.theme.textSoft};
  background: none;
  border: none;
  cursor: pointer;
  border-radius: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: ${props => props.theme.text};
    background: ${props => props.theme.border};
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
  gap: 0.25rem;
`;

export const Label = styled.label`
  font-size: 0.875rem;
  font-weight: 500;
  color: ${props => props.theme.textSoft};
`;

export const Input = styled.input`
  padding: 0.5rem 0.75rem;
  border: 1px solid ${props => props.theme.border};
  border-radius: 0.375rem;
  font-size: 0.875rem;
  background: ${props => props.theme.background};
  color: ${props => props.theme.text};
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.primary};
    box-shadow: 0 0 0 2px ${props => props.theme.primary}40;
  }

  &::placeholder {
    color: ${props => props.theme.textLight};
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
  border-radius: 0.5rem;
  font-size: 1.125rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  border: none;
  cursor: pointer;
  background: ${props => props.$active 
    ? `${props.theme.primary}20` 
    : props.theme.border};
  color: ${props => props.$active 
    ? props.theme.primary 
    : props.theme.text};
  border: ${props => props.$active 
    ? `2px solid ${props.theme.primary}` 
    : 'none'};

  &:hover {
    background: ${props => props.$active 
      ? `${props.theme.primary}30` 
      : props.theme.borderLight};
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
  border-radius: 9999px;
  transition: all 0.2s;
  border: none;
  cursor: pointer;
  outline: ${props => props.$active 
    ? `2px solid ${props.theme.primary}` 
    : 'none'};
  outline-offset: 2px;

  &:hover {
    transform: scale(1.1);
  }
`;

export const ButtonGroup = styled.div`
  display: flex;
  gap: 0.5rem;
  padding-top: 0.5rem;
`;

export const CancelButton = styled.button`
  flex: 1;
  padding: 0.625rem 1rem;
  border-radius: 0.375rem;
  font-weight: 500;
  font-size: 0.875rem;
  transition: all 0.2s;
  border: 1px solid ${props => props.theme.border};
  background: transparent;
  color: ${props => props.theme.text};
  cursor: pointer;

  &:hover {
    background: ${props => props.theme.border};
  }
`;

export const CreateButton = styled(CancelButton)`
  background: ${props => props.theme.primary};
  color: white;
  border: none;

  &:hover {
    background: ${props => props.theme.primaryHover || props.theme.primary};
    opacity: 0.9;
  }
`;