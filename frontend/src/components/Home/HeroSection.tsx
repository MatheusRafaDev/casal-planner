import { Link } from "@tanstack/react-router";
import { Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      {/* Ambient background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-40 -left-24 h-96 w-96 rounded-full bg-primary/25 blur-3xl" />
        <div className="absolute top-20 -right-24 h-[28rem] w-[28rem] rounded-full bg-accent/20 blur-3xl" />
      </div>

      <div className="mx-auto max-w-6xl px-6 pt-24 pb-20 md:pt-32 md:pb-28">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-4 py-1.5 text-xs font-medium text-muted-foreground shadow-[var(--shadow-soft)] backdrop-blur">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Feito para casais montando a primeira casa
          </div>

          <h1 className="text-balance text-4xl font-extrabold leading-[1.05] tracking-tight md:text-6xl lg:text-7xl">
            A casa nova de vocês,{" "}
            <span className="text-gradient-brand">planejada a dois.</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-balance text-lg text-muted-foreground md:text-xl">
            Organize compras por cômodo, compare preços com IA e acompanhe o orçamento — tudo em um só lugar,
            juntos.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="h-12 rounded-full bg-gradient-brand px-7 text-base font-semibold text-primary-foreground shadow-[var(--shadow-glow)] transition-transform hover:scale-[1.02]"
            >
              <Link to="/login">
                Começar agora
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="ghost"
              size="lg"
              className="h-12 rounded-full px-6 text-base font-semibold"
            >
              <Link to="/login">Já tenho conta</Link>
            </Button>
          </div>
        </div>

        <div className="relative mx-auto mt-16 max-w-5xl">
          <div className="surface-card overflow-hidden p-4 shadow-[var(--shadow-elevated)]">
            <MockDashboard />
          </div>
        </div>
      </div>
    </section>
  );
}

function MockDashboard() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {[
        { label: "Total planejado", value: "R$ 42.800", tone: "primary" },
        { label: "Já comprado", value: "R$ 18.230", tone: "accent" },
        { label: "Restante", value: "R$ 24.570", tone: "success" },
      ].map((s) => (
        <div key={s.label} className="rounded-2xl border border-border bg-card p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{s.label}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight">{s.value}</p>
          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className={`h-full rounded-full ${
                s.tone === "primary"
                  ? "bg-primary"
                  : s.tone === "accent"
                    ? "bg-accent"
                    : "bg-success"
              }`}
              style={{ width: s.tone === "primary" ? "100%" : s.tone === "accent" ? "42%" : "58%" }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
