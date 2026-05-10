import api, { tokenStorage, pessoaStorage } from './api';

export interface Usuario {
  id: string;
  nomeCompleto: string;
  email: string;
  tipoConta: number;
  isCasal: boolean;
  modoEscuro: boolean;
  rendaMensal: number;
  cpf: string;
  dataNascimento: string;
  createdAt: string;
  lastLoginAt: string;
  pessoaQueLogou: string | null;
  casalInfo: any;
}

class AuthService {
  private usuarioCache: Usuario | null = null;

  async login(dados: any): Promise<Usuario | any> {
    try {
      const response = await api.post('/auth/login', dados);
      const { token, usuario } = response.data;

      if (token) {
        await tokenStorage.set(token);
      }

      if (usuario) {
        const pessoaQueLogou = usuario.pessoaLogada || usuario.pessoaQueLogou || null;
        await pessoaStorage.set(pessoaQueLogou);

        const normalizado = this.normalizar(usuario, pessoaQueLogou);
        this.usuarioCache = normalizado;
        return normalizado;
      }

      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignora erros de rede no logout
    } finally {
      await tokenStorage.remove();
      this.clearCache();
    }
  }

  clearCache() {
    this.usuarioCache = null;
  }

  async getUsuario(): Promise<Usuario | null> {
    if (this.usuarioCache) return this.usuarioCache;
    if (!(await tokenStorage.exists())) return null;

    try {
      return await this.buscarDadosCompletos();
    } catch {
      return null;
    }
  }

  async estaAutenticado(): Promise<boolean> {
    const usuario = await this.getUsuario();
    return usuario !== null;
  }

  async buscarDadosCompletos(): Promise<Usuario | null> {
    try {
      const response = await api.get('/auth/me');
      const d = response.data;
      const pessoaQueLogou = await pessoaStorage.get();

      const normalizado = this.normalizar(d, pessoaQueLogou);
      this.usuarioCache = normalizado;
      return normalizado;
    } catch (error) {
      console.error('Erro ao buscar dados completos:', error);
      return null;
    }
  }

  private normalizar(d: any, pessoaQueLogou: string | null = null): Usuario {
    const isCasal = d.IsCasal ?? d.isCasal ?? false;
    let casalInfo = null;

    if (isCasal) {
      const raw = d.CasalInfo || d.casalInfo || d;
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
          }
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
      pessoaQueLogou,
      casalInfo,
    };
  }
}

export default new AuthService();
