import React from 'react';
import styled from 'styled-components';

const AddCategoriaCard = ({ onClick, theme }) => {
  return (
    <CardContainer onClick={onClick} theme={theme}>
      <AddIcon theme={theme}>➕</AddIcon>
      <AddText theme={theme}>Nova Categoria</AddText>
      <AddSubtext theme={theme}>Clique para criar</AddSubtext>
    </CardContainer>
  );
};

const CardContainer = styled.div`
  background: ${props => props.theme.card};
  border: 3px dashed ${props => props.theme.primary}80;
  border-radius: 24px;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  cursor: pointer;
  transition: all 0.3s;
  min-height: 300px;
  text-align: center;

  &:hover {
    background: ${props => props.theme.primary}20;
    border-color: ${props => props.theme.primary};
    transform: scale(1.02);
  }

  &:hover * {
    color: ${props => props.theme.primary} !important;
  }
`;

const AddIcon = styled.div`
  font-size: 3rem;
  background: ${props => props.theme.background};
  width: 80px;
  height: 80px;
  border-radius: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: 0.3s;
  color: ${props => props.theme.textSoft};

  ${CardContainer}:hover & {
    background: ${props => props.theme.card};
    transform: scale(1.1);
  }
`;

const AddText = styled.div`
  font-size: 1.2rem;
  font-weight: 600;
  color: ${props => props.theme.text};
`;

const AddSubtext = styled.div`
  color: ${props => props.theme.textSoft};
  font-size: 0.9rem;
`;

export default AddCategoriaCard;