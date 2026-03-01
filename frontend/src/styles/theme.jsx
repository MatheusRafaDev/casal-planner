// Tema Claro - CORES PADRÃO (neutras)
export const lightTheme = {
  // Cores principais - neutras/padrão
  background: '#18181B',     // Fundo principal (🌑)
  surface: '#27272A',        // Fundo secundário (cards) (🌒)
  card: '#27272A',           // Cards
  hover: '#3F3F46',          // Fundo hover (🌘)
  
  // Cores principais - suas cores adaptadas
  primary: '#A78BFA',        // Roxo principal (🟣)
  primaryDark: '#C4B5FD',    // Roxo hover (mais claro) (💜)
  primaryLight: '#DDD6FE',   // Lilás claro (💜)
  
  secondary: '#F9A8D4',      // Rosa suave (🌸)
  secondaryDark: '#FBCFE8',  // Rosa mais claro - hover
  secondaryLight: '#3a2a3a', // Rosa escuro - backgrounds
  
  accent: '#EF4444',         // Vermelho padrão
  accentDark: '#DC2626',     // Vermelho escuro - hover
  accentLight: '#FEE2E2',    // Vermelho claro - backgrounds
  
  // Cores de fundo
  background: '#F9FAFB',     // Fundo principal (cinza muito claro)
  surface: '#FFFFFF',        // Superfície (cards, modais) - branco
  card: '#FFFFFF',           // Cards - branco
  hover: '#F3F4F6',          // Fundo hover (cinza claro)
  
  // Cores de texto
  text: '#111827',           // Texto principal (quase preto)
  textSoft: '#4B5563',       // Texto secundário (cinza escuro)
  textLight: '#9CA3AF',      // Texto terciário (cinza médio)
  textDisabled: '#D1D5DB',   // Texto desabilitado (cinza claro)
  
  // Cores de borda
  border: '#E5E7EB',         // Borda padrão (cinza claro)
  borderLight: '#F3F4F6',    // Borda mais clara
  
  // Estados financeiros
  success: '#10B981',        // Verde - positivo
  warning: '#F59E0B',        // Amarelo - aviso
  error: '#EF4444',          // Vermelho - negativo
  info: '#3B82F6',           // Azul - informação
  
  // Cores específicas do app
  vrva: '#8B5CF6',           // Roxo - VR/VA
  vrvaLight: '#EDE9FE',      // Roxo claro
  normal: '#6B7280',         // Cinza - normal
  normalLight: '#F3F4F6',    // Cinza claro
  
  // Gradientes
  gradient: 'linear-gradient(135deg, #A78BFA 0%, #F9A8D4 100%)',
  gradientSoft: 'linear-gradient(135deg, #F9FAFB 0%, #F3F4F6 100%)',
  gradientAccent: 'linear-gradient(135deg, #EF4444 0%, #8B5CF6 100%)',
  
  // Sombras
  shadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
  shadowHover: '0 10px 15px rgba(0, 0, 0, 0.1)',
  shadowCard: '0 4px 12px rgba(0, 0, 0, 0.05)',
  
  // Border radius
  radius: '8px',
  radiusSm: '4px',
  radiusLg: '12px',
  radiusFull: '9999px',
};

// Tema Escuro - CALOR HUMANO (suas cores)
export const darkTheme = {
  // Cores de fundo - suas cores
  background: '#18181B',     // Fundo principal (🌑)
  surface: '#27272A',        // Fundo secundário (cards) (🌒)
  card: '#27272A',           // Cards
  hover: '#3F3F46',          // Fundo hover (🌘)
  
  // Cores principais - suas cores adaptadas
  primary: '#A78BFA',        // Roxo principal (🟣)
  primaryDark: '#C4B5FD',    // Roxo hover (mais claro) (💜)
  primaryLight: '#DDD6FE',   // Lilás claro (💜)
  
  secondary: '#F9A8D4',      // Rosa suave (🌸)
  secondaryDark: '#FBCFE8',  // Rosa mais claro - hover
  secondaryLight: '#3a2a3a', // Rosa escuro - backgrounds
  
  accent: '#FF6B6B',         // Coral
  accentDark: '#ff8a8a',     // Coral claro - hover
  accentLight: '#3a2a2a',    // Coral escuro - backgrounds
  
  // Cores de texto - suas cores
  text: '#F4F4F5',           // Texto principal (🤍)
  textSoft: '#D4D4D8',       // Texto secundário (🩶)
  textLight: '#71717A',      // Texto terciário
  textDisabled: '#71717A',   // Texto desabilitado (⚫)
  
  // Cores de borda
  border: '#3F3F46',         // Borda padrão
  borderLight: '#52525B',    // Borda mais clara
  
  // Estados financeiros - suas cores
  success: '#34D399',        // Verde - positivo (🟢)
  warning: '#FBBF24',        // Amarelo - aviso
  error: '#F87171',          // Vermelho - negativo (🔴)
  info: '#60A5FA',           // Azul - informação
  
  // Cores específicas do app - adaptadas
  vrva: '#A78BFA',           // Roxo para VR/VA
  vrvaLight: '#322a4a',      // Roxo escuro
  normal: '#F9A8D4',         // Rosa para Normal
  normalLight: '#3a2a3a',    // Rosa escuro
  
  // Gradientes - com suas cores
  gradient: 'linear-gradient(135deg, #A78BFA 0%, #F9A8D4 100%)',
  gradientSoft: 'linear-gradient(135deg, #27272A 0%, #18181B 100%)',
  gradientAccent: 'linear-gradient(135deg, #FF6B6B 0%, #A78BFA 100%)',
  
  // Sombras
  shadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
  shadowHover: '0 10px 15px rgba(0, 0, 0, 0.4)',
  shadowCard: '0 4px 12px rgba(0, 0, 0, 0.2)',
  
  // Border radius
  radius: '8px',
  radiusSm: '4px',
  radiusLg: '12px',
  radiusFull: '9999px',
};