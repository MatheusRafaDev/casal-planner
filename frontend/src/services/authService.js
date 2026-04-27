// ============================================================
// authService.js — Autenticação via localStorage + Bearer token
// ============================================================
import api, { tokenStorage } from './api';

class AuthService {
  #usuarioCache = null;

  async login(dados) {
    try {
      const response = await api.post('/auth/login', dados);
      const { token, usuario } = response.data;

      console.log('Resposta do login:', response.data);

      if (token) {
        // Persiste token no localStorage
        tokenStorage.set(token);
      }

      if (usuario) {
        this.#usuarioCache = usuario;
        return usuario;
      }

      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async logout() {
    try {
      // Avisa o backend (opcional — só para invalidar token no servidor se implementado)
      await api.post('/auth/logout');
    } catch {
      // Ignora erros de rede no logout
    } finally {
      // Limpa token local independente do backend
      tokenStorage.remove();
      this.#usuarioCache = null;
    }
  }

  async getUsuario() {
    if (this.#usuarioCache) return this.#usuarioCache;
    if (!tokenStorage.exists()) return null;

    try {
      return await this.buscarDadosCompletos();
    } catch {
      return null;
    }
  }

  async estaAutenticado() {
    const usuario = await this.getUsuario();
    return usuario !== null;
  }

  async buscarDadosCompletos() {
    try {
      const response = await api.get('/auth/me');
      const d = response.data;

      // Normaliza PascalCase (C#) → camelCase (JS)
      const normalizado = {
        id:           d.Id           || d.id,
        nomeCompleto: d.NomeCompleto || d.nomeCompleto,
        email:        d.Email        || d.email,
        tipoConta:    d.TipoConta    ?? d.tipoConta,
        isCasal:      d.IsCasal      ?? d.isCasal,
        modoEscuro:   d.ModoEscuro   ?? d.modoEscuro,
        rendaMensal:  d.RendaMensal  ?? d.rendaMensal,
        cpf:          d.CPF          || d.cpf,
        dataNascimento: d.DataNascimento || d.dataNascimento,
        createdAt:    d.CreatedAt    || d.createdAt,
        casalInfo: d.CasalInfo
          ? {
              nomeCompletoPessoa1:  d.CasalInfo.NomeCompletoPessoa1,
              emailPessoa1:         d.CasalInfo.EmailPessoa1,
              cpfPessoa1:           d.CasalInfo.CPFPessoa1,
              dataNascimentoPessoa1: d.CasalInfo.DataNascimentoPessoa1,
              rendaMensalPessoa1:   d.CasalInfo.RendaMensalPessoa1,
              nomeCompletoPessoa2:  d.CasalInfo.NomeCompletoPessoa2,
              emailPessoa2:         d.CasalInfo.EmailPessoa2,
              cpfPessoa2:           d.CasalInfo.CPFPessoa2,
              dataNascimentoPessoa2: d.CasalInfo.DataNascimentoPessoa2,
              rendaMensalPessoa2:   d.CasalInfo.RendaMensalPessoa2,
              createdAt:            d.CasalInfo.CreatedAt,
            }
          : d.casalInfo || null,
      };

      this.#usuarioCache = normalizado;
      return normalizado;
    } catch (error) {
      console.error('Erro ao buscar dados completos:', error);
      // Se der 401, o interceptor já limpou o token
      return null;
    }
  }

  setUsuarioCache(usuario) { 
    this.#usuarioCache = usuario; 
  }
  
  clearCache() { 
    this.#usuarioCache = null; 
  }
}

export default new AuthService();