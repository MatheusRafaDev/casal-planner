import api from './api';

export const authService = {
  async registrar(dados) {
    const response = await api.post('/auth/registrar', dados);
    return response.data;
  },

  async login(dados) {
    const response = await api.post('/auth/login', dados);
    return response.data;
  },

  async loginCasal(dados) {
    const response = await api.post('/auth/login-casal', dados);
    return response.data;
  },

  salvarToken(token) {
    localStorage.setItem('token', token);
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
  },

  estaAutenticado() {
    return !!this.getToken();
  }
};