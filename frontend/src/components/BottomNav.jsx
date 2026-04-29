import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { Home, ClipboardList, User, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { usuario, logout } = useAuth();
  const { theme } = useTheme();

  if (!usuario) return null;

  const items = [
    { path: '/inicio', icon: Home, label: 'Início' },
    { path: '/planejamento', icon: ClipboardList, label: 'Planejamento' },
    { path: '/perfil', icon: User, label: 'Perfil' },
  ];

  return (
    <NavBar theme={theme}>
      <NavInner>
        {items.map(({ path, icon: Icon, label }) => {
          const active = location.pathname === path;
          return (
            <NavItem key={path} onClick={() => navigate(path)} theme={theme} $active={active}>
              <NavIcon $active={active} theme={theme}>
                <Icon size={22} />
              </NavIcon>
              <NavLabel $active={active} theme={theme}>{label}</NavLabel>
              {active && <ActiveDot theme={theme} />}
            </NavItem>
          );
        })}
        <NavItem onClick={logout} theme={theme} $active={false}>
          <NavIcon $active={false} theme={theme}>
            <LogOut size={22} />
          </NavIcon>
          <NavLabel $active={false} theme={theme}>Sair</NavLabel>
        </NavItem>
      </NavInner>
    </NavBar>
  );
};

const NavBar = styled.nav`
  display: none;

  @media (max-width: 768px) {
    display: block;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    padding-bottom: env(safe-area-inset-bottom, 0px);
    background: ${p => p.theme.surface};
    border-top: 1px solid ${p => p.theme.border};
    box-shadow: 0 -2px 16px rgba(0, 0, 0, 0.08);
    z-index: 80;
  }
`;

const NavInner = styled.div`
  display: flex;
  height: 60px;
  align-items: stretch;
`;

const NavItem = styled.button`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px 4px 6px;
  transition: background 0.15s ease;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  position: relative;

  &:active {
    background: ${p => p.$active ? p.theme.primary + '12' : p.theme.border + '80'};
  }
`;

const NavIcon = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  color: ${p => p.$active ? p.theme.primary : p.theme.textSoft};
  transition: color 0.2s, transform 0.15s;
  transform: ${p => p.$active ? 'scale(1.08)' : 'scale(1)'};
`;

const NavLabel = styled.span`
  font-size: 10px;
  font-weight: ${p => p.$active ? '700' : '400'};
  color: ${p => p.$active ? p.theme.primary : p.theme.textSoft};
  transition: color 0.2s;
`;

const ActiveDot = styled.div`
  position: absolute;
  bottom: 4px;
  left: 50%;
  transform: translateX(-50%);
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: ${p => p.theme.primary};
`;

export default BottomNav;
