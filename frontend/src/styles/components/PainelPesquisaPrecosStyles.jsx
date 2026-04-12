import styled, { keyframes } from 'styled-components';

const spin = keyframes`to { transform: rotate(360deg); }`;
const fadeSlide = keyframes`
  from { opacity: 0; transform: translateY(-8px); }
  to   { opacity: 1; transform: translateY(0); }
`;

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
  transition: all 0.2s;

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
  font-size: 1.25rem;
  cursor: pointer;
  color: ${p => p.theme.textSoft};
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;

  &:hover {
    color: ${p => p.theme.error};
    background: ${p => `${p.theme.error}10`};
  }
`;

export const PanelBody = styled.div`
  padding: 1rem;
  max-height: 560px;
  overflow-y: auto;

  &::-webkit-scrollbar { width: 6px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb {
    background: ${p => p.theme.border};
    border-radius: 3px;
  }
`;

export const SearchSection = styled.div`
  margin-bottom: 1rem;
`;

export const SearchInput = styled.input`
  width: 100%;
  padding: 0.6rem 0.875rem;
  background: ${p => p.theme.background};
  border: 1px solid ${p => p.theme.border};
  border-radius: 10px;
  color: ${p => p.theme.text};
  font-size: 0.875rem;
  margin-bottom: 0.5rem;

  &:disabled {
    background: ${p => p.theme.surface};
    color: ${p => p.theme.textSoft};
  }
`;

export const SearchButton = styled.button`
  width: 100%;
  padding: 0.6rem 1rem;
  background: ${p => p.theme.primary};
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;

  &:hover:not(:disabled) {
    background: ${p => p.theme.primaryDark};
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 2rem;
  color: ${p => p.theme.textSoft};
`;

export const LoadingSpinner = styled.div`
  width: 20px;
  height: 20px;
  border: 2px solid ${p => p.theme.border};
  border-top-color: ${p => p.theme.primary};
  border-radius: 50%;
  animation: ${spin} 0.7s linear infinite;
`;

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
  background: ${p => p.theme.primary};
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;

  &:hover { background: ${p => p.theme.primaryDark}; }
`;

export const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

export const StatCard = styled.div`
  padding: 0.5rem;
  background: ${p => p.theme.card};
  border: 1px solid ${p => p.theme.border};
  border-radius: 10px;
  text-align: center;
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    transform: translateY(-1px);
    border-color: ${p => p.theme.primary};
  }
`;

export const StatValue = styled.div`
  font-size: 1rem;
  font-weight: 700;
  color: ${p => p.theme.primary};
  margin-bottom: 0.15rem;
`;

export const StatLabel = styled.div`
  font-size: 0.6rem;
  font-weight: 600;
  text-transform: uppercase;
  color: ${p => p.theme.textSoft};
`;

export const ProductsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  max-height: 350px;
  overflow-y: auto;
`;

export const ProductItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background: ${p => p.$selected ? `${p.theme.primary}10` : p.theme.card};
  border: 1.5px solid ${p => p.$selected ? p.theme.primary : p.theme.border};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    transform: translateX(2px);
    border-color: ${p => p.theme.primary};
  }
`;

export const ProductImage = styled.div`
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  background: ${p => p.theme.surface};
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
  span { font-size: 1.2rem; }
`;

export const ProductInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

export const ProductTitle = styled.div`
  font-size: 0.75rem;
  font-weight: 600;
  color: ${p => p.theme.text};
  margin-bottom: 0.15rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const StoreInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.3rem;
  flex-wrap: wrap;
`;

export const StoreName = styled.span`
  font-size: 0.6rem;
  color: ${p => p.theme.textSoft};
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

export const UsedBadge = styled.span`
  font-size: 0.55rem;
  font-weight: 600;
  padding: 0.1rem 0.35rem;
  background: ${p => `${p.theme.error}15`};
  color: ${p => p.theme.error};
  border-radius: 4px;
  white-space: nowrap;
`;

export const BrandInfo = styled.div`
  font-size: 0.6rem;
  color: ${p => p.theme.primary};
  margin-top: 0.15rem;
  
  strong {
    font-weight: 700;
  }
`;

export const ProductMeta = styled.div`
  text-align: right;
  flex-shrink: 0;
`;

export const PriceValue = styled.div`
  font-size: 0.9rem;
  font-weight: 700;
  color: ${p => p.$selected ? p.theme.primary : p.theme.text};
`;

export const LinkButton = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: ${p => p.theme.hover};
  border-radius: 5px;
  color: ${p => p.theme.primary};
  transition: all 0.15s;
  flex-shrink: 0;

  &:hover {
    background: ${p => p.theme.primary};
    color: white;
  }
`;