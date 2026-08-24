import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
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
      if (returnUrl) {
        window.location.href = returnUrl;
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
    <form onSubmit={submit} className="space-y-4">
      <div className="space-y-2">
        <Label>Nome completo</Label>
        <div className="relative">
          <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            required
            className="pl-9"
            value={form.nomeCompleto}
            onChange={(e) => setForm({ ...form, nomeCompleto: e.target.value })}
          />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>E-mail</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="email"
              required
              className="pl-9"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Senha</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type={mostrarSenha ? "text" : "password"}
              required
              minLength={6}
              className="pl-9 pr-10"
              value={form.senha}
              onChange={(e) => setForm({ ...form, senha: e.target.value })}
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
          <Label>Nascimento</Label>
          <div className="relative">
            <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-9"
              value={form.dataNascimento}
              onChange={(e) => setForm({ ...form, dataNascimento: maskDate(e.target.value) })}
              placeholder="dd/mm/aaaa"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Meta do Enxoval (R$)</Label>
          <div className="relative">
            <Target className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground z-10" />
            <CurrencyInput
              className="pl-9"
              value={form.metaGlobalEnxoval}
              onValueChange={(val) => setForm({ ...form, metaGlobalEnxoval: val })}
              placeholder="Ex: 5.000,00"
            />
          </div>
        </div>
      </div>

      <Button type="submit" className="w-full bg-gradient-primary shadow-warm" disabled={loading}>
        {loading ? "Criando..." : "Criar minha conta"}
      </Button>
    </form>
  );
}
