import api from './api';

export const categoriasService = {
  async getAll() {
    const response = await api.get('/categorias');
    return response.data;
  },

  async getById(id) {
    const response = await api.get(`/categorias/${id}`);
    return response.data;
  },

  async create(data) {
    const response = await api.post('/categorias', data);
    return response.data;
  },

  async delete(id) {
    await api.delete(`/categorias/${id}`);
  }
};