// ============================================================
// authService.js — Autenticação via localStorage + Bearer token
// ============================================================
import api, { tokenStorage, pessoaStorage } from './api';

class AuthService {
  #usuarioCache = null;

  async login(dados) {
    try {
      const response = await api.post('/auth/login', dados);
      const { token, usuario } = response.data;

      if (token) {
        tokenStorage.set(token);
      }

      if (usuario) {
        // O backend retorna "pessoaLogada" no login; normaliza para "pessoaQueLogou"
        const pessoaQueLogou = usuario.pessoaLogada || usuario.pessoaQueLogou || null;

        // Persiste no localStorage para sobreviver a reload
        pessoaStorage.set(pessoaQueLogou);

        const normalizado = this.#normalizar(usuario, pessoaQueLogou);
        this.#usuarioCache = normalizado;
        return normalizado;
      }

      return response.data;
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      throw error;
    }
  }

  async logout() {
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignora erros de rede no logout
    } finally {
      tokenStorage.remove(); // também remove pessoaStorage (veja api.js)
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

      // Recupera a pessoa logada que foi salva no login
      // (o /me não a retorna pois o JWT não carrega essa info)
      const pessoaQueLogou = pessoaStorage.get();

      const normalizado = this.#normalizar(d, pessoaQueLogou);
      this.#usuarioCache = normalizado;
      return normalizado;
    } catch (error) {
      console.error('Erro ao buscar dados completos:', error);
      return null;
    }
  }

  // ─── Normaliza qualquer resposta (login ou /me) para formato padrão ───
  #normalizar(d, pessoaQueLogou = null) {
    const isCasal = d.IsCasal ?? d.isCasal ?? false;

    // Estrutura casalInfo pode vir de dois shapes:
    //   /login: { pessoa1: {...}, pessoa2: {...} }  (já aninhado)
    //   /me:    { casalInfo: { pessoa1, pessoa2 } } (aninhado diferente)
    //   ou campos flat no raiz da resposta
    let casalInfo = null;

    if (isCasal) {
      const raw = d.CasalInfo || d.casalInfo || d;

      // Shape aninhado: { pessoa1: { nomeCompleto, email, ... } }
      if (raw.pessoa1 || d.pessoa1) {
        const p1 = raw.pessoa1 || d.pessoa1 || {};
        const p2 = raw.pessoa2 || d.pessoa2 || {};
        casalInfo = {
          pessoa1: {
            nomeCompleto:   p1.NomeCompleto  || p1.nomeCompleto,
            email:          p1.Email         || p1.email,
            cpf:            p1.CPF           || p1.cpf,
            dataNascimento: p1.DataNascimento|| p1.dataNascimento,
            rendaMensal:    p1.RendaMensal   ?? p1.rendaMensal,
          },
          pessoa2: {
            nomeCompleto:   p2.NomeCompleto  || p2.nomeCompleto,
            email:          p2.Email         || p2.email,
            cpf:            p2.CPF           || p2.cpf,
            dataNascimento: p2.DataNascimento|| p2.dataNascimento,
            rendaMensal:    p2.RendaMensal   ?? p2.rendaMensal,
          },
          // compat aliases
          nomeCompletoPessoa1: p1.NomeCompleto  || p1.nomeCompleto,
          emailPessoa1:        p1.Email         || p1.email,
          cpfPessoa1:          p1.CPF           || p1.cpf,
          dataNascimentoPessoa1: p1.DataNascimento || p1.dataNascimento,
          rendaMensalPessoa1:  p1.RendaMensal   ?? p1.rendaMensal,
          nomeCompletoPessoa2: p2.NomeCompleto  || p2.nomeCompleto,
          emailPessoa2:        p2.Email         || p2.email,
          cpfPessoa2:          p2.CPF           || p2.cpf,
          dataNascimentoPessoa2: p2.DataNascimento || p2.dataNascimento,
          rendaMensalPessoa2:  p2.RendaMensal   ?? p2.rendaMensal,
          createdAt:           raw.CreatedAt   || raw.createdAt,
        };
      } else {
        // Shape flat: CasalInfo.NomeCompletoPessoa1, etc.
        casalInfo = {
          pessoa1: {
            nomeCompleto:   raw.NomeCompletoPessoa1  || raw.nomeCompletoPessoa1,
            email:          raw.EmailPessoa1         || raw.emailPessoa1,
            cpf:            raw.CPFPessoa1           || raw.cpfPessoa1,
            dataNascimento: raw.DataNascimentoPessoa1|| raw.dataNascimentoPessoa1,
            rendaMensal:    raw.RendaMensalPessoa1   ?? raw.rendaMensalPessoa1,
          },
          pessoa2: {
            nomeCompleto:   raw.NomeCompletoPessoa2  || raw.nomeCompletoPessoa2,
            email:          raw.EmailPessoa2         || raw.emailPessoa2,
            cpf:            raw.CPFPessoa2           || raw.cpfPessoa2,
            dataNascimento: raw.DataNascimentoPessoa2|| raw.dataNascimentoPessoa2,
            rendaMensal:    raw.RendaMensalPessoa2   ?? raw.rendaMensalPessoa2,
          },
          nomeCompletoPessoa1: raw.NomeCompletoPessoa1 || raw.nomeCompletoPessoa1,
          emailPessoa1:        raw.EmailPessoa1        || raw.emailPessoa1,
          cpfPessoa1:          raw.CPFPessoa1          || raw.cpfPessoa1,
          dataNascimentoPessoa1: raw.DataNascimentoPessoa1 || raw.dataNascimentoPessoa1,
          rendaMensalPessoa1:  raw.RendaMensalPessoa1  ?? raw.rendaMensalPessoa1,
          nomeCompletoPessoa2: raw.NomeCompletoPessoa2 || raw.nomeCompletoPessoa2,
          emailPessoa2:        raw.EmailPessoa2        || raw.emailPessoa2,
          cpfPessoa2:          raw.CPFPessoa2          || raw.cpfPessoa2,
          dataNascimentoPessoa2: raw.DataNascimentoPessoa2 || raw.dataNascimentoPessoa2,
          rendaMensalPessoa2:  raw.RendaMensalPessoa2  ?? raw.rendaMensalPessoa2,
          createdAt:           raw.CreatedAt           || raw.createdAt,
        };
      }
    }

    return {
      id:             d.Id            || d.id,
      nomeCompleto:   d.NomeCompleto  || d.nomeCompleto,
      email:          d.Email         || d.email,
      tipoConta:      d.TipoConta     ?? d.tipoConta,
      isCasal,
      modoEscuro:     d.ModoEscuro    ?? d.modoEscuro,
      rendaMensal:    d.RendaMensal   ?? d.rendaMensal,
      cpf:            d.CPF           || d.cpf,
      dataNascimento: d.DataNascimento|| d.dataNascimento,
      createdAt:      d.CreatedAt     || d.createdAt,
      lastLoginAt:    d.LastLoginAt   || d.lastLoginAt,
      pessoaQueLogou,  // sempre preservado do localStorage
      casalInfo,
    };
  }

  setUsuarioCache(usuario) {
    this.#usuarioCache = usuario;
  }

  clearCache() {
    this.#usuarioCache = null;
  }
}

export default new AuthService();