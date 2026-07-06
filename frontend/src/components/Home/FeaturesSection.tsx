import { Home, ListChecks, Sparkles, PiggyBank, Users, Wallet } from "lucide-react";

const features = [
  {
    icon: Home,
    title: "Um cômodo por vez",
    desc: "Organize as compras por ambiente — sala, cozinha, quarto — com meta de orçamento própria para cada um.",
  },
  {
    icon: ListChecks,
    title: "Lista com prioridade",
    desc: "Marque o essencial, o que pode esperar e o que já foi comprado. Nada mais se perde entre listas soltas.",
  },
  {
    icon: Sparkles,
    title: "Pesquisa de preços com IA",
    desc: "Compare variações do mesmo item em lojas diferentes lado a lado e escolha o melhor negócio.",
  },
  {
    icon: Wallet,
    title: "Dinheiro e VR/VA",
    desc: "Separe compras pagas em dinheiro das feitas com vale-alimentação. O orçamento fica claro para os dois.",
  },
  {
    icon: Users,
    title: "Duas pessoas, uma conta",
    desc: "Perfil de casal com dois logins, renda somada e visão compartilhada do que ainda falta.",
  },
  {
    icon: PiggyBank,
    title: "Dashboard financeiro",
    desc: "Veja quanto já foi gasto, quanto falta e o progresso de cada categoria em tempo real.",
  },
];

export function FeaturesSection() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-24">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-semibold uppercase tracking-wider text-primary">Como funciona</p>
        <h2 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">
          Tudo que vocês precisam para montar a casa
        </h2>
        <p className="mt-4 text-lg text-muted-foreground">
          Sem planilha compartilhada, sem grupo cheio de foto, sem esquecer nada.
        </p>
      </div>

      <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {features.map(({ icon: Icon, title, desc }) => (
          <div
            key={title}
            className="group surface-card p-6 transition-all hover:-translate-y-1 hover:shadow-[var(--shadow-elevated)]"
          >
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary-soft text-primary transition-colors group-hover:bg-gradient-brand group-hover:text-primary-foreground">
              <Icon className="h-5 w-5" />
            </div>
            <h3 className="mt-5 text-lg font-semibold">{title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
