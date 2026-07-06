import { createFileRoute } from "@tanstack/react-router";
import { Moon, Sun, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { formatBRL } from "@/lib/formatters";

export const Route = createFileRoute("/_authenticated/perfil")({
  head: () => ({ meta: [{ title: "Perfil · Casal Planner" }] }),
  component: PerfilPage,
});

function PerfilPage() {
  const { usuario, logout, isCasal } = useAuth();
  const { isDarkMode, toggle } = useTheme();

  if (!usuario) return null;

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Perfil</h1>
          <p className="mt-2 text-muted-foreground">
            {isCasal ? "Conta do casal" : "Conta individual"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="rounded-full"
            onClick={toggle}
            aria-label="Alternar tema"
          >
            {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            {isDarkMode ? "Tema claro" : "Tema escuro"}
          </Button>
          <Button
            variant="ghost"
            className="rounded-full text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={() => void logout()}
          >
            <LogOut className="h-4 w-4" /> Sair
          </Button>
        </div>
      </header>

      {isCasal && usuario.casalInfo ? (
        <div className="grid gap-4 md:grid-cols-2">
          <PersonCard person={usuario.casalInfo.pessoa1} label="Pessoa 1" />
          <PersonCard person={usuario.casalInfo.pessoa2} label="Pessoa 2" />
        </div>
      ) : (
        <PersonCard
          person={{
            nomeCompleto: usuario.nomeCompleto,
            email: usuario.email,
            cpf: usuario.cpf,
            rendaMensal: usuario.rendaMensal,
          }}
          label="Você"
        />
      )}

      <div className="surface-card p-6 text-sm text-muted-foreground">
        A edição de dados, alteração de senha e detalhes do perfil serão finalizados na Fase 4
        do redesign.
      </div>
    </div>
  );
}

function PersonCard({
  person,
  label,
}: {
  person: { nomeCompleto?: string; email?: string; cpf?: string; rendaMensal?: number };
  label: string;
}) {
  const initial = (person.nomeCompleto ?? person.email ?? "?").slice(0, 1).toUpperCase();
  return (
    <div className="surface-card p-6">
      <div className="flex items-center gap-4">
        <div className="bg-gradient-brand grid h-14 w-14 shrink-0 place-items-center rounded-2xl text-lg font-bold text-primary-foreground">
          {initial}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          <p className="mt-0.5 truncate text-lg font-semibold">
            {person.nomeCompleto ?? "—"}
          </p>
          <p className="truncate text-sm text-muted-foreground">{person.email ?? "—"}</p>
        </div>
      </div>
      <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-xl bg-muted/60 px-3 py-2.5">
          <dt className="text-xs text-muted-foreground">CPF</dt>
          <dd className="font-medium">{person.cpf ?? "—"}</dd>
        </div>
        <div className="rounded-xl bg-muted/60 px-3 py-2.5">
          <dt className="text-xs text-muted-foreground">Renda mensal</dt>
          <dd className="font-medium">{formatBRL(person.rendaMensal)}</dd>
        </div>
      </dl>
    </div>
  );
}
