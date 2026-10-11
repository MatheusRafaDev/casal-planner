import {
  Sofa,
  Bed,
  UtensilsCrossed,
  Bath,
  WashingMachine,
  Refrigerator,
  Lamp,
  Baby,
  BookOpen,
  Tv,
  Wrench,
  Home,
  Car,
  Shirt,
  PawPrint,
  Sparkles,
  Package,
  Coffee,
  Flower,
  Gamepad2,
  type LucideIcon,
} from "lucide-react";

export const ICON_MAP: Record<string, LucideIcon> = {
  Sofa,
  Bed,
  UtensilsCrossed,
  Bath,
  WashingMachine,
  Refrigerator,
  Lamp,
  Baby,
  BookOpen,
  Tv,
  Wrench,
  Home,
  Car,
  Shirt,
  PawPrint,
  Sparkles,
  Package,
  Coffee,
  Flower,
  Gamepad2,
};

export const ICON_NAMES = Object.keys(ICON_MAP);

export function iconFor(name?: string | null): LucideIcon {
  if (!name) return Package;
  if (name === "🍳") return Refrigerator;
  if (name === "🛋️") return Sofa;
  if (name === "🛏️") return Bed;
  if (name === "🛁") return Bath;
  if (name === "🧼") return WashingMachine;
  if (name === "📁") return Package;
  return ICON_MAP[name] ?? Package;
}

/**
 * Paleta refinada de cômodos em harmonia com o design system do CasalPlanner:
 * Tons acolhedores da casa (Verde Floresta, Dourado, Terracota, Sálvia, Madeira, Petróleo, Oliva, Caramelo).
 */
export const CATEGORIA_COLORS = [
  "#2F7D5B", // Verde Floresta (Cor oficial do CasalPlanner)
  "#E8B63C", // Dourado Mostarda (Cor do casal)
  "#C85A32", // Terracota / Argila aconchegante
  "#4A7C59", // Verde Sálvia / Alecrim
  "#386877", // Azul Petróleo / Ardósia
  "#B67332", // Madeira Carvalho / Caramelo
  "#5E6E3B", // Verde Oliva Natural
  "#2C5282", // Azul Noite Acolhedor
  "#BC8A2C", // Ocre / Âmbar Dourado
  "#A84E38", // Tijolinho / Cerâmica
  "#7A3E4D", // Marsala Suave
  "#344C42", // Grafite Floresta
];

/** Cores padrão recomendadas por nome de cômodo comum */
export const COMODO_DEFAULT_COLORS: Record<string, string> = {
  cozinha: "#2F7D5B",
  sala: "#C85A32",
  quarto: "#386877",
  banheiro: "#4A7C59",
  lavanderia: "#D49B2A",
  escritório: "#B67332",
  escritorio: "#B67332",
  varanda: "#5E6E3B",
  jardim: "#5E6E3B",
  garagem: "#344C42",
  gourmet: "#BC8A2C",
  closet: "#7A3E4D",
};

/** Mapeamento de cores legadas/antigas ou genéricas para os tons do sistema */
const LEGACY_COLOR_MAP: Record<string, string> = {
  "#27272a": "#2F7D5B",
  "#2c5e2c": "#2F7D5B",
  "#b84a2c": "#C85A32",
  "#2c5280": "#386877",
  "#6b5ea8": "#4A7C59",
  "#e2d9ed": "#4A7C59",
  "#97266d": "#D49B2A",
  "#a78bfa": "#386877",
  "#8b5cf6": "#386877",
  "#7c3aed": "#344C42",
  "#c084fc": "#5E6E3B",
  "#f472b6": "#C85A32",
  "#f59e0b": "#E8B63C",
  "#fb7185": "#A84E38",
  "#34d399": "#2F7D5B",
  "#38bdf8": "#386877",
  "#facc15": "#E8B63C",
};

/**
 * Retorna uma cor perfeitamente harmonizada com o sistema para o cômodo
 */
export function comodoColor(bg?: string | null, nome?: string | null): string {
  const nomeNorm = nome?.trim().toLowerCase();
  if (nomeNorm && COMODO_DEFAULT_COLORS[nomeNorm]) {
    // Se a cor for padrão/legada ou ausente, prioriza a cor harmoniosa do cômodo
    if (!bg || LEGACY_COLOR_MAP[bg.toLowerCase()]) {
      return COMODO_DEFAULT_COLORS[nomeNorm];
    }
  }

  if (bg) {
    const bgLower = bg.toLowerCase();
    if (LEGACY_COLOR_MAP[bgLower]) {
      return LEGACY_COLOR_MAP[bgLower];
    }
    return bg;
  }

  if (nomeNorm) {
    for (const [key, cor] of Object.entries(COMODO_DEFAULT_COLORS)) {
      if (nomeNorm.includes(key)) return cor;
    }
  }

  return "#2F7D5B";
}
