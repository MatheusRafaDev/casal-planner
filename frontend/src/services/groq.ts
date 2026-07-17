import { api } from "@/lib/api";

export interface SugestaoItem {
  nome: string;
  motivo?: string;
  estimativa?: number;
}

export const groqService = {
  sugestoesComodo: (comodo: string) =>
    api<SugestaoItem[]>("/api/groq/sugestoes-comodo", { query: { comodo } }),
  detectarDuplicata: async (nome: string, categoriaId: string) => {
    const raw = await api<{
      detectado: boolean;
      itemSimilar?: string;
      mensagem?: string;
    } | {
      Detectado: boolean;
      ItemSimilar?: string;
      Mensagem?: string;
    }>("/api/groq/detectar-duplicata", {
      method: "POST",
      body: { nomeNovoItem: nome, categoriaId },
    });

    // Adaptar resposta do backend (PascalCase) para o formato esperado (camelCase)
    if ('Detectado' in raw) {
      return {
        duplicata: raw.Detectado,
        itemSimilar: raw.ItemSimilar,
      };
    }

    return {
      duplicata: raw.detectado,
      itemSimilar: raw.itemSimilar,
    };
  },
  resumoEnxoval: () => api<{ resumo: string }>("/api/groq/resumo-enxoval"),
  descobrirDominios: (nomes: string[]) =>
    api<Record<string, string>>("/api/groq/dominios", {
      method: "POST",
      body: { nomes },
    }),
};
