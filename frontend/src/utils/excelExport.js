
/**
 * Exporta a lista de itens planejados para um arquivo Excel (XLSX).
 *
 * @param {Array} itens - Lista de itens do enxoval.
 * @param {Array} categorias - Lista de categorias cadastradas.
 * @param {Object} totais - Totais calculados { totalGeral, totalPago, totalFalta }.
 */
export const exportarParaExcel = async (itens, categorias, totais) => {
  if (!itens || itens.length === 0) return;

  const { totalGeral, totalPago, totalFalta } = totais;

  try {
    const ExcelJS = (await import('exceljs')).default;
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Planejamento');

    // Título
    worksheet.mergeCells('A1', 'H1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = 'Planejamento CasalPlanner';
    titleCell.font = { name: 'Arial', size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
    titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF8B5CF6' } };

    // Cabeçalhos
    const headers = ['Item', 'Categoria', 'Valor Unitário', 'Quantidade', 'Total', 'Status', 'Pagamento', 'Prioridade'];
    const headerRow = worksheet.addRow(headers);
    
    headerRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4C1D95' } };
      cell.alignment = { horizontal: 'center' };
    });

    const calcularValorItem = (i) => (Number(i.preco) || 0) * (Number(i.quantidade) || 1);

    // Dados ordenados do mais caro pro mais barato
    const itensOrdenados = [...itens].sort((a, b) => {
      const totalA = calcularValorItem(a);
      const totalB = calcularValorItem(b);
      return totalB - totalA;
    });

    itensOrdenados.forEach((item) => {
      const categoria = categorias.find(c => (c.id || c._id) === item.categoriaId);
      const nomeCategoria = categoria ? categoria.nome : "Sem Categoria";
      const total = calcularValorItem(item);
      const pago = item.comprado ? "Pago" : "Pendente";
      
      const pagamentoStr = item.pagamento === 'vr' ? 'VR/VA' : 'Normal';
      let prioridadeStr = 'Próximas compras';
      if (item.prioridade === 'urgente') prioridadeStr = 'Primeira necessidade';
      else if (item.prioridade === 'pode_esperar') prioridadeStr = 'Mais para frente';
      
      const row = worksheet.addRow([
        item.nome,
        nomeCategoria,
        Number(item.preco) || 0,
        Number(item.quantidade) || 1,
        total,
        pago,
        pagamentoStr,
        prioridadeStr
      ]);

      // Formatação de valores
      row.getCell(3).numFmt = '"R$" #,##0.00';
      row.getCell(5).numFmt = '"R$" #,##0.00';
      
      // Alinhamentos
      row.getCell(4).alignment = { horizontal: 'center' };
      row.getCell(6).alignment = { horizontal: 'center' };
      row.getCell(7).alignment = { horizontal: 'center' };
      row.getCell(8).alignment = { horizontal: 'center' };

      // Cores de Status
      const statusCell = row.getCell(6);
      if (item.comprado) {
        statusCell.font = { color: { argb: 'FF10B981' }, bold: true };
      } else {
        statusCell.font = { color: { argb: 'FFF59E0B' }, bold: true };
      }

      // Cores de Prioridade
      const prioridadeCell = row.getCell(8);
      if (prioridadeStr === 'Primeira necessidade') {
        prioridadeCell.font = { color: { argb: 'FFEF4444' }, bold: true };
      } else if (prioridadeStr === 'Próximas compras') {
        prioridadeCell.font = { color: { argb: 'FFF59E0B' } };
      } else if (prioridadeStr === 'Mais para frente') {
        prioridadeCell.font = { color: { argb: 'FF22C55E' } };
      }
    });

    // Ajustar largura das colunas
    worksheet.columns = [
      { width: 30 },
      { width: 20 },
      { width: 15 },
      { width: 12 },
      { width: 15 },
      { width: 15 },
      { width: 15 },
      { width: 15 },
    ];

    // Totalizadores
    worksheet.addRow([]);
    
    const addTotalRow = (label, value, color) => {
      const r = worksheet.addRow(['', '', '', label, value, '', '', '']);
      r.getCell(4).font = { bold: true };
      r.getCell(4).alignment = { horizontal: 'right' };
      r.getCell(5).numFmt = '"R$" #,##0.00';
      r.getCell(5).font = { bold: true, color: color ? { argb: color } : undefined };
    };

    addTotalRow('TOTAL GERAL:', totalGeral);
    addTotalRow('TOTAL PAGO:', totalPago, 'FF10B981');
    addTotalRow('FALTA PAGAR:', totalFalta, 'FFF59E0B');

    // Download
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `planejamento_${new Date().toISOString().split('T')[0]}.xlsx`;
    link.click();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Erro ao exportar Excel:', error);
    alert('Ocorreu um erro ao gerar o arquivo Excel.');
  }
};
