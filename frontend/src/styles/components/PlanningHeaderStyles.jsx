import styled from 'styled-components';

export const Header = styled.header`
  background: ${props => props.theme.background};
  border-bottom: 1px solid ${props => props.theme.border};
  padding: 20px 24px;
  position: sticky;
  top: 0;
  z-index: 50;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);

  @media (max-width: 768px) {
    padding: 16px;
  }
`;

export const HeaderContent = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 12px;
  }
`;

export const SearchContainer = styled.div`
  flex: 1;
  max-width: 500px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: ${props => props.theme.surface};
  border: 2px solid ${props => props.$focused ? props.theme.primary : props.theme.border};
  border-radius: 12px;
  transition: all 0.2s ease;

  &:focus-within {
    border-color: ${props => props.theme.primary};
    box-shadow: 0 0 0 4px ${props => props.theme.primary}20;
  }

  @media (max-width: 768px) {
    max-width: 100%;
    width: 100%;
  }
`;

export const SearchIcon = styled.span`
  color: ${props => props.theme.textSoft};
  display: flex;
  align-items: center;
`;

export const SearchInput = styled.input`
  flex: 1;
  border: none;
  background: transparent;
  font-size: 14px;
  color: ${props => props.theme.text};
  outline: none;

  &::placeholder {
    color: ${props => props.theme.textSoft};
  }
`;

export const Shortcut = styled.span`
  font-size: 11px;
  color: ${props => props.theme.textSoft};
  background: ${props => props.theme.border};
  padding: 4px 8px;
  border-radius: 6px;
  font-weight: 500;
  white-space: nowrap;

  @media (max-width: 768px) {
    display: none;
  }
`;

export const ClearButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: none;
  background: ${props => props.theme.border};
  border-radius: 6px;
  color: ${props => props.theme.textSoft};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.theme.hover};
    color: ${props => props.theme.text};
  }
`;

export const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;

  @media (max-width: 768px) {
    width: 100%;
    justify-content: space-between;
  }
`;

export const FilterButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border: 2px solid ${props => props.$active ? props.theme.primary : props.theme.border};
  border-radius: 12px;
  background: ${props => props.$active ? `${props.theme.primary}15` : props.theme.surface};
  color: ${props => props.$active ? props.theme.primary : props.theme.text};
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${props => props.theme.primary};
    background: ${props => props.theme.primary}20;
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }

  @media (max-width: 768px) {
    flex: 1;
    justify-content: center;
    padding: 12px 16px;
  }
`;

export const AddButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, ${props => props.theme.primary} 0%, ${props => props.theme.secondary} 100%);
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px ${props => props.theme.primary}40;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px ${props => props.theme.primary}50;
  }

  &:active {
    transform: translateY(0);
  }

  @media (max-width: 768px) {
    flex: 1;
    justify-content: center;
    padding: 12px 16px;
  }
`;
