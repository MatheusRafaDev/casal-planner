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
      light: "#2F7D5B", // Verde Esmeralda Quente (Pessoa 1 / Marca padrão)
      hover: "#266B4D",
      dark: "#34D399",
      tint: "#ECFDF5",
      tintForeground: "#065F46",
    },
    accent: {
      light: "#D97706", // Âmbar Dourado Quente (Pessoa 2 / Acentos)
      hover: "#B45309",
      dark: "#FBBF24",
      tint: "#FEF3C7",
      tintForeground: "#92400E",
    },
    // Sistema de Cores do Casal
    couple: {
      p1: {
        light: "#2F7D5B",
        dark: "#34D399",
        name: "Pessoa 1",
        label: "Verde",
      },
      p2: {
        light: "#D97706",
        dark: "#FBBF24",
        name: "Pessoa 2",
        label: "Dourado",
      },
      joint: {
        light: "#2A7F8E",
        dark: "#38B2AC",
        name: "Conjunto",
        label: "Azul-petróleo",
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
      backgroundLight: "#FAF8F5", // Bege linho contemporâneo
      backgroundDark: "#11100F",  // Carvão quente
      cardLight: "#FFFFFF",
      cardDark: "#181716",
      borderLight: "#E8E3DA",
      borderDark: "#2A2724",
      foregroundLight: "#1C1917",
      foregroundDark: "#F5F3EF",
      mutedLight: "#F3EFE8",
      mutedDark: "#242220",
      mutedForegroundLight: "#78716C",
      mutedForegroundDark: "#A39E98",
    },
    // Semânticas
    semantic: {
      destructive: "#DC2626",
      destructiveTint: "#FEE2E2",
      success: "#10B981",
      successTint: "#ECFDF5",
      warning: "#F59E0B",
      warningTint: "#FEF3C7",
      info: "#0284C7",
      infoTint: "#E0F2FE",
    },
    // Paleta de Cômodos
    rooms: {
      sala: "#2F7D5B",
      cozinha: "#C85A32",
      quarto: "#386877",
      banheiro: "#4A7C59",
      lavanderia: "#D49B2A",
      escritorio: "#386877",
      varanda: "#A84E38",
      garagem: "#344C42",
      jardim: "#5E6E3B",
      gourmet: "#BC8A2C",
      closet: "#7A3E4D",
    } as Record<string, string>,
    // Paleta para gráficos (Dashboard)
    chartPalette: [
      "#2F7D5B", // Verde principal
      "#D97706", // Dourado
      "#C85A32", // Coral terracota
      "#2A7F8E", // Azul petróleo
      "#8A9A3B", // Oliva
      "#B4532E", // Argila
      "#4A7C59", // Musgo
      "#344C42", // Floresta profunda
    ],
  },
  // Tipografia
  typography: {
    fontDisplay: '"Plus Jakarta Sans", "Outfit", -apple-system, sans-serif',
    fontBrand: '"Outfit", "Plus Jakarta Sans", sans-serif',
    fontSans: '"Plus Jakarta Sans", "Inter", system-ui, sans-serif',
    fontHandwriting: '"Caveat", cursive, sans-serif',
    fontMono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
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
