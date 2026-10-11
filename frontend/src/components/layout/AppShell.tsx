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

  const isCasal = usuario?.tipoConta === "Casal";
  const p1Nome = usuario?.casalInfo?.pessoa1?.nome?.trim() || "Pessoa 1";
  const p2Nome = usuario?.casalInfo?.pessoa2?.nome?.trim() || "Pessoa 2";
  const p1Primeiro = p1Nome.split(" ")[0];
  const p2Primeiro = p2Nome.split(" ")[0];

  const logadoNome =
    isCasal
      ? usuario?.pessoaLogada === 2
        ? p2Primeiro
        : p1Primeiro
      : usuario?.nomeCompleto?.split(" ")[0] || "Usuário";

  return (
    <div className="min-h-screen flex flex-col bg-background md:pl-64 font-sans">
      {/* Mobile Top Header */}
      <header className="md:hidden sticky top-0 z-40 flex items-center justify-between px-4 h-14 bg-card/95 backdrop-blur-md text-foreground border-b border-border shadow-xs">
        <div className="flex items-center gap-2.5">
          <span className="grid h-7 w-7 place-items-center rounded-md bg-primary text-primary-foreground text-xs shadow-xs">
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
              <path d="M3 11 12 4l9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />
            </svg>
          </span>
          <div className="flex flex-col">
            <span className="font-display font-bold text-sm tracking-tight text-foreground leading-tight">Casal Planner</span>
            {isCasal && (
              <span className="text-[10px] font-mono font-medium text-muted-foreground leading-none">
                {p1Primeiro} & {p2Primeiro}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={toggle} className="text-muted-foreground hover:text-foreground p-1.5 rounded-md hover:bg-muted transition-colors" title="Alternar tema">
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          {installPrompt && (
            <button
              onClick={triggerInstall}
              className="text-primary p-1.5 rounded-md bg-primary/10 hover:bg-primary/20 transition-colors"
              title="Instalar App"
            >
              <Download className="h-4 w-4" />
            </button>
          )}
          <button onClick={logout} className="text-muted-foreground hover:text-destructive p-1.5 rounded-md hover:bg-destructive/10 transition-colors" title="Sair">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Sidebar Desktop — Linear Precision */}
      <aside className="hidden md:flex md:flex-col w-64 border-r border-border bg-sidebar text-sidebar-foreground fixed inset-y-0 left-0 z-50 overflow-hidden select-none">
        {/* Brand Header */}
        <div className="p-5 pb-3">
          <Link to="/inicio" className="flex items-center gap-2.5 transition-opacity hover:opacity-85 group">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-primary text-primary-foreground shadow-xs transition-transform group-hover:scale-105">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
                <path d="M3 11 12 4l9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />
              </svg>
            </span>
            <div className="flex flex-col">
              <span className="font-display text-base font-bold tracking-tight text-foreground leading-tight">Casal Planner</span>
              <span className="text-[10px] font-semibold text-muted-foreground font-mono uppercase tracking-wider">Gestão do Lar</span>
            </div>
          </Link>
        </div>

        {/* Navigation Items */}
        <div className="px-3 py-4 space-y-1">
          <p className="px-2.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 font-mono">Menu</p>
          {nav.map((n) => {
            const active = pathname.startsWith(n.to);
            return (
              <Link
                key={n.to}
                to={n.to}
                className={cn(
                  "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium transition-all duration-150 h-9",
                  active
                    ? "bg-primary/10 text-primary font-semibold shadow-2xs border-l-2 border-primary"
                    : "text-muted-foreground hover:bg-muted/70 hover:text-foreground",
                )}
              >
                <n.icon className={cn("h-4 w-4 shrink-0", active ? "text-primary" : "text-muted-foreground")} />
                <span>{n.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Portal for Category Filters (when on Planejamento) */}
        <div className="flex-1 overflow-y-auto px-3">
          <div id="sidebar-categories-portal" className="flex flex-col gap-1" />
        </div>

        {/* Footer User Profile Card */}
        <div className="p-3 mt-auto border-t border-border bg-card/50">
          <div className="flex flex-col gap-2.5">
            <Link to="/perfil" className="flex items-center gap-2.5 px-2 py-1.5 rounded-md hover:bg-muted/60 transition-colors group">
              <div className="h-8 w-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 text-primary font-bold text-xs font-mono tracking-tighter">
                {isCasal
                  ? `${p1Primeiro.charAt(0)}${p2Primeiro.charAt(0)}`
                  : (logadoNome.charAt(0).toUpperCase() ?? "U")}
              </div>
              <div className="flex flex-col overflow-hidden min-w-0">
                <span className="text-xs font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                  {isCasal ? `${p1Primeiro} & ${p2Primeiro}` : (usuario?.nomeCompleto ?? "Usuário")}
                </span>
                <span className="text-[10px] text-muted-foreground truncate font-mono">
                  {isCasal ? `Ativo: ${logadoNome}` : "Minha Conta"}
                </span>
              </div>
            </Link>
            
            {/* Quick Actions Bar */}
            <div className="flex items-center justify-between gap-1 px-1 pt-1 border-t border-border/60">
              <button
                onClick={toggle}
                className="flex items-center justify-center gap-1.5 py-1 px-2 rounded-md text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
                title="Alternar tema"
              >
                {theme === "dark" ? <Sun className="h-3.5 w-3.5 text-amber-400" /> : <Moon className="h-3.5 w-3.5 text-primary" />}
                <span className="text-[11px]">{theme === "dark" ? "Claro" : "Escuro"}</span>
              </button>
              {installPrompt && (
                <button
                  onClick={triggerInstall}
                  className="flex items-center justify-center gap-1 py-1 px-2 rounded-md text-[11px] font-medium text-primary hover:bg-primary/10 transition-colors cursor-pointer"
                  title="Instalar como aplicativo"
                >
                  <Download className="h-3.5 w-3.5" /> App
                </button>
              )}
              <button
                onClick={logout}
                className="flex items-center justify-center gap-1 py-1 px-2 rounded-md text-[11px] font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                title="Encerrar sessão"
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
                  "flex flex-col items-center justify-center gap-0.5 w-full h-full transition-colors",
                  active ? "text-primary" : "text-sidebar-foreground/70 hover:text-sidebar-foreground",
                )}
                aria-current={active ? "page" : undefined}
              >
                <div
                  className={cn(
                    "flex items-center justify-center h-8 w-12 rounded-full transition-colors",
                    active ? "bg-primary/10" : "bg-transparent",
                  )}
                >
                  <n.icon className="h-5 w-5" />
                </div>
                <span className={cn("text-[10px]", active ? "font-bold" : "font-medium")}>
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
