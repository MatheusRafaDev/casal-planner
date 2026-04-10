import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Heart, Sun, Moon, LogOut, User, ChevronDown, Home } from 'lucide-react';
import usuarioService from '../services/usuarioService';
import authService from '../services/authService'; 

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
  const [dadosUsuario, setDadosUsuario] = useState(null); // 🔥 Estado para dados completos
  const sincronizacaoFeita = useRef(false);

  const isLogado = !!usuario;

  useEffect(() => {
    const carregarDadosCompletos = async () => {
      if (usuario) {
        try {
          const dados = await authService.buscarDadosCompletos();
          setDadosUsuario(dados);
        } catch (error) {
          console.error('Erro ao buscar dados completos:', error);
          setDadosUsuario(usuario); // Fallback para dados do contexto
        }
      }
    };

    carregarDadosCompletos();
  }, [usuario]);

  // Atualizar nome de exibição quando dadosUsuario mudar
  useEffect(() => {
    const usuarioParaExibir = dadosUsuario || usuario;
    
    if (usuarioParaExibir) {
      if (usuarioParaExibir.isCasal || usuarioParaExibir.tipoConta === 'Casal' || usuarioParaExibir.tipoConta === 1) {
        const pessoaLogada = usuarioParaExibir.pessoaQueLogou || 'pessoa1';
        const casalInfo = usuarioParaExibir.casalInfo || {};
        
        const nome = pessoaLogada === 'pessoa1' 
          ? casalInfo?.nomeCompletoPessoa1 
          : casalInfo?.nomeCompletoPessoa2;
        
        setNomeExibicao(nome || 'Usuário');
      } else {
        setNomeExibicao(usuarioParaExibir.nomeCompleto || 'Usuário');
      }
    } else {
      setNomeExibicao('');
    }
  }, [dadosUsuario, usuario]);

  // Sincroniza o tema sem recarregar a página
  useEffect(() => {
    if (usuario && usuario.modoEscuro !== undefined && !sincronizacaoFeita.current) {
      if (usuario.modoEscuro !== isDarkMode) {
        sincronizacaoFeita.current = true;
        if (usuario.modoEscuro !== isDarkMode) {
          toggleTheme();
        }
      }
    }
  }, [usuario, isDarkMode, toggleTheme]);

  const handleToggleTheme = async () => {
    if (atualizandoTema) return;
    
    setAtualizandoTema(true);
    const novoModoEscuro = !isDarkMode;
    
    try {
      toggleTheme();
      
      if (usuario) {
        await usuarioService.atualizarModoEscuro(usuario.id, novoModoEscuro);
        
        const usuarioAtualizado = { 
          ...usuario, 
          modoEscuro: novoModoEscuro 
        };
        
        atualizarUsuario(usuarioAtualizado);
        
        // Atualizar também os dados completos
        setDadosUsuario(prev => prev ? { ...prev, modoEscuro: novoModoEscuro } : null);
      } else {
        localStorage.setItem('darkMode', JSON.stringify(novoModoEscuro));
      }
      
    } catch (error) {
      console.error('Erro ao salvar preferência de tema:', error);
      toggleTheme();
    } finally {
      setAtualizandoTema(false);
      sincronizacaoFeita.current = false;
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

  // Fechar menu ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuAberto && !event.target.closest('.user-menu-container')) {
        setMenuAberto(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuAberto]);

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

          <div style={{ position: 'relative' }} className="user-menu-container">
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