import api from './api';

export const itensService = {
  async getAll() {
    const response = await api.get('/itens');
    return response.data;
  },

  async getById(id) {
    const response = await api.get(`/itens/${id}`);
    return response.data;
  },

  async getByCategoria(categoriaId) {
    const response = await api.get(`/itens/categoria/${categoriaId}`);
    return response.data;
  },

  async create(data) {
    const response = await api.post('/itens', data);
    return response.data;
  },

  async update(id, data) {
    await api.put(`/itens/${id}`, data);
  },

  async delete(id) {
    await api.delete(`/itens/${id}`);
  }
};