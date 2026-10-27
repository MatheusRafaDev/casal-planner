import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { WizardRecuperarSenha } from "@/components/auth/WizardRecuperarSenha";
import { useAuth } from "@/lib/auth-context";
import { BrandLogoText, BrandLogoIcon } from "@/components/ui/BrandLogo";
import { BRAND_CONFIG } from "@/design-system";

export const Route = createFileRoute("/trocar-senha")({
  head: () => ({
    meta: [{ title: "CasalPlanner | Trocar senha" }, { name: "robots", content: "noindex" }],
  }),
  component: TrocarSenhaPage,
});

function TrocarSenhaPage() {
  const { usuario } = useAuth();
  const email = usuario?.email ?? usuario?.casalInfo?.pessoa1?.email ?? "";

  return (
    <div className="min-h-screen bg-background relative flex flex-col items-center justify-center p-4 selection:bg-gold/30 font-sans">
      <div className="card-sticker-lg w-full max-w-[420px] bg-card p-6 sm:p-10 shadow-[5px_5px_0_var(--border)]">
        <div className="flex flex-col items-center text-center space-y-4 mb-8">
          <Link to="/" className="mb-2 inline-flex items-center justify-center gap-3">
            <BrandLogoIcon size="lg" className="h-9 w-9" />
            <BrandLogoText size="lg" />
          </Link>
          <div className="space-y-2">
            <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
              Segurança e senha
            </h1>
            <p className="text-sm text-muted-foreground font-medium">
              Para sua segurança, enviaremos um código por e-mail para você redefinir sua senha.
            </p>
          </div>
        </div>

        <WizardRecuperarSenha initialEmail={email} startStep={1} />

        <div className="mt-8 text-center border-t-2 border-border/20 pt-6">
          <Link
            to="/perfil"
            className="inline-flex items-center gap-2 text-sm font-bold text-foreground/80 hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Voltar para o perfil
          </Link>
        </div>
      </div>
      <div className="mt-8 text-center text-xs font-semibold text-muted-foreground">
        {BRAND_CONFIG.name} © {new Date().getFullYear()}
      </div>
    </div>
  );
}
