import api from "./api";

export const wishlistService = {
  async getPublica(slug) {
    try {
      const response = await api.get(`/wishlist/${slug}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar wishlist pública:', error);
      throw error;
    }
  },

  async getMinha() {
    try {
      const response = await api.get("/wishlist/minha");
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar minha wishlist:', error);
      throw error;
    }
  },

  async criar(dados) {
    try {
      const response = await api.post("/wishlist", dados);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar wishlist:', error);
      throw error;
    }
  },

  async atualizar(dados) {
    try {
      const response = await api.put("/wishlist", dados);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar wishlist:', error);
      throw error;
    }
  },

  async slugDisponivel(slug) {
    try {
      const response = await api.get(`/wishlist/slug-disponivel?slug=${slug}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao verificar disponibilidade de slug:', error);
      throw error;
    }
  },

  async reservarItem(slug, itemId, dados) {
    try {
      const response = await api.post(`/wishlist/${slug}/reservar/${itemId}`, dados);
      return response.data;
    } catch (error) {
      console.error('Erro ao reservar item:', error);
      throw error;
    }
  },

  async cancelarReserva(slug, itemId, nome) {
    try {
      const response = await api.delete(`/wishlist/${slug}/reservar/${itemId}`, {
        data: { nomePresente: nome }
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao cancelar reserva:', error);
      throw error;
    }
  },
};
