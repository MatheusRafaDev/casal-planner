/** Valor de cada parcela pela Tabela Price (juros compostos ao mês). */
export function valorParcela(total: number, parcelas: number, jurosMensalPct = 0): number {
  const n = Math.max(1, parcelas);
  const i = (jurosMensalPct || 0) / 100;
  if (n === 1 || i <= 0) return total / n;
  return (total * i) / (1 - Math.pow(1 + i, -n));
}
