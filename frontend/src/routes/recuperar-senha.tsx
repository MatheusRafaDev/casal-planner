import { createFileRoute } from "@tanstack/react-router";
import { AuthShell } from "@/components/auth/AuthShell";
import { RecoverForm } from "@/components/auth/RecoverForm";

export const Route = createFileRoute("/recuperar-senha")({
  head: () => ({
    meta: [
      { title: "Recuperar senha · Casal Planner" },
      { name: "description", content: "Recupere o acesso à sua conta do Casal Planner." },
    ],
  }),
  component: RecuperarSenhaPage,
});

function RecuperarSenhaPage() {
  return (
    <AuthShell
      title="Recuperar senha"
      subtitle="A gente envia um código para o seu email para você criar uma nova."
      backTo="/login"
    >
      <RecoverForm />
    </AuthShell>
  );
}
