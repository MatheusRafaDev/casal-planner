import api from './api';

// Cache em memória do último resultado de listar/listarDoUsuario.
// Evita que verificarNomeExistente e contarCategoriasDoUsuario disparem
// requests extras quando as categorias já foram carregadas na sessão.
let _cacheGeral = null;
let _cacheTsGeral = 0;
let _cacheUsuario = null;
let _cacheTsUsuario = 0;
const CACHE_TTL_MS = 30_000; // 30 s

function isCacheGeralValid() {
  return _cacheGeral !== null && Date.now() - _cacheTsGeral < CACHE_TTL_MS;
}

function isCacheUsuarioValid() {
  return _cacheUsuario !== null && Date.now() - _cacheTsUsuario < CACHE_TTL_MS;
}

function setCacheGeral(data) {
  _cacheGeral  = data;
  _cacheTsGeral = Date.now();
}

function setCacheUsuario(data) {
  _cacheUsuario  = data;
  _cacheTsUsuario = Date.now();
}

export function invalidarCacheCategorias() {
  _cacheGeral  = null;
  _cacheTsGeral = 0;
  _cacheUsuario = null;
  _cacheTsUsuario = 0;
}

export const categoriasService = {
  async listar() {
    try {
      const response = await api.get('/categorias');
      setCacheGeral(response.data);
      return response.data;
    } catch (error) {
      console.error('Erro ao listar categorias:', error);
      throw error;
    }
  },

  async listarDoUsuario() {
    try {
      const response = await api.get('/categorias/usuario');
      setCacheUsuario(response.data);
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
      invalidarCacheCategorias();           // força re-fetch no próximo listar
      return response.data;
    } catch (error) {
      console.error('Erro ao criar categoria:', error);
      throw error;
    }
  },

  async update(id, categoria) {
    try {
      const response = await api.put(`/categorias/${id}`, categoria);
      invalidarCacheCategorias();
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar categoria:', error);
      throw error;
    }
  },

  async delete(id) {
    try {
      const response = await api.delete(`/categorias/${id}`);
      invalidarCacheCategorias();
      return response.data;
    } catch (error) {
      console.error('Erro ao deletar categoria:', error);
      throw error;
    }
  },

  /**
   * Verifica se já existe uma categoria com o mesmo nome.
   *
   * Antes: sempre chamava listarDoUsuario() — uma request de rede a cada
   * keystroke/blur mesmo com as categorias já carregadas na tela.
   *
   * Agora: reutiliza o cache em memória (30 s) quando disponível,
   * evitando a request extra na grande maioria dos casos.
   */
  async verificarNomeExistente(nome, categoriaIdIgnorar = null) {
    try {
      const categorias = isCacheUsuarioValid()
        ? _cacheUsuario
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

  async contarCategoriasDoUsuario() {
    try {
      const categorias = isCacheUsuarioValid()
        ? _cacheUsuario
        : await this.listarDoUsuario();
      return categorias.length;
    } catch (error) {
      console.error('Erro ao contar categorias:', error);
      return 0;
    }
  },

  async reordenar(categoriaIds) {
    const response = await api.put('/categorias/reordenar', { categoriaIds });
    invalidarCacheCategorias();
    return response.data;
  },
};
