import styled from 'styled-components';

export const HeaderContainer = styled.header`
  position: sticky;
  top: 0;
  z-index: 90;
  background: ${props => props.theme.surface}cc;
  backdrop-filter: blur(8px);
  border-bottom: 1px solid ${props => props.theme.border};
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
`;

export const HeaderContent = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: space-between;

  @media (max-width: 768px) {
    height: 60px;
    padding: 0 15px;
  }
`;

export const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;

  .icon {
    width: 40px;
    height: 40px;
    background: ${props => props.theme.primary};
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;

    svg {
      width: 20px;
      height: 20px;
      color: white;
    }
  }

  span {
    font-weight: 700;
    font-size: 20px;
    color: ${props => props.theme.text};

    @media (max-width: 480px) {
      font-size: 18px;
    }
  }
`;

export const UserSection = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
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

  &:hover {
    background: ${props => props.theme.primary}20;
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