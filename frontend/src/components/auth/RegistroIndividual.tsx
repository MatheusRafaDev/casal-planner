import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { User, Mail, Lock, Calendar, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usuarioService } from "@/services/usuario";
import { ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { maskDate, brToIsoDate } from "@/lib/formatters";

export function RegistroIndividual({ returnUrl }: { returnUrl?: string }) {
  const navigate = useNavigate();
  const { refresh } = useAuth();
  const [form, setForm] = useState({
    nomeCompleto: "",
    email: "",
    senha: "",
    dataNascimento: "",
    metaGlobalEnxoval: "",
  });
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await usuarioService.registrarIndividual({
        nomeCompleto: form.nomeCompleto,
        email: form.email,
        senha: form.senha,
        dataNascimento: brToIsoDate(form.dataNascimento) ?? undefined,
        metaGlobalEnxoval: form.metaGlobalEnxoval ? parseFloat(form.metaGlobalEnxoval) : undefined,
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
              type="password"
              required
              minLength={6}
              className="pl-9"
              value={form.senha}
              onChange={(e) => setForm({ ...form, senha: e.target.value })}
            />
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
            <Target className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="number"
              min="0"
              step="0.01"
              className="pl-9"
              value={form.metaGlobalEnxoval}
              onChange={(e) => setForm({ ...form, metaGlobalEnxoval: e.target.value })}
              placeholder="Ex: 5000"
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
