import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { LogOut, User, ChevronDown, Home, ClipboardList, Sun, Moon } from 'lucide-react';
import { ReactComponent as LogoIcon } from '../assets/logo.svg';

import {
  HeaderContainer,
  HeaderContent,
  Logo,
  NavLinks,
  NavButton,
  UserSection,
  UserMenu,
  UserAvatar,
  UserName,
  DropdownMenu,
  DropdownItem,
  Button,
} from '../styles/components/HeaderStyles';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { usuario, logout, isCasal, pessoaQueLogou } = useAuth();
  const { theme, isDarkMode, toggleTheme } = useTheme();
  const [menuAberto, setMenuAberto] = useState(false);

  const isLogado = !!usuario;

  // Deriva o nome de exibição diretamente do contexto — sem chamada extra à API
  const getNomeExibicao = () => {
    if (!usuario) return '';

    if (isCasal && usuario.casalInfo) {
      const pessoa = pessoaQueLogou || 'pessoa1';
      if (pessoa === 'pessoa1') {
        return (
          usuario.casalInfo.pessoa1?.nomeCompleto ||
          usuario.casalInfo.nomeCompletoPessoa1 ||
          'Usuário'
        );
      }
      return (
        usuario.casalInfo.pessoa2?.nomeCompleto ||
        usuario.casalInfo.nomeCompletoPessoa2 ||
        'Usuário'
      );
    }

    return usuario.nomeCompleto || 'Usuário';
  };

  const nomeExibicao = getNomeExibicao();

  const getInitials = () => {
    if (!nomeExibicao || nomeExibicao === 'Usuário') return 'U';
    return nomeExibicao.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getPrimeiroNome = () => {
    if (!nomeExibicao || nomeExibicao === 'Usuário') return 'Usuário';
    return nomeExibicao.split(' ')[0];
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuAberto && !e.target.closest('.user-menu-container')) {
        setMenuAberto(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuAberto]);

  // Header deslogado — sem toggle de tema
  if (!isLogado) {
    return (
      <HeaderContainer theme={theme}>
        <HeaderContent>
          <Logo onClick={() => navigate('/')} theme={theme}>
            <LogoIcon width={30} height={30} />
            <span>CasalPlanner</span>
          </Logo>
          <UserSection>
            <Button onClick={() => navigate('/login')} theme={theme}>Entrar</Button>
            <Button primary onClick={() => navigate('/login', { state: { modo: 'registro' } })} theme={theme}>
              Criar conta
            </Button>
          </UserSection>
        </HeaderContent>
      </HeaderContainer>
    );
  }

  return (
    <HeaderContainer theme={theme}>
      <HeaderContent>
        <Logo onClick={() => navigate('/inicio')} theme={theme}>
          <LogoIcon width={32} height={32} />
          <span>CasalPlanner</span>
        </Logo>

        <NavLinks>
          <NavButton onClick={() => navigate('/inicio')} active={location.pathname === '/inicio'} theme={theme}>
            <Home size={18} /><span>Início</span>
          </NavButton>
          <NavButton onClick={() => navigate('/planejamento')} active={location.pathname === '/planejamento'} theme={theme}>
            <ClipboardList size={18} /><span>Planejamento</span>
          </NavButton>
        </NavLinks>

        <UserSection>
          <div style={{ position: 'relative' }} className="user-menu-container">
            <UserMenu onClick={() => setMenuAberto(!menuAberto)} theme={theme}>
              <UserAvatar theme={theme}>{getInitials()}</UserAvatar>
              <UserName theme={theme}>{getPrimeiroNome()}</UserName>
              <ChevronDown size={16} />
            </UserMenu>

            {menuAberto && (
              <DropdownMenu theme={theme}>
                <DropdownItem onClick={() => { navigate('/inicio'); setMenuAberto(false); }} theme={theme}>
                  <Home size={16} /><span>Início</span>
                </DropdownItem>

                <DropdownItem onClick={() => { navigate('/perfil'); setMenuAberto(false); }} theme={theme}>
                  <User size={16} /><span>Perfil</span>
                </DropdownItem>

                <DropdownItem onClick={() => { navigate('/planejamento'); setMenuAberto(false); }} theme={theme}>
                  <ClipboardList size={16} /><span>Planejamento</span>
                </DropdownItem>

                <DropdownItem
                  onClick={() => { toggleTheme(); setMenuAberto(false); }}
                  theme={theme}
                >
                  {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
                  <span>{isDarkMode ? 'Modo claro' : 'Modo escuro'}</span>
                </DropdownItem>

                <DropdownItem onClick={() => { logout(); setMenuAberto(false); }} theme={theme} danger>
                  <LogOut size={16} /><span>Sair</span>
                </DropdownItem>
              </DropdownMenu>
            )}
          </div>
        </UserSection>
      </HeaderContent>
    </HeaderContainer>
  );
};

export default Header;