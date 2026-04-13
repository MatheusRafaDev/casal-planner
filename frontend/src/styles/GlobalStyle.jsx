import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html {
    scroll-behavior: smooth;
    -webkit-text-size-adjust: 100%;
    text-size-adjust: 100%;
    /* Evita layout shift ao abrir teclado virtual no iOS */
    height: -webkit-fill-available;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
      sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background-color: ${({ theme }) => theme?.background || '#fafafa'};
    color: ${({ theme }) => theme?.text || '#333'};
    /* Transição suave no tema mas sem bloquear paint inicial */
    transition: background-color 0.25s, color 0.25s;
    overflow-x: hidden;
    /* iOS safe area */
    padding-bottom: env(safe-area-inset-bottom);
    /* Previne bounce iOS na página toda */
    overscroll-behavior-y: none;
    /* Altura correta no iOS quando teclado abre */
    min-height: 100vh;
    min-height: -webkit-fill-available;
  }

  /* Torna toque mais responsivo — remove delay de 300ms */
  * {
    touch-action: manipulation;
  }

  /* Alvos de toque mínimos (WCAG 2.5.5) */
  button, a, [role="button"], select,
  input[type="submit"], input[type="button"],
  input[type="checkbox"], input[type="radio"] {
    -webkit-tap-highlight-color: transparent;
    touch-action: manipulation;
    min-height: 44px;
  }

  /* Inputs — tamanho mínimo 16px para evitar zoom automático iOS */
  input, select, textarea {
    font-size: 16px !important;
    -webkit-tap-highlight-color: transparent;
    /* Aparência nativa removida para manter estilos customizados */
    -webkit-appearance: none;
    appearance: none;
  }

  /* Seleção de texto com cor de marca */
  ::selection {
    background: ${({ theme }) => theme?.primary || '#A78BFA'}44;
    color: inherit;
  }

  /* Bloqueia scroll do body quando modal está aberto */
  .modal-open {
    overflow: hidden;
    position: fixed;
    width: 100%;
    /* Mantém posição de scroll para não "pular" */
    top: var(--scroll-y, 0);
  }

  /* Skeleton loader reutilizável */
  @keyframes shimmer {
    0%   { background-position: -400px 0; }
    100% { background-position: 400px 0; }
  }
  .skeleton {
    background: linear-gradient(
      90deg,
      ${({ theme }) => theme?.border || '#e0e0e0'} 25%,
      ${({ theme }) => theme?.hover || '#f0f0f0'} 50%,
      ${({ theme }) => theme?.border || '#e0e0e0'} 75%
    );
    background-size: 800px 100%;
    animation: shimmer 1.4s infinite linear;
    border-radius: 6px;
  }

  /* Scrollbar personalizada — oculta no mobile */
  ::-webkit-scrollbar { width: 10px; height: 10px; }
  @media (max-width: 768px) {
    ::-webkit-scrollbar { width: 0px; height: 0px; }
  }
  ::-webkit-scrollbar-track {
    background: ${({ theme }) => theme?.borderLight || '#f0f0f0'};
    border-radius: 10px;
  }
  ::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme?.primary || '#4ECDC4'};
    border-radius: 10px;
  }

  /* Animações globais */
  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes slideUp {
    from { transform: translateY(16px); opacity: 0; }
    to   { transform: translateY(0);    opacity: 1; }
  }
  @keyframes slideInFromBottom {
    from { transform: translateY(100%); opacity: 0; }
    to   { transform: translateY(0);    opacity: 1; }
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.5; }
  }

  .fade-in  { animation: fadeIn  0.25s ease; }
  .slide-up { animation: slideUp 0.25s ease; }

  /* Reduz animações se o usuário preferir */
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration:   0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration:  0.01ms !important;
    }
  }

  .loading {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    font-size: 1.2rem;
    color: ${({ theme }) => theme?.textSoft || '#666'};
  }
`;

export default GlobalStyle;
