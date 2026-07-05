import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

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
    height: 100%;
  }

  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI',
      'Roboto', 'Helvetica Neue', sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background-color: ${({ theme }) => theme?.background || '#111113'};
    color: ${({ theme }) => theme?.text || '#f4f4f5'};
    transition: background-color 0.2s, color 0.2s;
    overflow-x: hidden;
    min-height: 100vh;
    min-height: 100dvh;
    min-height: -webkit-fill-available;
  }

  #root {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    min-height: 100dvh;
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
    font-family: 'Inter', sans-serif;
    font-size: 16px !important;
    -webkit-tap-highlight-color: transparent;
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
    -webkit-box-shadow: 0 0 0 1000px ${({ theme }) => theme?.surface2 || '#212124'} inset !important;
    -webkit-text-fill-color: ${({ theme }) => theme?.text || '#f4f4f5'} !important;
    caret-color: ${({ theme }) => theme?.primary || '#8b5cf6'} !important;
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
    color: ${({ theme }) => theme?.textSoft || '#a1a1aa'};
  }

  /* ===== Scrollbar global moderna ===== */
  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track {
    background: transparent;
  }
  ::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme?.borderLight || '#3f3f46'};
    border-radius: 6px;
  }
  ::-webkit-scrollbar-thumb:hover {
    background: ${({ theme }) => theme?.textSoft || '#a1a1aa'};
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

  /* ===== Toaster Media Queries ===== */
  @media (max-width: 900px) {
    .toast-container {
      display: none !important;
    }
  }
`;

export default GlobalStyle;
