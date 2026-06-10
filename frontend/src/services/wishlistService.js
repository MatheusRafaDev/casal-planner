import api from "./api";

export const wishlistService = {
  async getPublica(slug) {
    const response = await api.get(`/wishlist/${slug}`);
    return response.data;
  },

  async getMinha() {
    const response = await api.get("/wishlist/minha");
    return response.data;
  },

  async criar(dados) {
    const response = await api.post("/wishlist", dados);
    return response.data;
  },

  async atualizar(dados) {
    const response = await api.put("/wishlist", dados);
    return response.data;
  },

  async slugDisponivel(slug) {
    const response = await api.get(`/wishlist/slug-disponivel?slug=${slug}`);
    return response.data;
  },

  async reservarItem(slug, itemId, dados) {
    const response = await api.post(`/wishlist/${slug}/reservar/${itemId}`, dados);
    return response.data;
  },

  async cancelarReserva(slug, itemId, nome) {
    const response = await api.delete(`/wishlist/${slug}/reservar/${itemId}`, {
      data: { nomePresente: nome }
    });
    return response.data;
  },
};
