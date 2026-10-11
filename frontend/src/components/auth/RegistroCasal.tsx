import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Heart, User as UserIcon, Mail, Lock, Calendar, Target, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usuarioService } from "@/services/usuario";
import { ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { maskDate, brToIsoDate } from "@/lib/formatters";
import { CurrencyInput } from "@/components/ui/currency-input";
import { cn } from "@/lib/utils";

interface PessoaForm {
  nome: string;
  email: string;
  senha: string;
  dataNascimento: string;
}

const emptyPessoa = (): PessoaForm => ({
  nome: "",
  email: "",
  senha: "",
  dataNascimento: "",
});

function PessoaFields({
  value,
  onChange,
  label,
  numero,
}: {
  value: PessoaForm;
  onChange: (v: PessoaForm) => void;
  label: string;
  numero: 1 | 2;
}) {
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const isP1 = numero === 1;

  return (
    <div className="space-y-4 pt-4 border-t first:border-0 first:pt-0">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 font-bold text-sm text-foreground">
          <div
            className={cn(
              "h-7 w-7 rounded-lg border-2 border-border flex items-center justify-center shrink-0 shadow-xs",
              isP1
                ? "bg-[#2F7D5B] text-white"
                : "bg-[#E8B63C] text-[#24302A]",
            )}
          >
            <Heart className={cn("h-3.5 w-3.5", isP1 ? "fill-white" : "fill-[#24302A]")} />
          </div>
          <span>{label}</span>
        </div>
        <span
          className={cn(
            "text-xs px-2.5 py-0.5 rounded-full border-2 border-border font-bold shadow-xs",
            isP1
              ? "bg-[#E8F3EC] text-[#16623A]"
              : "bg-[#FBEFD2] text-[#6B4A06]",
          )}
        >
          {isP1 ? "Parceiro(a) 1" : "Parceiro(a) 2"}
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5 sm:col-span-2">
          <Label>Nome</Label>
          <div className="relative">
            <UserIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              required
              className="pl-9"
              value={value.nome}
              onChange={(e) => onChange({ ...value, nome: e.target.value })}
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>E-mail</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="email"
              required
              className="pl-9"
              value={value.email}
              onChange={(e) => onChange({ ...value, email: e.target.value })}
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>Senha</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type={mostrarSenha ? "text" : "password"}
              required
              minLength={6}
              className="pl-9 pr-10"
              value={value.senha}
              onChange={(e) => onChange({ ...value, senha: e.target.value })}
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

        <div className="space-y-1.5">
          <Label>Nascimento</Label>
          <div className="relative">
            <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-9"
              value={value.dataNascimento}
              onChange={(e) => onChange({ ...value, dataNascimento: maskDate(e.target.value) })}
              placeholder="dd/mm/aaaa"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export function RegistroCasal() {
  const navigate = useNavigate();
  const { refresh } = useAuth();
  const [p1, setP1] = useState(emptyPessoa());
  const [p2, setP2] = useState(emptyPessoa());
  const [metaGlobal, setMetaGlobal] = useState<number | "">("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    if (p1.email.trim().toLowerCase() === p2.email.trim().toLowerCase()) {
      toast.error("Os e-mails do casal devem ser diferentes");
      return;
    }
    setLoading(true);
    try {
      let dataP1 = undefined;
      if (p1.dataNascimento.trim() !== "") {
        dataP1 = brToIsoDate(p1.dataNascimento);
        if (!dataP1) {
          toast.error(`A data de nascimento da Pessoa 1 é inválida.`);
          setLoading(false);
          return;
        }
      }

      let dataP2 = undefined;
      if (p2.dataNascimento.trim() !== "") {
        dataP2 = brToIsoDate(p2.dataNascimento);
        if (!dataP2) {
          toast.error(`A data de nascimento da Pessoa 2 é inválida.`);
          setLoading(false);
          return;
        }
      }

      const map = (p: PessoaForm, isoDate: string | undefined) => ({
        nome: p.nome,
        email: p.email,
        senha: p.senha,
        dataNascimento: isoDate,
      });

      const res = await usuarioService.registrarCasal({
        pessoa1: map(p1, dataP1),
        pessoa2: map(p2, dataP2),
        metaGlobalEnxoval: metaGlobal ? Number(metaGlobal) : undefined,
      });
      await refresh();
      toast.success("Conta do casal criada!");
      navigate({ to: "/inicio" });
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Não foi possível cadastrar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="space-y-6">
        <PessoaFields label="Primeiro parceiro" numero={1} value={p1} onChange={setP1} />
        <PessoaFields label="Segundo parceiro" numero={2} value={p2} onChange={setP2} />
      </div>
      <div className="space-y-2 pt-4 border-t">
        <Label>Meta do Enxoval (R$)</Label>
        <div className="relative">
          <Target className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground z-10" />
          <CurrencyInput
            className="pl-9"
            value={metaGlobal}
            onValueChange={setMetaGlobal}
            placeholder="Ex: 5.000,00"
          />
        </div>
      </div>
      <Button
        type="submit"
        className="w-full h-11 bg-primary hover:bg-primary-hover text-primary-foreground font-bold text-base shadow-[3px_3px_0_var(--border)] border-2 border-border transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
        disabled={loading}
      >
        {loading ? "Criando..." : "Criar conta do casal"}
      </Button>
    </form>
  );
}
