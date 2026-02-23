import api from './api';

export const resumoService = {
  async get() {
    const response = await api.get('/resumo');
    return response.data;
  }
};