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
      {items.map(({ path, icon: Icon, label }) => {
        const active = location.pathname === path;
        return (
          <NavItem
            key={path}
            onClick={() => navigate(path)}
            theme={theme}
            $active={active}
          >
            <NavIcon $active={active} theme={theme}>
              <Icon size={22} />
            </NavIcon>
            <NavLabel $active={active} theme={theme}>{label}</NavLabel>
          </NavItem>
        );
      })}
      <NavItem onClick={logout} theme={theme} $active={false}>
        <NavIcon $active={false} theme={theme}>
          <LogOut size={22} />
        </NavIcon>
        <NavLabel $active={false} theme={theme}>Sair</NavLabel>
      </NavItem>
    </NavBar>
  );
};

const NavBar = styled.nav`
  display: none;

  @media (max-width: 768px) {
    display: flex;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    /* Altura base + safe area do iPhone */
    height: calc(64px + env(safe-area-inset-bottom));
    background: ${p => p.theme.surface};
    border-top: 1px solid ${p => p.theme.border};
    box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.08);
    z-index: 80;
    /* Padding só para empurrar os itens, não a barra inteira */
    padding-bottom: env(safe-area-inset-bottom);
  }
`;

const NavItem = styled.button`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start; /* era center */
  padding-top: 10px;           /* espaço do topo fixo */
  gap: 3px;
  background: none;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;          /* era 6px */
    left: 50%;
    transform: translateX(-50%);
    width: ${p => p.$active ? '32px' : '0px'};
    height: 3px;
    background: ${p => p.theme.primary};
    border-radius: 0 0 3px 3px;
    transition: width 0.25s ease;
  }

  &:active { transform: scale(0.92); }
`;

const NavIcon = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${p => p.$active ? p.theme.primary : p.theme.textSoft};
  transition: color 0.2s;
`;

const NavLabel = styled.span`
  font-size: 10px;
  font-weight: ${p => p.$active ? '600' : '400'};
  color: ${p => p.$active ? p.theme.primary : p.theme.textSoft};
  transition: color 0.2s;
`;

export default BottomNav;
