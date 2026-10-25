/**
 * BRAND CONFIGURATION - CasalPlanner
 * 
 * Configurações de marca, logos, nomenclatura e slogans.
 * Para mudar a logo, nome da marca ou ícones de forma global, altere as propriedades abaixo.
 */

export const BRAND_CONFIG = {
  // Identidade Verbal
  name: "CasalPlanner",
  nameParts: {
    prefix: "Casal",
    suffix: "Planner",
  },
  tagline: "Planejamento a dois",
  slogan: "Organize seu enxoval com o seu par",
  description:
    "Planeje a compra dos itens da casa nova por cômodo, controle orçamento em VR e dinheiro, e pesquise preços com IA. Feito para casais e para você.",
  author: "CasalPlanner",

  // Arquivos de Logotipo e Assets (armazenados em /public)
  assets: {
    logoPng: "/logo.png",
    logoSvg: "/logo.svg",
    logoIconSvg: "/logo-icon.svg",
    logoTextSvg: "/logo-texto.svg",
    logoTextDarkSvg: "/logo-texto-dark.svg",
    faviconSvg: "/favicon.svg",
    faviconPng: "/favicon.png",
    appleTouchIcon: "/apple-touch-icon.png",
  },

  // Cores do Tema da Marca (usadas em meta tags, manifest, PWA)
  themeColor: "#2F7D5B",
  themeColorDark: "#11100F",
} as const;

export type BrandConfig = typeof BRAND_CONFIG;
