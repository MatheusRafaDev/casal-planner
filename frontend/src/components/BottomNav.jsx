import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, ClipboardList, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  NavBar,
  NavInner,
  NavItem,
  NavIcon,
  NavLabel,
  ActiveDot
} from '../styles/components/BottomNavStyles';

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { usuario } = useAuth();
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
            <NavItem 
              key={path} 
              onClick={() => navigate(path)} 
              theme={theme} 
              $active={active}
            >
              <NavIcon $active={active} theme={theme}>
                <Icon size={22} />
              </NavIcon>
              <NavLabel $active={active} theme={theme}>
                {label}
              </NavLabel>
              {active && <ActiveDot theme={theme} />}
            </NavItem>
          );
        })}
      </NavInner>
    </NavBar>
  );
};

export default BottomNav;