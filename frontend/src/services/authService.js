import api from './api';

class AuthService {
  #usuarioCache = null;

  async login(dados) {
    try {
      const response = await api.post('/auth/login', dados);

      if (response.data.usuario) {
        this.#usuarioCache = response.data.usuario;
        return response.data.usuario;
      }
      
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async logout() {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Erro no logout:', error);
    } finally {
      this.#usuarioCache = null;
    }
  }

  async getUsuario() {
    if (this.#usuarioCache) {
      return this.#usuarioCache;
    }

    try {
      const autenticado = await this.estaAutenticado();
      if (autenticado) {
        const usuario = await this.buscarDadosCompletos();
        this.#usuarioCache = usuario;
        return usuario;
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  async estaAutenticado() {
    try {
      const response = await api.get('/auth/me');
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }

  async buscarDadosCompletos() {
    try {
      const response = await api.get('/auth/me');

      return response.data;
    } catch (error) {
      console.error('Erro ao buscar dados completos:', error);
      return null;
    }
  }

  setUsuarioCache(usuario) {
    this.#usuarioCache = usuario;
  }

  clearCache() {
    this.#usuarioCache = null;
  }
}

export default new AuthService();