import { api } from "@/lib/api";
import type { Item } from "./types";

export interface ItemInputDTO {
  nome: string;
  marca?: string;
  preco: number;
  quantidade: number;
  categoriaId: string;
  comprado?: boolean;
  pagamento?: "normal" | "vr";
  prioridade?: string;
  loja?: string;
  linkProduto?: string;
  fotoUrl?: string;
  parcelas?: number;
  varianteSelecionadaId?: string | null;
  clearVarianteSelecionadaId?: boolean;
  origem?: string;
  origemDescricao?: string;
  responsavelId?: 1 | 2 | null;
  clearResponsavelId?: boolean;
  divisaoPagamento?: {
    valorPessoa1: number;
    valorPessoa2: number;
  } | null;
  clearDivisaoPagamento?: boolean;
}

export const itensService = {
  listar: () => api<Item[]>("/api/itens"),
  porCategoria: (categoriaId: string) => api<Item[]>(`/api/itens/categoria/${categoriaId}`),
  criar: (dto: ItemInputDTO) => api<Item>("/api/itens", { method: "POST", body: dto }),
  atualizar: (id: string, dto: Partial<ItemInputDTO>) =>
    api<Item>(`/api/itens/${id}`, { method: "PUT", body: dto }),
  toggleComprado: (id: string, comprado: boolean) =>
    api<Item>(`/api/itens/${id}/comprado`, { method: "PATCH", body: { comprado } }),
  moverCategoria: (id: string, categoriaId: string) =>
    api<Item>(`/api/itens/${id}/categoria`, {
      method: "PUT",
      body: { categoriaId },
    }),
  excluir: (id: string) => api(`/api/itens/${id}`, { method: "DELETE" }),
  limparVariante: (id: string) =>
    api<Item>(`/api/itens/${id}`, {
      method: "PUT",
      body: { clearVarianteSelecionadaId: true },
    }),
};
