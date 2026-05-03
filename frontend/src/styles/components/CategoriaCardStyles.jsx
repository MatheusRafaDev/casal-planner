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

export const CardContent = styled.div`
  flex: 1;
  background: ${(props) => props.theme?.background || "#fff"};
`;

export const ItemsList = styled.div`
  padding: 0.6rem 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

// ================= ITEM CARD =================
export const ItemRow = styled.div`
  padding: 0.6rem 0.65rem;
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
  opacity: ${(props) => (props.$isDragging ? 0.5 : props.$purchased ? 0.82 : 1)};

  &:hover {
    border-color: ${(props) => `${props.theme?.primary || "#3b82f6"}40`};
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  }
`;

export const ItemLayout = styled.div`
  display: flex;
  gap: 0.6rem;
  align-items: flex-start;
`;

export const ItemContent = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
`;

export const ItemMidRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  align-items: center;
`;

export const ItemBottomRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  align-items: center;
`;

export const DetailSeparator = styled.span`
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: ${(props) => props.theme?.border || "#d1d5db"};
  flex-shrink: 0;
  display: inline-block;
`;

export const ProductImageWrapper = styled.div`
  width: 52px;
  height: 52px;
  border-radius: 0.5rem;
  overflow: hidden;
  flex-shrink: 0;
  border: 1px solid ${(props) => props.theme?.border || "#e5e7eb"};
  background: ${(props) => props.theme?.surface || "#f8fafc"};
  transition: all 0.2s;
  position: relative;

  ${(props) => props.$purchased && `
    opacity: 0.55;
    filter: grayscale(40%);
  `}

  ${(props) => props.$hasImage && `
    &:hover {
      border-color: ${props.theme?.primary || "#3b82f6"};
      box-shadow: 0 0 0 2px ${(props.theme?.primary || "#3b82f6")}30;
      transform: scale(1.04);
    }
  `}

  @media (max-width: 480px) {
    width: 44px;
    height: 44px;
  }
`;

export const ProductImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: opacity 0.2s;

  ${(props) => props.$purchased && `
    opacity: 0.7;
  `}
`;

export const ProductImgPlaceholder = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${(props) => props.theme?.border || "#d1d5db"};
  background: ${(props) => props.theme?.surface || "#f8fafc"};
`;

export const CheckboxButton = styled.button`
  width: 1.1rem;
  height: 1.1rem;
  min-width: 1.1rem;
  border-radius: 0.25rem;
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
  align-self: center;
  cursor: pointer;
  transition: all 0.2s;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
  }
`;

export const CheckIcon = styled(Check)`
  width: 0.6rem;
  height: 0.6rem;
  color: #fff;
  stroke-width: 3.5;
`;

export const ItemName = styled.p`
  flex: 1;
  font-size: 0.875rem;
  font-weight: 700;
  margin: 0;
  min-width: 0;
  color: ${(props) =>
    props.$purchased ? props.theme?.textSoft || "#888" : props.theme?.text || "#111"};
  white-space: normal;
  word-break: break-word;
  overflow-wrap: break-word;
  line-height: 1.35;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.35rem;
`;

export const ItemTotalValueCompact = styled.span`
  font-weight: 700;
  font-size: 0.82rem;
  color: ${(props) => props.theme?.primary || "#3b82f6"};
  background: ${(props) => `${props.theme?.primary || "#3b82f6"}12`};
  padding: 0.18rem 0.45rem;
  border-radius: 0.45rem;
  white-space: nowrap;
`;

export const ItemActionButton = styled.button`
  width: 1.6rem;
  height: 1.6rem;
  border-radius: 0.35rem;
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

export const ItemQuantityBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.2rem;
  font-size: 0.68rem;
  padding: 0.12rem 0.4rem;
  background: ${(props) => props.theme?.border || "#e5e7eb"};
  border-radius: 0.35rem;
  font-weight: 600;
  color: ${(props) => props.theme?.textSoft || "#555"};
  white-space: nowrap;
  flex-shrink: 0;

  svg {
    width: 0.6rem;
    height: 0.6rem;
    opacity: 0.7;
  }
`;

export const ItemPriceBadge = styled.div`
  font-size: 0.68rem;
  color: ${(props) => props.theme?.textSoft || "#666"};
  white-space: nowrap;
  flex-shrink: 0;
  font-weight: 500;
`;

export const StoreBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.68rem;
  background: ${(props) => props.theme?.border || "#e5e7eb"};
  padding: 0.12rem 0.4rem;
  border-radius: 0.35rem;
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
  font-size: 0.68rem;
  color: ${(props) => props.theme?.text || "#333"};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
`;

export const PriorityBadgeFull = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.2rem;
  padding: 0.12rem 0.45rem;
  border-radius: 0.35rem;
  font-size: 0.68rem;
  font-weight: 600;
  white-space: nowrap;
  flex-shrink: 0;
  background: ${(props) => props.$bgColor || `${props.$color}18`};
  color: ${(props) => props.$color};
  border: 1px solid ${(props) => `${props.$color}35`};
`;

export const PaymentBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.2rem;
  font-size: 0.68rem;
  padding: 0.12rem 0.4rem;
  border-radius: 0.35rem;
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

export const ItemBrand = styled.span`
  display: inline-flex;
  font-size: 0.68rem;
  color: ${(props) => props.theme?.textSoft || "#666"};
  background: ${(props) => props.theme?.border || "#e5e7eb"};
  padding: 0.12rem 0.4rem;
  border-radius: 0.35rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100px;
  flex-shrink: 0;
`;

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

export const ItemSkeletonWrapper = styled.div`
  padding: 0.5rem 0.75rem;
`;

export const ItemSkeleton = styled.div`
  height: 72px;
  border-radius: 0.6rem;
  background: ${(props) => props.theme?.border || "#e5e7eb"};
  animation: ${skeletonPulse} 1.5s infinite;
`;

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

export const FiltroDataDropdown = styled.div`
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  min-width: 170px;
  background: ${(p) => p.theme?.surface || "#fff"};
  border: 1px solid ${(p) => p.theme?.border || "#e5e7eb"};
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  z-index: 100;
  overflow: hidden;
  animation: fadeIn 0.15s ease;

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-8px); }
    to   { opacity: 1; transform: translateY(0); }
  }
`;

export const FiltroHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid ${(p) => p.theme?.border || "#e5e7eb"};
  font-size: 0.8rem;
  font-weight: 600;
  color: ${(p) => p.theme?.text || "#111"};
  background: ${(p) => p.theme?.surface || "#f8fafc"};

  button {
    background: none; border: none; cursor: pointer;
    color: ${(p) => p.theme?.textSoft || "#666"};
    display: flex; align-items: center; justify-content: center;
    padding: 4px; border-radius: 6px;
    &:hover { background: ${(p) => p.theme?.border || "#e5e7eb"}; color: ${(p) => p.theme?.text || "#111"}; }
  }
`;

export const FiltroOption = styled.button`
  display: flex; align-items: center; gap: 10px;
  width: 100%; padding: 10px 16px;
  background: ${(p) => p.$active ? (p.theme?.primary || "#3b82f6") + "10" : "transparent"};
  border: none; cursor: pointer; font-size: 0.85rem;
  color: ${(p) => p.$active ? (p.theme?.primary || "#3b82f6") : (p.theme?.text || "#111")};
  transition: all 0.15s; text-align: left;
  span:first-child { font-size: 1rem; }
  &:hover { background: ${(p) => p.theme?.border || "#e5e7eb"}; }
`;

export const FiltroClear = styled.button`
  display: flex; align-items: center; justify-content: center; gap: 8px;
  width: 100%; padding: 10px 16px;
  background: ${(p) => (p.theme?.error || "#ef4444") + "08"};
  border: none; border-top: 1px solid ${(p) => p.theme?.border || "#e5e7eb"};
  cursor: pointer; font-size: 0.8rem; font-weight: 500;
  color: ${(p) => p.theme?.error || "#ef4444"};
  transition: all 0.15s;
  &:hover { background: ${(p) => (p.theme?.error || "#ef4444") + "15"}; }
`;

export const FiltroAtivoBadge = styled.div`
  display: inline-flex; align-items: center; gap: 6px;
  background: ${(p) => (p.theme?.primary || "#3b82f6") + "12"};
  color: ${(p) => p.theme?.primary || "#3b82f6"};
  padding: 5px 12px; border-radius: 20px;
  font-size: 0.7rem; font-weight: 600;
  margin-bottom: 12px; width: fit-content;

  button {
    background: none; border: none; cursor: pointer;
    color: ${(p) => p.theme?.primary || "#3b82f6"};
    display: flex; align-items: center; justify-content: center;
    padding: 2px; margin-left: 4px; border-radius: 50%;
    &:hover { background: ${(p) => (p.theme?.primary || "#3b82f6") + "20"}; transform: scale(1.1); }
  }
`;

export const FiltroInfo = styled.div`
  font-size: 0.7rem;
  color: ${(p) => p.theme?.textSoft || "#888"};
  margin-bottom: 12px;
  padding: 6px 12px;
  background: ${(p) => p.theme?.border || "#e5e7eb"};
  border-radius: 8px;
  text-align: center;
  animation: fadeIn 0.2s ease;
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
`;

export const SortClearButton = styled.button`
  font-size: 0.7rem;
  padding: 0.3rem 0.6rem;
  border-radius: 0.5rem;
  border: 1px solid ${(props) => props.theme?.border || "#e5e7eb"};
  background: ${(props) => props.theme?.surface || "#f8fafc"};
  color: ${(props) => props.theme?.textSoft || "#666"};
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  margin-left: auto;

  &:hover {
    background: ${(props) => props.theme?.border || "#e5e7eb"};
    color: ${(props) => props.theme?.text || "#111"};
  }
  &:disabled { opacity: 0.5; cursor: not-allowed; pointer-events: none; }
`;

// ================= NOVOS COMPONENTES PARA SCROLL =================
export const ItemsContainer = styled.div`
  ${props => props.$hasScroll && `
    max-height: 400px;
    overflow-y: auto;
    overflow-x: hidden;
    
    &::-webkit-scrollbar {
      width: 6px;
    }
    
    &::-webkit-scrollbar-track {
      background: ${props.theme?.border || "#e5e7eb"};
      border-radius: 3px;
    }
    
    &::-webkit-scrollbar-thumb {
      background: ${props.theme?.textSoft || "#94a3b8"};
      border-radius: 3px;
    }
    
    &::-webkit-scrollbar-thumb:hover {
      background: ${props.theme?.primary || "#3b82f6"};
    }
  `}
`;

export const ShowMoreButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.6rem;
  margin-top: 0.5rem;
  background: ${({ theme }) => `${theme?.primary || "#3b82f6"}10`};
  border: 1px solid ${({ theme }) => `${theme?.primary || "#3b82f6"}30`};
  border-radius: 0.5rem;
  color: ${({ theme }) => theme?.primary || "#3b82f6"};
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => `${theme?.primary || "#3b82f6"}20`};
    transform: translateY(-1px);
  }
`;

export const ShowLessButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.6rem;
  margin-top: 0.5rem;
  background: ${({ theme }) => `${theme?.textSoft || "#94a3b8"}10`};
  border: 1px solid ${({ theme }) => `${theme?.textSoft || "#94a3b8"}30`};
  border-radius: 0.5rem;
  color: ${({ theme }) => theme?.textSoft || "#94a3b8"};
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => `${theme?.textSoft || "#94a3b8"}20`};
  }
`;