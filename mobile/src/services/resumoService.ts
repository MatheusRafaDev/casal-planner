import api from './api';
import { Item } from './itensService';

export interface ResumoPeriodo {
  totalGeral: number;
  totalVR: number;
  totalNormal: number;
  totalComprados: number;
  totalItens: number;
  porCategoria: Record<string, number>;
  quantidadePorCategoria: Record<string, number>;
}

export interface Comparativo {
  totalGeral: number;
  totalVR: number;
  totalNormal: number;
  totalComprados: number;
  percentualGeral: number;
}

export interface ResumoGeral {
  atual: ResumoPeriodo;
  comparativo: Comparativo;
}

class ResumoService {
  async getResumo(): Promise<ResumoGeral> {
    const response = await api.get('/resumo');
    return response.data;
  }

  formatarDados(data: any): ResumoGeral {
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

  calcularResumoManual(itens: Item[]): ResumoGeral {
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
      const catId = item.categoriaId || 'sem-categoria';
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

  async getResumoSeguro(itensFallback: Item[] = []): Promise<ResumoGeral> {
    try {
      const data = await this.getResumo();
      return this.formatarDados(data);
    } catch (error) {
      console.warn('⚠️ Usando resumo calculado localmente.');
      return this.calcularResumoManual(itensFallback);
    }
  }
}

export const resumoService = new ResumoService();
