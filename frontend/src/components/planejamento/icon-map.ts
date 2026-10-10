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

export const CATEGORIA_COLORS = ["#7655a6", "#9a83bd", "#b8abc9", "#6b7280", "#a85b4b", "#a77721"];
