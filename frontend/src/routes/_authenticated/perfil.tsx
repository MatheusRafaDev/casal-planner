import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { User, Moon, Sun, Trash2, KeyRound, Target, Save, ChevronDown, Share2, Copy, Check } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useTheme } from "@/lib/theme-context";
import { usuarioService } from "@/services/usuario";
import { resumoService } from "@/services/resumo";
import { conviteService } from "@/services/convite";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { maskDate, brToIsoDate, formatDate } from "@/lib/formatters";

export const Route = createFileRoute("/_authenticated/perfil")({
  head: () => ({
    meta: [
      { title: "Perfil — Casal Planner" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PerfilPage,
});

function PerfilPage() {
  const { usuario, refresh, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();

  if (!usuario) return null;
  const isCasal = usuario.tipoConta === "Casal";

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <span className="grid place-items-center h-12 w-12 rounded-full bg-gradient-primary text-primary-foreground shadow-warm">
          <User className="h-5 w-5" />
        </span>
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-semibold">Perfil</h1>
          <p className="text-sm text-muted-foreground">
            Conta {isCasal ? "de casal" : "individual"}
          </p>
        </div>
      </div>

      {/* Dados */}
      <section className="rounded-2xl border bg-card p-5 shadow-soft">
        <h2 className="font-display text-lg font-semibold mb-4">Dados pessoais</h2>
        {isCasal ? (
          <Tabs defaultValue="p1">
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="p1">{usuario.casalInfo?.pessoa1.nome ?? "Pessoa 1"}</TabsTrigger>
              <TabsTrigger value="p2">{usuario.casalInfo?.pessoa2.nome ?? "Pessoa 2"}</TabsTrigger>
            </TabsList>
            <TabsContent value="p1">
              <PessoaForm
                key="p1"
                dados={usuario.casalInfo?.pessoa1 ?? { nome: "", email: "" }}
                bloquearEmailCpf
                onSave={async (dto) => {
                  await usuarioService.atualizarPerfilCasal(usuario.id, 1, {
                    nome: dto.nome,
                    dataNascimento: dto.dataNascimento ?? null,
                  });
                  await refresh();
                }}
              />
            </TabsContent>
            <TabsContent value="p2">
              <PessoaForm
                key="p2"
                dados={usuario.casalInfo?.pessoa2 ?? { nome: "", email: "" }}
                bloquearEmailCpf
                onSave={async (dto) => {
                  await usuarioService.atualizarPerfilCasal(usuario.id, 2, {
                    nome: dto.nome,
                    dataNascimento: dto.dataNascimento ?? null,
                  });
                  await refresh();
                }}
              />
            </TabsContent>
          </Tabs>
        ) : (
          <PessoaForm
            dados={{
              nome: usuario.nomeCompleto ?? "",
              email: usuario.email ?? "",
              dataNascimento: usuario.dataNascimento ?? "",
            }}
            onSave={async (dto) => {
              await usuarioService.atualizarPerfil({
                nomeCompleto: dto.nome,
                email: dto.email,
                dataNascimento: dto.dataNascimento ?? undefined,
              });
              await refresh();
            }}
          />
        )}
      </section>

      {/* Meta */}
      <MetaEnxovalCard
        metaUsuario={usuario.metaGlobalEnxoval ?? null}
        onSaved={refresh}
      />

      {/* Senha */}
      <TrocarSenhaCard />

      {/* Preferências */}
      <section className="rounded-2xl border bg-card p-5 shadow-soft">
        <h2 className="font-display text-lg font-semibold mb-4">Preferências</h2>
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium text-sm">Modo escuro</div>
            <div className="text-xs text-muted-foreground">
              Salvo na sua conta e sincronizado nos dispositivos.
            </div>
          </div>
          <Button variant="outline" onClick={toggle}>
            {theme === "dark" ? (
              <>
                <Sun className="h-4 w-4 mr-2" /> Claro
              </>
            ) : (
              <>
                <Moon className="h-4 w-4 mr-2" /> Escuro
              </>
            )}
          </Button>
        </div>
      </section>

      {/* Zona perigosa */}
      <section className="rounded-2xl border border-destructive/30 bg-destructive/5 p-5">
        <h2 className="font-display text-lg font-semibold text-destructive mb-3">
          Zona sensível
        </h2>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={logout}>
            Sair da conta
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="h-4 w-4 mr-2" /> Excluir conta
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Excluir conta permanentemente?</AlertDialogTitle>
                <AlertDialogDescription>
                  Todos os cômodos, itens, metas e pesquisas serão apagados. Essa ação não pode
                  ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={async () => {
                    try {
                      await usuarioService.excluirConta(usuario.id);
                      toast.success("Conta excluída");
                      logout();
                      navigate({ to: "/" });
                    } catch (e) {
                      toast.error(e instanceof Error ? e.message : "Erro ao excluir");
                    }
                  }}
                >
                  Excluir agora
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </section>
    </div>
  );
}

interface PessoaDados {
  nome: string;
  email: string;
  dataNascimento?: string | null;
}

function PessoaForm({
  dados,
  onSave,
  bloquearEmailCpf = false,
}: {
  dados: PessoaDados;
  onSave: (dto: PessoaDados) => Promise<void>;
  bloquearEmailCpf?: boolean;
}) {
  const [nome, setNome] = useState(dados.nome ?? "");
  const [email, setEmail] = useState(dados.email ?? "");
  const [nasc, setNasc] = useState(
    dados.dataNascimento ? formatDate(dados.dataNascimento) : "",
  );

  useEffect(() => {
    setNome(dados.nome ?? "");
    setEmail(dados.email ?? "");
    setNasc(dados.dataNascimento ? formatDate(dados.dataNascimento) : "");
  }, [dados]);

  const mut = useMutation({
    mutationFn: async () => {
      await onSave({
        nome,
        email,
        dataNascimento: brToIsoDate(nasc),
      });
    },
    onSuccess: () => toast.success("Dados atualizados"),
    onError: (e) => toast.error(e instanceof Error ? e.message : "Erro"),
  });

  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        mut.mutate();
      }}
    >
      <div className="grid md:grid-cols-2 gap-3">
        <div>
          <Label>Nome</Label>
          <Input value={nome} onChange={(e) => setNome(e.target.value)} required />
        </div>
        <div>
          <Label>E-mail</Label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={bloquearEmailCpf}
          />
          {bloquearEmailCpf && (
            <p className="text-xs text-muted-foreground mt-1">
              E-mail de contas de casal não pode ser alterado por aqui ainda.
            </p>
          )}
        </div>

        <div>
          <Label>Data de nascimento</Label>
          <Input value={nasc} onChange={(e) => setNasc(maskDate(e.target.value))} placeholder="dd/mm/aaaa" />
        </div>

      </div>
      <Button type="submit" disabled={mut.isPending} className="bg-gradient-primary">
        <Save className="h-4 w-4 mr-2" />
        {mut.isPending ? "Salvando..." : "Salvar alterações"}
      </Button>
    </form>
  );
}

function MetaEnxovalCard({
  metaUsuario,
  onSaved,
}: {
  metaUsuario: number | null;
  onSaved: () => Promise<void> | void;
}) {
  const qc = useQueryClient();
  const resumoQ = useQuery({
    queryKey: ["resumo-meta"],
    queryFn: () => resumoService.obterRaw(),
  });
  const metaResumo =
    (resumoQ.data as { enxoval?: { metaGlobalEnxoval?: number | null } } | undefined)?.enxoval
      ?.metaGlobalEnxoval ?? null;
  const meta = metaUsuario ?? metaResumo;
  const [valor, setValor] = useState<number>(meta != null ? Number(meta) : 0);
  useEffect(() => setValor(meta != null ? Number(meta) : 0), [meta]);
  const mut = useMutation({
    mutationFn: () => usuarioService.atualizarMetaEnxoval(valor),
    onSuccess: async () => {
      toast.success("Meta atualizada");
      qc.invalidateQueries({ queryKey: ["resumo-meta"] });
      qc.invalidateQueries({ queryKey: ["resumo"] });
      await onSaved();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Erro"),
  });
  return (
    <section className="rounded-2xl border bg-card p-5 shadow-soft">
      <div className="flex items-center gap-2 mb-3">
        <Target className="h-4 w-4 text-primary" />
        <h2 className="font-display text-lg font-semibold">Meta total do enxoval</h2>
      </div>
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          mut.mutate();
        }}
      >
        <CurrencyInput
          value={valor}
          onValueChange={setValor}
          placeholder="R$ 0,00"
        />
        <Button type="submit" disabled={mut.isPending} className="bg-gradient-primary">
          Salvar
        </Button>
      </form>
    </section>
  );
}

function TrocarSenhaCard() {
  const { usuario } = useAuth();
  const [aberto, setAberto] = useState(false);
  const [atual, setAtual] = useState("");
  const [nova, setNova] = useState("");
  const [conf, setConf] = useState("");
  const emailDaConta =
    usuario?.tipoConta === "Casal"
      ? usuario.pessoaLogada === 2
        ? usuario.casalInfo?.pessoa2.email ?? usuario.email ?? ""
        : usuario.casalInfo?.pessoa1.email ?? usuario.email ?? ""
      : usuario?.email ?? "";
  const mut = useMutation({
    mutationFn: () => usuarioService.alterarSenha(emailDaConta, atual, nova),
    onSuccess: () => {
      toast.success("Senha alterada");
      setAtual("");
      setNova("");
      setConf("");
      setAberto(false);
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Erro"),
  });
  return (
    <section className="rounded-2xl border bg-card shadow-soft overflow-hidden">
      <button
        type="button"
        onClick={() => setAberto((v) => !v)}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-muted/40 transition-colors"
      >
        <div className="flex items-center gap-2">
          <KeyRound className="h-4 w-4 text-primary" />
          <span className="font-display text-lg font-semibold">Trocar senha</span>
        </div>
        <ChevronDown
          className="h-4 w-4 text-muted-foreground transition-transform duration-200"
          style={{ transform: aberto ? "rotate(180deg)" : "rotate(0deg)" }}
        />
      </button>

      <div
        style={{
          display: "grid",
          gridTemplateRows: aberto ? "1fr" : "0fr",
          transition: "grid-template-rows 0.25s ease",
        }}
      >
        <div style={{ overflow: "hidden" }}>
          <form
            className="grid md:grid-cols-3 gap-3 px-5 pb-5"
            onSubmit={(e) => {
              e.preventDefault();
              if (nova.length < 6) return toast.error("Nova senha muito curta");
              if (nova !== conf) return toast.error("Confirmação não confere");
              mut.mutate();
            }}
          >
            <div>
              <Label>Senha atual</Label>
              <Input type="password" value={atual} onChange={(e) => setAtual(e.target.value)} required />
            </div>
            <div>
              <Label>Nova senha</Label>
              <Input type="password" value={nova} onChange={(e) => setNova(e.target.value)} required />
            </div>
            <div>
              <Label>Confirmar</Label>
              <Input type="password" value={conf} onChange={(e) => setConf(e.target.value)} required />
            </div>
            <div className="md:col-span-3">
              <Button type="submit" disabled={mut.isPending} className="bg-gradient-primary">
                {mut.isPending ? "Salvando..." : "Trocar senha"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
