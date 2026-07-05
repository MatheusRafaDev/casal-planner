import { useState, useEffect } from 'react';
import resumoService from '../services/resumoService';
import { categoriasService } from '../services/categoriasService';
import { itensService } from '../services/itensService';
import { showToast } from '../utils/toastUtils';

/**
 * Hook customizado para carregar os dados fundamentais da Dashboard do usuário.
 * Agrupa as chamadas de resumo, categorias e itens de forma assíncrona.
 *
 * @returns {Object} Dados carregados e estado de carregamento { categorias, itens, resumoData, loading }
 */
export const useDashboardData = () => {
  const [categorias, setCategorias] = useState([]);
  const [itens, setItens] = useState([]);
  const [resumoData, setResumoData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const carregar = async () => {
      setLoading(true);
      try {
        const [resumo, cats, its] = await Promise.all([
          resumoService.getResumo(),
          categoriasService.listarDoUsuario(),
          itensService.getAll(),
        ]);
        
        if (active) {
          setResumoData(resumoService.formatarDados(resumo));
          setCategorias(cats || []);
          setItens(its || []);
        }
      } catch (err) {
        console.error('Erro ao carregar dados do dashboard:', err);
        if (active) {
          setResumoData(null);
          setCategorias([]);
          setItens([]);
          showToast.error('Erro ao carregar dados. Tente atualizar a página.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };
    carregar();

    return () => {
      active = false;
    };
  }, []);

  return {
    categorias,
    itens,
    resumoData,
    loading
  };
};
