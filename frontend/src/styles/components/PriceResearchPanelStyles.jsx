// styles/components/PriceResearchPanelStyles.js
import styled, { keyframes } from 'styled-components';

const spin = keyframes`
  to { transform: rotate(360deg); }
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
`;

// ─── Container ──────────────────────────────────────────────────────────────
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
  background: ${props => props.theme.surface};
  border: 1px solid ${props => props.theme.border};
  border-radius: 12px;
  color: ${props => props.theme.text};
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: ${props => props.theme.primary};
    background: ${props => props.theme.hover};
  }
`;

export const Panel = styled.div`
  margin-top: 0.75rem;
  background: ${props => props.theme.surface};
  border: 1px solid ${props => props.theme.border};
  border-radius: 16px;
  overflow: hidden;
  animation: ${fadeIn} 0.2s ease;
`;

export const PanelHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;
  background: ${props => props.theme.background};
  border-bottom: 1px solid ${props => props.theme.border};
`;

export const Title = styled.h4`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${props => props.theme.text};
  margin: 0;
`;

export const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.125rem;
  cursor: pointer;
  color: ${props => props.theme.textSoft};
  padding: 0;
  line-height: 1;
  
  &:hover {
    color: ${props => props.theme.error};
  }
`;

export const PanelBody = styled.div`
  padding: 1.25rem;
  max-height: 500px;
  overflow-y: auto;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: ${props => props.theme.borderLight};
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${props => props.theme.primary};
    border-radius: 3px;
  }
`;

// ─── Sugestão de Correção ───────────────────────────────────────────────────
export const SuggestionBox = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1rem;
  background: ${props => `${props.theme.primary}10`};
  border: 1px solid ${props => `${props.theme.primary}30`};
  border-radius: 12px;
  margin-bottom: 1rem;
  flex-wrap: wrap;
`;

export const SuggestionText = styled.div`
  font-size: 0.8rem;
  color: ${props => props.theme.textSoft};
  flex: 1;
  
  strong {
    color: ${props => props.theme.primary};
  }
`;

export const CorrectButton = styled.button`
  padding: 0.4rem 0.8rem;
  background: ${props => props.theme.primary};
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  
  &:hover:not(:disabled) {
    background: ${props => props.theme.primaryDark};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

// ─── Busca ──────────────────────────────────────────────────────────────────
export const SearchSection = styled.div`
  margin-bottom: 1.25rem;
`;

export const SearchLabel = styled.label`
  display: block;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: ${props => props.theme.textSoft};
  margin-bottom: 0.5rem;
`;

export const SearchInputWrapper = styled.div`
  display: flex;
  gap: 0.5rem;
`;

export const SearchInput = styled.input`
  flex: 1;
  padding: 0.6rem 0.8rem;
  background: ${props => props.theme.background};
  border: 1px solid ${props => props.theme.border};
  border-radius: 10px;
  color: ${props => props.theme.text};
  font-size: 0.875rem;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.primary};
  }
`;

export const SearchButton = styled.button`
  padding: 0.6rem 1.2rem;
  background: ${props => props.theme.primary};
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  
  &:hover:not(:disabled) {
    background: ${props => props.theme.primaryDark};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const ResetButton = styled.button`
  margin-top: 0.5rem;
  background: none;
  border: none;
  color: ${props => props.theme.textSoft};
  font-size: 0.7rem;
  cursor: pointer;
  text-decoration: underline;
  
  &:hover {
    color: ${props => props.theme.primary};
  }
`;

// ─── Loading ────────────────────────────────────────────────────────────────
export const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 2rem;
  color: ${props => props.theme.textSoft};
  font-size: 0.875rem;
`;

export const LoadingSpinner = styled.div`
  width: 20px;
  height: 20px;
  border: 2px solid ${props => props.theme.border};
  border-top-color: ${props => props.theme.primary};
  border-radius: 50%;
  animation: ${spin} 0.8s linear infinite;
`;

// ─── Erro ───────────────────────────────────────────────────────────────────
export const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 1.5rem;
  background: ${props => `${props.theme.error}10`};
  border-radius: 12px;
  text-align: center;
  
  span {
    color: ${props => props.theme.error};
    font-size: 0.875rem;
  }
`;

export const RetryButton = styled.button`
  padding: 0.4rem 1rem;
  background: ${props => props.theme.primary};
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.75rem;
  cursor: pointer;
`;

// ─── Resumo ─────────────────────────────────────────────────────────────────
export const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
  margin-bottom: 1.25rem;
`;

export const StatCard = styled.button`
  padding: 0.75rem;
  background: ${props => props.$selected ? props.theme.primary : props.theme.card};
  border: 1px solid ${props => props.$selected ? props.theme.primary : props.theme.border};
  border-radius: 12px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    transform: translateY(-2px);
    border-color: ${props => props.theme.primary};
  }
`;

export const StatValue = styled.div`
  font-size: 1rem;
  font-weight: 700;
  color: ${({ $type, theme }) =>
    $type === 'min' ? theme.success :
    $type === 'max' ? theme.error :
    theme.primary};
  margin-bottom: 0.25rem;
`;

export const StatLabel = styled.div`
  font-size: 0.6rem;
  font-weight: 600;
  text-transform: uppercase;
  color: ${props => props.theme.textSoft};
`;

// ─── Lista de Produtos ──────────────────────────────────────────────────────
export const ProductsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.25rem;
  max-height: 320px;
  overflow-y: auto;
`;

export const ProductItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.7rem;
  background: ${props => props.$selected ? `${props.theme.primary}15` : props.theme.card};
  border: 1px solid ${props => 
    props.$selected ? props.theme.primary :
    props.$isBest ? props.theme.success :
    props.theme.border};
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    transform: translateX(4px);
    border-color: ${props => props.theme.primary};
  }
`;

export const ProductImage = styled.div`
  width: 44px;
  height: 44px;
  flex-shrink: 0;
  background: ${props => props.theme.surface};
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
  
  span {
    font-size: 1.25rem;
  }
`;

export const ProductInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

export const ProductTitle = styled.div`
  font-size: 0.75rem;
  font-weight: 600;
  color: ${props => props.theme.text};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 0.2rem;
`;

export const StoreName = styled.div`
  font-size: 0.65rem;
  color: ${props => props.theme.textSoft};
`;

export const ProductPrice = styled.div`
  text-align: right;
  flex-shrink: 0;
`;

export const PriceValue = styled.div`
  font-size: 0.85rem;
  font-weight: 700;
  color: ${props => 
    props.$selected ? props.theme.primary :
    props.$isBest ? props.theme.success : 
    props.theme.text};
`;

export const BestBadge = styled.span`
  font-size: 0.55rem;
  font-weight: 600;
  padding: 0.125rem 0.35rem;
  background: ${props => props.theme.success};
  color: white;
  border-radius: 8px;
  white-space: nowrap;
  margin-left: 0.25rem;
`;

export const SelectedBadge = styled.span`
  font-size: 0.55rem;
  margin-left: 0.25rem;
  color: ${props => props.theme.primary};
`;

export const LinkButton = styled.a`
  display: flex;
  align-items: center;
  padding: 0.35rem;
  background: ${props => props.theme.hover};
  border-radius: 8px;
  color: ${props => props.theme.primary};
  transition: all 0.2s;
  flex-shrink: 0;
  
  &:hover {
    background: ${props => props.theme.primary};
    color: white;
  }
`;

// ─── Salvar ─────────────────────────────────────────────────────────────────
export const SaveArea = styled.div`
  padding-top: 0.75rem;
  border-top: 1px solid ${props => props.theme.border};
`;

export const SaveButton = styled.button`
  width: 100%;
  padding: 0.75rem;
  background: ${props => props.disabled ? props.theme.border : props.theme.success};
  color: ${props => props.disabled ? props.theme.textLight : 'white'};
  border: none;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.2s;
  
  &:hover:not(:disabled) {
    transform: translateY(-1px);
    filter: brightness(1.05);
  }
`;

// ─── Empty State ────────────────────────────────────────────────────────────
export const EmptyState = styled.div`
  text-align: center;
  padding: 2rem;
  
  span {
    font-size: 2rem;
    display: block;
    margin-bottom: 0.5rem;
  }
  
  h4 {
    font-size: 0.875rem;
    margin: 0 0 0.25rem 0;
    color: ${props => props.theme.text};
  }
  
  p {
    font-size: 0.75rem;
    color: ${props => props.theme.textSoft};
    margin-bottom: 1rem;
  }
`;