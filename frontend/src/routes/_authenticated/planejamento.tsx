import { createFileRoute } from "@tanstack/react-router";
import { LayoutGrid } from "lucide-react";

export const Route = createFileRoute("/_authenticated/planejamento")({
  head: () => ({ meta: [{ title: "Planejamento · Casal Planner" }] }),
  component: PlanejamentoPage,
});

function PlanejamentoPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Planejamento</h1>
        <p className="mt-2 text-muted-foreground">
          Categorias, itens, filtros e pesquisa de preços com IA — chegando na Fase 3.
        </p>
      </header>
      <div className="surface-card grid place-items-center px-6 py-16 text-center">
        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-primary-soft text-primary">
          <LayoutGrid className="h-6 w-6" />
        </div>
        <h2 className="mt-4 text-lg font-semibold">Em breve</h2>
        <p className="mt-1 max-w-md text-sm text-muted-foreground">
          Esta é a tela mais rica do app. Vamos reconstruí-la em componentes menores
          (PlanningStatsBar, CategoryPanel, ItemList, ItemFilters, AddItemWizard, PricePanel)
          mantendo todos os endpoints e comportamentos atuais.
        </p>
      </div>
    </div>
  );
}
