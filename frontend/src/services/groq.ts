import { api } from "@/lib/api";

export interface SugestaoItem {
  nome: string;
  motivo?: string;
  estimativa?: number;
  prioridade?: "Alta" | "Média" | "Baixa";
}

export interface DuplicataResult {
  duplicata: boolean;
  itemSimilar?: string;
  motivo?: string;
}

export interface EstimativaComodo {
  comodo: string;
  faixaEssencial: number;
  faixaMedia: number;
  faixaCompleta: number;
  descricao: string;
}

export const groqService = {
  sugestoesComodo: async (comodo: string): Promise<SugestaoItem[]> => {
    if (!comodo.trim()) return [];
    try {
      return await api<SugestaoItem[]>("/api/groq/sugestoes-comodo", {
        query: { comodo: comodo.trim() },
      });
    } catch {
      return [];
    }
  },

  detectarDuplicata: async (nome: string, categoriaId?: string): Promise<DuplicataResult> => {
    if (!nome.trim()) return { duplicata: false };
    try {
      return await api<DuplicataResult>("/api/groq/detectar-duplicata", {
        method: "POST",
        body: { nome: nome.trim(), categoriaId },
      });
    } catch {
      return { duplicata: false };
    }
  },

  estimativaComodo: async (comodo: string): Promise<EstimativaComodo | null> => {
    if (!comodo.trim()) return null;
    try {
      return await api<EstimativaComodo>("/api/groq/estimativa-comodo", {
        query: { comodo: comodo.trim() },
      });
    } catch {
      return null;
    }
  },

  descobrirDominios: async (nomes: string[]): Promise<Record<string, string>> => {
    if (!nomes.length) return {};
    try {
      return await api<Record<string, string>>("/api/groq/dominios", {
        method: "POST",
        body: { nomes },
      });
    } catch {
      return {};
    }
  },

  resumoEnxoval: async (): Promise<{ resumo: string }> => {
    return { resumo: "" };
  },
};
