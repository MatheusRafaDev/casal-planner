import api from './api';

export const authService = {
  // Autenticação
  async login(dados) {
    try {
      const response = await api.post('/auth/login', dados);
      if (response.data.token) {
        this.salvarToken(response.data.token);
        // Padronizar o objeto de usuário antes de salvar
        const usuario = this.padronizarUsuario(response.data);
        this.salvarUsuario(usuario);
        return usuario;
      }
      return response.data;
    } catch (error) {
      console.error('Erro no login:', error);
      throw error;
    }
  },

  async registrar(dados) {
    try {
      // Converter dados do frontend para o formato esperado pelo backend
      const dadosBackend = {
        nomeCompleto: dados.nomeCompleto,
        email: dados.email,
        senha: dados.senha,
        cpf: dados.cpf,
        dataNascimento: dados.dataNascimento,
        rendaMensal: dados.rendaMensal || 0
      };

      const response = await api.post('/auth/registrar', dadosBackend);
      if (response.data.token) {
        this.salvarToken(response.data.token);
        const usuario = this.padronizarUsuario(response.data);
        this.salvarUsuario(usuario);
        return usuario;
      }
      return response.data;
    } catch (error) {
      console.error('Erro no registro:', error);
      throw error;
    }
  },

  async registrarCasal(dados) {
    try {
      // Converter dados do frontend para o formato esperado pelo backend
      const dadosBackend = {
        nomeCompletoPessoa1: dados.nomeCompletoPessoa1,
        emailPessoa1: dados.emailPessoa1,
        senhaPessoa1: dados.senhaPessoa1,
        cpfPessoa1: dados.cpfPessoa1,
        dataNascimentoPessoa1: dados.dataNascimentoPessoa1,
        rendaMensalPessoa1: dados.rendaMensalPessoa1 || 0,
        
        nomeCompletoPessoa2: dados.nomeCompletoPessoa2,
        emailPessoa2: dados.emailPessoa2,
        senhaPessoa2: dados.senhaPessoa2,
        cpfPessoa2: dados.cpfPessoa2,
        dataNascimentoPessoa2: dados.dataNascimentoPessoa2,
        rendaMensalPessoa2: dados.rendaMensalPessoa2 || 0,
        
        dataCasamento: dados.dataCasamento
      };

      const response = await api.post('/auth/registrar-casal', dadosBackend);
      if (response.data.token) {
        this.salvarToken(response.data.token);
        const usuario = this.padronizarUsuario(response.data);
        this.salvarUsuario(usuario);
        return usuario;
      }
      return response.data;
    } catch (error) {
      console.error('Erro no registro casal:', error);
      throw error;
    }
  },

  // Função auxiliar para padronizar o objeto de usuário
  padronizarUsuario(data) {
    // Se já tiver isCasal, mantém
    if (data.isCasal !== undefined) {
      return {
        id: data.id,
        nomeCompleto: data.nomeCompleto,
        email: data.email,
        token: data.token,
        isCasal: data.isCasal,
        tipoConta: data.isCasal ? '1' : '0',
        modoEscuro: data.modoEscuro || false,
        pessoaQueLogou: data.pessoaQueLogou,
        casalInfo: data.casalInfo,
        rendaMensal: data.rendaMensal,
        cpf: data.cpf,
        dataNascimento: data.dataNascimento,
        createdAt: data.createdAt || data.dataInclusao
      };
    }

    // Para respostas do /me ou registro
    if (data.tipoConta === 'Casal' || data.isCasal) {
      return {
        id: data.id,
        nomeCompleto: data.nomeCompleto,
        email: data.email,
        token: data.token,
        isCasal: true,
        tipoConta: '1',
        modoEscuro: data.modoEscuro || false,
        pessoaQueLogou: data.pessoaQueLogou || 'pessoa1',
        casalInfo: {
          nomeCompletoPessoa1: data.nomeCompletoPessoa1 || data.casalInfo?.nomeCompletoPessoa1,
          emailPessoa1: data.emailPessoa1 || data.casalInfo?.emailPessoa1,
          cpfPessoa1: data.cpfPessoa1 || data.casalInfo?.cpfPessoa1,
          dataNascimentoPessoa1: data.dataNascimentoPessoa1 || data.casalInfo?.dataNascimentoPessoa1,
          rendaMensalPessoa1: data.rendaMensalPessoa1 || data.casalInfo?.rendaMensalPessoa1,
          
          nomeCompletoPessoa2: data.nomeCompletoPessoa2 || data.casalInfo?.nomeCompletoPessoa2,
          emailPessoa2: data.emailPessoa2 || data.casalInfo?.emailPessoa2,
          cpfPessoa2: data.cpfPessoa2 || data.casalInfo?.cpfPessoa2,
          dataNascimentoPessoa2: data.dataNascimentoPessoa2 || data.casalInfo?.dataNascimentoPessoa2,
          rendaMensalPessoa2: data.rendaMensalPessoa2 || data.casalInfo?.rendaMensalPessoa2,
          
          dataCasamento: data.dataCasamento || data.casalInfo?.dataCasamento
        },
        createdAt: data.createdAt || data.dataInclusao
      };
    } else {
      return {
        id: data.id,
        nomeCompleto: data.nomeCompleto,
        email: data.email,
        token: data.token,
        isCasal: false,
        tipoConta: '0',
        modoEscuro: data.modoEscuro || false,
        rendaMensal: data.rendaMensal,
        cpf: data.cpf,
        dataNascimento: data.dataNascimento,
        createdAt: data.createdAt || data.dataInclusao
      };
    }
  },

  // Perfil
  async getCurrentUser() {
    try {
      const response = await api.get('/auth/me');
      const usuario = this.padronizarUsuario(response.data);
      return usuario;
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      throw error;
    }
  },

  async atualizarPerfil(id, dados) {
    try {
      // Converter para o formato esperado pelo backend
      const dadosBackend = {
        nomeCompleto: dados.nomeCompleto,
        dataNascimento: dados.dataNascimento,
        rendaMensal: dados.rendaMensal
      };

      const response = await api.put(`/auth/perfil/${id}`, dadosBackend);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      throw error;
    }
  },

  async atualizarPerfilCasal(id, dados) {
    try {
      // Converter para o formato esperado pelo backend
      const dadosBackend = {
        nomeCompletoPessoa1: dados.nomeCompletoPessoa1,
        dataNascimentoPessoa1: dados.dataNascimentoPessoa1,
        rendaMensalPessoa1: dados.rendaMensalPessoa1,
        
        nomeCompletoPessoa2: dados.nomeCompletoPessoa2,
        dataNascimentoPessoa2: dados.dataNascimentoPessoa2,
        rendaMensalPessoa2: dados.rendaMensalPessoa2,
        
        dataCasamento: dados.dataCasamento
      };

      const response = await api.put(`/auth/perfil-casal/${id}`, dadosBackend);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar perfil casal:', error);
      throw error;
    }
  },

  async atualizarModoEscuro(id, modoEscuro) {
    try {
      const response = await api.put(`/auth/modo-escuro/${id}`, { modoEscuro });
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar modo escuro:', error);
      throw error;
    }
  },

  async alterarSenha(dados) {
    try {
      const response = await api.post('/auth/alterar-senha', dados);
      return response.data;
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      throw error;
    }
  },

  async excluirConta(id) {
    try {
      const response = await api.delete(`/auth/usuario/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao excluir conta:', error);
      throw error;
    }
  },

  async logout() {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Erro no logout:', error);
    } finally {
      this.logoutLocal();
    }
  },

  // Gerenciamento de token
  salvarToken(token) {
    localStorage.setItem('token', token);
    this.configurarToken();
  },

  salvarUsuario(usuario) {
    localStorage.setItem('usuario', JSON.stringify(usuario));
  },

  getToken() {
    return localStorage.getItem('token');
  },

  getUsuario() {
    try {
      const usuario = localStorage.getItem('usuario');
      return usuario ? JSON.parse(usuario) : null;
    } catch (error) {
      console.error('Erro ao parsear usuário:', error);
      return null;
    }
  },

  logoutLocal() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    if (api.defaults?.headers) {
      delete api.defaults.headers.common['Authorization'];
    }
  },

  estaAutenticado() {
    return !!this.getToken();
  },

  configurarToken() {
    const token = this.getToken();
    if (token && api.defaults?.headers) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  },

  async verificarToken() {
    try {
      if (!this.estaAutenticado()) return false;
      await this.getCurrentUser();
      return true;
    } catch (error) {
      this.logoutLocal();
      return false;
    }
  }
};

// Configurar token inicial
authService.configurarToken();

// Interceptor para renovar token ou logout em caso de 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && !error.config._retry) {
      error.config._retry = true;
      authService.logoutLocal();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);