import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, Variants } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
  Wallet,
  ShoppingBag,
  Target,
  Plus,
  CreditCard,
  FileText,
  Gift,
  CheckCircle,
  AlertTriangle,
  ChevronDown,
} from "lucide-react";
import { Bar, BarChart, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { resumoService } from "@/services/resumo";
import type { ResumoCategoria } from "@/services/types";
import { brl } from "@/lib/formatters";
import { valorParcela, calcularStatusParcelas, parseDataReferencia } from "@/lib/parcelas";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { iconFor, comodoColor } from "@/components/planejamento/icon-map";
import { useMemo } from "react";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";
import { WidgetDiaMudanca } from "@/components/planejamento/WidgetDiaMudanca";
import { InicioSkeleton } from "@/components/ui/LoadingSkeletons";
import { DESIGN_TOKENS } from "@/design-system";

export const Route = createFileRoute("/_authenticated/inicio")({
  head: () => ({
    meta: [{ title: "CasalPlanner - Início" }, { name: "robots", content: "noindex" }],
  }),
  component: InicioPage,
});

const FALLBACK_COLORS = [...DESIGN_TOKENS.colors.chartPalette];

function InicioPage() {
  const { usuario } = useAuth();
  const isCasal = usuario?.tipoConta === "Casal";
  const p1 = usuario?.casalInfo?.pessoa1?.nome || "Pessoa 1";
  const p2 = usuario?.casalInfo?.pessoa2?.nome || "Pessoa 2";
  const p1Primeiro = p1.split(" ")[0];
  const p2Primeiro = p2.split(" ")[0];

  const { data: categorias = [], isLoading: loadingCategorias } = useQuery({
    queryKey: ["categorias"],
    queryFn: () => import("@/services/categorias").then((m) => m.categoriasService.listar()),
  });

  const { data: itens = [], isLoading: loadingItens } = useQuery({
    queryKey: ["itens"],
    queryFn: () => import("@/services/itens").then((m) => m.itensService.listar()),
    retry: false,
  });

  const { data: resumo } = useQuery({
    queryKey: ["resumo"],
    queryFn: () => resumoService.obterAdaptado(categorias),
  });

  const isLoading =
    (loadingCategorias && categorias.length === 0) || (loadingItens && itens.length === 0);

  const faturasMensais = useMemo(() => {
    if (!itens || itens.length === 0) return [];

    const agora = new Date();
    const mesAtualKey = `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, "0")}`;
    const mesesMap = new Map<string, number>();

    const itensRelevantes = itens.filter(
      (i) =>
        !["ganho", "presente", "prometido"].includes(i.origem ?? "") &&
        i.pagamento !== "vr" &&
        (i.parcelas ?? 1) > 1 &&
        (i.comprado || i.dataCompra),
    );

    itensRelevantes.forEach((item) => {
      const dataRef = parseDataReferencia(item.dataCompra ?? item.createdAt);
      const valorTotal = item.preco * item.quantidade;
      const parcelas = Math.max(1, item.parcelas ?? 1);
      const vParcela = valorParcela(valorTotal, parcelas, item.jurosMensal ?? 0);

      for (let i = 0; i < parcelas; i++) {
        const dataParcela = new Date(dataRef.getFullYear(), dataRef.getMonth() + i, 1);
        const mesAnoKey = `${dataParcela.getFullYear()}-${String(dataParcela.getMonth() + 1).padStart(2, "0")}`;

        // Respeitar o dia/mês da compra: não mostrar parcelas que já foram no passado
        if (mesAnoKey >= mesAtualKey) {
          mesesMap.set(mesAnoKey, (mesesMap.get(mesAnoKey) ?? 0) + vParcela);
        }
      }
    });

    return Array.from(mesesMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([key, valor], index) => {
        const [ano, mes] = key.split("-");
        const data = new Date(parseInt(ano), parseInt(mes) - 1, 1);
        const mesStr = data.toLocaleDateString("pt-BR", { month: "short" });
        return {
          name: mesStr.charAt(0).toUpperCase() + mesStr.slice(1).replace(".", ""),
          fullLabel: `${mesStr.charAt(0).toUpperCase() + mesStr.slice(1)}/${ano}`,
          valor: valor,
          fill:
            index % 2 === 0
              ? DESIGN_TOKENS.colors.couple.p1.light
              : DESIGN_TOKENS.colors.couple.p2.light,
        };
      });
  }, [itens]);

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
  let realTotalConjunto = 0;
  validItens.forEach((i) => {
    const valorTotal = i.preco * i.quantidade;
    if (i.divisaoPagamento) {
      realTotalP1 += i.divisaoPagamento.valorPessoa1 || 0;
      realTotalP2 += i.divisaoPagamento.valorPessoa2 || 0;
    } else if (i.responsavelId === 1) {
      realTotalP1 += valorTotal;
    } else if (i.responsavelId === 2) {
      realTotalP2 += valorTotal;
    } else {
      realTotalConjunto += valorTotal;
    }
  });

  const metaCalculada = useMemo(() => {
    if (usuario?.metaGlobalEnxoval && usuario.metaGlobalEnxoval > 0) {
      return usuario.metaGlobalEnxoval;
    }
    return categorias.reduce((s, c) => s + (c.metaOrcamento || 0), 0);
  }, [usuario, categorias]);

  const porCategoriaCalculado: ResumoCategoria[] = useMemo(() => {
    return categorias.map((c) => {
      const cItens = validItens.filter((it) => it.categoriaId === c.id);
      const totalGasto = cItens.reduce((s, it) => s + it.preco * it.quantidade, 0);
      const itensComprados = cItens.filter((it) => it.comprado).length;

      return {
        categoriaId: c.id,
        categoriaNome: c.nome,
        totalGasto,
        totalItens: cItens.length,
        itensComprados,
        metaOrcamento: c.metaOrcamento ?? null,
        cor: comodoColor(c.bg, c.nome),
        icon: c.icon ?? null,
      };
    });
  }, [categorias, validItens]);

  const r = useMemo(() => {
    return {
      totalGeral: realTotalGeral,
      totalNormal: realTotalNormal,
      totalVr: realTotalVr,
      itensComprados: realTotalComprados,
      totalItens: validItens.length,
      totalPessoa1: realTotalP1,
      totalPessoa2: realTotalP2,
      totalConjunto: realTotalConjunto,
      metaGlobal: metaCalculada,
      percentualMeta: metaCalculada > 0 ? (realTotalGeral / metaCalculada) * 100 : null,
      mesAtual: resumo?.mesAtual ?? 0,
      mesPassado: resumo?.mesPassado ?? 0,
      mesRetrasado: resumo?.mesRetrasado ?? 0,
      variacaoMensal: resumo?.variacaoMensal ?? null,
      porCategoria: porCategoriaCalculado,
    };
  }, [
    realTotalGeral,
    realTotalNormal,
    realTotalVr,
    realTotalComprados,
    validItens.length,
    realTotalP1,
    realTotalP2,
    realTotalConjunto,
    metaCalculada,
    resumo,
    porCategoriaCalculado,
  ]);

  const meta = metaCalculada;
  const pct = meta > 0 ? Math.min(100, (realTotalGeral / meta) * 100) : 0;
  const valorRestante = meta > 0 ? Math.max(0, meta - realTotalGeral) : 0;

  const parcelasResumo = useMemo(() => {
    const agora = new Date();
    let somaDesteMes = 0;
    let somaRestanteAtivo = 0;
    let comprasAtivas = 0;

    itens.forEach((it) => {
      if (
        ["ganho", "presente", "prometido"].includes(it.origem ?? "") ||
        it.pagamento === "vr" ||
        (it.parcelas ?? 1) <= 1
      )
        return;
      if (!it.comprado && !it.dataCompra) return;

      const status = calcularStatusParcelas(it, agora);
      if (status.ativo) {
        somaDesteMes += status.valorDesteMes;
        somaRestanteAtivo += status.valorRestante;
        comprasAtivas += 1;
      }
    });

    return {
      valorDesteMes: somaDesteMes,
      valorRestanteAtivo: somaRestanteAtivo,
      comprasAtivas,
    };
  }, [itens]);

  const parcelasDesteMes = parcelasResumo.valorDesteMes;
  const totalParcelado = parcelasResumo.valorRestanteAtivo;

  const totalEconomizadoGanhos = itens
    .filter((i) => ["ganho", "presente"].includes(i.origem ?? ""))
    .reduce((s, i) => s + i.preco * i.quantidade, 0);
  const qtdGanhos = itens.filter((i) => ["ganho", "presente"].includes(i.origem ?? "")).length;

  const hoje = new Date();
  const mesAtualFormatado = hoje.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  const mesCapitalizado = mesAtualFormatado.charAt(0).toUpperCase() + mesAtualFormatado.slice(1);

  const semDados = categorias.length === 0 && validItens.length === 0;

  // ─── Gerador de Relatório PDF Financeiro ───────────────────────────────────
  const gerarRelatorioFinanceiro = async () => {
    const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
      import("jspdf"),
      import("jspdf-autotable"),
    ]);
    const doc = new jsPDF();
    const dataStr = hoje.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
    const nomesCasal = isCasal ? `${p1} & ${p2}` : (usuario?.nomeCompleto ?? "CasalPlanner");

    // Cabeçalho
    doc.setFillColor(47, 125, 91);
    doc.rect(0, 0, 210, 35, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("Relatório Financeiro", 14, 16);
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(`${nomesCasal}  •  ${dataStr}`, 14, 27);

    // Resumo Geral
    doc.setTextColor(36, 48, 42);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Resumo Geral", 14, 48);

    const totalGeral = r?.totalGeral ?? 0;
    const totalItens = r?.totalItens ?? 0;
    const totalComprados = r?.itensComprados ?? 0;
    const metaVal = r?.metaGlobal ?? 0;
    const pctMeta = metaVal > 0 ? Math.min(100, (totalGeral / metaVal) * 100) : null;

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
      headStyles: { fillColor: [47, 125, 91], textColor: 255, fontStyle: "bold" },
      alternateRowStyles: { fillColor: [246, 241, 233] },
      columnStyles: { 1: { halign: "right", fontStyle: "bold" } },
      styles: { fontSize: 10 },
    });

    // Gastos por Cômodo
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const afterMetricas = (doc as any).lastAutoTable?.finalY ?? 115;
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(36, 48, 42);
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
      body: porCategoria.length > 0 ? porCategoria : [["Nenhum cômodo", "—", "—", "—"]],
      theme: "striped",
      headStyles: { fillColor: [47, 125, 91], textColor: 255, fontStyle: "bold" },
      columnStyles: { 1: { halign: "right" }, 3: { halign: "right" } },
      styles: { fontSize: 9 },
    });

    const pages = doc.getNumberOfPages();
    doc.setFontSize(8);
    doc.setTextColor(100);
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
      transition: { staggerChildren: 0.08 },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
  };

  if (isLoading) {
    return <InicioSkeleton />;
  }

  // Porcentagens das pessoas, conjunto e ganhos para a barra empilhada
  const totalBolso =
    (r?.totalPessoa1 ?? 0) +
      (r?.totalPessoa2 ?? 0) +
      (r?.totalConjunto ?? 0) +
      (totalEconomizadoGanhos ?? 0) ||
    (r?.totalGeral ?? 1);
  const p1Pct = totalBolso > 0 ? ((r?.totalPessoa1 ?? 0) / totalBolso) * 100 : 0;
  const p2Pct = totalBolso > 0 ? ((r?.totalPessoa2 ?? 0) / totalBolso) * 100 : 0;
  const conjPct = totalBolso > 0 ? ((r?.totalConjunto ?? 0) / totalBolso) * 100 : 0;
  const ganhoPct = totalBolso > 0 ? ((totalEconomizadoGanhos ?? 0) / totalBolso) * 100 : 0;

  return (
    <motion.div
      className="w-full space-y-6 md:space-y-8 font-sans"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* ─── Topo: Mês & Título & Botão Adicionar ─────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <span className="text-xs font-semibold text-muted-foreground block mb-0.5">
            {mesCapitalizado}
          </span>
          <h1 className="font-display text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-foreground">
            {isCasal ? "Resumo do nosso lar" : "Resumo do meu lar"}
          </h1>
        </div>
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={gerarRelatorioFinanceiro}
            className="btn-sticker flex-1 sm:flex-none h-10 px-3.5 bg-card text-foreground font-bold text-xs sm:text-sm"
          >
            <FileText className="h-4 w-4 mr-1.5" /> PDF
          </Button>
          <Button
            asChild
            size="sm"
            className="btn-sticker flex-1 sm:flex-none h-10 px-4 bg-primary text-primary-foreground font-bold text-xs sm:text-sm"
          >
            <Link to="/planejamento">
              <Plus className="h-4 w-4 mr-1.5" /> Adicionar item
            </Link>
          </Button>
        </div>
      </div>

      {/* ─── Widget Data da Mudança & Previsão ─────────────────────────────────── */}
      <motion.div variants={itemVariants}>
        <WidgetDiaMudanca />
      </motion.div>

      {semDados ? (
        <motion.div
          variants={itemVariants}
          className="card-sticker-lg p-8 sm:p-12 text-center bg-card shadow-[4px_4px_0_var(--border)]"
        >
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl border-2 border-border bg-primary/10 text-primary mb-4 shadow-xs">
            <ShoppingBag className="h-7 w-7" />
          </div>
          <h2 className="font-display text-xl font-bold tracking-tight mb-2">
            Comece o seu enxoval
          </h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto leading-relaxed text-xs sm:text-sm font-medium">
            Adicione os itens do seu enxoval para acompanhar o progresso dos cômodos e o orçamento
            da casa nova.
          </p>
          <Button
            asChild
            size="default"
            className="btn-sticker bg-primary text-primary-foreground font-bold text-xs sm:text-sm"
          >
            <Link to="/planejamento">Adicionar primeiro item</Link>
          </Button>
        </motion.div>
      ) : (
        <>
          {/* ─── 4 Cards de Métricas Principais (KPIs) ─────────────────────────── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* KPI 1: Total Gasto */}
            <motion.div
              variants={itemVariants}
              className="card-sticker p-4 bg-card shadow-[2px_2px_0_var(--border)] flex flex-col justify-between"
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Total Gasto
                </span>
                <span className="p-1.5 rounded-lg bg-primary/10 text-primary">
                  <Wallet className="h-3.5 w-3.5" />
                </span>
              </div>
              <div className="font-display text-xl sm:text-2xl font-extrabold text-foreground tabular-nums tracking-tight">
                {brl(r?.totalGeral)}
              </div>
              <span className="text-[11px] text-muted-foreground font-semibold mt-1">
                {meta > 0 ? `meta: ${brl(meta)}` : "Sem meta definida"}
              </span>
            </motion.div>

            {/* KPI 2: Saldo na Meta */}
            <motion.div
              variants={itemVariants}
              className="card-sticker p-4 bg-card shadow-[2px_2px_0_var(--border)] flex flex-col justify-between"
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  {meta > 0 && valorRestante <= 0 ? "Orçamento Excedido" : "Disponível na Meta"}
                </span>
                <span
                  className={cn(
                    "p-1.5 rounded-lg",
                    meta > 0 && valorRestante <= 0
                      ? "bg-destructive/10 text-destructive"
                      : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
                  )}
                >
                  <Target className="h-3.5 w-3.5" />
                </span>
              </div>
              <div
                className={cn(
                  "font-display text-xl sm:text-2xl font-extrabold tabular-nums tracking-tight",
                  meta > 0 && valorRestante <= 0 ? "text-destructive" : "text-foreground",
                )}
              >
                {meta > 0 ? brl(Math.abs(valorRestante)) : "—"}
              </div>
              <span className="text-[11px] text-muted-foreground font-semibold mt-1">
                {meta > 0
                  ? valorRestante >= 0
                    ? `${(100 - pct).toFixed(0)}% restante`
                    : "Acima do planejado"
                  : "Defina no perfil"}
              </span>
            </motion.div>

            {/* KPI 3: Parcelas do Mês */}
            <motion.div
              variants={itemVariants}
              className="card-sticker p-4 bg-card shadow-[2px_2px_0_var(--border)] flex flex-col justify-between"
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Fatura do Mês
                </span>
                <span className="p-1.5 rounded-lg bg-primary/10 text-primary">
                  <CreditCard className="h-3.5 w-3.5" />
                </span>
              </div>
              <div className="font-display text-xl sm:text-2xl font-extrabold text-foreground tabular-nums tracking-tight">
                {brl(parcelasResumo.valorDesteMes)}
              </div>
              <span className="text-[11px] text-muted-foreground font-semibold mt-1">
                {parcelasResumo.comprasAtivas > 0
                  ? `${parcelasResumo.comprasAtivas} ${parcelasResumo.comprasAtivas === 1 ? "parcelamento" : "parcelamentos"}`
                  : "Nenhuma compra parcelada"}
              </span>
            </motion.div>

            {/* KPI 4: Itens Comprados */}
            <motion.div
              variants={itemVariants}
              className="card-sticker p-4 bg-card shadow-[2px_2px_0_var(--border)] flex flex-col justify-between"
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Itens Comprados
                </span>
                <span className="p-1.5 rounded-lg bg-primary/10 text-primary">
                  <ShoppingBag className="h-3.5 w-3.5" />
                </span>
              </div>
              <div className="font-display text-xl sm:text-2xl font-extrabold text-foreground tabular-nums tracking-tight">
                {r?.itensComprados}{" "}
                <span className="text-sm sm:text-base font-semibold text-muted-foreground">
                  de {r?.totalItens}
                </span>
              </div>
              <span className="text-[11px] text-muted-foreground font-semibold mt-1">
                {r?.totalItens && r.totalItens > 0
                  ? `${Math.round(((r.itensComprados ?? 0) / r.totalItens) * 100)}% concluído`
                  : "Sem itens"}
              </span>
            </motion.div>
          </div>

          {/* ─── Card Grande: Orçamento e Divisão do Casal ──────────────────────── */}
          <motion.div
            variants={itemVariants}
            className="card-sticker p-5 sm:p-6 bg-card shadow-[3px_3px_0_var(--border)] space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="font-display text-lg sm:text-xl font-bold tracking-tight text-foreground">
                  Divisão e Uso do Orçamento
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground font-medium">
                  Acompanhe quanto cada um investiu e a economia com presentes.
                </p>
              </div>
              <span className="text-xs font-bold text-muted-foreground shrink-0">
                {meta > 0
                  ? `${pct.toFixed(0)}% da meta usada`
                  : `${validItens.length} itens no enxoval`}
              </span>
            </div>

            {/* Barra Empilhada */}
            <div className="space-y-2.5">
              <div className="h-3.5 w-full rounded-full border border-border bg-muted/40 overflow-hidden flex">
                {isCasal ? (
                  <div
                    className="h-full flex transition-all duration-500 overflow-hidden"
                    style={{ width: `${meta > 0 ? pct : 100}%` }}
                  >
                    {(r?.totalPessoa1 ?? 0) > 0 && (
                      <div
                        className="h-full bg-primary transition-all duration-500"
                        style={{ width: `${p1Pct}%` }}
                        title={`${p1Primeiro}: ${brl(r?.totalPessoa1)} (${p1Pct.toFixed(1)}%)`}
                      />
                    )}
                    {(r?.totalPessoa2 ?? 0) > 0 && (
                      <div
                        className="h-full bg-[#EF6F6C] transition-all duration-500"
                        style={{ width: `${p2Pct}%` }}
                        title={`${p2Primeiro}: ${brl(r?.totalPessoa2)} (${p2Pct.toFixed(1)}%)`}
                      />
                    )}
                    {(r?.totalConjunto ?? 0) > 0 && (
                      <div
                        className="h-full bg-joint transition-all duration-500"
                        style={{ width: `${conjPct}%` }}
                        title={`Conjunto: ${brl(r?.totalConjunto)} (${conjPct.toFixed(1)}%)`}
                      />
                    )}
                    {totalEconomizadoGanhos > 0 && (
                      <div
                        className="h-full bg-amber-500 transition-all duration-500"
                        style={{ width: `${ganhoPct}%` }}
                        title={`Presentes: ${brl(totalEconomizadoGanhos)} (${ganhoPct.toFixed(1)}%)`}
                      />
                    )}
                  </div>
                ) : (
                  <div
                    className="h-full bg-primary transition-all duration-500"
                    style={{ width: `${meta > 0 ? pct : 100}%` }}
                  />
                )}
              </div>

              {/* Chips de Divisão */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {isCasal ? (
                  <>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-card border border-border shadow-2xs">
                      <span className="w-4 h-4 rounded-md bg-primary text-primary-foreground font-bold text-[10px] grid place-items-center uppercase">
                        {p1Primeiro[0]}
                      </span>
                      <span className="text-xs font-semibold text-muted-foreground">
                        {p1Primeiro}:
                      </span>
                      <span className="text-xs font-bold text-foreground tabular-nums">
                        {brl(r?.totalPessoa1)}
                      </span>
                    </div>

                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-card border border-border shadow-2xs">
                      <span className="w-4 h-4 rounded-md bg-[#EF6F6C] text-white font-bold text-[10px] grid place-items-center uppercase">
                        {p2Primeiro[0]}
                      </span>
                      <span className="text-xs font-semibold text-muted-foreground">
                        {p2Primeiro}:
                      </span>
                      <span className="text-xs font-bold text-foreground tabular-nums">
                        {brl(r?.totalPessoa2)}
                      </span>
                    </div>

                    {(r?.totalConjunto ?? 0) > 0 && (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/5 border border-primary/20 shadow-2xs">
                        <span className="w-4 h-4 rounded-md bg-primary/15 text-primary font-bold text-[10px] grid place-items-center">
                          👥
                        </span>
                        <span className="text-xs font-semibold text-muted-foreground">
                          Conjunto:
                        </span>
                        <span className="text-xs font-bold text-foreground tabular-nums">
                          {brl(r?.totalConjunto)}
                        </span>
                      </div>
                    )}

                    {totalEconomizadoGanhos > 0 && (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 shadow-2xs">
                        <span className="w-4 h-4 rounded-md bg-amber-500/20 text-amber-700 dark:text-amber-400 font-bold text-[10px] grid place-items-center">
                          <Gift className="w-2.5 h-2.5" />
                        </span>
                        <span className="text-xs font-semibold text-amber-900 dark:text-amber-300">
                          Presentes:
                        </span>
                        <span className="text-xs font-bold text-amber-900 dark:text-amber-200 tabular-nums">
                          {brl(totalEconomizadoGanhos)}
                        </span>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-card border border-border shadow-2xs">
                    <span className="w-2.5 h-2.5 rounded-full bg-primary" />
                    <span className="text-xs font-semibold text-muted-foreground">Total:</span>
                    <span className="text-xs font-bold text-foreground tabular-nums">
                      {brl(r?.totalGeral)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* ─── Seção Cômodos (Sempre Aberta e Visível no Desktop e Mobile) ────── */}
          <motion.div variants={itemVariants} className="space-y-3.5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display text-lg sm:text-xl font-bold tracking-tight text-foreground">
                  Cômodos da Casa
                </h2>
                <p className="text-xs text-muted-foreground font-medium">
                  Gastos e metas distribuídos por ambiente
                </p>
              </div>
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="text-xs font-bold text-primary hover:text-primary hover:bg-primary/10"
              >
                <Link to="/planejamento">Ver todos</Link>
              </Button>
            </div>

            {r?.porCategoria && r.porCategoria.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {r.porCategoria.map((c) => {
                  const metaC = c.metaOrcamento ?? 0;
                  const estourou = metaC > 0 && c.totalGasto > metaC;
                  const pctC = metaC > 0 ? Math.min(100, (c.totalGasto / metaC) * 100) : 100;
                  const IconComp = iconFor(c.icon);
                  const corComodo = comodoColor(c.cor, c.categoriaNome);

                  return (
                    <Link
                      key={c.categoriaId}
                      to="/planejamento"
                      search={{ comodo: c.categoriaId }}
                      className="card-sticker p-4 bg-card shadow-[2px_2px_0_var(--border)] flex flex-col justify-between gap-3.5 transition-all hover:border-primary/50 group block cursor-pointer"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div
                              className="h-8 w-8 rounded-xl border border-border flex items-center justify-center shrink-0 shadow-xs"
                              style={{
                                backgroundColor: `${corComodo}25`,
                                color: corComodo,
                              }}
                            >
                              <IconComp className="h-4 w-4" />
                            </div>
                            <span className="font-bold text-sm sm:text-base text-foreground truncate group-hover:text-primary transition-colors capitalize">
                              {c.categoriaNome}
                            </span>
                          </div>
                          {estourou && (
                            <span className="border border-destructive/30 rounded-full px-2 py-0.5 text-[10px] font-bold bg-destructive/10 text-destructive shrink-0">
                              Estourou
                            </span>
                          )}
                        </div>

                        <div className="text-xs font-semibold text-muted-foreground mt-2">
                          <span className="tabular-nums font-bold text-foreground">
                            {brl(c.totalGasto)}
                          </span>{" "}
                          {metaC > 0 ? `de ${brl(metaC)}` : `(${c.totalItens} itens)`}
                        </div>
                      </div>

                      <div className="h-2 w-full rounded-full border border-border bg-muted/40 overflow-hidden">
                        <div
                          className="h-full transition-all duration-500 rounded-full"
                          style={{
                            width: `${pctC}%`,
                            backgroundColor: estourou ? "var(--destructive)" : corComodo,
                          }}
                        />
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="card-sticker p-6 text-center text-xs text-muted-foreground font-semibold bg-card">
                Nenhum cômodo cadastrado ainda. Crie cômodos na página de Planejamento.
              </div>
            )}
          </motion.div>

          {/* ─── Seção Gráfico: Faturas dos Próximos Meses ──────────────────────── */}
          <motion.div
            variants={itemVariants}
            className="card-sticker p-5 sm:p-6 bg-card shadow-[3px_3px_0_var(--border)] space-y-4"
          >
            <div>
              <h2 className="font-display text-lg sm:text-xl font-bold tracking-tight text-foreground">
                Faturas dos próximos meses
              </h2>
              <p className="text-xs text-muted-foreground font-medium mt-0.5">
                Projeção mês a mês de compras parceladas
              </p>
            </div>

            <div className="w-full h-[200px]">
              {faturasMensais.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground font-medium">
                  <p className="text-xs sm:text-sm">Nenhuma fatura futura parcelada registrada.</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={faturasMensais}
                    margin={{ top: 10, right: 10, bottom: 0, left: 10 }}
                  >
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fontWeight: 700, fill: "var(--foreground)" }}
                      dy={8}
                    />
                    <YAxis hide />
                    <Tooltip
                      cursor={{ fill: "var(--muted)", opacity: 0.5 }}
                      contentStyle={{
                        borderRadius: "12px",
                        border: "2px solid var(--border)",
                        boxShadow: "2px 2px 0 var(--border)",
                        backgroundColor: "var(--card)",
                        color: "var(--foreground)",
                        fontWeight: 700,
                        fontSize: "12px",
                      }}
                      formatter={(v: number) => [
                        <span key="val" className="font-bold text-foreground tabular-nums">
                          {brl(v)}
                        </span>,
                        "Fatura",
                      ]}
                      labelFormatter={(label) => `Mês: ${label}`}
                    />
                    <Bar
                      dataKey="valor"
                      fill="var(--primary)"
                      stroke="var(--border)"
                      strokeWidth={1}
                      radius={[6, 6, 0, 0]}
                      maxBarSize={48}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </motion.div>

          {/* ─── Seção Inferior: Próximas Compras & Formas de Pagamento ─────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Próximas Compras */}
            <motion.div
              variants={itemVariants}
              className="card-sticker p-5 sm:p-6 bg-card shadow-[3px_3px_0_var(--border)] flex flex-col justify-between"
            >
              <div>
                <h3 className="font-display text-base sm:text-lg font-bold tracking-tight text-foreground mb-1">
                  Próximas compras
                </h3>
                <p className="text-xs text-muted-foreground font-medium mb-3.5">
                  Pendências prioritárias no seu planejamento
                </p>

                <div className="space-y-2.5">
                  {validItens.filter((i) => !i.comprado).length === 0 ? (
                    <div className="py-6 text-center text-muted-foreground font-medium flex flex-col items-center justify-center">
                      <CheckCircle className="h-7 w-7 text-primary mb-2" />
                      <p className="text-xs font-bold text-foreground">Tudo comprado!</p>
                      <p className="text-[11px]">Nenhum item pendente no momento.</p>
                    </div>
                  ) : (
                    validItens
                      .filter((i) => !i.comprado)
                      .slice(0, 4)
                      .map((item, idx) => {
                        const cat = categorias.find((c) => c.id === item.categoriaId);
                        return (
                          <div
                            key={idx}
                            className="card-sticker p-2.5 bg-card shadow-[1px_1px_0_var(--border)] flex items-center justify-between"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="h-7 w-7 rounded-lg border border-border bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                <ShoppingBag className="h-3.5 w-3.5" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-foreground truncate">
                                  {item.nome}
                                </p>
                                <p className="text-[11px] text-muted-foreground font-medium truncate">
                                  {cat?.nome ?? "Sem cômodo"}
                                </p>
                              </div>
                            </div>
                            <span className="text-xs font-bold tabular-nums text-foreground shrink-0 ml-2">
                              {brl(item.preco)}
                            </span>
                          </div>
                        );
                      })
                  )}
                </div>
              </div>

              <Button
                asChild
                variant="outline"
                className="btn-sticker w-full mt-4 bg-card text-foreground font-bold text-xs"
              >
                <Link to="/planejamento">Ver planejamento completo</Link>
              </Button>
            </motion.div>

            {/* Formas de Pagamento */}
            <motion.div
              variants={itemVariants}
              className="card-sticker p-5 sm:p-6 bg-card shadow-[3px_3px_0_var(--border)] flex flex-col justify-between"
            >
              <div>
                <h3 className="font-display text-base sm:text-lg font-bold tracking-tight text-foreground mb-1">
                  Formas de pagamento
                </h3>
                <p className="text-xs text-muted-foreground font-medium mb-3.5">
                  Distribuição dos recursos investidos
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="card-sticker p-3 bg-card shadow-[1px_1px_0_var(--border)] flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg border border-border bg-muted/60 text-muted-foreground">
                      <ShoppingBag className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                        Dinheiro / Pix
                      </span>
                      <span className="text-sm font-bold tabular-nums text-foreground">
                        {brl(r?.totalNormal)}
                      </span>
                    </div>
                  </div>

                  <div className="card-sticker p-3 bg-card shadow-[1px_1px_0_var(--border)] flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg border border-border bg-muted/60 text-muted-foreground">
                      <CreditCard className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                        Cartão Parcelado
                      </span>
                      <span className="text-sm font-bold tabular-nums text-foreground">
                        {brl(totalParcelado)}
                      </span>
                    </div>
                  </div>

                  <div className="card-sticker p-3 bg-card shadow-[1px_1px_0_var(--border)] flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg border border-border bg-primary/10 text-primary">
                      <Wallet className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                        Vale VR / VA
                      </span>
                      <span className="text-sm font-bold tabular-nums text-foreground">
                        {brl(r?.totalVr)}
                      </span>
                    </div>
                  </div>

                  <div className="card-sticker p-3 bg-card shadow-[1px_1px_0_var(--border)] flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg border border-border bg-amber-500/10 text-amber-700 dark:text-amber-400">
                      <Gift className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                        Economia Presentes
                      </span>
                      <span className="text-sm font-bold tabular-nums text-foreground">
                        {brl(totalEconomizadoGanhos)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {isCasal && (
                <div className="mt-4 pt-3 border-t border-border/60">
                  <div className="flex items-center justify-between text-xs font-bold flex-wrap gap-2">
                    <span className="text-muted-foreground text-[11px]">Divisão do casal:</span>
                    <span className="flex items-center gap-2 flex-wrap text-xs">
                      <span className="text-primary font-bold">
                        {p1Primeiro}: {brl(r?.totalPessoa1)}
                      </span>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-[#EF6F6C] font-bold">
                        {p2Primeiro}: {brl(r?.totalPessoa2)}
                      </span>
                      {(r?.totalConjunto ?? 0) > 0 && (
                        <>
                          <span className="text-muted-foreground">•</span>
                          <span className="text-joint font-bold">
                            Conjunto: {brl(r?.totalConjunto)}
                          </span>
                        </>
                      )}
                    </span>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </>
      )}
    </motion.div>
  );
}
