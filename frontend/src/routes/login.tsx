import { createFileRoute, Link, useNavigate, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Heart,
  User as UserIcon,
  Sun,
  Moon,
  ChefHat,
  Sofa,
  Bed,
  Check,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Home,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoginForm } from "@/components/auth/LoginForm";
import { RegistroIndividual } from "@/components/auth/RegistroIndividual";
import { RegistroCasal } from "@/components/auth/RegistroCasal";
import { useAuth } from "@/lib/auth-context";
import { useTheme } from "@/lib/theme-context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { z } from "zod";

const searchSchema = z.object({
  registrar: z.union([z.literal(1), z.literal("1"), z.boolean()]).optional(),
  returnUrl: z.string().optional(),
});

export const Route = createFileRoute("/login")({
  validateSearch: (s) => searchSchema.parse(s),
  head: () => ({
    meta: [
      { title: "CasalPlanner - Entrar" },
      { name: "description", content: "Acesse sua conta do CasalPlanner." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { isAuthenticated, loading } = useAuth();
  const { actualTheme, toggle } = useTheme();
  const navigate = useNavigate();
  const router = useRouter();
  const search = Route.useSearch();
  const [modo, setModo] = useState<"entrar" | "cadastrar">(
    search.registrar ? "cadastrar" : "entrar",
  );

  const returnUrl = search.returnUrl;

  useEffect(() => {
    if (!loading && isAuthenticated) {
      if (returnUrl && returnUrl.startsWith("/") && !returnUrl.startsWith("//")) {
        router.history.push(returnUrl);
      } else {
        navigate({ to: "/inicio" });
      }
    }
  }, [loading, isAuthenticated, navigate, router.history, returnUrl]);

  return (
    <div className="min-h-screen w-full bg-background text-foreground flex flex-col lg:grid lg:grid-cols-[1.1fr_1fr] selection:bg-primary/20 relative">
      {/* =========================================
          PAINEL ESQUERDO: SHOWCASE LOVABLE DESIGN
      ========================================= */}
      <div className="hidden lg:flex flex-col justify-between border-r border-border bg-card/40 p-10 xl:p-14 relative overflow-hidden">
        {/* Glows sutis da paleta Violet Issue */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-primary/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

        {/* Topo: Logo & Badge da Versão */}
        <div className="flex items-center justify-between relative z-10">
          <Link to="/" className="flex items-center gap-2.5 font-bold tracking-tight text-foreground group">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[var(--radius-md)] bg-primary text-primary-foreground shadow-glow transition-transform group-hover:scale-105">
              <Home className="h-5 w-5" />
            </span>
            <span className="font-display text-xl tracking-tight">Casal Planner</span>
          </Link>
          <Badge variant="outline" className="border-primary/30 text-primary bg-primary/5 font-mono text-[11px] uppercase px-2.5 py-0.5">
            Violet Issue • v2.0
          </Badge>
        </div>

        {/* Centro: Hero & Mockup Interativo Lovable */}
        <div className="my-auto py-8 space-y-6 max-w-xl relative z-10">
          <div className="space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-primary font-mono inline-flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" />
              Enxoval • Compras • Orçamento
            </span>
            <h1 className="font-display text-3xl xl:text-4xl font-extrabold tracking-tight text-foreground leading-tight">
              Uma casa nova começa com bons planos.
            </h1>
            <p className="text-sm xl:text-base text-muted-foreground leading-relaxed">
              Organizem o enxoval, planejem as compras e acompanhem os gastos juntos. Tudo em um só lugar, do primeiro item até a casa pronta.
            </p>
          </div>

          {/* Card Mockup Fiel ao Preview Lovable com as cores do sistema */}
          <div className="rounded-xl border border-border bg-card shadow-soft overflow-hidden">
            {/* Topbar do mockup */}
            <div className="flex items-center justify-between border-b border-border px-4 py-3 bg-muted/20">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-border" />
                <span className="h-2.5 w-2.5 rounded-full bg-border" />
                <span className="h-2.5 w-2.5 rounded-full bg-border" />
                <span className="ml-2 text-xs font-semibold text-muted-foreground">
                  Painel • Ana & Lucas
                </span>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                Demonstração ao vivo
              </span>
            </div>

            {/* Conteúdo do mockup */}
            <div className="p-4 xl:p-5 space-y-4">
              {/* Barra de Progresso Global */}
              <div>
                <div className="flex items-baseline justify-between text-xs mb-1.5">
                  <span className="font-semibold text-foreground">Progresso do enxoval</span>
                  <span className="font-mono font-bold text-primary">68%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div className="h-full bg-primary rounded-full transition-all duration-500 w-[68%]" />
                </div>
                <p className="mt-1.5 text-[11px] text-muted-foreground">
                  61 de 97 itens comprados
                </p>
              </div>

              {/* 3 Blocos Financeiros */}
              <div className="grid grid-cols-3 divide-x divide-border rounded-[var(--radius-md)] border border-border bg-background/50">
                <div className="p-2.5 text-center sm:text-left">
                  <p className="text-[10px] uppercase font-semibold text-muted-foreground">Planejado</p>
                  <p className="mt-0.5 text-xs xl:text-sm font-bold font-mono text-foreground">R$ 28.000</p>
                </div>
                <div className="p-2.5 text-center sm:text-left pl-3">
                  <p className="text-[10px] uppercase font-semibold text-muted-foreground">Gasto</p>
                  <p className="mt-0.5 text-xs xl:text-sm font-bold font-mono text-primary">R$ 17.400</p>
                </div>
                <div className="p-2.5 text-center sm:text-left pl-3">
                  <p className="text-[10px] uppercase font-semibold text-muted-foreground">Pendente</p>
                  <p className="mt-0.5 text-xs xl:text-sm font-bold font-mono text-foreground">R$ 10.600</p>
                </div>
              </div>

              {/* Cômodos com mini progresso */}
              <div className="grid grid-cols-3 gap-2 pt-1">
                {[
                  { name: "Cozinha", icon: ChefHat, pct: 66, itens: "22/34" },
                  { name: "Sala", icon: Sofa, pct: 50, itens: "9/18" },
                  { name: "Quarto", icon: Bed, pct: 76, itens: "16/21" },
                ].map((c) => (
                  <div key={c.name} className="p-2.5 rounded-[var(--radius-md)] border border-border/70 bg-card/60 space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                      <c.icon className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span className="truncate">{c.name}</span>
                    </div>
                    <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${c.pct}%` }} />
                    </div>
                    <span className="text-[10px] text-muted-foreground block">{c.itens}</span>
                  </div>
                ))}
              </div>

              {/* Itens Recentes com Badges de Status */}
              <div className="rounded-[var(--radius-md)] bg-muted/30 p-2.5 space-y-1.5 border border-border/50">
                <p className="text-[11px] font-semibold text-foreground">Próximas compras</p>
                <div className="space-y-1 text-xs">
                  <div className="flex items-center justify-between gap-2 p-1.5 rounded bg-card border border-border/40">
                    <span className="font-medium truncate text-[11px]">Jogo de panelas inox</span>
                    <span className="text-[10px] font-mono font-semibold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                      Comprado • R$ 789
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2 p-1.5 rounded bg-card border border-border/40">
                    <span className="font-medium truncate text-[11px]">Air fryer 5L</span>
                    <span className="text-[10px] font-mono font-semibold text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                      Pendente • R$ 459
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Rodapé do Painel Esquerdo: Depoimento / Reafirmação */}
        <div className="pt-4 border-t border-border/60 flex items-center justify-between gap-4 text-xs text-muted-foreground relative z-10">
          <p className="italic max-w-sm">
            "Menos planilhas soltas, mais clareza sobre o enxoval e as finanças da nossa casa."
          </p>
          <div className="flex items-center gap-1.5 text-primary font-medium shrink-0">
            <ShieldCheck className="h-4 w-4" />
            <span>Dados 100% privados</span>
          </div>
        </div>
      </div>

      {/* =========================================
          PAINEL DIREITO: FORMULÁRIO DE LOGIN / CADASTRO
      ========================================= */}
      <div className="flex-1 flex flex-col justify-between p-6 sm:p-10 lg:p-12 min-h-screen relative overflow-y-auto">
        {/* Topbar do formulário: Voltar ao site & Tema */}
        <div className="flex items-center justify-between w-full max-w-md mx-auto mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors font-medium"
          >
            <ArrowRight className="h-3.5 w-3.5 rotate-180" /> Voltar ao site
          </Link>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={toggle}
            className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground rounded-full"
            title="Alternar tema claro / escuro"
          >
            {actualTheme === "dark" ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-primary" />}
          </Button>
        </div>

        {/* Container Central do Formulário */}
        <div className="w-full max-w-md mx-auto my-auto space-y-6">
          {/* Cabeçalho do Form */}
          <div className="space-y-2 text-center sm:text-left">
            <div className="lg:hidden inline-flex items-center gap-2 font-bold mb-3">
              <span className="grid h-8 w-8 place-items-center rounded-[var(--radius-md)] bg-primary text-primary-foreground shadow-glow">
                <Home className="h-4 w-4" />
              </span>
              <span className="font-display text-lg tracking-tight">Casal Planner</span>
            </div>

            <h2 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              {modo === "entrar" ? "Acesse sua conta" : "Comece seu enxoval"}
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {modo === "entrar"
                ? "Entre para acompanhar os cômodos, compras e orçamentos."
                : "Crie uma conta gratuita em poucos segundos."}
            </p>
          </div>

          {/* Alternador de Modo: Entrar ou Cadastrar (Estilo Lovable Pill) */}
          <div className="grid grid-cols-2 p-1 bg-muted/60 rounded-[var(--radius-md)] border border-border/80">
            <button
              type="button"
              onClick={() => setModo("entrar")}
              className={`py-2 text-xs sm:text-sm font-semibold rounded-[var(--radius-sm)] transition-all ${
                modo === "entrar"
                  ? "bg-card text-foreground shadow-sm border border-border/40"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => setModo("cadastrar")}
              className={`py-2 text-xs sm:text-sm font-semibold rounded-[var(--radius-sm)] transition-all ${
                modo === "cadastrar"
                  ? "bg-card text-foreground shadow-sm border border-border/40"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Criar conta
            </button>
          </div>

          {/* Renderização do Modo Selecionado */}
          {modo === "entrar" ? (
            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
              <LoginForm returnUrl={returnUrl} />

              <div className="text-center pt-2 border-t border-border/60">
                <p className="text-xs text-muted-foreground">
                  Ainda não tem conta no Casal Planner?{" "}
                  <button
                    type="button"
                    className="font-semibold text-primary hover:underline transition-colors"
                    onClick={() => setModo("cadastrar")}
                  >
                    Cadastre-se gratuitamente
                  </button>
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
              <Tabs defaultValue="casal" className="w-full">
                <TabsList className="grid grid-cols-2 w-full h-10 bg-muted/50 rounded-lg p-1 mb-5">
                  <TabsTrigger value="casal" className="rounded-md text-xs font-semibold">
                    <Heart className="h-3.5 w-3.5 mr-1.5 text-primary" /> Em casal
                  </TabsTrigger>
                  <TabsTrigger value="individual" className="rounded-md text-xs font-semibold">
                    <UserIcon className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" /> Individual
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="casal" className="m-0 focus-visible:outline-none animate-in fade-in duration-200">
                  <RegistroCasal />
                </TabsContent>
                <TabsContent value="individual" className="m-0 focus-visible:outline-none animate-in fade-in duration-200">
                  <RegistroIndividual returnUrl={returnUrl} />
                </TabsContent>
              </Tabs>

              <div className="text-center pt-2 border-t border-border/60">
                <p className="text-xs text-muted-foreground">
                  Já possui uma conta criada?{" "}
                  <button
                    type="button"
                    className="font-semibold text-primary hover:underline transition-colors"
                    onClick={() => setModo("entrar")}
                  >
                    Entrar na minha conta
                  </button>
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Rodapé Inferior Direito */}
        <div className="pt-6 text-center text-xs text-muted-foreground/80 w-full max-w-md mx-auto">
          Casal Planner © {new Date().getFullYear()} • Plataforma inteligente para o seu lar
        </div>
      </div>
    </div>
  );
}
