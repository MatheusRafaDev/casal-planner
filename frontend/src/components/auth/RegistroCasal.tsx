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
}: {
  value: PessoaForm;
  onChange: (v: PessoaForm) => void;
  label: string;
}) {
  const [mostrarSenha, setMostrarSenha] = useState(false);
  return (
    <div className="space-y-4 p-4 rounded-xl border bg-card">
      <div className="flex items-center gap-2 font-medium">
        <Heart className="h-4 w-4 text-terracota" /> {label}
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
  const [metaGlobal, setMetaGlobal] = useState("");
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
        metaGlobalEnxoval: metaGlobal ? parseFloat(metaGlobal) : undefined,
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
    <form onSubmit={submit} className="space-y-4">
      <PessoaFields label="Pessoa 1" value={p1} onChange={setP1} />
      <PessoaFields label="Pessoa 2" value={p2} onChange={setP2} />
      <div className="space-y-2 p-4 rounded-xl border bg-card">
        <Label>Meta do Enxoval (R$)</Label>
        <div className="relative">
          <Target className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="number"
            min="0"
            step="0.01"
            className="pl-9"
            value={metaGlobal}
            onChange={(e) => setMetaGlobal(e.target.value)}
            placeholder="Ex: 5000"
          />
        </div>
      </div>
      <Button type="submit" className="w-full bg-gradient-primary shadow-warm" disabled={loading}>
        {loading ? "Criando..." : "Criar conta do casal"}
      </Button>
    </form>
  );
}
