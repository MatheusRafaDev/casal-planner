import styled, { keyframes } from 'styled-components';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

export const DashboardContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1rem;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  animation: ${fadeIn} 0.5s ease-out;

  @media (min-width: 768px) {
    padding: 2rem;
    gap: 2rem;
  }
`;

export const HeaderSection = styled.header`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  h1 {
    font-size: 1.8rem;
    font-weight: 800;
    margin: 0;
    background: ${({ theme }) => theme.gradient};
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    letter-spacing: -0.5px;
  }

  p {
    font-size: 0.95rem;
    color: ${({ theme }) => theme.textLight};
    margin: 0;
  }

  @media (min-width: 768px) {
    h1 {
      font-size: 2.5rem;
    }
    p {
      font-size: 1.1rem;
    }
  }
`;

export const GridCards = styled.div`
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 1rem;

  @media (min-width: 640px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (min-width: 1024px) {
    grid-template-columns: repeat(4, 1fr);
  }
`;

export const GlassCard = styled.div`
  background: ${({ theme, $highlight }) => 
    $highlight ? theme.gradientSoft : theme.surface};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: ${({ theme }) => theme.radiusLg};
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  position: relative;
  overflow: hidden;
  box-shadow: ${({ theme }) => theme.shadowCard};
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadowHover};
  }

  /* Glassmorphism effect if supported by browser */
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
`;

export const CardIconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${({ theme, $color }) => $color ? `${$color}20` : theme.primaryLight};
  color: ${({ theme, $color }) => $color || theme.primary};
  margin-bottom: 0.5rem;
`;

export const CardTitle = styled.h3`
  font-size: 0.85rem;
  font-weight: 600;
  color: ${({ theme }) => theme.textSoft};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0;
`;

export const CardValue = styled.div`
  font-size: 1.8rem;
  font-weight: 800;
  color: ${({ theme, $color }) => $color || theme.text};
  margin: 0;
`;

export const CardSubtext = styled.span`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.textLight};
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

export const SectionTitle = styled.h2`
  font-size: 1.3rem;
  font-weight: 700;
  color: ${({ theme }) => theme.text};
  margin: 1.5rem 0 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: ${({ theme }) => theme.border};
    margin-left: 1rem;
  }
`;

export const ProgressSection = styled.div`
  background: ${({ theme }) => theme.surface};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: ${({ theme }) => theme.radiusLg};
  padding: 1.5rem;
  box-shadow: ${({ theme }) => theme.shadowCard};
`;

export const ProgressBarWrapper = styled.div`
  width: 100%;
  height: 12px;
  background: ${({ theme }) => theme.surface3};
  border-radius: ${({ theme }) => theme.radiusFull};
  overflow: hidden;
  margin: 1rem 0 0.5rem 0;
`;

export const ProgressFill = styled.div`
  height: 100%;
  width: ${({ $pct }) => $pct}%;
  background: ${({ theme, $color }) => $color || theme.gradient};
  border-radius: ${({ theme }) => theme.radiusFull};
  transition: width 1s cubic-bezier(0.4, 0, 0.2, 1);
`;

export const ProgressLabels = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  font-weight: 500;
  color: ${({ theme }) => theme.textLight};
`;

export const CategoryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 1rem;

  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
  @media (min-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

export const CategoryCard = styled.div`
  background: ${({ theme }) => theme.surface};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: ${({ theme }) => theme.radius};
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  transition: transform 0.2s ease, border-color 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    border-color: ${({ theme }) => theme.primary};
  }
`;

export const CategoryHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  h4 {
    font-size: 1rem;
    font-weight: 600;
    color: ${({ theme }) => theme.text};
    margin: 0;
  }

  span {
    font-size: 0.85rem;
    font-weight: 600;
    color: ${({ theme }) => theme.text};
    background: ${({ theme }) => theme.surface3};
    padding: 0.2rem 0.5rem;
    border-radius: ${({ theme }) => theme.radiusSm};
  }
`;

export const CategoryStats = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  color: ${({ theme }) => theme.textLight};
  
  strong {
    color: ${({ theme }) => theme.textDim};
  }
`;

export const PriorityWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  
  @media (min-width: 768px) {
    flex-direction: row;
  }
`;

export const PriorityCard = styled(GlassCard)`
  flex: 1;
  border-top: 4px solid ${({ theme, $borderColor }) => $borderColor || theme.border};
`;

/* Loading Skeleton Animations */
const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
`;

export const SkeletonBox = styled.div`
  background: ${({ theme }) => theme.skeleton};
  border-radius: ${({ theme, $radius }) => $radius || theme.radius};
  height: ${({ $height }) => $height || '20px'};
  width: ${({ $width }) => $width || '100%'};
  animation: ${pulse} 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
`;
