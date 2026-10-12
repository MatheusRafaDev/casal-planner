import { useState, useEffect } from "react";
import { createFileRoute, Link, useNavigate, useRouter } from "@tanstack/react-router";
import { ArrowRight, Heart, User as UserIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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
    <div className="min-h-screen lg:h-screen lg:max-h-screen lg:overflow-hidden overflow-x-clip w-full bg-background text-foreground flex flex-col lg:grid lg:grid-cols-[44%_56%] xl:grid-cols-[42%_58%] selection:bg-gold/30 relative font-sans">
      {/* =========================================
          PAINEL ESQUERDO: APRESENTAÇÃO EDITORIAL (Com animação suave de entrada)
      ========================================= */}
      <motion.div
        initial={{ opacity: 0, x: -28 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="hidden lg:flex flex-col justify-between border-r border-[#E8E3DA] dark:border-[#2A2724] bg-[#F7F4EE] dark:bg-[#151413] p-7 xl:p-10 relative overflow-hidden h-full"
      >
        {/* Topo: Logo Oficial */}
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-3 font-bold tracking-tight text-foreground group"
          >
            <BrandLogoBadge size="md" className="transition-transform group-hover:scale-105" />
            <BrandLogoText size="lg" />
          </Link>
        </div>

        {/* Centro: Mensagem & Imagem Cartunesca Exclusiva */}
        <div className="my-auto py-2 space-y-4 max-w-lg">
          <div className="space-y-1.5">
            <h1 className="font-display text-2xl xl:text-3xl font-bold tracking-tight text-foreground leading-tight">
              Planejar a dois é começar a casa com o{" "}
              <span className="text-primary font-bold">pé direito.</span>
            </h1>
            <p className="text-xs xl:text-sm text-muted-foreground leading-relaxed font-medium">
              Cada cômodo, cada compra e o orçamento da casa nova num lugar só.
            </p>
          </div>

          {/* Ilustração Cartunesca Exclusiva */}
          <div className="relative pt-2 pb-2 max-w-[400px] mx-auto w-full">
            {/* Card Flutuante 1: Geladeira */}
            <div className="hidden sm:flex absolute -top-1 -left-3 z-20 bg-white dark:bg-[#181716] p-1.5 px-2 rounded-xl border border-[#E8E3DA] dark:border-[#2A2724] shadow-md items-center gap-2 transition-transform hover:scale-105">
              <img
                src="/images/products/geladeira.jpg"
                alt="Geladeira Duplex"
                className="w-8 h-8 object-contain rounded-md bg-slate-50 dark:bg-slate-800 p-0.5"
              />
              <div className="pr-1 text-left">
                <span className="text-[9px] font-semibold block text-emerald-700 leading-tight">
                  ✓ Cozinha
                </span>
                <span className="text-[11px] font-bold text-foreground font-display leading-tight">
                  Geladeira Duplex
                </span>
                <span className="text-[9px] font-semibold text-muted-foreground block">
                  R$ 3.890
                </span>
              </div>
            </div>

            {/* Card Flutuante 2: Air Fryer & Café */}
            <div className="hidden sm:flex absolute -top-1 -right-3 z-20 bg-white dark:bg-[#181716] p-1.5 px-2 rounded-xl border border-[#E8E3DA] dark:border-[#2A2724] shadow-md items-center gap-2 transition-transform hover:scale-105">
              <img
                src="/images/products/air-fryer-cafeteira.jpg"
                alt="Air fryer e cafeteira"
                className="w-8 h-8 object-contain rounded-md bg-slate-50 dark:bg-slate-800 p-0.5"
              />
              <div className="pr-1 text-left">
                <span className="text-[9px] font-semibold block text-orange-700 leading-tight">
                  🎁 Presente
                </span>
                <span className="text-[11px] font-bold text-foreground font-display leading-tight">
                  Air Fryer & Café
                </span>
                <span className="text-[9px] font-semibold text-muted-foreground block">
                  Padrinhos
                </span>
              </div>
            </div>

            {/* Card Central com a Ilustração Cartunesca Exclusiva do Login */}
            <div className="rounded-2xl border border-[#E8E3DA] dark:border-[#2A2724] shadow-xl overflow-hidden bg-white dark:bg-[#181716] relative">
              <img
                src="/illustrations/login-couple.jpg"
                alt="Casal celebrando as chaves e checklist da casa nova (ilustração exclusiva)"
                className="w-full h-[230px] xl:h-[260px] object-cover block"
              />
              <div className="p-3 bg-white/95 dark:bg-[#181716]/95 backdrop-blur-xs border-t border-[#E8E3DA] dark:border-[#2A2724] flex items-center justify-between">
                <div>
                  <span className="font-display font-bold text-xs text-foreground block">
                    Nosso novo cantinho 🏡
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    Escolhas e orçamento sincronizados
                  </span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full border border-emerald-600/20 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-semibold text-[11px]">
                  Tudo em ordem
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Rodapé esquerdo */}
        <div className="text-[11px] text-muted-foreground font-medium">
          CasalPlanner • Feito para o casal e para conta individual.
        </div>
      </motion.div>

      {/* =========================================
          PAINEL DIREITO: FORMULÁRIO COM LARGURA AMPLIADA E ZERO JUMP
      ========================================= */}
      <motion.div
        initial={{ opacity: 0, x: 28 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="flex-1 flex flex-col justify-between p-6 sm:p-8 lg:p-8 xl:p-10 h-full relative overflow-y-auto lg:overflow-hidden bg-card"
      >
        {/* Topbar: Voltar ao site */}
        <div className="flex items-center justify-between w-full max-w-[520px] mx-auto mb-2 shrink-0">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-foreground/80 hover:text-foreground transition-colors py-1"
          >
            <ArrowRight className="h-3.5 w-3.5 rotate-180" /> Voltar ao site
          </Link>
        </div>

        {/* Container Central com Largura Ampliada para Inputs Confortáveis */}
        <div className="w-full max-w-[520px] mx-auto my-auto space-y-4">
          {/* Cabeçalho Fixo (Altura estável para eliminar saltos de layout) */}
          <div className="text-center sm:text-left min-h-[56px] flex flex-col justify-center">
            <div className="lg:hidden inline-flex items-center gap-2 font-bold mb-2">
              <BrandLogoBadge size="sm" />
              <BrandLogoText size="md" />
            </div>

            <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-foreground leading-tight">
              {modo === "entrar" ? "Acesse sua conta" : "Comece seu enxoval"}
            </h2>
            <p className="text-xs sm:text-sm text-foreground/80 dark:text-[#b4c4ba] font-medium mt-0.5">
              {modo === "entrar"
                ? "Entre para acompanhar os cômodos, compras e orçamentos."
                : "Crie uma conta gratuita em poucos segundos."}
            </p>
          </div>

          {/* Alternador de Modo: Entrar ou Cadastrar (Posição fixa) */}
          <div className="grid grid-cols-2 p-1 bg-muted rounded-xl border border-border gap-1 shrink-0">
            <button
              type="button"
              onClick={() => setModo("entrar")}
              className={`py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer ${
                modo === "entrar"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => setModo("cadastrar")}
              className={`py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer ${
                modo === "cadastrar"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Criar conta
            </button>
          </div>

          {/* Área do Formulário com Transição Suave e Altura Estável */}
          <div className="min-h-[320px] flex flex-col justify-start">
            <AnimatePresence mode="wait">
              {modo === "entrar" ? (
                <motion.div
                  key="entrar"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="space-y-4"
                >
                  <LoginForm returnUrl={returnUrl} />

                  <div className="text-center pt-2 border-t border-border/40">
                    <p className="text-xs text-muted-foreground font-medium">
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
                </motion.div>
              ) : (
                <motion.div
                  key="cadastrar"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="space-y-3.5"
                >
                  <Tabs
                    defaultValue={tipo === "individual" ? "individual" : "casal"}
                    className="w-full"
                  >
                    <TabsList className="grid grid-cols-2 w-full h-9 bg-muted rounded-xl p-1 mb-2.5 border border-border">
                      <TabsTrigger value="casal" className="rounded-lg text-xs font-semibold">
                        <Heart className="h-3.5 w-3.5 mr-1.5 text-primary" /> Em casal
                      </TabsTrigger>
                      <TabsTrigger value="individual" className="rounded-lg text-xs font-semibold">
                        <UserIcon className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" /> Individual
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="casal" className="m-0 focus-visible:outline-none">
                      <RegistroCasal />
                    </TabsContent>
                    <TabsContent value="individual" className="m-0 focus-visible:outline-none">
                      <RegistroIndividual returnUrl={returnUrl} />
                    </TabsContent>
                  </Tabs>

                  <div className="text-center pt-2 border-t border-border/30">
                    <p className="text-xs text-foreground/80 dark:text-[#b4c4ba] font-medium">
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
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Rodapé Fixo */}
        <div className="pt-2 text-center text-xs text-foreground/75 dark:text-[#9fb0a6] font-medium w-full max-w-[520px] mx-auto shrink-0">
          CasalPlanner © {new Date().getFullYear()} • Todos os direitos reservados.
        </div>
      </motion.div>
    </div>
  );
}
