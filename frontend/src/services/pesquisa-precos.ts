import { api } from "@/lib/api";
import { brl } from "@/lib/formatters";
import type { PesquisaPrecoResposta, PesquisaPrecoResultado } from "./types";

interface PesquisaPrecoRespostaBruta {
  produtos?: Array<{
    id?: number;
    nome?: string;
    loja?: string;
    preco?: number | null;
    precoAntigo?: number | null;
    precoOriginal?: number | null;
    url?: string;
    link?: string;
    imagem?: string;
    logo_loja?: string;
    logoLoja?: string;
    logo_marca?: string;
    logoMarca?: string;
    is_trusted?: boolean;
    isTrusted?: boolean;
    is_marketplace?: boolean;
    isMarketplace?: boolean;
    is_used?: boolean;
    isUsed?: boolean;
    marca?: string;
    parcelamento?: string | null;
  }>;
  marca_identificada?: string;
  marcaIdentificada?: string;
  nome_validado?: string;
  nomeValidado?: string;
  query_utilizada?: string;
  queryUtilizada?: string;
  total?: number;
}

function mapearResposta(
  raw: PesquisaPrecoRespostaBruta,
  queryOriginal: string,
): PesquisaPrecoResposta {
  return {
    query: raw.queryUtilizada ?? raw.query_utilizada ?? queryOriginal,
    marcaDetectada: raw.marcaIdentificada ?? raw.marca_identificada,
    nomeCorrigido: raw.nomeValidado ?? raw.nome_validado,
    resultados: (raw.produtos ?? []).map((produto) => ({
      titulo: produto.nome ?? "",
      loja: produto.loja ?? "",
      preco: Number(produto.preco ?? 0),
      precoFormatado: brl(Number(produto.preco ?? 0)),
      link: produto.url ?? produto.link ?? "",
      thumbnail: produto.imagem,
      parcelamento: produto.parcelamento ?? undefined,
      isTrusted: Boolean(produto.isTrusted ?? produto.is_trusted),
      isMarketplace: Boolean(produto.isMarketplace ?? produto.is_marketplace),
      isUsed: Boolean(produto.isUsed ?? produto.is_used),
      lojaLogo: produto.logoLoja ?? produto.logo_loja,
      marcaLogo: produto.logoMarca ?? produto.logo_marca,
      marca: produto.marca,
    })),
  };
}

export const pesquisaPrecosService = {
  buscar: async (q: string, marca?: string): Promise<PesquisaPrecoResposta> => {
    const raw = await api<PesquisaPrecoRespostaBruta>("/api/pesquisaprecos", {
      query: { q, marca },
    });

    return mapearResposta(raw, q);
  },

  extrairDeLink: async (url: string): Promise<PesquisaPrecoResultado> => {
    interface ExtracaoResposta {
      nome?: string;
      loja?: string;
      preco?: number;
      url?: string;
      imagem?: string;
      marca?: string;
      parcelamento?: string | null;
      logoLoja?: string;
      logo_loja?: string;
      logoMarca?: string;
      logo_marca?: string;
      isTrusted?: boolean;
      is_trusted?: boolean;
      isMarketplace?: boolean;
      is_marketplace?: boolean;
      isUsed?: boolean;
      is_used?: boolean;
    }

    const produto = await api<ExtracaoResposta>("/api/pesquisaprecos/extrair-link", {
      method: "POST",
      body: { url },
    });

    return {
      titulo: produto.nome ?? "",
      loja: produto.loja ?? "Link Direto",
      preco: Number(produto.preco ?? 0),
      precoFormatado: brl(Number(produto.preco ?? 0)),
      link: produto.url ?? url,
      thumbnail: produto.imagem,
      marca: produto.marca,
      parcelamento: produto.parcelamento ?? undefined,
      lojaLogo: produto.logoLoja ?? produto.logo_loja,
      marcaLogo: produto.logoMarca ?? produto.logo_marca,
      isTrusted: Boolean(produto.isTrusted ?? produto.is_trusted ?? true),
      isMarketplace: Boolean(produto.isMarketplace ?? produto.is_marketplace),
      isUsed: Boolean(produto.isUsed ?? produto.is_used),
    };
  },
};
