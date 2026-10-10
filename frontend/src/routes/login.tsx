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
    <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-muted/10 selection:bg-primary/20">
      <div className="w-full max-w-[420px] bg-card rounded-2xl border shadow-sm p-6 sm:p-10">
        <div className="flex flex-col items-center text-center space-y-6 mb-8">
          <Link to="/" className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-primary/10 mb-2">
            <Heart className="h-6 w-6 text-primary" />
          </Link>
          <div className="space-y-2">
            <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
              {modo === "entrar" ? "Acesse sua conta" : "Criar uma conta"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {modo === "entrar"
                ? "Bem-vindo de volta ao CasalPlanner."
                : "Como você deseja utilizar o planejador?"}
            </p>
          </div>
        </div>

        {modo === "entrar" ? (
          <div className="space-y-6">
            <LoginForm returnUrl={returnUrl} />
            <div className="text-center pt-2">
              <p className="text-sm text-muted-foreground">
                Não tem uma conta?{" "}
                <button
                  className="font-medium text-primary hover:underline hover:text-primary/90 transition-colors"
                  onClick={() => setModo("cadastrar")}
                >
                  Cadastre-se
                </button>
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <Tabs defaultValue="individual" className="w-full">
              <TabsList className="grid grid-cols-2 w-full h-11 bg-muted/50 rounded-lg p-1 mb-6">
                <TabsTrigger value="individual" className="rounded-md text-sm font-medium">
                  <UserIcon className="h-4 w-4 mr-2" /> Sozinho
                </TabsTrigger>
                <TabsTrigger value="casal" className="rounded-md text-sm font-medium">
                  <Heart className="h-4 w-4 mr-2" /> Em casal
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="individual" className="m-0 focus-visible:outline-none animate-in fade-in zoom-in-95 duration-300">
                <RegistroIndividual returnUrl={returnUrl} />
              </TabsContent>
              <TabsContent value="casal" className="m-0 focus-visible:outline-none animate-in fade-in zoom-in-95 duration-300">
                <RegistroCasal />
              </TabsContent>
            </Tabs>

            <div className="text-center pt-2 border-t mt-6">
              <p className="text-sm text-muted-foreground pt-6">
                Já tem uma conta?{" "}
                <button
                  className="font-medium text-primary hover:underline hover:text-primary/90 transition-colors"
                  onClick={() => setModo("entrar")}
                >
                  Entrar
                </button>
              </p>
            </div>
          </div>
        )}
      </div>
      <div className="mt-8 text-center text-sm text-muted-foreground">
        CasalPlanner © {new Date().getFullYear()}
      </div>
    </div>
  );
}
