import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { WizardRecuperarSenha } from "@/components/auth/WizardRecuperarSenha";
import { BrandLogoIcon } from "@/components/ui/BrandLogo";

export const Route = createFileRoute("/recuperar-senha")({
  validateSearch: (search: Record<string, unknown>): { email?: string; step?: 1 | 2 | 3 } => {
    return {
      email: search.email as string | undefined,
      step: search.step ? (Number(search.step) as 1 | 2 | 3) : 1,
    };
  },
  head: () => ({
    meta: [{ title: "CasalPlanner - Recuperar senha" }, { name: "robots", content: "noindex" }],
  }),
  component: RecuperarPage,
});

function RecuperarPage() {
  const search = Route.useSearch();
  return (
    <div className="min-h-screen bg-background relative flex flex-col items-center justify-center p-4 selection:bg-gold/30 font-sans">
      <div className="card-sticker-lg w-full max-w-[420px] bg-card p-6 sm:p-10 shadow-[5px_5px_0_var(--border)]">
        <div className="flex flex-col items-center text-center space-y-4 mb-8">
          <Link
            to="/"
            className="inline-flex items-center justify-center h-14 w-14 rounded-2xl border-2 border-border bg-[#FFFDF8] dark:bg-[#1E2621] text-[#24302A] shadow-[3px_3px_0_var(--border)] mb-2 hover:scale-105 transition-transform"
          >
            <BrandLogoIcon className="h-9 w-9" />
          </Link>
          <div className="space-y-2">
            <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
              Recuperar senha
            </h1>
            <p className="text-sm text-foreground/80 dark:text-[#b4c4ba] font-medium">
              Siga os passos abaixo para recuperar seu acesso.
            </p>
          </div>
        </div>

        <WizardRecuperarSenha initialEmail={search.email} startStep={search.step} />

        <div className="mt-8 text-center border-t-2 border-border/20 pt-6">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-sm font-bold text-foreground/80 hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Voltar para o login
          </Link>
        </div>
      </div>
      <div className="mt-8 text-center text-xs font-semibold text-foreground/75 dark:text-[#9fb0a6]">
        CasalPlanner © {new Date().getFullYear()}
      </div>
    </div>
  );
}
