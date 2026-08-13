import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { CheckCircle, Loader2 } from "lucide-react";
import { conviteService } from "@/services/convite";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { Checkbox } from "@/components/ui/checkbox";

export const Route = createFileRoute("/convite")({
  component: ConvitePage,
});

function ConvitePage() {
  const navigate = useNavigate();
  const search = useSearch({ from: "/convite" });
  const token = (search as { token?: string }).token;

  const { isAuthenticated, refresh } = useAuth();

  const [aceito, setAceito] = useState(false);
  const [migrarDados, setMigrarDados] = useState(false);

  // Fetch info about who sent the invite
  const { data: infoConvite, isLoading: infoLoading, error: infoError } = useQuery({
    queryKey: ["convite", token],
    queryFn: () => conviteService.obterInfo(token!),
    enabled: !!token,
    retry: false
  });

  const aceitarMutation = useMutation({
    mutationFn: () => conviteService.aceitar({ token: token ?? "", migrarDados }),
    onSuccess: async () => {
      setAceito(true);
      await refresh();
      toast.success("Contas vinculadas com sucesso!");
      setTimeout(() => navigate({ to: "/" }), 2000);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-4">
          <h1 className="font-display text-2xl font-semibold">Convite inválido</h1>
          <p className="text-muted-foreground">O link de convite está incompleto.</p>
          <Button onClick={() => navigate({ to: "/login" })}>Ir para login</Button>
        </div>
      </div>
    );
  }

  if (infoError) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-4">
          <h1 className="font-display text-2xl font-semibold text-red-500">Convite inválido</h1>
          <p className="text-muted-foreground">O convite pode ter expirado ou não existe.</p>
          <Button onClick={() => navigate({ to: "/login" })}>Voltar ao Início</Button>
        </div>
      </div>
    );
  }

  if (infoLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (aceito) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="grid place-items-center h-20 w-20 rounded-full bg-green-500/10 mx-auto">
            <CheckCircle className="h-10 w-10 text-green-500" />
          </div>
          <div className="space-y-2">
            <h1 className="font-display text-2xl font-semibold">Tudo pronto!</h1>
            <p className="text-muted-foreground">
              Suas contas foram vinculadas com sucesso.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="space-y-2">
          <h1 className="font-display text-2xl font-semibold">Você foi convidado!</h1>
          <p className="text-muted-foreground text-lg">
            <span className="font-semibold text-foreground">{infoConvite?.nomeConvidante}</span> quer compartilhar o planejamento com você.
          </p>
        </div>

        {!isAuthenticated ? (
          <div className="space-y-4 bg-muted/30 p-6 rounded-lg border border-border">
            <p className="text-sm">Para aceitar o convite, faça login ou crie uma conta usando o email <strong>{infoConvite?.emailConvidante}</strong>.</p>
            <div className="flex flex-col gap-3">
              <Button onClick={() => navigate({ to: "/login", search: { returnUrl: `/convite?token=${token}` } })} className="w-full">
                Fazer Login
              </Button>
              <Button variant="outline" onClick={() => navigate({ to: "/login", search: { registrar: 1, returnUrl: `/convite?token=${token}` } })} className="w-full">
                Criar Nova Conta
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6 text-left">
            <div className="bg-primary/5 p-4 rounded-lg border border-primary/20 space-y-4">
              <p className="text-sm text-center">Como você já está logado, as contas serão vinculadas imediatamente.</p>
              
              <div className="flex items-start space-x-3 mt-4">
                <Checkbox 
                  id="migrar" 
                  checked={migrarDados} 
                  onCheckedChange={(c) => setMigrarDados(c === true)} 
                />
                <div className="space-y-1 leading-none">
                  <label
                    htmlFor="migrar"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    Migrar meus itens atuais
                  </label>
                  <p className="text-xs text-muted-foreground mt-2">
                    Todos os itens do seu enxoval individual serão movidos para a conta de casal. Sua conta individual atual será substituída.
                  </p>
                </div>
              </div>
            </div>

            <Button
              onClick={() => aceitarMutation.mutate()}
              disabled={aceitarMutation.isPending}
              className="w-full"
              size="lg"
            >
              {aceitarMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Vinculando contas...
                </>
              ) : (
                "Vincular Contas"
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
