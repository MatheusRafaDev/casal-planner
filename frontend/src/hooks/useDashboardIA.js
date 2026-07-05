import { useState, useEffect, useRef } from 'react';
import { groqService } from '../services/groqService';

/**
 * Hook customizado para carregar os recursos de IA na Dashboard (resumo narrativo e estimativa).
 *
 * @param {boolean} loading - Estado de carregamento dos dados principais
 * @param {Array} itens - Lista de itens carregados
 * @param {Array} categorias - Lista de categorias carregadas
 * @param {Object} usuario - Informações do usuário logado
 * @returns {Object} Dados carregados e estado de processamento { resumoNarrativo, estimativaComodo, loadingAI }
 */
export const useDashboardIA = (loading, itens, categorias, usuario) => {
  const [resumoNarrativo, setResumoNarrativo] = useState(null);
  const [estimativaComodo, setEstimativaComodo] = useState(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const aiRequested = useRef(false);

  useEffect(() => {
    // Só tenta buscar da IA quando os dados necessários (inclusive categorias) estão carregados
    if (!loading && itens.length > 0 && categorias.length > 0 && !aiRequested.current) {
      aiRequested.current = true;
      let active = true;

      const carregarAI = async () => {
        setLoadingAI(true);
        try {
          // Get narrative summary
          const resumo = await groqService.gerarResumoEnxoval();
          if (active) {
            setResumoNarrativo(resumo?.resumo || null);
          }
          
          // Get room estimate for the first category
          const primeiraCategoria = categorias[0];
          if (primeiraCategoria && active) {
            const cidade = usuario?.enderecoNovaCasa?.cidade || 'São Paulo';
            const estimativa = await groqService.estimarOrcamento(primeiraCategoria.nome, cidade);
            if (active) {
              setEstimativaComodo(estimativa || null);
            }
          }
        } catch (err) {
          console.error('Erro ao carregar recursos IA:', err);
        } finally {
          if (active) {
            setLoadingAI(false);
          }
        }
      };

      carregarAI();

      return () => {
        active = false;
      };
    }
  }, [loading, itens, categorias, usuario]);

  return {
    resumoNarrativo,
    estimativaComodo,
    loadingAI
  };
};
