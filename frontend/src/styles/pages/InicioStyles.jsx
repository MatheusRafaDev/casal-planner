// InicioStyles.js
import styled, { keyframes } from 'styled-components';

// Animações
export const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
`;

export const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50%       { transform: scale(1.06); }
`;

export const shimmer = keyframes`
  0%, 100% { opacity: 0.45; }
  50%       { opacity: 0.9; }
`;

export const skeletonPulse = keyframes`
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.5; }
`;

// Container principal
export const Container = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: 0 0 calc(60px + env(safe-area-inset-bottom, 0px) + 1rem);
  animation: ${fadeUp} 0.4s ease both;
`;



// Section Title
export const SectionTitle = styled.h2`
  font-size: 0.9rem;
  font-weight: 700;
  color: ${p => p.theme.textSoft};
  text-transform: uppercase;
  letter-spacing: 0.09em;
  margin:  0.85rem 0 0.85rem;
`;

// Cards Grid
export const CardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 1.75rem;
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

export const StatCard = styled.div`
  background: ${p => p.theme.surface};
  border: 1px solid ${p => p.theme.border};
  border-radius: 1.25rem;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  transition: box-shadow 0.2s, transform 0.2s;
  
  &:hover {
    box-shadow: ${p => p.theme.shadowHover || '0 8px 24px rgba(0,0,0,0.15)'};
    transform: translateY(-2px);
  }
`;

export const StatIcon = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 0.75rem;
  background: ${p => p.bg};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${p => p.color};
  margin-bottom: 0.3rem;
`;

export const StatLabel = styled.span`
  font-size: 0.72rem;
  font-weight: 700;
  color: ${p => p.theme.textLight};
  text-transform: uppercase;
  letter-spacing: 0.06em;
`;

export const StatValue = styled.span`
  font-size: 1.35rem;
  font-weight: 800;
  color: ${p => p.theme.text};
  letter-spacing: -0.03em;
`;

export const StatSub = styled.span`
  font-size: 0.76rem;
  color: ${p => p.theme.textLight};
`;

// Categorias
export const CatGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  margin-bottom: 1.75rem;
`;

export const CatRow = styled.div`
  background: ${p => p.theme.surface};
  border: 1px solid ${p => p.theme.border};
  border-radius: 1rem;
  padding: 0.85rem 1rem;
  display: flex;
  align-items: center;
  gap: 0.85rem;
  transition: box-shadow 0.2s, transform 0.2s;
  
  &:hover {
    box-shadow: ${p => p.theme.shadowCard};
    transform: translateX(3px);
  }
`;

export const CatEmoji = styled.div`
  width: 38px;
  height: 38px;
  border-radius: 0.75rem;
  background: ${p => p.bg || p.theme.border};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  flex-shrink: 0;
`;

export const CatInfo = styled.div`
  flex: 1;
  min-width: 0;
  
  h3 {
    font-size: 0.87rem;
    font-weight: 700;
    color: ${p => p.theme.text};
    margin: 0 0 0.15rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  div {
    display: flex;
    gap: 0.6rem;
    flex-wrap: wrap;
  }
`;

export const CatChip = styled.span`
  font-size: 0.7rem;
  color: ${p => p.theme.textLight};
`;

export const CatTotal = styled.span`
  font-size: 0.92rem;
  font-weight: 800;
  color: ${p => p.theme.primary};
  white-space: nowrap;
`;

export const CatBar = styled.div`
  width: 100%;
  height: 3px;
  background: ${p => p.theme.border};
  border-radius: 999px;
  margin-top: 0.45rem;
  overflow: hidden;
`;

export const CatBarFill = styled.div`
  height: 100%;
  width: ${p => p.pct}%;
  background: ${p => p.theme.gradient};
  border-radius: 999px;
  transition: width 0.5s ease;
`;

// Progresso / Info Card
export const InfoCard = styled.div`
  background: ${p => p.theme.surface};
  border: 1px solid ${p => p.theme.border};
  border-radius: 1.25rem;
  padding: 1.25rem;
  margin-bottom: 1.75rem;
`;

export const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid ${p => p.theme.border};
  
  &:last-child {
    border-bottom: none;
  }
`;

export const InfoLabel = styled.span`
  font-size: 0.84rem;
  color: ${p => p.theme.textSoft};
`;

export const InfoValue = styled.span`
  font-size: 0.87rem;
  font-weight: 700;
  color: ${p => p.color || p.theme.text};
`;

export const ProgressBar = styled.div`
  width: 100%;
  height: 7px;
  background: ${p => p.theme.border};
  border-radius: 999px;
  margin-top: 0.75rem;
  overflow: hidden;
`;

export const ProgressFill = styled.div`
  height: 100%;
  width: ${p => Math.min(p.pct, 100)}%;
  background: ${p => p.theme.gradient};
  border-radius: 999px;
  transition: width 0.6s ease;
`;

export const ProgressLabel = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 0.4rem;
  font-size: 0.74rem;
  color: ${p => p.theme.textLight};
`;

// Ações Rápidas
export const QuickActions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  margin-bottom: 1.75rem;
`;

export const ActionCard = styled.button`
  display: flex;
  align-items: center;
  gap: 0.9rem;
  padding: 1rem 1.1rem;
  background: ${p => p.theme.surface};
  border: 1px solid ${p => p.theme.border};
  border-radius: 1.25rem;
  cursor: pointer;
  text-align: left;
  width: 100%;
  transition: all 0.2s;
  
  &:hover {
    border-color: ${p => p.theme.primary}60;
    box-shadow: 0 4px 16px ${p => p.theme.primary}15;
    transform: translateX(4px);
  }
`;

export const ActionIcon = styled.div`
  width: 42px;
  height: 42px;
  border-radius: 0.9rem;
  background: ${p => p.bg};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${p => p.color};
  flex-shrink: 0;
`;

export const ActionText = styled.div`
  flex: 1;
  
  h3 {
    font-size: 0.91rem;
    font-weight: 700;
    color: ${p => p.theme.text};
    margin: 0 0 0.1rem;
  }
  
  p {
    font-size: 0.77rem;
    color: ${p => p.theme.textLight};
    margin: 0;
  }
`;

// Skeleton Loading Components
export const SkeletonLine = styled.div`
  height: ${p => p.h || '0.85rem'};
  width: ${p => p.w || '100%'};
  border-radius: 0.5rem;
  background: ${p => p.theme.border};
  animation: ${shimmer} 1.4s ease infinite;
`;

// Skeleton para os cards de estatísticas
export const SkeletonStatCard = styled.div`
  background: ${p => p.theme.surface};
  border-radius: 1.25rem;
  padding: 1.25rem;
  border: 1px solid ${p => p.theme.border};
  animation: ${skeletonPulse} 1.5s ease-in-out infinite;
  
  &::before {
    content: '';
    display: block;
    width: 36px;
    height: 36px;
    border-radius: 0.75rem;
    background: ${p => p.theme.border};
    margin-bottom: 0.75rem;
  }
  
  &::after {
    content: '';
    display: block;
    width: 60%;
    height: 20px;
    border-radius: 0.5rem;
    background: ${p => p.theme.border};
    margin-top: 0.5rem;
  }
`;

// Skeleton para o card de progresso
export const SkeletonCard = styled.div`
  background: ${p => p.theme.surface};
  border-radius: 1.25rem;
  padding: 1.25rem;
  margin-bottom: 1.75rem;
  border: 1px solid ${p => p.theme.border};
  animation: ${skeletonPulse} 1.5s ease-in-out infinite;
  
  > div {
    margin-bottom: 1rem;
    
    &:first-child {
      width: 40%;
      height: 20px;
      background: ${p => p.theme.border};
      border-radius: 0.5rem;
    }
    
    &:nth-child(2) {
      width: 100%;
      height: 30px;
      background: ${p => p.theme.border};
      border-radius: 0.5rem;
    }
    
    &:nth-child(3) {
      width: 80%;
      height: 30px;
      background: ${p => p.theme.border};
      border-radius: 0.5rem;
    }
    
    &:last-child {
      width: 100%;
      height: 7px;
      background: ${p => p.theme.border};
      border-radius: 999px;
    }
  }
`;

// Skeleton para linhas de categoria
export const SkeletonCatRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 0.85rem 1rem;
  background: ${p => p.theme.surface};
  border: 1px solid ${p => p.theme.border};
  border-radius: 1rem;
  animation: ${skeletonPulse} 1.5s ease-in-out infinite;

  > div:first-child {
    width: 38px;
    height: 38px;
    background: ${p => p.theme.border};
    border-radius: 0.75rem;
    flex-shrink: 0;
  }

  > div:nth-child(2) {
    flex: 1;
    
    > div:first-child {
      width: 70%;
      height: 14px;
      background: ${p => p.theme.border};
      border-radius: 0.5rem;
      margin-bottom: 0.5rem;
    }
    
    > div:nth-child(2) {
      display: flex;
      gap: 0.6rem;
      margin-bottom: 0.5rem;
      
      span {
        width: 60px;
        height: 16px;
        background: ${p => p.theme.border};
        border-radius: 0.5rem;
      }
    }
    
    > div:last-child {
      width: 100%;
      height: 3px;
      background: ${p => p.theme.border};
      border-radius: 999px;
    }
  }

  > div:last-child {
    width: 70px;
    height: 20px;
    background: ${p => p.theme.border};
    border-radius: 0.5rem;
    flex-shrink: 0;
  }
`;

// Heart Animation
export const HeartAnim = styled.span`
  display: inline-flex;
  animation: ${pulse} 1.8s ease-in-out infinite;
  color: #F9A8D4;
`;

// Dica Card
export const TipCard = styled(InfoCard)`
  border-left: 4px solid ${p => p.theme.primary};
`;

export const TipContent = styled.div`
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
`;

export const TipIcon = styled.div`
  flex-shrink: 0;
  margin-top: 2px;
`;

export const TipTitle = styled.p`
  margin: 0;
  font-weight: 700;
  font-size: 0.87rem;
  color: ${p => p.theme.text};
`;

export const TipText = styled.p`
  margin: 0.2rem 0 0;
  font-size: 0.81rem;
  color: ${p => p.theme.textSoft};
  line-height: 1.5;
`;

// Adicione ao final do arquivo InicioStyles.js

export const ResumoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
  
  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

export const ResumoCard = styled.div`
  background: ${({ theme }) => theme.surface};
  border-radius: 16px;
  padding: 1rem;
  border: 1px solid ${({ theme }) => theme.border};
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadowHover};
  }
`;

export const PrioridadeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
  
  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

export const PrioridadeItem = styled.div`
  background: ${({ theme }) => theme.surface};
  border-radius: 12px;
  padding: 0.875rem;
  border-left: 3px solid ${({ color }) => color};
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateX(4px);
    box-shadow: ${({ theme }) => theme.shadowHover};
  }
`;

export const UrgencyBadge = styled.span`
  background: ${({ theme }) => `${theme.error}20`};
  color: ${({ theme }) => theme.error};
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  margin-left: 0.75rem;
  
  @media (max-width: 640px) {
    display: block;
    margin-left: 0;
    margin-top: 0.5rem;
    width: fit-content;
  }
`;