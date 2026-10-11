import { useState, useEffect } from "react";
import { createFileRoute, Link, useNavigate, useRouter } from "@tanstack/react-router";
import { ArrowRight, Heart, User as UserIcon } from "lucide-react";
import { LoginForm } from "@/components/auth/LoginForm";
import { RegistroIndividual } from "@/components/auth/RegistroIndividual";
import { RegistroCasal } from "@/components/auth/RegistroCasal";
import { useAuth } from "@/lib/auth-context";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BrandLogoBadge, BrandLogoText } from "@/components/ui/BrandLogo";

export const Route = createFileRoute("/login")({
  validateSearch: (
    search: Record<string, unknown>,
  ): { registrar?: number; returnUrl?: string; tipo?: "casal" | "individual" } => {
    return {
      registrar: search.registrar ? Number(search.registrar) : undefined,
      returnUrl: search.returnUrl as string | undefined,
      tipo: search.tipo as "casal" | "individual" | undefined,
    };
  },
  head: () => ({
    meta: [
      { title: "CasalPlanner - Acesso e Cadastro" },
      {
        name: "description",
        content:
          "Acesse sua conta ou cadastre-se para planejar o enxoval e orçamento da casa nova.",
      },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { registrar, returnUrl, tipo } = Route.useSearch();
  const [modo, setModo] = useState<"entrar" | "cadastrar">(
    registrar === 1 ? "cadastrar" : "entrar",
  );
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const router = useRouter();

  useEffect(() => {
    if (registrar === 1) {
      setModo("cadastrar");
    }
  }, [registrar]);

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
    <div className="min-h-screen w-full bg-background text-foreground flex flex-col lg:grid lg:grid-cols-[1.1fr_1fr] selection:bg-gold/30 relative font-sans">
      {/* =========================================
          PAINEL ESQUERDO: APRESENTAÇÃO DO PRODUTO (Estilo Landing Page)
      ========================================= */}
      <div className="hidden lg:flex flex-col justify-between border-r-2 border-border bg-[#F6F1E9] dark:bg-[#161F1A] p-10 xl:p-14 relative overflow-hidden">
        {/* Topo: Logo */}
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-3 font-bold tracking-tight text-foreground group"
          >
            <BrandLogoBadge size="md" className="transition-transform group-hover:scale-105" />
            <BrandLogoText size="lg" />
          </Link>
        </div>

        {/* Centro: Mensagem & Card de Lista da Landing Page */}
        <div className="my-auto py-8 space-y-8 max-w-lg">
          <div className="space-y-3">
            <h1 className="font-display text-3xl xl:text-4xl font-semibold tracking-tight text-foreground leading-tight">
              Planejar a dois é começar a casa com o{" "}
              <span className="bg-[linear-gradient(transparent_62%,#E8B63C_62%,#E8B63C_92%,transparent_92%)] dark:text-[#24302A] dark:px-1 dark:rounded-sm">
                pé direito.
              </span>
            </h1>
            <p className="text-base text-foreground/80 dark:text-[#b4c4ba] leading-relaxed font-medium">
              Cada cômodo, cada compra e o orçamento da casa nova num lugar só.
            </p>
          </div>

          {/* Cartão de Lista rotacionado com selo dourado */}
          <div className="relative pt-4 pb-6 px-2 flex justify-center">
            <div className="paper-notepad w-full max-w-sm p-6 rounded-xl rotate-[-2.5deg] shadow-[5px_5px_0_var(--border)] relative overflow-hidden bg-[#fdfaf2] text-[#24302A]">
              {/* Margem vermelha de caderno */}
              <div className="absolute top-0 bottom-0 left-[28px] w-[2px] bg-red-400 pointer-events-none" />

              <div className="font-handwriting font-bold text-2xl border-b-2 border-dashed border-[#24302A]/30 pb-2 text-[#24302A]">
                Lista da cozinha
              </div>
              <div className="space-y-2.5 mt-3 font-handwriting text-xl leading-tight text-[#24302A]">
                <div className="flex items-center gap-2.5">
                  <span className="w-4 h-4 border-2 border-[#24302A] rounded-[4px] bg-[#2F7D5B] text-white flex items-center justify-center text-[10px] shrink-0 font-sans font-bold">
                    ✓
                  </span>
                  <span className="flex-1 line-through decoration-[#2F7D5B] decoration-[2px] opacity-70 text-[#24302A]">
                    Geladeira
                  </span>
                  <span className="tabular-nums font-sans font-bold text-sm text-[#24302A]">
                    R$ 3.200
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="w-4 h-4 border-2 border-[#24302A] rounded-[4px] bg-[#2F7D5B] text-white flex items-center justify-center text-[10px] shrink-0 font-sans font-bold">
                    ✓
                  </span>
                  <span className="flex-1 line-through decoration-[#2F7D5B] decoration-[2px] opacity-70 text-[#24302A]">
                    Fogão
                  </span>
                  <span className="tabular-nums font-sans font-bold text-sm text-[#24302A]">
                    R$ 1.450
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="w-4 h-4 border-2 border-[#24302A] rounded-[4px] bg-white shrink-0" />
                  <span className="flex-1 text-[#24302A]">Micro-ondas</span>
                  <span className="tabular-nums font-sans font-bold text-sm text-[#24302A]">
                    R$ 690
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="w-4 h-4 border-2 border-[#24302A] rounded-[4px] bg-white shrink-0" />
                  <span className="flex-1 text-[#24302A]">Air fryer</span>
                  <span className="tabular-nums font-sans font-bold text-sm text-[#24302A]">
                    R$ 520
                  </span>
                </div>
              </div>
            </div>

            {/* Selo Dourado Redondo */}
            <div className="absolute -right-2 -bottom-2 w-28 h-28 rounded-full bg-[#E8B63C] text-[#24302A] border-2 border-border shadow-[4px_4px_0_var(--border)] flex flex-col items-center justify-center rotate-12 text-center">
              <span className="font-handwriting font-bold text-lg leading-none">sobram</span>
              <span className="tabular-nums text-lg font-bold font-display leading-tight">
                R$ 26.650
              </span>
            </div>
          </div>
        </div>

        {/* Rodapé esquerdo */}
        <div className="text-xs text-foreground/75 dark:text-[#9fb0a6] font-bold">
          CasalPlanner • Feito para o casal e para conta individual.
        </div>
      </div>

      {/* =========================================
          PAINEL DIREITO: FORMULÁRIO DE LOGIN / CADASTRO
      ========================================= */}
      <div className="flex-1 flex flex-col justify-between p-6 sm:p-10 lg:p-12 min-h-screen relative overflow-y-auto bg-card">
        {/* Topbar do formulário: Voltar ao site */}
        <div className="flex items-center justify-between w-full max-w-md mx-auto mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-foreground/80 hover:text-foreground transition-colors"
          >
            <ArrowRight className="h-3.5 w-3.5 rotate-180" /> Voltar ao site
          </Link>
        </div>

        {/* Container Central do Formulário */}
        <div className="w-full max-w-md mx-auto my-auto space-y-6">
          {/* Cabeçalho do Form */}
          <div className="space-y-2 text-center sm:text-left">
            <div className="lg:hidden inline-flex items-center gap-2 font-bold mb-3">
              <BrandLogoBadge size="sm" />
              <BrandLogoText size="md" />
            </div>

            <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              {modo === "entrar" ? "Acesse sua conta" : "Comece seu enxoval"}
            </h2>
            <p className="text-sm text-foreground/80 dark:text-[#b4c4ba] font-medium">
              {modo === "entrar"
                ? "Entre para acompanhar os cômodos, compras e orçamentos."
                : "Crie uma conta gratuita em poucos segundos."}
            </p>
          </div>


          {/* Alternador de Modo: Entrar ou Cadastrar (Estilo Adesivo) */}
          <div className="grid grid-cols-2 p-1.5 bg-muted rounded-xl border-2 border-border gap-1.5 shadow-[2px_2px_0_var(--border)]">
            <button
              type="button"
              onClick={() => setModo("entrar")}
              className={`py-2 text-xs sm:text-sm font-bold rounded-lg transition-all cursor-pointer ${
                modo === "entrar"
                  ? "bg-primary text-primary-foreground border-2 border-border shadow-[2px_2px_0_var(--border)]"
                  : "text-foreground/80 hover:text-foreground hover:bg-card/50"
              }`}
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => setModo("cadastrar")}
              className={`py-2 text-xs sm:text-sm font-bold rounded-lg transition-all cursor-pointer ${
                modo === "cadastrar"
                  ? "bg-primary text-primary-foreground border-2 border-border shadow-[2px_2px_0_var(--border)]"
                  : "text-foreground/80 hover:text-foreground hover:bg-card/50"
              }`}
            >
              Criar conta
            </button>
          </div>

          {/* Renderização do Modo Selecionado */}
          {modo === "entrar" ? (
            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
              <LoginForm returnUrl={returnUrl} />

              <div className="text-center pt-2 border-t-2 border-border/20">
                <p className="text-xs text-foreground/80 dark:text-[#b4c4ba] font-semibold">
                  Ainda não tem conta no CasalPlanner?{" "}
                  <button
                    type="button"
                    className="font-bold text-primary hover:underline hover:text-primary-hover transition-colors cursor-pointer"
                    onClick={() => setModo("cadastrar")}
                  >
                    Cadastre-se gratuitamente
                  </button>
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
              <Tabs
                defaultValue={tipo === "individual" ? "individual" : "casal"}
                className="w-full"
              >
                <TabsList className="grid grid-cols-2 w-full h-11 bg-muted rounded-xl p-1 mb-5 border-2 border-border">
                  <TabsTrigger value="casal" className="rounded-lg text-xs font-bold">
                    <Heart className="h-3.5 w-3.5 mr-1.5 text-primary" /> Em casal
                  </TabsTrigger>
                  <TabsTrigger value="individual" className="rounded-lg text-xs font-bold">
                    <UserIcon className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" /> Individual
                  </TabsTrigger>
                </TabsList>

                <TabsContent
                  value="casal"
                  className="m-0 focus-visible:outline-none animate-in fade-in duration-200"
                >
                  <RegistroCasal />
                </TabsContent>
                <TabsContent
                  value="individual"
                  className="m-0 focus-visible:outline-none animate-in fade-in duration-200"
                >
                  <RegistroIndividual returnUrl={returnUrl} />
                </TabsContent>
              </Tabs>

              <div className="text-center pt-2 border-t-2 border-border/20">
                <p className="text-xs text-foreground/80 dark:text-[#b4c4ba] font-semibold">
                  Já possui uma conta criada?{" "}
                  <button
                    type="button"
                    className="font-bold text-primary hover:underline hover:text-primary-hover transition-colors cursor-pointer"
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
        <div className="pt-6 text-center text-xs text-foreground/75 dark:text-[#9fb0a6] font-semibold w-full max-w-md mx-auto">
          CasalPlanner © {new Date().getFullYear()} • Todos os direitos reservados.
        </div>
      </div>
    </div>
  );
}
