/**
 * Calcula com segurança o valor de um item, tratando preço e quantidade nulos/indefinidos.
 * Evita a ocorrência de NaN nas contas do frontend.
 *
 * @param {Object} item - O item a ser calculado
 * @returns {number} O valor total calculado (preco * quantidade)
 */
export const calcularValorItem = (item) => {
  if (!item) return 0;
  const preco = Number(item.preco);
  const quantidade = Number(item.quantidade);
  return (isNaN(preco) ? 0 : preco) * (isNaN(quantidade) || quantidade <= 0 ? 1 : quantidade);
};

/**
 * Processa a lista de itens, categorias e dados do backend para retornar o resumo completo do Dashboard.
 *
 * @param {Array} itens - Lista de todos os itens
 * @param {Array} categorias - Lista de categorias
 * @param {Object} resumoData - Resumo retornado pelo backend (se houver)
 * @returns {Object} Estrutura de dados com totais agregados e processados
 */
export const calcularDashboard = (itens = [], categorias = [], resumoData = null) => {
  // Para garantir 100% de consistência matemática na interface, 
  // vamos sempre usar o cálculo local se tivermos os itens carregados.
  const possuiItens = itens && itens.length > 0;
  
  const totalGeral = possuiItens
    ? itens.reduce((acc, i) => acc + calcularValorItem(i), 0)
    : (resumoData?.atual?.totalGeral || 0);

  const totalVR = possuiItens
    ? itens.filter(i => i.pagamento === 'vr').reduce((acc, i) => acc + calcularValorItem(i), 0)
    : (resumoData?.atual?.totalVR || 0);

  const totalNormal = possuiItens
    ? itens.filter(i => i.pagamento === 'normal').reduce((acc, i) => acc + calcularValorItem(i), 0)
    : (resumoData?.atual?.totalNormal || 0);

  const totalComprados = possuiItens
    ? itens.filter(i => i.comprado).length
    : (resumoData?.atual?.totalComprados || 0);

  const totalItens = possuiItens
    ? itens.length
    : (resumoData?.atual?.totalItens || 0);

  const pctComprados = totalItens > 0 
    ? Math.round((totalComprados / totalItens) * 100) 
    : 0;

  // O que já foi pago vs falta (cálculo cliente-side robusto)
  const totalPago = itens
    .filter(i => i.comprado)
    .reduce((acc, i) => acc + calcularValorItem(i), 0);

  const totalFalta = Math.max(0, totalGeral - totalPago);
  const pctFinanceiro = totalGeral > 0 ? (totalPago / totalGeral) * 100 : 0;

  // Por tipo de pagamento (cálculos de pago e falta otimizados)
  const pagoVR = itens
    .filter(i => i.pagamento === 'vr' && i.comprado)
    .reduce((acc, i) => acc + calcularValorItem(i), 0);

  const pagamentoVR = {
    total: totalVR,
    pago: pagoVR,
    falta: Math.max(0, totalVR - pagoVR)
  };

  const pagoNormal = itens
    .filter(i => i.pagamento === 'normal' && i.comprado)
    .reduce((acc, i) => acc + calcularValorItem(i), 0);

  const pagamentoNormal = {
    total: totalNormal,
    pago: pagoNormal,
    falta: Math.max(0, totalNormal - pagoNormal)
  };

  // Por prioridade - mapeamento e totalização robusta
  const prioridades = {
    urgente: { total: 0, pago: 0, falta: 0, itens: [] },
    normal: { total: 0, pago: 0, falta: 0, itens: [] },
    pode_esperar: { total: 0, pago: 0, falta: 0, itens: [] }
  };

  itens.forEach(item => {
    const valor = calcularValorItem(item);
    const prioridadeItem = item.prioridade || 'normal';

    let chave;
    if (prioridadeItem === 'urgente') {
      chave = 'urgente';
    } else if (prioridadeItem === 'normal' || prioridadeItem === 'media' || prioridadeItem === 'alta') {
      chave = 'normal';
    } else if (prioridadeItem === 'pode_esperar') {
      chave = 'pode_esperar';
    } else {
      chave = 'normal';
    }

    prioridades[chave].total += valor;
    if (item.comprado) {
      prioridades[chave].pago += valor;
    } else {
      prioridades[chave].falta += valor;
    }
    prioridades[chave].itens.push(item);
  });

  const urgenciaFalta = prioridades.urgente.falta;

  // Economias obtidas por presentes ganhos (origem === 'presente')
  const totalEconomizado = possuiItens
    ? itens.filter(i => i.origem === 'presente').reduce((acc, i) => acc + calcularValorItem(i), 0)
    : (resumoData?.atual?.totalEconomizado || 0);

  const enxoval = {
    metaGlobalEnxoval: resumoData?.enxoval?.metaGlobalEnxoval ?? null,
    percentualMetaGlobal: resumoData?.enxoval?.percentualMetaGlobal ?? 0,
    totalRestanteParaMeta: resumoData?.enxoval?.totalRestanteParaMeta ?? 0,
    totalItensComprados: resumoData?.enxoval?.totalItensComprados ?? totalComprados,
    totalItensPendentes: resumoData?.enxoval?.totalItensPendentes ?? (totalItens - totalComprados),
    totalEconomizadoComPresentes: resumoData?.enxoval?.totalEconomizadoComPresentes ?? totalEconomizado
  };

  // Total por categoria - utilizando optional chaining seguro
  const porCategoria = categorias
    .map(cat => {
      const id = cat.id || cat._id;
      let total = 0;
      let qtd = 0;
      let comprados = 0;
      let pago = 0;

      if (!possuiItens && resumoData?.atual?.porCategoria?.[id] !== undefined) {
        // Dados vindos do backend com segurança (sem itens locais)
        total = resumoData.atual.porCategoria[id] || 0;
        qtd = resumoData.atual.quantidadePorCategoria?.[id] || 0;
        comprados = 0;
        pago = 0;
      } else {
        // Cálculo no cliente garantindo 100% de consistência
        const itscat = itens.filter(i => i.categoriaId === id);
        total = itscat.reduce((acc, i) => acc + calcularValorItem(i), 0);
        qtd = itscat.length;
        comprados = itscat.filter(i => i.comprado).length;
        pago = itscat.filter(i => i.comprado).reduce((acc, i) => acc + calcularValorItem(i), 0);
      }

      return {
        ...cat,
        id,
        total,
        qtd,
        comprados,
        pago
      };
    })
    .filter(c => c.qtd > 0)
    .sort((a, b) => b.total - a.total);

  return {
    totalGeral,
    totalVR,
    totalNormal,
    totalComprados,
    totalItens,
    pctComprados,
    totalPago,
    totalFalta,
    pctFinanceiro,
    pagamentoVR,
    pagamentoNormal,
    prioridades,
    urgenciaFalta,
    totalEconomizado,
    enxoval,
    porCategoria
  };
};
