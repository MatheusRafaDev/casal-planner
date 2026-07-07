import { useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { recuperarSenhaService } from "@/services/recuperarSenhaService.ts";

type Step = "email" | "codigo" | "senha" | "done";

export function RecoverForm() {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [codigo, setCodigo] = useState("");
  const [token, setToken] = useState("");
  const [senha, setSenha] = useState("");
  const [confirma, setConfirma] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submitEmail(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await recuperarSenhaService.solicitarCodigo(email);
    setLoading(false);
    if (res.success) {
      toast.success(res.message ?? "Código enviado");
      setStep("codigo");
    } else setError(res.message ?? "Erro");
  }

  async function submitCodigo(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await recuperarSenhaService.validarCodigo(email, codigo);
    setLoading(false);
    if (res.success) {
      setToken((res.data as { token?: string })?.token ?? codigo);
      setStep("senha");
    } else setError(res.message ?? "Código inválido");
  }

  async function submitSenha(e: FormEvent) {
    e.preventDefault();
    if (senha !== confirma) {
      setError("As senhas não conferem");
      return;
    }
    setLoading(true);
    setError(null);
    const res = await recuperarSenhaService.redefinirSenha(email, token, senha);
    setLoading(false);
    if (res.success) {
      toast.success("Senha redefinida com sucesso");
      setStep("done");
    } else setError(res.message ?? "Erro ao redefinir");
  }

  if (step === "done") {
    return (
      <div className="space-y-4 text-center">
        <p className="text-sm text-muted-foreground">
          Pronto! Agora é só entrar com sua nova senha.
        </p>
        <Button
          asChild
          className="h-12 w-full rounded-xl bg-gradient-brand text-primary-foreground"
        >
          <a href="/login">Ir para o login</a>
        </Button>
      </div>
    );
  }

  return (
    <>
      <StepBadge step={step} />
      {step === "email" && (
        <form onSubmit={submitEmail} className="mt-6 space-y-5">
          <Field label="Email">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="voces@exemplo.com"
              className="h-12 rounded-xl"
              required
            />
          </Field>
          {error && <ErrorBox message={error} />}
          <SubmitButton loading={loading}>Enviar código</SubmitButton>
        </form>
      )}
      {step === "codigo" && (
        <form onSubmit={submitCodigo} className="mt-6 space-y-5">
          <Field label="Código recebido por email">
            <Input
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              placeholder="Digite o código"
              className="h-12 rounded-xl tracking-widest"
              required
            />
          </Field>
          {error && <ErrorBox message={error} />}
          <SubmitButton loading={loading}>Validar código</SubmitButton>
        </form>
      )}
      {step === "senha" && (
        <form onSubmit={submitSenha} className="mt-6 space-y-5">
          <Field label="Nova senha">
            <Input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="h-12 rounded-xl"
              required
            />
          </Field>
          <Field label="Confirmar nova senha">
            <Input
              type="password"
              value={confirma}
              onChange={(e) => setConfirma(e.target.value)}
              className="h-12 rounded-xl"
              required
            />
          </Field>
          {error && <ErrorBox message={error} />}
          <SubmitButton loading={loading}>Redefinir senha</SubmitButton>
        </form>
      )}
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function ErrorBox({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
      {message}
    </div>
  );
}

function SubmitButton({ children, loading }: { children: React.ReactNode; loading: boolean }) {
  return (
    <Button
      type="submit"
      disabled={loading}
      className="h-12 w-full rounded-xl bg-gradient-brand text-base font-semibold text-primary-foreground shadow-[var(--shadow-glow)] hover:brightness-105"
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : children}
    </Button>
  );
}

function StepBadge({ step }: { step: Step }) {
  const map: Record<Exclude<Step, "done">, { n: number; label: string }> = {
    email: { n: 1, label: "Informe seu email" },
    codigo: { n: 2, label: "Valide o código" },
    senha: { n: 3, label: "Crie uma nova senha" },
  };
  const cur = map[step as Exclude<Step, "done">];
  return (
    <div className="flex items-center gap-3">
      <span className="bg-gradient-brand grid h-9 w-9 place-items-center rounded-full text-sm font-bold text-primary-foreground">
        {cur.n}
      </span>
      <p className="text-sm font-medium">
        {cur.label} <span className="text-muted-foreground">· etapa {cur.n} de 3</span>
      </p>
    </div>
  );
}
