import api, { pessoaStorage, tokenStorage } from "@/lib/api";

export interface Pessoa {
  nomeCompleto?: string;
  email?: string;
  cpf?: string;
  dataNascimento?: string;
  rendaMensal?: number;
}

export interface CasalInfo {
  pessoa1: Pessoa;
  pessoa2: Pessoa;
}

export interface Usuario {
  id: string;
  nomeCompleto?: string;
  email: string;
  tipoConta?: string | number;
  isCasal: boolean;
  modoEscuro?: boolean;
  rendaMensal?: number;
  cpf?: string;
  dataNascimento?: string;
  casalInfo?: CasalInfo | null;
  pessoaQueLogou?: "pessoa1" | "pessoa2" | null;
  metaGlobalEnxoval?: number;
}

interface RawUser {
  Id?: string;
  id?: string;
  NomeCompleto?: string;
  nomeCompleto?: string;
  Email?: string;
  email?: string;
  TipoConta?: string | number;
  tipoConta?: string | number;
  IsCasal?: boolean;
  isCasal?: boolean;
  ModoEscuro?: boolean;
  modoEscuro?: boolean;
  RendaMensal?: number;
  rendaMensal?: number;
  CPF?: string;
  cpf?: string;
  DataNascimento?: string;
  dataNascimento?: string;
  MetaGlobalEnxoval?: number;
  metaGlobalEnxoval?: number;
  pessoaLogada?: "pessoa1" | "pessoa2";
  pessoaQueLogou?: "pessoa1" | "pessoa2";
  CasalInfo?: Record<string, unknown>;
  casalInfo?: Record<string, unknown>;
  pessoa1?: Record<string, unknown>;
  pessoa2?: Record<string, unknown>;
}

function pickPessoa(raw: Record<string, unknown> | undefined): Pessoa {
  const r = (raw ?? {}) as Record<string, unknown>;
  const g = (a: string, b: string) => (r[a] ?? r[b]) as string | number | undefined;
  return {
    nomeCompleto: g("NomeCompleto", "nomeCompleto") as string | undefined,
    email: g("Email", "email") as string | undefined,
    cpf: g("CPF", "cpf") as string | undefined,
    dataNascimento: g("DataNascimento", "dataNascimento") as string | undefined,
    rendaMensal: g("RendaMensal", "rendaMensal") as number | undefined,
  };
}

function normalizar(d: RawUser, pessoaQueLogou: "pessoa1" | "pessoa2" | null = null): Usuario {
  const isCasal = Boolean(d.IsCasal ?? d.isCasal);
  let casalInfo: CasalInfo | null = null;

  if (isCasal) {
    const raw = (d.CasalInfo ?? d.casalInfo ?? (d as unknown as Record<string, unknown>)) as Record<string, unknown>;
    const p1raw = (raw.pessoa1 ?? d.pessoa1) as Record<string, unknown> | undefined;
    const p2raw = (raw.pessoa2 ?? d.pessoa2) as Record<string, unknown> | undefined;
    if (p1raw || p2raw) {
      casalInfo = { pessoa1: pickPessoa(p1raw), pessoa2: pickPessoa(p2raw) };
    }
  }

  return {
    id: (d.Id ?? d.id) as string,
    nomeCompleto: d.NomeCompleto ?? d.nomeCompleto,
    email: (d.Email ?? d.email) as string,
    tipoConta: d.TipoConta ?? d.tipoConta,
    isCasal,
    modoEscuro: d.ModoEscuro ?? d.modoEscuro,
    rendaMensal: d.RendaMensal ?? d.rendaMensal,
    cpf: d.CPF ?? d.cpf,
    dataNascimento: d.DataNascimento ?? d.dataNascimento,
    metaGlobalEnxoval: d.MetaGlobalEnxoval ?? d.metaGlobalEnxoval,
    casalInfo,
    pessoaQueLogou,
  };
}

let cache: Usuario | null = null;

export const authService = {
  async login(dados: { email: string; senha: string }): Promise<Usuario> {
    const response = await api.post("/auth/login", dados);
    const { token, usuario } = response.data ?? {};
    if (token) tokenStorage.set(token);
    const pessoaQueLogou = (usuario?.pessoaLogada ?? usuario?.pessoaQueLogou ?? null) as
      | "pessoa1"
      | "pessoa2"
      | null;
    pessoaStorage.set(pessoaQueLogou);
    const normalized = normalizar(usuario, pessoaQueLogou);
    cache = normalized;
    return normalized;
  },

  async logout() {
    try {
      await api.post("/auth/logout");
    } catch {
      /* ignore */
    } finally {
      tokenStorage.remove();
      cache = null;
    }
  },

  clearCache() {
    cache = null;
  },

  async fetchMe(): Promise<Usuario | null> {
    if (!tokenStorage.exists()) return null;
    try {
      const response = await api.get("/auth/me");
      const d = response.data;
      const pessoaQueLogou = (d.pessoaLogada ?? d.pessoaQueLogou ?? pessoaStorage.get()) as
        | "pessoa1"
        | "pessoa2"
        | null;
      if (d.pessoaLogada || d.pessoaQueLogou) pessoaStorage.set(pessoaQueLogou);
      const normalized = normalizar(d, pessoaQueLogou);
      cache = normalized;
      return normalized;
    } catch {
      return null;
    }
  },

  async getUsuario(): Promise<Usuario | null> {
    if (cache) return cache;
    return this.fetchMe();
  },
};
