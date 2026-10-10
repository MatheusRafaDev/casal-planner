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
      <div className="flex items-center gap-3">
        {[1, 2, 3].map((n) => (
          <div key={n} className="flex items-center gap-2 flex-1">
            <div
              className={`h-8 w-8 rounded-full grid place-items-center text-sm font-semibold ${
                passo >= n
                  ? "bg-gradient-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {n}
            </div>
            {n < 3 && <div className={`h-0.5 flex-1 ${passo > n ? "bg-primary" : "bg-muted"}`} />}
          </div>
        ))}
      </div>

      {passo === 1 && (
        <form onSubmit={enviarCodigo} className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Mail className="h-4 w-4" /> Informe o e-mail cadastrado
          </div>
          <div className="space-y-2">
            <Label>E-mail</Label>
            <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <Button className="w-full bg-gradient-primary" disabled={loading}>
            {loading ? "Enviando..." : "Enviar código"}
          </Button>
        </form>
      )}

      {passo === 2 && (
        <form onSubmit={validar} className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <KeyRound className="h-4 w-4" /> Digite o código de 6 dígitos enviado para{" "}
            <strong className="text-foreground">{email}</strong>
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
          <Button className="w-full bg-gradient-primary" disabled={loading || codigo.length < 6}>
            {loading ? "Validando..." : "Validar código"}
          </Button>
          <Button type="button" variant="ghost" className="w-full" onClick={() => setPasso(1)}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Trocar e-mail
          </Button>
        </form>
      )}

      {passo === 3 && (
        <form onSubmit={redefinir} className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Lock className="h-4 w-4" /> Defina sua nova senha
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
          <Button className="w-full bg-gradient-primary" disabled={loading}>
            {loading ? "Salvando..." : "Redefinir senha"}
          </Button>
        </form>
      )}
    </div>
  );
}
