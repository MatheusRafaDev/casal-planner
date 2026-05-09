import api from './api';

export interface ResumoData {
  atual: {
    totalGeral: number;
    totalVR: number;
    totalNormal: number;
    totalComprados: number;
    totalItens: number;
    porCategoria: Record<string, number>;
    quantidadePorCategoria: Record<string, number>;
  };
  comparativo: {
    totalGeral: number;
    totalVR: number;
    totalNormal: number;
    totalComprados: number;
    percentualGeral: number;
  };
}

class ResumoService {
  async getResumo(): Promise<any> {
    try {
      const response = await api.get('/resumo');
      return response.data;
    } catch (error) {
      console.error('❌ Erro ao buscar resumo:', error);
      throw error;
    }
  }

  formatarDados(data: any): ResumoData {
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

  calcularResumoManual(itens: any[]): ResumoData {
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

    const totalGeral = itens.reduce((acc, item) => acc + (item.preco * item.quantidade), 0);
    const totalVR = itens
      .filter(item => item.pagamento === 'vr')
      .reduce((acc, item) => acc + (item.preco * item.quantidade), 0);
    const totalNormal = itens
      .filter(item => item.pagamento === 'normal')
      .reduce((acc, item) => acc + (item.preco * item.quantidade), 0);
    const totalComprados = itens.filter(item => item.comprado).length;

    const porCategoria: Record<string, number> = {};
    const quantidadePorCategoria: Record<string, number> = {};

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

  async getResumoSeguro(itensFallback: any[] = []): Promise<ResumoData> {
    try {
      const data = await this.getResumo();
      return this.formatarDados(data);
    } catch (error) {
      return this.calcularResumoManual(itensFallback);
    }
  }

  calcularComparativo(atual: any, anterior: any) {
    const calcularVariacao = (atual: number, anterior: number) => {
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

export default new ResumoService();
