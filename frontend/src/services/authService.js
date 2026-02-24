import api from './api';

export const authService = {
  // Login individual
  async login(dados) {
    try {
      const response = await api.post('/auth/login', dados);
      return response.data;
    } catch (error) {
      console.error('Erro no login service:', error);
      throw error;
    }
  },

  // Login do casal
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
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
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
    delete api.defaults.headers.common['Authorization'];
    console.log('✅ Logout realizado');
  },

  estaAutenticado() {
    return !!this.getToken();
  }
};