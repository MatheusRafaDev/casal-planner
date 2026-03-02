import styled from 'styled-components';

export const InicioContainer = styled.div`
  min-height: 100vh;
  background: ${props => props.theme.background};
  padding: 2rem;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

export const WelcomeSection = styled.div`
  margin-bottom: 2rem;
`;

export const WelcomeTitle = styled.h2`
  font-size: 1.75rem;
  font-weight: 700;
  color: ${props => props.theme.text};
  margin: 0 0 0.5rem 0;

  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

export const WelcomeSubtitle = styled.p`
  font-size: 1rem;
  color: ${props => props.theme.textSoft};
  margin: 0;
`;

export const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 1rem;

  p {
    color: ${props => props.theme.textSoft};
    font-size: 0.875rem;
    margin: 0;
  }
`;

export const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 3px solid ${props => props.theme.border};
  border-top-color: ${props => props.theme.primary};
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

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
    gap: 1rem;
  }
`;

export const DragCardWrapper = styled.div`
  transition: all 0.3s ease;
  opacity: ${props => (props.$isDragging ? 0.5 : 1)};
  transform: ${props => props.$isDragOver ? 'scale(1.02)' : 'scale(1)'};
  border: ${props => props.$isDragOver ? `2px dashed ${props.theme.primary}` : 'none'};
  border-radius: 1.25rem;
  cursor: grab;
  height: 100%;

  &:active {
    cursor: grabbing;
  }

  &::before {
    content: ${props => props.$isDragOver ? '"Mover para cá"' : '""'};
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: ${props => props.theme.primary};
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 2rem;
    font-size: 0.875rem;
    font-weight: 600;
    z-index: 10;
    pointer-events: none;
    opacity: ${props => props.$isDragOver ? 1 : 0};
    transition: opacity 0.2s;
    box-shadow: 0 4px 12px ${props => `${props.theme.primary}40`};
  }
`;