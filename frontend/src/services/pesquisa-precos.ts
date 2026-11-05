import { api } from "@/lib/api";
import { brl } from "@/lib/formatters";
import type { PesquisaPrecoResposta, PesquisaPrecoResultado, VideoPreview } from "./types";
import { ACHADINHOS_DATA } from "./indicacoes";

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

/**
 * Resolve qualquer link de vídeo (TikTok ou YouTube) diretamente no cliente
 * sem dependência obrigatória do backend.
 */
export function resolverVideoUrlLocal(url: string, fallbackTitle?: string): VideoPreview | null {
  if (!url || !url.trim()) return null;
  let cleanUrl = url.trim();

  // Se o usuário colou uma tag <iframe> completa, extrai a URL do src
  const iframeMatch = cleanUrl.match(/src=["']([^"']+)["']/i);
  if (iframeMatch) {
    cleanUrl = iframeMatch[1];
  }

  // 1. TikTok: ID numérico de vídeo, /v/, embed/v2/ ou player/v1/
  const tiktokMatch = cleanUrl.match(/(?:video\/|embed\/v2\/|player\/v1\/|\/v\/)(\d+)/i);
  const authorMatch = cleanUrl.match(/@([^/?#]+)/i);

  if (tiktokMatch) {
    const videoId = tiktokMatch[1];
    const author = authorMatch ? authorMatch[1] : "tiktok";
    return {
      id: `tiktok-${videoId}`,
      title: fallbackTitle || `Review no TikTok (@${author})`,
      author,
      platform: "tiktok",
      videoUrl: cleanUrl.startsWith("http") ? cleanUrl : `https://www.tiktok.com/@${author}/video/${videoId}`,
      playerUrl: `https://www.tiktok.com/player/v1/${videoId}?autoplay=1&muted=1&music_info=1&description=1`,
      thumbnailUrl: "",
    };
  }

  // 2. YouTube / Shorts
  const ytMatch = cleanUrl.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i);
  if (ytMatch) {
    const videoId = ytMatch[1];
    return {
      id: `yt-${videoId}`,
      title: fallbackTitle || "Demonstração no YouTube",
      author: "YouTube",
      platform: "youtube",
      videoUrl: cleanUrl,
      playerUrl: `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`,
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
    };
  }

  // 3. Se já for uma URL de player/embed direta
  if (
    (cleanUrl.startsWith("http://") || cleanUrl.startsWith("https://")) &&
    (cleanUrl.includes("/embed/") || cleanUrl.includes("/player/"))
  ) {
    return {
      id: `embed-${Date.now()}`,
      title: fallbackTitle || "Demonstração em Vídeo",
      author: cleanUrl.includes("tiktok") ? "TikTok" : "Vídeo",
      platform: cleanUrl.includes("tiktok") ? "tiktok" : "youtube",
      videoUrl: cleanUrl,
      playerUrl: cleanUrl,
      thumbnailUrl: "",
    };
  }

  return null;
}

export const pesquisaPrecosService = {
  async buscar(termo: string): Promise<PesquisaPrecoResposta> {
    const raw = await api<PesquisaPrecoRespostaBruta>(
      `/api/pesquisaprecos?q=${encodeURIComponent(termo)}`,
    );
    return mapearResposta(raw, termo);
  },

  async extrairLink(url: string): Promise<PesquisaPrecoResultado> {
    interface ExtracaoResposta {
      nome?: string;
      loja?: string;
      preco?: number | null;
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

  async buscarVideos(q: string): Promise<VideoPreview[]> {
    if (!q || !q.trim()) return [];
    const queryLimpa = q.trim();

    // 1. Tentar buscar pelo backend
    try {
      const res = await api<VideoPreview[]>(
        `/api/pesquisaprecos/videos?q=${encodeURIComponent(queryLimpa)}`,
      );
      if (res && res.length > 0) return res;
    } catch {
      // Continua para fallback resiliente
    }

    // 2. Fallback inteligente com a curadoria de achadinhos
    const termo = queryLimpa.toLowerCase();
    const palavras = termo.split(/\s+/).filter((w) => w.length > 2);
    const matches: VideoPreview[] = [];

    for (const item of ACHADINHOS_DATA) {
      if (!item.videoUrl) continue;

      const nomeLower = item.nome.toLowerCase();
      const dicaLower = item.dica.toLowerCase();
      const comodoLower = item.comodoNome.toLowerCase();
      const marcaLower = (item.marcaSugerida ?? "").toLowerCase();

      const matched =
        nomeLower.includes(termo) ||
        palavras.some(
          (w) =>
            nomeLower.includes(w) ||
            dicaLower.includes(w) ||
            marcaLower.includes(w) ||
            comodoLower.includes(w),
        );

      if (matched) {
        const prev = resolverVideoUrlLocal(item.videoUrl, item.nome);
        if (prev && !matches.some((m) => m.id === prev.id)) {
          matches.push({
            ...prev,
            title: `${item.nome} - Review no TikTok`,
            thumbnailUrl: item.fotoUrl,
          });
        }
      }
    }

    // Se nenhum match específico foi encontrado, retorna os virais mais populares
    if (matches.length === 0) {
      for (const item of ACHADINHOS_DATA.slice(0, 6)) {
        if (!item.videoUrl) continue;
        const prev = resolverVideoUrlLocal(item.videoUrl, item.nome);
        if (prev && !matches.some((m) => m.id === prev.id)) {
          matches.push({
            ...prev,
            title: `${item.nome} - Destaque TikTok`,
            thumbnailUrl: item.fotoUrl,
          });
        }
      }
    }

    return matches;
  },

  async obterPreviewVideo(url: string, fallbackTitle?: string): Promise<VideoPreview | null> {
    if (!url || !url.trim()) return null;
    const cleanUrl = url.trim();

    // 1. Tentar obter pelo backend local/Vercel
    try {
      const res = await api<VideoPreview>("/api/pesquisaprecos/video-preview", {
        method: "POST",
        body: { url: cleanUrl },
      });
      if (res && res.playerUrl) return res;
    } catch {
      // Ignora erro se backend não tiver o endpoint
    }

    // 2. Resolução direta no navegador (100% resiliente)
    const local = resolverVideoUrlLocal(cleanUrl, fallbackTitle);
    if (!local) return null;

    // 3. Tenta enriquecer com dados públicos do TikTok oEmbed com timeout curto
    if (local.platform === "tiktok") {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);
        const oembedRes = await fetch(
          `https://www.tiktok.com/oembed?url=${encodeURIComponent(cleanUrl)}`,
          { signal: controller.signal },
        );
        clearTimeout(timeoutId);
        if (oembedRes.ok) {
          const data = await oembedRes.json();
          if (data.title) local.title = data.title;
          if (data.author_name) local.author = data.author_name;
          if (data.thumbnail_url) local.thumbnailUrl = data.thumbnail_url;
        }
      } catch {
        // Já tem o playerUrl funcional
      }
    }

    return local;
  },
};
