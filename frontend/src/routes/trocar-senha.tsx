import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { WizardRecuperarSenha } from "@/components/auth/WizardRecuperarSenha";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/trocar-senha")({
  head: () => ({
    meta: [{ title: "Trocar senha — Casal Planner" }, { name: "robots", content: "noindex" }],
  }),
  component: TrocarSenhaPage,
});

function TrocarSenhaPage() {
  const { usuario } = useAuth();
  const email = usuario?.email ?? usuario?.casalInfo?.pessoa1?.email ?? "";

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="Casal Planner" className="h-9 w-9 rounded-lg" />
          <span className="font-display text-lg font-semibold">Casal Planner</span>
        </div>

        <div>
          <h1 className="font-display text-3xl font-semibold">Segurança e senha</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Para sua segurança, enviaremos um link por e-mail para você redefinir sua senha. O
            processo é idêntico ao "Esqueci minha senha" — sem precisar informar a senha atual.
          </p>
        </div>

        <div className="p-6 rounded-2xl border bg-card shadow-soft">
          <WizardRecuperarSenha initialEmail={email} startStep={1} />
        </div>

        <Link
          to="/perfil"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Link>
      </div>
    </div>
  );
}
