export const COLORS = [
  '0 70% 50%',
  '30 70% 50%',
  '60 70% 50%',
  '120 70% 50%',
  '180 70% 50%',
  '210 70% 50%',
  '240 70% 50%',
  '280 70% 50%',
  '320 70% 50%',
];

export const ICONS = [
  'Home', 'ShoppingCart', 'Pizza', 'Car', 'CreditCard', 'Coins', 'GraduationCap', 'Pill',
  'Shirt', 'Gamepad2', 'Plane', 'HeartPulse', 'Bath', 'Utensils', 'Droplet', 'BedDouble',
  'Armchair', 'Package', 'Dog', 'Gift', 'Zap', 'Smartphone', 'Laptop', 'Music',
  'Coffee', 'Apple', 'Briefcase', 'Wrench', 'Book', 'Mirror'
];

export const EMOJI_TO_LUCIDE_MAP = {
  '🏠': 'Home', '🛒': 'ShoppingCart', '🍕': 'Pizza', '🚗': 'Car', '💳': 'CreditCard',
  '💰': 'Coins', '🎓': 'GraduationCap', '💊': 'Pill', '👕': 'Shirt', '🎮': 'Gamepad2',
  '✈️': 'Plane', '🏥': 'HeartPulse', '🛁': 'Bath', '🍳': 'Utensils', '🧼': 'Droplet',
  '🛏️': 'BedDouble', '🛋️': 'Armchair', '📦': 'Package', '🐶': 'Dog', '🎁': 'Gift',
  '⚡': 'Zap', '📱': 'Smartphone', '💻': 'Laptop', '🎵': 'Music',
  '📺': 'Tv', '☕': 'Coffee', '🍎': 'Apple', '🧸': 'Smile', '🌱': 'Leaf',
  '🚪': 'DoorClosed', '💼': 'Briefcase', '🪑': 'Armchair', '🖼️': 'Image', '🧴': 'Droplets',
  '🧻': 'Scroll', '🔧': 'Wrench', '🐱': 'Cat', '🪴': 'Flower2', '📚': 'Book',
  '🧣': 'Shirt', '🪞': 'Monitor', '🧽': 'Sponge', '📋': 'ClipboardList'
};

export const hslToHex = (h, s, l) => {
  l /= 100;
  const a = s * Math.min(l, 1 - l) / 100;
  const f = n => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return '#' + f(0) + f(8) + f(4);
};

export const hexToHsl = (hex) => {
  hex = hex.replace(/^#/, '');
  
  let r = parseInt(hex.substring(0, 2), 16) / 255;
  let g = parseInt(hex.substring(2, 4), 16) / 255;
  let b = parseInt(hex.substring(4, 6), 16) / 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  
  if (max === min) {
    h = s = 0;
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
  
  h = Math.round(h * 360);
  s = Math.round(s * 100);
  l = Math.round(l * 100);
  
  return h + ' ' + s + '% ' + l + '%';
};

export const getAvailableColor = (existingCategories = []) => {
  const usedColors = existingCategories.map(cat => {
    if (cat.bg) {
      if (cat.bg.startsWith('#')) {
        return hexToHsl(cat.bg);
      }
      return cat.bg;
    }
    return null;
  }).filter(Boolean);
  
  for (const color of COLORS) {
    if (!usedColors.includes(color)) {
      return color;
    }
  }
  
  return COLORS[0];
};

export const getHexColor = (hslString) => {
  const match = hslString.match(/(\d+)\s*(\d+)%\s*(\d+)%/);
  if (match) {
    const h = parseInt(match[1]);
    const s = parseInt(match[2]);
    const l = parseInt(match[3]);
    return hslToHex(h, s, l);
  }
  return '#3b82f6';
};