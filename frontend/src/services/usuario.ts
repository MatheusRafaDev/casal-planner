import { api } from "@/lib/api";
import type { LoginResponse, Usuario } from "./types";

export interface RegistroIndividualDTO {
  nomeCompleto: string;
  email: string;
  senha: string;
  cpf?: string;
  dataNascimento?: string;
  rendaMensal?: number;
}

export interface RegistroCasalDTO {
  pessoa1: {
    nome: string;
    email: string;
    senha: string;
    cpf?: string;
    dataNascimento?: string;
    rendaMensal?: number;
  };
  pessoa2: {
    nome: string;
    email: string;
    senha: string;
    cpf?: string;
    dataNascimento?: string;
    rendaMensal?: number;
  };
}

export const usuarioService = {
  registrarIndividual: (dto: RegistroIndividualDTO) =>
    api<LoginResponse>("/api/usuario/registrar", {
      method: "POST",
      auth: false,
      body: dto,
    }),
  registrarCasal: (dto: RegistroCasalDTO) =>
    api<LoginResponse>("/api/usuario/registrar-casal", {
      method: "POST",
      auth: false,
      body: {
        nomeCompletoPessoa1: dto.pessoa1.nome,
        emailPessoa1: dto.pessoa1.email,
        senhaPessoa1: dto.pessoa1.senha,
        cpfPessoa1: dto.pessoa1.cpf,
        dataNascimentoPessoa1: dto.pessoa1.dataNascimento,
        rendaMensalPessoa1: dto.pessoa1.rendaMensal,
        nomeCompletoPessoa2: dto.pessoa2.nome,
        emailPessoa2: dto.pessoa2.email,
        senhaPessoa2: dto.pessoa2.senha,
        cpfPessoa2: dto.pessoa2.cpf,
        dataNascimentoPessoa2: dto.pessoa2.dataNascimento,
        rendaMensalPessoa2: dto.pessoa2.rendaMensal,
      },
    }),
  atualizarPerfil: (dto: Partial<Usuario>) =>
    api<Usuario>("/api/usuario/perfil", { method: "PUT", body: dto }),
  atualizarPerfilCasal: (
    id: string,
    pessoa: 1 | 2,
    dto: { nome?: string; dataNascimento?: string | null; rendaMensal?: number | null },
  ) =>
    api<Usuario>(`/api/usuario/perfil-casal/${id}`, {
      method: "PUT",
      body:
        pessoa === 2
          ? {
              nomeCompletoPessoa2: dto.nome,
              dataNascimentoPessoa2: dto.dataNascimento,
              rendaMensalPessoa2: dto.rendaMensal,
            }
          : {
              nomeCompletoPessoa1: dto.nome,
              dataNascimentoPessoa1: dto.dataNascimento,
              rendaMensalPessoa1: dto.rendaMensal,
            },
    }),
  toggleModoEscuro: (id: string, modoEscuro: boolean) =>
    api<Usuario>(`/api/usuario/modo-escuro/${id}`, {
      method: "PUT",
      body: { modoEscuro },
    }),
  alterarSenha: (email: string, senhaAtual: string, novaSenha: string) =>
    api("/api/usuario/alterar-senha", {
      method: "POST",
      body: { email, senhaAtual, novaSenha },
    }),
  excluirConta: (id: string) => api(`/api/usuario/usuario/${id}`, { method: "DELETE" }),
  atualizarMetaEnxoval: (meta: number) =>
    api<Usuario>("/api/usuario/perfil", {
      method: "PUT",
      body: { metaGlobalEnxoval: meta },
    }),
};
