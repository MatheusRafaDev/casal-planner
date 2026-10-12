import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutGrid, User, LogOut, Download, PieChart } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { usePwa } from "@/hooks/use-pwa";
import { cn } from "@/lib/utils";
import { BrandLogoText, BrandLogoIcon } from "@/components/ui/BrandLogo";

const nav = [
  { to: "/inicio", label: "Dashboard", icon: PieChart },
  { to: "/planejamento", label: "Planejamento", icon: LayoutGrid },
  { to: "/perfil", label: "Minha conta", icon: User },
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const { usuario, logout } = useAuth();
  const { installPrompt, triggerInstall } = usePwa();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

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
                        ? "bg-[#2F7D5B] text-white z-10 ring-2 ring-primary scale-110"
                        : "bg-[#2F7D5B]/50 text-white/70 opacity-60 scale-90",
                    )}
                    title={usuario?.pessoaLogada === 1 ? `${p1Primeiro} (Você)` : p1Primeiro}
                  >
                    {p1Primeiro.charAt(0)}
                  </div>
                  <div
                    className={cn(
                      "h-7 w-7 rounded-full border-2 border-card flex items-center justify-center font-bold text-xs shadow-xs transition-transform",
                      usuario?.pessoaLogada === 2
                        ? "bg-[#E8B63C] text-[#24302A] z-10 ring-2 ring-[#E8B63C] scale-110"
                        : "bg-[#E8B63C]/50 text-[#24302A]/70 opacity-60 scale-90",
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

      {/* Conteúdo Principal */}
      <main className="flex-1 min-w-0 pt-[env(safe-area-inset-top,0px)] md:pt-0 pb-[calc(4.5rem+env(safe-area-inset-bottom,0px))] md:pb-8">
        <div className="w-full max-w-[1440px] px-4 sm:px-6 lg:px-8 py-6 lg:py-8">{children}</div>
      </main>

      {/* Bottom Nav Mobile */}
      <nav
        className="md:hidden fixed bottom-0 inset-x-0 bg-card border-t border-border z-50 shadow-lg"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <div className="flex h-16 items-center justify-around px-2">
          {nav.map((n) => {
            const active = pathname.startsWith(n.to);
            return (
              <Link
                key={n.to}
                to={n.to}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 w-full h-full transition-all",
                  active
                    ? "text-primary font-bold"
                    : "text-muted-foreground hover:text-foreground font-semibold",
                )}
                aria-current={active ? "page" : undefined}
              >
                <div
                  className={cn(
                    "flex items-center justify-center h-8 w-12 rounded-full transition-all",
                    active
                      ? "bg-primary-tint text-primary-tint-foreground border border-primary/20"
                      : "bg-transparent",
                  )}
                >
                  <n.icon className="h-4 w-4" />
                </div>
                <span className="text-[11px] leading-none">{n.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
