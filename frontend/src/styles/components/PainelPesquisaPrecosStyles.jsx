import styled, { keyframes } from 'styled-components';

const spin = keyframes`to { transform: rotate(360deg); }`;
const fadeSlide = keyframes`
  from { opacity: 0; transform: translateY(-8px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
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
  transition: all 0.2s;
  position: relative;

  &:hover {
    background: ${p => p.theme.primary}18;
    border-color: ${p => p.theme.primary};
    transform: translateY(-1px);
    box-shadow: 0 4px 12px ${p => p.theme.primary}20;
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
  animation: ${fadeSlide} 0.2s ease;
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
  transition: all 0.2s;

  &:hover {
    color: ${p => p.theme.error};
    background: ${p => `${p.theme.error}10`};
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
`;

// ========== Search ==========
export const SearchSection = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  background: ${p => p.theme.background};
  border: 1px solid ${p => p.theme.border};
  border-radius: 10px;
  padding: 0.2rem 0.2rem 0.2rem 0.75rem;
  transition: border-color 0.15s;

  &:focus-within {
    border-color: ${p => p.theme.primary};
  }
`;

export const SearchInput = styled.input`
  flex: 1;
  padding: 0.55rem 0;
  background: transparent;
  border: none;
  color: ${p => p.theme.text};
  font-size: 0.875rem;
  outline: none;

  &::placeholder {
    color: ${p => p.theme.textSoft};
  }

  &:disabled {
    color: ${p => p.theme.textSoft};
  }
`;

export const SearchButton = styled.button`
  padding: 0.5rem 1rem;
  background: ${p => p.theme.primary};
  color: white;
  border: none;
  border-radius: 7px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  white-space: nowrap;
  flex-shrink: 0;

  &:hover:not(:disabled) {
    filter: brightness(1.1);
  }
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
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
  color: ${p => p.theme.textSoft};
`;

export const LoadingSpinner = styled.div`
  width: 32px;
  height: 32px;
  border: 3px solid ${p => p.theme.border};
  border-top-color: ${p => p.theme.primary};
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
  background: ${p => p.theme.primary};
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;

  &:hover { background: ${p => p.theme.primaryDark}; }
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
  background: ${p => p.theme.card};
  border: 1px solid ${p => p.theme.border};
  border-radius: 10px;
  text-align: center;
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    transform: translateY(-2px);
    border-color: ${p => p.theme.primary};
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
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

// ========== Product List ==========
export const ProductsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-height: 500px;
  overflow-y: auto;
  padding-right: 0.25rem;

  &::-webkit-scrollbar { width: 4px; }
`;

// ========== Product Item ==========
export const ProductItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: ${p => p.$selected ? `${p.theme.primary}08` : p.theme.card};
  border: 1.5px solid ${p => p.$selected ? p.theme.primary : p.theme.border};
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;

  &:hover {
    transform: translateX(4px);
    border-color: ${p => p.theme.primary};
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }
`;

// ========== Product Image (Melhorado) ==========
export const ProductImageContainer = styled.div`
  width: 70px;
  height: 70px;
  flex-shrink: 0;
  background: ${p => p.theme.background};
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
  cursor: ${p => p.$hasImage ? 'pointer' : 'default'};
  transition: all 0.2s;
  border: 1px solid ${p => p.theme.border};

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
  transition: transform 0.3s ease;
  background: white;
  padding: 4px;
`;

export const ProductImagePlaceholder = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${p => p.theme.hover};
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
  transition: all 0.2s;
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
  transition: opacity 0.2s;
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
  animation: ${fadeSlide} 0.2s ease;
`;

export const ImageModalContent = styled.div`
  max-width: 90vw;
  max-height: 90vh;
  position: relative;
  cursor: default;
  animation: ${pulse} 0.3s ease;
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
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: scale(1.1);
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
  color: ${p => p.theme.text};
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
  color: ${p => p.theme.textSoft};
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
  color: ${p => p.theme.primary};
  margin-top: 0.15rem;
  display: flex;
  align-items: center;
  gap: 0.3rem;
`;

export const BrandLogo = styled.img`
  width: 12px;
  height: 12px;
  object-fit: contain;
  border-radius: 2px;
`;

export const RatingInfo = styled.div`
  font-size: 0.55rem;
  color: ${p => p.theme.textSoft};
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
  color: ${p => p.$selected ? p.theme.primary : p.theme.text};
`;

export const OldPrice = styled.div`
  font-size: 0.6rem;
  color: ${p => p.theme.textSoft};
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
  background: ${p => p.theme.hover};
  border-radius: 6px;
  color: ${p => p.theme.primary};
  transition: all 0.2s;
  flex-shrink: 0;

  &:hover {
    background: ${p => p.theme.primary};
    color: white;
    transform: scale(1.05);
  }
`;