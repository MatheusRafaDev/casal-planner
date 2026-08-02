import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Mail, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/api";

// Tipagem mínima para o Google Identity Services SDK
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
          }) => void;
          renderButton: (
            element: HTMLElement,
            options: { theme: string; size: string; width: string }
          ) => void;
        };
      };
    };
  }
}

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { login, loginComGoogle } = useAuth();
  const navigate = useNavigate();
  const googleBtnRef = useRef<HTMLDivElement>(null);

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

  useEffect(() => {
    if (!googleClientId || !window.google || !googleBtnRef.current) return;

    window.google.accounts.id.initialize({
      client_id: googleClientId,
      callback: handleGoogleCredential,
    });

    window.google.accounts.id.renderButton(googleBtnRef.current, {
      theme: "outline",
      size: "large",
      width: "100%",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [googleClientId]);

  async function handleGoogleCredential(response: { credential: string }) {
    setGoogleLoading(true);
    try {
      await loginComGoogle(response.credential);
      toast.success("Bem-vindo(a)!");
      navigate({ to: "/inicio" });
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Não foi possível entrar com o Google");
    } finally {
      setGoogleLoading(false);
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, senha);
      toast.success("Bem-vindo(a) de volta!");
      navigate({ to: "/inicio" });
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Não foi possível entrar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">E-mail</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            id="email"
            type="email"
            className="pl-9"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="voce@exemplo.com"
            required
            autoComplete="email"
          />
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="senha">Senha</Label>
          <Link to="/recuperar-senha" className="text-xs text-primary hover:underline">
            Esqueci minha senha
          </Link>
        </div>
        <div className="relative">
          <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            id="senha"
            type="password"
            className="pl-9"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
            autoComplete="current-password"
          />
        </div>
      </div>
      <Button type="submit" className="w-full bg-gradient-primary shadow-warm" disabled={loading || googleLoading}>
        {loading ? "Entrando..." : "Entrar"}
      </Button>

      {googleClientId && (
        <>
          <div className="relative my-2">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">ou</span>
            </div>
          </div>

          {/* O SDK do Google renderiza o botão aqui */}
          <div
            id="google-signin-button"
            ref={googleBtnRef}
            className="flex justify-center min-h-[44px]"
            aria-label="Entrar com Google"
          />
        </>
      )}
    </form>
  );
}
