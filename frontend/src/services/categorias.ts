import { api } from "@/lib/api";
import type { Categoria } from "./types";

export interface CategoriaInputDTO {
  nome: string;
  icon: string;
  bg: string;
  ordem?: number;
  metaOrcamento?: number | null;
  removerMeta?: boolean;
}

export const categoriasService = {
  listar: () => api<Categoria[]>("/api/categorias"),
  criar: (dto: CategoriaInputDTO) =>
    api<Categoria>("/api/categorias", { method: "POST", body: dto }),
  atualizar: (id: string, dto: Partial<CategoriaInputDTO>) =>
    api<Categoria>(`/api/categorias/${id}`, { method: "PUT", body: dto }),
  excluir: (id: string) => api(`/api/categorias/${id}`, { method: "DELETE" }),
};
