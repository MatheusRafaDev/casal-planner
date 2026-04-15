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
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
      sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background-color: ${({ theme }) => theme?.background || '#fafafa'};
    color: ${({ theme }) => theme?.text || '#333'};
    transition: background-color 0.3s, color 0.3s;
    overflow-x: hidden;
    /* iOS safe area support */
    padding-bottom: env(safe-area-inset-bottom);
  }

  /* 🔥 CORREÇÃO: Remove o fundo branco/amarelo do autocomplete em TODOS os inputs */
  input:-webkit-autofill,
  input:-webkit-autofill:hover,
  input:-webkit-autofill:focus,
  input:-webkit-autofill:active,
  textarea:-webkit-autofill,
  textarea:-webkit-autofill:hover,
  textarea:-webkit-autofill:focus,
  textarea:-webkit-autofill:active,
  select:-webkit-autofill,
  select:-webkit-autofill:hover,
  select:-webkit-autofill:focus,
  select:-webkit-autofill:active {
    -webkit-box-shadow: 0 0 0 1000px ${({ theme }) => theme?.surface || '#ffffff'} inset !important;
    -webkit-text-fill-color: ${({ theme }) => theme?.text || '#333333'} !important;
    background-color: ${({ theme }) => theme?.surface || '#ffffff'} !important;
    caret-color: ${({ theme }) => theme?.text || '#333333'} !important;
    transition: background-color 5000s ease-in-out 0s;
  }

  /* Para Firefox */
  input:-moz-autofill,
  textarea:-moz-autofill,
  select:-moz-autofill {
    background-color: ${({ theme }) => theme?.surface || '#ffffff'} !important;
    color: ${({ theme }) => theme?.text || '#333333'} !important;
    box-shadow: 0 0 0 1000px ${({ theme }) => theme?.surface || '#ffffff'} inset !important;
  }

  /* Quando o input estiver em foco com autocomplete */
  input:-webkit-autofill:focus,
  textarea:-webkit-autofill:focus,
  select:-webkit-autofill:focus {
    -webkit-box-shadow: 0 0 0 1000px ${({ theme }) => theme?.surface || '#ffffff'} inset, 0 0 0 2px ${({ theme }) => theme?.primary || '#007bff'} !important;
    -webkit-text-fill-color: ${({ theme }) => theme?.text || '#333333'} !important;
  }

  /* Improve tap targets & remove tap flash on mobile */
  button, a, [role="button"], select, input[type="submit"], input[type="button"] {
    -webkit-tap-highlight-color: transparent;
    touch-action: manipulation;
  }

  /* Better input experience on iOS - prevent zoom on focus */
  input, select, textarea {
    font-size: 16px !important;
    -webkit-tap-highlight-color: transparent;
  }

  /* Prevent iOS bounce/overscroll on modals */
  .modal-open {
    overflow: hidden;
    position: fixed;
    width: 100%;
  }

  .loading {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    font-size: 1.2rem;
    color: ${({ theme }) => theme?.textSoft || '#666'};
  }

  /* Scrollbar personalizada - hidden on mobile */
  ::-webkit-scrollbar {
    width: 10px;
    height: 10px;
  }

  @media (max-width: 768px) {
    ::-webkit-scrollbar {
      width: 4px;
      height: 4px;
    }
  }

  ::-webkit-scrollbar-track {
    background: ${({ theme }) => theme?.borderLight || '#f0f0f0'};
    border-radius: 10px;
  }

  ::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme?.primary || '#4ECDC4'};
    border-radius: 10px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: ${({ theme }) => theme?.primaryDark || '#3db9b1'};
  }

  /* Animações */
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes slideUp {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }

  @keyframes slideInFromBottom {
    from { transform: translateY(100%); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }

  .fade-in {
    animation: fadeIn 0.3s ease;
  }

  .slide-up {
    animation: slideUp 0.3s ease;
  }
`;

export default GlobalStyle;