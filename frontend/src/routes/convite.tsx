import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { CheckCircle, Loader2 } from "lucide-react";
import { conviteService } from "@/services/convite";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/convite")({
  component: ConvitePage,
});

function ConvitePage() {
  const navigate = useNavigate();
  const search = useSearch({ from: "/convite" });
  const token = (search as { token?: string }).token;

  const [aceito, setAceito] = useState(false);

  const aceitarMutation = useMutation({
    mutationFn: () => conviteService.aceitar({ token: token ?? "" }),
    onSuccess: () => {
      setAceito(true);
      toast.success("Convite aceito! Agora você pode criar sua conta.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-4">
          <h1 className="font-display text-2xl font-semibold">Convite inválido</h1>
          <p className="text-muted-foreground">O link de convite está incompleto ou expirou.</p>
          <Button onClick={() => navigate({ to: "/login" })}>Ir para login</Button>
        </div>
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
            <h1 className="font-display text-2xl font-semibold">Convite aceito!</h1>
            <p className="text-muted-foreground">
              Agora você pode criar sua conta usando o email do convite.
            </p>
          </div>
          <Button onClick={() => navigate({ to: "/login" })} className="w-full">
            Criar minha conta
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="space-y-2">
          <h1 className="font-display text-2xl font-semibold">Você foi convidado!</h1>
          <p className="text-muted-foreground">
            Alguém quer que você seja parceiro no CasalPlanner.
          </p>
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
              Processando...
            </>
          ) : (
            "Aceitar convite"
          )}
        </Button>
        <p className="text-xs text-muted-foreground">
          Ao aceitar, você poderá criar sua conta com o email do convite.
        </p>
      </div>
    </div>
  );
}
