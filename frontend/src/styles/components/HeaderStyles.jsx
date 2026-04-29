import styled from 'styled-components';

export const HeaderContainer = styled.header`
  position: sticky;
  top: 0;
  z-index: 90;
  background: ${props => props.theme.surface}cc;
  /* Remove backdrop-filter que causa problemas no iOS */
  border-bottom: 1px solid ${props => props.theme.border};
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  /* Melhorias para iOS */
  -webkit-backdrop-filter: none;
  backdrop-filter: none;
`;

export const HeaderContent = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 16px;
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: space-between;

  @media (max-width: 768px) {
    height: 60px;
    padding: 0 12px;
  }
`;

export const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  /* Melhora área de toque */
  padding: 8px 4px;
  -webkit-tap-highlight-color: transparent;

  svg {
    width: 28px;
    height: 28px;
    
    @media (max-width: 768px) {
      width: 24px;
      height: 24px;
    }
  }

  span {
    font-weight: 700;
    font-size: 18px;
    color: ${props => props.theme.text};

    @media (max-width: 480px) {
      font-size: 16px;
    }
    
    @media (max-width: 380px) {
      display: none;
    }
  }
`;

export const UserSection = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;

  @media (max-width: 480px) {
    gap: 8px;
  }
`;

export const ThemeButton = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: 1px solid ${props => props.theme.border};
  color: ${props => props.theme.textSoft};
  cursor: pointer;
  transition: all 0.2s;
  /* Melhorias para iOS */
  -webkit-tap-highlight-color: transparent;
  
  &:active {
    transform: scale(0.96);
  }

  &:hover {
    background: ${props => props.theme.primary}15;
    color: ${props => props.theme.primary};
    border-color: ${props => props.theme.primary};
  }
`;

export const Button = styled.button`
  padding: 8px 16px;
  height: 40px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid ${props => props.theme.border};
  display: flex;
  align-items: center;
  justify-content: center;
  /* Melhorias para iOS */
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  white-space: nowrap;
  
  &:active {
    transform: scale(0.97);
  }
  
  ${props => props.primary ? `
    background: ${props.theme.primary};
    border-color: ${props.theme.primary};
    color: white;

    &:hover {
      background: ${props.theme.primaryDark || props.theme.primary};
      border-color: ${props.theme.primaryDark || props.theme.primary};
    }
  ` : `
    background: transparent;
    color: ${props.theme.text};

    &:hover {
      background: ${props.theme.border};
    }
  `}

  @media (max-width: 480px) {
    padding: 6px 12px;
    font-size: 13px;
    height: 36px;
  }
`;

export const UserMenu = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 12px 4px 4px;
  border-radius: 30px;
  background: ${props => props.theme.border};
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  /* Melhorias para iOS */
  -webkit-tap-highlight-color: transparent;
  
  &:active {
    transform: scale(0.98);
  }

  &:hover {
    background: ${props => props.theme.primary}20;
  }
  
  @media (max-width: 480px) {
    padding: 3px 10px 3px 3px;
  }
`;

export const UserAvatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${props => props.theme.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 14px;
  
  @media (max-width: 480px) {
    width: 28px;
    height: 28px;
    font-size: 12px;
  }
`;

export const UserName = styled.span`
  font-size: 14px;
  font-weight: 500;
  color: ${props => props.theme.text};

  @media (max-width: 480px) {
    display: none;
  }
`;

export const DropdownMenu = styled.div`
  position: absolute;
  top: 50px;
  right: 0;
  width: 200px;
  background: ${props => props.theme.surface};
  border: 1px solid ${props => props.theme.border};
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 8px 0;
  z-index: 100;
  animation: fadeIn 0.2s ease;

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  /* Melhorias para iOS */
  -webkit-backdrop-filter: none;
  backdrop-filter: none;
`;

export const DropdownItem = styled.button`
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 12px 16px;
  border: none;
  background: transparent;
  color: ${props => props.danger ? props.theme.error : props.theme.text};
  cursor: pointer;
  transition: all 0.2s;
  /* Melhorias para iOS */
  -webkit-tap-highlight-color: transparent;
  
  &:active {
    background: ${props => props.danger ? props.theme.error + '20' : props.theme.primary + '20'};
  }

  &:hover {
    background: ${props => props.danger ? props.theme.error + '15' : props.theme.primary + '15'};
    color: ${props => props.danger ? props.theme.error : props.theme.primary};
  }

  svg {
    width: 16px;
    height: 16px;
  }

  span {
    font-size: 14px;
    font-weight: 500;
  }
`;

export const NavLinks = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-left: 2rem;

  @media (max-width: 768px) {
    display: none;
  }
`;

export const NavButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 8px;
  background: ${props => props.active ? props.theme.primary + '20' : 'transparent'};
  color: ${props => props.active ? props.theme.primary : props.theme.text};
  font-size: 0.95rem;
  font-weight: ${props => props.active ? '600' : '400'};
  cursor: pointer;
  transition: all 0.2s ease;
  /* Melhorias para iOS */
  -webkit-tap-highlight-color: transparent;
  
  &:active {
    transform: scale(0.96);
    background: ${props => props.active ? props.theme.primary + '30' : props.theme.backgroundHover};
  }

  &:hover {
    background: ${props => props.active ? props.theme.primary + '30' : props.theme.backgroundHover};
  }

  svg {
    stroke: ${props => props.active ? props.theme.primary : props.theme.text};
  }

  @media (max-width: 768px) {
    padding: 0.5rem;
    
    span {
      display: none;
    }
  }
`;