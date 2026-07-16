import { Link, useRouterState } from "@tanstack/react-router";
import { Home, LayoutGrid, User, LogOut, Moon, Sun } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useTheme } from "@/lib/theme-context";
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
            <Button variant="ghost" size="sm" className="flex-1" onClick={logout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="md:hidden flex items-center justify-between px-4 h-14 border-b bg-sidebar">
        <Link to="/inicio" className="flex items-center gap-2">
          <img src="/logo.png" alt="Casal Planner" className="h-8 w-8 rounded-lg" />
          <span className="font-display font-semibold">Casal Planner</span>
        </Link>
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" onClick={toggle}>
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="sm" onClick={logout}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <main className="flex-1 min-w-0 pb-20 md:pb-0">{children}</main>

      {/* Bottom nav mobile */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 h-16 border-t bg-sidebar/95 backdrop-blur flex items-stretch overflow-x-auto z-40">
        {nav.map((n) => {
          const active = pathname.startsWith(n.to);
          return (
            <Link
              key={n.to}
              to={n.to}
              className={cn(
                "flex-1 shrink-0 min-w-[72px] flex flex-col items-center justify-center gap-1 text-xs",
                active ? "text-primary font-medium" : "text-muted-foreground",
              )}
            >
              <n.icon className="h-5 w-5" />
              {n.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
