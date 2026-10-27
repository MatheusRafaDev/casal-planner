import { useState, Suspense, lazy } from "react";
import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { LayoutGrid, User, LogOut, Download, PieChart, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { usePwa } from "@/hooks/use-pwa";
import { cn } from "@/lib/utils";
import { BrandLogoText, BrandLogoIcon } from "@/components/ui/BrandLogo";

const AddItemWizard = lazy(() =>
  import("@/components/planejamento/AddItemWizard").then(({ AddItemWizard }) => ({
    default: AddItemWizard,
  })),
);

const nav = [
  { to: "/inicio", label: "Dashboard", icon: PieChart },
  { to: "/planejamento", label: "Planejamento", icon: LayoutGrid },
  { to: "/perfil", label: "Minha conta", icon: User },
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const { usuario, logout } = useAuth();
  const { installPrompt, triggerInstall } = usePwa();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const search = useRouterState({
    select: (s) => (s.location.search as Record<string, unknown>) ?? {},
  });
  const comodoAtual = typeof search.comodo === "string" ? search.comodo : "";
  const navigate = useNavigate();

  const [wizardOpen, setWizardOpen] = useState(false);

  const { data: categorias = [] } = useQuery({
    queryKey: ["categorias"],
    queryFn: () => import("@/services/categorias").then((m) => m.categoriasService.listar()),
  });

  const abrirWizardAdicionar = () => {
    if (categorias.length === 0) {
      toast.info("Crie seu primeiro cômodo no Planejamento para organizar seus itens!");
      navigate({ to: "/planejamento" });
    } else {
      setWizardOpen(true);
    }
  };

  const isCasal = usuario?.tipoConta === "Casal";
  const p1Nome = usuario?.casalInfo?.pessoa1?.nome?.trim() || "Pessoa 1";
  const p2Nome = usuario?.casalInfo?.pessoa2?.nome?.trim() || "Pessoa 2";
  const p1Primeiro = p1Nome.split(" ")[0];
  const p2Primeiro = p2Nome.split(" ")[0];

  const logadoNome = isCasal
    ? usuario?.pessoaLogada === 2
      ? p2Primeiro
      : p1Primeiro
    : usuario?.nomeCompleto?.split(" ")[0] || "Usuário";

  return (
    <div className="min-h-dvh flex flex-col bg-background md:pl-72 font-sans text-foreground">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex md:flex-col w-72 border-r border-[#133c2b] bg-sidebar text-white fixed inset-y-0 left-0 z-50 overflow-hidden select-none">
        {/* Brand Header */}
        <div className="p-6 pb-4 border-b border-white/10">
          <Link
            to="/inicio"
            className="flex items-center gap-3 transition-transform hover:scale-[1.02] group"
          >
            <BrandLogoIcon size="md" className="h-9 w-9 rounded-xl shadow-xs" />
            <div className="flex flex-col">
              <BrandLogoText size="md" variant="on-dark" />
              <span className="text-[11px] font-semibold text-emerald-200/70 mt-0.5">
                {isCasal ? `${p1Primeiro} & ${p2Primeiro}` : "Gestão do lar"}
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation Items */}
        <div className="px-4 py-4 space-y-1.5">
          {nav.map((n) => {
            const active = pathname.startsWith(n.to);
            return (
              <Link
                key={n.to}
                to={n.to}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all duration-150 h-10 border",
                  active
                    ? "bg-white/20 text-white border-white/25 shadow-xs font-bold backdrop-blur-xs"
                    : "border-transparent text-emerald-100/75 hover:text-white hover:bg-white/10",
                )}
              >
                <n.icon
                  className={cn(
                    "h-4 w-4 shrink-0",
                    active ? "text-emerald-300" : "text-emerald-200/60",
                  )}
                />
                <span>{n.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Categories Portal for Planning Page */}
        <div className="flex-1 overflow-y-auto px-3.5 py-1 space-y-1.5 min-h-0">
          <div id="sidebar-categories-portal" className="flex flex-col gap-1.5" />
        </div>

        {/* Footer User Profile Card */}
        <div className="p-4 mt-auto space-y-3">
          <div className="p-3 rounded-2xl bg-black/20 border border-white/15 flex flex-col gap-3 text-white backdrop-blur-xs shadow-xs">
            <Link
              to="/perfil"
              className="flex items-center gap-3 hover:opacity-90 transition-opacity"
            >
              {isCasal ? (
                <div className="relative flex items-center -space-x-1.5 shrink-0">
                  <div
                    className={cn(
                      "h-7 w-7 rounded-full border-2 border-[#174a35] flex items-center justify-center font-bold text-xs shadow-xs transition-transform",
                      usuario?.pessoaLogada === 1
                        ? "bg-emerald-400 text-emerald-950 z-10 ring-2 ring-emerald-300 scale-110"
                        : "bg-emerald-400/50 text-white opacity-70 scale-90",
                    )}
                    title={usuario?.pessoaLogada === 1 ? `${p1Primeiro} (Você)` : p1Primeiro}
                  >
                    {p1Primeiro.charAt(0)}
                  </div>
                  <div
                    className={cn(
                      "h-7 w-7 rounded-full border-2 border-[#174a35] flex items-center justify-center font-bold text-xs shadow-xs transition-transform",
                      usuario?.pessoaLogada === 2
                        ? "bg-p2 text-p2-foreground z-10 ring-2 ring-p2 scale-110"
                        : "bg-p2/50 text-p2-foreground/70 opacity-60 scale-90",
                    )}
                    title={usuario?.pessoaLogada === 2 ? `${p2Primeiro} (Você)` : p2Primeiro}
                  >
                    {p2Primeiro.charAt(0)}
                  </div>
                  <span
                    className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 border-2 border-[#174a35] z-20"
                    title="Conectado agora"
                  />
                </div>
              ) : (
                <div className="relative shrink-0">
                  <div className="h-8 w-8 rounded-full border-2 border-white/20 bg-white/20 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                    {logadoNome.charAt(0).toUpperCase()}
                  </div>
                  <span
                    className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 border-2 border-[#174a35]"
                    title="Conectado agora"
                  />
                </div>
              )}
              <div className="flex flex-col overflow-hidden min-w-0">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-xs font-bold text-white truncate">{logadoNome}</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-400/25 text-emerald-200 border border-emerald-400/35 shrink-0">
                    Você
                  </span>
                </div>
                <span className="text-[11px] text-emerald-200/70 truncate font-medium">
                  {isCasal ? `Casal: ${p1Primeiro} & ${p2Primeiro}` : "Conta individual"}
                </span>
              </div>
            </Link>

            {/* Quick Actions Bar */}
            <div className="flex items-center justify-end gap-1 pt-2 border-t border-white/10">
              {installPrompt && (
                <button
                  onClick={triggerInstall}
                  className="flex items-center justify-center gap-1 py-1 px-2 rounded-lg text-[11px] font-semibold text-emerald-200 bg-white/10 hover:bg-white/20 border border-white/15 transition-colors cursor-pointer"
                  title="Instalar como aplicativo"
                >
                  <Download className="h-3.5 w-3.5" /> App
                </button>
              )}
              <button
                onClick={logout}
                className="flex items-center justify-center gap-1 py-1 px-2 rounded-lg text-[11px] font-semibold text-emerald-200/70 hover:text-rose-200 hover:bg-rose-500/20 transition-colors cursor-pointer ml-auto"
                title="Encerrar sessão"
              >
                <LogOut className="h-3.5 w-3.5" /> Sair
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Conteúdo Principal (Respeita o Notch do iPhone 11 e Safe Areas) */}
      <main className="flex-1 min-w-0 pb-[calc(7rem+env(safe-area-inset-bottom,0px))] md:pb-10 pt-[calc(0.75rem+env(safe-area-inset-top,0px))] md:pt-0 pl-[env(safe-area-inset-left,0px)] pr-[env(safe-area-inset-right,0px)]">
        <div
          className={cn(
            "w-full mx-auto px-4 sm:px-6 lg:px-8 pt-2 pb-6 sm:py-6 lg:py-8",
            pathname.startsWith("/planejamento") ? "max-w-none xl:px-10 2xl:px-12" : "max-w-7xl",
          )}
        >
          {children}
        </div>
      </main>

      {/* Botão Flutuante (FAB) Adicionar Item Mobile */}
      <motion.button
        type="button"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileTap={{ scale: 0.93 }}
        whileHover={{ scale: 1.04 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        onClick={abrirWizardAdicionar}
        className="md:hidden fixed right-4 bottom-[calc(4.85rem+env(safe-area-inset-bottom,0px))] z-40 flex items-center gap-2 px-4 py-3 rounded-full bg-primary text-primary-foreground font-bold text-sm shadow-[0_6px_20px_rgba(31,92,67,0.4)] border-2 border-white/20 active:bg-primary-hover transition-colors cursor-pointer select-none"
        aria-label="Adicionar item"
      >
        <Plus className="h-5 w-5 stroke-[2.5]" />
        <span>Adicionar item</span>
      </motion.button>

      {/* Bottom Nav Mobile */}
      <nav
        className="md:hidden fixed bottom-0 inset-x-0 bg-card/95 backdrop-blur-md border-t border-border/80 z-50 shadow-lg select-none"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <div className="grid grid-cols-3 h-16 items-center px-3">
          {/* 1. Início */}
          <Link
            to="/inicio"
            className={cn(
              "flex flex-col items-center justify-center gap-0.5 w-full h-full transition-all active:scale-95",
              pathname.startsWith("/inicio")
                ? "text-primary font-bold"
                : "text-muted-foreground hover:text-foreground font-semibold",
            )}
            aria-current={pathname.startsWith("/inicio") ? "page" : undefined}
          >
            <div
              className={cn(
                "flex items-center justify-center h-7 w-11 rounded-full transition-all duration-200",
                pathname.startsWith("/inicio")
                  ? "bg-primary/10 text-primary border border-primary/25 shadow-2xs"
                  : "bg-transparent text-muted-foreground",
              )}
            >
              <PieChart className="h-4 w-4" />
            </div>
            <span className="text-[10px] leading-none tracking-tight">Início</span>
          </Link>

          {/* 2. Planejamento */}
          <Link
            to="/planejamento"
            className={cn(
              "flex flex-col items-center justify-center gap-0.5 w-full h-full transition-all active:scale-95",
              pathname.startsWith("/planejamento")
                ? "text-primary font-bold"
                : "text-muted-foreground hover:text-foreground font-semibold",
            )}
            aria-current={pathname.startsWith("/planejamento") ? "page" : undefined}
          >
            <div
              className={cn(
                "flex items-center justify-center h-7 w-11 rounded-full transition-all duration-200",
                pathname.startsWith("/planejamento")
                  ? "bg-primary/10 text-primary border border-primary/25 shadow-2xs"
                  : "bg-transparent text-muted-foreground",
              )}
            >
              <LayoutGrid className="h-4 w-4" />
            </div>
            <span className="text-[10px] leading-none tracking-tight">Planejar</span>
          </Link>

          {/* 3. Minha Conta */}
          <Link
            to="/perfil"
            className={cn(
              "flex flex-col items-center justify-center gap-0.5 w-full h-full transition-all active:scale-95",
              pathname.startsWith("/perfil")
                ? "text-primary font-bold"
                : "text-muted-foreground hover:text-foreground font-semibold",
            )}
            aria-current={pathname.startsWith("/perfil") ? "page" : undefined}
          >
            <div
              className={cn(
                "flex items-center justify-center h-7 w-11 rounded-full transition-all duration-200",
                pathname.startsWith("/perfil")
                  ? "bg-primary/10 text-primary border border-primary/25 shadow-2xs"
                  : "bg-transparent text-muted-foreground",
              )}
            >
              <User className="h-4 w-4" />
            </div>
            <span className="text-[10px] leading-none tracking-tight">Perfil</span>
          </Link>
        </div>
      </nav>

      {/* Modal Global do Wizard de Adicionar Item */}
      {wizardOpen && (
        <Suspense fallback={null}>
          <AddItemWizard
            open={wizardOpen}
            onOpenChange={setWizardOpen}
            categorias={categorias}
            categoriaInicialId={comodoAtual}
          />
        </Suspense>
      )}
    </div>
  );
}
