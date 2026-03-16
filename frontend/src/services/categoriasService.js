import api from './api';

export const categoriasService = {
  async listar() {
    try {
      const response = await api.get('/categorias');
      return response.data;
    } catch (error) {
      console.error('Erro ao listar categorias:', error);
      throw error;
    }
  },

  async listarDoUsuario() {
    try {
      const response = await api.get('/categorias/usuario');
      return response.data;
    } catch (error) {
      console.error('Erro ao listar categorias do usuário:', error);
      throw error;
    }
  },

  async getById(id) {
    try {
      const response = await api.get(`/categorias/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar categoria:', error);
      throw error;
    }
  },

  async create(categoria) {
    try {
      const response = await api.post('/categorias', categoria);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar categoria:', error);
      throw error;
    }
  },

  async update(id, categoria) {
    try {
      const response = await api.put(`/categorias/${id}`, categoria);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar categoria:', error);
      throw error;
    }
  },

  async delete(id) {
    try {
      const response = await api.delete(`/categorias/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao deletar categoria:', error);
      throw error;
    }
  },

  async verificarNomeExistente(nome) {
    try {
      const categorias = await this.listarDoUsuario();
      const nomeTrimmed = nome.trim().toLowerCase();
      const existe = categorias.some(cat => 
        cat.nome.toLowerCase() === nomeTrimmed
      );
      return existe;
    } catch (error) {
      console.error('Erro ao verificar nome:', error);
      return false;
    }
  },

  async contarCategoriasDoUsuario() {
    try {
      const categorias = await this.listarDoUsuario();
      return categorias.length;
    } catch (error) {
      console.error('Erro ao contar categorias:', error);
      return 0;
    }
  },

  async reordenar(categoriaIds) {
    const response = await api.put('/categorias/reordenar', { categoriaIds });
    return response.data;
  }
};