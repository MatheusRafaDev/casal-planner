import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
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
          prompt: () => void;
        };
      };
    };
  }
}

function GoogleLogo({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg
      className={className}
      style={style}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

export function LoginForm({ returnUrl }: { returnUrl?: string }) {
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleReady, setGoogleReady] = useState(false);
  const [googleError, setGoogleError] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const { login, loginComGoogle } = useAuth();
  const navigate = useNavigate();
  const emailInputRef = useRef<HTMLInputElement>(null);
  const senhaInputRef = useRef<HTMLInputElement>(null);

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

  useEffect(() => {
    if (!googleClientId) return;

    let timeoutId: number | undefined;
    let canceled = false;
    let attempts = 0;

    const initGoogle = () => {
      if (!window.google) return;

      try {
        if (!googleInitialized) {
          window.google.accounts.id.initialize({
            client_id: googleClientId,
            callback: handleGoogleCredential,
          });
          googleInitialized = true;
        }
        if (!canceled) setGoogleReady(true);
      } catch {
        // Google GSI falhou (ex: origin não cadastrada no Google Cloud Console).
        // Silencia o erro e esconde o botão do Google.
        if (!canceled) setGoogleError(true);
      }
    };

    const tryInit = () => {
      if (canceled) return;
      if (window.google) {
        initGoogle();
        return;
      }
      if (attempts >= 25) return;
      attempts += 1;
      timeoutId = window.setTimeout(tryInit, 200);
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

    tryInit();

    return () => {
      canceled = true;
      if (timeoutId) window.clearTimeout(timeoutId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [googleClientId]);

  async function handleGoogleCredential(response: { credential: string }) {
    setGoogleLoading(true);
    try {
      await loginComGoogle(response.credential);
      toast.success("Bem-vindo(a)!");
      if (returnUrl) {
        window.location.href = returnUrl;
      } else {
        navigate({ to: "/inicio" });
      }
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Não foi possível entrar com o Google");
    } finally {
      setGoogleLoading(false);
    }
  }

  function handleGoogleClick() {
    if (!window.google || !googleReady) return;
    window.google.accounts.id.prompt();
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const email = emailInputRef.current?.value ?? "";
    const senha = senhaInputRef.current?.value ?? "";
    setLoading(true);
    try {
      await login(email, senha);
      toast.success("Bem-vindo(a) de volta!");
      if (returnUrl) {
        window.location.href = returnUrl;
      } else {
        navigate({ to: "/inicio" });
      }
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
            type={mostrarSenha ? "text" : "password"}
            className="pl-9 pr-10"
            ref={senhaInputRef}
            defaultValue=""
            required
            autoComplete="current-password"
          />
          <button
            type="button"
            tabIndex={-1}
            aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
            onClick={() => setMostrarSenha((v) => !v)}
            className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground transition-colors"
          >
            {mostrarSenha ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>
      <Button type="submit" className="w-full bg-gradient-primary shadow-warm" disabled={loading || googleLoading}>
        {loading ? "Entrando..." : "Entrar"}
      </Button>

      {googleClientId && !googleError && (
        <div className="space-y-3">
          <div className="flex items-center justify-center gap-3 text-xs uppercase text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            <span>ou</span>
            <span className="h-px flex-1 bg-border" />
          </div>
          <button
            id="google-signin-button"
            type="button"
            onClick={handleGoogleClick}
            disabled={!googleReady || googleLoading || loading}
            aria-label="Entrar com Google"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.625rem",
              width: "100%",
              height: "2.75rem",
              borderRadius: "0.75rem",
              border: "1.5px solid var(--border)",
              background: "white",
              color: "#3c4043",
              fontFamily: "Inter, sans-serif",
              fontSize: "0.9rem",
              fontWeight: 500,
              letterSpacing: "0.01em",
              cursor: (!googleReady || googleLoading || loading) ? "not-allowed" : "pointer",
              opacity: (!googleReady || googleLoading || loading) ? 0.6 : 1,
              boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.08), 0 1px 2px -1px rgb(0 0 0 / 0.05)",
              transition: "box-shadow 0.15s ease, transform 0.15s ease, opacity 0.15s ease",
              outline: "none",
              userSelect: "none",
            }}
            onMouseEnter={(e) => {
              if (googleReady && !googleLoading && !loading) {
                e.currentTarget.style.boxShadow = "0 4px 12px 0 rgb(0 0 0 / 0.12), 0 2px 4px -1px rgb(0 0 0 / 0.08)";
                e.currentTarget.style.transform = "translateY(-1px)";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = "0 1px 3px 0 rgb(0 0 0 / 0.08), 0 1px 2px -1px rgb(0 0 0 / 0.05)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 1px 3px 0 rgb(0 0 0 / 0.08)";
            }}
          >
            {googleLoading ? (
              <svg
                className="animate-spin"
                style={{ width: "1.125rem", height: "1.125rem", color: "#4285F4" }}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <GoogleLogo style={{ width: "1.125rem", height: "1.125rem", flexShrink: 0 }} />
            )}
            <span>{googleLoading ? "Entrando..." : "Continuar com Google"}</span>
          </button>
        </div>
      )}
    </form>
  );
}
