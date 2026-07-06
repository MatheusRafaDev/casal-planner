import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/context/AuthContext";
import { formatBRL } from "@/lib/formatters";

export const Route = createFileRoute("/_authenticated/inicio")({
  head: () => ({ meta: [{ title: "Início · Casal Planner" }] }),
  component: InicioPage,
});

function InicioPage() {
  const { usuario } = useAuth();
  const nome =
    usuario?.nomeCompleto ??
    usuario?.casalInfo?.pessoa1.nomeCompleto ??
    "por aqui";

  return (
    <div className="space-y-8">
      <header>
        <p className="text-sm font-medium text-muted-foreground">Bem-vindos,</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight md:text-4xl">{nome}</h1>
        <p className="mt-2 text-muted-foreground">
          O painel financeiro completo chega na próxima etapa do redesign.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          { label: "Total planejado", value: 0 },
          { label: "Já comprado", value: 0 },
          { label: "Restante", value: 0 },
        ].map((c) => (
          <div key={c.label} className="surface-card p-6">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {c.label}
            </p>
            <p className="mt-2 text-3xl font-bold tracking-tight">{formatBRL(c.value)}</p>
            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-muted">
              <div className="h-full w-0 bg-primary" />
            </div>
          </div>
        ))}
      </section>

      <div className="surface-card p-8 text-center">
        <p className="text-sm text-muted-foreground">
          As telas de <strong>Planejamento</strong>, <strong>Dashboard</strong> e{" "}
          <strong>Perfil</strong> serão redesenhadas nas próximas fases, mantendo todas as
          funcionalidades atuais do app.
        </p>
      </div>
    </div>
  );
}
