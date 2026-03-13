import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Heart, Sun, Moon, LogOut, User, ChevronDown, Home } from 'lucide-react';
import usuarioService from '../services/usuarioService';
import authService from '../services/authService'; // Importe o authService

import {
  HeaderContainer,
  HeaderContent,
  Logo,
  NavLinks,
  NavButton,
  UserSection,
  ThemeButton,
  UserMenu,
  UserAvatar,
  UserName,
  DropdownMenu,
  DropdownItem,
  Button
} from '../styles/components/HeaderStyles';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { usuario, atualizarUsuario, logout } = useAuth();
  const { isDarkMode, toggleTheme, theme } = useTheme();
  const [menuAberto, setMenuAberto] = useState(false);
  const [nomeExibicao, setNomeExibicao] = useState('');
  const [atualizandoTema, setAtualizandoTema] = useState(false);

  const isLogado = !!usuario;

  // Sincroniza o tema com o usuário quando ele loga
  useEffect(() => {
    if (usuario && usuario.modoEscuro !== undefined && usuario.modoEscuro !== isDarkMode) {
      // Se o tema do usuário for diferente do atual, atualiza o tema
      // Mas sem chamar o toggleTheme para não criar loop
      const savedTheme = localStorage.getItem('darkMode');
      if (savedTheme !== String(usuario.modoEscuro)) {
        localStorage.setItem('darkMode', JSON.stringify(usuario.modoEscuro));
        window.location.reload(); // Recarrega para aplicar o tema
      }
    }
  }, [usuario]);

  useEffect(() => {
    if (usuario) {
      if (usuario.isCasal || usuario.tipoConta === 'Casal' || usuario.tipoConta === 1) {
        const nome = usuario.pessoaQueLogou === 'pessoa1' 
          ? usuario.casalInfo?.nomeCompletoPessoa1 
          : usuario.casalInfo?.nomeCompletoPessoa2;
        setNomeExibicao(nome || 'Usuário');
      } else {
        setNomeExibicao(usuario.nomeCompleto || 'Usuário');
      }
    } else {
      setNomeExibicao('');
    }
  }, [usuario]);

  const handleToggleTheme = async () => {
    if (atualizandoTema) return;
    
    setAtualizandoTema(true);
    const novoModoEscuro = !isDarkMode;
    
    try {
      // Primeiro alterna o tema local
      toggleTheme();
      
      // Se estiver logado, salva no backend
      if (usuario) {
        await usuarioService.atualizarModoEscuro(usuario.id, novoModoEscuro);
        
        // Atualiza o usuário no contexto
        const usuarioAtualizado = { 
          ...usuario, 
          modoEscuro: novoModoEscuro 
        };
        
        atualizarUsuario(usuarioAtualizado);
      } else {
        // Se não estiver logado, apenas salva no localStorage
        localStorage.setItem('darkMode', JSON.stringify(novoModoEscuro));
      }
      
    } catch (error) {
      console.error('Erro ao salvar preferência de tema:', error);
      // Reverte o tema em caso de erro
      toggleTheme();
    } finally {
      setAtualizandoTema(false);
    }
  };

  const getInitials = () => {
    if (!nomeExibicao || nomeExibicao === 'Usuário') return 'U';
    return nomeExibicao.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getPrimeiroNome = () => {
    if (!nomeExibicao || nomeExibicao === 'Usuário') return 'Usuário';
    return nomeExibicao.split(' ')[0];
  };

  if (!isLogado) {
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
            <ThemeButton onClick={handleToggleTheme} theme={theme}>
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </ThemeButton>
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
          </UserSection>
        </HeaderContent>
      </HeaderContainer>
    );
  }

  return (
    <HeaderContainer theme={theme}>
      <HeaderContent>
        <Logo onClick={() => navigate('/')} theme={theme}>
          <div className="icon">
            <Heart />
          </div>
          <span>CasalPlanner</span>
        </Logo>

        <NavLinks>
          <NavButton 
            onClick={() => navigate('/inicio')} 
            active={location.pathname === '/inicio'}
            theme={theme}
          >
            <Home size={18} />
            <span>Início</span>
          </NavButton>
        </NavLinks>

        <UserSection>
          <ThemeButton 
            onClick={handleToggleTheme} 
            theme={theme}
            disabled={atualizandoTema}
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </ThemeButton>

          <div style={{ position: 'relative' }}>
            <UserMenu onClick={() => setMenuAberto(!menuAberto)} theme={theme}>
              <UserAvatar theme={theme}>
                {getInitials()}
              </UserAvatar>
              <UserName theme={theme}>
                {getPrimeiroNome()}
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
                    navigate('/inicio');
                    setMenuAberto(false);
                  }}
                  theme={theme}
                >
                  <Home size={16} />
                  <span>Início</span>
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
        </UserSection>
      </HeaderContent>
    </HeaderContainer>
  );
};

export default Header;