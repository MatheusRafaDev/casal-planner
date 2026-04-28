import styled from 'styled-components';

export const FilterSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 1.5rem 0;
  gap: 0.5rem;
  flex-wrap: wrap;

  @media (max-width: 640px) {
    margin: 0.875rem 0;
    gap: 0.5rem;
    flex-direction: column;
    align-items: stretch;
  }
`;

export const FilterGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;

  @media (max-width: 640px) {
    justify-content: space-between;
    gap: 0.375rem;
  }
`;

export const FilterButtons = styled.div`
  display: flex;
  gap: 0.25rem;

  @media (max-width: 640px) {
    flex: 1;
    gap: 0.25rem;
  }
`;

export const FilterButton = styled.button`
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
  transition: all 0.2s;
  border: none;
  cursor: pointer;
  min-height: 36px;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;

  @media (max-width: 640px) {
    flex: 1;
    text-align: center;
    min-height: 40px;
    font-size: 0.78rem;
    border-radius: 9999px;
    padding: 0.4rem 0.5rem;
  }

  ${(props) => {
    if (props.$active) {
      if (props.$filter === 'vrva') {
        return `
          background: ${props.theme.vrva};
          color: white;
        `;
      }
      if (props.$filter === 'normal') {
        return `
          background: ${props.theme.normal};
          color: white;
        `;
      }
      return `
        background: ${props.theme.primary};
        color: white;
      `;
    }
    return `
      background: ${props.theme.border};
      color: ${props.theme.textSoft};
      &:hover {
        background: ${props.theme.borderLight};
      }
    `;
  }}
`;

export const AddCategoryButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  padding: 0.4rem 0.75rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  background: transparent;
  border: 1px solid ${(props) => props.theme.border};
  color: ${(props) => props.theme.text};
  cursor: pointer;
  transition: all 0.2s;
  min-height: 40px;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  white-space: nowrap;

  &:hover {
    background: ${(props) => props.theme.borderLight};
    border-color: ${(props) => props.theme.primary};
    color: ${(props) => props.theme.primary};
  }

  @media (max-width: 640px) {
    width: 100%;
    min-height: 44px;
    font-size: 0.875rem;
    border-radius: 0.75rem;
    background: ${(props) => props.theme.primary}12;
    border-color: ${(props) => props.theme.primary}40;
    color: ${(props) => props.theme.primary};
    font-weight: 600;
  }
`;
