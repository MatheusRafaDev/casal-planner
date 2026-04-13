import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const PAGE_TITLES = {
  '/': 'CasalPlanner - Planeje sua vida a dois',
  '/login': 'Entrar - CasalPlanner',
  '/register': 'Cadastro - CasalPlanner',
  '/planejamento': 'Planejamento - CasalPlanner',
  '/perfil': 'Meu Perfil - CasalPlanner',
  '/tarefas': 'Tarefas - CasalPlanner',
  '/financas': 'Finanças - CasalPlanner',
  '/calendario': 'Calendário - CasalPlanner',
  '/configuracoes': 'Configurações - CasalPlanner',
  '/ajuda': 'Ajuda - CasalPlanner',
  '/sobre': 'Sobre - CasalPlanner',
};

const DEFAULT_TITLE = 'CasalPlanner - Organize sua vida a dois';

// Função para formatar título dinamicamente
const formatTitle = (pathname, params = {}) => {
  let title = PAGE_TITLES[pathname] || DEFAULT_TITLE;
  
  // Substituir placeholders dinâmicos
  Object.keys(params).forEach(key => {
    title = title.replace(`{{${key}}}`, params[key]);
  });
  
  return title;
};

// Hook principal
export const usePageTitle = (customTitle = null, params = {}) => {
  const location = useLocation();

  useEffect(() => {
    if (customTitle) {
      // Se forneceu um título customizado
      document.title = customTitle.includes('CasalPlanner') 
        ? customTitle 
        : `${customTitle} - CasalPlanner`;
    } else {
      // Usa o título baseado na rota
      const title = formatTitle(location.pathname, params);
      document.title = title;
    }
  }, [location.pathname, customTitle, params]);
};

// Hook específico para páginas de detalhes
export const useDetailPageTitle = (itemName, itemType) => {
  const location = useLocation();
  
  useEffect(() => {
    if (itemName) {
      document.title = `${itemName} - ${itemType} | CasalPlanner`;
    } else {
      const title = PAGE_TITLES[location.pathname] || DEFAULT_TITLE;
      document.title = title;
    }
  }, [location.pathname, itemName, itemType]);
};

// Componente para mudar título programaticamente
export const PageTitleUpdater = ({ title }) => {
  useEffect(() => {
    if (title) {
      const previousTitle = document.title;
      document.title = title.includes('CasalPlanner') ? title : `${title} - CasalPlanner`;
      
      return () => {
        document.title = previousTitle;
      };
    }
  }, [title]);
  
  return null;
};

// Função para atualizar título manualmente
export const updatePageTitle = (title) => {
  if (title) {
    document.title = title.includes('CasalPlanner') ? title : `${title} - CasalPlanner`;
  }
};

export default usePageTitle;