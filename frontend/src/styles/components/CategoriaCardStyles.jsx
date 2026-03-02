import styled from 'styled-components';
import { GripVertical, Check } from 'lucide-react';

/* ================= CARD ================= */

export const CardContainer = styled.div`
  background: ${props => props.theme.card};
  border: 1px solid ${props => props.theme.border};
  border-radius: 0.75rem;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  height: 100%;

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
  flex-shrink: 0;
`;

export const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
  min-width: 0;
`;

export const DragHandle = styled(GripVertical)`
  width: 1rem;
  height: 1rem;
  color: ${props => props.theme.textSoft};
  cursor: grab;
  flex-shrink: 0;
`;

export const Icon = styled.span`
  font-size: 1.125rem;
  flex-shrink: 0;
`;

export const TitleSection = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
  flex: 1;
`;

export const Title = styled.h3`
  font-weight: 600;
  font-size: 0.875rem;
  color: ${props => props.theme.text};
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const Subtitle = styled.p`
  font-size: 0.75rem;
  color: ${props => props.theme.textSoft};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

export const ItemsCount = styled.span`
  background: ${props => props.theme.border};
  padding: 0.125rem 0.25rem;
  border-radius: 0.25rem;
  font-weight: 600;
`;

export const TotalValue = styled.span`
  font-weight: 600;
  color: ${props => props.theme.primary};
`;

export const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  flex-shrink: 0;
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
  color: ${props => props.danger ? props.theme.error : props.theme.textSoft};
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;

  &:hover {
    background: ${props => props.theme.border};
    color: ${props => props.danger ? props.theme.error : props.theme.text};
  }
`;

export const ExpandButton = styled(IconButton)``;

/* ================= PROGRESS BAR ================= */

export const CategoryProgress = styled.div`
  padding: 0 1rem;
  margin-bottom: 0.5rem;
  flex-shrink: 0;
`;

export const ProgressBar = styled.div`
  width: 100%;
  height: 4px;
  background: ${props => props.theme.border};
  border-radius: 2px;
  overflow: hidden;
`;

export const ProgressFill = styled.div`
  height: 100%;
  background: ${props => props.color || props.theme.primary};
  border-radius: 2px;
  transition: width 0.3s ease;
`;

/* ================= CARD CONTENT ================= */

export const CardContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 150px;
  max-height: 300px;
  overflow-y: auto;
`;

/* ================= ITEMS ================= */

export const ItemsList = styled.div`
  ${props => props.$hasItems && `
    border-top: 1px solid ${props.theme.border};
    border-bottom: 1px solid ${props.theme.border};
  `}
  width: 100%;
`;

export const ItemRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.625rem 1rem;
  transition: all 0.2s;
  background: ${props => props.$purchased ? `${props.theme.primary}08` : 'transparent'};
  opacity: ${props => props.$purchased ? 0.8 : 1};
  border-bottom: 1px solid ${props => props.theme.border};

  &:last-child {
    border-bottom: none;
  }

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
  flex-shrink: 0;

  &:hover {
    opacity: 1;
  }

  ${ItemRow}:hover & {
    opacity: 1;
  }
`;

/* ================= CHECKBOX ================= */

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

/* ================= CONTENT ================= */

export const ItemContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
  min-width: 0;
`;

export const ItemInfo = styled.div`
  min-width: 0;
  flex: 1;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

export const ItemName = styled.p`
  font-size: 0.875rem;
  color: ${props => props.theme.text};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-decoration: ${props => props.$purchased ? 'line-through' : 'none'};
  margin: 0;
`;

export const ItemBrand = styled.span`
  font-size: 0.688rem;
  color: ${props => props.theme.textSoft};
  background: ${props => props.theme.border};
  padding: 0.125rem 0.25rem;
  border-radius: 0.25rem;
  white-space: nowrap;
`;

export const ItemDetails = styled.p`
  font-size: 0.75rem;
  color: ${props => props.theme.textSoft};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin: 0;
`;

export const ItemMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

export const ItemMetaInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  color: ${props => props.theme.textSoft};
  background: ${props => props.theme.border};
  padding: 0.125rem 0.25rem;
  border-radius: 0.25rem;
`;

export const ItemQuantity = styled.span`
  font-weight: 600;
  color: ${props => props.theme.primary};
`;

export const ItemPrice = styled.span`
  &::before {
    content: '•';
    margin-right: 0.25rem;
  }
`;

/* ================= PAYMENT BADGE ================= */

export const PaymentBadge = styled.span`
  color: ${props => props.$type === 'vr' ? props.theme.vrva : props.theme.normal};
  font-weight: 500;
`;

/* ================= ACTIONS ================= */

export const ItemActions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  opacity: 0;
  transition: opacity 0.2s;
  flex-shrink: 0;
`;

export const ActionGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  background: ${props => props.theme.border};
  padding: 0.125rem;
  border-radius: 0.375rem;
`;

export const ItemActionButton = styled.button`
  padding: 0.35rem;
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

/* ================= TOTAL ================= */

export const ItemTotal = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  min-width: 70px;
`;

export const ItemTotalValue = styled.p`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${props => props.theme.primary};
  margin: 0;
  white-space: nowrap;
`;

/* ================= FOOTER ================= */

export const CategoryFooter = styled.div`
  padding: 0.5rem 1rem;
  background: ${props => props.theme.border};
  border-top: 1px solid ${props => props.theme.border};
  flex-shrink: 0;
`;

export const CategoryStats = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.75rem;
`;

export const StatItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: ${props => props.theme.textSoft};

  strong {
    color: ${props => props.theme.text};
    font-weight: 600;
  }
`;

/* ================= EMPTY ================= */

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