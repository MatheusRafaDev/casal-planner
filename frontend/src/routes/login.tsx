import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Sparkles, Heart, User as UserIcon } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoginForm } from "@/components/auth/LoginForm";
import { RegistroIndividual } from "@/components/auth/RegistroIndividual";
import { RegistroCasal } from "@/components/auth/RegistroCasal";
import { useAuth } from "@/lib/auth-context";
import { z } from "zod";

const searchSchema = z.object({
  registrar: z.union([z.literal(1), z.literal("1"), z.boolean()]).optional(),
});

export const Route = createFileRoute("/login")({
  validateSearch: (s) => searchSchema.parse(s),
  head: () => ({
    meta: [
      { title: "Entrar — Casal Planner" },
      { name: "description", content: "Acesse sua conta do Casal Planner." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const search = Route.useSearch();
  const [modo, setModo] = useState<"entrar" | "cadastrar">(
    search.registrar ? "cadastrar" : "entrar",
  );

  useEffect(() => {
    if (!loading && isAuthenticated) navigate({ to: "/inicio" });
  }, [loading, isAuthenticated, navigate]);

  return (
    <div className="min-h-screen grid md:grid-cols-2 bg-background">
      {/* Lado ilustrativo */}
      <div className="hidden md:flex relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero" />
        <div className="relative z-10 p-12 flex flex-col justify-between w-full">
          <Link to="/" className="flex items-center gap-2">
            <span className="grid place-items-center h-9 w-9 rounded-lg bg-gradient-primary text-primary-foreground shadow-soft">
              <Sparkles className="h-5 w-5" />
            </span>
            <span className="font-display text-lg font-semibold">Casal Planner</span>
          </Link>
          <div className="max-w-md space-y-4">
            <h2 className="font-display text-4xl font-semibold leading-tight">
              Planeje o enxoval juntos, sem susto no cartão.
            </h2>
            <p className="text-muted-foreground">
              Cômodos, orçamento em VR/dinheiro, comparativo de preços com IA. Tudo pensado para
              casais e pra você.
            </p>
          </div>
          <div className="text-sm text-muted-foreground">
            Feito com <Heart className="inline h-3.5 w-3.5 text-terracota" /> para começar a vida a
            dois.
          </div>
        </div>
      </div>

      {/* Lado do formulário */}
      <div className="flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md space-y-6">
          <div className="md:hidden flex items-center gap-2">
            <span className="grid place-items-center h-9 w-9 rounded-lg bg-gradient-primary text-primary-foreground shadow-soft">
              <Sparkles className="h-5 w-5" />
            </span>
            <span className="font-display text-lg font-semibold">Casal Planner</span>
          </div>

          <div>
            <h1 className="font-display text-3xl font-semibold">
              {modo === "entrar" ? "Bem-vindo(a) de volta" : "Crie sua conta"}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {modo === "entrar"
                ? "Entre com seu e-mail e senha."
                : "Escolha se é uma conta individual ou de casal."}
            </p>
          </div>

          {modo === "entrar" ? (
            <>
              <LoginForm />
              <p className="text-sm text-center text-muted-foreground">
                Ainda não tem conta?{" "}
                <button
                  className="text-primary font-medium hover:underline"
                  onClick={() => setModo("cadastrar")}
                >
                  Cadastre-se
                </button>
              </p>
            </>
          ) : (
            <>
              <Tabs defaultValue="individual">
                <TabsList className="grid grid-cols-2 w-full">
                  <TabsTrigger value="individual">
                    <UserIcon className="h-4 w-4 mr-2" /> Individual
                  </TabsTrigger>
                  <TabsTrigger value="casal">
                    <Heart className="h-4 w-4 mr-2" /> Casal
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="individual" className="pt-4">
                  <RegistroIndividual />
                </TabsContent>
                <TabsContent value="casal" className="pt-4">
                  <RegistroCasal />
                </TabsContent>
              </Tabs>
              <p className="text-sm text-center text-muted-foreground">
                Já tem conta?{" "}
                <button
                  className="text-primary font-medium hover:underline"
                  onClick={() => setModo("entrar")}
                >
                  Entrar
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
