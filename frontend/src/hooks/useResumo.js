/**
 * useResumo — calcula o resumo local a partir da lista de itens em memória.
 *
 * Mantém compatibilidade com o Planejamento.jsx sem requests extras,
 * retornando a estrutura completa { atual, comparativo, enxoval } usada
 * também por ResumoCards e resumoService.formatarDados().
 */
import { useMemo } from 'react';
import resumoService from '../services/resumoService';

export const useResumo = (itens = []) => {
  const dados = useMemo(
    () => resumoService.calcularResumoManual(itens),
    [itens]
  );

  return {
    resumo: dados,        // { atual, comparativo, enxoval }
    loading: false,
    error: null,
    refetch: () => {},
  };
};