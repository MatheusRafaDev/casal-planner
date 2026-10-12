import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  Heart,
  User as UserIcon,
  Mail,
  Lock,
  Calendar,
  Target,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  Check,
} from "lucide-react";
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

export function RegistroCasal() {
  const navigate = useNavigate();
  const { refresh } = useAuth();
  const [etapa, setEtapa] = useState<1 | 2>(1);
  const [p1, setP1] = useState(emptyPessoa());
  const [p2, setP2] = useState(emptyPessoa());
  const [metaGlobal, setMetaGlobal] = useState<number | "">("");
  const [loading, setLoading] = useState(false);
  const [mostrarSenhaP1, setMostrarSenhaP1] = useState(false);
  const [mostrarSenhaP2, setMostrarSenhaP2] = useState(false);

  function avancarParaP2(e?: React.MouseEvent) {
    if (e) e.preventDefault();
    if (!p1.nome.trim()) {
      toast.error("Informe o nome do 1º parceiro");
      return;
    }
    if (!p1.email.trim() || !p1.email.includes("@")) {
      toast.error("Informe um e-mail válido para o 1º parceiro");
      return;
    }
    if (!p1.senha || p1.senha.length < 6) {
      toast.error("A senha deve ter no mínimo 6 caracteres");
      return;
    }
    setEtapa(2);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;

    if (!p1.nome.trim() || !p1.email.trim() || !p1.senha) {
      setEtapa(1);
      toast.error("Preencha todos os dados obrigatórios do 1º parceiro");
      return;
    }

    if (!p2.nome.trim() || !p2.email.trim() || !p2.senha) {
      setEtapa(2);
      toast.error("Preencha todos os dados obrigatórios do 2º parceiro");
      return;
    }

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
          toast.error("A data de nascimento do 1º parceiro é inválida.");
          setEtapa(1);
          setLoading(false);
          return;
        }
      }

      let dataP2 = undefined;
      if (p2.dataNascimento.trim() !== "") {
        dataP2 = brToIsoDate(p2.dataNascimento);
        if (!dataP2) {
          toast.error("A data de nascimento do 2º parceiro é inválida.");
          setEtapa(2);
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

      await usuarioService.registrarCasal({
        pessoa1: map(p1, dataP1),
        pessoa2: map(p2, dataP2),
        metaGlobalEnxoval: metaGlobal ? Number(metaGlobal) : undefined,
      });

      await refresh();
      toast.success("Conta do casal criada com sucesso!");
      navigate({ to: "/inicio" });
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Não foi possível cadastrar");
    } finally {
      setLoading(false);
    }
  }

  const p1Valido = p1.nome.trim().length > 0 && p1.email.includes("@") && p1.senha.length >= 6;
  const p2Valido = p2.nome.trim().length > 0 && p2.email.includes("@") && p2.senha.length >= 6;

  return (
    <form onSubmit={submit} className="space-y-3.5">
      {/* Indicador / Alternador de Parceiros Compacto */}
      <div className="grid grid-cols-2 p-1 bg-muted rounded-xl border border-border gap-1">
        <button
          type="button"
          onClick={() => setEtapa(1)}
          className={cn(
            "py-1.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer",
            etapa === 1
              ? "bg-card text-foreground shadow-xs border border-border/80"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <span
            className={cn(
              "w-2 h-2 rounded-full",
              p1Valido ? "bg-emerald-600" : "bg-emerald-600/50",
            )}
          />
          <span className="truncate">
            1. {p1.nome ? p1.nome.split(" ")[0] : "Você (P1)"}
          </span>
          {p1Valido && <Check className="w-3 h-3 text-emerald-600 ml-auto shrink-0" />}
        </button>

        <button
          type="button"
          onClick={() => setEtapa(2)}
          className={cn(
            "py-1.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer",
            etapa === 2
              ? "bg-card text-foreground shadow-xs border border-border/80"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <span
            className={cn(
              "w-2 h-2 rounded-full",
              p2Valido ? "bg-amber-500" : "bg-amber-500/50",
            )}
          />
          <span className="truncate">
            2. {p2.nome ? p2.nome.split(" ")[0] : "Seu amor (P2)"}
          </span>
          {p2Valido && <Check className="w-3 h-3 text-amber-600 ml-auto shrink-0" />}
        </button>
      </div>

      {/* Conteúdo Etapa 1: Parceiro 1 */}
      {etapa === 1 && (
        <div className="space-y-3 animate-in fade-in zoom-in-98 duration-150">
          <div className="space-y-1">
            <Label className="text-xs font-semibold">Seu nome completo</Label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                required
                className="pl-9 h-10 text-sm"
                placeholder="Ex: Matheus Rafael"
                value={p1.nome}
                onChange={(e) => setP1({ ...p1, nome: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Seu e-mail</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  required
                  className="pl-9 h-10 text-sm"
                  placeholder="seu@email.com"
                  value={p1.email}
                  onChange={(e) => setP1({ ...p1, email: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Sua senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type={mostrarSenhaP1 ? "text" : "password"}
                  required
                  minLength={6}
                  className="pl-9 pr-9 h-10 text-sm"
                  placeholder="Mín. 6 dígitos"
                  value={p1.senha}
                  onChange={(e) => setP1({ ...p1, senha: e.target.value })}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  aria-label={mostrarSenhaP1 ? "Ocultar senha" : "Mostrar senha"}
                  onClick={() => setMostrarSenhaP1((v) => !v)}
                  className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  {mostrarSenhaP1 ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-semibold">Data de nascimento (opcional)</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-9 h-10 text-sm"
                value={p1.dataNascimento}
                onChange={(e) => setP1({ ...p1, dataNascimento: maskDate(e.target.value) })}
                placeholder="dd/mm/aaaa"
              />
            </div>
          </div>

          <Button
            type="button"
            onClick={avancarParaP2}
            className="w-full h-11 bg-primary hover:bg-primary-hover text-primary-foreground font-bold text-sm shadow-[2px_2px_0_var(--border)] border-2 border-border transition-all active:translate-x-[1px] active:translate-y-[1px] active:shadow-none flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            <span>Avançar para o 2º parceiro</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Conteúdo Etapa 2: Parceiro 2 e Meta */}
      {etapa === 2 && (
        <div className="space-y-3 animate-in fade-in zoom-in-98 duration-150">
          <div className="space-y-1">
            <Label className="text-xs font-semibold">Nome do seu parceiro(a)</Label>
            <div className="relative">
              <Heart className="absolute left-3 top-2.5 h-4 w-4 text-amber-600" />
              <Input
                required
                className="pl-9 h-10 text-sm"
                placeholder="Ex: Rayane"
                value={p2.nome}
                onChange={(e) => setP2({ ...p2, nome: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">E-mail do parceiro(a)</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  required
                  className="pl-9 h-10 text-sm"
                  placeholder="parceiro@email.com"
                  value={p2.email}
                  onChange={(e) => setP2({ ...p2, email: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Senha do parceiro(a)</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type={mostrarSenhaP2 ? "text" : "password"}
                  required
                  minLength={6}
                  className="pl-9 pr-9 h-10 text-sm"
                  placeholder="Mín. 6 dígitos"
                  value={p2.senha}
                  onChange={(e) => setP2({ ...p2, senha: e.target.value })}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  aria-label={mostrarSenhaP2 ? "Ocultar senha" : "Mostrar senha"}
                  onClick={() => setMostrarSenhaP2((v) => !v)}
                  className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  {mostrarSenhaP2 ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Nascimento (opcional)</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-9 h-10 text-sm"
                  value={p2.dataNascimento}
                  onChange={(e) => setP2({ ...p2, dataNascimento: maskDate(e.target.value) })}
                  placeholder="dd/mm/aaaa"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Meta de orçamento (R$)</Label>
              <div className="relative">
                <Target className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground z-10" />
                <CurrencyInput
                  className="pl-9 h-10 text-sm"
                  value={metaGlobal}
                  onValueChange={setMetaGlobal}
                  placeholder="Ex: 15.000,00"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              onClick={() => setEtapa(1)}
              className="h-11 px-3 border-2 border-border font-bold text-xs flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Voltar</span>
            </Button>

            <Button
              type="submit"
              className="flex-1 h-11 bg-primary hover:bg-primary-hover text-primary-foreground font-bold text-sm shadow-[2px_2px_0_var(--border)] border-2 border-border transition-all active:translate-x-[1px] active:translate-y-[1px] active:shadow-none cursor-pointer"
              disabled={loading}
            >
              {loading ? "Criando conta..." : "Criar conta do casal 🎉"}
            </Button>
          </div>
        </div>
      )}
    </form>
  );
}
