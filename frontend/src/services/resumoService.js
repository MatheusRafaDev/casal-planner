import api from './api';

class ResumoService {
  /**
   * Busca os dados de resumo do backend
   * @returns {Promise<Object>} Dados de resumo e comparativo
   */
  async getResumo() {
    try {
      const response = await api.get('/resumo');
      return response.data;
    } catch (error) {
      console.error('❌ Erro ao buscar resumo:', error);
      throw error;
    }
  }

  

  /**
   * Formata os dados do resumo para o componente
   * @param {Object} data - Dados brutos do backend
   * @returns {Object} Dados formatados
   */
  formatarDados(data) {
    return {
      atual: {
        totalGeral: data.atual?.totalGeral || 0,
        totalVR: data.atual?.totalVR || 0,
        totalNormal: data.atual?.totalNormal || 0,
        totalComprados: data.atual?.totalComprados || 0,
        totalItens: data.atual?.totalItens || 0,
        porCategoria: data.atual?.porCategoria || {},
        quantidadePorCategoria: data.atual?.quantidadePorCategoria || {}
      },
      comparativo: {
        totalGeral: data.comparativo?.totalGeral || 0,
        totalVR: data.comparativo?.totalVR || 0,
        totalNormal: data.comparativo?.totalNormal || 0,
        totalComprados: data.comparativo?.totalComprados || 0,
        percentualGeral: data.comparativo?.percentualGeral || 0
      }
    };
  }

  /**
   * Calcula resumo manualmente a partir de uma lista de itens (fallback)
   * @param {Array} itens - Lista de itens
   * @returns {Object} Resumo calculado
   */
  calcularResumoManual(itens) {
    if (!itens || !Array.isArray(itens)) {
      return {
        atual: {
          totalGeral: 0,
          totalVR: 0,
          totalNormal: 0,
          totalComprados: 0,
          totalItens: 0,
          porCategoria: {},
          quantidadePorCategoria: {}
        },
        comparativo: {
          totalGeral: 0,
          totalVR: 0,
          totalNormal: 0,
          totalComprados: 0,
          percentualGeral: 0
        }
      };
    }

    // Calcular totais
    const totalGeral = itens.reduce((acc, item) => acc + (item.preco * item.quantidade), 0);
    const totalVR = itens
      .filter(item => item.pagamento === 'vr')
      .reduce((acc, item) => acc + (item.preco * item.quantidade), 0);
    const totalNormal = itens
      .filter(item => item.pagamento === 'normal')
      .reduce((acc, item) => acc + (item.preco * item.quantidade), 0);
    const totalComprados = itens.filter(item => item.comprado).length;

    // Calcular por categoria
    const porCategoria = {};
    const quantidadePorCategoria = {};

    itens.forEach(item => {
      const catId = item.categoriaId;
      const total = item.preco * item.quantidade;

      if (!porCategoria[catId]) {
        porCategoria[catId] = 0;
        quantidadePorCategoria[catId] = 0;
      }

      porCategoria[catId] += total;
      quantidadePorCategoria[catId] += item.quantidade;
    });

    return {
      atual: {
        totalGeral,
        totalVR,
        totalNormal,
        totalComprados,
        totalItens: itens.length,
        porCategoria,
        quantidadePorCategoria
      },
      comparativo: {
        totalGeral: 0,
        totalVR: 0,
        totalNormal: 0,
        totalComprados: 0,
        percentualGeral: 0
      }
    };
  }

  /**
   * Busca resumo ou calcula manualmente como fallback
   * @param {Array} itensFallback - Lista de itens para fallback
   * @returns {Promise<Object>} Dados do resumo
   */
  async getResumoSeguro(itensFallback = []) {
    try {
      const data = await this.getResumo();
      return this.formatarDados(data);
    } catch (error) {
      return this.calcularResumoManual(itensFallback);
    }
  }

  /**
   * Calcula comparativo entre dois períodos
   * @param {Object} atual - Resumo atual
   * @param {Object} anterior - Resumo anterior
   * @returns {Object} Comparativo
   */
  calcularComparativo(atual, anterior) {
    const calcularVariacao = (atual, anterior) => {
      if (anterior === 0) return atual > 0 ? 100 : 0;
      return Number(((atual - anterior) / anterior * 100).toFixed(2));
    };

    return {
      totalGeral: calcularVariacao(atual.totalGeral, anterior.totalGeral),
      totalVR: calcularVariacao(atual.totalVR, anterior.totalVR),
      totalNormal: calcularVariacao(atual.totalNormal, anterior.totalNormal),
      totalComprados: calcularVariacao(atual.totalComprados, anterior.totalComprados),
      percentualGeral: calcularVariacao(atual.totalGeral, (anterior.totalGeral + atual.totalGeral) / 2)
    };
  }
}

// Exporta uma instância única
export default new ResumoService();