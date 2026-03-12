import api from './api';

export const authService = {
  // Autenticação
  async login(dados) {
    try {
      const response = await api.post('/auth/login', dados);
      if (response.data.token) {
        this.salvarToken(response.data.token);
        this.salvarUsuario(response.data);
      }
      return response.data;
    } catch (error) {
      console.error('Erro no login:', error);
      throw error;
    }
  },

  async registrar(dados) {
    try {
      const response = await api.post('/auth/registrar', dados);
      if (response.data.token) {
        this.salvarToken(response.data.token);
        this.salvarUsuario(response.data);
      }
      return response.data;
    } catch (error) {
      console.error('Erro no registro:', error);
      throw error;
    }
  },

  async registrarCasal(dados) {
    try {
      const response = await api.post('/auth/registrar-casal', dados);
      if (response.data.token) {
        this.salvarToken(response.data.token);
        this.salvarUsuario(response.data);
      }
      return response.data;
    } catch (error) {
      console.error('Erro no registro casal:', error);
      throw error;
    }
  },

  // Perfil
  async getCurrentUser() {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      throw error;
    }
  },

  async atualizarPerfil(id, dados) {
    try {
      const response = await api.put(`/auth/perfil/${id}`, dados);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      throw error;
    }
  },

  async atualizarPerfilCasal(id, dados) {
    try {
      const response = await api.put(`/auth/perfil-casal/${id}`, dados);
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

authService.configurarToken();

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