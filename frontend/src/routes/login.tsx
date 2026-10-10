import { createFileRoute, Link, useNavigate, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Heart, User as UserIcon } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoginForm } from "@/components/auth/LoginForm";
import { RegistroIndividual } from "@/components/auth/RegistroIndividual";
import { RegistroCasal } from "@/components/auth/RegistroCasal";
import { useAuth } from "@/lib/auth-context";
import { z } from "zod";

const searchSchema = z.object({
  registrar: z.union([z.literal(1), z.literal("1"), z.boolean()]).optional(),
  returnUrl: z.string().optional(),
});

export const Route = createFileRoute("/login")({
  validateSearch: (s) => searchSchema.parse(s),
  head: () => ({
    meta: [
      { title: "CasalPlanner - Entrar" },
      { name: "description", content: "Acesse sua conta do CasalPlanner." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const router = useRouter();
  const search = Route.useSearch();
  const [modo, setModo] = useState<"entrar" | "cadastrar">(
    search.registrar ? "cadastrar" : "entrar",
  );

  const returnUrl = search.returnUrl;

  useEffect(() => {
    if (!loading && isAuthenticated) {
      if (returnUrl && returnUrl.startsWith("/") && !returnUrl.startsWith("//")) {
        router.history.push(returnUrl);
      } else {
        navigate({ to: "/inicio" });
      }
    }
  }, [loading, isAuthenticated, navigate, router.history, returnUrl]);

  return (
    <div className="min-h-screen grid md:grid-cols-2 bg-background">
      {/* Lado do formulário */}
      <div className="flex flex-col justify-center p-6 sm:p-12 md:p-16 lg:p-24 md:order-first border-r border-border/40 bg-card">
        <div className="w-full max-w-[380px] mx-auto space-y-8">
          <Link to="/" className="flex items-center gap-2 w-fit">
            <img src="/logo.png" alt="CasalPlanner" className="h-8 w-8 rounded-md" />
            <span className="font-display text-xl font-semibold tracking-tight">CasalPlanner</span>
          </Link>

          <div className="space-y-2">
            <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
              {modo === "entrar" ? "Bem-vindo(a) de volta" : "Crie sua conta"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {modo === "entrar"
                ? "Entre com seu e-mail e senha."
                : "Escolha se é uma conta individual ou de casal."}
            </p>
          </div>

          {modo === "entrar" ? (
            <div className="space-y-6">
              <LoginForm returnUrl={returnUrl} />
              <p className="text-sm text-center text-muted-foreground">
                Ainda não tem conta?{" "}
                <button
                  className="text-primary font-medium hover:text-primary/80 transition-colors"
                  onClick={() => setModo("cadastrar")}
                >
                  Cadastre-se
                </button>
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <Tabs defaultValue="individual" className="w-full">
                <TabsList className="grid grid-cols-2 w-full h-10 bg-muted/50 rounded-lg p-1">
                  <TabsTrigger value="individual" className="rounded-md text-sm">
                    <UserIcon className="h-3.5 w-3.5 mr-2" /> Individual
                  </TabsTrigger>
                  <TabsTrigger value="casal" className="rounded-md text-sm">
                    <Heart className="h-3.5 w-3.5 mr-2" /> Casal
                  </TabsTrigger>
                </TabsList>
                <div className="mt-6">
                  <TabsContent value="individual" className="m-0 focus-visible:outline-none">
                    <RegistroIndividual returnUrl={returnUrl} />
                  </TabsContent>
                  <TabsContent value="casal" className="m-0 focus-visible:outline-none">
                    <RegistroCasal />
                  </TabsContent>
                </div>
              </Tabs>
              <p className="text-sm text-center text-muted-foreground">
                Já tem conta?{" "}
                <button
                  className="text-primary font-medium hover:text-primary/80 transition-colors"
                  onClick={() => setModo("entrar")}
                >
                  Entrar
                </button>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Lado ilustrativo */}
      <div className="hidden md:flex flex-col justify-between p-12 lg:p-24 md:order-last bg-muted/20">
        <div className="flex-1 flex flex-col justify-center max-w-lg mx-auto space-y-6">
          <h2 className="font-display text-4xl lg:text-5xl font-semibold leading-[1.1] tracking-tight text-foreground">
            Planeje o enxoval juntos, sem susto no cartão.
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Cômodos, orçamento, e comparativo de preços com IA. Tudo pensado para casais organizarem a vida a dois com tranquilidade.
          </p>
        </div>
        <div className="text-sm text-muted-foreground font-medium text-center">
          Feito com <Heart className="inline h-3.5 w-3.5 text-terracota mx-0.5" /> para começar a vida a dois
        </div>
      </div>
    </div>
  );
}
