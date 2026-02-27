import api from './api';

export const authService = {
  // Login unificado (funciona para individual e casal)
  async login(dados) {
    try {
      const response = await api.post('/auth/login', dados);
      return response.data;
    } catch (error) {
      console.error('Erro no login service:', error);
      throw error;
    }
  },

  // Login específico para casal (caso precise)
  async loginCasal(dados) {
    try {
      const response = await api.post('/auth/login-casal', dados);
      return response.data;
    } catch (error) {
      console.error('Erro no login casal service:', error);
      throw error;
    }
  },

  // Registro individual
  async registrar(dados) {
    try {
      const response = await api.post('/auth/registrar', dados);
      return response.data;
    } catch (error) {
      console.error('Erro no registro service:', error);
      throw error;
    }
  },

  // Registro de casal
  async registrarCasal(dados) {
    try {
      const response = await api.post('/auth/registrar-casal', dados);
      return response.data;
    } catch (error) {
      console.error('Erro no registro casal service:', error);
      throw error;
    }
  },

  // Utilitários de token
  salvarToken(token) {
    localStorage.setItem('token', token);
    if (api.defaults?.headers) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    console.log('✅ Token salvo no localStorage');
  },

  salvarUsuario(usuario) {
    localStorage.setItem('usuario', JSON.stringify(usuario));
    console.log('✅ Usuário salvo no localStorage');
  },

  getToken() {
    return localStorage.getItem('token');
  },

  getUsuario() {
    const usuario = localStorage.getItem('usuario');
    return usuario ? JSON.parse(usuario) : null;
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    if (api.defaults?.headers) {
      delete api.defaults.headers.common['Authorization'];
    }
    console.log('✅ Logout realizado');
  },

  estaAutenticado() {
    return !!this.getToken();
  }
};