/** Valor de cada parcela pela Tabela Price (juros compostos ao mês). */
export function valorParcela(total: number, parcelas: number, jurosMensalPct = 0): number {
  const n = Math.max(1, parcelas);
  const i = (jurosMensalPct || 0) / 100;
  if (n === 1 || i <= 0) return total / n;
  return (total * i) / (1 - Math.pow(1 + i, -n));
}

/** Faz o parse seguro da data sem sofrer distorções de fuso horário UTC. */
export function parseDataReferencia(dataStr?: string | Date | null): Date {
  if (!dataStr) return new Date();
  if (dataStr instanceof Date) return dataStr;
  if (
    typeof dataStr === "string" &&
    dataStr.length >= 10 &&
    dataStr[4] === "-" &&
    dataStr[7] === "-"
  ) {
    const ano = parseInt(dataStr.substring(0, 4), 10);
    const mes = parseInt(dataStr.substring(5, 7), 10) - 1;
    const dia = parseInt(dataStr.substring(8, 10), 10);
    if (!isNaN(ano) && !isNaN(mes) && !isNaN(dia)) {
      return new Date(ano, mes, dia);
    }
  }
  const d = new Date(dataStr);
  return isNaN(d.getTime()) ? new Date() : d;
}

export interface StatusParcelamento {
  parcelasTotal: number;
  valorParcela: number;
  valorTotalComJuros: number;
  /** Quantas parcelas já foram em meses anteriores */
  parcelasPagas: number;
  /** Quantas parcelas ainda restam pagar (do mês atual em diante) */
  parcelasRestantes: number;
  /** Qual o número da parcela no mês atual (ex: 2 para 2ª parcela), ou 0 se nenhuma no mês atual */
  parcelaAtualMes: number;
  /** Valor a pagar no mês atual */
  valorDesteMes: number;
  /** Saldo restante a pagar daqui para frente */
  valorRestante: number;
  /** Se o parcelamento já encerrou */
  quitado: boolean;
  /** Se ainda há parcelas pendentes */
  ativo: boolean;
}

export function calcularStatusParcelas(
  item: {
    preco: number;
    quantidade: number;
    parcelas?: number | null;
    jurosMensal?: number | null;
    dataCompra?: string | Date | null;
    createdAt?: string | Date | null;
    comprado?: boolean;
    origem?: string | null;
    pagamento?: string | null;
  },
  dataAtual: Date = new Date(),
): StatusParcelamento {
  const parcelasTotal = Math.max(1, item.parcelas ?? 1);
  const valorBase = item.preco * item.quantidade;
  const vParcela = valorParcela(valorBase, parcelasTotal, item.jurosMensal ?? 0);
  const valorTotalComJuros = vParcela * parcelasTotal;

  // Se for compra à vista (1 parcela), presente/ganho ou vale refeição
  if (parcelasTotal <= 1 || item.origem === "ganho" || item.pagamento === "vr") {
    const quitado = !!item.comprado;
    return {
      parcelasTotal,
      valorParcela: vParcela,
      valorTotalComJuros,
      parcelasPagas: quitado ? 1 : 0,
      parcelasRestantes: quitado ? 0 : 1,
      parcelaAtualMes: 0,
      valorDesteMes: 0,
      valorRestante: quitado ? 0 : valorTotalComJuros,
      quitado,
      ativo: false,
    };
  }

  const dataRef = parseDataReferencia(item.dataCompra ?? item.createdAt);
  const diffMeses =
    (dataAtual.getFullYear() - dataRef.getFullYear()) * 12 +
    (dataAtual.getMonth() - dataRef.getMonth());

  // Compra com previsão futura (mês futuro)
  if (diffMeses < 0) {
    return {
      parcelasTotal,
      valorParcela: vParcela,
      valorTotalComJuros,
      parcelasPagas: 0,
      parcelasRestantes: parcelasTotal,
      parcelaAtualMes: 0,
      valorDesteMes: 0,
      valorRestante: valorTotalComJuros,
      quitado: false,
      ativo: true,
    };
  }

  // Parcelamento que já encerrou (todas as parcelas já passaram)
  if (diffMeses >= parcelasTotal) {
    return {
      parcelasTotal,
      valorParcela: vParcela,
      valorTotalComJuros,
      parcelasPagas: parcelasTotal,
      parcelasRestantes: 0,
      parcelaAtualMes: 0,
      valorDesteMes: 0,
      valorRestante: 0,
      quitado: true,
      ativo: false,
    };
  }

  // Parcelamento ativo no mês atual
  const parcelaAtualMes = diffMeses + 1;
  const parcelasPagas = diffMeses;
  const parcelasRestantes = parcelasTotal - diffMeses;

  return {
    parcelasTotal,
    valorParcela: vParcela,
    valorTotalComJuros,
    parcelasPagas,
    parcelasRestantes,
    parcelaAtualMes,
    valorDesteMes: vParcela,
    valorRestante: vParcela * parcelasRestantes,
    quitado: false,
    ativo: true,
  };
}
