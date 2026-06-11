import styled from 'styled-components';

export const MobileContainer = styled.div`
  display: none;

  @media (max-width: 768px) {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    background: ${props => props.theme.background};
    padding-bottom: 80px;
  }
`;

export const MobileHeader = styled.div`
  padding: 16px;
  background: ${props => props.theme.surface};
  border-bottom: 1px solid ${props => props.theme.border};
  position: sticky;
  top: 0;
  z-index: 50;
`;

export const MobileLogo = styled.div`
  font-size: 18px;
  font-weight: 700;
  background: linear-gradient(135deg, ${props => props.theme.primary} 0%, ${props => props.theme.secondary} 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 12px;
`;

export const MobileSearch = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: ${props => props.theme.background};
  border: 2px solid ${props => props.theme.border};
  border-radius: 12px;
`;

export const SearchIcon = styled.div`
  color: ${props => props.theme.textSoft};
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

export const MobileContent = styled.div`
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

export const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
`;

export const SummaryCard = styled.div`
  background: ${props => props.theme.surface};
  border: 1px solid ${props => props.theme.border};
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: ${props => props.$color};
  }
`;

export const SummaryLabel = styled.span`
  font-size: 12px;
  color: ${props => props.theme.textSoft};
`;

export const SummaryValue = styled.span`
  font-size: 18px;
  font-weight: 700;
  color: ${props => props.theme.text};
`;

export const CategoriesScroll = styled.div`
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 4px;

  &::-webkit-scrollbar {
    height: 4px;
  }

  &::-webkit-scrollbar-track {
    background: ${props => props.theme.border};
    border-radius: 2px;
  }

  &::-webkit-scrollbar-thumb {
    background: ${props => props.theme.primary};
    border-radius: 2px;
  }
`;

export const CategoryChip = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  border: 2px solid ${props => props.$selected ? props.theme.primary : props.theme.border};
  border-radius: 20px;
  background: ${props => props.$selected ? `${props.theme.primary}20` : props.theme.surface};
  color: ${props => props.$selected ? props.theme.primary : props.theme.text};
  font-size: 13px;
  font-weight: ${props => props.$selected ? '600' : '500'};
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;

  &:hover {
    border-color: ${props => props.theme.primary};
    background: ${props => props.theme.primary}15;
  }
`;

export const MobileFilters = styled.div`
  display: flex;
  gap: 8px;
`;

export const FilterButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  border: 2px solid ${props => props.theme.border};
  border-radius: 10px;
  background: ${props => props.theme.surface};
  color: ${props => props.theme.text};
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${props => props.theme.primary};
    color: ${props => props.theme.primary};
  }
`;

export const MobileItemsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const MobileItem = styled.div`
  background: ${props => props.theme.surface};
  border: 1px solid ${props => props.theme.border};
  border-radius: 12px;
  padding: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;

  ${props => props.$purchased && `
    opacity: 0.6;
  `}
`;

export const MobileItemLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
`;

export const MobileCheckbox = styled.button`
  width: 24px;
  height: 24px;
  border-radius: 6px;
  border: 2px solid ${props => props.$checked ? props.theme.success : props.theme.border};
  background: ${props => props.$checked ? props.theme.success : 'transparent'};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
`;

export const MobileItemImage = styled.img`
  width: 48px;
  height: 48px;
  border-radius: 8px;
  object-fit: cover;
  flex-shrink: 0;
`;

export const MobileItemInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

export const MobileItemName = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: ${props => props.theme.text};
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  ${props => props.$purchased && `
    text-decoration: line-through;
    color: ${props.theme.textSoft};
  `}
`;

export const MobileItemMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
`;

export const MobileStore = styled.span`
  color: ${props => props.theme.textSoft};
`;

export const MobilePrice = styled.span`
  font-weight: 600;
  color: ${props => props.theme.primary};
`;

export const MobileItemActions = styled.div`
  display: flex;
  gap: 8px;
`;

export const MobileActionButton = styled.button`
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid ${props => props.theme.border};
  background: ${props => props.theme.background};
  color: ${props => props.theme.text};
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.theme.hover};
  }
`;

export const FloatingButton = styled.button`
  position: fixed;
  bottom: 100px;
  right: 20px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: none;
  background: linear-gradient(135deg, ${props => props.theme.primary} 0%, ${props => props.theme.secondary} 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 20px ${props => props.theme.primary}50;
  transition: all 0.3s ease;
  z-index: 100;

  &:hover {
    transform: scale(1.1);
    box-shadow: 0 6px 24px ${props => props.theme.primary}60;
  }

  &:active {
    transform: scale(0.95);
  }
`;
