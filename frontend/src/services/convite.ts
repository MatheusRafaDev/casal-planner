import { api } from "@/lib/api";

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
}

export const conviteService = {
  criar: (dto: CriarConviteDto) => 
    api<ConviteResponseDto>("/api/usuario/convite", {
      method: "POST",
      body: JSON.stringify(dto),
    }),
  
  aceitar: (dto: AceitarConviteDto) => 
    api<{ message: string }>("/api/usuario/aceitar-convite", {
      method: "POST",
      body: JSON.stringify(dto),
    }),
};
