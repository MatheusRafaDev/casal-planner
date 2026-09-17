export interface SugestaoItem {
  nome: string;
  motivo?: string;
  estimativa?: number;
}

export const groqService = {
  sugestoesComodo: async (comodo: string) => [] as SugestaoItem[],
  detectarDuplicata: async (nome: string, categoriaId: string) => ({
    duplicata: false,
    itemSimilar: undefined,
  }),
  resumoEnxoval: async () => ({ resumo: "" }),
  descobrirDominios: async (nomes: string[]) => ({} as Record<string, string>),
};
