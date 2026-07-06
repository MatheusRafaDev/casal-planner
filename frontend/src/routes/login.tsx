import { createFileRoute, Link } from "@tanstack/react-router";
import { AuthShell } from "@/components/auth/AuthShell";
import { LoginForm } from "@/components/auth/LoginForm";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Entrar · Casal Planner" },
      { name: "description", content: "Acesse sua conta do Casal Planner para continuar o planejamento." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  return (
    <AuthShell
      title="Bem-vindos de volta"
      subtitle="Entre para continuar planejando a casa nova."
      backTo="/"
      footer={
        <>
          Ainda não tem conta? <Link to="/login" className="font-semibold text-primary hover:underline">Fale com o time</Link>
        </>
      }
    >
      <LoginForm />
    </AuthShell>
  );
}
