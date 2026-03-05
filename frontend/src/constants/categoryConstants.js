// src/constants/categoryConstants.js
export const COLORS = [
  '0 72% 51%',    // Vermelho
  '15 85% 58%',   // Laranja
  '38 92% 50%',   // Amarelo
  '152 60% 42%',  // Verde
  '168 65% 38%',  // Verde água
  '200 70% 50%',  // Azul claro
  '230 60% 55%',  // Azul
  '262 60% 55%',  // Roxo
  '330 70% 50%',  // Rosa
  '280 50% 50%',  // Roxo escuro
];

export const ICONS = ['🏠', '🍳', '🛋️', '🛏️', '🚿', '👕', '🧹', '🪴', '🏋️', '🎮', '📚', '🧸', '🐾', '🚗', '💊'];

// Função auxiliar para converter HSL para Hex
export const hslToHex = (h, s, l) => {
  l /= 100;
  const a = s * Math.min(l, 1 - l) / 100;
  const f = n => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
};