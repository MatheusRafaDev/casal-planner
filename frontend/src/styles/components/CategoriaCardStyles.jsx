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
  background: ${(props) => props.theme.background || "#fff"};
  border: 1px solid ${(props) => props.theme.border || "#e5e7eb"};
  border-radius: 1rem;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  margin-bottom: 0.75rem;
  transition: all 0.2s ease;

  box-shadow: 0 1px 3px rgba(0,0,0,0.04);

  ${(props) =>
    props.$isDragOver &&
    `
    border: 2px dashed ${props.theme.primary};
    background: ${props.theme.primary}08;
    transform: scale(0.99);
  `}

  &:hover {
    box-shadow: 0 6px 18px rgba(0,0,0,0.08);
    transform: translateY(-1px);
  }
`;

// ================= HEADER =================
export const CardHeader = styled.div`
  padding: 0.85rem 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-left: 4px solid ${(props) => props.color || props.theme.primary};
  background: ${(props) => props.theme.surface || "#f8fafc"};
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

  &:hover {
    opacity: 1;
  }

  @media (max-width: 640px) {
    display: none;
  }
`;

export const Icon = styled.span`
  font-size: 1.2rem;
`;

export const TitleSection = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
`;

export const Title = styled.h3`
  font-size: 0.95rem;
  font-weight: 700;
  margin: 0;
  color: ${(props) => props.theme.text || "#111"};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const Subtitle = styled.div`
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
  margin-top: 0.2rem;
`;

// ================= BADGES HEADER =================
export const ItemsCount = styled.span`
  font-size: 0.7rem;
  padding: 0.15rem 0.5rem;
  border-radius: 0.5rem;
  background: ${(props) => props.theme.border};
`;

export const TotalValue = styled.span`
  font-size: 0.75rem;
  font-weight: 700;
  color: ${(props) => props.theme.primary};
`;

export const MetaBadge = styled.div`
  display: inline-flex;
  align-items: center;
  padding: 0.15rem 0.5rem;
  border-radius: 0.5rem;
  font-size: 0.7rem;
  font-weight: 600;

  background: ${(props) =>
    props.$excedeu
      ? "#ef444415"
      : props.$proximo
      ? "#f59e0b15"
      : "#22c55e15"};

  color: ${(props) =>
    props.$excedeu
      ? "#ef4444"
      : props.$proximo
      ? "#f59e0b"
      : "#22c55e"};

  border: 1px solid currentColor;
`;

// ================= ACTIONS =================
export const HeaderActions = styled.div`
  display: flex;
  gap: 0.3rem;
`;

export const IconButton = styled.button`
  width: 2rem;
  height: 2rem;
  border-radius: 0.5rem;
  border: none;
  background: transparent;
  cursor: pointer;
  color: ${(props) => (props.danger ? "#ef4444" : "#666")};

  &:hover {
    background: rgba(0,0,0,0.05);
    color: ${(props) => (props.danger ? "#ef4444" : "#111")};
  }
`;

// ================= CONTENT =================
export const CardContent = styled.div`
  padding: 0.75rem;
`;

// ================= SORT =================
export const SortBar = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 0.5rem;
`;

export const SortButton = styled.button`
  font-size: 0.75rem;
  padding: 0.3rem 0.6rem;
  border-radius: 0.5rem;
  border: 1px solid ${(props) => props.theme.border};
  background: ${(props) => (props.$active ? props.theme.primary + "10" : "transparent")};
  cursor: pointer;
`;

// ================= ITEMS =================
export const ItemsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

// ================= ITEM CARD =================
export const ItemRow = styled.div`
  padding: 0.65rem 0.75rem;
  border-radius: 0.75rem;
  border: 1px solid ${(props) => props.theme.border};
  background: ${(props) =>
    props.$purchased ? props.theme.success + "10" : "#fff"};

  transition: all 0.15s;

  &:hover {
    border-color: ${(props) => props.theme.primary + "50"};
    transform: translateY(-1px);
  }
`;

// TOP ROW
export const ItemMainRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

// checkbox
export const CheckboxButton = styled.button`
  width: 1.25rem;
  height: 1.25rem;
  border-radius: 0.35rem;
  border: 2px solid ${(props) =>
    props.$checked ? props.theme.success : props.theme.border};
  background: ${(props) =>
    props.$checked ? props.theme.success : "transparent"};
`;

// name
export const ItemName = styled.p`
  flex: 1;
  font-size: 0.92rem;
  font-weight: 700;
  margin: 0;
  color: ${(props) => (props.$purchased ? "#888" : "#111")};
  text-decoration: ${(props) => (props.$purchased ? "line-through" : "none")};
`;

// price pill
export const ItemTotalCompact = styled.div`
  background: ${(props) => props.theme.primary + "12"};
  padding: 0.2rem 0.55rem;
  border-radius: 0.5rem;
`;

export const ItemTotalValueCompact = styled.span`
  font-weight: 700;
  font-size: 0.85rem;
  color: ${(props) => props.theme.primary};
`;

// actions
export const ItemActions = styled.div`
  display: flex;
  gap: 0.25rem;
`;

export const ItemActionButton = styled.button`
  width: 1.8rem;
  height: 1.8rem;
  border-radius: 0.4rem;
  border: none;
  background: transparent;

  &:hover {
    background: rgba(0,0,0,0.05);
  }
`;

// ================= DETAILS =================
export const ItemDetailsRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
  margin-top: 0.45rem;
`;

// badges menores e limpos
export const ItemQuantityBadge = styled.div`
  font-size: 0.65rem;
  padding: 0.15rem 0.4rem;
  background: #f1f5f9;
  border-radius: 0.4rem;
`;

export const ItemPriceBadge = styled.div`
  font-size: 0.65rem;
  color: #666;
`;

export const StoreBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 0.2rem;
  font-size: 0.65rem;
  background: #f1f5f9;
  padding: 0.15rem 0.4rem;
  border-radius: 0.4rem;
`;

// ================= FOOTER =================
export const CategoryFooter = styled.div`
  padding: 0.75rem;
  border-top: 1px solid ${(props) => props.theme.border};
  background: ${(props) => props.theme.surface};
`;

export const CategoryStats = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
`;

// ================= MISSING COMPONENTS FIX =================

// Store logo fallback
export const StoreIconFallback = styled.span`
  display: inline-flex;
  align-items: center;
  opacity: 0.5;
  color: ${(props) => props.theme?.textSoft || "#666"};
`;

// Store image
export const StoreLogoImage = styled.img`
  width: 0.8rem;
  height: 0.8rem;
  object-fit: contain;
  border-radius: 0.15rem;
`;

// Check icon wrapper compatibility
export const CheckIcon = styled(Check)`
  width: 0.7rem;
  height: 0.7rem;
  color: #fff;
  stroke-width: 3.5;
`;

// Priority full badge (compat)
export const PriorityBadgeFull = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.2rem;
  padding: 0.15rem 0.5rem;
  border-radius: 0.4rem;
  font-size: 0.65rem;
  font-weight: 600;
  white-space: nowrap;

  background: ${(props) => props.$bgColor || `${props.$color}18`};
  color: ${(props) => props.$color};
  border: 1px solid ${(props) => `${props.$color}35`};
`;

// New badge
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
`;

// Payment badge
export const PaymentBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.2rem;
  font-size: 0.6rem;
  padding: 0.1rem 0.4rem;
  border-radius: 0.35rem;

  color: ${(props) =>
    props.$type === "vr" ? "#f59e0b" : "#3b82f6"};

  background: ${(props) =>
    props.$type === "vr" ? "#f59e0b15" : "#3b82f615"};

  border: 1px solid currentColor;
`;


export const ItemBrand = styled.span`
  font-size: 0.7rem;
  color: ${(props) => props.theme?.textSoft || "#666"};
  font-weight: 500;
`;


// Expand button
export const ExpandButton = styled.button`
  background: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  color: ${(props) => props.theme?.textSoft || "#666"};
`;

// Sort label
export const SortLabel = styled.span`
  font-size: 0.75rem;
  color: ${(props) => props.theme?.textSoft || "#666"};
`;

// Sort buttons group
export const SortButtonsGroup = styled.div`
  display: flex;
  gap: 0.35rem;
  flex-wrap: wrap;
  flex: 1;
`;

// Sort icon wrapper
export const SortIcon = styled.span`
  display: inline-flex;
  margin-left: 0.2rem;
`;

// Progress (compat)
export const CategoryProgress = styled.div`
  padding: 0.5rem 0.75rem;
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
  background: ${(props) => props.color || props.theme.primary};
  transition: width 0.3s ease;
`;

// Skeleton
export const ItemSkeletonWrapper = styled.div`
  padding: 0.5rem;
`;

export const ItemSkeleton = styled.div`
  height: 60px;
  border-radius: 0.6rem;
  background: ${(props) => props.theme?.border || "#e5e7eb"};
  animation: ${skeletonPulse} 1.5s infinite;
`;

// Empty extras (fallback)
export const EmptyState = styled.div`
  padding: 2rem 1rem;
  text-align: center;
`;

export const EmptyIcon = styled.div`
  font-size: 2rem;
  margin-bottom: 0.5rem;
`;

export const EmptyText = styled.p`
  margin: 0;
  font-size: 0.85rem;
`;

export const AddButton = styled.button`
  margin-top: 0.75rem;
  padding: 0.5rem 1rem;
  border: 1px dashed ${(props) => props.theme.primary};
  background: transparent;
  border-radius: 0.5rem;
  color: ${(props) => props.theme.primary};
  cursor: pointer;
`;

// Stats fallback
export const StatItem = styled.div`
  font-size: 0.75rem;
  color: ${(props) => props.theme?.textSoft || "#666"};
  display: flex;
  gap: 0.25rem;
`;

// Missing store name alias (IMPORTANT FIX)
export const StoreName = styled.span`
  font-size: 0.65rem;
  color: ${(props) => props.theme?.text || "#333"};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;
