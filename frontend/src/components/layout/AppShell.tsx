import { useState, Suspense, lazy } from "react";
import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { LayoutGrid, User, LogOut, Download, PieChart, Plus } from "lucide-react";
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
    <div className="min-h-dvh flex flex-col bg-background md:pl-64 font-sans text-foreground">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex md:flex-col w-64 border-r border-border bg-sidebar text-foreground fixed inset-y-0 left-0 z-50 overflow-hidden select-none">
        {/* Brand Header */}
        <div className="p-6 pb-4">
          <Link
            to="/inicio"
            className="flex items-center gap-3 transition-transform hover:scale-[1.02] group"
          >
            <BrandLogoIcon size="md" className="h-9 w-9" />
            <div className="flex flex-col">
              <BrandLogoText size="md" />
              <span className="text-[11px] font-semibold text-muted-foreground mt-0.5">
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
                    ? "bg-primary text-primary-foreground border-primary shadow-xs"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/70",
                )}
              >
                <n.icon
                  className={cn(
                    "h-4 w-4 shrink-0",
                    active ? "text-primary-foreground" : "text-muted-foreground",
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
          <div className="card-sticker p-3 bg-card flex flex-col gap-3">
            <Link
              to="/perfil"
              className="flex items-center gap-3 hover:opacity-85 transition-opacity"
            >
              {isCasal ? (
                <div className="relative flex items-center -space-x-1.5 shrink-0">
                  <div
                    className={cn(
                      "h-7 w-7 rounded-full border-2 border-card flex items-center justify-center font-bold text-xs shadow-xs transition-transform",
                      usuario?.pessoaLogada === 1
                        ? "bg-p1 text-p1-foreground z-10 ring-2 ring-p1 scale-110"
                        : "bg-p1/50 text-p1-foreground/70 opacity-60 scale-90",
                    )}
                    title={usuario?.pessoaLogada === 1 ? `${p1Primeiro} (Você)` : p1Primeiro}
                  >
                    {p1Primeiro.charAt(0)}
                  </div>
                  <div
                    className={cn(
                      "h-7 w-7 rounded-full border-2 border-card flex items-center justify-center font-bold text-xs shadow-xs transition-transform",
                      usuario?.pessoaLogada === 2
                        ? "bg-p2 text-p2-foreground z-10 ring-2 ring-p2 scale-110"
                        : "bg-p2/50 text-p2-foreground/70 opacity-60 scale-90",
                    )}
                    title={usuario?.pessoaLogada === 2 ? `${p2Primeiro} (Você)` : p2Primeiro}
                  >
                    {p2Primeiro.charAt(0)}
                  </div>
                  <span
                    className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-card z-20"
                    title="Conectado agora"
                  />
                </div>
              ) : (
                <div className="relative shrink-0">
                  <div className="h-8 w-8 rounded-full border-2 border-border bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm shadow-xs">
                    {logadoNome.charAt(0).toUpperCase()}
                  </div>
                  <span
                    className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-card"
                    title="Conectado agora"
                  />
                </div>
              )}
              <div className="flex flex-col overflow-hidden min-w-0">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-xs font-bold text-foreground truncate">{logadoNome}</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shrink-0">
                    Você
                  </span>
                </div>
                <span className="text-[11px] text-muted-foreground truncate font-medium">
                  {isCasal ? `Casal: ${p1Primeiro} & ${p2Primeiro}` : "Conta individual"}
                </span>
              </div>
            </Link>

            {/* Quick Actions Bar */}
            <div className="flex items-center justify-end gap-1 pt-2 border-t border-border">
              {installPrompt && (
                <button
                  onClick={triggerInstall}
                  className="flex items-center justify-center gap-1 py-1 px-2 rounded-lg text-[11px] font-semibold text-primary hover:bg-primary-tint transition-colors cursor-pointer"
                  title="Instalar como aplicativo"
                >
                  <Download className="h-3.5 w-3.5" /> App
                </button>
              )}
              <button
                onClick={logout}
                className="flex items-center justify-center gap-1 py-1 px-2 rounded-lg text-[11px] font-semibold text-muted-foreground hover:text-destructive hover:bg-destructive-tint transition-colors cursor-pointer"
                title="Encerrar sessão"
              >
                <LogOut className="h-3.5 w-3.5" /> Sair
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Header Mobile Nativo com Branding e Status do Perfil */}
      <header className="md:hidden sticky top-0 z-40 bg-background/90 backdrop-blur-md border-b border-border/80 px-4 py-2.5 flex items-center justify-between select-none">
        <Link
          to="/inicio"
          className="flex items-center gap-2.5 transition-transform active:scale-95"
        >
          <BrandLogoIcon size="sm" className="h-7 w-7" />
          <div className="flex flex-col">
            <BrandLogoText size="sm" />
            <span className="text-[10px] font-semibold text-muted-foreground leading-none">
              {isCasal ? `${p1Primeiro} & ${p2Primeiro}` : "Gestão do lar"}
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          {installPrompt && (
            <button
              onClick={triggerInstall}
              className="flex items-center gap-1 py-1 px-2.5 rounded-lg text-[11px] font-bold text-primary bg-primary/10 border border-primary/20 hover:bg-primary/15 transition-colors cursor-pointer"
              title="Instalar aplicativo"
            >
              <Download className="h-3 w-3" /> App
            </button>
          )}
          <Link
            to="/perfil"
            className="flex items-center p-0.5 rounded-full hover:ring-2 hover:ring-primary/20 transition-all"
            title={`Conectado como ${logadoNome}`}
          >
            {isCasal ? (
              <div className="relative flex items-center -space-x-1.5 shrink-0">
                <div
                  className={cn(
                    "h-6 w-6 rounded-full border border-card flex items-center justify-center font-bold text-[10px] shadow-xs",
                    usuario?.pessoaLogada === 1
                      ? "bg-p1 text-p1-foreground z-10 ring-1 ring-p1"
                      : "bg-p1/40 text-p1-foreground/70 opacity-60",
                  )}
                >
                  {p1Primeiro.charAt(0)}
                </div>
                <div
                  className={cn(
                    "h-6 w-6 rounded-full border border-card flex items-center justify-center font-bold text-[10px] shadow-xs",
                    usuario?.pessoaLogada === 2
                      ? "bg-p2 text-p2-foreground z-10 ring-1 ring-p2"
                      : "bg-p2/40 text-p2-foreground/70 opacity-60",
                  )}
                >
                  {p2Primeiro.charAt(0)}
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-500 border border-card z-20" />
              </div>
            ) : (
              <div className="relative shrink-0">
                <div className="h-7 w-7 rounded-full border border-border bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs shadow-xs">
                  {logadoNome.charAt(0).toUpperCase()}
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-500 border border-card" />
              </div>
            )}
          </Link>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="flex-1 min-w-0 pb-[calc(5rem+env(safe-area-inset-bottom,0px))] md:pb-10">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6 lg:py-8">
          {children}
        </div>
      </main>

      {/* Bottom Nav Mobile */}
      <nav
        className="md:hidden fixed bottom-0 inset-x-0 bg-card/95 backdrop-blur-md border-t border-border/80 z-50 shadow-lg select-none"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <div className="grid grid-cols-4 h-16 items-center px-1">
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

          {/* 3. Botão Adicionar Destacado (No meio das opções) */}
          <button
            type="button"
            onClick={abrirWizardAdicionar}
            className="flex flex-col items-center justify-center gap-0.5 w-full h-full transition-all active:scale-90 group cursor-pointer"
            aria-label="Adicionar novo item"
          >
            <div className="flex items-center justify-center h-9 w-9 rounded-full bg-primary text-primary-foreground shadow-[0_2px_8px_rgba(31,92,67,0.35)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.5)] border border-primary/20 -translate-y-1 group-active:translate-y-0 transition-transform">
              <Plus className="h-5 w-5 stroke-[2.5]" />
            </div>
            <span className="text-[10px] font-bold text-primary leading-none -translate-y-0.5 group-active:translate-y-0 transition-transform">
              Adicionar
            </span>
          </button>

          {/* 4. Minha Conta */}
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
            categoriaInicialId=""
          />
        </Suspense>
      )}
    </div>
  );
}
