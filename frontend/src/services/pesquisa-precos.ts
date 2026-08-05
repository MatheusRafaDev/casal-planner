import { api } from "@/lib/api";
import { brl } from "@/lib/formatters";
import type { PesquisaPrecoResposta } from "./types";

interface PesquisaPrecoRespostaBruta {
  produtos?: Array<{
    id?: number;
    nome?: string;
    loja?: string;
    preco?: number | null;
    precoAntigo?: number | null;
    // A API de pesquisa expõe a URL como `url`. `link` é mantido como
    // compatibilidade para respostas antigas.
    url?: string;
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
}

export interface ProdutoIdentificadoFoto {
  produtoNome: string;
  marca?: string | null;
  preco: number;
  unidade?: string | null;
}

export interface PesquisaPrecoPorFotoResposta extends PesquisaPrecoResposta {
  produtoIdentificado: ProdutoIdentificadoFoto;
}

interface PesquisaPrecoPorFotoRespostaBruta extends PesquisaPrecoRespostaBruta {
  produto_identificado?: {
    produto_nome?: string;
    marca?: string | null;
    preco?: number | null;
    unidade?: string | null;
  };
}

function mapearResposta(raw: PesquisaPrecoRespostaBruta, queryOriginal: string): PesquisaPrecoResposta {
  return {
    query: raw.query_utilizada ?? queryOriginal,
    marcaDetectada: raw.marca_identificada,
    nomeCorrigido: raw.nome_validado,
    resultados: (raw.produtos ?? []).map((produto) => ({
      titulo: produto.nome ?? "",
      loja: produto.loja ?? "",
      preco: Number(produto.preco ?? 0),
      precoFormatado: brl(Number(produto.preco ?? 0)),
      link: produto.url ?? produto.link ?? "",
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
}

export const pesquisaPrecosService = {
  buscar: async (q: string, marca?: string): Promise<PesquisaPrecoResposta> => {
    const raw = await api<PesquisaPrecoRespostaBruta>("/api/pesquisaprecos", {
      query: { q, marca },
    });

    return mapearResposta(raw, q);
  },
  analisarFoto: async (imagemBase64: string): Promise<PesquisaPrecoPorFotoResposta> => {
    const raw = await api<PesquisaPrecoPorFotoRespostaBruta>("/api/pesquisaprecos/analisar-foto", {
      method: "POST",
      body: { imagemBase64 },
    });
    const produtoIdentificado = raw.produto_identificado;

    if (!produtoIdentificado?.produto_nome) {
      throw new Error("Não consegui identificar o produto na foto, tente digitar manualmente.");
    }

    return {
      ...mapearResposta(raw, produtoIdentificado.produto_nome),
      produtoIdentificado: {
        produtoNome: produtoIdentificado.produto_nome,
        marca: produtoIdentificado.marca,
        preco: Number(produtoIdentificado.preco ?? 0),
        unidade: produtoIdentificado.unidade,
      },
    };
  },
};
