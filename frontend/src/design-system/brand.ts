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
    prefix: "casal",
    suffix: "planner",
  },
  tagline: "organizador de compras do casal",
  slogan: "Organizador de compras do casal",
  description:
    "Organizador de compras do casal: planeje o enxoval e compras da casa nova por cômodo, controle orçamentos em dinheiro e VR/VA e tome decisões a dois.",
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
  themeColor: "#1F5C43", // Verde Lar
  themeColorDark: "#16382A", // Verde Floresta
  backgroundColor: "#FAF7F2", // Creme Linho Suave
  accentColor: "#DE5D4E", // Coral Terracota
} as const;

export type BrandConfig = typeof BRAND_CONFIG;
