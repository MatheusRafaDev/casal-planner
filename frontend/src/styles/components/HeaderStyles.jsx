import styled from 'styled-components';

export const HeaderContainer = styled.header`
  position: sticky;
  top: 0;
  z-index: 90;
  /* safe-area-inset-top cobre notch/dynamic island no iPhone */
  padding-top: env(safe-area-inset-top, 0px);
  background: ${props => props.theme.surface};
  border-bottom: 1px solid ${props => props.theme.border};
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  /* Remove backdrop-filter — causa bugs no Safari iOS */
  -webkit-backdrop-filter: none;
  backdrop-filter: none;
`;

export const HeaderContent = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 16px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;

  @media (max-width: 768px) {
    height: 52px;
    padding: 0 12px;
  }
`;

export const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 8px 4px;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  /* Área mínima de toque HIG Apple: 44px */
  min-height: 44px;

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

    @media (max-width: 480px) { font-size: 16px; }
    @media (max-width: 380px) { display: none; }
  }
`;

export const UserSection = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;

  @media (max-width: 480px) { gap: 8px; }
`;

export const ThemeButton = styled.button`
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: 1px solid ${props => props.theme.border};
  color: ${props => props.theme.textSoft};
  cursor: pointer;
  transition: all 0.2s;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;

  &:active { transform: scale(0.93); }

  &:hover {
    background: ${props => props.theme.primary}15;
    color: ${props => props.theme.primary};
    border-color: ${props => props.theme.primary};
  }
`;

export const Button = styled.button`
  padding: 0 16px;
  height: 44px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid ${props => props.theme.border};
  display: flex;
  align-items: center;
  justify-content: center;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  white-space: nowrap;

  &:active { transform: scale(0.96); }

  ${props => props.primary ? `
    background: ${props.theme.primary};
    border-color: ${props.theme.primary};
    color: white;
    &:hover { background: ${props.theme.primaryDark || props.theme.primary}; }
  ` : `
    background: transparent;
    color: ${props.theme.text};
    &:hover { background: ${props.theme.border}; }
  `}

  @media (max-width: 480px) {
    padding: 0 12px;
    font-size: 13px;
    height: 40px;
  }
`;

export const UserMenu = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px 6px 6px;
  min-height: 44px;
  border-radius: 30px;
  background: ${props => props.theme.border};
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;

  &:active { transform: scale(0.97); }
  &:hover  { background: ${props => props.theme.primary}20; }

  @media (max-width: 480px) {
    padding: 4px 10px 4px 4px;
  }
`;

export const UserAvatar = styled.div`
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: ${props => props.theme.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 13px;

  @media (max-width: 480px) {
    width: 30px;
    height: 30px;
    font-size: 12px;
  }
`;

export const UserName = styled.span`
  font-size: 14px;
  font-weight: 500;
  color: ${props => props.theme.text};

  @media (max-width: 480px) { display: none; }
`;

export const DropdownMenu = styled.div`
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 210px;
  background: ${props => props.theme.surface};
  border: 1px solid ${props => props.theme.border};
  border-radius: 14px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  padding: 6px 0;
  z-index: 100;
  animation: dropIn 0.18s ease;
  -webkit-backdrop-filter: none;
  backdrop-filter: none;

  @keyframes dropIn {
    from { opacity: 0; transform: translateY(-8px) scale(0.97); }
    to   { opacity: 1; transform: translateY(0)    scale(1);    }
  }
`;

export const DropdownItem = styled.button`
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 13px 16px;
  min-height: 44px;
  border: none;
  background: transparent;
  color: ${props => props.danger ? props.theme.error : props.theme.text};
  cursor: pointer;
  transition: background 0.15s;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;

  &:active {
    background: ${props => props.danger ? props.theme.error + '18' : props.theme.primary + '18'};
  }
  &:hover {
    background: ${props => props.danger ? props.theme.error + '12' : props.theme.primary + '12'};
    color: ${props => props.danger ? props.theme.error : props.theme.primary};
  }

  svg { width: 16px; height: 16px; flex-shrink: 0; }
  span { font-size: 14px; font-weight: 500; }
`;

export const NavLinks = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-left: 2rem;

  @media (max-width: 768px) { display: none; }
`;

export const NavButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  min-height: 44px;
  border: none;
  border-radius: 10px;
  background: ${props => props.active ? props.theme.primary + '20' : 'transparent'};
  color: ${props => props.active ? props.theme.primary : props.theme.text};
  font-size: 0.95rem;
  font-weight: ${props => props.active ? '600' : '400'};
  cursor: pointer;
  transition: all 0.2s ease;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;

  &:active { transform: scale(0.96); }
  &:hover  { background: ${props => props.active ? props.theme.primary + '30' : props.theme.hover || props.theme.border}; }

  svg { stroke: ${props => props.active ? props.theme.primary : props.theme.text}; }
`;
