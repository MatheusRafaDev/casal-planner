import styled from 'styled-components';

export const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  animation: fadeIn 0.18s ease;
  padding: 1rem;

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

export const ModalContainer = styled.div`
  background: ${props => props.theme.surface};
  border-radius: 1.5rem;
  padding: 2rem;
  width: 100%;
  max-width: 30rem;
  max-height: 90dvh;
  overflow-y: auto;
  box-shadow:
    0 4px 6px rgba(0,0,0,0.07),
    0 20px 50px rgba(0,0,0,0.18),
    0 0 0 1px rgba(255,255,255,0.05);
  border: 1px solid ${props => props.theme.border};
  animation: slideUp 0.25s cubic-bezier(0.34, 1.2, 0.64, 1);
  scrollbar-width: thin;
  scrollbar-color: ${props => props.theme.border} transparent;
  &::-webkit-scrollbar { width: 5px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb { background: ${props => props.theme.border}; border-radius: 4px; }

  @keyframes slideUp {
    from { transform: translateY(24px) scale(0.97); opacity: 0; }
    to { transform: translateY(0) scale(1); opacity: 1; }
  }

  @media (max-width: 480px) {
    padding: 1.5rem;
    border-radius: 1.25rem;
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
    color:  ${({ theme }) => theme.text};

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

export const ErrorMessage = styled.span`
  color: #dc3545;
  font-size: 0.85rem;
  margin-top: 0.25rem;
  display: block;
  
  ${props => props.theme === 'dark' && `
    color: #ff6b6b;
  `}
`;

export const CriarButton = styled(CancelarButton)`
  background: ${(props) => props.theme.primary};
  color:  ${({ theme }) => theme.text};

  &:hover {
    background: ${(props) => props.theme.primary}cc;
  }
`;