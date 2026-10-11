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
          PAINEL ESQUERDO: APRESENTAÇÃO DO PRODUTO
      ========================================= */}
      <div className="hidden lg:flex flex-col justify-between border-r border-border bg-muted/20 p-10 xl:p-14">
        {/* Topo: Logo */}
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 font-bold tracking-tight text-foreground group">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-primary text-primary-foreground shadow-sm transition-transform group-hover:scale-105">
              <Home className="h-5 w-5" />
            </span>
            <span className="font-display text-xl tracking-tight">Casal Planner</span>
          </Link>
        </div>

        {/* Centro: Mensagem & Pilares reais */}
        <div className="my-auto py-8 space-y-8 max-w-lg">
          <div className="space-y-3">
            <h1 className="font-display text-3xl xl:text-4xl font-extrabold tracking-tight text-foreground leading-tight">
              Planejar a dois é começar a casa com o pé direito.
            </h1>
            <p className="text-base text-muted-foreground leading-relaxed">
              Acompanhem cada cômodo, organizem as compras e mantenham total clareza sobre o orçamento do novo lar.
            </p>
          </div>

          <div className="space-y-4 pt-2">
            <div className="flex items-start gap-3.5">
              <div className="h-8 w-8 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 text-primary mt-0.5">
                <Check className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Organização completa por ambiente</p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                  Cozinha, sala, quarto e lavanderia com estimativas de custos e status em tempo real.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="h-8 w-8 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 text-primary mt-0.5">
                <Check className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Divisão transparente de despesas</p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                  Controle individual ou conjunto, separando pagamentos em dinheiro e vales (VR/VA).
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="h-8 w-8 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 text-primary mt-0.5">
                <Check className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Lista de presentes sem complicação</p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                  Compartilhem um link público para amigos e padrinhos presentearem no chá de casa nova.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Rodapé esquerdo */}
        <div className="text-xs text-muted-foreground">
          Gestão prática para a sua vida a dois.
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
              <span className="grid h-8 w-8 place-items-center rounded-md bg-primary text-primary-foreground shadow-sm">
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

        {/* Rodapé */}
        <div className="pt-6 text-center text-xs text-muted-foreground w-full max-w-md mx-auto">
          Casal Planner © {new Date().getFullYear()} • Todos os direitos reservados.
        </div>
      </div>
    </div>
  );
}
