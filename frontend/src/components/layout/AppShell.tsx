import { Link, useRouterState } from "@tanstack/react-router";
import { Home, LayoutGrid, User, LogOut, Moon, Sun, Download } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useTheme } from "@/lib/theme-context";
import { usePwa } from "@/hooks/use-pwa";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/inicio", label: "Início", icon: Home },
  { to: "/planejamento", label: "Planejamento", icon: LayoutGrid },
  { to: "/perfil", label: "Perfil", icon: User },
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
    <div className="min-h-screen flex flex-col md:flex-row bg-background">
      {/* Sidebar desktop */}
      <aside className="hidden md:flex md:flex-col md:w-64 border-r bg-sidebar text-sidebar-foreground">
        <div className="p-6">
          <Link to="/inicio" className="flex items-center gap-2">
            <img src="/logo.png" alt="Casal Planner" className="h-10 w-10 rounded-lg" />
            <div className="leading-tight">
              <div className="font-display text-lg font-semibold">Casal Planner</div>
              <div className="text-xs text-muted-foreground">Enxoval organizado</div>
            </div>
          </Link>
        </div>
        <nav className="flex-1 px-3 space-y-1">
          {nav.map((n) => {
            const active = pathname.startsWith(n.to);
            return (
              <Link
                key={n.to}
                to={n.to}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-soft"
                    : "hover:bg-sidebar-accent/60",
                )}
              >
                <n.icon className="h-4 w-4" />
                {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t space-y-2">
          <div className="text-xs text-muted-foreground truncate">Olá, {nome ?? "usuário"}</div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" className="flex-1" onClick={toggle}>
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            {installPrompt && (
              <Button
                variant="ghost"
                size="sm"
                className="flex-1 text-primary"
                onClick={triggerInstall}
                title="Instalar app"
              >
                <Download className="h-4 w-4" />
              </Button>
            )}
            <Button variant="ghost" size="sm" className="flex-1" onClick={logout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="md:hidden flex items-center justify-between px-4 h-14 border-b bg-sidebar shrink-0">
        <Link to="/inicio" className="flex items-center gap-2">
          <img src="/logo.png" alt="Casal Planner" className="h-8 w-8 rounded-lg" />
          <span className="font-display font-semibold">Casal Planner</span>
        </Link>
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" onClick={toggle} aria-label="Alternar tema">
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          {installPrompt && (
            <Button
              variant="ghost"
              size="sm"
              onClick={triggerInstall}
              aria-label="Instalar app"
              className="text-primary"
            >
              <Download className="h-4 w-4" />
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={logout} aria-label="Sair">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Conteúdo principal — padding-bottom compensa a bottom nav + safe-area */}
      <main className="flex-1 min-w-0 pb-[calc(4rem+env(safe-area-inset-bottom,0px))] md:pb-0">
        {children}
      </main>

      {/* Bottom nav mobile */}
      <nav
        className="md:hidden fixed bottom-0 inset-x-0 border-t bg-sidebar/95 backdrop-blur z-40"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <div className="grid grid-cols-3 h-16">
          {nav.map((n) => {
            const active = pathname.startsWith(n.to);
            return (
              <Link
                key={n.to}
                to={n.to}
                className={cn(
                  "relative flex flex-col items-center justify-center gap-1 text-xs transition-colors min-h-[44px]",
                  active
                    ? "text-primary font-medium"
                    : "text-muted-foreground hover:text-foreground",
                )}
                aria-current={active ? "page" : undefined}
              >
                {/* Indicador visual ativo: barra superior */}
                {active && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-primary" />
                )}
                {/* Fundo sutil no item ativo */}
                {active && (
                  <span className="absolute inset-x-2 inset-y-1.5 rounded-xl bg-primary/10" />
                )}
                <n.icon className="h-5 w-5 relative" />
                <span className="relative">{n.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
