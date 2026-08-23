import { api } from "@/lib/api";
import type { Usuario } from "@/services/types";

export interface CriarConviteDto {
  emailParceiro: string;
}

export interface ConviteResponseDto {
  token: string;
  linkConvite: string;
  expiraEm: string;
}

export interface AceitarConviteDto {
  token: string;
  migrarDados: boolean;
}

export interface InfoConviteDto {
  nomeConvidante: string;
  emailConvidante: string;
}

export interface AceitarConviteResponse {
  message: string;
  token: string;
  usuario: Usuario;
}

export interface MeuConviteDto {
  token: string;
  nomeConvidante: string;
  emailConvidante: string;
  expiraEm: string;
}

export const conviteService = {
  criar: (dto: CriarConviteDto) =>
    api<ConviteResponseDto>("/api/usuario/convite", {
      method: "POST",
      body: dto,
    }),

  obterInfo: (token: string) =>
    api<InfoConviteDto>(`/api/usuario/convite/${token}`),

  aceitar: (dto: AceitarConviteDto) =>
    api<AceitarConviteResponse>("/api/usuario/aceitar-convite", {
      method: "POST",
      body: dto,
    }),
    
  buscarMeusConvites: () =>
    api<MeuConviteDto[]>("/api/usuario/meus-convites"),
};
