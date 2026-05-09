import api from "./api";

export interface Item {
  id: string;
  nome: string;
  categoriaId: string;
  comprado: boolean;
  [key: string]: any;
}

export const itensService = {
  async getAll(): Promise<Item[]> {
    const response = await api.get("/itens");
    return response.data;
  },

  async getById(id: string): Promise<Item> {
    const response = await api.get(`/itens/${id}`);
    return response.data;
  },

  async getByCategoria(categoriaId: string): Promise<Item[]> {
    const response = await api.get(`/itens/categoria/${categoriaId}`);
    return response.data;
  },

  async create(data: Partial<Item>): Promise<Item> {
    const response = await api.post("/itens", data);
    return response.data;
  },

  async update(id: string, data: Partial<Item>): Promise<Item> {
    try {
      const response = await api.put(`/itens/${id}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async updateCategoria(id: string, categoriaId: string): Promise<Item> {
    const response = await api.put(`/itens/${id}/categoria`, { categoriaId });
    return response.data;
  },

  async updateComprado(id: string, comprado: boolean): Promise<Item> {
    const response = await api.put(`/itens/${id}/comprado`, { comprado });
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/itens/${id}`);
  },
};
