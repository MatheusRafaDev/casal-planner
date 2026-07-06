import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, ClipboardList, User, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  NavBar,
  NavInner,
  NavItem,
  NavIcon,
  NavLabel,
  ActiveDot,
  FabButton
} from '../styles/components/BottomNavStyles';

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { usuario } = useAuth();
  const { theme } = useTheme();

  if (!usuario) return null;

  // Items split around the FAB
  const leftItems = [
    { path: '/inicio', icon: Home, label: 'Início' },
    { path: '/planejamento', icon: ClipboardList, label: 'Planejamento' },
  ];

  const rightItems = [
    { path: '/perfil', icon: User, label: 'Perfil' },
  ];

  const renderItem = ({ path, icon: Icon, label }) => {
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
  };

  return (
    <NavBar theme={theme}>
      <NavInner>
        {leftItems.map(renderItem)}

        {/* FAB central */}
        <FabButton theme={theme} onClick={() => {
          navigate('/planejamento?add=true');
        }}>
          <Plus size={24} />
        </FabButton>

        {rightItems.map(renderItem)}
      </NavInner>
    </NavBar>
  );
};

export default BottomNav;