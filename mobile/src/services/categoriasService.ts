import api from './api';

export interface Categoria {
  id: string;
  nome: string;
  ordem?: number;
  [key: string]: any;
}

let _cache: Categoria[] | null = null;
let _cacheTs = 0;
const CACHE_TTL_MS = 30_000;

function isCacheValid() {
  return _cache !== null && Date.now() - _cacheTs < CACHE_TTL_MS;
}

function setCache(data: Categoria[]) {
  _cache = data;
  _cacheTs = Date.now();
}

export function invalidarCacheCategorias() {
  _cache = null;
  _cacheTs = 0;
}

export const categoriasService = {
  async listar(): Promise<Categoria[]> {
    try {
      const response = await api.get('/categorias');
      setCache(response.data);
      return response.data;
    } catch (error) {
      console.error('Erro ao listar categorias:', error);
      throw error;
    }
  },

  async listarDoUsuario(): Promise<Categoria[]> {
    try {
      const response = await api.get('/categorias/usuario');
      setCache(response.data);
      return response.data;
    } catch (error) {
      console.error('Erro ao listar categorias do usuário:', error);
      throw error;
    }
  },

  async getById(id: string): Promise<Categoria> {
    try {
      const response = await api.get(`/categorias/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar categoria:', error);
      throw error;
    }
  },

  async create(categoria: Partial<Categoria>): Promise<Categoria> {
    try {
      const response = await api.post('/categorias', categoria);
      invalidarCacheCategorias();
      return response.data;
    } catch (error) {
      console.error('Erro ao criar categoria:', error);
      throw error;
    }
  },

  async update(id: string, categoria: Partial<Categoria>): Promise<Categoria> {
    try {
      const response = await api.put(`/categorias/${id}`, categoria);
      invalidarCacheCategorias();
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar categoria:', error);
      throw error;
    }
  },

  async delete(id: string): Promise<any> {
    try {
      const response = await api.delete(`/categorias/${id}`);
      invalidarCacheCategorias();
      return response.data;
    } catch (error) {
      console.error('Erro ao deletar categoria:', error);
      throw error;
    }
  },

  async verificarNomeExistente(nome: string, categoriaIdIgnorar: string | null = null): Promise<boolean> {
    try {
      const categorias = isCacheValid()
        ? _cache!
        : await this.listarDoUsuario();

      const nomeTrimmed = nome.trim().toLowerCase();
      return categorias.some(cat =>
        cat.nome.toLowerCase() === nomeTrimmed &&
        (!categoriaIdIgnorar || cat.id !== categoriaIdIgnorar)
      );
    } catch (error) {
      console.error('Erro ao verificar nome:', error);
      return false;
    }
  },

  async contarCategoriasDoUsuario(): Promise<number> {
    try {
      const categorias = isCacheValid()
        ? _cache!
        : await this.listarDoUsuario();
      return categorias.length;
    } catch (error) {
      console.error('Erro ao contar categorias:', error);
      return 0;
    }
  },

  async reordenar(categoriaIds: string[]): Promise<any> {
    const response = await api.put('/categorias/reordenar', { categoriaIds });
    invalidarCacheCategorias();
    return response.data;
  },
};
