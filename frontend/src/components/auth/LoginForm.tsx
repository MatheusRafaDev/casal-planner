import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Mail, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/api";

let googleInitialized = false;

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
            options: {
              theme: string;
              size: string;
              type?: string;
              text?: string;
              shape?: string;
              logo_alignment?: string;
              width?: number | string;
            }
          ) => void;
        };
      };
    };
  }
}

export function LoginForm() {
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { login, loginComGoogle } = useAuth();
  const navigate = useNavigate();
  const googleBtnRef = useRef<HTMLDivElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const senhaInputRef = useRef<HTMLInputElement>(null);

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

  useEffect(() => {
    if (!googleClientId || !googleBtnRef.current) return;

    let timeoutId: number | undefined;
    let canceled = false;
    let attempts = 0;

    const renderGoogleButton = () => {
      if (!window.google || !googleBtnRef.current) return;

      if (!googleInitialized) {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: handleGoogleCredential,
        });
        googleInitialized = true;
      }

      window.google.accounts.id.renderButton(googleBtnRef.current, {
        theme: "filled_blue",
        size: "large",
        type: "standard",
        text: "signin_with",
        shape: "rectangular",
        logo_alignment: "left",
        width: 280,
      });
    };

    const tryRender = () => {
      if (canceled) return;
      if (window.google) {
        renderGoogleButton();
        return;
      }

      if (attempts >= 25) return;
      attempts += 1;
      timeoutId = window.setTimeout(tryRender, 200);
    };

    if (!window.google) {
      const existingScript = document.getElementById("google-client-script") as HTMLScriptElement | null;
      if (!existingScript) {
        const scriptElement = document.createElement("script");
        scriptElement.id = "google-client-script";
        scriptElement.src = "https://accounts.google.com/gsi/client";
        scriptElement.async = true;
        scriptElement.defer = true;
        document.head.appendChild(scriptElement);
      }
    }

    tryRender();

    return () => {
      canceled = true;
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };
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
    const email = emailInputRef.current?.value ?? "";
    const senha = senhaInputRef.current?.value ?? "";
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
    <form onSubmit={submit} className="space-y-4" autoComplete="on" suppressHydrationWarning>
      <div className="space-y-2">
        <Label htmlFor="email">E-mail</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            id="email"
            name="email"
            type="email"
            className="pl-9"
            ref={emailInputRef}
            defaultValue=""
            placeholder="voce@exemplo.com"
            required
            autoComplete="username"
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
            name="password"
            type="password"
            className="pl-9"
            ref={senhaInputRef}
            defaultValue=""
            required
            autoComplete="current-password"
          />
        </div>
      </div>
      <Button type="submit" className="w-full bg-gradient-primary shadow-warm" disabled={loading || googleLoading}>
        {loading ? "Entrando..." : "Entrar"}
      </Button>

      {googleClientId && (
        <div className="space-y-3">
          <div className="flex items-center justify-center gap-3 text-xs uppercase text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            <span>ou</span>
            <span className="h-px flex-1 bg-border" />
          </div>
          <div className="flex justify-center">
            <div className="w-full max-w-[320px] rounded-2xl border border-border bg-white shadow-sm">
              <div
                id="google-signin-button"
                ref={googleBtnRef}
                className="min-h-[48px]"
                aria-label="Entrar com Google"
              />
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
