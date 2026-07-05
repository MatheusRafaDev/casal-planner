import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  Home,
  ClipboardList,
  Gift,
  User,
  Sun,
  Moon,
  LogOut,
  Settings,
} from 'lucide-react';
import logoIcon from '../assets/logo.png';

import {
  SidebarContainer,
  Brand,
  BrandLogo,
  BrandName,
  SidebarNav,
  NavItem,
  NavDivider,
  SidebarSummary,
  SummaryTitle,
  SummaryRow,
  SidebarFooterAction,
} from '../styles/components/SidebarStyles';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { usuario, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();

  if (!usuario) return null;

  const navItems = [
    { path: '/inicio', icon: Home, label: 'Início' },
    { path: '/planejamento', icon: ClipboardList, label: 'Planejamento' },
    { path: '/wishlist', icon: Gift, label: 'Presentes' },
    { path: '/perfil', icon: User, label: 'Perfil' },
  ];

  return (
    <SidebarContainer>
      {/* ─── Brand ───────────────────────── */}
      <Brand onClick={() => navigate('/inicio')}>
        <BrandLogo>
          <img src={logoIcon} alt="CasalPlanner" width={20} height={20} style={{ borderRadius: 4 }} />
        </BrandLogo>
        <BrandName>CasalPlanner</BrandName>
      </Brand>

      {/* ─── Navigation ──────────────────── */}
      <SidebarNav>
        {navItems.map(({ path, icon: Icon, label }) => {
          const active = location.pathname === path;
          return (
            <NavItem
              key={path}
              $active={active}
              onClick={() => navigate(path)}
            >
              <Icon size={20} />
              {label}
            </NavItem>
          );
        })}

        {/* Spacer to push footer actions down */}
        <div style={{ flex: 1 }} />

        <NavDivider />

        {/* Theme toggle */}
        <SidebarFooterAction onClick={toggleTheme}>
          {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          {isDarkMode ? 'Modo claro' : 'Modo escuro'}
        </SidebarFooterAction>

        {/* Logout */}
        <SidebarFooterAction $danger onClick={logout}>
          <LogOut size={18} />
          Sair
        </SidebarFooterAction>
      </SidebarNav>
    </SidebarContainer>
  );
};

export default Sidebar;
