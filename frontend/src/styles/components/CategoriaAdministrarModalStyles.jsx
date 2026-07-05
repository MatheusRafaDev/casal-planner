import styled, { keyframes, css } from 'styled-components';

// ========== Animações Globais ==========
export const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
`;

export const shimmer = keyframes`
  0%, 100% { opacity: 0.45; }
  50%       { opacity: 0.9; }
`;

export const skeletonPulse = keyframes`
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.5; }
`;

const spin = keyframes`
  to { transform: rotate(360deg); }
`;

const fadeSlide = keyframes`
  from { opacity: 0; transform: translateY(-8px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
`;

// ========== Container Principal ==========
export const PlanejamentoContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  background: ${p => p.theme?.background || "#f8fafc"};

  @media (max-width: 900px) {
    height: auto;
    min-height: 100vh;
  }
`;

export const ManageLink = styled.span`
  color: ${props => props.theme?.primary || '#6366f1'};
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 2px;
  transition: all 0.2s;
  padding: 4px 8px;
  border-radius: 6px;
  
  &:hover {
    background: ${props => props.theme?.surface2 || '#f3f4f6'};
    opacity: 0.8;
  }
`;

// ========== Layout Base ==========
export const Wrapper = styled.div`
  margin: 1rem 0;
  width: 100%;
`;

export const TriggerButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.75rem 1rem;
  background: linear-gradient(
    135deg,
    ${p => p.theme.primary}12 0%,
    ${p => p.theme.primary}06 100%
  );
  border: 1px dashed ${p => p.theme.primary}66;
  border-radius: 12px;
  color: ${p => p.theme.primary};
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  position: relative;

  &:hover {
    background: ${p => p.theme.primary}18;
    border-color: ${p => p.theme.primary};
    transform: translateY(-1px);
    box-shadow: 0 4px 12px ${p => p.theme.primary}20;
  }
  
  &:active {
    transform: scale(0.98);
  }
`;

export const ShortcutHint = styled.span`
  position: absolute;
  right: 0.75rem;
  font-size: 0.7rem;
  color: ${p => p.theme.textSoft};
  background: ${p => p.theme.hover};
  padding: 0.125rem 0.375rem;
  border-radius: 4px;
  font-family: monospace;
`;

// ========== Panel ==========
export const Panel = styled.div`
  margin-top: 0.75rem;
  background: ${p => p.theme.surface};
  border: 1px solid ${p => p.theme.border};
  border-radius: 16px;
  overflow: hidden;
  animation: ${fadeSlide} 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

  @media (max-width: 480px) {
    max-height: 80dvh;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }
`;

export const PanelHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.875rem 1.25rem;
  background: ${p => p.theme.background};
  border-bottom: 1px solid ${p => p.theme.border};
`;

export const Title = styled.h4`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: ${p => p.theme.text};
  margin: 0;
`;

export const ResultCount = styled.span`
  font-size: 0.7rem;
  font-weight: normal;
  color: ${p => p.theme.textSoft};
  background: ${p => p.theme.hover};
  padding: 0.125rem 0.5rem;
  border-radius: 12px;
`;

export const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  color: ${p => p.theme.textSoft};
  padding: 0;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);

  &:hover {
    color: ${p => p.theme.error};
    background: ${p => `${p.theme.error}10`};
    transform: scale(1.05);
  }
  
  &:active {
    transform: scale(0.95);
  }
`;

export const PanelBody = styled.div`
  padding: 1rem;
  max-height: 420px;
  overflow-y: auto;

  &::-webkit-scrollbar { width: 6px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb {
    background: ${p => p.theme.border};
    border-radius: 3px;
  }
  &::-webkit-scrollbar-thumb:hover {
    background: ${p => p.theme.textSoft};
  }
`;

// ========== Stats Row (Desktop) ==========
export const StatsRow = styled.div`
  display: flex;
  gap: 14px;
  padding: 20px 28px;
  flex-shrink: 0;
  border-bottom: 1px solid ${p => p.theme?.border || "#e5e7eb"};
  overflow-x: auto;
  
  &::-webkit-scrollbar { display: none; }
  scrollbar-width: none;

  @media (max-width: 900px) {
    display: none;
  }
`;

// ========== Stats ==========
export const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

export const StatCard = styled.div`
  padding: 0.5rem;
  background: ${p => p.theme.card || p.theme?.surface || "#fff"};
  border: 1px solid ${p => p.theme.border || p.theme?.border || "#e5e7eb"};
  border-radius: 10px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);

  &:hover {
    transform: translateY(-2px);
    border-color: ${p => p.theme.primary || p.theme?.primary};
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  
  &:active {
    transform: scale(0.95);
  }
`;

export const StatValue = styled.div`
  font-size: 1rem;
  font-weight: 700;
  color: ${p => p.theme.primary || p.theme?.primary};
  margin-bottom: 0.15rem;
`;

export const StatLabel = styled.div`
  font-size: 0.6rem;
  font-weight: 600;
  text-transform: uppercase;
  color: ${p => p.theme.textSoft || p.theme?.textSoft || "#666"};
`;

export const StatIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  
  ${p => p.$color === 'purple' && css`background: ${p.theme?.primary}18; color: ${p.theme?.primary};`}
  ${p => p.$color === 'green'  && css`background: #22c55e18; color: #22c55e;`}
  ${p => p.$color === 'orange' && css`background: #f59e0b18; color: #f59e0b;`}
`;

export const StatInfo = styled.div`
  display: flex;
  flex-direction: column;

  strong {
    font-size: 16px;
    font-weight: 700;
    letter-spacing: -0.3px;
    color: ${p => p.theme?.text || "#111"};
  }

  span {
    font-size: 11.5px;
    color: ${p => p.theme?.textSoft || "#666"};
  }
`;

export const StatRing = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
`;

// ========== Layout Master-Detail (Desktop) ==========
export const ContentArea = styled.div`
  flex: 1;
  display: flex;
  gap: 0;
  overflow: hidden;

  @media (max-width: 900px) {
    display: none;
  }
`;

// ========== Panel Categories (Sidebar) ==========
export const PanelCategories = styled.div`
  width: 260px;
  min-width: 260px;
  border-right: 1px solid ${p => p.theme?.border || "#e5e7eb"};
  background: ${p => p.theme?.surface || "#fff"};
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

export const PanelHead = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 18px;
  border-bottom: 1px solid ${p => p.theme?.border || "#e5e7eb"};
  flex-shrink: 0;

  h3 {
    font-size: 14px;
    font-weight: 600;
    margin: 0;
    color: ${p => p.theme?.text || "#111"};
  }
`;

export const CategoriesList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  
  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb { background: ${p => p.theme?.border || "#e5e7eb"}; border-radius: 4px; }
`;

export const CatItem = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 10px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.15s;
  background: ${p => p.$active ? p.theme?.primary + '18' : 'transparent'};

  &:hover {
    background: ${p => p.$active ? p.theme?.primary + '22' : p.theme?.hover || p.theme?.surface2 || "#f1f5f9"};
  }
`;

export const CatIconWrap = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: ${p => p.$active ? p.theme?.primary : p.theme?.surface2 || "#f1f5f9"};
  color: ${p => p.$active ? "#fff" : p.theme?.textSoft || "#666"};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background 0.15s, color 0.15s;
`;

export const CatName = styled.span`
  font-size: 13px;
  font-weight: 500;
  color: ${p => p.$active ? p.theme?.primary : p.theme?.text || "#111"};
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const CatCount = styled.span`
  font-size: 11.5px;
  color: ${p => p.theme?.textSoft || "#666"};
`;

export const CatPrice = styled.span`
  font-size: 11.5px;
  color: ${p => p.theme?.textLight || "#9ca3af"};
  white-space: nowrap;
`;

export const CatAddBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin: 8px;
  padding: 10px;
  border: 1px dashed ${p => p.theme?.border || "#e5e7eb"};
  border-radius: 8px;
  color: ${p => p.theme?.textSoft || "#666"};
  font-size: 13px;
  font-weight: 500;
  background: transparent;
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    border-color: ${p => p.theme?.primary};
    color: ${p => p.theme?.primary};
    background: ${p => p.theme?.primary}10;
  }
`;

export const IconBtn = styled.button`
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  color: ${p => p.theme?.textSoft || "#666"};
  background: ${p => p.theme?.surface || "#fff"};
  border: 1px solid ${p => p.theme?.border || "#e5e7eb"};
  transition: all 0.15s;
  cursor: pointer;

  &:hover {
    background: ${p => p.theme?.primary}18;
    color: ${p => p.theme?.primary};
    border-color: ${p => p.theme?.primary}40;
  }
`;

// ========== Panel Items (Direita) ==========
export const PanelItems = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: ${p => p.theme?.background || "#f8fafc"};
`;

export const ItemsHead = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  border-bottom: 1px solid ${p => p.theme?.border || "#e5e7eb"};
  flex-shrink: 0;
  gap: 12px;

  h3 {
    font-size: 14px;
    font-weight: 600;
    margin: 0;
    color: ${p => p.theme?.text || "#111"};
  }
`;

export const ItemsCountLabel = styled.p`
  font-size: 12px;
  color: ${p => p.theme?.textSoft || "#666"};
  margin: 1px 0 0 0;
`;

export const TabDot = styled.div`
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: ${p => p.$color || p.theme?.primary};
`;

export const ItemList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 8px 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;

  &::-webkit-scrollbar { width: 6px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb { background: ${p => p.theme?.border || "#e5e7eb"}; border-radius: 4px; }
`;

// ========== Product List ==========
export const ProductsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-height: 500px;
  overflow-y: auto;
  padding-right: 0.25rem;

  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-thumb {
    background: ${p => p.theme.border || p.theme?.border || "#e5e7eb"};
    border-radius: 3px;
  }
  &::-webkit-scrollbar-thumb:hover {
    background: ${p => p.theme.textSoft || p.theme?.textSoft || "#666"};
  }
`;

// ========== Product Item ==========
export const ProductItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: ${p => p.$selected ? `${p.theme.primary}08` : p.theme.card || p.theme?.surface || "#fff"};
  border: 1.5px solid ${p => p.$selected ? p.theme.primary : p.theme.border || p.theme?.border || "#e5e7eb"};
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  position: relative;

  &:hover {
    transform: translateX(4px);
    border-color: ${p => p.theme.primary || p.theme?.primary};
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }
  
  &:active {
    transform: scale(0.98) translateX(2px);
  }
`;

// ========== Item Row ==========
export const ItemRow = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px;
  border-radius: 16px;
  background: ${p => p.theme?.surface || "#fff"};
  border: 1px solid ${p => p.theme?.border || "#e5e7eb"};
  transition: all 0.15s;
  cursor: pointer;
  opacity: ${p => p.$checked ? 0.7 : 1};

  &:hover {
    border-color: ${p => p.theme?.primary}40;
    background: ${p => p.theme?.hover || p.theme?.surface2 || "#f1f5f9"};
  }

  @media (max-width: 600px) {
    padding: 16px;
    gap: 12px;
    display: grid;
    grid-template-columns: 20px 44px 1fr 32px;
    align-items: start;
  }
`;

export const Checkbox = styled.button`
  width: 20px;
  height: 20px;
  border-radius: 6px;
  border: 1.5px solid ${p => p.$checked ? p.theme?.primary : p.theme?.border || "#e5e7eb"};
  background: ${p => p.$checked ? p.theme?.primary : 'transparent'};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  cursor: pointer;
  transition: all 0.15s;

  @media (max-width: 600px) {
    grid-column: 1;
    grid-row: 1;
    margin-top: 4px;
  }

  svg {
    color: #fff;
    stroke-width: 2.5;
    width: 14px;
    height: 14px;
    opacity: ${p => p.$checked ? 1 : 0};
    transform: scale(${p => p.$checked ? 1 : 0.5});
    transition: all 0.15s;
  }
`;

export const ItemThumb = styled.div`
  width: 52px;
  height: 52px;
  border-radius: 8px;
  background: ${p => p.theme?.surface2 || "#f1f5f9"};
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;
  border: 1px solid ${p => p.theme?.border || "#e5e7eb"};
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  svg {
    color: ${p => p.theme?.textLight || "#9ca3af"};
  }

  @media (max-width: 600px) {
    width: 44px;
    height: 44px;
    grid-column: 2;
    grid-row: 1 / span 2;
  }
`;

export const ItemInfo = styled.div`
  flex: 1;
  min-width: 0;

  @media (max-width: 600px) {
    grid-column: 3;
    grid-row: 1;
  }
`;

export const ItemTitleRow = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 6px;
  width: 100%;

  @media (max-width: 600px) {
    flex-direction: column;
    gap: 6px;
  }
`;

export const ItemName = styled.div`
  font-size: 15px;
  font-weight: 700;
  color: ${p => p.$checked ? p.theme?.textSoft : p.theme?.text};
  text-decoration: ${p => p.$checked ? 'line-through' : 'none'};
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.3;
  flex: 1;

  @media (max-width: 600px) {
    font-size: 16px;
    -webkit-line-clamp: 3;
    line-height: 1.4;
  }
`;

export const ItemMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12.5px;
  color: ${p => p.theme?.textSoft || "#666"};
  margin-bottom: 4px;
  flex-wrap: nowrap;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const BrandLogo = styled.img`
  width: 14px;
  height: 14px;
  object-fit: contain;
  border-radius: 2px;
`;

export const BrandBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: ${p => p.theme?.surface2 || "#f1f5f9"};
  border: 1px solid ${p => p.theme?.border || "#e5e7eb"};
  padding: 2px 6px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 500;
  color: ${p => p.theme?.textSoft || "#666"};
`;

export const CategoryBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: ${p => p.theme?.primary + "18"};
  color: ${p => p.theme?.primary};
  padding: 2px 6px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 500;
`;

export const ItemStore = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: ${p => p.theme?.textSoft || "#666"};
  margin-top: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 99px;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;

  ${p => p.$type === 'essencial' && css`background: #ef444418; color: #ef4444; border: 1px solid #ef444433;`}
  ${p => p.$type === 'planejado' && css`background: #f59e0b18; color: #f59e0b; border: 1px solid #f59e0b33;`}
  ${p => p.$type === 'futuro' && css`background: #3b82f618; color: #3b82f6; border: 1px solid #3b82f633;`}
  ${p => p.$type === 'comprado' && css`background: #10b98118; color: #10b981; border: 1px solid #10b98133;`}
`;

export const ItemPriceCol = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 5px;
  min-width: 90px;

  @media (max-width: 600px) {
    grid-column: 3;
    grid-row: 2;
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
    min-width: auto;
    margin-top: 4px;
  }
`;

export const ItemPrice = styled.div`
  font-size: 15px;
  font-weight: 700;
  color: ${p => p.theme?.text || "#111"};

  @media (max-width: 600px) {
    font-size: 15px;
    margin-top: 0;
  }
`;

export const QtyVal = styled.span`
  font-size: 13px;
  font-weight: 500;
  color: ${p => p.theme?.textSoft || "#666"};
  white-space: nowrap;
`;

export const ItemActions = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 8px;

  @media (max-width: 600px) {
    grid-column: 4;
    grid-row: 1;
    margin-left: 0;
  }
`;

export const MenuButton = styled.button`
  background: transparent;
  border: none;
  cursor: pointer;
  color: ${p => p.theme?.textSoft || "#666"};
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  transition: all 0.15s;

  &:hover {
    background: ${p => p.theme?.surface2 || "#f1f5f9"};
    color: ${p => p.theme?.text || "#111"};
  }
`;

export const ActionMenu = styled.div`
  position: absolute;
  right: 0;
  top: 100%;
  margin-top: 4px;
  background: ${p => p.theme?.surface || "#fff"};
  border: 1px solid ${p => p.theme?.border || "#e5e7eb"};
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
  min-width: 140px;
  z-index: 10;
  overflow: hidden;
`;

export const ActionMenuItem = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border: none;
  background: transparent;
  width: 100%;
  text-align: left;
  font-size: 13px;
  color: ${p => p.$danger ? '#ef4444' : (p.theme?.text || '#111')};
  cursor: pointer;
  transition: background 0.15s;

  &:hover {
    background: ${p => p.$danger ? '#ef444415' : (p.theme?.hover || p.theme?.surface2 || '#f1f5f9')};
  }
`;

export const CheckedIcon = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #22c55e;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;

  svg { stroke-width: 2.5; width: 14px; height: 14px; }
`;

// ========== Product Image ==========
export const ProductImageContainer = styled.div`
  width: 70px;
  height: 70px;
  flex-shrink: 0;
  background: ${p => p.theme.background || p.theme?.background || "#fff"};
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
  cursor: ${p => p.$hasImage ? 'pointer' : 'default'};
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  border: 1px solid ${p => p.theme.border || p.theme?.border || "#e5e7eb"};

  &:hover {
    transform: scale(1.02);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    
    ${p => p.$hasImage && `
      &::after {
        content: '';
        position: absolute;
        inset: 0;
        background: rgba(0, 0, 0, 0.4);
        border-radius: 10px;
      }
    `}
  }
`;

export const ProductImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  background: white;
  padding: 4px;
`;

export const ProductImagePlaceholder = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${p => p.theme.hover || p.theme?.surface2 || "#f1f5f9"};
  font-size: 1.8rem;
`;

export const ImageNavPrev = styled.button`
  position: absolute;
  left: 2px;
  top: 50%;
  transform: translateY(-50%);
  width: 22px;
  height: 22px;
  background: rgba(0, 0, 0, 0.6);
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
  z-index: 2;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  opacity: 0;
  pointer-events: none;

  ${ProductImageContainer}:hover & {
    opacity: 1;
    pointer-events: auto;
  }

  &:hover {
    background: rgba(0, 0, 0, 0.8);
    transform: translateY(-50%) scale(1.1);
  }
  
  &:active {
    transform: translateY(-50%) scale(0.9);
  }
`;

export const ImageNavNext = styled(ImageNavPrev)`
  left: auto;
  right: 2px;
`;

export const ImageZoomHint = styled.div`
  position: absolute;
  bottom: 2px;
  right: 2px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  font-size: 0.55rem;
  padding: 2px 4px;
  border-radius: 4px;
  opacity: 0;
  transition: opacity 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  pointer-events: none;
  z-index: 2;

  ${ProductImageContainer}:hover & {
    opacity: 1;
  }
`;

// ========== Modal de Imagem (Zoom) ==========
export const ImageModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.9);
  z-index: 100000;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  backdrop-filter: blur(4px);
  animation: ${fadeSlide} 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  padding: 20px;

  @media (max-width: 768px) {
    padding: 10px;
  }
`;

export const ImageModalContent = styled.div`
  max-width: 90vw;
  max-height: 90vh;
  position: relative;
  cursor: default;
  animation: ${pulse} 0.3s cubic-bezier(0.16, 1, 0.3, 1);
`;

export const ImageModalClose = styled.button`
  position: absolute;
  top: -40px;
  right: -40px;
  width: 36px;
  height: 36px;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 50%;
  color: white;
  font-size: 1.25rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);

  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: scale(1.1);
  }
  
  &:active {
    transform: scale(0.9);
  }

  @media (max-width: 768px) {
    top: -50px;
    right: 0;
  }
`;

export const ImageModalImg = styled.img`
  max-width: 85vw;
  max-height: 85vh;
  object-fit: contain;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
`;

export const ImageModalCaption = styled.div`
  position: absolute;
  bottom: -30px;
  left: 0;
  right: 0;
  text-align: center;
  color: white;
  font-size: 0.875rem;
  background: rgba(0, 0, 0, 0.6);
  padding: 0.25rem 0.5rem;
  border-radius: 20px;
  width: fit-content;
  margin: 0 auto;

  @media (max-width: 768px) {
    bottom: -40px;
  }
`;

// ========== Product Info ==========
export const ProductInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

export const ProductTitle = styled.div`
  font-size: 0.8rem;
  font-weight: 600;
  color: ${p => p.theme.text || p.theme?.text || "#111"};
  margin-bottom: 0.25rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const StoreInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.3rem;
  flex-wrap: wrap;
  margin-bottom: 0.15rem;
`;

export const StoreName = styled.span`
  font-size: 0.6rem;
  color: ${p => p.theme.textSoft || p.theme?.textSoft || "#666"};
`;

export const StoreLogo = styled.img`
  width: 14px;
  height: 14px;
  object-fit: contain;
  border-radius: 3px;
`;

export const MarketplaceBadge = styled.span`
  font-size: 0.55rem;
  font-weight: 600;
  padding: 0.1rem 0.35rem;
  background: #f3d353;
  color: #92400e;
  border-radius: 4px;
  white-space: nowrap;
`;

export const TrustBadge = styled.span`
  font-size: 0.55rem;
  font-weight: 600;
  padding: 0.1rem 0.35rem;
  background: ${p => `${p.theme.success}15`};
  color: ${p => p.theme.success};
  border-radius: 4px;
  white-space: nowrap;
`;

export const BrandInfo = styled.div`
  font-size: 0.6rem;
  color: ${p => p.theme.primary || p.theme?.primary};
  margin-top: 0.15rem;
  display: flex;
  align-items: center;
  gap: 0.3rem;
`;

export const RatingInfo = styled.div`
  font-size: 0.55rem;
  color: ${p => p.theme.textSoft || p.theme?.textSoft || "#666"};
  margin-top: 0.1rem;
`;

// ========== Product Meta ==========
export const ProductMeta = styled.div`
  text-align: right;
  flex-shrink: 0;
  min-width: 80px;
`;

export const PriceValue = styled.div`
  font-size: 0.95rem;
  font-weight: 700;
  color: ${p => p.$selected ? p.theme.primary : p.theme.text || p.theme?.text || "#111"};
`;

export const OldPrice = styled.div`
  font-size: 0.6rem;
  color: ${p => p.theme.textSoft || p.theme?.textSoft || "#666"};
  text-decoration: line-through;
  margin-top: 0.1rem;
`;

export const InstallmentInfo = styled.div`
  font-size: 0.55rem;
  color: ${p => p.theme.success};
  margin-top: 0.1rem;
  white-space: nowrap;
`;

export const LinkButton = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: ${p => p.theme.hover || p.theme?.surface2 || "#f1f5f9"};
  border-radius: 6px;
  color: ${p => p.theme.primary || p.theme?.primary};
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  flex-shrink: 0;

  &:hover {
    background: ${p => p.theme.primary || p.theme?.primary};
    color: white;
    transform: scale(1.05);
  }
  
  &:active {
    transform: scale(0.9);
  }
`;

// ========== Search ==========
export const SearchSection = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  background: ${p => p.theme.background || p.theme?.background || "#fff"};
  border: 1px solid ${p => p.theme.border || p.theme?.border || "#e5e7eb"};
  border-radius: 10px;
  padding: 0.2rem 0.2rem 0.2rem 0.75rem;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);

  &:focus-within {
    border-color: ${p => p.theme.primary || p.theme?.primary};
    box-shadow: 0 0 0 3px ${p => p.theme.primary || p.theme?.primary}15;
  }
`;

export const SearchInput = styled.input`
  flex: 1;
  padding: 0.55rem 0;
  background: transparent;
  border: none;
  color: ${p => p.theme.text || p.theme?.text || "#111"};
  font-size: 0.875rem;
  outline: none;

  &::placeholder {
    color: ${p => p.theme.textSoft || p.theme?.textSoft || "#666"};
  }

  &:disabled {
    color: ${p => p.theme.textSoft || p.theme?.textSoft || "#666"};
  }
`;

export const SearchButton = styled.button`
  padding: 0.5rem 1rem;
  background: ${p => p.theme.primary || p.theme?.primary};
  color: white;
  border: none;
  border-radius: 7px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  white-space: nowrap;
  flex-shrink: 0;

  &:hover:not(:disabled) {
    filter: brightness(1.1);
    transform: translateY(-1px);
  }
  
  &:active:not(:disabled) {
    transform: scale(0.95);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

// ========== Search & Sort (Mobile) ==========
export const SearchSortBar = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
  width: 100%;
`;

export const SearchInputWrap = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: ${p => p.theme?.background || "#fff"};
  border: 1px solid ${p => p.theme?.border || "#e5e7eb"};
  border-radius: 10px;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  width: 100%;

  &:focus-within {
    border-color: ${p => p.theme?.primary};
    box-shadow: 0 0 0 3px ${p => p.theme?.primary}15;
  }

  svg {
    color: ${p => p.theme?.textSoft || "#666"};
    flex-shrink: 0;
  }

  input {
    flex: 1;
    background: transparent;
    border: none;
    color: ${p => p.theme?.text || "#111"};
    font-size: 0.875rem;
    outline: none;
    min-width: 0;

    &::placeholder {
      color: ${p => p.theme?.textSoft || "#666"};
    }
  }
`;

// ========== Sort Select ==========
export const SortSelectWrap = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  background: ${p => p.theme?.surface2 || "#f1f5f9"};
  border: 1px solid transparent;
  border-radius: 12px;
  padding: 0 16px;
  height: 42px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${p => p.theme?.border || "#e2e8f0"};
  }

  &:focus-within {
    border-color: ${p => p.theme?.primary || "#3b82f6"};
    background: ${p => p.theme?.surface || "#fff"};
    box-shadow: 0 0 0 3px ${p => (p.theme?.primary || "#3b82f6")}20;
  }

  svg {
    color: ${p => p.theme?.textSoft || "#666"};
    transition: color 0.2s;
  }
  
  &:focus-within svg {
    color: ${p => p.theme?.primary || "#3b82f6"};
  }

  select {
    border: none;
    background: transparent;
    color: ${p => p.theme?.text || "#111"};
    font-size: 14px;
    font-weight: 500;
    outline: none;
    cursor: pointer;
    appearance: none;
    padding-right: 8px;
    height: 100%;

    option {
      background: ${p => p.theme?.surface || "#fff"};
      color: ${p => p.theme?.text || "#111"};
    }
  }
`;

// ========== Filter Tabs (Mobile) ==========
export const FilterTabs = styled.div`
  display: flex;
  gap: 6px;
  padding: 0 0 12px 0;
  overflow-x: auto;
  flex-wrap: nowrap;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  -ms-overflow-style: none;

  &::-webkit-scrollbar {
    display: none;
  }
`;

export const FilterTab = styled.button`
  padding: 6px 14px;
  border-radius: 20px;
  border: 1px solid ${p => p.$active ? p.theme?.primary : p.theme?.border || "#e5e7eb"};
  background: ${p => p.$active ? p.theme?.primary : 'transparent'};
  color: ${p => p.$active ? '#fff' : p.theme?.text || "#111"};
  font-size: 0.7rem;
  font-weight: ${p => p.$active ? '600' : '500'};
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  flex-shrink: 0;

  &:hover {
    transform: translateY(-1px);
    border-color: ${p => p.theme?.primary};
    box-shadow: 0 2px 8px ${p => p.theme?.primary}20;
  }

  &:active {
    transform: scale(0.95);
  }
`;

// ========== Loading States ==========
export const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 2rem;
  color: ${p => p.theme.textSoft || p.theme?.textSoft || "#666"};
`;

export const LoadingSpinner = styled.div`
  width: 32px;
  height: 32px;
  border: 3px solid ${p => p.theme.border || p.theme?.border || "#e5e7eb"};
  border-top-color: ${p => p.theme.primary || p.theme?.primary};
  border-radius: 50%;
  animation: ${spin} 0.8s linear infinite;
`;

export const LoadingSpinnerSmall = styled.div`
  width: 14px;
  height: 14px;
  border: 2px solid white;
  border-top-color: transparent;
  border-radius: 50%;
  animation: ${spin} 0.6s linear infinite;
`;

// ========== Error States ==========
export const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 2rem;
  background: ${p => `${p.theme.error}10`};
  border-radius: 12px;
  text-align: center;

  span { color: ${p => p.theme.error}; }
`;

export const RetryButton = styled.button`
  padding: 0.5rem 1.25rem;
  background: ${p => p.theme.primary || p.theme?.primary};
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);

  &:hover {
    background: ${p => p.theme.primaryDark};
    transform: translateY(-1px);
  }
  
  &:active {
    transform: scale(0.95);
  }
`;

// ========== Mobile Layout ==========
export const MobileLayout = styled.div`
  display: none;

  @media (max-width: 900px) {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 16px 12px;
    background: ${p => p.theme?.background || "#f8fafc"};
    min-height: 100vh;
    max-height: 100vh;
    overflow: hidden;
    position: relative;
    width: 100%;
  }
`;

export const MobileSummaryGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  padding: 16px;
`;

export const MobileStat = styled.div`
  background: ${p => p.theme?.surface || "#fff"};
  border: 1px solid ${p => p.theme?.border || "#e5e7eb"};
  border-radius: 12px;
  padding: 12px;
  ${p => p.$full && css`grid-column: span 2; display: flex; align-items: center; gap: 10px;`}
`;

export const MobileStatLabel = styled.div`
  font-size: 11px;
  color: ${p => p.theme?.textSoft || "#666"};
  margin-bottom: 4px;
`;

export const MobileStatValue = styled.div`
  font-size: 17px;
  font-weight: 700;
  letter-spacing: -0.3px;
  color: ${p => p.theme?.text || "#111"};

  ${p => p.$color === 'purple' && css`color: ${p.theme?.primary};`}
  ${p => p.$color === 'green'  && css`color: #22c55e;`}
  ${p => p.$color === 'orange' && css`color: #f59e0b;`}
`;

// ========== Mobile Categories ==========
export const MobileCategoriesWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
`;

export const CategoriesHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 4px;
  flex-shrink: 0;
  width: 100%;
`;

export const CategoriesTitle = styled.span`
  font-size: 0.75rem;
  font-weight: 600;
  color: ${p => p.theme?.textSoft || "#666"};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

export const ManageButton = styled.button`
  color: ${p => p.theme?.primary || "#6366f1"};
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  background: none;
  border: none;
  padding: 4px 8px;
  border-radius: 6px;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;

  &:hover {
    background: ${p => p.theme?.primary}12;
    transform: scale(1.02);
  }

  &:active {
    transform: scale(0.95);
  }
`;

export const CategoriesScrollContainer = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: nowrap;
  overflow-x: auto;
  padding: 4px 4px 8px 4px;
  scrollbar-width: none;
  -ms-overflow-style: none;
  -webkit-overflow-scrolling: touch;

  &::-webkit-scrollbar {
    display: none;
  }
`;

export const CategoryButton = styled.button`
  padding: 6px 14px;
  border-radius: 20px;
  border: 1.5px solid ${p => p.$active ? p.theme?.primary : p.theme?.border || "#e5e7eb"};
  background: ${p => p.$active ? p.theme?.primary : 'transparent'};
  color: ${p => p.$active ? '#fff' : p.theme?.text || "#111"};
  font-size: 0.75rem;
  font-weight: ${p => p.$active ? '600' : '500'};
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  flex-shrink: 0;

  &:hover {
    transform: translateY(-1px);
    border-color: ${p => p.theme?.primary};
    box-shadow: 0 2px 8px ${p => p.theme?.primary}20;
  }

  &:active {
    transform: scale(0.95);
  }
`;

export const AddCategoryButton = styled(CategoryButton)`
  color: ${p => p.theme?.primary};
  border-color: ${p => p.theme?.primary};
  border-style: dashed;
  background: ${p => p.theme?.primary}06;
  flex-shrink: 0;

  &:hover {
    background: ${p => p.theme?.primary}12;
    border-style: solid;
  }
`;

// ========== Mobile Items Container ==========
export const MobileItemsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 4px 0;
  width: 100%;
  max-height: 60vh;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;

  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: ${p => p.theme?.border || "#e5e7eb"};
    border-radius: 3px;
  }
  &::-webkit-scrollbar-thumb:hover {
    background: ${p => p.theme?.textSoft || "#666"};
  }
`;

// ========== Mobile FAB ==========
export const MobileFab = styled.button`
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: ${p => p.theme?.primary || "#3b82f6"};
  color: white;
  border: none;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  z-index: 100;

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 6px 16px rgba(59, 130, 246, 0.5);
  }

  &:active {
    transform: scale(0.95);
  }

  @media (min-width: 901px) {
    display: none;
  }
`;

// ========== Empty State ==========
export const EmptyStateContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  min-height: 50vh;
  margin: 2rem auto;
  max-width: 450px;
  gap: 16px;
  padding: 40px 20px;
`;

export const EmptyStateIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 1.5rem;
  opacity: 0.7;
`;

export const EmptyStateTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: ${props => props.theme?.text || "#111"};
  margin: 0 0 0.75rem 0;
`;

export const EmptyStateButton = styled.button`
  margin-top: 1rem;
  padding: 0.6rem 1.25rem;
  background: ${props => props.theme?.primary || "#3b82f6"};
  color: white;
  border: none;
  border-radius: 2rem;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);

  &:hover {
    background: ${p => p.theme?.primaryDark};
    transform: translateY(-2px);
    box-shadow: 0 4px 12px ${p => p.theme?.primary}30;
  }

  &:active {
    transform: scale(0.95);
  }
`;

// ========== Skeleton Components ==========
export const SkeletonPanelCategories = styled.div`
  width: 260px;
  min-width: 260px;
  border-right: 1px solid ${p => p.theme?.border || "#e5e7eb"};
  background: ${p => p.theme?.surface || "#fff"};
  display: flex;
  flex-direction: column;
  padding: 16px;

  @media (max-width: 900px) { display: none; }
`;

export const SkeletonPanelItems = styled.div`
  flex: 1;
  padding: 16px 24px;
`;

export const SkeletonLine = styled.div`
  height: ${p => p.h || '12px'};
  width: ${p => p.w || '100%'};
  border-radius: 4px;
  background: ${p => p.theme?.border || "#e5e7eb"};
  margin-bottom: ${p => p.mb || '0'};
  animation: ${shimmer} 1.4s ease infinite;
`;

export const SkeletonItemRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 12px;
  background: ${p => p.theme?.surface || "#fff"};
  border: 1px solid ${p => p.theme?.border || "#e5e7eb"};
  margin-bottom: 6px;
  
  .thumb {
    width: 52px; 
    height: 52px; 
    border-radius: 8px;
    background: ${p => p.theme?.border || "#e5e7eb"};
    animation: ${shimmer} 1.4s ease infinite;
  }
  
  .info { 
    flex: 1; 
  }
`;