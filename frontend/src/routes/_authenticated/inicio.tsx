import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Wallet,
  ShoppingBag,
  Target,
  TrendingUp,
  TrendingDown,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  PieChart,
  Pie,
  Legend,
} from "recharts";
import { resumoService } from "@/services/resumo";
import { groqService } from "@/services/groq";
import { brl } from "@/lib/formatters";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/_authenticated/inicio")({
  head: () => ({
    meta: [
      { title: "Início — Casal Planner" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: InicioPage,
});

const CHART_COLORS = [
  "hsl(var(--primary))",
  "#c97b5c",
  "#e0a458",
  "#8b6bb1",
  "#5a7d5a",
  "#b06ab3",
  "#d97a9b",
  "#6b7fb5",
];

function InicioPage() {
  const { data: categorias = [] } = useQuery({
    queryKey: ["categorias"],
    queryFn: () => import("@/services/categorias").then((m) => m.categoriasService.listar()),
  });

  const { data: resumo, isLoading } = useQuery({
    queryKey: ["resumo", categorias.length],
    queryFn: () => resumoService.obterAdaptado(categorias),
  });

  if (isLoading) {
    return (
      <div className="p-6 md:p-10 max-w-6xl mx-auto">
        <div className="animate-pulse text-sm text-muted-foreground">Carregando resumo...</div>
      </div>
    );
  }

  const r = resumo;
  const meta = r?.metaGlobal ?? 0;
  const pct = meta > 0 ? Math.min(100, ((r?.totalGeral ?? 0) / meta) * 100) : 0;

  const dadosCategoria =
    r?.porCategoria?.map((c) => ({
      nome: c.categoriaNome,
      valor: c.totalGasto,
    })) ?? [];

  const dadosVrNormal = [
    { nome: "Dinheiro", valor: r?.totalNormal ?? 0 },
    { nome: "VR/VA", valor: r?.totalVr ?? 0 },
  ].filter((d) => d.valor > 0);

  const temMensais =
    (r?.mesAtual ?? 0) > 0 || (r?.mesPassado ?? 0) > 0 || (r?.mesRetrasado ?? 0) > 0;
  const dadosMensais = [
    { mes: "Retrasado", valor: r?.mesRetrasado ?? 0 },
    { mes: "Passado", valor: r?.mesPassado ?? 0 },
    { mes: "Atual", valor: r?.mesAtual ?? 0 },
  ];

  const variacao = r?.variacaoMensal ?? null;
  const semDados = !r || (r.totalItens ?? 0) === 0;

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl md:text-4xl font-semibold">Início</h1>
          <p className="text-muted-foreground">Seu enxoval em números.</p>
        </div>
        <Button asChild className="bg-gradient-primary shadow-warm">
          <Link to="/planejamento">
            Ir para o planejamento <ArrowRight className="h-4 w-4 ml-2" />
          </Link>
        </Button>
      </div>

      {semDados ? (
        <div className="rounded-2xl border bg-gradient-warm p-10 text-center shadow-soft">
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
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            <ResumoCard
              icon={Wallet}
              label="Total gasto"
              valor={brl(r?.totalGeral)}
              hint={`${r?.itensComprados ?? 0} de ${r?.totalItens ?? 0} itens`}
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
              icon={Target}
              label="Meta do enxoval"
              valor={meta > 0 ? brl(meta) : "—"}
              hint={meta > 0 ? `${pct.toFixed(0)}% alcançado` : "Defina no perfil"}
              delay={0.1}
            />
            {variacao != null && (
              <ResumoCard
                icon={variacao >= 0 ? TrendingUp : TrendingDown}
                label="Vs mês passado"
                valor={variacao === 0 ? "—" : `${variacao > 0 ? "+" : ""}${variacao.toFixed(0)}%`}
                hint={brl(r?.mesAtual)}
                delay={0.15}
              />
            )}
          </div>

          {meta > 0 && (
            <div className="rounded-2xl border bg-card p-5 shadow-soft">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-sm text-muted-foreground">Progresso da meta</div>
                  <div className="font-display text-xl font-semibold">
                    {brl(r?.totalGeral)} <span className="text-muted-foreground text-base">de {brl(meta)}</span>
                  </div>
                </div>
                <span className="text-sm font-medium text-primary">{pct.toFixed(0)}%</span>
              </div>
              <Progress value={pct} />
            </div>
          )}

          {/* Gráficos */}
          <div className="grid lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 rounded-2xl border bg-card p-5 shadow-soft">
              <h3 className="font-display text-lg font-semibold mb-4">Gasto por categoria</h3>
              {dadosCategoria.length === 0 ? (
                <p className="text-sm text-muted-foreground">Sem gastos ainda.</p>
              ) : (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dadosCategoria}>
                      <XAxis dataKey="nome" tick={{ fontSize: 11 }} interval={0} angle={-20} textAnchor="end" height={60} />
                      <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `R$${v}`} />
                      <Tooltip
                        formatter={(v: number) => brl(v)}
                        contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))" }}
                      />
                      <Bar dataKey="valor" radius={[8, 8, 0, 0]}>
                        {dadosCategoria.map((_, i) => (
                          <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            <div className="rounded-2xl border bg-card p-5 shadow-soft">
              <h3 className="font-display text-lg font-semibold mb-4">Dinheiro vs VR</h3>
              {dadosVrNormal.length === 0 ? (
                <p className="text-sm text-muted-foreground">Sem gastos ainda.</p>
              ) : (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={dadosVrNormal}
                        dataKey="valor"
                        nameKey="nome"
                        innerRadius={45}
                        outerRadius={80}
                        paddingAngle={4}
                      >
                        {dadosVrNormal.map((_, i) => (
                          <Cell key={i} fill={CHART_COLORS[i]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v: number) => brl(v)} />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>

          {temMensais && (
            <div className="rounded-2xl border bg-card p-5 shadow-soft">
              <h3 className="font-display text-lg font-semibold mb-4">Comparativo mensal</h3>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dadosMensais}>
                    <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `R$${v}`} />
                    <Tooltip formatter={(v: number) => brl(v)} />
                    <Bar dataKey="valor" radius={[8, 8, 0, 0]} fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Meta por categoria */}
          {r?.porCategoria && r.porCategoria.length > 0 && (
            <div className="rounded-2xl border bg-card p-5 shadow-soft">
              <h3 className="font-display text-lg font-semibold mb-4">Progresso por cômodo</h3>
              <div className="space-y-3">
                {r.porCategoria.map((c) => {
                  const metaC = c.metaOrcamento ?? 0;
                  const pctC = metaC > 0 ? Math.min(100, (c.totalGasto / metaC) * 100) : 0;
                  return (
                    <div key={c.categoriaId}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium">{c.categoriaNome}</span>
                        <span className="text-muted-foreground">
                          {brl(c.totalGasto)}
                          {metaC > 0 && <span> / {brl(metaC)}</span>}
                        </span>
                      </div>
                      {metaC > 0 ? (
                        <Progress value={pctC} />
                      ) : (
                        <div className="h-2 rounded-full bg-muted" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
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
