
import styled, { keyframes } from 'styled-components';

const spin = keyframes`to { transform: rotate(360deg); }`;
const fadeSlide = keyframes`
  from { opacity: 0; transform: translateY(-8px); }
  to   { opacity: 1; transform: translateY(0); }
`;

// ─── Container ───────────────────────────────────────────────────────────────
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
  background: ${p => p.theme.surface};
  border: 1px solid ${p => p.theme.border};
  border-radius: 12px;
  color: ${p => p.theme.text};
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s;

  &:hover {
    border-color: ${p => p.theme.primary};
    background: ${p => p.theme.hover};
  }
`;

export const Panel = styled.div`
  margin-top: 0.75rem;
  background: ${p => p.theme.surface};
  border: 1px solid ${p => p.theme.border};
  border-radius: 16px;
  overflow: hidden;
  animation: ${fadeSlide} 0.2s ease;
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
  font-size: 0.875rem;
  font-weight: 600;
  color: ${p => p.theme.text};
  margin: 0;
`;

export const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1rem;
  cursor: pointer;
  color: ${p => p.theme.textSoft};
  line-height: 1;
  padding: 0.125rem 0.25rem;
  border-radius: 4px;
  transition: color 0.15s;

  &:hover { color: ${p => p.theme.error}; }
`;

export const PanelBody = styled.div`
  padding: 1.25rem;
  max-height: 560px;
  overflow-y: auto;

  &::-webkit-scrollbar { width: 5px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb {
    background: ${p => p.theme.border};
    border-radius: 3px;
  }
`;

// ─── Seção de Correção do Produto ───────────────────────────────────────────
export const CorrectionSection = styled.div`
  background: ${p => `${p.theme.primary}08`};
  border: 1px solid ${p => `${p.theme.primary}20`};
  border-radius: 12px;
  padding: 0.875rem;
  margin-bottom: 1.25rem;
`;

export const CorrectionLabel = styled.div`
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: ${p => p.theme.textSoft};
  margin-bottom: 0.5rem;
`;

export const ProductDisplay = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  
  .field {
    display: flex;
    align-items: baseline;
    gap: 0.5rem;
    font-size: 0.8rem;
    
    .label {
      font-weight: 600;
      color: ${p => p.theme.textSoft};
      min-width: 50px;
    }
    
    .value {
      color: ${p => p.theme.text};
      background: ${p => p.theme.surface};
      padding: 0.25rem 0.5rem;
      border-radius: 6px;
      flex: 1;
      word-break: break-word;
    }
  }
`;

export const CorrectionButton = styled.button`
  width: 100%;
  padding: 0.6rem;
  background: ${p => `${p.theme.primary}15`};
  color: ${p => p.theme.primary};
  border: 1px solid ${p => `${p.theme.primary}30`};
  border-radius: 10px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;

  &:hover:not(:disabled) {
    background: ${p => `${p.theme.primary}25`};
    transform: translateY(-1px);
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

// ─── Busca ───────────────────────────────────────────────────────────────────
export const SearchSection = styled.div`
  margin-bottom: 1.25rem;
`;

export const SearchLabel = styled.label`
  display: block;
  font-size: 0.68rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  color: ${p => p.theme.textSoft};
  margin-bottom: 0.5rem;
`;

export const SearchInputWrapper = styled.div`
  display: flex;
  gap: 0.5rem;
`;

export const SearchInput = styled.input`
  flex: 1;
  padding: 0.6rem 0.875rem;
  background: ${p => p.theme.background};
  border: 1px solid ${p => p.theme.border};
  border-radius: 10px;
  color: ${p => p.theme.text};
  font-size: 0.875rem;
  transition: border-color 0.15s;

  &:focus {
    outline: none;
    border-color: ${p => p.theme.primary};
  }

  &::placeholder { color: ${p => p.theme.textLight}; }
`;

export const SearchButton = styled.button`
  padding: 0.6rem 1.1rem;
  background: ${p => p.theme.primary};
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.15s, opacity 0.15s;

  &:hover:not(:disabled) { background: ${p => p.theme.primaryDark}; }
  &:disabled { opacity: 0.45; cursor: not-allowed; }
`;

export const SearchActions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 0.5rem;
`;

export const AIButton = styled.button`
  padding: 0.3rem 0.75rem;
  background: ${p => `${p.theme.primary}12`};
  color: ${p => p.theme.primary};
  border: 1px solid ${p => `${p.theme.primary}30`};
  border-radius: 8px;
  font-size: 0.72rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;

  &:hover:not(:disabled) { background: ${p => `${p.theme.primary}22`}; }
  &:disabled { opacity: 0.45; cursor: not-allowed; }
`;

export const ResetButton = styled.button`
  background: none;
  border: none;
  color: ${p => p.theme.textSoft};
  font-size: 0.72rem;
  cursor: pointer;
  text-decoration: underline;
  padding: 0;

  &:hover { color: ${p => p.theme.primary}; }
`;

export const Badge = styled.div`
  margin-top: 0.5rem;
  font-size: 0.72rem;
  color: ${p => p.theme.textSoft};
  padding: 0.3rem 0.6rem;
  background: ${p => `${p.theme.primary}10`};
  border-radius: 6px;
  
  strong { color: ${p => p.theme.primary}; }
`;

// ─── Loading ─────────────────────────────────────────────────────────────────
export const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 2.5rem;
  color: ${p => p.theme.textSoft};
  font-size: 0.875rem;
`;

export const LoadingSpinner = styled.div`
  width: 18px;
  height: 18px;
  border: 2px solid ${p => p.theme.border};
  border-top-color: ${p => p.theme.primary};
  border-radius: 50%;
  animation: ${spin} 0.7s linear infinite;
  flex-shrink: 0;
`;

// ─── Erro ────────────────────────────────────────────────────────────────────
export const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 1.5rem;
  background: ${p => `${p.theme.error}10`};
  border-radius: 12px;
  text-align: center;

  span {
    color: ${p => p.theme.error};
    font-size: 0.875rem;
  }
`;

export const RetryButton = styled.button`
  padding: 0.4rem 1rem;
  background: ${p => p.theme.primary};
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s;

  &:hover { background: ${p => p.theme.primaryDark}; }
`;

// ─── Stats ────────────────────────────────────────────────────────────────────
export const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.625rem;
  margin-bottom: 1rem;
`;

export const StatCard = styled.button`
  padding: 0.75rem;
  background: ${p => p.$selected ? p.theme.primary : p.theme.card};
  border: 1px solid ${p => p.$selected ? p.theme.primary : p.theme.border};
  border-radius: 12px;
  text-align: center;
  cursor: pointer;
  transition: transform 0.15s, border-color 0.15s;

  &:hover {
    transform: translateY(-2px);
    border-color: ${p => p.theme.primary};
  }
`;

export const StatValue = styled.div`
  font-size: 1rem;
  font-weight: 700;
  margin-bottom: 0.2rem;
  color: ${({ $type, theme }) =>
    $type === 'min' ? theme.success :
    $type === 'max' ? theme.error :
    theme.primary};
`;

export const StatLabel = styled.div`
  font-size: 0.6rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  color: ${p => p.theme.textSoft};
`;

export const StatHint = styled.div`
  font-size: 0.55rem;
  color: ${p => p.theme.textLight};
  margin-top: 0.25rem;
  opacity: 0.8;
`;

// ─── Lista de Produtos ────────────────────────────────────────────────────────
export const ProductsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  margin-bottom: 1rem;
  max-height: 300px;
  overflow-y: auto;

  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-thumb {
    background: ${p => p.theme.border};
    border-radius: 2px;
  }
`;

export const ProductItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.625rem 0.75rem;
  background: ${p => p.$selected ? `${p.theme.primary}12` : p.theme.card};
  border: 1px solid ${p =>
    p.$selected ? p.theme.primary :
    p.$isBest  ? `${p.theme.success}60` :
    p.theme.border};
  border-radius: 10px;
  cursor: pointer;
  transition: transform 0.15s, border-color 0.15s, background 0.15s;
  opacity: ${p => p.$isLowPriority ? 0.85 : 1};

  &:hover {
    transform: translateX(3px);
    border-color: ${p => p.theme.primary};
  }
`;

export const ProductImage = styled.div`
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  background: ${p => p.theme.surface};
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  img { width: 100%; height: 100%; object-fit: contain; }
  span { font-size: 1.1rem; }
`;

export const ProductInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

export const ProductTitle = styled.div`
  font-size: 0.75rem;
  font-weight: 600;
  color: ${p => p.theme.text};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 0.15rem;
`;

export const StoreName = styled.div`
  font-size: 0.65rem;
  color: ${p => p.theme.textSoft};
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.25rem;
`;

export const TrustBadge = styled.span`
  font-size: 0.55rem;
  font-weight: 600;
  padding: 0.1rem 0.35rem;
  background: ${p => p.theme.success}20;
  color: ${p => p.theme.success};
  border-radius: 4px;
  white-space: nowrap;
`;

// NOVO COMPONENTE: MarketplaceBadge
export const MarketplaceBadge = styled.span`
  font-size: 0.55rem;
  font-weight: 600;
  padding: 0.1rem 0.35rem;
  background: ${p => p.theme.warning || '#fef3c7'}20;
  color: ${p => p.theme.warning || '#92400e'};
  border-radius: 4px;
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
  gap: 0.15rem;
  
  &::before {
    content: "🏷️";
    font-size: 0.5rem;
  }
`;

export const ProductMeta = styled.div`
  text-align: right;
  flex-shrink: 0;
`;

export const PriceValue = styled.div`
  font-size: 0.85rem;
  font-weight: 700;
  color: ${p =>
    p.$selected ? p.theme.primary :
    p.$isBest   ? p.theme.success :
    p.theme.text};
`;

export const Badges = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.25rem;
  margin-top: 0.2rem;
  flex-wrap: wrap;
`;

export const BestBadge = styled.span`
  font-size: 0.55rem;
  font-weight: 600;
  padding: 0.1rem 0.35rem;
  background: ${p => p.theme.success};
  color: white;
  border-radius: 6px;
  white-space: nowrap;
`;

export const SelectedBadge = styled.span`
  font-size: 0.55rem;
  font-weight: 600;
  padding: 0.1rem 0.35rem;
  background: ${p => p.theme.primary};
  color: white;
  border-radius: 6px;
  white-space: nowrap;
`;

export const SelectedProductBadge = styled.div`
  font-size: 0.6rem;
  font-weight: 600;
  color: ${p => p.theme.primary};
  margin-top: 0.2rem;
  display: flex;
  align-items: center;
  gap: 0.2rem;
`;

export const LinkButton = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.35rem;
  background: ${p => p.theme.hover};
  border-radius: 7px;
  color: ${p => p.theme.primary};
  transition: background 0.15s, color 0.15s;
  flex-shrink: 0;

  &:hover {
    background: ${p => p.theme.primary};
    color: white;
  }
`;

// ─── Hint ────────────────────────────────────────────────────────────────────
export const HintText = styled.div`
  font-size: 0.7rem;
  color: ${p => p.theme.textSoft};
  text-align: center;
  padding: 0.75rem;
  background: ${p => `${p.theme.primary}08`};
  border-radius: 10px;
  margin-top: 0.5rem;
  line-height: 1.5;
`;

// ─── Empty ────────────────────────────────────────────────────────────────────
export const EmptyState = styled.div`
  text-align: center;
  padding: 2rem 1rem;

  span { font-size: 2rem; display: block; margin-bottom: 0.5rem; }
  h4 { font-size: 0.875rem; margin: 0 0 0.25rem; color: ${p => p.theme.text}; }
  p  { font-size: 0.75rem; color: ${p => p.theme.textSoft}; margin-bottom: 1rem; }
`;

export const ValidationAlert = styled.div`
  margin-bottom: 16px;
  padding: 12px 16px;
  border-radius: 8px;
  background-color: ${props => {
    switch(props.$confianca) {
      case 'alta': return '#fef3c7';
      case 'media': return '#ffedd5';
      default: return '#fee2e2';
    }
  }};
  border-left: 4px solid ${props => {
    switch(props.$confianca) {
      case 'alta': return '#f59e0b';
      case 'media': return '#f97316';
      default: return '#ef4444';
    }
  }};
  
  strong {
    display: block;
    margin-bottom: 8px;
    color: #78350f;
  }
  
  ul {
    margin: 0 0 8px 0;
    padding-left: 20px;
    
    li {
      font-size: 13px;
      color: #78350f;
      margin-bottom: 4px;
    }
  }
  
  small {
    font-size: 12px;
    color: #92400e;
    opacity: 0.8;
  }
`;