// CategoriaCardStyles.jsx - VERSÃO COMPLETA COM TUDO INTEGRADO

import styled, { keyframes } from 'styled-components';
import { GripVertical, Check } from 'lucide-react';

const pulseAnimation = keyframes`
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.05);
  }
`;

/* ================= CARD PRINCIPAL ================= */

export const CardContainer = styled.div`
  background: ${props => props.theme.background || '#ffffff'};
  border: 1px solid ${props => props.theme.border || '#e0e0e0'};
  border-radius: 1rem;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  transition: all 0.2s ease;
  margin-bottom: 1rem;
  
  ${props => props.$isDragOver && `
    border: 2px dashed ${props.theme.primary || '#4caf50'};
    background: ${props.theme.primary}08;
    transform: scale(0.99);
  `}

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    border-color: ${props => props.theme.primary}40;
  }
`;

/* ================= HEADER ================= */

export const CardHeader = styled.div`
  padding: 0.875rem 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid ${props => props.theme.border || '#e0e0e0'};
  border-left: 4px solid ${props => props.color || props.theme.primary};
  background: ${props => props.theme.surface || '#f8f9fa'};
  cursor: grab;
  
  &:active {
    cursor: grabbing;
  }
`;

export const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
  min-width: 0;
`;

export const DragHandle = styled(GripVertical)`
  width: 1rem;
  height: 1rem;
  color: ${props => props.theme.textSoft || '#666'};
  cursor: grab;
  flex-shrink: 0;
  opacity: 0.5;
  transition: opacity 0.2s;

  &:hover {
    opacity: 1;
  }
`;

export const Icon = styled.span`
  font-size: 1.25rem;
  flex-shrink: 0;
`;

export const TitleSection = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
  flex: 1;
  gap: 0.25rem;
`;

export const Title = styled.h3`
  font-weight: 600;
  font-size: 0.9375rem;
  color: ${props => props.theme.text || '#333'};
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
  cursor: help;
  
  &:hover {
    color: ${props => props.theme.primary || '#4caf50'};
  }
  
  @media (max-width: 640px) {
    font-size: 0.875rem;
    max-width: 200px;
  }
  
  @media (max-width: 480px) {
    max-width: 150px;
  }
`;

export const Subtitle = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  flex-wrap: wrap;
`;

export const ItemsCount = styled.span`
  background: ${props => props.theme.border || '#e0e0e0'};
  padding: 0.125rem 0.5rem;
  border-radius: 0.5rem;
  font-weight: 500;
  color: ${props => props.theme.text || '#333'};
  font-size: 0.688rem;
  white-space: nowrap;
  flex-shrink: 0;
`;

export const TotalValue = styled.span`
  font-weight: 600;
  color: ${props => props.theme.primary || '#4caf50'};
  font-size: 0.75rem;
  white-space: nowrap;
  flex-shrink: 0;
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
  border-radius: 0.5rem;
  background: transparent;
  border: none;
  color: ${props => props.danger ? (props.theme.error || '#f44336') : (props.theme.textSoft || '#666')};
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;

  &:hover {
    background: ${props => props.theme.border || '#e0e0e0'};
    color: ${props => props.danger ? (props.theme.error || '#f44336') : (props.theme.text || '#333')};
    transform: scale(1.05);
  }
  
  &:active {
    transform: scale(0.95);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
    transform: none;
  }
`;

export const ExpandButton = styled(IconButton)``;

/* ================= PROGRESSO ================= */

export const CategoryProgress = styled.div`
  padding: 0.75rem 1rem 0.5rem;
  background: ${props => props.theme.background || '#ffffff'};
`;

export const ProgressBar = styled.div`
  width: 100%;
  height: 0.25rem;
  background: ${props => props.theme.border || '#e0e0e0'};
  border-radius: 0.125rem;
  overflow: hidden;
`;

export const ProgressFill = styled.div`
  height: 100%;
  background: ${props => props.color || props.theme.primary || '#4caf50'};
  border-radius: 0.125rem;
  transition: width 0.3s ease;
`;

/* ================= SORT BAR ================= */

export const SortBar = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.625rem 0.875rem;
  background: ${props => props.theme.surface || '#f8f9fa'};
  border-bottom: 1px solid ${props => props.theme.border || '#e0e0e0'};
  flex-wrap: wrap;
  
  @media (max-width: 640px) {
    gap: 0.5rem;
    padding: 0.5rem 0.75rem;
  }
`;

export const SortLabel = styled.span`
  font-size: 0.75rem;
  font-weight: 500;
  color: ${props => props.theme.textSoft || '#666'};
  
  @media (max-width: 640px) {
    font-size: 0.688rem;
  }
`;

export const SortButtonsGroup = styled.div`
  display: flex;
  gap: 0.5rem;
  
  @media (max-width: 640px) {
    gap: 0.375rem;
  }
`;

export const SortButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.75rem;
  background: ${props => {
    if (props.disabled) return 'transparent';
    return props.$active 
      ? (props.theme.primary + '10' || '#e8f5e9')
      : 'transparent';
  }};
  border: 1px solid ${props => {
    if (props.disabled) return props.theme.border || '#e0e0e0';
    return props.$active 
      ? (props.theme.primary || '#4caf50')
      : (props.theme.border || '#e0e0e0');
  }};
  border-radius: 0.5rem;
  font-size: 0.75rem;
  font-weight: ${props => props.$active ? 600 : 500};
  color: ${props => {
    if (props.disabled) return props.theme.textSoft || '#999';
    return props.$active 
      ? (props.theme.primary || '#4caf50')
      : (props.theme.textSoft || '#666');
  }};
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  opacity: ${props => props.disabled ? 0.5 : 1};
  transition: all 0.2s ease;
  white-space: nowrap;
  
  &:hover {
    background: ${props => {
      if (props.disabled) return 'transparent';
      if (props.$active) return props.theme.primary + '10' || '#e8f5e9';
      return props.theme.hover || '#f5f5f5';
    }};
    border-color: ${props => {
      if (props.disabled) return props.theme.border || '#e0e0e0';
      if (props.$active) return props.theme.primary || '#4caf50';
      return props.theme.primary || '#4caf50';
    }};
    color: ${props => {
      if (props.disabled) return props.theme.textSoft || '#999';
      if (props.$active) return props.theme.primary || '#4caf50';
      return props.theme.primary || '#4caf50';
    }};
    transform: ${props => props.disabled ? 'none' : 'translateY(-1px)'};
  }
  
  &:active {
    transform: ${props => props.disabled ? 'none' : 'translateY(0)'};
  }
  
  @media (max-width: 640px) {
    padding: 0.25rem 0.5rem;
    font-size: 0.688rem;
    gap: 0.25rem;
  }
`;

export const SortIcon = styled.span`
  display: inline-flex;
  align-items: center;
  margin-left: 2px;
  
  svg {
    width: 14px;
    height: 14px;
  }
  
  @media (max-width: 640px) {
    svg {
      width: 12px;
      height: 12px;
    }
  }
`;

/* ================= CONTEÚDO ================= */

export const CardContent = styled.div`
  flex: 1;
  max-height: 300px;
  overflow-y: auto;
  background: ${props => props.theme.background || '#ffffff'};
  
  &::-webkit-scrollbar {
    width: 0.375rem;
  }
  
  &::-webkit-scrollbar-track {
    background: ${props => props.theme.border || '#e0e0e0'};
    border-radius: 0.25rem;
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${props => props.theme.textSoft || '#666'};
    border-radius: 0.25rem;
    
    &:hover {
      background: ${props => props.theme.text || '#333'};
    }
  }
`;

/* ================= LISTA DE ITENS ================= */

export const ItemsList = styled.div`
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

export const ItemRow = styled.div`
  background: ${props => props.$purchased 
    ? (props.theme?.success + '0a' || 'rgba(76, 175, 80, 0.04)')
    : (props.theme?.surface || '#fafafa')
  };
  border: 1px solid ${props => props.$purchased
    ? (props.theme?.success + '30' || 'rgba(76, 175, 80, 0.2)')
    : (props.theme?.border || '#e0e0e0')
  };
  border-radius: 0.75rem;
  padding: 0.75rem;
  transition: all 0.2s ease;
  opacity: ${props => props.$purchased ? 0.85 : 1};
  transform: ${props => props.$isHovered ? 'translateX(0.25rem)' : 'none'};
  
  &:hover {
    background: ${props => props.$purchased
      ? (props.theme?.success + '14' || 'rgba(76, 175, 80, 0.08)')
      : (props.theme?.hover || '#f5f5f5')
    };
    border-color: ${props => props.theme?.primary}60;
    box-shadow: 0 0.125rem 0.5rem rgba(0, 0, 0, 0.08);
  }
`;

export const ItemMainRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
  flex-wrap: wrap;
  min-width: 0;
`;

export const ItemDetailsRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.75rem;
  padding-left: 2rem;
  
  @media (max-width: 640px) {
    padding-left: 1.5rem;
    flex-direction: column;
    align-items: stretch;
  }
`;

export const ItemDetailsLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  flex: 1;
  min-width: 0;
`;

export const DragHandleItem = styled.span`
  cursor: grab;
  color: ${props => props.theme?.textSoft || '#666'};
  font-size: 1rem;
  user-select: none;
  opacity: 0.4;
  transition: opacity 0.2s;
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  
  &:hover {
    opacity: 1;
  }
  
  &:active {
    cursor: grabbing;
  }
`;

export const ItemNameSection = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  min-width: 0;
  max-width: 300px;
  
  @media (max-width: 768px) {
    max-width: 250px;
  }
  
  @media (max-width: 640px) {
    max-width: 200px;
  }
  
  @media (max-width: 480px) {
    max-width: 150px;
  }
`;

export const ItemName = styled.p`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${props => props.$purchased 
    ? (props.theme?.textSoft || '#888')
    : (props.theme?.text || '#333')
  };
  text-decoration: ${props => props.$purchased ? 'line-through' : 'none'};
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
  min-width: 0;
  cursor: help;
  
  &:hover {
    color: ${props => props.theme.primary || '#4caf50'};
  }
  
  @media (max-width: 768px) {
    font-size: 0.8125rem;
    max-width: 180px;
  }
  
  @media (max-width: 640px) {
    font-size: 0.75rem;
    max-width: 150px;
  }
  
  @media (max-width: 480px) {
    max-width: 100px;
  }
`;

export const ItemBrand = styled.span`
  font-size: 0.688rem;
  color: ${props => props.theme.textSoft || '#666'};
  background: ${props => props.theme.border || '#e0e0e0'};
  padding: 0.125rem 0.5rem;
  border-radius: 0.375rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 120px;
  flex-shrink: 1;
  cursor: help;
  
  &:hover {
    background: ${props => props.theme.primary}20;
    color: ${props => props.theme.primary || '#4caf50'};
  }
  
  @media (max-width: 768px) {
    max-width: 100px;
    font-size: 0.625rem;
  }
  
  @media (max-width: 640px) {
    max-width: 80px;
  }
  
  @media (max-width: 480px) {
    max-width: 70px;
  }
`;

/* ================= CHECKBOX ================= */

export const CheckboxButton = styled.button`
  width: 1.25rem;
  height: 1.25rem;
  border-radius: 0.375rem;
  border: 2px solid ${props => props.$checked ? (props.theme.primary || '#4caf50') : (props.theme.border || '#e0e0e0')};
  background: ${props => props.$checked ? (props.theme.primary || '#4caf50') : 'transparent'};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: ${props => props.theme.primary || '#4caf50'};
    transform: scale(1.05);
  }
  
  &:active {
    transform: scale(0.95);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
  }
`;

export const CheckIcon = styled(Check)`
  width: 0.75rem;
  height: 0.75rem;
  color: white;
`;

/* ================= BADGES ================= */

export const ItemQuantityBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  background: ${props => props.theme.background === '#1a1a1a' 
    ? 'rgba(255, 255, 255, 0.1)' 
    : 'rgba(0, 0, 0, 0.05)'
  };
  border-radius: 0.375rem;
  font-size: 0.688rem;
  font-weight: 500;
  color: ${props => props.theme.primary || '#4caf50'};
  white-space: nowrap;
  flex-shrink: 0;
  
  svg {
    width: 0.75rem;
    height: 0.75rem;
  }
`;

export const ItemPriceBadge = styled.div`
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.5rem;
  background: ${props => props.theme.background === '#1a1a1a'
    ? 'rgba(33, 150, 243, 0.15)'
    : 'rgba(33, 150, 243, 0.08)'
  };
  border-radius: 0.375rem;
  font-size: 0.688rem;
  font-weight: 500;
  color: ${props => props.theme.info || '#2196f3'};
  white-space: nowrap;
  flex-shrink: 0;
`;

export const StoreBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.25rem 0.5rem;
  background: ${props => props.theme.background === '#1a1a1a'
    ? 'rgba(255, 255, 255, 0.06)'
    : 'rgba(0, 0, 0, 0.03)'
  };
  border-radius: 0.375rem;
  font-size: 0.688rem;
  color: ${props => props.theme.text || '#333'};
  border: 1px solid ${props => props.theme.background === '#1a1a1a'
    ? 'rgba(255, 255, 255, 0.08)'
    : 'rgba(0, 0, 0, 0.04)'
  };
  max-width: 200px;
  min-width: 0;
  
  @media (max-width: 768px) {
    max-width: 160px;
  }
  
  @media (max-width: 640px) {
    max-width: 140px;
  }
`;

export const StoreLogoImage = styled.img`
  width: ${props => props.size === 'small' ? '0.875rem' : '1rem'};
  height: ${props => props.size === 'small' ? '0.875rem' : '1rem'};
  object-fit: contain;
  border-radius: 0.125rem;
  flex-shrink: 0;
`;

export const StoreIconFallback = styled.span`
  font-size: ${props => props.size === 'small' ? '0.75rem' : '0.875rem'};
  opacity: 0.7;
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  color: ${props => props.theme.textSoft || '#666'};
`;

export const StoreName = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: ${props => props.theme.text || '#333'};
  flex: 1;
  min-width: 0;
  cursor: help;
  
  &:hover {
    color: ${props => props.theme.primary || '#4caf50'};
  }
  
  @media (max-width: 768px) {
    font-size: 0.688rem;
  }
  
  @media (max-width: 640px) {
    font-size: 0.625rem;
  }
`;

export const PaymentBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
  font-size: 0.688rem;
  font-weight: 500;
  white-space: nowrap;
  flex-shrink: 0;
  color: ${props => props.$type === 'vr' 
    ? (props.theme.vrva || '#ff9800')
    : (props.theme.normal || '#2196f3')
  };
  background: ${props => props.$type === 'vr' 
    ? (props.theme.vrvaLight || 'rgba(255, 152, 0, 0.1)')
    : (props.theme.normalLight || 'rgba(33, 150, 243, 0.08)')
  };
  
  span {
    @media (max-width: 480px) {
      display: none;
    }
  }
`;

/* ================= AÇÕES ================= */

export const ItemActions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  flex-shrink: 0;
  
  @media (max-width: 640px) {
    justify-content: flex-end;
  }
`;

export const ItemActionButton = styled.button`
  padding: 0.375rem;
  background: transparent;
  border: none;
  border-radius: 0.375rem;
  color: ${props => {
    if (props.variant === 'delete') return props.theme?.error || '#f44336';
    if (props.variant === 'link') return props.theme?.primary || '#2196f3';
    if (props.variant === 'edit') return props.theme?.warning || '#ff9800';
    return props.theme?.textSoft || '#666';
  }};
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  
  &:hover {
    background: ${props => {
      if (props.variant === 'delete') return props.theme?.error || '#f44336';
      if (props.variant === 'link') return props.theme?.primary || '#2196f3';
      if (props.variant === 'edit') return props.theme?.warning || '#ff9800';
      return props.theme?.primary || '#666';
    }};
    color: white;
    transform: scale(1.1);
  }
  
  &:active {
    transform: scale(0.95);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
  }
`;

export const ItemTotalCompact = styled.div`
  display: flex;
  align-items: center;
  flex-shrink: 0;
  margin-left: auto;
`;

export const ItemTotalValueCompact = styled.div`
  font-size: 0.75rem;
  font-weight: 700;
  color: ${props => props.theme.primary || '#4caf50'};
  background: ${props => props.theme.background === '#1a1a1a'
    ? 'rgba(76, 175, 80, 0.15)'
    : 'rgba(76, 175, 80, 0.08)'
  };
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  white-space: nowrap;
  flex-shrink: 0;
  
  @media (max-width: 640px) {
    padding: 0.125rem 0.5rem;
    font-size: 0.688rem;
  }
`;

/* ================= FOOTER ================= */

export const CategoryFooter = styled.div`
  padding: 0.75rem 1rem;
  background: ${props => props.theme.surface || '#f8f9fa'};
  border-top: 1px solid ${props => props.theme.border || '#e0e0e0'};
  margin-top: auto;
`;

export const CategoryStats = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  font-size: 0.75rem;
  flex-wrap: wrap;
  
  @media (max-width: 640px) {
    font-size: 0.688rem;
    gap: 0.5rem;
  }
`;

export const StatItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: ${props => props.theme.textSoft || '#666'};
  white-space: nowrap;
  flex-shrink: 0;

  strong {
    color: ${props => props.theme.text || '#333'};
    font-weight: 600;
  }
  
  @media (max-width: 480px) {
    font-size: 0.625rem;
  }
`;

/* ================= EMPTY STATE ================= */

export const EmptyState = styled.div`
  padding: 2rem 1rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  background: ${props => props.theme.background || '#ffffff'};
`;

export const EmptyIcon = styled.div`
  font-size: 3rem;
  opacity: 0.5;
`;

export const EmptyText = styled.p`
  font-size: 0.875rem;
  color: ${props => props.theme.textSoft || '#666'};
  margin: 0;
  text-align: center;
`;

export const AddButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: transparent;
  border: 1px dashed ${props => props.theme.primary || '#4caf50'};
  color: ${props => props.theme.primary || '#4caf50'};
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  border-radius: 0.5rem;
  transition: all 0.2s;
  white-space: nowrap;

  &:hover {
    background: ${props => props.theme.primary}10;
    transform: translateY(-0.0625rem);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
  }
  
  @media (max-width: 480px) {
    font-size: 0.75rem;
    padding: 0.375rem 0.75rem;
  }
`;

export const NewBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 0.125rem 0.5rem;
  background: linear-gradient(135deg, #ff6b6b, #ff4757);
  border-radius: 0.5rem;
  font-size: 0.625rem;
  font-weight: 600;
  color: white;
  white-space: nowrap;
  flex-shrink: 0;
  animation: ${pulseAnimation} 1.5s ease-in-out infinite;
  
  @media (max-width: 640px) {
    font-size: 0.563rem;
    padding: 0.125rem 0.375rem;
  }
`;