import styled, { keyframes, css } from 'styled-components';

export const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
`;

export const shimmer = keyframes`
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
`;

export const skeletonPulse = keyframes`
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.5; }
`;

const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-5px); }
  100% { transform: translateY(0px); }
`;

// ========== Container Principal ==========
export const PlanejamentoContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  min-width: 0;
  overflow: hidden;
  background: ${p => p.theme?.background || "#f8fafc"};
  background-image: ${p => p.theme?.mode === 'dark' 
    ? 'radial-gradient(circle at top right, rgba(99, 102, 241, 0.05) 0%, transparent 40%), radial-gradient(circle at bottom left, rgba(168, 85, 247, 0.05) 0%, transparent 40%)' 
    : 'radial-gradient(circle at top right, rgba(99, 102, 241, 0.03) 0%, transparent 40%)'};
`;

export const ManageLink = styled.span`
  color: ${props => props.theme?.primary || '#6366f1'};
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.3s ease;
  padding: 6px 12px;
  border-radius: 8px;
  background: ${props => props.theme?.primary + '11'};
  
  &:hover {
    background: ${props => props.theme?.primary + '22'};
    transform: translateY(-1px);
  }
`;

// ========== Stats Row (Desktop) ==========
export const StatsRow = styled.div`
  display: flex;
  gap: 20px;
  padding: 24px 32px;
  flex-shrink: 0;
  border-bottom: 1px solid ${p => p.theme?.border || "#e5e7eb"};
  overflow-x: auto;
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  
  &::-webkit-scrollbar { display: none; }
  scrollbar-width: none;

  @media (max-width: 900px) {
    display: none;
  }
`;

export const StatCard = styled.div`
  background: ${p => p.theme?.surface || "#fff"};
  border: 1px solid ${p => p.theme?.border || "#e5e7eb"};
  border-radius: 20px;
  padding: 20px 24px;
  display: flex;
  align-items: center;
  gap: 20px;
  flex: 1;
  min-width: 240px;
  box-shadow: ${p => p.theme?.shadowCard || "0 4px 20px rgba(0,0,0,0.03)"};
  transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-4px);
    box-shadow: ${p => p.theme?.shadowHover || "0 12px 24px rgba(0, 0, 0, 0.08)"};
    border-color: ${p => p.theme?.primary}40;
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 3px;
    background: transparent;
    transition: background 0.3s ease;
  }
  
  &:hover::after {
    background: ${p => p.theme?.gradient || `linear-gradient(135deg, ${p.theme?.primary}, #a855f7)`};
  }
`;

export const StatIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  
  ${StatCard}:hover & {
    transform: scale(1.1) rotate(-5deg);
  }
  
  ${p => p.$color === 'purple' && css`
    background: linear-gradient(135deg, ${p.theme?.primary}22, ${p.theme?.primary}44); 
    color: ${p.theme?.primary};
  `}
  ${p => p.$color === 'green'  && css`
    background: linear-gradient(135deg, rgba(34,197,94,0.15), rgba(34,197,94,0.25)); 
    color: #22c55e;
  `}
  ${p => p.$color === 'orange' && css`
    background: linear-gradient(135deg, rgba(245,158,11,0.15), rgba(245,158,11,0.25)); 
    color: #f59e0b;
  `}
`;

export const StatInfo = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;

  strong {
    font-size: 20px;
    font-weight: 800;
    letter-spacing: -0.5px;
    color: ${p => p.theme?.text || "#111"};
    font-family: 'Inter', sans-serif;
  }

  span {
    font-size: 13px;
    color: ${p => p.theme?.textSoft || "#666"};
    margin-top: 4px;
    font-weight: 500;
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
  min-width: 280px;
  border-right: 1.5px solid ${p => p.theme?.border || "#e5e7eb"};
  background: ${p => p.theme?.surface || "#fff"};
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 4px 0 32px rgba(0,0,0,0.03);
  z-index: 10;
`;

export const PanelHead = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 28px;
  border-bottom: 1px solid ${p => p.theme?.border || "#e5e7eb"};
  flex-shrink: 0;
  background: ${p => p.theme?.surface || "#fff"};

  h3 {
    font-size: 16px;
    font-weight: 800;
    margin: 0;
    color: ${p => p.theme?.text || "#111"};
    letter-spacing: -0.3px;
    font-family: 'Outfit', sans-serif;
  }
`;

export const CategoriesList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  
  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb { background: ${p => p.theme?.border || "#e5e7eb"}; border-radius: 4px; }
`;

export const CatItem = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 18px;
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
  background: ${p => p.$active ? p.theme?.primary + '12' : 'transparent'};
  border: 1.5px solid ${p => p.$active ? p.theme?.primary + '45' : 'transparent'};
  margin: 2px 6px;
  position: relative;
  z-index: ${p => p.$menuOpen ? 1000 : 1};

  &:hover {
    background: ${p => p.$active ? p.theme?.primary + '1c' : p.theme?.surface2 || "#f1f5f9"};
    transform: translateX(6px);
    border-color: ${p => p.$active ? p.theme?.primary + '60' : 'transparent'};
  }
`;

export const CatIconWrap = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: ${p => p.$active ? `linear-gradient(135deg, ${p.theme?.primary}, #a855f7)` : p.theme?.surface2 || "#f1f5f9"};
  color: ${p => p.$active ? "#fff" : p.theme?.textSoft || "#666"};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: ${p => p.$active ? `0 4px 14px ${p.theme?.primary}45` : '0 2px 6px rgba(0,0,0,0.04)'};
  
  ${CatItem}:hover & {
    transform: scale(1.12) rotate(8deg);
  }
`;

export const CatName = styled.span`
  font-size: 14px;
  font-weight: ${p => p.$active ? '700' : '600'};
  color: ${p => p.$active ? p.theme?.primary : p.theme?.text || "#111"};
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color 0.2s;
`;

export const CatCount = styled.span`
  font-size: 11px;
  font-weight: 800;
  background: ${p => p.theme?.surface3 || "#e2e8f0"};
  color: ${p => p.theme?.textSoft || "#666"};
  padding: 4px 8px;
  border-radius: 8px;
  transition: all 0.2s;

  ${CatItem}:hover & {
    background: ${p => p.theme?.primary + '22'};
    color: ${p => p.theme?.primary};
  }
`;

export const CatPrice = styled.span`
  font-size: 12px;
  color: ${p => p.theme?.textSoft || "#9ca3af"};
  white-space: nowrap;
  font-weight: 700;
  letter-spacing: -0.2px;
`;

export const CatColorDot = styled.div`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: ${p => p.$color || p.theme?.primary || '#8b5cf6'};
  flex-shrink: 0;
  box-shadow: 0 0 0 3px ${p => (p.$color || p.theme?.primary || '#8b5cf6')}30;
`;

export const CatAddBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin: 12px 8px;
  padding: 14px;
  border: 2px dashed ${p => p.theme?.border || "#e5e7eb"};
  border-radius: 14px;
  color: ${p => p.theme?.textSoft || "#666"};
  font-size: 14px;
  font-weight: 700;
  background: transparent;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);

  &:hover {
    border-color: ${p => p.theme?.primary};
    color: ${p => p.theme?.primary};
    background: ${p => p.theme?.primary}0a;
    transform: translateY(-2px);
  }
`;

export const IconBtn = styled.button`
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  color: ${p => p.theme?.textSoft || "#666"};
  background: ${p => p.theme?.surface || "#fff"};
  border: 1px solid ${p => p.theme?.border || "#e5e7eb"};
  transition: all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1);
  cursor: pointer;

  &:hover {
    background: ${p => p.theme?.primary}11;
    color: ${p => p.theme?.primary};
    border-color: ${p => p.theme?.primary}40;
    transform: scale(1.08) translateY(-1px);
    box-shadow: 0 4px 12px ${p => p.theme?.primary}20;
  }
`;

// ========== Panel Items (Direita) ==========
export const PanelItems = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: ${p => p.theme?.background || "#f8fafc"};
  position: relative;
`;

export const ItemsHead = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 32px;
  border-bottom: 1px solid ${p => p.theme?.border || "#e5e7eb"};
  flex-shrink: 0;
  gap: 16px;
  background: ${p => p.theme?.surface || "#fff"};

  h3 {
    font-size: 20px;
    font-weight: 800;
    margin: 0;
    color: ${p => p.theme?.text || "#111"};
    letter-spacing: -0.5px;
    font-family: 'Outfit', sans-serif;
  }
`;

export const ItemsCountLabel = styled.p`
  font-size: 13px;
  color: ${p => p.theme?.textSoft || "#666"};
  margin: 4px 0 0 0;
  font-weight: 500;
`;

export const CatSummaryBanner = styled.div`
  background: ${p => p.theme?.surface2 || '#f1f5f9'};
  border-bottom: 1px solid ${p => p.theme?.border || '#e5e7eb'};
  padding: 16px 32px;
  display: flex;
  gap: 24px;
  align-items: center;
  flex-wrap: wrap;

  @media (max-width: 600px) {
    padding: 16px;
    gap: 16px;
  }
`;

export const CatSummaryStat = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const CatSummaryLabel = styled.span`
  font-size: 11px;
  text-transform: uppercase;
  font-weight: 700;
  letter-spacing: 0.5px;
  color: ${p => p.theme?.textSoft || '#666'};
`;

export const CatSummaryValue = styled.div`
  font-size: 16px;
  font-weight: 800;
  color: ${p => p.$color || p.theme?.text || '#111'};
`;

export const CatProgressBar = styled.div`
  flex: 1;
  min-width: 200px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const CatProgressTrack = styled.div`
  width: 100%;
  height: 8px;
  background: ${p => p.theme?.surface || '#fff'};
  border: 1px solid ${p => p.theme?.border || '#e5e7eb'};
  border-radius: 4px;
  overflow: hidden;
`;

export const CatProgressFill = styled.div`
  height: 100%;
  background: ${p => p.$exceeded ? '#ef4444' : p.theme?.primary || '#3b82f6'};
  width: ${p => Math.min(p.$pct || 0, 100)}%;
  transition: width 0.4s ease;
`;

export const CatProgressLabels = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  font-weight: 600;
  color: ${p => p.theme?.textSoft || '#666'};
`;

export const TabDot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${p => p.$color || p.theme?.primary};
  box-shadow: 0 0 0 2px ${p => p.$color}30;
`;

export const ItemList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px 32px;
  display: flex;
  flex-direction: column;
  gap: 14px;

  &::-webkit-scrollbar { width: 8px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb { background: ${p => p.theme?.border || "#e5e7eb"}; border-radius: 6px; }
  &::-webkit-scrollbar-thumb:hover { background: ${p => p.theme?.border || "#d1d5db"}; }
`;

// ========== Item Row ==========
export const ItemRow = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px 20px;
  border-radius: 16px;
  background: ${p => p.theme?.surface || "#fff"};
  border: 1.5px solid ${p => p.$checked ? (p.theme?.borderLight || "#e5e7eb") : (p.theme?.border || "#e5e7eb")};
  box-shadow: ${p => p.theme?.shadowCard || "0 2px 12px rgba(0,0,0,0.04)"};
  transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
  cursor: pointer;
  opacity: ${p => p.$checked ? 0.65 : 1};
  animation: ${fadeUp} 0.4s ease forwards;
  position: relative;
  z-index: ${p => p.$menuOpen ? 1000 : 1};

  &:hover {
    transform: translateY(-3px) scale(1.01);
    box-shadow: ${p => p.theme?.shadowHover || "0 16px 32px rgba(0, 0, 0, 0.08)"};
    border-color: ${p => p.theme?.primary}50;
    opacity: 1;
  }

  @media (max-width: 600px) {
    padding: 14px 16px;
    gap: 10px;
    border-radius: 14px;
  }
`;

export const Checkbox = styled.button`
  width: 26px;
  height: 26px;
  border-radius: 8px;
  border: 2px solid ${p => p.$checked ? p.theme?.primary : p.theme?.border || "#cbd5e1"};
  background: ${p => p.$checked ? `linear-gradient(135deg, ${p.theme?.primary}, #a855f7)` : 'transparent'};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: ${p => p.$checked ? `0 4px 12px ${p.theme?.primary}40` : 'none'};

  &:hover {
    border-color: ${p => p.theme?.primary};
    transform: scale(1.1);
  }

  @media (max-width: 600px) {
    width: 22px;
    height: 22px;
  }

  svg {
    color: #fff;
    stroke-width: 3.5;
    width: 14px;
    height: 14px;
    opacity: ${p => p.$checked ? 1 : 0};
    transform: scale(${p => p.$checked ? 1 : 0.2});
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
`;

export const ItemThumb = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 14px;
  background: ${p => p.theme?.surface2 || "#f1f5f9"};
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;
  border: 1.5px solid ${p => p.theme?.border || "#e5e7eb"};
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  
  ${ItemRow}:hover & {
    transform: scale(1.08) rotate(-3deg);
    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  }
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  ${ItemRow}:hover img {
    transform: scale(1.15);
  }
  
  svg {
    color: ${p => p.theme?.textLight || "#9ca3af"};
  }

  @media (max-width: 600px) {
    width: 48px;
    height: 48px;
    border-radius: 12px;
  }
`;

export const ItemInfo = styled.div`
  flex: 1;
  min-width: 0;

  @media (max-width: 600px) {
    /* Mantenha flex 1 como no PC */
  }
`;

export const ItemTitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 6px;
  width: 100%;
`;

export const ItemName = styled.div`
  font-size: 15px;
  font-weight: 700;
  color: ${p => p.$checked ? p.theme?.textSoft : p.theme?.text};
  text-decoration: ${p => p.$checked ? 'line-through' : 'none'};
  line-height: 1.4;
  flex: 1;
  font-family: 'Inter', sans-serif;
  letter-spacing: -0.3px;
  white-space: normal;
  word-break: break-word;
  overflow: visible;
  transition: color 0.2s ease;

  @media (max-width: 600px) {
    font-size: 14px;
  }
`;

export const ItemMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  font-size: 13px;
  color: ${p => p.theme?.textSoft || "#666"};
  margin-top: 4px;
  flex-wrap: wrap;

  @media (max-width: 600px) {
    gap: 6px;
    row-gap: 4px;
    margin-top: 6px;
  }
`;

export const BrandLogo = styled.img`
  width: 16px;
  height: 16px;
  object-fit: contain;
  border-radius: 4px;
`;

export const BrandBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: ${p => p.theme?.surface2 || "#f1f5f9"};
  border: 1px solid ${p => p.theme?.border || "#e5e7eb"};
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  color: ${p => p.theme?.textSoft || "#666"};
`;

export const CategoryBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: ${p => p.theme?.primary + "15"};
  color: ${p => p.theme?.primary};
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
`;

export const ItemStore = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: ${p => p.theme?.textSoft || "#666"};
  margin-top: 4px;
  font-weight: 600;
`;

export const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  border-radius: 99px;
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;

  ${p => p.$type === 'essencial' && css`background: #ef444415; color: #ef4444; border: 1px solid #ef444430;`}
  ${p => p.$type === 'planejado' && css`background: #f59e0b15; color: #f59e0b; border: 1px solid #f59e0b30;`}
  ${p => p.$type === 'futuro' && css`background: #3b82f615; color: #3b82f6; border: 1px solid #3b82f630;`}
  ${p => p.$type === 'comprado' && css`background: #10b98115; color: #10b981; border: 1px solid #10b98130;`}
`;

export const ItemPriceCol = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
  min-width: 90px;

  @media (max-width: 600px) {
    flex-direction: column;
    align-items: flex-end;
    min-width: auto;
    margin-top: 0;
    gap: 4px;
  }
`;

export const ItemPrice = styled.div`
  font-size: 17px;
  font-weight: 800;
  color: ${p => p.theme?.text || "#111"};
  letter-spacing: -0.6px;
  font-family: 'Inter', sans-serif;
  transition: color 0.2s ease;

  @media (max-width: 600px) {
    font-size: 15px;
  }
`;

export const QtyVal = styled.span`
  font-size: 13px;
  font-weight: 700;
  color: ${p => p.theme?.textLight || "#9ca3af"};
  white-space: nowrap;
  background: ${p => p.theme?.surface2 || '#f1f5f9'};
  padding: 2px 8px;
  border-radius: 6px;
`;

export const ItemActions = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 12px;

  @media (max-width: 600px) {
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
  width: 36px;
  height: 36px;
  border-radius: 10px;
  transition: all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1);

  &:hover {
    background: ${p => p.theme?.surface2 || "#f1f5f9"};
    color: ${p => p.theme?.text || "#111"};
    transform: scale(1.1);
  }
`;

export const ActionMenu = styled.div`
  position: absolute;
  right: 0;
  top: 100%;
  margin-top: 8px;
  background: ${p => p.theme?.surface || "#fff"};
  border: 1px solid ${p => p.theme?.border || "#e5e7eb"};
  border-radius: 14px;
  box-shadow: 0 12px 30px rgba(0,0,0,0.1), 0 4px 10px rgba(0,0,0,0.05);
  display: flex;
  flex-direction: column;
  min-width: 160px;
  z-index: 100;
  overflow: hidden;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  padding: 6px;
  animation: ${fadeUp} 0.2s ease forwards;
`;

export const ActionMenuItem = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border: none;
  background: transparent;
  width: 100%;
  text-align: left;
  font-size: 13.5px;
  font-weight: 600;
  border-radius: 8px;
  color: ${p => p.$danger ? '#ef4444' : (p.theme?.text || '#111')};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${p => p.$danger ? '#ef444415' : (p.theme?.primary + '11')};
    color: ${p => p.$danger ? '#ef4444' : p.theme?.primary};
    transform: translateX(2px);
  }
`;

export const CheckedIcon = styled.div`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: linear-gradient(135deg, #22c55e, #16a34a);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  box-shadow: 0 4px 12px rgba(34, 197, 94, 0.4);
  animation: ${float} 2s ease-in-out infinite;

  svg { stroke-width: 3.5; width: 16px; height: 16px; }
`;

// ========== Search & Sort ==========
export const SearchSortBar = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
  width: 100%;
  align-items: center;

  @media (max-width: 900px) {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
    margin-bottom: 16px;
  }
`;

export const SearchInputWrap = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 20px;
  background: ${p => p.theme?.surface || "#fff"};
  border: 1.5px solid ${p => p.theme?.border || "#e5e7eb"};
  border-radius: 16px;
  height: 48px;
  transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
  flex: 1;
  box-shadow: 0 2px 8px rgba(0,0,0,0.02);

  &:focus-within {
    border-color: ${p => p.theme?.primary || "#3b82f6"};
    box-shadow: 0 0 0 4px ${p => (p.theme?.primary || "#3b82f6")}1a;
    transform: translateY(-1px);
  }

  svg {
    color: ${p => p.theme?.textSoft || "#666"};
    flex-shrink: 0;
    transition: color 0.3s;
  }

  &:focus-within svg {
    color: ${p => p.theme?.primary || "#3b82f6"};
  }

  input {
    flex: 1;
    background: transparent;
    border: none;
    color: ${p => p.theme?.text || "#111"};
    font-size: 14.5px;
    font-weight: 500;
    outline: none;
    min-width: 0;
    height: 100%;

    &::placeholder {
      color: ${p => p.theme?.textSoft || "#9ca3af"};
    }
  }
`;

export const ClearSearchBtn = styled.button`
  background: transparent;
  border: none;
  color: ${p => p.theme?.textSoft || "#9ca3af"};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 4px;
  border-radius: 50%;
  transition: all 0.2s;

  &:hover {
    background: ${p => p.theme?.surface2 || "#f1f5f9"};
    color: ${p => p.theme?.text || "#111"};
  }
`;

export const SortSelectWrap = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  background: ${p => p.theme?.surface || "#fff"};
  border: 1.5px solid ${p => p.theme?.border || "#e5e7eb"};
  border-radius: 16px;
  padding: 0 16px;
  height: 48px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(0,0,0,0.02);

  &:hover {
    border-color: ${p => p.theme?.primary}80;
    transform: translateY(-1px);
  }

  &:focus-within {
    border-color: ${p => p.theme?.primary || "#3b82f6"};
    box-shadow: 0 0 0 4px ${p => (p.theme?.primary || "#3b82f6")}1a;
  }

  svg {
    color: ${p => p.theme?.textSoft || "#666"};
    transition: color 0.3s;
  }
  
  &:focus-within svg {
    color: ${p => p.theme?.primary || "#3b82f6"};
  }

  select {
    border: none;
    background: transparent;
    color: ${p => p.theme?.text || "#111"};
    font-size: 14px;
    font-weight: 600;
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

// ========== Filter Tabs ==========
export const FilterTabs = styled.div`
  display: flex;
  gap: 10px;
  padding: 12px 0 20px 0;
  flex-wrap: nowrap;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  -ms-overflow-style: none;
  border-bottom: 1px solid ${p => p.theme?.border || "#e5e7eb"};

  &::-webkit-scrollbar {
    display: none;
  }

  @media (min-width: 901px) {
    padding: 16px 32px;
    border-bottom: 1px solid ${p => p.theme?.border || "#e5e7eb"};
    background: ${p => p.theme?.surface || "#fff"};
  }
`;

export const FilterTab = styled.button`
  padding: 10px 20px;
  border-radius: 24px;
  border: 1px solid ${p => p.$active ? p.theme?.primary + '40' : p.theme?.border || '#e5e7eb'};
  background: ${p => p.$active ? p.theme?.primary + '15' : p.theme?.surface || '#fff'};
  color: ${p => p.$active ? p.theme?.primary : p.theme?.textSoft || "#666"};
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 10px;
  box-shadow: ${p => p.$active ? `0 4px 12px ${p.theme?.primary}15` : '0 2px 6px rgba(0,0,0,0.02)'};

  &:hover {
    background: ${p => p.$active ? p.theme?.primary + '20' : p.theme?.surface2 || "#f1f5f9"};
    color: ${p => p.$active ? p.theme?.primary : p.theme?.text || "#111"};
    transform: translateY(-2px);
  }

  &:active {
    transform: scale(0.95);
  }
`;

// ========== Mobile Components ==========
export const MobileLayout = styled.div`
  display: none;

  @media (max-width: 900px) {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;
    min-width: 0;
    overflow: hidden;
    background: ${p => p.theme?.background || "#f8fafc"};
    width: 100%;
    background-image: ${p => p.theme?.mode === 'dark' 
      ? 'radial-gradient(circle at top, rgba(99, 102, 241, 0.08) 0%, transparent 60%)' 
      : 'radial-gradient(circle at top, rgba(99, 102, 241, 0.04) 0%, transparent 60%)'};
  }
`;

export const MobileScrollArea = styled.div`
  flex: 1;
  min-height: 0;
  min-width: 0;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  display: flex;
  flex-direction: column;
`;

export const MobileHeader = styled.div`
  background: ${p => p.theme?.surface || '#fff'};
  border-bottom: 1px solid ${p => p.theme?.border || '#e5e7eb'};
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex-shrink: 0;
`;

export const MobileFilterBar = styled.div`
  background: ${p => p.theme?.surface || '#fff'};
  border-bottom: 1px solid ${p => p.theme?.border || '#e5e7eb'};
  padding: 8px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex-shrink: 0;
`;

export const MobileFilterChips = styled.div`
  display: flex;
  gap: 6px;
  overflow-x: auto;
  padding-bottom: 2px;
  scrollbar-width: none;
  -ms-overflow-style: none;
  -webkit-overflow-scrolling: touch;
  &::-webkit-scrollbar { display: none; }
`;

export const MobileFilterChip = styled.button`
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 6px 12px;
  border-radius: 20px;
  border: 1.5px solid ${p => p.$active ? p.theme?.primary : p.theme?.border || '#e5e7eb'};
  background: ${p => p.$active ? p.theme?.primary + '18' : p.theme?.surface || '#fff'};
  color: ${p => p.$active ? p.theme?.primary : p.theme?.textSoft || '#666'};
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
  transition: all 0.2s ease;
`;

export const MobileItemsSection = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
`;

export const MobileItemsHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: ${p => p.theme?.surface || '#fff'};
  border-bottom: 1px solid ${p => p.theme?.border || '#e5e7eb'};
  flex-shrink: 0;
`;

export const MobileSummaryGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
  padding: 4px 0 16px 0;
`;

export const MobileStat = styled.div`
  background: ${p => p.theme?.surface || "#fff"};
  border: 1px solid ${p => p.theme?.border || "#e5e7eb"};
  border-radius: 20px;
  padding: 18px 20px;
  box-shadow: ${p => p.theme?.shadowCard || "0 4px 16px rgba(0,0,0,0.04)"};
  transition: transform 0.3s;
  ${p => p.$full && css`grid-column: span 2; display: flex; align-items: center; justify-content: space-between;`}

  &:active {
    transform: scale(0.98);
  }
`;

export const MobileStatLabel = styled.div`
  font-size: 12px;
  font-weight: 700;
  color: ${p => p.theme?.textSoft || "#666"};
  margin-bottom: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

export const MobileStatValue = styled.div`
  font-size: 20px;
  font-weight: 800;
  letter-spacing: -0.5px;
  color: ${p => p.theme?.text || "#111"};
  font-family: 'Inter', sans-serif;

  ${p => p.$color === 'purple' && css`color: ${p.theme?.primary};`}
  ${p => p.$color === 'green'  && css`color: #22c55e;`}
  ${p => p.$color === 'orange' && css`color: #f59e0b;`}
`;

export const MobileCategoriesWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
`;

export const CategoriesHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0;
  flex-shrink: 0;
  width: 100%;
`;

export const CategoriesTitle = styled.span`
  font-size: 13px;
  font-weight: 800;
  color: ${p => p.theme?.text || "#111"};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-family: 'Outfit', sans-serif;
`;

export const ManageButton = styled.button`
  color: ${p => p.theme?.primary || "#6366f1"};
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  background: ${p => p.theme?.primary + '15'};
  border: none;
  padding: 6px 12px;
  border-radius: 10px;
  transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;

  &:hover {
    background: ${p => p.theme?.primary + '25'};
    transform: translateY(-1px);
  }

  &:active {
    transform: scale(0.95);
  }
`;

export const MobileCategoriesScroll = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: nowrap;
  overflow-x: auto;
  padding: 4px 0 12px 0;
  scrollbar-width: none;
  -ms-overflow-style: none;
  -webkit-overflow-scrolling: touch;

  &::-webkit-scrollbar {
    display: none;
  }
`;

export const MobileCatBtn = styled.button`
  padding: 12px 20px;
  border-radius: 26px;
  border: 1.5px solid ${p => p.$active ? p.theme?.primary : p.theme?.border || "#e5e7eb"};
  background: ${p => p.$active ? `linear-gradient(135deg, ${p.theme?.primary}, #a855f7)` : p.theme?.surface || '#fff'};
  color: ${p => p.$active ? '#fff' : p.theme?.text || "#111"};
  font-size: 13px;
  font-weight: ${p => p.$active ? '700' : '600'};
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
  flex-shrink: 0;
  box-shadow: ${p => p.$active ? `0 6px 18px ${p.theme?.primary}45` : '0 2px 8px rgba(0,0,0,0.04)'};

  &:hover {
    transform: translateY(-3px) scale(1.02);
    border-color: ${p => p.$active ? p.theme?.primary : p.theme?.primary + '80'};
    box-shadow: ${p => p.$active ? `0 8px 22px ${p.theme?.primary}55` : '0 4px 12px rgba(0,0,0,0.06)'};
  }

  &:active {
    transform: scale(0.96);
  }
`;

export const AddCategoryButton = styled(MobileCatBtn)`
  color: ${p => p.theme?.primary};
  border-color: ${p => p.theme?.primary}60;
  border-style: dashed;
  background: ${p => p.theme?.primary}0a;
  box-shadow: none;

  &:hover {
    background: ${p => p.theme?.primary}15;
    border-style: solid;
  }
`;

export const MobileItemsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
  padding: 12px 16px 20px;
  width: 100%;

  /* Gaps entre itens */
  & > * + * {
    margin-top: 10px;
  }
`;

export const MobileFab = styled.button`
  position: fixed;
  bottom: 90px;
  right: 24px;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: linear-gradient(135deg, ${p => p.theme?.primary || "#3b82f6"}, #a855f7);
  color: white;
  border: none;
  box-shadow: 0 8px 28px ${p => p.theme?.primary}65;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  z-index: 100;

  &:hover {
    transform: scale(1.12) rotate(8deg);
    box-shadow: 0 12px 36px ${p => p.theme?.primary}85;
  }

  &:active {
    transform: scale(0.92);
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
  min-height: 40vh;
  margin: 2rem auto;
  max-width: 480px;
  gap: 24px;
  padding: 56px 32px;
  border-radius: 24px;
  background: ${p => p.theme?.surface || "#fff"};
  border: 1.5px solid ${p => p.theme?.border || "#e5e7eb"};
  box-shadow: 0 12px 48px rgba(0,0,0,0.04);
`;

export const EmptyStateIcon = styled.div`
  font-size: 4.5rem;
  margin-bottom: 0.5rem;
  opacity: 0.85;
  animation: ${float} 4s ease-in-out infinite;
`;

export const EmptyStateTitle = styled.h3`
  font-size: 1.4rem;
  font-weight: 800;
  color: ${props => props.theme?.text || "#111"};
  margin: 0;
  font-family: 'Outfit', sans-serif;
  letter-spacing: -0.4px;
`;

export const EmptyStateButton = styled.button`
  margin-top: 1.5rem;
  padding: 16px 32px;
  background: linear-gradient(135deg, ${props => props.theme?.primary || "#3b82f6"}, #a855f7);
  color: white;
  border: none;
  border-radius: 100px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
  box-shadow: 0 8px 24px ${p => p.theme?.primary}45;

  &:hover {
    transform: translateY(-4px) scale(1.02);
    box-shadow: 0 12px 32px ${p => p.theme?.primary}65;
  }

  &:active {
    transform: scale(0.96);
  }
`;

// ========== Skeleton Components ==========
export const SkeletonPanelCategories = styled.div`
  width: 320px;
  min-width: 320px;
  border-right: 1px solid ${p => p.theme?.border || "#e5e7eb"};
  background: ${p => p.theme?.surface || "#fff"};
  display: flex;
  flex-direction: column;
  padding: 24px;

  @media (max-width: 900px) { display: none; }
`;

export const SkeletonPanelItems = styled.div`
  flex: 1;
  padding: 24px 32px;
`;

export const SkeletonLine = styled.div`
  height: ${p => p.h || '14px'};
  width: ${p => p.w || '100%'};
  border-radius: 8px;
  background: linear-gradient(90deg, 
    ${p => p.theme?.surface2 || "#f1f5f9"} 0px, 
    ${p => p.theme?.border || "#e2e8f0"} 50%, 
    ${p => p.theme?.surface2 || "#f1f5f9"} 100%
  );
  background-size: 2000px 100%;
  margin-bottom: ${p => p.mb || '0'};
  animation: ${shimmer} 2s infinite linear;
`;

export const SkeletonItemRow = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  border-radius: 16px;
  background: ${p => p.theme?.surface || "#fff"};
  border: 1px solid ${p => p.theme?.border || "#e5e7eb"};
  margin-bottom: 12px;
  
  .thumb {
    width: 60px; 
    height: 60px; 
    border-radius: 12px;
    background: linear-gradient(90deg, 
      ${p => p.theme?.surface2 || "#f1f5f9"} 0px, 
      ${p => p.theme?.border || "#e2e8f0"} 50%, 
      ${p => p.theme?.surface2 || "#f1f5f9"} 100%
    );
    background-size: 2000px 100%;
    animation: ${shimmer} 2s infinite linear;
  }
  
  .info { 
    flex: 1; 
  }
`;
