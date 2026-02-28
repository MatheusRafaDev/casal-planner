import styled from 'styled-components';

export const FilterSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 1.5rem 0;
`;

export const FilterGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

export const FilterButtons = styled.div`
  display: flex;
  gap: 0.25rem;
`;

export const FilterButton = styled.button`
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
  transition: all 0.2s;
  border: none;
  cursor: pointer;

  ${(props) => {
    if (props.$active) {
      if (props.$filter === "vrva") {
        return `
          background: ${props.theme.vrva};
          color: white;
        `;
      }
      if (props.$filter === "normal") {
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

  &:hover {
    background: ${(props) => props.theme.borderLight};
    border-color: ${(props) => props.theme.primary};
    color: ${(props) => props.theme.primary};
  }
`;