export { DESIGN_TOKENS, type DesignTokens } from "./tokens";
export { BRAND_CONFIG, type BrandConfig } from "./brand";

/**
 * Retorna a cor padrão harmonizada para um cômodo pelo nome ou ID
 */
export function getRoomDefaultColor(roomName?: string | null): string {
  if (!roomName) return "#1F5C43";
  const norm = roomName.trim().toLowerCase();

  const map: Record<string, string> = {
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
  };

  for (const [key, color] of Object.entries(map)) {
    if (norm.includes(key)) return color;
  }
  return "#1F5C43";
}
