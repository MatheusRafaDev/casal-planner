/**
 * DESIGN SYSTEM TOKENS - CasalPlanner
 *
 * Central Source of Truth para todas as cores, tipografia, raios e paletas do sistema.
 * Para alterar as cores ou visual do sistema, basta editar este arquivo ou as variáveis CSS em styles.css.
 */

export const DESIGN_TOKENS = {
  // Paleta da Marca
  colors: {
    primary: {
      light: "#1F5C43", // Verde Lar (fundos, títulos, botões)
      hover: "#2F8A63", // Verde Folha (hover, sucesso)
      dark: "#2F8A63",
      tint: "#E7ECE9", // Névoa (divisores, fundos suaves)
      tintForeground: "#1F5C43",
    },
    accent: {
      light: "#EF6F6C", // Coral (acento: ponto, coração, destaques)
      hover: "#E05A57",
      dark: "#EF6F6C",
      tint: "#F6B3B0", // Coral Claro (fundos suaves)
      tintForeground: "#1B2438", // Tinta (contraste 4,5:1 sobre coral)
    },
    // Sistema de Cores do Casal
    couple: {
      p1: {
        light: "#1F5C43",
        dark: "#2F8A63",
        name: "Pessoa 1",
        label: "Verde Lar",
      },
      p2: {
        light: "#EF6F6C",
        dark: "#EF6F6C",
        name: "Pessoa 2",
        label: "Coral (Complementar)",
      },
      joint: {
        light: "#2F8A63",
        dark: "#38B2AC",
        name: "Conjunto",
        label: "Verde Folha",
      },
      gift: {
        light: "#8B5CF6",
        dark: "#A78BFA",
        name: "Presente / Ganho",
        label: "Roxo",
      },
    },
    // Cores de Superfície e Neutros
    neutral: {
      backgroundLight: "#FAF6F1", // Creme (fundo das telas)
      backgroundDark: "#16382A", // Verde Floresta (modo escuro e contraste)
      cardLight: "#FFFFFF",
      cardDark: "#1B4433",
      borderLight: "#EEE3D8", // Borda 2px creme
      borderDark: "#245440",
      foregroundLight: "#1B2438", // Tinta (texto principal)
      foregroundDark: "#FAF6F1",
      mutedLight: "#E7ECE9", // Névoa
      mutedDark: "#1F4A38",
      mutedForegroundLight: "#5B6470", // Cinza (texto secundário)
      mutedForegroundDark: "#A4B2AA",
    },
    // Semânticas
    semantic: {
      destructive: "#DC2626",
      destructiveTint: "#FEE2E2",
      success: "#1F5C43",
      successTint: "#E7ECE9",
      warning: "#EF6F6C",
      warningTint: "#F6B3B0",
      info: "#2A7F8E",
      infoTint: "#E0F2FE",
    },
    // Paleta de Cômodos
    rooms: {
      sala: "#1F5C43",
      cozinha: "#EF6F6C",
      quarto: "#2F8A63",
      banheiro: "#2A7F8E",
      lavanderia: "#16382A",
      escritorio: "#5B6470",
      varanda: "#C85A32",
      garagem: "#344C42",
      jardim: "#5E6E3B",
      gourmet: "#BC8A2C",
      closet: "#7A3E4D",
    } as Record<string, string>,
    // Paleta para gráficos (Dashboard)
    chartPalette: [
      "#1F5C43", // Verde Lar
      "#EF6F6C", // Coral
      "#2F8A63", // Verde Folha
      "#16382A", // Verde Floresta
      "#F6B3B0", // Coral Claro
      "#5B6470", // Cinza
      "#2A7F8E", // Azul petróleo
    ],
  },
  // Tipografia
  typography: {
    fontDisplay: '"Plus Jakarta Sans", system-ui, -apple-system, sans-serif',
    fontBrand: '"Plus Jakarta Sans", system-ui, -apple-system, sans-serif',
    fontSans: '"Plus Jakarta Sans", system-ui, -apple-system, sans-serif',
    fontHandwriting: '"Caveat", cursive, sans-serif',
    fontMono: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  },
  // Raios de Borda
  radii: {
    sm: "8px",
    md: "10px",
    lg: "12px",
    xl: "16px",
    full: "9999px",
  },
  // Sombras Padronizadas
  shadows: {
    stickerSm: "0 1px 2px 0 rgb(0 0 0 / 0.04)",
    sticker: "0 1px 3px 0 rgb(0 0 0 / 0.05), 0 1px 2px -1px rgb(0 0 0 / 0.03)",
    stickerLg: "0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.03)",
    modal: "0 20px 25px -5px rgb(0 0 0 / 0.08), 0 8px 10px -6px rgb(0 0 0 / 0.04)",
  },
} as const;

export type DesignTokens = typeof DESIGN_TOKENS;
