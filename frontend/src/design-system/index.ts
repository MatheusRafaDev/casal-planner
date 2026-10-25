export { DESIGN_TOKENS, type DesignTokens } from "./tokens";
export { BRAND_CONFIG, type BrandConfig } from "./brand";

/**
 * Retorna a cor padrão harmonizada para um cômodo pelo nome ou ID
 */
export function getRoomDefaultColor(roomName?: string | null): string {
  if (!roomName) return "#2F7D5B";
  const norm = roomName.trim().toLowerCase();
  
  const map: Record<string, string> = {
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
  };

  for (const [key, color] of Object.entries(map)) {
    if (norm.includes(key)) return color;
  }
  return "#2F7D5B";
}
