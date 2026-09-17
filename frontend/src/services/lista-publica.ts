import { api } from "@/lib/api";

export interface ItemPublico {
  id: string;
  nome: string;
  marca?: string;
  preco?: number;
  quantidade: number;
  comprado: boolean;
  loja?: string;
  linkProduto?: string;
  fotoUrl?: string;
  prioridade: string;
  origem: string;
  variantes?: string[];
}

export interface ListaPublicaResponse {
  casal: string;
  itens: ItemPublico[];
}

export const listaPublicaService = {
  getLista: (slug: string) => api<ListaPublicaResponse>(`/api/public/lista/${slug}`),

  presentear: (slug: string, itemId: string, nomeConvidado: string) =>
    api<{ message: string; undoToken?: string }>(`/api/public/lista/${slug}/presentear/${itemId}`, {
      method: "POST",
      body: { nomeConvidado },
    }),

  desfazerPresente: (slug: string, itemId: string, token: string) =>
    api<{ message: string }>(`/api/public/lista/${slug}/presentear/${itemId}?token=${token}`, {
      method: "DELETE",
    }),
};
