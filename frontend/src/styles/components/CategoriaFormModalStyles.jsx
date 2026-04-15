import styled from 'styled-components';

export const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 99999;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  padding: 1rem;
  margin: 0;
  box-sizing: border-box;

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  animation: fadeIn 0.2s ease;

  @media (max-width: 768px) {
    padding: 0.75rem;
  }
`;

export const ModalContainer = styled.div`
  position: relative;
  background: ${props => props.theme.surface};
  border-radius: 1.5rem;
  padding: 2rem;
  width: 100%;
  max-width: 35rem;
  max-height: 90dvh;
  overflow-y: auto;
  box-shadow: 0 4px 6px rgba(0,0,0,0.07), 0 20px 50px rgba(0,0,0,0.18), 0 0 0 1px rgba(255,255,255,0.05);
  border: 1px solid ${props => props.theme.border};
  margin: auto;
  transform: translateZ(0);
  will-change: transform;

  @keyframes slideUp {
    from { transform: translateY(24px) scale(0.97); opacity: 0; }
    to { transform: translateY(0) scale(1); opacity: 1; }
  }
  
  animation: slideUp 0.25s ease;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: ${props => props.theme.borderLight};
    border-radius: 10px;
  }

  &::-webkit-scrollbar-thumb {
    background: ${props => props.theme.primary};
    border-radius: 10px;
  }

  @media (max-width: 480px) {
    padding: 1.5rem;
    border-radius: 1.25rem;
    max-height: 85dvh;
  }
`;

export const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid ${props => props.theme.border};

  h2 {
    font-size: 1.25rem;
    font-weight: 600;
    color: ${props => props.theme.text};
    margin: 0;
  }

  @media (max-width: 480px) {
    margin-bottom: 1rem;
    
    h2 {
      font-size: 1.125rem;
    }
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
  min-width: 36px;
  min-height: 36px;
  font-size: 1rem;

  &:hover {
    background: ${props => props.theme.textLight};
    color: ${props => props.theme.text};
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.95);
  }
`;

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const FormGroup = styled.div`
  margin-bottom: 1rem;
  display: flex;
  flex-direction: column;

  &:last-of-type {
    margin-bottom: 0;
  }
`;

export const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  color: ${props => props.theme.textSoft};
  font-weight: 500;
  font-size: 0.875rem;
`;

export const Input = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid ${props => props.theme.border};
  border-radius: 12px;
  font-size: 1rem;
  background: ${props => props.theme.surface};
  color: ${props => props.theme.text};
  transition: all 0.2s;
  font-family: inherit;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.primary};
    box-shadow: 0 0 0 3px ${props => `${props.theme.primary}20`};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
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
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 12px;
  font-size: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  border: 2px solid ${props => props.$active 
    ? props.theme.primary 
    : props.theme.border};
  cursor: pointer;
  background: ${props => props.$active 
    ? `${props.theme.primary}15` 
    : props.theme.surface};
  color: ${props => props.theme.text};

  &:hover {
    border-color: ${props => props.theme.primary};
    transform: scale(1.05);
    background: ${props => `${props.theme.primary}10`};
  }

  &:active {
    transform: scale(0.95);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

export const ColorsGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
`;

export const ColorButton = styled.button`
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 12px;
  transition: all 0.2s;
  border: 2px solid ${props => props.$active 
    ? props.theme.primary 
    : 'transparent'};
  cursor: pointer;
  background: ${props => props.color};
  box-shadow: ${props => props.$active ? `0 0 0 2px ${props.theme.background}, 0 0 0 4px ${props.theme.primary}` : 'none'};

  &:hover {
    transform: scale(1.1);
    border-color: ${props => props.theme.primary};
  }

  &:active {
    transform: scale(0.95);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

export const ModalButtons = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 0.5rem;

  @media (max-width: 480px) {
    flex-direction: column-reverse;
    gap: 0.75rem;
    margin-top: 1.5rem;
  }
`;

export const CancelarButton = styled.button`
  flex: 1;
  padding: 0.875rem 1rem;
  background: ${props => props.theme.border};
  color: ${props => props.theme.text};
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  min-height: 48px;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  font-size: 0.875rem;

  &:hover {
    background: ${props => props.theme.textLight};
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

export const CriarButton = styled(CancelarButton)`
  background: ${props => props.theme.primary};
  color: white;

  &:hover {
    background: ${props => props.theme.primaryDark};
    filter: brightness(1.05);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

// Adicione também SalvarButton como alias para CriarButton (para compatibilidade)
export const SalvarButton = CriarButton;