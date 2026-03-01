import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
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
  }

  .loading {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    font-size: 1.2rem;
    color: ${({ theme }) => theme?.textSoft || '#666'};
  }

  /* Scrollbar personalizada */
  ::-webkit-scrollbar {
    width: 10px;
    height: 10px;
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

  .fade-in {
    animation: fadeIn 0.3s ease;
  }

  .slide-up {
    animation: slideUp 0.3s ease;
  }
`;

export default GlobalStyle;