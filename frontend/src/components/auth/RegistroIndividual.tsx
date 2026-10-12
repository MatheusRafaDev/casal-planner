import { useState } from "react";
import { useNavigate, useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import { User, Mail, Lock, Calendar, Target, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usuarioService } from "@/services/usuario";
import { ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { maskDate, brToIsoDate } from "@/lib/formatters";
import { CurrencyInput } from "@/components/ui/currency-input";

export function RegistroIndividual({ returnUrl }: { returnUrl?: string }) {
  const navigate = useNavigate();
  const router = useRouter();
  const { refresh } = useAuth();
  const [form, setForm] = useState({
    nomeCompleto: "",
    email: "",
    senha: "",
    dataNascimento: "",
    metaGlobalEnxoval: "" as string | number,
  });
  const [loading, setLoading] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const dataFormatada = brToIsoDate(form.dataNascimento);
      if (form.dataNascimento.trim() !== "" && !dataFormatada) {
        toast.error("A data de nascimento é inválida.");
        setLoading(false);
        return;
      }

      const res = await usuarioService.registrarIndividual({
        nomeCompleto: form.nomeCompleto,
        email: form.email,
        senha: form.senha,
        dataNascimento: dataFormatada ?? undefined,
        metaGlobalEnxoval: form.metaGlobalEnxoval ? Number(form.metaGlobalEnxoval) : undefined,
      });
      await refresh();
      toast.success("Conta criada! Bem-vindo(a).");
      if (returnUrl && returnUrl.startsWith("/") && !returnUrl.startsWith("//")) {
        router.history.push(returnUrl);
      } else {
        navigate({ to: "/inicio" });
      }
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Não foi possível cadastrar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-3.5">
      <div className="space-y-1">
        <Label className="text-xs font-semibold">Nome completo</Label>
        <div className="relative">
          <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            required
            className="pl-9 h-10 text-sm"
            placeholder="Seu nome completo"
            value={form.nomeCompleto}
            onChange={(e) => setForm({ ...form, nomeCompleto: e.target.value })}
          />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <div className="space-y-1">
          <Label className="text-xs font-semibold">E-mail</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="email"
              required
              className="pl-9 h-10 text-sm"
              placeholder="seu@email.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
        </div>
        <div className="space-y-1">
          <Label className="text-xs font-semibold">Senha</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type={mostrarSenha ? "text" : "password"}
              required
              minLength={6}
              className="pl-9 pr-9 h-10 text-sm"
              placeholder="Mín. 6 dígitos"
              value={form.senha}
              onChange={(e) => setForm({ ...form, senha: e.target.value })}
            />
            <button
              type="button"
              tabIndex={-1}
              aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
              onClick={() => setMostrarSenha((v) => !v)}
              className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              {mostrarSenha ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className="space-y-1">
          <Label className="text-xs font-semibold">Data de nascimento</Label>
          <div className="relative">
            <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-9 h-10 text-sm"
              value={form.dataNascimento}
              onChange={(e) => setForm({ ...form, dataNascimento: maskDate(e.target.value) })}
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
              value={form.metaGlobalEnxoval}
              onValueChange={(val) => setForm({ ...form, metaGlobalEnxoval: val })}
              placeholder="Ex: 5.000,00"
            />
          </div>
        </div>
      </div>

      <Button
        type="submit"
        className="w-full h-11 bg-primary hover:bg-primary-hover text-primary-foreground font-bold text-sm shadow-[2px_2px_0_var(--border)] border-2 border-border transition-all active:translate-x-[1px] active:translate-y-[1px] active:shadow-none cursor-pointer mt-1"
        disabled={loading}
      >
        {loading ? "Criando conta..." : "Criar minha conta"}
      </Button>
    </form>
  );
}
