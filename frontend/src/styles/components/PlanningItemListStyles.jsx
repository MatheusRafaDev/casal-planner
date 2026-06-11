import styled from 'styled-components';

export const Container = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

export const FilterTabs = styled.div`
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

export const FilterTab = styled.button`
  padding: 10px 20px;
  border: 2px solid ${props => props.$active ? props.theme.primary : props.theme.border};
  border-radius: 10px;
  background: ${props => props.$active ? `${props.theme.primary}20` : 'transparent'};
  color: ${props => props.$active ? props.theme.primary : props.theme.text};
  font-size: 14px;
  font-weight: ${props => props.$active ? '600' : '500'};
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;

  &:hover {
    border-color: ${props => props.theme.primary};
    background: ${props => props.theme.primary}15;
  }

  &:active {
    transform: scale(0.98);
  }
`;

export const ItemsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const ItemCard = styled.div`
  background: ${props => props.theme.surface};
  border: 1px solid ${props => props.theme.border};
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s ease;

  &:hover {
    border-color: ${props => props.theme.borderLight};
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }

  ${props => props.$purchased && `
    opacity: 0.6;
    background: ${props.theme.background};
  `}
`;

export const ItemMain = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  gap: 16px;
`;

export const ItemLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
`;

export const Checkbox = styled.button`
  width: 24px;
  height: 24px;
  border-radius: 6px;
  border: 2px solid ${props => props.$checked ? props.theme.success : props.theme.border};
  background: ${props => props.$checked ? props.theme.success : 'transparent'};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  color: white;
  flex-shrink: 0;

  &:hover {
    border-color: ${props => props.theme.success};
  }
`;

export const ItemImage = styled.img`
  width: 56px;
  height: 56px;
  border-radius: 12px;
  object-fit: cover;
  flex-shrink: 0;
`;

export const ItemImagePlaceholder = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 12px;
  background: ${props => props.theme.border};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.theme.textSoft};
  flex-shrink: 0;
`;

export const ItemInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

export const ItemName = styled.div`
  font-size: 15px;
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

export const ItemMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
`;

export const StoreInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  color: ${props => props.theme.textSoft};
`;

export const Brand = styled.span`
  color: ${props => props.theme.textSoft};
`;

export const ItemRight = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

export const PriorityBadge = styled.span`
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  background: ${props => props.$bgColor};
  color: ${props => props.$color};
  white-space: nowrap;
`;

export const ItemValue = styled.span`
  font-size: 16px;
  font-weight: 700;
  color: ${props => props.theme.text};
`;

export const ActionButton = styled.button`
  width: 36px;
  height: 36px;
  border-radius: 8px;
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

export const ItemExpanded = styled.div`
  padding: 16px;
  border-top: 1px solid ${props => props.theme.border};
  background: ${props => props.theme.background};
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const ExpandedRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const ExpandedLabel = styled.span`
  font-size: 13px;
  color: ${props => props.theme.textSoft};
`;

export const ExpandedValue = styled.span`
  font-size: 14px;
  font-weight: 500;
  color: ${props => props.theme.text};
`;

export const QuantityControl = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const QuantityButton = styled.button`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid ${props => props.theme.border};
  background: ${props => props.theme.surface};
  color: ${props => props.theme.text};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.theme.hover};
    border-color: ${props => props.theme.primary};
  }
`;

export const QuantityValue = styled.span`
  min-width: 32px;
  text-align: center;
  font-size: 14px;
  font-weight: 600;
  color: ${props => props.theme.text};
`;

export const ExpandedActions = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 8px;
`;

export const EditButton = styled.button`
  flex: 1;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid ${props => props.theme.primary};
  background: ${props => props.theme.primary}15;
  color: ${props => props.theme.primary};
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.theme.primary}25;
  }
`;

export const DeleteButton = styled.button`
  flex: 1;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid ${props => props.theme.error};
  background: ${props => props.theme.error}15;
  color: ${props => props.theme.error};
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.theme.error}25;
  }
`;

export const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
`;

export const EmptyIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
`;

export const EmptyText = styled.span`
  font-size: 16px;
  color: ${props => props.theme.textSoft};
`;
