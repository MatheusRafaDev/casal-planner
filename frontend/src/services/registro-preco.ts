import { api } from "@/lib/api";

export interface AnaliseFotoPreco {
  produtoNome: string;
  marca?: string | null;
  preco: number;
  unidade?: string | null;
  endereco: string;
  nomeMercado?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

export interface ConfirmarRegistroPreco extends AnaliseFotoPreco {
  itemId?: string | null;
  dataCompra?: string;
  imagemBase64?: string | null;
}

export const registroPrecoService = {
  analisar: (imagemBase64: string, latitude?: number, longitude?: number) =>
    api<AnaliseFotoPreco>("/api/registroPreco/analisar", {
      method: "POST",
      body: { imagemBase64, latitude, longitude },
    }),
  confirmar: (registro: ConfirmarRegistroPreco) =>
    api("/api/registroPreco/confirmar", { method: "POST", body: registro }),
};
