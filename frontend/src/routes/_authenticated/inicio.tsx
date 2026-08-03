import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useQuery, useMutation } from "@tanstack/react-query";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
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
} from "lucide-react";
import ReactApexChart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
import { Pie, PieChart, Cell, Bar, BarChart, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { resumoService } from "@/services/resumo";
import { groqService } from "@/services/groq";
import { brl } from "@/lib/formatters";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { iconFor } from "@/components/planejamento/icon-map";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import type { Item } from "@/services/types";

export const Route = createFileRoute("/_authenticated/inicio")({
  head: () => ({
    meta: [{ title: "Início — Casal Planner" }, { name: "robots", content: "noindex" }],
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

/** Reads a CSS variable value at runtime (needed for ApexCharts which operates outside React) */
function cssVar(name: string) {
  if (typeof window === "undefined") return "#8b5cf6";
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || "#8b5cf6";
}

function useIsDark() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const check = () => setDark(document.documentElement.classList.contains("dark"));
    check();
    const observer = new MutationObserver(check);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);
  return dark;
}

function InicioPage() {
  const isDark = useIsDark();
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

  const iaMutation = useMutation({
    mutationFn: () => groqService.resumoEnxoval(),
  });

  if (isLoading) {
    return (
      <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-32 rounded-2xl bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  const r = resumo;
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
      ? itens.filter((i) => (i.parcelas ?? 1) > 1).reduce((s, i) => s + i.preco * i.quantidade, 0)
      : 0;

  // ─── ApexCharts theme config ───────────────────────────────────────────────
  const chartTheme = isDark ? "dark" : "light";
  const cardBg = isDark ? "#1e1a2e" : "#ffffff";
  const textColor = isDark ? "#c4b5fd" : "#3d2b6b";
  const mutedColor = isDark ? "#7c6fa0" : "#9d86c8";
  const borderColor = isDark ? "rgba(255,255,255,0.08)" : "rgba(139,92,246,0.12)";

  // Bar chart — Gastos por categoria
  const barOptions: ApexOptions = {
    chart: {
      type: "bar",
      background: "transparent",
      toolbar: { show: false },
      animations: { enabled: true, speed: 600, animateGradually: { enabled: true, delay: 80 } },
    },
    theme: { mode: chartTheme },
    plotOptions: {
      bar: {
        borderRadius: 8,
        borderRadiusApplication: "end",
        distributed: true,
        columnWidth: "55%",
      },
    },
    dataLabels: { enabled: false },
    legend: { show: false },
    xaxis: {
      categories: dadosCategoria.map((d) => d.nome),
      labels: {
        style: { colors: mutedColor, fontSize: "11px" },
        rotate: dadosCategoria.length > 4 ? -30 : 0,
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        style: { colors: mutedColor, fontSize: "11px" },
        formatter: (v) => `R$${(v / 1000).toFixed(0)}k`,
      },
    },
    colors: dadosCategoria.map((d) => d.cor),
    grid: {
      borderColor,
      strokeDashArray: 4,
      xaxis: { lines: { show: false } },
    },
    tooltip: {
      theme: chartTheme,
      y: { formatter: (v) => brl(v) },
    },
    fill: {
      type: "gradient",
      gradient: {
        shade: isDark ? "dark" : "light",
        type: "vertical",
        shadeIntensity: 0.3,
        opacityFrom: 1,
        opacityTo: 0.75,
      },
    },
  };

  const barSeries = [{ name: "Gasto", data: dadosCategoria.map((d) => d.valor) }];

  // Donut chart — Dinheiro vs VR
  const donutOptions: ApexOptions = {
    chart: {
      type: "donut",
      background: "transparent",
      animations: { enabled: true, speed: 600 },
    },
    theme: { mode: chartTheme },
    labels: dadosVrNormal.map((d) => d.nome),
    colors: [cssVar("--primary") || "#8b5cf6", cssVar("--terracota") || "#ec4899"],
    stroke: { show: false },
    plotOptions: {
      pie: {
        donut: {
          size: "65%",
          labels: {
            show: true,
            total: {
              show: true,
              label: "Total",
              color: textColor,
              fontSize: "13px",
              formatter: (w) =>
                brl(w.globals.seriesTotals.reduce((a: number, b: number) => a + b, 0)),
            },
            value: {
              color: textColor,
              fontSize: "18px",
              fontWeight: "600",
              formatter: (v) => brl(Number(v)),
            },
          },
        },
      },
    },
    dataLabels: { enabled: false },
    legend: {
      position: "bottom",
      fontSize: "12px",
      labels: { colors: mutedColor },
      markers: { size: 8 },
    },
    tooltip: {
      theme: chartTheme,
      y: { formatter: (v) => brl(v) },
    },
  };

  const donutSeries = dadosVrNormal.map((d) => d.valor);

  // Bar chart mensal — com nomes reais dos meses
  const hoje = new Date();
  const MESES_PT = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  const mesAtualNome = MESES_PT[hoje.getMonth()];
  const mesPassadoNome = MESES_PT[(hoje.getMonth() + 11) % 12];
  const mesRetrasadoNome = MESES_PT[(hoje.getMonth() + 10) % 12];
  const mesNames = [mesRetrasadoNome, mesPassadoNome, mesAtualNome];
  const mesValues = [r?.mesRetrasado ?? 0, r?.mesPassado ?? 0, r?.mesAtual ?? 0];
  const primaryColor = cssVar("--primary") || "#8b5cf6";

  // Variação % do mês atual em relação ao passado
  const variacaoAtual =
    (r?.mesPassado ?? 0) > 0
      ? (((r?.mesAtual ?? 0) - (r?.mesPassado ?? 0)) / (r?.mesPassado ?? 0)) * 100
      : null;

  const mensalOptions: ApexOptions = {
    chart: {
      type: "bar",
      background: "transparent",
      toolbar: { show: false },
      animations: { enabled: true, speed: 500 },
    },
    theme: { mode: chartTheme },
    plotOptions: {
      bar: {
        borderRadius: 8,
        borderRadiusApplication: "end",
        columnWidth: "45%",
        colors: {
          ranges: [{ from: 0, to: 999999999, color: primaryColor }],
        },
      },
    },
    dataLabels: { enabled: false },
    xaxis: {
      categories: mesNames,
      labels: { style: { colors: mutedColor, fontSize: "12px" } },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        style: { colors: mutedColor, fontSize: "11px" },
        formatter: (v) => `R$${(v / 1000).toFixed(0)}k`,
      },
    },
    grid: {
      borderColor,
      strokeDashArray: 4,
      xaxis: { lines: { show: false } },
    },
    tooltip: {
      theme: chartTheme,
      y: { formatter: (v) => brl(v) },
    },
    fill: {
      type: "gradient",
      gradient: {
        shade: isDark ? "dark" : "light",
        type: "vertical",
        shadeIntensity: 0.25,
        opacityFrom: 1,
        opacityTo: 0.7,
      },
    },
    colors: [primaryColor],
  };

  const mensalSeries = [{ name: "Gasto", data: mesValues }];

  // ─── Gerador de Relatório PDF Financeiro ───────────────────────────────────
  const gerarRelatorioFinanceiro = () => {
    const doc = new jsPDF();
    const hoje = new Date();
    const dataStr = hoje.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
    const nomesCasal = isCasal ? `${p1} & ${p2}` : usuario?.nomeCompleto ?? "CasalPlanner";

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
    const totalParcelado = itens.filter((i: Item) => (i.parcelas ?? 1) > 1)
      .reduce((s: number, i: Item) => s + i.preco * i.quantidade, 0);

    const metricas = [
      ["Total Gasto", brl(totalGeral)],
      ["Total de Itens", `${totalItens} itens (${totalComprados} comprados)`],
      ["Meta Global", metaVal > 0 ? `${brl(metaVal)} (${pctMeta?.toFixed(1)}% atingido)` : "Não definida"],
      ["Em Parcelas", brl(totalParcelado)],
      ["Apenas Dinheiro", brl(r?.totalNormal ?? 0)],
      ["VR / VA", brl(r?.totalVr ?? 0)],
    ];

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
        .sort((a: Item, b: Item) => (b.preco * b.quantidade) - (a.preco * a.quantidade))
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
        14, doc.internal.pageSize.height - 8
      );
    }

    doc.save(`relatorio-financeiro-${hoje.toISOString().slice(0, 10)}.pdf`);
  };

  return (
    <div className="p-4 md:p-8 w-full max-w-[1600px] space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <h1 className="font-display text-3xl md:text-4xl font-semibold">Início</h1>
          <p className="text-muted-foreground">Seu enxoval em números.</p>
        </div>
        <div className="flex flex-wrap gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={gerarRelatorioFinanceiro}
            className="border-primary/40 text-primary hover:bg-primary/10"
          >
            <FileText className="h-4 w-4 mr-1" /> Relatório PDF
          </Button>
          <Button asChild className="bg-gradient-primary shadow-warm">
            <Link to="/planejamento">
              Ir para o planejamento <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Progresso do Enxoval */}
      {meta > 0 ? (
        <div className="rounded-2xl border bg-card p-5 shadow-soft">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="min-w-0 flex-1">
              <div className="text-sm text-muted-foreground">Progresso do enxoval</div>
              <div className="font-display text-xl font-semibold truncate">
                {brl(r?.totalGeral)}{" "}
                <span className="text-muted-foreground text-base">de {brl(meta)}</span>
              </div>
              {meta - (r?.totalGeral ?? 0) > 0 && (
                <div className="text-xs text-muted-foreground mt-1">
                  Faltam {brl(meta - (r?.totalGeral ?? 0))}
                </div>
              )}
            </div>
            <span className="text-sm font-medium text-primary shrink-0">{pct.toFixed(0)}%</span>
          </div>
          <Progress value={pct} />
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-primary/30 bg-primary/5 p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 shadow-soft">
          <div className="min-w-0 flex-1">
            <div className="font-semibold text-primary">Progresso do enxoval</div>
            <p className="text-sm text-muted-foreground mt-1">
              Defina um orçamento máximo para o seu enxoval e acompanhe o progresso aqui.
            </p>
          </div>
          <Link to="/perfil" className="shrink-0">
            <Button variant="outline" className="border-primary text-primary hover:bg-primary/10">
              <Target className="mr-2 h-4 w-4" />
              Definir meta
            </Button>
          </Link>
        </div>
      )}

      {semDados ? (
        <div className="rounded-2xl border bg-gradient-warm p-6 sm:p-10 text-center shadow-soft">
          <Sparkles className="h-8 w-8 mx-auto text-primary mb-3" />
          <h2 className="font-display text-xl font-semibold mb-2">
            Comece adicionando itens ao seu planejamento
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Assim que registrar suas compras, os cards e gráficos aparecem aqui.
          </p>
          <Button asChild className="bg-gradient-primary shadow-warm">
            <Link to="/planejamento">Adicionar primeiro item</Link>
          </Button>
        </div>
      ) : (
        <>
          {/* Cards principais */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <ResumoCard
              icon={Wallet}
              label="Total gasto"
              valor={brl(r?.totalGeral)}
              hint={`${r?.itensComprados ?? 0} de ${r?.totalItens ?? 0} itens comprados`}
              delay={0}
            />
            <ResumoCard
              icon={ShoppingBag}
              label="Dinheiro / VR"
              valor={`${brl(r?.totalNormal)}`}
              hint={`VR: ${brl(r?.totalVr)}`}
              delay={0.05}
            />
            <ResumoCard
              icon={CreditCard}
              label="Parcelado"
              valor={brl(totalParcelado)}
              hint="Soma das compras parceladas"
              delay={0.1}
            />
          </div>

          {/* Divisão de Gastos (Casal) */}
          {isCasal && r && (r.totalPessoa1 > 0 || r.totalPessoa2 > 0) && (
            <div className="rounded-2xl border bg-card p-5 shadow-soft">
              <h3 className="font-display text-lg font-semibold mb-3">Divisão de Gastos</h3>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div className="flex-1 w-full">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">{p1}</span>
                    <span className="font-medium">{p2}</span>
                  </div>
                  <div className="flex h-3 w-full rounded-full overflow-hidden bg-muted">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{
                        width: `${(r.totalPessoa1 / (r.totalPessoa1 + r.totalPessoa2 || 1)) * 100}%`,
                      }}
                    />
                    <div
                      className="h-full bg-terracota transition-all"
                      style={{
                        width: `${(r.totalPessoa2 / (r.totalPessoa1 + r.totalPessoa2 || 1)) * 100}%`,
                        backgroundColor: "var(--terracota, #ec4899)",
                      }}
                    />
                  </div>
                  <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                    <span>
                      {((r.totalPessoa1 / (r.totalPessoa1 + r.totalPessoa2 || 1)) * 100).toFixed(0)}
                      %
                    </span>
                    <span>
                      {((r.totalPessoa2 / (r.totalPessoa1 + r.totalPessoa2 || 1)) * 100).toFixed(0)}
                      %
                    </span>
                  </div>
                </div>

                <div className="flex gap-6 shrink-0">
                  <div>
                    <div className="text-xs text-muted-foreground">{p1}</div>
                    <div className="text-xl font-display font-semibold text-primary">
                      {brl(r.totalPessoa1)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">{p2}</div>
                    <div
                      className="text-xl font-display font-semibold"
                      style={{ color: "var(--terracota, #ec4899)" }}
                    >
                      {brl(r.totalPessoa2)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Pie Chart — Gasto por cômodo */}
            <div className="rounded-2xl border bg-card p-5 shadow-soft overflow-hidden">
              <h3 className="font-display text-lg font-semibold mb-1">Gasto por cômodo</h3>
              <p className="text-xs text-muted-foreground mb-4">
                Distribuição de valores por cômodo
              </p>
              {dadosCategoria.length === 0 ? (
                <p className="text-sm text-muted-foreground py-16 text-center">Sem gastos ainda.</p>
              ) : (
                <ChartContainer config={chartConfig} className="h-[300px] w-full max-w-full">
                  <PieChart>
                    <Pie
                      data={dadosCategoria}
                      dataKey="valor"
                      nameKey="nomeBase"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                    >
                      {dadosCategoria.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.cor} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ChartContainer>
              )}
            </div>
            {/* Bar — Gasto por categoria */}
            <div className="rounded-2xl border bg-card p-5 shadow-soft overflow-hidden">
              <h3 className="font-display text-lg font-semibold mb-1">Gasto por categoria</h3>
              <p className="text-xs text-muted-foreground mb-4">
                Distribuição de valores por cômodo
              </p>
              {dadosCategoria.length === 0 ? (
                <p className="text-sm text-muted-foreground py-16 text-center">Sem gastos ainda.</p>
              ) : (
                <div
                  id="bar-chart-container"
                  className="w-full overflow-hidden"
                  style={{ height: 300 }}
                >
                  <ReactApexChart
                    type="bar"
                    options={{ ...barOptions, chart: { ...barOptions.chart, width: "100%" } }}
                    series={barSeries}
                    height={300}
                    width="100%"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Comparativo mensal */}
          {temMensais && (
            <div className="rounded-2xl border bg-card p-5 shadow-soft overflow-hidden">
              <div className="flex items-center gap-3 mb-1 flex-wrap">
                <h3 className="font-display text-lg font-semibold">Comparativo mensal</h3>
                {variacaoAtual !== null && (
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      variacaoAtual >= 0
                        ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                        : "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                    }`}
                  >
                    {variacaoAtual >= 0 ? "+" : ""}
                    {variacaoAtual.toFixed(1)}% vs {mesPassadoNome}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mb-4">
                Evolução dos gastos nos últimos 3 meses
              </p>
              <div
                id="mensal-chart-container"
                className="w-full overflow-hidden"
                style={{ height: 220 }}
              >
                <ReactApexChart
                  type="bar"
                  options={{ ...mensalOptions, chart: { ...mensalOptions.chart, width: "100%" } }}
                  series={mensalSeries}
                  height={220}
                  width="100%"
                />
              </div>
            </div>
          )}

          {/* Progresso por cômodo */}
          {r?.porCategoria && r.porCategoria.length > 0 && (
            <div className="rounded-2xl border bg-card p-5 shadow-soft">
              <h3 className="font-display text-lg font-semibold mb-1">Progresso por cômodo</h3>
              <p className="text-xs text-muted-foreground mb-4">
                Quanto já foi gasto em relação à meta de cada cômodo
              </p>
              <div className="space-y-4">
                {r.porCategoria.map((c) => {
                  const metaC = c.metaOrcamento ?? 0;
                  const pctC = metaC > 0 ? Math.min(100, (c.totalGasto / metaC) * 100) : 0;
                  const IconComp = iconFor(c.icon);
                  return (
                    <div key={c.categoriaId}>
                      <div className="flex items-center justify-between gap-2 text-sm mb-1.5">
                        <span className="font-medium flex items-center gap-2 min-w-0">
                          <span
                            className="inline-flex items-center justify-center w-7 h-7 rounded-lg flex-shrink-0"
                            style={{ background: (c.cor ?? "#8b5cf6") + "33" }}
                          >
                            <IconComp
                              className="w-4 h-4"
                              style={{ color: c.cor ?? "var(--primary)" }}
                            />
                          </span>
                          <span className="truncate">{c.categoriaNome}</span>
                        </span>
                        <span className="text-muted-foreground text-xs shrink-0">
                          {brl(c.totalGasto)}
                          {metaC > 0 && <span> / {brl(metaC)}</span>}
                        </span>
                      </div>
                      {metaC > 0 ? (
                        <Progress value={pctC} />
                      ) : (
                        <div
                          className="h-2 rounded-full"
                          style={{ background: c.cor ?? "var(--muted)" }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {/* Resumo da IA */}
      <div className="rounded-2xl border bg-card p-5 shadow-soft relative overflow-hidden">
        <div className="absolute top-0 right-0 p-3 opacity-10 pointer-events-none">
          <Bot className="w-32 h-32" />
        </div>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4 relative z-10">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h3 className="font-display text-lg font-semibold">Resumo Inteligente</h3>
          </div>
          <Button
            variant={iaMutation.data ? "outline" : "default"}
            size="sm"
            className={!iaMutation.data ? "bg-gradient-primary" : ""}
            disabled={iaMutation.isPending}
            onClick={() => iaMutation.mutate()}
          >
            {iaMutation.isPending ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Gerando...
              </>
            ) : (
              <>
                {iaMutation.data ? (
                  <RefreshCw className="h-4 w-4 mr-2" />
                ) : (
                  <Sparkles className="h-4 w-4 mr-2" />
                )}
                {iaMutation.data ? "Atualizar" : "Gerar resumo do enxoval"}
              </>
            )}
          </Button>
        </div>
        {iaMutation.data && (
          <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground whitespace-pre-wrap relative z-10">
            {iaMutation.data.resumo}
          </div>
        )}
        {!iaMutation.data && !iaMutation.isPending && (
          <p className="text-sm text-muted-foreground relative z-10">
            Peça para a IA gerar um resumo narrativo sobre o status do seu enxoval.
          </p>
        )}
      </div>
    </div>
  );
}

function ResumoCard({
  icon: Icon,
  label,
  valor,
  hint,
  delay = 0,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  valor: string;
  hint?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
      className="rounded-2xl border bg-card p-4 shadow-soft"
    >
      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
        <Icon className="h-4 w-4 text-primary" />
        {label}
      </div>
      <div className="font-display text-xl md:text-2xl font-semibold truncate">{valor}</div>
      {hint && <div className="text-xs text-muted-foreground mt-1 truncate">{hint}</div>}
    </motion.div>
  );
}
