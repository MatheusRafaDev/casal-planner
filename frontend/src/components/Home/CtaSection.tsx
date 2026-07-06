import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export function CtaSection() {
  return (
    <section className="mx-auto max-w-6xl px-6 pb-24">
      <div className="bg-gradient-brand relative overflow-hidden rounded-3xl px-8 py-16 text-center text-primary-foreground shadow-[var(--shadow-glow)] md:px-16 md:py-20">
        <div className="absolute inset-0 -z-0 opacity-40 mix-blend-overlay">
          <div className="absolute -top-24 -left-16 h-72 w-72 rounded-full bg-white/30 blur-3xl" />
          <div className="absolute -bottom-32 -right-16 h-80 w-80 rounded-full bg-black/20 blur-3xl" />
        </div>
        <div className="relative">
          <h2 className="mx-auto max-w-2xl text-balance text-3xl font-bold tracking-tight md:text-5xl">
            Prontos para começar a montar a casa nova?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-primary-foreground/90">
            Crie a conta do casal em menos de um minuto — é grátis para começar.
          </p>
          <div className="mt-8 flex justify-center">
            <Button
              asChild
              size="lg"
              className="h-12 rounded-full bg-white px-7 text-base font-semibold text-primary hover:bg-white/90"
            >
              <Link to="/login">Entrar ou criar conta</Link>
            </Button>
          </div>
        </div>
      </div>

      <p className="mt-10 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Casal Planner · Feito com carinho para vocês dois.
      </p>
    </section>
  );
}
