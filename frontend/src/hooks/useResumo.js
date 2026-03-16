import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import resumoService from '../services/resumoService';

export const useResumo = (itensFallback = []) => {
  const { usuario } = useAuth();
  const [resumo, setResumo] = useState({
    totalGeral: 0,
    totalVR: 0,
    totalNormal: 0,
    totalComprados: 0,
    totalItens: 0,
    porCategoria: {},
    quantidadePorCategoria: {}
  });
  const [comparativo, setComparativo] = useState({
    totalGeral: 0,
    totalVR: 0,
    totalNormal: 0,
    totalComprados: 0,
    percentualGeral: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usandoFallback, setUsandoFallback] = useState(false);

  const carregarResumo = useCallback(async () => {
    if (!usuario) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Tenta buscar do backend, se falhar usa fallback
      const data = await resumoService.getResumoSeguro(itensFallback);
      
      setResumo(data.atual);
      setComparativo(data.comparativo);
      setUsandoFallback(data.comparativo.totalGeral === 0 && data.comparativo.percentualGeral === 0);
      
    } catch (err) {
      console.error('Erro ao carregar resumo:', err);
      setError('Não foi possível carregar os resumos');
      
      // Fallback final com dados vazios
      setResumo({
        totalGeral: 0,
        totalVR: 0,
        totalNormal: 0,
        totalComprados: 0,
        totalItens: 0,
        porCategoria: {},
        quantidadePorCategoria: {}
      });
      setComparativo({
        totalGeral: 0,
        totalVR: 0,
        totalNormal: 0,
        totalComprados: 0,
        percentualGeral: 0
      });
    } finally {
      setLoading(false);
    }
  }, [usuario, itensFallback]);

  // Recarregar quando usuário mudar
  useEffect(() => {
    carregarResumo();
  }, [carregarResumo]);

  // Função para forçar recarga
  const refetch = useCallback(() => {
    return carregarResumo();
  }, [carregarResumo]);

  return {
    resumo,
    comparativo,
    loading,
    error,
    usandoFallback,
    refetch
  };
};