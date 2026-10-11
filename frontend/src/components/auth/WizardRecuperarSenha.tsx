import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Mail, KeyRound, Lock, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { recuperarSenhaService } from "@/services/recuperar-senha";
import { ApiError } from "@/lib/api";

type Passo = 1 | 2 | 3;

interface WizardProps {
  initialEmail?: string;
  startStep?: 1 | 2 | 3;
}

export function WizardRecuperarSenha({ initialEmail = "", startStep = 1 }: WizardProps) {
  const navigate = useNavigate();
  const [passo, setPasso] = useState<Passo>(startStep);
  const [email, setEmail] = useState(initialEmail);
  const [codigo, setCodigo] = useState("");
  const [token, setToken] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirma, setConfirma] = useState("");
  const [loading, setLoading] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirma, setMostrarConfirma] = useState(false);

  async function enviarCodigo(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await recuperarSenhaService.esqueciSenha(email);
      toast.success("Se este e-mail existir, enviamos um código.");
      setPasso(2);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Falha ao enviar código");
    } finally {
      setLoading(false);
    }
  }

  async function validar(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await recuperarSenhaService.validarCodigo(email, codigo);
      setToken(res.token);
      setPasso(3);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Código inválido ou expirado");
    } finally {
      setLoading(false);
    }
  }

  async function redefinir(e: React.FormEvent) {
    e.preventDefault();
    if (novaSenha !== confirma) {
      toast.error("As senhas não conferem");
      return;
    }
    setLoading(true);
    try {
      await recuperarSenhaService.redefinirSenha(email, token, novaSenha);
      toast.success("Senha redefinida! Faça login.");
      navigate({ to: "/login" });
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Falha ao redefinir");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-8">
        {[
          { num: 1, label: "E-mail" },
          { num: 2, label: "Código" },
          { num: 3, label: "Senha" },
        ].map((step, idx) => (
          <div key={step.num} className="flex flex-col items-center gap-2 flex-1 relative">
            <div
              className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-semibold z-10 transition-colors ${
                passo >= step.num
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {step.num}
            </div>
            <span
              className={`text-xs font-medium ${passo >= step.num ? "text-foreground" : "text-muted-foreground"}`}
            >
              {step.label}
            </span>
            {idx < 2 && (
              <div className="absolute top-4 left-[60%] w-[80%] h-[2px] -translate-y-1/2 -z-0">
                <div className={`h-full w-full ${passo > step.num ? "bg-primary" : "bg-muted"}`} />
              </div>
            )}
          </div>
        ))}
      </div>

      {passo === 1 && (
        <form
          onSubmit={enviarCodigo}
          className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300"
        >
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-muted/60 border-2 border-border text-sm font-medium text-foreground">
            <Mail className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            <p>
              Informe o endereço de e-mail associado à sua conta para receber um código de
              verificação.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              placeholder="voce@exemplo.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <Button
            type="submit"
            className="w-full h-11 bg-primary hover:bg-primary-hover text-primary-foreground font-bold text-base shadow-[3px_3px_0_var(--border)] border-2 border-border transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
            disabled={loading}
          >
            {loading ? "Enviando..." : "Enviar código"}
          </Button>
        </form>
      )}

      {passo === 2 && (
        <form
          onSubmit={validar}
          className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300"
        >
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-muted/60 border-2 border-border text-sm font-medium text-foreground">
            <KeyRound className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            <p>
              Digite o código numérico de 6 dígitos enviado para{" "}
              <strong className="text-foreground font-bold">{email}</strong>.
            </p>
          </div>
          <div className="flex justify-center">
            <InputOTP maxLength={6} value={codigo} onChange={setCodigo}>
              <InputOTPGroup>
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <InputOTPSlot key={i} index={i} />
                ))}
              </InputOTPGroup>
            </InputOTP>
          </div>
          <Button
            type="submit"
            className="w-full h-11 bg-primary hover:bg-primary-hover text-primary-foreground font-bold text-base shadow-[3px_3px_0_var(--border)] border-2 border-border transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
            disabled={loading || codigo.length < 6}
          >
            {loading ? "Validando..." : "Validar código"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="w-full font-bold text-foreground hover:bg-muted"
            onClick={() => setPasso(1)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Trocar e-mail
          </Button>
        </form>
      )}

      {passo === 3 && (
        <form
          onSubmit={redefinir}
          className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300"
        >
          <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 text-sm text-muted-foreground">
            <Lock className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            <p>Crie uma nova senha segura. Ela deve ter pelo menos 6 caracteres.</p>
          </div>
          <div className="space-y-2">
            <Label>Nova senha</Label>
            <div className="relative">
              <Input
                type={mostrarSenha ? "text" : "password"}
                required
                minLength={6}
                className="pr-10"
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
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
          <div className="space-y-2">
            <Label>Confirme a senha</Label>
            <div className="relative">
              <Input
                type={mostrarConfirma ? "text" : "password"}
                required
                minLength={6}
                className="pr-10"
                value={confirma}
                onChange={(e) => setConfirma(e.target.value)}
              />
              <button
                type="button"
                tabIndex={-1}
                aria-label={mostrarConfirma ? "Ocultar senha" : "Mostrar senha"}
                onClick={() => setMostrarConfirma((v) => !v)}
                className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground transition-colors"
              >
                {mostrarConfirma ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <Button
            type="submit"
            className="w-full h-11 bg-primary hover:bg-primary-hover text-primary-foreground font-bold text-base shadow-[3px_3px_0_var(--border)] border-2 border-border transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
            disabled={loading}
          >
            {loading ? "Salvando..." : "Redefinir senha"}
          </Button>
        </form>
      )}
    </div>
  );
}
