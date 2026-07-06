import api from './api';

class ResumoService {
  /**
   * Busca os dados de resumo do backend (ResumoResponseDto).
   * @returns {Promise<ResumoResponseDto>}
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
   * Normaliza a resposta do backend para o formato esperado pelos componentes.
   * O backend retorna { atual, comparativo, enxoval } — este método garante
   * defaults seguros para todos os campos.
   * @param {Object} data - ResumoResponseDto do backend
   * @returns {Object}
   */
  formatarDados(data) {
    return {
      atual: {
        totalGeral: data.atual?.totalGeral ?? 0,
        totalVR: data.atual?.totalVR ?? 0,
        totalNormal: data.atual?.totalNormal ?? 0,
        totalComprados: data.atual?.totalComprados ?? 0,
        totalItens: data.atual?.totalItens ?? 0,
        porCategoria: data.atual?.porCategoria ?? {},
        quantidadePorCategoria: data.atual?.quantidadePorCategoria ?? {},
        percentualConcluido: data.atual?.percentualConcluido ?? 0,
      },
      comparativo: {
        totalGeral: data.comparativo?.totalGeral ?? 0,
        totalVR: data.comparativo?.totalVR ?? 0,
        totalNormal: data.comparativo?.totalNormal ?? 0,
        totalComprados: data.comparativo?.totalComprados ?? 0,
        percentualGeral: data.comparativo?.percentualGeral ?? 0,
      },
      enxoval: {
        metaGlobalEnxoval: data.enxoval?.metaGlobalEnxoval ?? null,
        percentualMetaGlobal: data.enxoval?.percentualMetaGlobal ?? 0,
        totalRestanteParaMeta: data.enxoval?.totalRestanteParaMeta ?? 0,
        totalItensComprados: data.enxoval?.totalItensComprados ?? 0,
        totalItensPendentes: data.enxoval?.totalItensPendentes ?? 0,
      },
    };
  }

  /**
   * Calcula o resumo localmente a partir de uma lista de itens.
   * Usado como fallback quando o backend não está disponível,
   * ou para manter os cards sincronizados com o estado local sem requests extras.
   *
   * Retorna a mesma estrutura de formatarDados() para que os componentes
   * possam consumir ambas as fontes de forma intercambiável.
   *
   * @param {Array} itens
   * @returns {{ atual: Object, comparativo: Object, enxoval: Object }}
   */
  calcularResumoManual(itens = []) {
    if (!Array.isArray(itens) || itens.length === 0) {
      return this._resumoVazio();
    }

    const totalGeral = itens.reduce((acc, item) => acc + item.preco * item.quantidade, 0);
    const totalVR = itens
      .filter(item => item.pagamento === 'vr')
      .reduce((acc, item) => acc + item.preco * item.quantidade, 0);
    const totalNormal = itens
      .filter(item => item.pagamento !== 'vr')
      .reduce((acc, item) => acc + item.preco * item.quantidade, 0);

    const totalComprados = itens.filter(item => item.comprado).length;
    const totalItens = itens.length;
    const percentualConcluido = totalItens > 0
      ? Math.round((totalComprados / totalItens) * 100 * 100) / 100
      : 0;

    // Agrupa por categoria
    const porCategoria = {};
    const quantidadePorCategoria = {};
    itens.forEach(item => {
      const catId = item.categoriaId;
      const valor = item.preco * item.quantidade;
      porCategoria[catId] = (porCategoria[catId] ?? 0) + valor;
      quantidadePorCategoria[catId] = (quantidadePorCategoria[catId] ?? 0) + item.quantidade;
    });

    return {
      atual: {
        totalGeral,
        totalVR,
        totalNormal,
        totalComprados,
        totalItens,
        porCategoria,
        quantidadePorCategoria,
        percentualConcluido,
      },
      comparativo: {
        totalGeral: 0, totalVR: 0, totalNormal: 0,
        totalComprados: 0, percentualGeral: 0,
      },
      enxoval: {
        metaGlobalEnxoval: null,
        percentualMetaGlobal: 0,
        totalRestanteParaMeta: 0,
        totalItensComprados: totalComprados,
        totalItensPendentes: totalItens - totalComprados,
      },
    };
  }

  /**
   * Busca resumo do backend; em caso de falha usa o fallback local.
   * @param {Array} itensFallback
   * @returns {Promise<Object>}
   */
  async getResumoSeguro(itensFallback = []) {
    try {
      const data = await this.getResumo();
      return this.formatarDados(data);
    } catch {
      return this.calcularResumoManual(itensFallback);
    }
  }

  /**
   * Calcula a variação percentual entre dois períodos.
   * @param {Object} atual
   * @param {Object} anterior
   * @returns {Object}
   */
  calcularComparativo(atual, anterior) {
    const variacao = (a, b) => {
      if (b === 0) return a > 0 ? 100 : 0;
      return Number(((a - b) / b * 100).toFixed(2));
    };
    return {
      totalGeral: variacao(atual.totalGeral, anterior.totalGeral),
      totalVR: variacao(atual.totalVR, anterior.totalVR),
      totalNormal: variacao(atual.totalNormal, anterior.totalNormal),
      totalComprados: variacao(atual.totalComprados, anterior.totalComprados),
      percentualGeral: variacao(atual.totalGeral, (anterior.totalGeral + atual.totalGeral) / 2),
    };
  }

  /** Estrutura vazia para evitar repetição de literais espalhados. */
  _resumoVazio() {
    return {
      atual: {
        totalGeral: 0, totalVR: 0, totalNormal: 0,
        totalComprados: 0, totalItens: 0,
        porCategoria: {}, quantidadePorCategoria: {},
        percentualConcluido: 0,
      },
      comparativo: {
        totalGeral: 0, totalVR: 0, totalNormal: 0,
        totalComprados: 0, percentualGeral: 0,
      },
      enxoval: {
        metaGlobalEnxoval: null, percentualMetaGlobal: 0,
        totalRestanteParaMeta: 0, totalItensComprados: 0,
        totalItensPendentes: 0,
      },
    };
  }
}

const resumoService = new ResumoService();
export default resumoService;