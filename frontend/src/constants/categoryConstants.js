// src/constants/categoryConstants.js
export const COLORS = [
  '0 70% 50%',   // Vermelho
  '30 70% 50%',   // Laranja
  '60 70% 50%',   // Amarelo
  '120 70% 50%',  // Verde
  '180 70% 50%',  // Ciano
  '240 70% 50%',  // Azul
  '280 70% 50%',  // Roxo
  '320 70% 50%',  // Rosa
];

export const ICONS = ['🏠', '🛒', '🍔', '🚗', '💼', '🎮', '👕', '📚', '💻', '🏥', '🎓', '✈️', '🎬', '🏋️', '🐶', '🌱'];

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

export const hexToHsl = (hex) => {
  // Remove o # se existir
  hex = hex.replace(/^#/, '');
  
  // Converte para RGB
  let r = parseInt(hex.substring(0, 2), 16) / 255;
  let g = parseInt(hex.substring(2, 4), 16) / 255;
  let b = parseInt(hex.substring(4, 6), 16) / 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  
  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  
  // Converte para porcentagens e formata como string
  h = Math.round(h * 360);
  s = Math.round(s * 100);
  l = Math.round(l * 100);
  
  return `${h} ${s}% ${l}%`;
};