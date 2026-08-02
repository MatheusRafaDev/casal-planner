import { api } from "@/lib/api";
import type { Categoria, Resumo, ResumoCategoria } from "./types";

type RawResumo = Partial<Resumo> & {
  atual?: {
    totalGeral?: number;
    totalNormal?: number;
    totalVR?: number;
    totalVr?: number;
    totalItens?: number;
    totalComprados?: number;
    totalPessoa1?: number;
    totalPessoa2?: number;
    porCategoria?: Record<string, number>;
    quantidadePorCategoria?: Record<string, number>;
    compradosPorCategoria?: Record<string, number>;
  };
  comparativo?: {
    totalGeral?: number;
    mesAtual?: number;
    mesPassado?: number;
    mesRetrasado?: number;
  };
  enxoval?: {
    metaGlobalEnxoval?: number | null;
    percentualMetaGlobal?: number | null;
  };
};

export function adaptarResumo(raw: RawResumo, categorias: Categoria[] = []): Resumo {
  // Se já vem no formato esperado, retorna direto.
  if (raw && Array.isArray(raw.porCategoria) && typeof raw.totalGeral === "number") {
    return raw as Resumo;
  }

  const catMap = new Map(categorias.map((c) => [c.id, c]));
  const atual = raw.atual ?? {};
  const comparativo = raw.comparativo ?? {};
  const enxoval = raw.enxoval ?? {};

  const porCatDict = atual.porCategoria ?? {};
  const qtdDict = atual.quantidadePorCategoria ?? {};
  const compDict = atual.compradosPorCategoria ?? {};

  const porCategoria: ResumoCategoria[] = Object.entries(porCatDict).map(
    ([categoriaId, totalGasto]) => {
      const cat = catMap.get(categoriaId);
      return {
        categoriaId,
        categoriaNome: cat?.nome ?? "Categoria",
        totalGasto: Number(totalGasto) || 0,
        totalItens: Number(qtdDict[categoriaId] ?? 0),
        itensComprados: Number(compDict[categoriaId] ?? 0),
        metaOrcamento: cat?.metaOrcamento ?? null,
        cor: cat?.bg ?? null,
        icon: cat?.icon ?? null,
      };
    },
  );

  return {
    totalGeral: atual.totalGeral ?? 0,
    totalNormal: atual.totalNormal ?? 0,
    totalVr: atual.totalVR ?? atual.totalVr ?? 0,
    totalItens: atual.totalItens ?? 0,
    itensComprados: atual.totalComprados ?? 0,
    totalPessoa1: atual.totalPessoa1 ?? 0,
    totalPessoa2: atual.totalPessoa2 ?? 0,
    metaGlobal: enxoval.metaGlobalEnxoval ?? null,
    percentualMeta: enxoval.percentualMetaGlobal ?? null,
    mesAtual: comparativo.mesAtual ?? 0,
    mesPassado: comparativo.mesPassado ?? 0,
    mesRetrasado: comparativo.mesRetrasado ?? 0,
    variacaoMensal: comparativo.totalGeral ?? null,
    porCategoria,
  };
}

export const resumoService = {
  obter: () => api<Resumo>("/api/resumo"),
  obterRaw: () => api<RawResumo>("/api/resumo"),
  obterAdaptado: async (categorias: Categoria[] = []): Promise<Resumo> => {
    const raw = await api<RawResumo>("/api/resumo");
    return adaptarResumo(raw, categorias);
  },
};
