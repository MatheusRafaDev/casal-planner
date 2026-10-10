import { Link, useRouterState } from "@tanstack/react-router";
import { Home, LayoutGrid, User, LogOut, Download, PieChart } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

import { usePwa } from "@/hooks/use-pwa";
import { useTheme } from "@/lib/theme-context";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Sun, Moon } from "lucide-react";

const nav = [
  { to: "/inicio", label: "Dashboard", icon: PieChart },
  { to: "/planejamento", label: "Planejamento", icon: LayoutGrid },
  { to: "/perfil", label: "Minha Conta", icon: User },
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const { usuario, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const { installPrompt, triggerInstall } = usePwa();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const nome =
    usuario?.tipoConta === "Casal"
      ? usuario.pessoaLogada === 2
        ? usuario.casalInfo?.pessoa2.nome
        : usuario.casalInfo?.pessoa1.nome
      : usuario?.nomeCompleto;

  return (
    <div className="min-h-screen flex flex-col bg-muted/10 md:pl-64 font-sans">
      {/* Mobile Top Header */}
      <header className="md:hidden sticky top-0 z-40 flex items-center justify-between px-4 h-14 bg-sidebar text-sidebar-foreground border-b border-sidebar-border shadow-sm">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="CasalPlanner" className="h-6 w-6 rounded opacity-90" />
          <span className="font-display font-semibold tracking-tight text-sidebar-foreground">CasalPlanner</span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={toggle} className="text-sidebar-foreground/70 hover:text-sidebar-foreground p-1.5" title="Alternar tema">
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          {installPrompt && (
            <button
              onClick={triggerInstall}
              className="text-sidebar-primary p-1.5 rounded-full bg-sidebar-primary/10 hover:bg-sidebar-primary/20 transition-colors"
              title="Instalar App"
            >
              <Download className="h-4 w-4" />
            </button>
          )}
          <button onClick={logout} className="text-sidebar-foreground/70 hover:text-sidebar-foreground p-1.5" title="Sair">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Sidebar Desktop */}
      <aside className="hidden md:flex md:flex-col w-64 border-r border-sidebar-border bg-sidebar text-sidebar-foreground fixed inset-y-0 left-0 z-50 overflow-hidden shadow-sm">
        <div className="p-6 pb-2">
          <Link to="/inicio" className="flex items-center gap-3 transition-opacity hover:opacity-80">
            <div className="h-9 w-9 bg-sidebar-primary/10 rounded-lg flex items-center justify-center shrink-0">
              <img src="/logo.png" alt="CasalPlanner" className="h-6 w-6 rounded-sm opacity-90" />
            </div>
            <div className="flex flex-col">
              <span className="font-display text-lg font-bold tracking-tight text-sidebar-foreground leading-tight">CasalPlanner</span>
              <span className="text-[11px] font-medium text-sidebar-foreground/60 uppercase tracking-wider">Gestão de Enxoval</span>
            </div>
          </Link>
        </div>

        <div className="px-4 py-6 space-y-1">
          <p className="px-3 text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider mb-2">Menu Principal</p>
          {nav.map((n) => {
            const active = pathname.startsWith(n.to);
            return (
              <Link
                key={n.to}
                to={n.to}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  active
                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                )}
              >
                <n.icon className={cn("h-4 w-4", active ? "text-sidebar-primary-foreground" : "text-sidebar-foreground/70")} />
                {n.label}
              </Link>
            );
          })}
        </div>

        <div className="flex-1 overflow-y-auto px-4">
          <div id="sidebar-categories-portal" className="flex flex-col gap-1" />
        </div>

        <div className="p-4 mt-auto border-t border-sidebar-border bg-sidebar-accent/30">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3 px-2">
              <div className="h-8 w-8 rounded-full bg-sidebar-primary/20 flex items-center justify-center shrink-0 text-sidebar-primary font-semibold text-sm">
                {nome?.charAt(0).toUpperCase() ?? "U"}
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="text-sm font-medium text-sidebar-foreground truncate">
                  {nome ?? "Usuário"}
                </span>
                <span className="text-xs text-sidebar-foreground/60 truncate">
                  Minha Conta
                </span>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-2 px-2 pt-2 border-t border-sidebar-border/50">
              <button
                onClick={toggle}
                className="flex-1 min-w-[3rem] flex items-center justify-center gap-2 py-1.5 rounded-md text-xs font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
                title="Alternar tema"
              >
                {theme === "dark" ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
              </button>
              {installPrompt && (
                <button
                  onClick={triggerInstall}
                  className="flex-1 min-w-[3rem] flex items-center justify-center gap-2 py-1.5 rounded-md text-xs font-medium text-sidebar-primary hover:bg-sidebar-primary/10 transition-colors"
                >
                  <Download className="h-3.5 w-3.5" /> App
                </button>
              )}
              <button
                onClick={logout}
                className="flex-1 min-w-[3rem] flex items-center justify-center gap-2 py-1.5 rounded-md text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors"
              >
                <LogOut className="h-3.5 w-3.5" /> Sair
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Conteúdo Principal */}
      <main className="flex-1 min-w-0 pb-[calc(4rem+env(safe-area-inset-bottom,0px))] md:pb-0">
        <div className="h-full w-full max-w-7xl mx-auto md:p-6 lg:p-8">
          {children}
        </div>
      </main>

      {/* Bottom Nav Mobile */}
      <nav
        className="md:hidden fixed bottom-0 inset-x-0 bg-background/90 backdrop-blur-md border-t z-50 shadow-[0_-4px_12px_rgba(0,0,0,0.02)]"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <div className="flex h-[3.5rem] items-center justify-around px-2">
          {nav.map((n) => {
            const active = pathname.startsWith(n.to);
            return (
              <Link
                key={n.to}
                to={n.to}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 w-full h-full transition-colors relative",
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground",
                )}
                aria-current={active ? "page" : undefined}
              >
                {active && (
                  <div className="absolute top-0 inset-x-4 h-[2px] bg-primary rounded-b-full" />
                )}
                <n.icon className={cn("h-5 w-5 mt-1", active && "text-primary")} />
                <span className={cn("text-[10px]", active ? "font-semibold" : "font-medium")}>
                  {n.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
