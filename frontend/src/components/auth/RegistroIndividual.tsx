import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usuarioService } from "@/services/usuario";
import { setToken, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { maskDate, brToIsoDate } from "@/lib/formatters";

export function RegistroIndividual() {
  const navigate = useNavigate();
  const { refresh } = useAuth();
  const [form, setForm] = useState({
    nomeCompleto: "",
    email: "",
    senha: "",
    dataNascimento: "",
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
      });
      setToken(res.token);
      await refresh();
      toast.success("Conta criada! Bem-vindo(a).");
      navigate({ to: "/inicio" });
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
        <Input
          required
          value={form.nomeCompleto}
          onChange={(e) => setForm({ ...form, nomeCompleto: e.target.value })}
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>E-mail</Label>
          <Input
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>Senha</Label>
          <Input
            type="password"
            required
            minLength={6}
            value={form.senha}
            onChange={(e) => setForm({ ...form, senha: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label>Nascimento</Label>
          <Input
            value={form.dataNascimento}
            onChange={(e) => setForm({ ...form, dataNascimento: maskDate(e.target.value) })}
            placeholder="dd/mm/aaaa"
          />
        </div>
      </div>

      <Button type="submit" className="w-full bg-gradient-primary shadow-warm" disabled={loading}>
        {loading ? "Criando..." : "Criar minha conta"}
      </Button>
    </form>
  );
}
