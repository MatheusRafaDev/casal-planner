// src/styles/pages/PlanejamentoStyles.js

import styled, { keyframes } from 'styled-components';

// Animações
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

// Container principal — SEM animation aqui, era a causa do scroll reset
export const PlanejamentoContainer = styled.div`
  min-height: 100vh;
  min-height: 100dvh;
  background: ${props => props.theme?.background || "#f8fafc"};
  padding: 1rem;

  @media (max-width: 768px) {
    padding: 0.75rem;
  }
`;

// Seção de boas-vindas
export const WelcomeSection = styled.div`
  margin-bottom: 1.5rem;

  @media (max-width: 768px) {
    margin-bottom: 1rem;
  }
`;

export const WelcomeTitle = styled.h2`
  font-size: 1.75rem;
  font-weight: 700;
  color: ${props => props.theme?.text || "#111"};
  margin: 0 0 0.25rem 0;

  @media (max-width: 768px) {
    font-size: 1.35rem;
  }

  @media (max-width: 480px) {
    font-size: 1.2rem;
  }
`;

export const WelcomeSubtitle = styled.p`
  font-size: 1rem;
  color: ${props => props.theme?.textSoft || "#666"};
  margin: 0;

  @media (max-width: 480px) {
    font-size: 0.875rem;
  }
`;

// Loading
export const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 1rem;

  p {
    color: ${props => props.theme?.textSoft || "#666"};
    font-size: 0.875rem;
    margin: 0;
  }
`;

export const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 3px solid ${props => props.theme?.border || "#e5e7eb"};
  border-top-color: ${props => props.theme?.primary || "#3b82f6"};
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

// Grid de categorias
export const CategoriesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  margin: 2rem 0;
  align-items: stretch;

  @media (max-width: 1200px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.25rem;
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 0.75rem;
    margin: 1rem 0;
  }
`;

// Drag wrapper
export const DragCardWrapper = styled.div`
  transition: all 0.3s ease;
  opacity: ${props => (props.$isDragging ? 0.5 : 1)};
  transform: ${props => props.$isDragOver ? 'scale(1.02)' : 'scale(1)'};
  border: ${props => props.$isDragOver ? `2px dashed ${props.theme?.primary || "#3b82f6"}` : 'none'};
  border-radius: 1.25rem;
  cursor: grab;
  height: 100%;
  position: relative;

  &:active { cursor: grabbing; }
`;

// Empty State
export const EmptyStateContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  min-height: 50vh;
  border-radius: 1.5rem;
  margin: 2rem auto;
  max-width: 450px;

  @media (max-width: 768px) {
    margin: 1rem;
    min-height: 40vh;
    padding: 1.5rem 1rem;
  }
`;

export const EmptyStateIcon = styled.div`
  font-size: 5rem;
  margin-bottom: 1.5rem;
  opacity: 0.7;

  @media (max-width: 768px) {
    font-size: 3.5rem;
    margin-bottom: 1rem;
  }
`;

export const EmptyStateTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 600;
  color: ${props => props.theme?.text || "#111"};
  margin: 0 0 0.75rem 0;

  @media (max-width: 768px) {
    font-size: 1.15rem;
  }
`;

export const EmptyStateDescription = styled.p`
  font-size: 0.95rem;
  color: ${props => props.theme?.textSoft || "#666"};
  margin: 0 0 1.5rem 0;
  line-height: 1.5;
  max-width: 350px;
`;

export const EmptyStateTips = styled.div`
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid ${props => props.theme?.border || "#e5e7eb"};
  width: 100%;

  p {
    font-size: 0.8rem;
    color: ${props => props.theme?.textSoft || "#666"};
    margin: 0 0 0.5rem 0;
    opacity: 0.7;
  }

  div {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.75rem;

    span {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      font-size: 0.75rem;
      padding: 0.25rem 0.75rem;
      background: ${props => props.theme?.background || "#fff"};
      border-radius: 2rem;
      color: ${props => props.theme?.textSoft || "#666"};
    }
  }
`;

export const EmptyStateButton = styled.button`
  margin-top: 1.5rem;
  padding: 0.75rem 1.5rem;
  background: ${props => props.theme?.primary || "#3b82f6"};
  color: white;
  border: none;
  border-radius: 2rem;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  min-height: 48px;

  &:hover {
    transform: translateY(-2px);
    filter: brightness(1.05);
  }

  &::before {
    content: '+ ';
    font-size: 1.1rem;
    font-weight: 700;
  }
`;

// Skeleton Components
export const SkeletonLine = styled.div`
  height: ${p => p.h || '0.85rem'};
  width: ${p => p.w || '100%'};
  border-radius: 0.5rem;
  background: ${p => p.theme?.border || "#e5e7eb"};
  animation: ${shimmer} 1.4s ease infinite;
`;

export const SkeletonCategoryCard = styled.div`
  background: ${p => p.theme?.surface || "#fff"};
  border: 1px solid ${p => p.theme?.border || "#e5e7eb"};
  border-radius: 1.25rem;
  padding: 1rem;
  animation: ${skeletonPulse} 1.5s ease-in-out infinite;
  
  > div:first-child {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1rem;
    
    > div:first-child {
      width: 48px;
      height: 48px;
      background: ${p => p.theme?.border || "#e5e7eb"};
      border-radius: 0.75rem;
    }
    
    > div:last-child {
      flex: 1;
      
      > div:first-child {
        width: 70%;
        height: 16px;
        background: ${p => p.theme?.border || "#e5e7eb"};
        border-radius: 0.5rem;
        margin-bottom: 0.5rem;
      }
      
      > div:last-child {
        width: 40%;
        height: 12px;
        background: ${p => p.theme?.border || "#e5e7eb"};
        border-radius: 0.5rem;
      }
    }
  }
  
  > div:last-child {
    margin-top: 0.75rem;
    
    > div:first-child {
      width: 100%;
      height: 8px;
      background: ${p => p.theme?.border || "#e5e7eb"};
      border-radius: 0.5rem;
      margin-bottom: 0.5rem;
    }
    
    > div:last-child {
      display: flex;
      justify-content: space-between;
      
      > div {
        width: 30%;
        height: 10px;
        background: ${p => p.theme?.border || "#e5e7eb"};
        border-radius: 0.5rem;
      }
    }
  }
`;

export const SkeletonCategoriesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  margin: 2rem 0;

  @media (max-width: 1200px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.25rem;
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 0.75rem;
    margin: 1rem 0;
  }
`;

export const SkeletonWelcomeSection = styled.div`
  margin-bottom: 1.5rem;
  
  > div:first-child {
    width: 40%;
    height: 28px;
    background: ${p => p.theme?.border || "#e5e7eb"};
    border-radius: 0.5rem;
    margin-bottom: 0.5rem;
    animation: ${skeletonPulse} 1.5s ease-in-out infinite;
  }
  
  > div:last-child {
    width: 60%;
    height: 16px;
    background: ${p => p.theme?.border || "#e5e7eb"};
    border-radius: 0.5rem;
    animation: ${skeletonPulse} 1.5s ease-in-out infinite;
  }
`;

export const SortClearButton = styled.button`
  font-size: 0.7rem;
  padding: 0.3rem 0.6rem;
  border-radius: 0.5rem;
  border: 1px solid ${props => props.theme?.border || "#e5e7eb"};
  background: ${props => props.theme?.surface || "#f8fafc"};
  color: ${props => props.theme?.textSoft || "#666"};
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  margin-left: auto;

  &:hover {
    background: ${props => props.theme?.border || "#e5e7eb"};
    color: ${props => props.theme?.text || "#111"};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
  }
`;