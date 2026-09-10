const DOMINIOS_CONHECIDOS: Record<string, string> = {
  // ── Grandes lojas brasileiras ──
  "magazine luiza": "magazineluiza.com.br",
  magalu: "magazineluiza.com.br",
  americanas: "americanas.com.br",
  submarino: "submarino.com.br",
  shoptime: "shoptime.com.br",
  "casas bahia": "casasbahia.com.br",
  "ponto frio": "pontofrio.com.br",
  ponto: "pontofrio.com.br",
  extra: "extra.com.br",
  carrefour: "carrefour.com.br",
  walmart: "walmart.com",
  "fast shop": "fastshop.com.br",
  fastshop: "fastshop.com.br",
  kabum: "kabum.com.br",
  terabyte: "terabyteshop.com.br",
  pichau: "pichau.com.br",
  "loja do mecânico": "lojadomecanico.com.br",
  netshoes: "netshoes.com.br",
  centauro: "centauro.com.br",
  dafiti: "dafiti.com.br",
  renner: "renner.com.br",
  riachuelo: "riachuelo.com.br",
  "c&a": "cea.com.br",
  cea: "cea.com.br",
  havan: "havan.com.br",
  "leroy merlin": "leroymerlin.com.br",
  "tok stok": "tokstok.com.br",
  "tok&stok": "tokstok.com.br",
  etna: "etna.com.br",
  "madeira madeira": "madeiramadeira.com.br",
  shopee: "shopee.com.br",
  aliexpress: "aliexpress.com",
  shein: "shein.com",
  amazon: "amazon.com.br",
  "mercado livre": "mercadolivre.com.br",
  mercadolivre: "mercadolivre.com.br",
  "mercado pago": "mercadopago.com.br",
  olx: "olx.com.br",
  enjoei: "enjoei.com.br",
  eletrosom: "eletrosom.com.br",
  buscape: "buscape.com.br",
  zoom: "zoom.com.br",
  "barato de fábrica": "baratodefabrica.com.br",

  // ── Marcas de tecnologia ──
  apple: "apple.com",
  samsung: "samsung.com",
  lg: "lg.com",
  sony: "sony.com.br",
  xiaomi: "xiaomi.com",
  motorola: "motorola.com.br",
  nokia: "nokia.com",
  huawei: "huawei.com",
  positivo: "positivo.com.br",
  dell: "dell.com",
  hp: "hp.com",
  lenovo: "lenovo.com",
  acer: "acer.com",
  asus: "asus.com",
  microsoft: "microsoft.com",
  intel: "intel.com",
  amd: "amd.com",
  nvidia: "nvidia.com",
  philips: "philips.com.br",
  panasonic: "panasonic.com",
  jbl: "jbl.com",
  multilaser: "multilaser.com.br",
  intelbras: "intelbras.com.br",
  elgin: "elgin.com.br",

  // ── Marcas de eletrodomésticos ──
  brastemp: "brastemp.com.br",
  consul: "consul.com.br",
  electrolux: "electrolux.com.br",
  whirlpool: "whirlpool.com",
  arno: "arno.com.br",
  britania: "britania.com.br",
  mondial: "mondial.ind.br",
  philco: "philco.com.br",
  ge: "ge.com",
  tramontina: "tramontina.com",
  fischer: "fischer.com.br",
  suggar: "suggar.com.br",

  // ── Móveis e casa ──
  ikea: "ikea.com",
  mobly: "mobly.com.br",
  oppa: "oppa.com.br",
  westwing: "westwing.com.br",
  "futon company": "futoncompany.com.br",

  // ── Moda ──
  zara: "zara.com",
  "h&m": "hm.com",
  hm: "hm.com",
  "forever 21": "forever21.com",
  adidas: "adidas.com.br",
  nike: "nike.com.br",
  puma: "puma.com",
  havaianas: "havaianas.com.br",
  melissa: "melissa.com.br",
  olympikus: "olympikus.com.br",

  // ── Saúde e beleza ──
  natura: "natura.com.br",
  avon: "avon.com.br",
  boticario: "boticario.com.br",
  "o boticário": "boticario.com.br",
  loreal: "loreal.com.br",
  "l'oreal": "loreal.com.br",
  dove: "dove.com",
  pantene: "pantene.com",
  garnier: "garnier.com",
  rexona: "rexona.com",
  colgate: "colgate.com.br",
  "oral-b": "oralb.com",
  gillette: "gillette.com",
};

export const getFaviconUrls = (domain: string, name?: string | null) => {
  const brandName = name || domain.split(".")[0];
  return domain === "mercadolivre.com.br"
    ? [
        `https://http2.mlstatic.com/frontend-assets/ml-web-navigation/ui-navigation/6.6.73/mercadolibre/favicon.svg`,
      ]
    : [
        `https://logo.clearbit.com/${domain}`,
        `https://icon.horse/icon/${domain}`,
        `https://www.google.com/s2/favicons?domain=${domain}&sz=128`,
        `https://icons.duckduckgo.com/ip3/${domain}.ico`,
        `https://ui-avatars.com/api/?name=${encodeURIComponent(brandName)}&background=random&color=fff&size=128&bold=true`,
      ];
};

/** Normaliza um nome para lookup no mapa local */
const normalizar = (s: string) => s.toLowerCase().trim();

/** Tenta extrair domínio de uma URL */
const domainFromUrl = (url: string) => {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
};

/** Retorna as URLs do favicon para um nome/loja/marca, usando IA + mapa local inteligente + fallbacks. */
export const getLogoUrls = (
  name?: string | null,
  fallbackUrl?: string | null,
  resolvedDomains: Record<string, string> = {},
): string[] => {
  // 1. Domínio resolvido pela IA (mais específico, sempre em 1º lugar se existir)
  if (name && resolvedDomains[name]) {
    return getFaviconUrls(resolvedDomains[name], name);
  }

  // 2. Mapa local (rápido e confiável para grandes marcas/lojas brasileiras)
  if (name) {
    const key = normalizar(name);
    if (DOMINIOS_CONHECIDOS[key]) {
      return getFaviconUrls(DOMINIOS_CONHECIDOS[key], name);
    }
    // Busca parcial (ex: "Magazine Luiza ML" → "magazine luiza")
    const partial = Object.keys(DOMINIOS_CONHECIDOS).find(
      (k) => key.includes(k) || k.includes(key),
    );
    if (partial) return getFaviconUrls(DOMINIOS_CONHECIDOS[partial], name);
  }

  // 3. Extrai o domínio da URL do produto (se existir)
  if (fallbackUrl) {
    const d = domainFromUrl(fallbackUrl);
    if (d) return getFaviconUrls(d, name);
  }

  // 4. Tentativa ingênua: nome.com.br
  if (name) {
    const slug = normalizar(name)
      .replace(/\s+/g, "")
      .replace(/[^a-z0-9]/g, "");
    return getFaviconUrls(`${slug}.com.br`, name);
  }

  return [];
};
