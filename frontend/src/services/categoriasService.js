// src/services/categoriasService.js
import api from './api';

export const categoriasService = {
  // Listar todas as categorias
  async listar() {
    try {
      const response = await api.get('/categorias');
      return response.data;
    } catch (error) {
      console.error('Erro ao listar categorias:', error);
      throw error;
    }
  },

  // Buscar categoria por ID
  async getById(id) {
    try {
      const response = await api.get(`/categorias/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar categoria:', error);
      throw error;
    }
  },

  // Criar nova categoria
  async create(categoria) {
    try {
      const response = await api.post('/categorias', categoria);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar categoria:', error);
      throw error;
    }
  },

  // Atualizar categoria
  async update(id, categoria) {
    try {
      const response = await api.put(`/categorias/${id}`, categoria);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar categoria:', error);
      throw error;
    }
  },

  // Deletar categoria
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
      const response = await api.get('/categorias', {
        params: { nome: nome.trim() }
      });
      return response.data.length > 0;
    } catch (error) {
      console.error('Erro ao verificar nome:', error);
      return false;
    }
  }
};