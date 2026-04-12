/**
 * useResumo — mantido por compatibilidade, mas o Planejamento.jsx
 * agora calcula o resumo localmente via resumoService.calcularResumoManual()
 * sem precisar de requests extras de rede.
 *
 * Se você precisar do comparativo real do backend (mês anterior),
 * pode chamar resumoService.getResumo() aqui e combinar com o estado local.
 */
import { useMemo } from 'react';
import resumoService from '../services/resumoService';

export const useResumo = (itens = []) => {
  const dados = useMemo(() => {
    return resumoService.calcularResumoManual(itens);
  }, [itens]);

  return {
    resumo: dados.atual,
    comparativo: dados.comparativo,
    loading: false,
    error: null,
    usandoFallback: true,
    refetch: () => {},
  };
};

