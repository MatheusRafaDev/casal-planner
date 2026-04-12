import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const PAGE_TITLES = {
  '/': 'CasalPlanner - Planeje juntos',
  '/login': 'Entrar - CasalPlanner',
  '/planejamento': 'Planejamento - CasalPlanner',
  '/perfil': 'Meu Perfil - CasalPlanner',
};

const DEFAULT_TITLE = 'CasalPlanner';

export const usePageTitle = () => {
  const location = useLocation();

  useEffect(() => {
    const title = PAGE_TITLES[location.pathname] || DEFAULT_TITLE;
    document.title = title;
  }, [location.pathname]);
};

export default usePageTitle;
