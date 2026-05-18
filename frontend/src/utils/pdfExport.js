import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { formatarMoeda } from "./formatters";

// Define as fontes virtuais do pdfmake
if (pdfFonts && pdfFonts.pdfMake) {
  pdfMake.vfs = pdfFonts.pdfMake.vfs;
}

export const exportarParaPDF = (itens, categorias, totais) => {
  if (!itens || itens.length === 0) return;

  const { totalGeral, totalPago, totalFalta } = totais;

  // Itens ordenados do mais caro pro mais barato
  const itensOrdenados = [...itens].sort((a, b) => {
    const totalA = a.preco * (a.quantidade || 1);
    const totalB = b.preco * (b.quantidade || 1);
    return totalB - totalA;
  });

  // Corpo da tabela
  const tableBody = [];
  
  // Cabeçalho da tabela
  tableBody.push([
    { text: "Item", style: "tableHeader" },
    { text: "Categoria", style: "tableHeader" },
    { text: "V. Unit.", style: "tableHeader" },
    { text: "Qtd", style: "tableHeader" },
    { text: "Total", style: "tableHeader" },
    { text: "Status", style: "tableHeader" },
    { text: "Pagamento", style: "tableHeader" },
    { text: "Prioridade", style: "tableHeader" }
  ]);

  // Linhas da tabela
  itensOrdenados.forEach((item, index) => {
    const categoria = categorias.find((c) => (c.id || c._id) === item.categoriaId);
    const nomeCategoria = categoria ? categoria.nome : "Sem Categoria";
    const total = item.preco * (item.quantidade || 1);
    
    const pagoObj = item.comprado 
      ? { text: "Pago", color: "#10B981", bold: true } 
      : { text: "Pendente", color: "#F59E0B", bold: true };

    const pagamentoStr = item.pagamento === "vr" ? "VR/VA" : "Normal";
    
    let prioridadeObj = { text: "Normal" };
    if (item.prioridade === "urgente") prioridadeObj = { text: "Urgente", color: "#EF4444", bold: true };
    else if (item.prioridade === "pode_esperar") prioridadeObj = { text: "Pode Esperar", color: "#10B981" };

    const fillColor = index % 2 === 0 ? "#F9FAFB" : "#FFFFFF"; // Zebrado

    tableBody.push([
      { text: item.nome, fillColor },
      { text: nomeCategoria, fillColor },
      { text: formatarMoeda(item.preco), fillColor },
      { text: (item.quantidade || 1).toString(), alignment: "center", fillColor },
      { text: formatarMoeda(total), fillColor },
      { ...pagoObj, alignment: "center", fillColor },
      { text: pagamentoStr, alignment: "center", fillColor },
      { ...prioridadeObj, alignment: "center", fillColor }
    ]);
  });

  // Data atual formatada
  const dataAtual = new Date().toLocaleDateString("pt-BR", {
    day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit"
  });

  const docDefinition = {
    pageSize: "A4",
    pageOrientation: "landscape",
    pageMargins: [40, 40, 40, 40],
    
    content: [
      { text: "Planejamento CasalPlanner", style: "header" },
      { text: `Relatório gerado em: ${dataAtual}`, style: "subHeader" },
      
      // Resumo Financeiro
      { text: "Resumo Financeiro", style: "sectionTitle", margin: [0, 20, 0, 10] },
      {
        columns: [
          {
            width: "*",
            stack: [
              { text: "Total Planejado", style: "resumoLabel" },
              { text: formatarMoeda(totalGeral), style: "resumoValue" }
            ]
          },
          {
            width: "*",
            stack: [
              { text: "Valor Já Pago", style: "resumoLabel", color: "#10B981" },
              { text: formatarMoeda(totalPago), style: "resumoValue", color: "#10B981" }
            ]
          },
          {
            width: "*",
            stack: [
              { text: "Falta Pagar", style: "resumoLabel", color: "#F59E0B" },
              { text: formatarMoeda(totalFalta), style: "resumoValue", color: "#F59E0B" }
            ]
          }
        ],
        columnGap: 20,
        margin: [0, 0, 0, 20]
      },

      // Tabela de itens
      { text: "Detalhamento dos Itens", style: "sectionTitle", margin: [0, 10, 0, 10] },
      {
        table: {
          headerRows: 1,
          widths: ["*", "auto", "auto", "auto", "auto", "auto", "auto", "auto"],
          body: tableBody
        },
        layout: {
          hLineWidth: function (i, node) { return (i === 0 || i === node.table.body.length) ? 0 : 1; },
          vLineWidth: function (i, node) { return 0; },
          hLineColor: function (i, node) { return i === 1 ? "#8B5CF6" : "#E5E7EB"; },
          paddingLeft: function (i, node) { return 8; },
          paddingRight: function (i, node) { return 8; },
          paddingTop: function (i, node) { return 8; },
          paddingBottom: function (i, node) { return 8; },
        }
      }
    ],
    
    styles: {
      header: {
        fontSize: 22,
        bold: true,
        color: "#4C1D95",
        alignment: "center",
      },
      subHeader: {
        fontSize: 10,
        color: "#6B7280",
        alignment: "center",
        margin: [0, 5, 0, 0]
      },
      sectionTitle: {
        fontSize: 14,
        bold: true,
        color: "#374151"
      },
      resumoLabel: {
        fontSize: 10,
        color: "#6B7280",
        bold: true,
        alignment: "center",
        margin: [0, 0, 0, 5]
      },
      resumoValue: {
        fontSize: 18,
        bold: true,
        alignment: "center"
      },
      tableHeader: {
        bold: true,
        fontSize: 11,
        color: "#FFFFFF",
        fillColor: "#8B5CF6",
        alignment: "center"
      }
    },
    
    defaultStyle: {
      fontSize: 10,
      color: "#1F2937"
    }
  };

  const filename = `planejamento_${new Date().toISOString().split("T")[0]}.pdf`;
  pdfMake.createPdf(docDefinition).download(filename);
};
