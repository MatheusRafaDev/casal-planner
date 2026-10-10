import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { WizardRecuperarSenha } from "@/components/auth/WizardRecuperarSenha";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/trocar-senha")({
  head: () => ({
    meta: [{ title: "CasalPlanner - Trocar senha" }, { name: "robots", content: "noindex" }],
  }),
  component: TrocarSenhaPage,
});

function TrocarSenhaPage() {
  const { usuario } = useAuth();
  const email = usuario?.email ?? usuario?.casalInfo?.pessoa1?.email ?? "";

  return (
    <div className="min-h-screen bg-muted/10 relative flex flex-col items-center justify-center p-4 selection:bg-primary/20">
      <div className="w-full max-w-[420px] bg-card rounded-2xl border shadow-sm p-6 sm:p-10">
        <div className="flex flex-col items-center text-center space-y-6 mb-8">
          <Link to="/" className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-primary/10 mb-2">
            <img src="/logo.png" alt="CasalPlanner" className="h-6 w-6 rounded-sm opacity-90" />
          </Link>
          <div className="space-y-2">
            <h1 className="font-display text-2xl font-semibold tracking-tight">Segurança e senha</h1>
            <p className="text-sm text-muted-foreground">
              Para sua segurança, enviaremos um código por e-mail para você redefinir sua senha.
            </p>
          </div>
        </div>

        <WizardRecuperarSenha initialEmail={email} startStep={1} />

        <div className="mt-8 text-center border-t pt-6">
          <Link
            to="/perfil"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Voltar para o perfil
          </Link>
        </div>
      </div>
      <div className="mt-8 text-center text-sm text-muted-foreground">
        CasalPlanner © {new Date().getFullYear()}
      </div>
    </div>
  );
}
