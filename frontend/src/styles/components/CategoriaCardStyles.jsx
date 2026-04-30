// CategoriaCardStyles.jsx — corrigido: sem fundos pretos, texto completo, mobile ok

import styled, { keyframes } from "styled-components";
import { GripVertical, Check } from "lucide-react";

const pulseAnimation = keyframes`
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.85; transform: scale(1.04); }
`;

const skeletonPulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
`;

// ================= CARD =================
export const CardContainer = styled.div`
  background: ${(props) => props.theme?.background || "#fff"};
  border: 1px solid ${(props) => props.theme?.border || "#e5e7eb"};
  border-radius: 1rem;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  margin-bottom: 0.75rem;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);

  ${(props) =>
    props.$isDragOver &&
    `
    border: 2px dashed ${props.theme?.primary || "#3b82f6"};
    background: ${props.theme?.primary ? `${props.theme.primary}08` : "#3b82f608"};
    transform: scale(0.99);
  `}

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    border-color: ${(props) => `${props.theme?.primary || "#3b82f6"}40`};
  }
`;

// ================= HEADER =================
export const CardHeader = styled.div`
  padding: 0.85rem 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-left: 4px solid ${(props) => props.color || props.theme?.primary || "#3b82f6"};
  background: ${(props) => props.theme?.surface || "#f8fafc"};
  border-bottom: 1px solid ${(props) => props.theme?.border || "#e5e7eb"};
`;

export const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  min-width: 0;
  flex: 1;
`;

export const DragHandle = styled(GripVertical)`
  width: 1rem;
  height: 1rem;
  opacity: 0.35;
  cursor: grab;
  flex-shrink: 0;
  transition: opacity 0.2s;

  &:hover {
    opacity: 1;
  }

  @media (max-width: 640px) {
    display: none;
  }
`;

export const Icon = styled.span`
  font-size: 1.2rem;
  flex-shrink: 0;
`;

export const TitleSection = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
  flex: 1;
`;

export const Title = styled.h3`
  font-size: 0.95rem;
  font-weight: 700;
  margin: 0;
  color: ${(props) => props.theme?.text || "#111"};
  /* FIX: sem truncate, texto completo */
  white-space: normal;
  word-break: break-word;
  overflow-wrap: break-word;
  cursor: help;
  transition: color 0.2s;
  line-height: 1.3;

  &:hover {
    color: ${(props) => props.theme?.primary || "#3b82f6"};
  }
`;

export const Subtitle = styled.div`
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
  margin-top: 0.25rem;
  align-items: center;
`;

// ================= BADGES HEADER =================
export const ItemsCount = styled.span`
  font-size: 0.7rem;
  padding: 0.15rem 0.5rem;
  border-radius: 0.5rem;
  background: ${(props) => props.theme?.border || "#e5e7eb"};
  color: ${(props) => props.theme?.text || "#333"};
  font-weight: 500;
  white-space: nowrap;
  flex-shrink: 0;
`;

export const TotalValue = styled.span`
  font-size: 0.75rem;
  font-weight: 700;
  color: ${(props) => props.theme?.primary || "#3b82f6"};
  white-space: nowrap;
  flex-shrink: 0;
`;

export const MetaBadge = styled.div`
  display: inline-flex;
  align-items: center;
  padding: 0.15rem 0.5rem;
  border-radius: 0.5rem;
  font-size: 0.7rem;
  font-weight: 600;
  white-space: nowrap;
  flex-shrink: 0;
  cursor: help;
  transition: all 0.2s;

  background: ${(props) =>
    props.$excedeu ? "#ef444415" : props.$proximo ? "#f59e0b15" : "#22c55e15"};
  color: ${(props) =>
    props.$excedeu ? "#ef4444" : props.$proximo ? "#f59e0b" : "#22c55e"};
  border: 1px solid currentColor;
`;

// ================= ACTIONS =================
export const HeaderActions = styled.div`
  display: flex;
  gap: 0.3rem;
  align-items: center;
  flex-shrink: 0;
  margin-left: 0.5rem;
`;

export const IconButton = styled.button`
  width: 2rem;
  height: 2rem;
  border-radius: 0.5rem;
  border: none;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${(props) => (props.danger ? "#ef4444" : props.theme?.textSoft || "#666")};
  transition: all 0.2s;
  flex-shrink: 0;

  &:hover {
    background: ${(props) => props.theme?.border || "rgba(0,0,0,0.05)"};
    color: ${(props) => (props.danger ? "#ef4444" : props.theme?.text || "#111")};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
  }
`;

export const ExpandButton = styled(IconButton)``;

// ================= PROGRESS =================
export const CategoryProgress = styled.div`
  padding: 0.5rem 0.75rem;
  background: ${(props) => props.theme?.background || "#fff"};
`;

export const ProgressBar = styled.div`
  width: 100%;
  height: 0.3rem;
  background: ${(props) => props.theme?.border || "#e5e7eb"};
  border-radius: 0.2rem;
  overflow: hidden;
`;

export const ProgressFill = styled.div`
  height: 100%;
  background: ${(props) => props.color || props.theme?.primary || "#3b82f6"};
  border-radius: 0.2rem;
  transition: width 0.3s ease;
`;

// ================= SORT =================
export const SortBar = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  align-items: center;
  padding: 0.5rem 0.75rem;
  background: ${(props) => props.theme?.surface || "#f8fafc"};
  border-bottom: 1px solid ${(props) => props.theme?.border || "#e5e7eb"};
`;

export const SortLabel = styled.span`
  font-size: 0.75rem;
  color: ${(props) => props.theme?.textSoft || "#666"};
  font-weight: 500;
`;

export const SortButtonsGroup = styled.div`
  display: flex;
  gap: 0.35rem;
  flex-wrap: wrap;
  flex: 1;
`;

export const SortButton = styled.button`
  font-size: 0.75rem;
  padding: 0.3rem 0.6rem;
  border-radius: 0.5rem;
  border: 1px solid
    ${(props) => (props.$active ? props.theme?.primary || "#3b82f6" : props.theme?.border || "#e5e7eb")};
  background: ${(props) =>
    props.$active ? `${props.theme?.primary || "#3b82f6"}15` : "transparent"};
  color: ${(props) =>
    props.$active ? props.theme?.primary || "#3b82f6" : props.theme?.textSoft || "#666"};
  font-weight: ${(props) => (props.$active ? 600 : 500)};
  cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};
  opacity: ${(props) => (props.disabled ? 0.5 : 1)};
  transition: all 0.2s;
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
`;

export const SortIcon = styled.span`
  display: inline-flex;
  align-items: center;
  margin-left: 0.1rem;

  svg {
    width: 12px;
    height: 12px;
  }
`;

// ================= CONTENT =================
export const CardContent = styled.div`
  flex: 1;
  background: ${(props) => props.theme?.background || "#fff"};
`;

// ================= ITEMS =================
export const ItemsList = styled.div`
  padding: 0.6rem 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

// ================= ITEM CARD =================
export const ItemRow = styled.div`
  padding: 0.65rem 0.75rem;
  border-radius: 0.75rem;
  border: 1px solid
    ${(props) => {
      if (props.$purchased) return `${props.theme?.success || "#22c55e"}30`;
      if (props.$priority === "urgente") return "#ef444430";
      if (props.$priority === "pode_esperar") return "#22c55e30";
      return props.theme?.border || "#e5e7eb";
    }};
  background: ${(props) => {
    if (props.$purchased) return `${props.theme?.success || "#22c55e"}08`;
    if (props.$priority === "urgente" && !props.$purchased) return "#ef444408";
    if (props.$priority === "pode_esperar" && !props.$purchased) return "#22c55e08";
    return props.theme?.surface || "#fafafa";
  }};
  transition: all 0.15s;
  opacity: ${(props) => (props.$isDragging ? 0.5 : props.$purchased ? 0.8 : 1)};

  &:hover {
    border-color: ${(props) => `${props.theme?.primary || "#3b82f6"}40`};
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  }
`;

// LINHA 1: checkbox · nome · preço · ações
export const ItemMainRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.4rem;
`;

// checkbox
export const CheckboxButton = styled.button`
  width: 1.2rem;
  height: 1.2rem;
  min-width: 1.2rem;
  border-radius: 0.3rem;
  border: 2px solid
    ${(props) =>
      props.$checked
        ? props.theme?.success || "#22c55e"
        : props.theme?.border || "#ccc"};
  background: ${(props) =>
    props.$checked ? props.theme?.success || "#22c55e" : "transparent"};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  cursor: pointer;
  transition: all 0.2s;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
  }
`;

export const CheckIcon = styled(Check)`
  width: 0.65rem;
  height: 0.65rem;
  color: #fff;
  stroke-width: 3.5;
`;

// FIX: nome sem truncate para mostrar texto completo
export const ItemName = styled.p`
  flex: 1;
  font-size: 0.875rem;
  font-weight: 700;
  margin: 0;
  min-width: 0;
  color: ${(props) =>
    props.$purchased ? props.theme?.textSoft || "#888" : props.theme?.text || "#111"};
  text-decoration: ${(props) => (props.$purchased ? "line-through" : "none")};
  /* Permite quebra de linha para texto completo */
  white-space: normal;
  word-break: break-word;
  overflow-wrap: break-word;
  line-height: 1.3;
`;

// preço total do item
export const ItemTotalCompact = styled.div`
  flex-shrink: 0;
`;

export const ItemTotalValueCompact = styled.span`
  font-weight: 700;
  font-size: 0.85rem;
  color: ${(props) => props.theme?.primary || "#3b82f6"};
  background: ${(props) => `${props.theme?.primary || "#3b82f6"}12`};
  padding: 0.2rem 0.5rem;
  border-radius: 0.5rem;
  white-space: nowrap;
`;

// ações
export const ItemActions = styled.div`
  display: flex;
  gap: 0.2rem;
  flex-shrink: 0;
`;

export const ItemActionButton = styled.button`
  width: 1.75rem;
  height: 1.75rem;
  border-radius: 0.4rem;
  border: none;
  background: transparent;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  color: ${(props) => {
    if (props.variant === "delete") return props.theme?.error || "#ef4444";
    if (props.variant === "edit" || props.variant === "link")
      return props.theme?.primary || "#3b82f6";
    return props.theme?.textSoft || "#666";
  }};

  &:hover {
    background: ${(props) => {
      if (props.variant === "delete") return "#ef444415";
      if (props.variant === "edit" || props.variant === "link")
        return `${props.theme?.primary || "#3b82f6"}15`;
      return "rgba(0,0,0,0.05)";
    }};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
  }
`;

// ================= LINHA 2: BADGES DE DETALHE =================
// FIX: layout mobile — badges em linha, quebra natural, sem campos pretos
export const ItemDetailsRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
  align-items: center;
`;

// FIX: fundo usa a cor do tema, não hardcoded
export const ItemQuantityBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.2rem;
  font-size: 0.7rem;
  padding: 0.15rem 0.45rem;
  background: ${(props) => props.theme?.border || "#e5e7eb"};
  border-radius: 0.4rem;
  font-weight: 500;
  color: ${(props) => props.theme?.textSoft || "#555"};
  white-space: nowrap;
  flex-shrink: 0;

  svg {
    width: 0.65rem;
    height: 0.65rem;
    opacity: 0.7;
  }
`;

// FIX: sem fundo escuro
export const ItemPriceBadge = styled.div`
  font-size: 0.7rem;
  color: ${(props) => props.theme?.textSoft || "#666"};
  white-space: nowrap;
  flex-shrink: 0;
  padding: 0.15rem 0;
`;

// FIX: fundo via tema, sem hardcoded dark
export const StoreBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.7rem;
  background: ${(props) => props.theme?.border || "#e5e7eb"};
  padding: 0.15rem 0.45rem;
  border-radius: 0.4rem;
  color: ${(props) => props.theme?.text || "#333"};
  max-width: 140px;
  min-width: 0;
  flex-shrink: 0;
`;

export const StoreLogoImage = styled.img`
  width: 0.85rem;
  height: 0.85rem;
  object-fit: contain;
  border-radius: 0.15rem;
  flex-shrink: 0;
`;

export const StoreIconFallback = styled.span`
  display: inline-flex;
  align-items: center;
  opacity: 0.45;
  color: ${(props) => props.theme?.textSoft || "#666"};
  flex-shrink: 0;
`;

export const StoreName = styled.span`
  font-size: 0.7rem;
  color: ${(props) => props.theme?.text || "#333"};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
`;

// ================= PRIORITY BADGES =================
// FIX: sem fundo preto — usa cores semânticas leves
export const PriorityBadgeFull = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.2rem;
  padding: 0.15rem 0.5rem;
  border-radius: 0.4rem;
  font-size: 0.7rem;
  font-weight: 600;
  white-space: nowrap;
  flex-shrink: 0;
  background: ${(props) => props.$bgColor || `${props.$color}18`};
  color: ${(props) => props.$color};
  border: 1px solid ${(props) => `${props.$color}35`};
`;

export const PriorityBadgeSmall = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.2rem;
  padding: 0.15rem 0.4rem;
  border-radius: 0.4rem;
  font-size: 0.65rem;
  font-weight: 600;
  flex-shrink: 0;
  background: ${(props) => `${props.$color}18`};
  color: ${(props) => props.$color};
  border: 1px solid ${(props) => `${props.$color}35`};

  svg {
    width: 0.65rem;
    height: 0.65rem;
  }
`;

// ================= PAYMENT BADGE =================
// FIX: sem fundo preto — background leve via tema
export const PaymentBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.2rem;
  font-size: 0.7rem;
  padding: 0.15rem 0.45rem;
  border-radius: 0.4rem;
  font-weight: 500;
  white-space: nowrap;
  flex-shrink: 0;
  border: 1px solid
    ${(props) =>
      props.$type === "vr" ? "#f59e0b50" : `${props.theme?.primary || "#3b82f6"}40`};
  color: ${(props) =>
    props.$type === "vr" ? "#f59e0b" : props.theme?.primary || "#3b82f6"};
  background: ${(props) =>
    props.$type === "vr" ? "#f59e0b12" : `${props.theme?.primary || "#3b82f6"}10`};
`;

// ================= ITEM BRAND =================
// FIX: fundo via tema, sem fundo preto
export const ItemBrand = styled.span`
  display: inline-flex;
  font-size: 0.7rem;
  color: ${(props) => props.theme?.textSoft || "#666"};
  background: ${(props) => props.theme?.border || "#e5e7eb"};
  padding: 0.15rem 0.45rem;
  border-radius: 0.4rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100px;
  flex-shrink: 0;
`;

// ================= NEW BADGE =================
export const NewBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 0.1rem 0.4rem;
  font-size: 0.6rem;
  font-weight: 700;
  border-radius: 0.35rem;
  color: #fff;
  background: linear-gradient(135deg, #ff6b6b, #ff4757);
  animation: ${pulseAnimation} 1.5s ease-in-out infinite;
  white-space: nowrap;
  flex-shrink: 0;
`;

// ================= DRAG HANDLE ITEM =================
export const DragHandleItem = styled.span`
  cursor: grab;
  color: ${(props) => props.theme?.textSoft || "#666"};
  display: inline-flex;
  align-items: center;
  opacity: 0.4;
  flex-shrink: 0;
  user-select: none;
  transition: opacity 0.2s;

  &:hover {
    opacity: 1;
  }

  &[draggable="true"]:active {
    cursor: grabbing;
  }
`;

// ================= FOOTER =================
export const CategoryFooter = styled.div`
  padding: 0.6rem 0.75rem;
  border-top: 1px solid ${(props) => props.theme?.border || "#e5e7eb"};
  background: ${(props) => props.theme?.surface || "#f8fafc"};
`;

export const CategoryStats = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.75rem;
  gap: 0.4rem;
  flex-wrap: wrap;
`;

export const StatItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.2rem;
  color: ${(props) => props.theme?.textSoft || "#666"};
  white-space: nowrap;
  font-size: 0.72rem;

  strong {
    color: ${(props) => props.theme?.text || "#333"};
    font-weight: 600;
  }
`;

// ================= SKELETON =================
export const ItemSkeletonWrapper = styled.div`
  padding: 0.5rem 0.75rem;
`;

export const ItemSkeleton = styled.div`
  height: 58px;
  border-radius: 0.6rem;
  background: ${(props) => props.theme?.border || "#e5e7eb"};
  animation: ${skeletonPulse} 1.5s infinite;
`;

// ================= EMPTY STATE =================
export const EmptyState = styled.div`
  padding: 2rem 1rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  background: ${(props) => props.theme?.background || "#fff"};
`;

export const EmptyIcon = styled.div`
  font-size: 2rem;
  opacity: 0.5;
`;

export const EmptyText = styled.p`
  margin: 0;
  font-size: 0.85rem;
  color: ${(props) => props.theme?.textSoft || "#666"};
`;

export const AddButton = styled.button`
  padding: 0.5rem 1rem;
  border: 1px dashed ${(props) => props.theme?.primary || "#3b82f6"};
  background: transparent;
  border-radius: 0.5rem;
  color: ${(props) => props.theme?.primary || "#3b82f6"};
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.85rem;
  font-weight: 500;
  transition: all 0.2s;

  &:hover {
    background: ${(props) => `${props.theme?.primary || "#3b82f6"}10`};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
  }
`;

// ================= COMPAT =================
export const ItemNameSection = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: flex-start;
  gap: 0.35rem;
  flex-wrap: wrap;
`;

export const ItemDetailsLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 0.3rem;
  flex-wrap: wrap;
  flex: 1;
  min-width: 0;
`;

// Adicione estas exportações no final do seu arquivo CategoriaCardStyles.js

export const DateBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: ${p => p.theme.border};
  color: ${p => p.theme.textSoft};
  padding: 2px 8px;
  border-radius: 20px;
  font-size: 0.65rem;
  font-weight: 500;
`;

export const FiltroDataDropdown = styled.div`
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  min-width: 170px;
  background: ${p => p.theme.surface};
  border: 1px solid ${p => p.theme.border};
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  z-index: 100;
  overflow: hidden;
  animation: fadeIn 0.15s ease;
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-8px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

export const FiltroHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid ${p => p.theme.border};
  font-size: 0.8rem;
  font-weight: 600;
  color: ${p => p.theme.text};
  background: ${p => p.theme.surface};
  
  button {
    background: none;
    border: none;
    cursor: pointer;
    color: ${p => p.theme.textSoft};
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 4px;
    border-radius: 6px;
    
    &:hover {
      background: ${p => p.theme.border};
      color: ${p => p.theme.text};
    }
  }
`;

export const FiltroOption = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 16px;
  background: ${p => p.$active ? p.theme.primary + '10' : 'transparent'};
  border: none;
  cursor: pointer;
  font-size: 0.85rem;
  color: ${p => p.$active ? p.theme.primary : p.theme.text};
  transition: all 0.15s;
  text-align: left;
  
  span:first-child {
    font-size: 1rem;
  }
  
  &:hover {
    background: ${p => p.theme.border};
  }
`;

export const FiltroClear = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 10px 16px;
  background: ${p => p.theme.error}08;
  border: none;
  border-top: 1px solid ${p => p.theme.border};
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 500;
  color: ${p => p.theme.error};
  transition: all 0.15s;
  
  &:hover {
    background: ${p => p.theme.error}15;
  }
`;

export const FiltroAtivoBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: ${p => p.theme.primary}12;
  color: ${p => p.theme.primary};
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: 600;
  margin-bottom: 12px;
  width: fit-content;
  
  button {
    background: none;
    border: none;
    cursor: pointer;
    color: ${p => p.theme.primary};
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2px;
    margin-left: 4px;
    border-radius: 50%;
    
    &:hover {
      background: ${p => p.theme.primary}20;
      transform: scale(1.1);
    }
  }
`;

export const FiltroInfo = styled.div`
  font-size: 0.7rem;
  color: ${p => p.theme.textLight};
  margin-bottom: 12px;
  padding: 6px 12px;
  background: ${p => p.theme.border};
  border-radius: 8px;
  text-align: center;
  animation: fadeIn 0.2s ease;
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

