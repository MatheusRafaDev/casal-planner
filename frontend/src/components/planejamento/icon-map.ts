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
import { DESIGN_TOKENS } from "@/design-system";

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
  "#1F5C43", // Verde Lar (Cor oficial do CasalPlanner)
  "#EF6F6C", // Coral (Acento oficial do casal)
  "#2F8A63", // Verde Folha
  "#C85A32", // Terracota / Argila aconchegante
  "#4A7C59", // Verde Sálvia / Alecrim
  "#386877", // Azul Petróleo / Ardósia
  "#B67332", // Madeira Carvalho / Caramelo
  "#5E6E3B", // Verde Oliva Natural
  "#2C5282", // Azul Noite Acolhedor
  "#BC8A2C", // Ocre / Âmbar
  "#A84E38", // Tijolinho / Cerâmica
  "#7A3E4D", // Marsala Suave
  "#344C42", // Grafite Floresta
];

/** Cores padrão recomendadas por nome de cômodo comum */
export const COMODO_DEFAULT_COLORS: Record<string, string> = {
  cozinha: DESIGN_TOKENS.colors.rooms.cozinha || "#EF6F6C",
  sala: DESIGN_TOKENS.colors.rooms.sala || "#1F5C43",
  quarto: DESIGN_TOKENS.colors.rooms.quarto || "#2F8A63",
  banheiro: DESIGN_TOKENS.colors.rooms.banheiro || "#2A7F8E",
  lavanderia: DESIGN_TOKENS.colors.rooms.lavanderia || "#16382A",
  escritório: DESIGN_TOKENS.colors.rooms.escritorio || "#5B6470",
  escritorio: DESIGN_TOKENS.colors.rooms.escritorio || "#5B6470",
  varanda: DESIGN_TOKENS.colors.rooms.varanda || "#C85A32",
  jardim: DESIGN_TOKENS.colors.rooms.jardim || "#5E6E3B",
  garagem: DESIGN_TOKENS.colors.rooms.garagem || "#344C42",
  gourmet: DESIGN_TOKENS.colors.rooms.gourmet || "#BC8A2C",
  closet: DESIGN_TOKENS.colors.rooms.closet || "#7A3E4D",
};

/** Mapeamento de cores legadas/antigas ou genéricas para os tons do sistema */
const LEGACY_COLOR_MAP: Record<string, string> = {
  "#27272a": "#1F5C43",
  "#2c5e2c": "#1F5C43",
  "#2f7d5b": "#1F5C43",
  "#b84a2c": "#EF6F6C",
  "#2c5280": "#2F8A63",
  "#6b5ea8": "#2A7F8E",
  "#e2d9ed": "#2A7F8E",
  "#97266d": "#16382A",
  "#a78bfa": "#2F8A63",
  "#8b5cf6": "#2F8A63",
  "#7c3aed": "#344C42",
  "#c084fc": "#5E6E3B",
  "#f472b6": "#EF6F6C",
  "#f59e0b": "#EF6F6C",
  "#fb7185": "#EF6F6C",
  "#34d399": "#1F5C43",
  "#38bdf8": "#2A7F8E",
  "#facc15": "#EF6F6C",
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

  return "#1F5C43";
}
