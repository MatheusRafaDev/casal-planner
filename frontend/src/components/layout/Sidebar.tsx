import { Link, useRouterState } from "@tanstack/react-router";
import { Home, LayoutGrid, User, LogOut } from "lucide-react";
import { BrandMark } from "@/components/BrandMark";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

const items = [
  { to: "/inicio", label: "Início", icon: Home },
  { to: "/planejamento", label: "Planejamento", icon: LayoutGrid },
  { to: "/perfil", label: "Perfil", icon: User },
] as const;

export function Sidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { logout, usuario } = useAuth();
  const displayName =
    usuario?.nomeCompleto ?? usuario?.casalInfo?.pessoa1.nomeCompleto ?? usuario?.email ?? "";

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar md:flex">
      <div className="px-6 pt-7 pb-6">
        <BrandMark />
      </div>

      <nav className="flex-1 px-3">
        <ul className="flex flex-col gap-1">
          {items.map(({ to, label, icon: Icon }) => {
            const active = pathname === to || pathname.startsWith(`${to}/`);
            return (
              <li key={to}>
                <Link
                  to={to}
                  className={cn(
                    "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                    active
                      ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-[var(--shadow-glow)]"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  )}
                >
                  <Icon
                    className={cn(
                      "h-5 w-5",
                      active ? "" : "text-muted-foreground group-hover:text-inherit",
                    )}
                  />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <div className="mb-2 flex items-center gap-3 px-3 py-2">
          <div className="bg-gradient-brand grid h-9 w-9 shrink-0 place-items-center rounded-full text-sm font-bold text-primary-foreground">
            {(displayName || "?").slice(0, 1).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{displayName}</p>
            <p className="truncate text-xs text-muted-foreground">{usuario?.email}</p>
          </div>
        </div>
        <button
          onClick={() => void logout()}
          className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut className="h-4 w-4" />
          Sair
        </button>
      </div>
    </aside>
  );
}
