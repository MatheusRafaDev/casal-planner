import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  *, *::before, *::after {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html {
    scroll-behavior: smooth;
    /* Impede o iOS de aumentar fonte ao rotacionar */
    -webkit-text-size-adjust: 100%;
    text-size-adjust: 100%;
    /* CORREÇÃO iPhone: html deve usar height: 100%, não -webkit-fill-available */
    height: 100%;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI',
      'Roboto', 'Helvetica Neue', sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background-color: ${({ theme }) => theme?.background || '#fafafa'};
    color: ${({ theme }) => theme?.text || '#333'};
    transition: background-color 0.3s, color 0.3s;
    overflow-x: hidden;
    /* CORREÇÃO iPhone: sequência completa de fallback para viewport height */
    min-height: 100vh;
    min-height: 100dvh;
    min-height: -webkit-fill-available;
    /* NÃO coloca padding-bottom aqui — o MainContent já cuida */
  }

  /* ===== iOS: remove highlight ao tocar ===== */
  * {
    -webkit-tap-highlight-color: transparent;
  }

  /* ===== Tap targets mínimos de 44px (HIG Apple) ===== */
  button, a, [role="button"], select,
  input[type="submit"], input[type="button"] {
    touch-action: manipulation;
    -webkit-tap-highlight-color: transparent;
    cursor: pointer;
  }

  /* ===== Previne zoom no iOS ao focar inputs ===== */
  input, select, textarea {
    font-size: 16px !important;
    -webkit-tap-highlight-color: transparent;
    /* Scroll momentum nativo no iOS */
    -webkit-overflow-scrolling: touch;
  }

  /* ===== Autocomplete: remove fundo amarelo/azul no iOS ===== */
  input:-webkit-autofill,
  input:-webkit-autofill:hover,
  input:-webkit-autofill:focus,
  input:-webkit-autofill:active,
  textarea:-webkit-autofill,
  textarea:-webkit-autofill:hover,
  textarea:-webkit-autofill:focus,
  select:-webkit-autofill,
  select:-webkit-autofill:hover,
  select:-webkit-autofill:focus {
    -webkit-box-shadow: 0 0 0 1000px ${({ theme }) => theme?.surface || '#ffffff'} inset !important;
    -webkit-text-fill-color: ${({ theme }) => theme?.text || '#333333'} !important;
    caret-color: ${({ theme }) => theme?.text || '#333333'} !important;
    transition: background-color 5000s ease-in-out 0s;
  }

  /* ===== Previne bounce/overscroll iOS em modais ===== */
  .modal-open {
    overflow: hidden;
    position: fixed;
    width: 100%;
    height: 100%;
  }

  /* ===== Scroll com momentum em containers ===== */
  .scroll-touch {
    -webkit-overflow-scrolling: touch;
    overflow-y: auto;
  }

  .loading {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    min-height: 100dvh;
    font-size: 1.2rem;
    color: ${({ theme }) => theme?.textSoft || '#666'};
  }

  /* ===== Scrollbar desktop ===== */
  @media (min-width: 769px) {
    ::-webkit-scrollbar { width: 10px; height: 10px; }
    ::-webkit-scrollbar-track {
      background: ${({ theme }) => theme?.borderLight || '#f0f0f0'};
      border-radius: 10px;
    }
    ::-webkit-scrollbar-thumb {
      background: ${({ theme }) => theme?.primary || '#A78BFA'};
      border-radius: 10px;
    }
    ::-webkit-scrollbar-thumb:hover {
      background: ${({ theme }) => theme?.primaryDark || '#8B5CF6'};
    }
  }

  /* ===== Mobile: scrollbar minúscula ===== */
  @media (max-width: 768px) {
    ::-webkit-scrollbar { width: 3px; height: 3px; }
  }

  /* ===== Animações globais ===== */
  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  @keyframes slideUp {
    from { transform: translateY(20px); opacity: 0; }
    to   { transform: translateY(0);    opacity: 1; }
  }

  @keyframes slideInFromBottom {
    from { transform: translateY(100%); opacity: 0; }
    to   { transform: translateY(0);    opacity: 1; }
  }

`;

export default GlobalStyle;
