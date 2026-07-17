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

export const CATEGORIA_COLORS = [
  "#a78bfa",
  "#8b5cf6",
  "#7c3aed",
  "#c084fc",
  "#f472b6",
  "#f59e0b",
  "#fb7185",
  "#34d399",
  "#38bdf8",
  "#facc15",
];
