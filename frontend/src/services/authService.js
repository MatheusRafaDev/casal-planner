import api from './api';

export const authService = {

  async login(dados) {
    try {
      const response = await api.post('/auth/login', dados);
      return response.data;
    } catch (error) {
      console.error('Erro no login service:', error);
      throw error;
    }
  },


  async loginCasal(dados) {
    try {
      const response = await api.post('/auth/login-casal', dados);
      return response.data;
    } catch (error) {
      console.error('Erro no login casal service:', error);
      throw error;
    }
  },


  async registrar(dados) {
    try {
      const response = await api.post('/auth/registrar', dados);
      return response.data;
    } catch (error) {
      console.error('Erro no registro service:', error);
      throw error;
    }
  },


  async registrarCasal(dados) {
    try {
      const response = await api.post('/auth/registrar-casal', dados);
      return response.data;
    } catch (error) {
      console.error('Erro no registro casal service:', error);
      throw error;
    }
  },


  salvarToken(token) {
    localStorage.setItem('token', token);
    if (api.defaults?.headers) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  },

  salvarUsuario(usuario) {
    localStorage.setItem('usuario', JSON.stringify(usuario));
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
  },

  estaAutenticado() {
    return !!this.getToken();
  }
};