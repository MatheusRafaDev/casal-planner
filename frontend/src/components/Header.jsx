import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Heart, Sun, Moon, LogOut, User, Settings, ChevronDown } from 'lucide-react';

import {
  HeaderContainer,
  HeaderContent,
  Logo,
  UserSection,
  ThemeButton,
  UserMenu,
  UserAvatar,
  UserName,
  DropdownMenu,
  DropdownItem,
  Button,
  LogoutButton
} from '../styles/components/HeaderStyles';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { usuario, logout } = useAuth();
  const { isDarkMode, toggleTheme, theme } = useTheme();
  const [menuAberto, setMenuAberto] = useState(false);

  const isLogado = !!usuario;

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <HeaderContainer theme={theme}>
      <HeaderContent>

        <Logo onClick={() => navigate('/')} theme={theme}>
          <div className="icon">
            <Heart />
          </div>
          <span>CasalPlanner</span>
        </Logo>


        <UserSection>

          <ThemeButton onClick={toggleTheme} theme={theme}>
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </ThemeButton>

          {isLogado ? (
            <div style={{ position: 'relative' }}>
              <UserMenu onClick={() => setMenuAberto(!menuAberto)} theme={theme}>
                <UserAvatar theme={theme}>
                  {getInitials(usuario?.nomeCompleto)}
                </UserAvatar>
                <UserName theme={theme}>
                  {usuario?.nomeCompleto?.split(' ')[0]}
                </UserName>
                <ChevronDown size={16} />
              </UserMenu>

              {menuAberto && (
                <DropdownMenu theme={theme}>
                  <DropdownItem 
                    onClick={() => {
                      navigate('/perfil');
                      setMenuAberto(false);
                    }}
                    theme={theme}
                  >
                    <User size={16} />
                    <span>Perfil</span>
                  </DropdownItem>
                  <DropdownItem 
                    onClick={() => {
                      navigate('/configuracoes');
                      setMenuAberto(false);
                    }}
                    theme={theme}
                  >
                    <Settings size={16} />
                    <span>Configurações</span>
                  </DropdownItem>
                  <DropdownItem 
                    onClick={() => {
                      logout();
                      setMenuAberto(false);
                    }}
                    theme={theme}
                    danger
                  >
                    <LogOut size={16} />
                    <span>Sair</span>
                  </DropdownItem>
                </DropdownMenu>
              )}
            </div>
          ) : (
            <>
              <Button onClick={() => navigate('/login')} theme={theme}>
                Entrar
              </Button>
              <Button 
                primary 
                onClick={() => navigate('/login', { state: { modo: 'registro' } })} 
                theme={theme}
              >
                Criar conta
              </Button>
            </>
          )}
        </UserSection>
      </HeaderContent>
    </HeaderContainer>
  );
};

export default Header;