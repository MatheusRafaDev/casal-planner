// src/components/Button.jsx
import React from 'react';
import styled from 'styled-components';

const StyledButton = styled.button`
  padding: 1rem 2rem;
  border-radius: ${(props) => props.theme.radiusLg};
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  border: none;
  
  ${props => props.primary ? `
    background: ${props.theme.gradient};
    color: white;
    
    &:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: ${props.theme.shadowHover};
    }
  ` : `
    background: transparent;
    color: ${props.theme.text};
    border: 2px solid ${props.theme.border};
    
    &:hover:not(:disabled) {
      background: ${props.theme.hover};
      border-color: ${props.theme.primary};
    }
  `}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Button = ({ children, primary, onClick, disabled, theme, ...props }) => {
  return (
    <StyledButton 
      primary={primary} 
      onClick={onClick} 
      disabled={disabled}
      theme={theme}
      {...props}
    >
      {children}
    </StyledButton>
  );
};

export default Button;