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
  fotoFile?: File;
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

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

function objectToFormData(obj: any): FormData {
  const formData = new FormData();
  Object.entries(obj).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    
    if (key === 'divisaoPagamento' && typeof value === 'object') {
      formData.append('divisaoPagamento.valorPessoa1', (value as any).valorPessoa1.toString());
      formData.append('divisaoPagamento.valorPessoa2', (value as any).valorPessoa2.toString());
    } else if (value instanceof File) {
      formData.append(key, value);
    } else {
      formData.append(key, value.toString());
    }
  });
  return formData;
}

export const itensService = {
  listar: () => api<Item[]>("/api/itens"),
  listarPaginado: (params: {
    categoriaId?: string;
    busca?: string;
    status?: string;
    pagamento?: string;
    responsavelId?: number;
    page: number;
    pageSize: number;
  }) => {
    const qs = new URLSearchParams();
    if (params.categoriaId) qs.append("categoriaId", params.categoriaId);
    if (params.busca) qs.append("busca", params.busca);
    if (params.status) qs.append("status", params.status);
    if (params.pagamento) qs.append("pagamento", params.pagamento);
    if (params.responsavelId) qs.append("responsavelId", params.responsavelId.toString());
    qs.append("page", params.page.toString());
    qs.append("pageSize", params.pageSize.toString());
    return api<PagedResult<Item>>(`/api/itens/page?${qs.toString()}`);
  },
  porCategoria: (categoriaId: string) => api<Item[]>(`/api/itens/categoria/${categoriaId}`),
  criar: (dto: ItemInputDTO) => api<Item>("/api/itens", { method: "POST", body: objectToFormData(dto) }),
  atualizar: (id: string, dto: Partial<ItemInputDTO>) =>
    api<Item>(`/api/itens/${id}`, { method: "PUT", body: objectToFormData(dto) }),
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
