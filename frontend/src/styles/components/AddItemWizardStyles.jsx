import styled from 'styled-components';

export const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

export const Modal = styled.div`
  background: ${props => props.theme.surface};
  border: 1px solid ${props => props.theme.border};
  border-radius: 20px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
`;

export const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px;
  border-bottom: 1px solid ${props => props.theme.border};
`;

export const ModalTitle = styled.h2`
  font-size: 20px;
  font-weight: 700;
  color: ${props => props.theme.text};
  margin: 0;
`;

export const CloseButton = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  border: none;
  background: ${props => props.theme.border};
  color: ${props => props.theme.text};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.theme.hover};
  }
`;

export const ModalContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 24px;
`;

export const ModalFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 24px;
  border-top: 1px solid ${props => props.theme.border};
`;

export const FlowSelection = styled.div`
  display: grid;
  gap: 16px;
`;

export const FlowCard = styled.button`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: ${props => props.theme.background};
  border: 2px solid ${props => props.theme.border};
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: left;

  &:hover {
    border-color: ${props => props.theme.primary};
    background: ${props => props.theme.primary}10;
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }
`;

export const FlowIcon = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 14px;
  background: linear-gradient(135deg, ${props => props.theme.primary}20 0%, ${props => props.theme.secondary}20 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.theme.primary};
  flex-shrink: 0;
`;

export const FlowTitle = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: ${props => props.theme.text};
  margin-bottom: 4px;
`;

export const FlowDescription = styled.div`
  font-size: 14px;
  color: ${props => props.theme.textSoft};
`;

export const FlowArrow = styled.div`
  margin-left: auto;
  color: ${props => props.theme.textSoft};
`;

export const SearchFlow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

export const SearchInputContainer = styled.div`
  display: flex;
  gap: 12px;
`;

export const SearchIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: ${props => props.theme.primary}15;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.theme.primary};
`;

export const SearchInput = styled.input`
  flex: 1;
  padding: 14px 16px;
  border: 2px solid ${props => props.theme.border};
  border-radius: 12px;
  background: ${props => props.theme.background};
  color: ${props => props.theme.text};
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;

  &:focus {
    border-color: ${props => props.theme.primary};
  }

  &::placeholder {
    color: ${props => props.theme.textSoft};
  }
`;

export const SearchButton = styled.button`
  padding: 14px 24px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, ${props => props.theme.primary} 0%, ${props => props.theme.secondary} 100%);
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px ${props => props.theme.primary}40;
  }
`;

export const SearchResults = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const ResultCard = styled.button`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: ${props => props.theme.background};
  border: 2px solid ${props => props.theme.border};
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;

  &:hover {
    border-color: ${props => props.theme.primary};
    background: ${props => props.theme.primary}10;
  }
`;

export const ResultImage = styled.img`
  width: 64px;
  height: 64px;
  border-radius: 10px;
  object-fit: cover;
`;

export const ResultInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const ResultName = styled.div`
  font-size: 15px;
  font-weight: 600;
  color: ${props => props.theme.text};
`;

export const ResultStore = styled.div`
  font-size: 13px;
  color: ${props => props.theme.textSoft};
`;

export const ResultPrice = styled.div`
  font-size: 16px;
  font-weight: 700;
  color: ${props => props.theme.primary};
`;

export const ResultArrow = styled.div`
  color: ${props => props.theme.textSoft};
`;

export const ManualFlow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const FormLabel = styled.label`
  font-size: 14px;
  font-weight: 600;
  color: ${props => props.theme.text};
`;

export const FormInput = styled.input`
  padding: 12px 16px;
  border: 2px solid ${props => props.theme.border};
  border-radius: 10px;
  background: ${props => props.theme.background};
  color: ${props => props.theme.text};
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;

  &:focus {
    border-color: ${props => props.theme.primary};
  }

  &::placeholder {
    color: ${props => props.theme.textSoft};
  }
`;

export const FormSelect = styled.select`
  padding: 12px 16px;
  border: 2px solid ${props => props.theme.border};
  border-radius: 10px;
  background: ${props => props.theme.background};
  color: ${props => props.theme.text};
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;

  &:focus {
    border-color: ${props => props.theme.primary};
  }
`;

export const FormTextarea = styled.textarea`
  padding: 12px 16px;
  border: 2px solid ${props => props.theme.border};
  border-radius: 10px;
  background: ${props => props.theme.background};
  color: ${props => props.theme.text};
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
  min-height: 100px;
  resize: vertical;

  &:focus {
    border-color: ${props => props.theme.primary};
  }

  &::placeholder {
    color: ${props => props.theme.textSoft};
  }
`;

export const HybridFlow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const FindPricesButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 24px;
  border: 2px solid ${props => props.theme.primary};
  border-radius: 12px;
  background: ${props => props.theme.primary}15;
  color: ${props => props.theme.primary};
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.theme.primary}25;
    transform: translateY(-2px);
  }
`;

export const CompleteFlow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border: 2px solid ${props => props.theme.border};
  border-radius: 10px;
  background: ${props => props.theme.background};
  color: ${props => props.theme.text};
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${props => props.theme.borderLight};
    background: ${props => props.theme.hover};
  }
`;

export const SaveButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 32px;
  border: none;
  border-radius: 10px;
  background: linear-gradient(135deg, ${props => props.theme.primary} 0%, ${props => props.theme.secondary} 100%);
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-left: auto;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px ${props => props.theme.primary}40;
  }
`;
