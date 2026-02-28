import styled from 'styled-components';
import { GripVertical, Check } from 'lucide-react';

export const CardContainer = styled.div`
  background: ${props => props.theme.card};
  border: 1px solid ${props => props.theme.border};
  border-radius: 0.75rem;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

export const CardHeader = styled.div`
  padding: 0.75rem 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid ${props => props.theme.border};
  cursor: grab;
  border-left: 4px solid ${props => props.color || props.theme.primary};
`;

export const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

export const DragHandle = styled(GripVertical)`
  width: 1rem;
  height: 1rem;
  color: ${props => props.theme.textSoft};
  cursor: grab;
`;

export const Icon = styled.span`
  font-size: 1.125rem;
`;

export const TitleSection = styled.div`
  display: flex;
  flex-direction: column;
`;

export const Title = styled.h3`
  font-weight: 600;
  font-size: 0.875rem;
  color: ${props => props.theme.text};
`;

export const Subtitle = styled.p`
  font-size: 0.75rem;
  color: ${props => props.theme.textSoft};
`;

export const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

export const IconButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 0.375rem;
  background: transparent;
  border: none;
  color: ${props => props.theme.textSoft};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.theme.border};
    color: ${props => props.danger ? props.theme.error : props.theme.text};
  }
`;

export const ItemsList = styled.div`
  ${props => props.$hasItems && `
    border-top: 1px solid ${props.theme.border};
  `}
`;

export const ItemRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.625rem 1rem;
  transition: all 0.2s;
  background: ${props => props.$purchased ? `${props.theme.primary}08` : 'transparent'};
  opacity: ${props => props.$purchased ? 0.8 : 1};

  &:hover {
    background: ${props => props.theme.border};
    
    .item-actions {
      opacity: 1;
    }
  }
`;

export const ItemLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
  min-width: 0;
`;

export const ItemDragHandle = styled(GripVertical)`
  width: 1rem;
  height: 1rem;
  color: ${props => props.theme.textSoft};
  cursor: grab;
  opacity: 0.3;
  transition: opacity 0.2s;

  &:hover {
    opacity: 1;
  }

  ${ItemRow}:hover & {
    opacity: 1;
  }
`;

export const CheckboxButton = styled.button`
  width: 1.25rem;
  height: 1.25rem;
  border-radius: 0.375rem;
  border: 2px solid ${props => props.$checked ? props.theme.primary : props.theme.border};
  background: ${props => props.$checked ? props.theme.primary : 'transparent'};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: ${props => props.theme.primary};
  }
`;

export const CheckIcon = styled(Check)`
  width: 0.75rem;
  height: 0.75rem;
  color: white;
`;

export const ItemInfo = styled.div`
  min-width: 0;
  flex: 1;
`;

export const ItemName = styled.p`
  font-size: 0.875rem;
  color: ${props => props.theme.text};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-decoration: ${props => props.$purchased ? 'line-through' : 'none'};
`;

export const ItemDetails = styled.p`
  font-size: 0.75rem;
  color: ${props => props.theme.textSoft};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const PaymentBadge = styled.span`
  color: ${props => props.$type === 'vr' ? props.theme.vrva : props.theme.normal};
  font-weight: 500;
`;

export const ItemActions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  opacity: 0;
  transition: opacity 0.2s;
`;

export const ItemActionButton = styled.button`
  padding: 0.25rem;
  background: transparent;
  border: none;
  color: ${props => props.theme.textSoft};
  cursor: pointer;
  border-radius: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: ${props => props.danger ? props.theme.error : props.theme.text};
    background: ${props => props.theme.border};
  }
`;

export const ItemTotal = styled.p`
  font-size: 0.875rem;
  font-weight: 500;
  color: ${props => props.theme.text};
  margin-left: 0.75rem;
`;

export const EmptyState = styled.div`
  padding: 1.5rem 1rem;
  text-align: center;
`;

export const EmptyText = styled.p`
  font-size: 0.875rem;
  color: ${props => props.theme.textSoft};
  margin-bottom: 0.5rem;
`;

export const AddButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.375rem 0.75rem;
  background: transparent;
  border: none;
  color: ${props => props.theme.primary};
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  border-radius: 0.375rem;

  &:hover {
    background: ${props => props.theme.primary}10;
  }
`;