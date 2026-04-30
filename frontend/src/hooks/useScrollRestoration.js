// hooks/useScrollRestoration.js
import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

const scrollPositions = new Map();

export const useScrollRestoration = () => {
  const location = useLocation();
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Restaura posição ao entrar na tela
    const savedPosition = scrollPositions.get(location.pathname);
    if (savedPosition) {
      container.scrollTop = savedPosition;
    }

    // Salva posição ao sair da tela
    return () => {
      scrollPositions.set(location.pathname, container.scrollTop);
    };
  }, [location.pathname]);

  return containerRef;
};