import { createFileRoute, Link } from "@tanstack/react-router";
import { Sparkles, ArrowLeft } from "lucide-react";
import { WizardRecuperarSenha } from "@/components/auth/WizardRecuperarSenha";

export const Route = createFileRoute("/recuperar-senha")({
  head: () => ({
    meta: [
      { title: "Recuperar senha — Casal Planner" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: RecuperarPage,
});

function RecuperarPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6">
        <div className="flex items-center gap-2">
          <span className="grid place-items-center h-9 w-9 rounded-lg bg-gradient-primary text-primary-foreground shadow-soft">
            <Sparkles className="h-5 w-5" />
          </span>
          <span className="font-display text-lg font-semibold">Casal Planner</span>
        </div>

        <div>
          <h1 className="font-display text-3xl font-semibold">Recuperar senha</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Em 3 passos você volta a ter acesso à sua conta.
          </p>
        </div>

        <div className="p-6 rounded-2xl border bg-card shadow-soft">
          <WizardRecuperarSenha />
        </div>

        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar ao login
        </Link>
      </div>
    </div>
  );
}
