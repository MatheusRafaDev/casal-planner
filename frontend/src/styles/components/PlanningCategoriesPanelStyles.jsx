import styled from 'styled-components';

export const Panel = styled.aside`
  width: 280px;
  background: ${props => props.theme.surface};
  border: 1px solid ${props => props.theme.border};
  border-radius: 16px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: fit-content;
  position: sticky;
  top: 100px;

  @media (max-width: 1200px) {
    width: 260px;
  }

  @media (max-width: 768px) {
    display: none;
  }
`;

export const PanelHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 16px;
  border-bottom: 1px solid ${props => props.theme.border};
`;

export const PanelTitle = styled.h3`
  font-size: 16px;
  font-weight: 700;
  color: ${props => props.theme.text};
  margin: 0;
`;

export const AddCategoryButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border: 1px solid ${props => props.theme.primary};
  border-radius: 8px;
  background: ${props => props.theme.primary}15;
  color: ${props => props.theme.primary};
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.theme.primary}25;
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }
`;

export const CategoriesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const CategoryItem = styled.button`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border: 2px solid ${props => props.$selected ? props.theme.primary : props.theme.border};
  border-radius: 12px;
  background: ${props => props.$selected ? `${props.theme.primary}15` : 'transparent'};
  cursor: pointer;
  transition: all 0.2s ease;
  width: 100%;
  text-align: left;
  position: relative;

  &:hover {
    border-color: ${props => props.$selected ? props.theme.primary : props.theme.borderLight};
    background: ${props => props.$selected ? `${props.theme.primary}20` : props.theme.hover};
  }

  &:active {
    transform: scale(0.98);
  }
`;

export const CategoryIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: ${props => props.theme.primary}15;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.theme.primary};
  flex-shrink: 0;
`;

export const DefaultIcon = styled.div`
  width: 24px;
  height: 24px;
  position: relative;
`;

export const IconDot = styled.div`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${props => props.theme.primary};
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`;

export const CategoryInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const CategoryName = styled.span`
  font-size: 14px;
  font-weight: ${props => props.$selected ? '600' : '500'};
  color: ${props => props.$selected ? props.theme.primary : props.theme.text};
`;

export const CategoryStats = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
`;

export const ItemCount = styled.span`
  color: ${props => props.theme.textSoft};
`;

export const Separator = styled.span`
  color: ${props => props.theme.border};
`;

export const TotalValue = styled.span`
  color: ${props => props.theme.text};
  font-weight: 500;
`;

export const SelectedIndicator = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => props.theme.primary};
`;
