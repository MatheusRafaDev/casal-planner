import api from "./api";

export const itensService = {
  async getAll() {
    try {
      const response = await api.get("/itens");
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar itens:', error);
      throw error;
    }
  },

  async getById(id) {
    try {
      const response = await api.get(`/itens/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar item por ID:', error);
      throw error;
    }
  },

  async getByCategoria(categoriaId) {
    try {
      const response = await api.get(`/itens/categoria/${categoriaId}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar itens por categoria:', error);
      throw error;
    }
  },

  async create(data) {
    try {
      const response = await api.post("/itens", data);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar item:', error);
      throw error;
    }
  },

  async update(id, data) {
    try {
      const response = await api.put(`/itens/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar item:', error);
      throw error;
    }
  },

  async updateCategoria(id, categoriaId) {
    try {
      const response = await api.put(`/itens/${id}/categoria`, { categoriaId });
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar categoria do item:', error);
      throw error;
    }
  },

  async updateComprado(id, comprado) {
    try {
      const response = await api.put(`/itens/${id}/comprado`, { comprado });
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar status comprado:', error);
      throw error;
    }
  },

  async delete(id) {
    try {
      await api.delete(`/itens/${id}`);
    } catch (error) {
      console.error('Erro ao deletar item:', error);
      throw error;
    }
  },
};
