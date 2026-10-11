import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, Variants } from "framer-motion";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Wallet,
  ShoppingBag,
  Target,
  Sparkles,
  ArrowRight,
  CreditCard,
  RefreshCw,
  Bot,
  FileText,
  Gift,
  CheckCircle,
} from "lucide-react";
import {
  Pie,
  PieChart,
  Cell,
  Bar,
  BarChart,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { resumoService } from "@/services/resumo";
import { brl } from "@/lib/formatters";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { iconFor } from "@/components/planejamento/icon-map";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { useState, useMemo } from "react";
import { useAuth } from "@/lib/auth-context";
import type { Item } from "@/services/types";
import { WidgetDiaMudanca } from "@/components/planejamento/WidgetDiaMudanca";

export const Route = createFileRoute("/_authenticated/inicio")({
  head: () => ({
    meta: [{ title: "CasalPlanner - Início" }, { name: "robots", content: "noindex" }],
  }),
  component: InicioPage,
});

const FALLBACK_COLORS = [
  "#8b5cf6",
  "#ec4899",
  "#f59e0b",
  "#10b981",
  "#3b82f6",
  "#f43f5e",
  "#06b6d4",
  "#a855f7",
];

function InicioPage() {
  const { usuario } = useAuth();
  const isCasal = usuario?.tipoConta === "Casal";
  const p1 = usuario?.casalInfo?.pessoa1?.nome || "Pessoa 1";
  const p2 = usuario?.casalInfo?.pessoa2?.nome || "Pessoa 2";

  const { data: categorias = [] } = useQuery({
    queryKey: ["categorias"],
    queryFn: () => import("@/services/categorias").then((m) => m.categoriasService.listar()),
  });

  const { data: resumo, isLoading } = useQuery({
    queryKey: ["resumo", categorias.length],
    queryFn: () => resumoService.obterAdaptado(categorias),
  });

  const { data: itens = [] } = useQuery({
    queryKey: ["itens"],
    queryFn: () => import("@/services/itens").then((m) => m.itensService.listar()),
    retry: false,
  });

  const faturasMensais = useMemo(() => {
    if (!itens || itens.length === 0) return [];

    const mesesMap = new Map<string, number>();
    // Inclui itens comprados E itens com data prevista de compra (para projeção futura)
    // Ignora itens que já foram comprados e não estão parcelados (pagamento à vista já liquidado)
    const itensRelevantes = itens.filter(
      (i) =>
        i.origem !== "ganho" &&
        i.pagamento !== "vr" &&
        (i.comprado || i.dataCompra) &&
        !(i.comprado && (i.parcelas ?? 1) <= 1),
    );

    itensRelevantes.forEach((item) => {
      // Se não tem data, pula (não projeta sem data)
      if (!item.dataCompra && !item.comprado) return;
      const dataStr = item.dataCompra || new Date().toISOString();
      const dataBase = new Date(dataStr);

      const valorTotal = item.preco * item.quantidade;
      const parcelas = Math.max(1, item.parcelas ?? 1);
      const valorParcela = valorTotal / parcelas;

      for (let i = 0; i < parcelas; i++) {
        const dataParcela = new Date(dataBase);
        dataParcela.setMonth(dataParcela.getMonth() + i);

        const mesAnoKey = `${dataParcela.getFullYear()}-${String(dataParcela.getMonth() + 1).padStart(2, "0")}`;
        mesesMap.set(mesAnoKey, (mesesMap.get(mesAnoKey) ?? 0) + valorParcela);
      }
    });

    return Array.from(mesesMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([key, valor]) => {
        const [ano, mes] = key.split("-");
        const data = new Date(parseInt(ano), parseInt(mes) - 1, 1);
        const mesStr = data.toLocaleDateString("pt-BR", { month: "short" });
        return {
          name: `${mesStr.charAt(0).toUpperCase() + mesStr.slice(1)}/${ano}`,
          valor: valor,
        };
      });
  }, [itens]);

  if (isLoading) {
    return (
      <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-32 rounded-[var(--radius-lg)] bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  const validItens = itens.filter(
    (i) => !["ganho", "presente", "prometido"].includes(i.origem ?? ""),
  );
  const realTotalGeral = validItens.reduce((s, i) => s + i.preco * i.quantidade, 0);
  const realTotalNormal = validItens
    .filter((i) => i.pagamento !== "vr")
    .reduce((s, i) => s + i.preco * i.quantidade, 0);
  const realTotalVr = validItens
    .filter((i) => i.pagamento === "vr")
    .reduce((s, i) => s + i.preco * i.quantidade, 0);
  const realTotalComprados = validItens.filter((i) => i.comprado).length;

  let realTotalP1 = 0;
  let realTotalP2 = 0;
  validItens.forEach((i) => {
    const valorTotal = i.preco * i.quantidade;
    if (i.divisaoPagamento) {
      realTotalP1 += i.divisaoPagamento.valorPessoa1 || 0;
      realTotalP2 += i.divisaoPagamento.valorPessoa2 || 0;
    } else if (i.responsavelId === 1) {
      realTotalP1 += valorTotal;
    } else if (i.responsavelId === 2) {
      realTotalP2 += valorTotal;
    }
  });

  const r = resumo
    ? {
        ...resumo,
        totalGeral: realTotalGeral,
        totalNormal: realTotalNormal,
        totalVr: realTotalVr,
        itensComprados: realTotalComprados,
        totalItens: validItens.length,
        totalPessoa1: realTotalP1,
        totalPessoa2: realTotalP2,
      }
    : null;

  const meta = r?.metaGlobal ?? 0;
  const pct = meta > 0 ? Math.min(100, ((r?.totalGeral ?? 0) / meta) * 100) : 0;

  const dadosCategoria =
    r?.porCategoria?.map((c, i) => ({
      nome: c.categoriaNome,
      nomeBase: c.categoriaNome,
      icon: c.icon ?? null,
      valor: c.totalGasto,
      cor: c.cor ?? FALLBACK_COLORS[i % FALLBACK_COLORS.length],
    })) ?? [];

  const chartConfig = dadosCategoria.reduce(
    (acc, c, i) => {
      acc[c.nomeBase] = {
        label: c.nome,
        color: c.cor,
      };
      return acc;
    },
    {} as Record<string, { label: string; color: string }>,
  );

  const dadosVrNormal = [
    { nome: "Dinheiro", valor: r?.totalNormal ?? 0 },
    { nome: "VR/VA", valor: r?.totalVr ?? 0 },
  ].filter((d) => d.valor > 0);

  const temMensais =
    (r?.mesAtual ?? 0) > 0 || (r?.mesPassado ?? 0) > 0 || (r?.mesRetrasado ?? 0) > 0;

  const semDados = categorias.length === 0 && (!r || (r.totalItens ?? 0) === 0);

  const totalParcelado =
    itens.length > 0
      ? itens
          .filter((i) => (i.parcelas ?? 1) > 1 && i.origem !== "ganho" && i.comprado)
          .reduce((s, i) => s + i.preco * i.quantidade, 0)
      : 0;

  // Total economizado com presentes/ganhos
  const totalEconomizadoGanhos =
    itens.length > 0
      ? itens.filter((i) => i.origem === "ganho").reduce((s, i) => s + i.preco * i.quantidade, 0)
      : 0;
  const qtdGanhos = itens.filter((i) => i.origem === "ganho").length;

  // Bar chart mensal — com nomes reais dos meses e cálculo manual
  const hoje = new Date();
  const inicioMesAtual = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  const inicioMesPassado = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1);
  const inicioMesRetrasado = new Date(hoje.getFullYear(), hoje.getMonth() - 2, 1);
  const inicioProximoMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 1);

  let atualComprado = 0;
  let atualPrevisao = 0;
  let passadoComprado = 0;
  let passadoPrevisao = 0;
  let retrasadoComprado = 0;
  let retrasadoPrevisao = 0;

  itens.forEach((i) => {
    if (["ganho", "presente", "prometido"].includes(i.origem ?? "")) return;

    const dataRefStr = i.dataCompra || i.createdAt;
    if (!dataRefStr) return;

    // Tratando a data de referência para evitar problemas de timezone
    // Vamos apenas focar no ano/mês que a string (YYYY-MM-DD) ou timestamp indica
    const dataRef = new Date(dataRefStr);

    const valorTotal = i.preco * i.quantidade;

    if (dataRef >= inicioMesAtual && dataRef < inicioProximoMes) {
      if (i.comprado) atualComprado += valorTotal;
      else atualPrevisao += valorTotal;
    } else if (dataRef >= inicioMesPassado && dataRef < inicioMesAtual) {
      if (i.comprado) passadoComprado += valorTotal;
      else passadoPrevisao += valorTotal;
    } else if (dataRef >= inicioMesRetrasado && dataRef < inicioMesPassado) {
      if (i.comprado) retrasadoComprado += valorTotal;
      else retrasadoPrevisao += valorTotal;
    }
  });

  const MESES_PT = [
    "Jan",
    "Fev",
    "Mar",
    "Abr",
    "Mai",
    "Jun",
    "Jul",
    "Ago",
    "Set",
    "Out",
    "Nov",
    "Dez",
  ];
  const mesAtualNome = MESES_PT[hoje.getMonth()];
  const mesPassadoNome = MESES_PT[(hoje.getMonth() + 11) % 12];
  const mesRetrasadoNome = MESES_PT[(hoje.getMonth() + 10) % 12];

  const dadosMensais = [
    {
      mes: mesRetrasadoNome,
      comprado: retrasadoComprado,
      previsao: retrasadoPrevisao,
      total: retrasadoComprado + retrasadoPrevisao,
    },
    {
      mes: mesPassadoNome,
      comprado: passadoComprado,
      previsao: passadoPrevisao,
      total: passadoComprado + passadoPrevisao,
    },
    {
      mes: mesAtualNome,
      comprado: atualComprado,
      previsao: atualPrevisao,
      total: atualComprado + atualPrevisao,
    },
  ];

  // Variação % do mês atual em relação ao passado (considerando o total projetado)
  const passadoTotal = passadoComprado + passadoPrevisao;
  const atualTotal = atualComprado + atualPrevisao;
  const variacaoAtual =
    passadoTotal > 0 ? ((atualTotal - passadoTotal) / passadoTotal) * 100 : null;

  // ─── Gerador de Relatório PDF Financeiro ───────────────────────────────────
  const gerarRelatorioFinanceiro = async () => {
    const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
      import("jspdf"),
      import("jspdf-autotable"),
    ]);
    const doc = new jsPDF();
    const hoje = new Date();
    const dataStr = hoje.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
    const nomesCasal = isCasal ? `${p1} & ${p2}` : (usuario?.nomeCompleto ?? "CasalPlanner");

    // ── Cabeçalho ──
    doc.setFillColor(139, 92, 246);
    doc.rect(0, 0, 210, 35, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("Relatório Financeiro", 14, 16);
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(`${nomesCasal}  •  ${dataStr}`, 14, 27);

    // ── Métricas principais ──
    doc.setTextColor(50, 50, 50);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Resumo Geral", 14, 48);

    const totalGeral = r?.totalGeral ?? 0;
    const totalItens = r?.totalItens ?? 0;
    const totalComprados = r?.itensComprados ?? 0;
    const metaVal = r?.metaGlobal ?? 0;
    const pctMeta = metaVal > 0 ? Math.min(100, (totalGeral / metaVal) * 100) : null;
    const totalParcelado = itens
      .filter((i: Item) => (i.parcelas ?? 1) > 1)
      .reduce((s: number, i: Item) => s + i.preco * i.quantidade, 0);

    const metricas = [
      ["Gasto do Casal (Bolso)", brl(totalGeral)],
      ["Total de Itens Pagos", `${totalItens} itens (${totalComprados} comprados)`],
      [
        "Meta Global",
        metaVal > 0 ? `${brl(metaVal)} (${pctMeta?.toFixed(1)}% atingido)` : "Não definida",
      ],
      ["Em Parcelas", brl(totalParcelado)],
      ["Apenas Dinheiro", brl(r?.totalNormal ?? 0)],
      ["VR / VA", brl(r?.totalVr ?? 0)],
    ];

    if (totalEconomizadoGanhos > 0) {
      metricas.push([
        "Economia (Presentes)",
        `${brl(totalEconomizadoGanhos)} (${qtdGanhos} itens)`,
      ]);
    }

    if (isCasal) {
      const conj = Math.max(
        0,
        (r?.totalGeral ?? 0) - ((r?.totalPessoa1 ?? 0) + (r?.totalPessoa2 ?? 0)),
      );
      metricas.push(
        [`Gasto de ${p1}`, brl(r?.totalPessoa1 ?? 0)],
        [`Gasto de ${p2}`, brl(r?.totalPessoa2 ?? 0)],
      );
      if (conj > 0) {
        metricas.push(["Gasto Conjunto", brl(conj)]);
      }
    }

    autoTable(doc, {
      startY: 53,
      head: [["Métrica", "Valor"]],
      body: metricas,
      theme: "grid",
      headStyles: { fillColor: [139, 92, 246], textColor: 255, fontStyle: "bold" },
      alternateRowStyles: { fillColor: [248, 245, 255] },
      columnStyles: { 1: { halign: "right", fontStyle: "bold" } },
      styles: { fontSize: 10 },
    });

    // ── Por Categoria ──
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const afterMetricas = (doc as any).lastAutoTable?.finalY ?? 115;
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(50, 50, 50);
    doc.text("Gastos por Cômodo", 14, afterMetricas + 12);

    const porCategoria = (r?.porCategoria ?? []).map((c) => [
      c.categoriaNome,
      brl(c.totalGasto),
      `${c.totalItens ?? 0} itens`,
      c.metaOrcamento ? brl(c.metaOrcamento) : "—",
    ]);

    autoTable(doc, {
      startY: afterMetricas + 17,
      head: [["Cômodo", "Gasto", "Itens", "Meta"]],
      body: porCategoria.length > 0 ? porCategoria : [["Nenhuma categoria", "—", "—", "—"]],
      theme: "striped",
      headStyles: { fillColor: [139, 92, 246], textColor: 255, fontStyle: "bold" },
      columnStyles: { 1: { halign: "right" }, 3: { halign: "right" } },
      styles: { fontSize: 9 },
    });

    // ── Top Itens por Valor ──
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const afterCat = (doc as any).lastAutoTable?.finalY ?? 180;
    if (afterCat < 240) {
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(50, 50, 50);
      doc.text("Top 10 Itens por Valor", 14, afterCat + 12);

      const topItens = [...itens]
        .sort((a: Item, b: Item) => b.preco * b.quantidade - a.preco * a.quantidade)
        .slice(0, 10)
        .map((i: Item) => [
          i.nome,
          i.marca ?? "—",
          brl(i.preco),
          `×${i.quantidade}`,
          brl(i.preco * i.quantidade),
          i.comprado ? "✓" : "○",
        ]);

      autoTable(doc, {
        startY: afterCat + 17,
        head: [["Item", "Marca", "Preço", "Qtd", "Total", "Comprado"]],
        body: topItens.length > 0 ? topItens : [["Nenhum item", "—", "—", "—", "—", "—"]],
        theme: "striped",
        headStyles: { fillColor: [139, 92, 246], textColor: 255, fontStyle: "bold" },
        columnStyles: { 2: { halign: "right" }, 4: { halign: "right" }, 5: { halign: "center" } },
        styles: { fontSize: 8 },
      });
    }

    // ── Rodapé ──
    const pages = doc.getNumberOfPages();
    doc.setFontSize(8);
    doc.setTextColor(160);
    for (let i = 1; i <= pages; i++) {
      doc.setPage(i);
      doc.text(
        `Página ${i} de ${pages}  •  CasalPlanner  •  Gerado em ${dataStr}`,
        14,
        doc.internal.pageSize.height - 8,
      );
    }

    doc.save(`relatorio-financeiro-${hoje.toISOString().slice(0, 10)}.pdf`);
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
  };

  return (
    <motion.div
      className="p-4 md:p-6 lg:p-8 w-full max-w-[1200px] mx-auto space-y-6 md:space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-semibold tracking-tight text-foreground">Visão Geral</h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">
            {isCasal ? `Enxoval de ${p1.split(' ')[0]} e ${p2.split(' ')[0]}.` : 'O progresso financeiro do seu enxoval.'}
          </p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={gerarRelatorioFinanceiro}
            className="flex-1 sm:flex-none h-10 border-border text-foreground hover:bg-muted"
          >
            <FileText className="h-4 w-4 mr-2" /> PDF
          </Button>
          <Button asChild size="sm" className="flex-1 sm:flex-none h-10 bg-primary">
            <Link to="/planejamento">
              Planejar <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Widget Data da Mudança & Previsão do Tempo Open-Meteo */}
      <motion.div variants={itemVariants}>
        <WidgetDiaMudanca />
      </motion.div>

      {semDados ? (
        <motion.div variants={itemVariants} className="rounded-xl border border-border bg-card p-8 sm:p-12 text-center shadow-sm">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-xl bg-primary/10 text-primary mb-6">
            <ShoppingBag className="h-8 w-8" />
          </div>
          <h2 className="font-display text-2xl font-semibold tracking-tight mb-2">Comece o seu enxoval</h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto leading-relaxed text-sm">
            Adicione os itens do seu enxoval para começar a acompanhar o progresso dos cômodos e o orçamento da casa nova.
          </p>
          <Button asChild size="lg" className="bg-primary shadow-sm">
            <Link to="/planejamento">Adicionar primeiro item</Link>
          </Button>
        </motion.div>
      ) : (
        <>
          {/* Faixa de Destaque (Gasto do Bolso) */}
          <motion.div variants={itemVariants} className="rounded-xl border border-border bg-card p-6 md:p-8 shadow-card flex flex-col gap-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-mono mb-1.5">Gasto Total Acumulado</div>
                <div className="flex items-baseline gap-2">
                  <span className="font-display text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-foreground font-mono tabular-nums">
                    {brl(r?.totalGeral).replace('R$', '').trim()}
                  </span>
                  <span className="text-base text-muted-foreground font-mono font-medium">BRL</span>
                </div>
              </div>
              {meta > 0 && (
                <div className="text-xs font-medium px-3.5 py-1.5 bg-surface border border-border rounded-full text-foreground shadow-2xs font-mono">
                  <span className="text-primary font-bold">{pct.toFixed(0)}%</span> da meta de {brl(meta)}
                </div>
              )}
            </div>

            {meta > 0 && (
              <div className="space-y-2">
                <Progress value={pct} className="h-2 bg-muted [&>div]:bg-primary" />
                {meta - (r?.totalGeral ?? 0) > 0 && (
                  <p className="text-xs text-muted-foreground font-medium text-right font-mono">
                    Restam <span className="tabular-nums font-semibold text-foreground">{brl(meta - (r?.totalGeral ?? 0))}</span> livres
                  </p>
                )}
              </div>
            )}
            
            {/* Mini-Totais (Chips) */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <div className="flex items-center gap-2.5 bg-surface border border-border px-3 py-2 rounded-md shadow-2xs">
                <div className="bg-amber-500/10 text-amber-600 dark:text-amber-400 p-1.5 rounded-md"><ShoppingBag className="w-4 h-4"/></div>
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground font-mono">Dinheiro</div>
                  <div className="text-sm font-bold font-mono tabular-nums leading-none text-foreground">{brl(r?.totalNormal)}</div>
                </div>
              </div>
              <div className="flex items-center gap-2.5 bg-surface border border-border px-3 py-2 rounded-md shadow-2xs">
                <div className="bg-destructive/10 text-destructive p-1.5 rounded-md"><CreditCard className="w-4 h-4"/></div>
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground font-mono">Parcelado</div>
                  <div className="text-sm font-bold font-mono tabular-nums leading-none text-foreground">{brl(totalParcelado)}</div>
                </div>
              </div>
              <div className="flex items-center gap-2.5 bg-surface border border-border px-3 py-2 rounded-md shadow-2xs">
                <div className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 p-1.5 rounded-md"><Wallet className="w-4 h-4"/></div>
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground font-mono">VR / VA</div>
                  <div className="text-sm font-bold font-mono tabular-nums leading-none text-foreground">{brl(r?.totalVr)}</div>
                </div>
              </div>
              {isCasal && (
                <div className="flex items-center gap-2.5 bg-surface border border-border px-3 py-2 rounded-md shadow-2xs">
                  <div className="bg-primary/10 text-primary p-1.5 rounded-md"><Target className="w-4 h-4"/></div>
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground font-mono">Divisão</div>
                    <div className="text-xs font-mono leading-tight mt-0.5">
                      <span className="text-muted-foreground">{p1.split(' ')[0]}:</span> <span className="tabular-nums font-semibold text-foreground">{brl(r?.totalPessoa1)}</span>
                      <span className="mx-1 text-muted-foreground">|</span>
                      <span className="text-muted-foreground">{p2.split(' ')[0]}:</span> <span className="tabular-nums font-semibold text-foreground">{brl(r?.totalPessoa2)}</span>
                      {(() => {
                        const conj = Math.max(0, (r?.totalGeral ?? 0) - ((r?.totalPessoa1 ?? 0) + (r?.totalPessoa2 ?? 0)));
                        return conj > 0 ? (
                          <>
                            <span className="mx-1 text-muted-foreground">|</span>
                            <span className="text-muted-foreground">Juntos:</span> <span className="tabular-nums font-semibold text-foreground">{brl(conj)}</span>
                          </>
                        ) : null;
                      })()}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Distribuição por Cômodo (Grid de Cards) */}
          <motion.div variants={itemVariants} className="space-y-4">
            <div>
              <h3 className="font-display text-xl font-bold tracking-tight text-foreground">Por Cômodo</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">Onde seu orçamento está sendo alocado</p>
            </div>
            
            {r?.porCategoria && r.porCategoria.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {r.porCategoria.map((c) => {
                  const metaC = c.metaOrcamento ?? 0;
                  const pctC = metaC > 0 ? Math.min(100, (c.totalGasto / metaC) * 100) : 0;
                  const IconComp = iconFor(c.icon);
                  
                  return (
                    <div key={c.categoriaId} className="bg-card border border-border rounded-xl p-4 shadow-card flex flex-col justify-between hover:border-primary/40 transition-colors">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="h-9 w-9 rounded-md flex items-center justify-center shrink-0" style={{ backgroundColor: `${c.cor ?? 'var(--primary)'}18`, color: c.cor ?? 'var(--primary)' }}>
                          <IconComp className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-sm text-foreground truncate">{c.categoriaNome}</p>
                          <p className="text-xs text-muted-foreground font-mono">{c.totalItens} itens</p>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex items-end justify-between mb-2">
                          <span className="font-bold text-base text-foreground font-mono tabular-nums leading-none">{brl(c.totalGasto)}</span>
                          {metaC > 0 && <span className="text-xs text-muted-foreground font-mono">de <span className="tabular-nums">{brl(metaC)}</span></span>}
                        </div>
                        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${metaC > 0 ? pctC : 100}%`, backgroundColor: c.cor ?? 'var(--primary)' }} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground shadow-card">
                Nenhum cômodo com gastos associados.
              </div>
            )}
          </motion.div>

          {/* Duas colunas finais: Próximas Compras e Projeção */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Próximas Compras */}
            <motion.div variants={itemVariants} className="rounded-[var(--radius-lg)] border-none bg-muted/30 p-5 md:p-6 flex flex-col">
              <h3 className="font-display text-lg font-semibold tracking-tight mb-1">Próximas compras</h3>
              <p className="text-sm text-muted-foreground mb-6">Pendências no planejamento</p>
              
              <div className="flex-1 space-y-3">
                {validItens.filter(i => !i.comprado).length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground py-8">
                    <CheckCircle className="h-8 w-8 text-success/40 mb-3" />
                    <p className="text-sm font-medium text-foreground">Tudo comprado!</p>
                    <p className="text-xs mt-1">Nenhuma pendência.</p>
                  </div>
                ) : (
                  validItens.filter(i => !i.comprado).slice(0, 4).map((item, idx) => {
                    const cat = categorias.find(c => c.id === item.categoriaId);
                    return (
                      <div key={idx} className="flex items-center justify-between p-3.5 rounded-[var(--radius-lg)] bg-background border shadow-sm">
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                            <ShoppingBag className="h-4 w-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{item.nome}</p>
                            <p className="text-xs text-muted-foreground truncate">{cat?.nome ?? "Sem cômodo"}</p>
                          </div>
                        </div>
                        <div className="text-sm font-semibold text-foreground shrink-0 ml-3 tabular-nums">
                          {brl(item.preco)}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
              
              <Button asChild variant="ghost" className="w-full mt-6 text-primary hover:text-primary hover:bg-primary/5">
                <Link to="/planejamento">Ver planejamento completo</Link>
              </Button>
            </motion.div>

            {/* Gráfico: Projeção de Faturas */}
            <motion.div variants={itemVariants} className="rounded-[var(--radius-lg)] border bg-card p-5 md:p-6 shadow-sm flex flex-col">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="font-display text-lg font-semibold tracking-tight">Projeção de Faturas</h3>
                  <p className="text-sm text-muted-foreground mt-1">Evolução futura de gastos parcelados</p>
                </div>
              </div>

              <div className="flex-1 min-h-[220px]">
                {faturasMensais.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground">
                    <p className="text-sm">Sem parcelamentos registrados.</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={faturasMensais} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                      <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                        dy={10}
                      />
                      <YAxis hide />
                      <Tooltip
                        cursor={{ fill: 'var(--muted)', opacity: 0.5 }}
                        contentStyle={{ borderRadius: '12px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)' }}
                        formatter={(v: number) => [<span className="font-semibold text-foreground tabular-nums">{brl(v)}</span>, <span className="text-muted-foreground">Fatura</span>]}
                        labelStyle={{ fontWeight: 600, color: 'var(--foreground)', marginBottom: '4px' }}
                      />
                      <Bar dataKey="valor" fill="var(--primary)" radius={[4, 4, 0, 0]} maxBarSize={45} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </motion.div>
  );
}
