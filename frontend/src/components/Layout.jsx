import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { usuario, logout } = useAuth();
  const { isDarkMode, toggleTheme, theme } = useTheme();
  const [menuAberto, setMenuAberto] = useState(false);

  const menuItems = [
    { path: '/inicio', icon: '🏠', label: 'Início' },
    { path: '/perfil', icon: '👤', label: 'Perfil' },
  ];

  const handleNavigation = (path) => {
    navigate(path);
    setMenuAberto(false);
  };

  return (
    <LayoutContainer theme={theme}>
      <Header theme={theme}>
        <HeaderContent>
          <MenuButton onClick={() => setMenuAberto(!menuAberto)} theme={theme}>
            ☰
          </MenuButton>
          <Logo>
            <h1>CasalPlanner</h1>
          </Logo>
          <UserInfo theme={theme}>
            <span>Olá, {usuario?.nomeCompleto?.split(' ')[0]}</span>
          </UserInfo>
        </HeaderContent>
      </Header>

      {menuAberto && (
        <MenuOverlay onClick={() => setMenuAberto(false)} theme={theme}>
          <MenuContent onClick={e => e.stopPropagation()} theme={theme}>
            <MenuHeader theme={theme}>
              <h2>CasalPlanner</h2>
              <CloseButton onClick={() => setMenuAberto(false)} theme={theme}>
                ✕
              </CloseButton>
            </MenuHeader>

            <MenuUserInfo theme={theme}>
              <UserAvatar theme={theme}>
                {usuario?.nomeCompleto?.charAt(0) || '👤'}
              </UserAvatar>
              <div>
                <UserName theme={theme}>{usuario?.nomeCompleto}</UserName>
                <UserEmail theme={theme}>{usuario?.email}</UserEmail>
              </div>
            </MenuUserInfo>

            <MenuNav>
              {menuItems.map(item => (
                <MenuItem
                  key={item.path}
                  active={location.pathname === item.path}
                  onClick={() => handleNavigation(item.path)}
                  theme={theme}
                >
                  <span className="icon">{item.icon}</span>
                  <span className="label">{item.label}</span>
                </MenuItem>
              ))}
            </MenuNav>

            <MenuFooter>
              <ThemeButton onClick={toggleTheme} theme={theme}>
                {isDarkMode ? '☀️ Modo Claro' : '🌓 Modo Escuro'}
              </ThemeButton>
              <LogoutButton onClick={logout} theme={theme}>
                🚪 Sair
              </LogoutButton>
            </MenuFooter>
          </MenuContent>
        </MenuOverlay>
      )}

      <MainContent theme={theme}>
        {children}
      </MainContent>
    </LayoutContainer>
  );
};

// Styled Components
const LayoutContainer = styled.div`
  min-height: 100vh;
  background: ${props => props.theme.background};
`;

const Header = styled.header`
  background: ${props => props.theme.surface};
  border-bottom: 1px solid ${props => props.theme.border};
  padding: 0.5rem 1rem;
  position: sticky;
  top: 0;
  z-index: 90;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
`;

const HeaderContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1400px;
  margin: 0 auto;
`;

const MenuButton = styled.button`
  background: none;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  color: ${props => props.theme.primary};
  padding: 0.5rem;
  border-radius: 12px;
  transition: 0.2s;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: ${props => props.theme.border};
  }
`;

const Logo = styled.div`
  h1 {
    font-size: 1.5rem;
    background: ${props => props.theme.gradient};
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    
    @media (max-width: 768px) {
      font-size: 1.2rem;
    }
  }
`;

const UserInfo = styled.div`
  color: ${props => props.theme.textSoft};
  font-size: 0.9rem;
  font-weight: 500;

  @media (max-width: 768px) {
    display: none;
  }
`;

const MenuOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  z-index: 1000;
  animation: fadeIn 0.2s ease;
`;

const MenuContent = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: 300px;
  background: ${props => props.theme.surface};
  box-shadow: 2px 0 20px rgba(0,0,0,0.3);
  display: flex;
  flex-direction: column;
  animation: slideIn 0.3s ease;

  @keyframes slideIn {
    from { transform: translateX(-100%); }
    to { transform: translateX(0); }
  }

  @media (max-width: 768px) {
    width: 85%;
  }
`;

const MenuHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid ${props => props.theme.border};

  h2 {
    font-size: 1.5rem;
    background: ${props => props.theme.gradient};
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: ${props => props.theme.textSoft};
  width: 40px;
  height: 40px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: 0.2s;

  &:hover {
    background: ${props => props.theme.border};
    color: ${props => props.theme.error};
  }
`;

const MenuUserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  border-bottom: 1px solid ${props => props.theme.border};
  background: ${props => props.theme.card};
`;

const UserAvatar = styled.div`
  width: 50px;
  height: 50px;
  background: ${props => props.theme.gradient};
  border-radius: 25px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
  box-shadow: 0 4px 8px rgba(0,0,0,0.3);
`;

const UserName = styled.div`
  font-weight: 600;
  color: ${props => props.theme.text};
  margin-bottom: 0.2rem;
`;

const UserEmail = styled.div`
  font-size: 0.8rem;
  color: ${props => props.theme.textSoft};
`;

const MenuNav = styled.nav`
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
`;

const MenuItem = styled.button`
  display: flex;
  align-items: center;
  gap: 1rem;
  width: 100%;
  padding: 1rem;
  border: none;
  background: ${props => props.active 
    ? props.theme.border 
    : 'transparent'};
  cursor: pointer;
  color: ${props => props.active 
    ? props.theme.primary 
    : props.theme.textSoft};
  font-size: 1rem;
  text-align: left;
  transition: all 0.2s;
  border-radius: 12px;
  margin-bottom: 0.3rem;

  &:hover {
    background: ${props => props.theme.border};
    color: ${props => props.theme.primary};
    transform: translateX(5px);
  }

  .icon {
    font-size: 1.2rem;
    width: 24px;
  }
`;

const MenuFooter = styled.div`
  padding: 1.5rem;
  border-top: 1px solid ${props => props.theme.border};
  background: ${props => props.theme.card};
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const ThemeButton = styled.button`
  padding: 0.8rem;
  border: 1px solid ${props => props.theme.border};
  border-radius: 12px;
  background: ${props => props.theme.surface};
  color: ${props => props.theme.text};
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-weight: 500;

  &:hover {
    border-color: ${props => props.theme.primary};
    background: ${props => props.theme.border};
  }
`;

const LogoutButton = styled(ThemeButton)`
  &:hover {
    border-color: ${props => props.theme.error};
    color: ${props => props.theme.error};
  }
`;

const MainContent = styled.main`
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  min-height: calc(100vh - 70px);
  background: ${props => props.theme.background};

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

export default Layout;