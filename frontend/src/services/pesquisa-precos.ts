import { api } from "@/lib/api";
import { brl } from "@/lib/formatters";
import type { PesquisaPrecoResposta } from "./types";

export const pesquisaPrecosService = {
  buscar: async (q: string, marca?: string): Promise<PesquisaPrecoResposta> => {
    const raw = await api<{
      produtos?: Array<{
        id?: number;
        nome?: string;
        loja?: string;
        preco?: number | null;
        precoAntigo?: number | null;
        link?: string;
        imagem?: string;
        logo_loja?: string;
        logo_marca?: string;
        is_trusted?: boolean;
        is_marketplace?: boolean;
        is_used?: boolean;
        marca?: string;
        parcelamento?: string | null;
      }>;
      marca_identificada?: string;
      nome_validado?: string;
      query_utilizada?: string;
      total?: number;
    }>('/api/pesquisaprecos', {
      query: { q, marca },
    });

    return {
      query: raw.query_utilizada ?? q,
      marcaDetectada: raw.marca_identificada,
      nomeCorrigido: raw.nome_validado,
      resultados: (raw.produtos ?? []).map((produto) => ({
        titulo: produto.nome ?? "",
        loja: produto.loja ?? "",
        preco: Number(produto.preco ?? 0),
        precoFormatado: brl(Number(produto.preco ?? 0)),
        link: produto.link ?? "",
        thumbnail: produto.imagem,
        parcelamento: produto.parcelamento ?? undefined,
        isTrusted: Boolean(produto.is_trusted),
        isMarketplace: Boolean(produto.is_marketplace),
        isUsed: Boolean(produto.is_used),
        lojaLogo: produto.logo_loja,
        marcaLogo: produto.logo_marca,
        marca: produto.marca,
      })),
    };
  },
};
