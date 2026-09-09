import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  User,
  Trash2,
  KeyRound,
  Target,
  Save,
  ChevronDown,
  Share2,
  Copy,
  Check,
  MailOpen,
  LogOut,
  Download,
  Bell,
  BellOff
} from "lucide-react";
import { usePwa } from "@/hooks/use-pwa";
import { useAuth } from "@/lib/auth-context";

import { usuarioService } from "@/services/usuario";
import { resumoService } from "@/services/resumo";
import { conviteService } from "@/services/convite";
import { recuperarSenhaService } from "@/services/recuperar-senha";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
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
    meta: [{ title: "Perfil — Casal Planner" }, { name: "robots", content: "noindex" }],
  }),
  component: PerfilPage,
});

function PerfilPage() {
  const { usuario, refresh, logout } = useAuth();
  const { installPrompt, triggerInstall } = usePwa();

  const navigate = useNavigate();
  const [emailParceiro, setEmailParceiro] = useState("");

  if (!usuario) return null;
  const isCasal = usuario.tipoConta === "Casal";

  const convitesQuery = useQuery({
    queryKey: ["meus-convites"],
    queryFn: () => conviteService.buscarMeusConvites(),
    enabled: !isCasal,
  });

  const aceitarMutation = useMutation({
    mutationFn: (token: string) => conviteService.aceitar({ token, migrarDados: true }),
    onSuccess: async (data) => {
      toast.success("Convite aceito! Contas vinculadas.");
      await refresh();
      navigate({ to: "/" });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const conviteMutation = useMutation({
    mutationFn: () => conviteService.criar({ emailParceiro }),
    onSuccess: () => {
      toast.success("Convite enviado com sucesso!");
      setEmailParceiro("");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="p-4 md:p-8 w-full max-w-[1000px] space-y-6">
      <div className="flex items-center justify-between">
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
        <div className="flex gap-2">
          {installPrompt && (
            <Button
              variant="outline"
              size="sm"
              onClick={triggerInstall}
              className="text-primary hidden sm:flex"
            >
              <Download className="h-4 w-4 mr-2" />
              Instalar App
            </Button>
          )}
          {installPrompt && (
            <Button
              variant="outline"
              size="icon"
              onClick={triggerInstall}
              className="text-primary sm:hidden"
            >
              <Download className="h-4 w-4" />
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={logout} className="hidden sm:flex">
            <LogOut className="h-4 w-4 mr-2" />
            Sair
          </Button>
          <Button variant="outline" size="icon" onClick={logout} className="sm:hidden">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {!isCasal && convitesQuery.data && convitesQuery.data.length > 0 && (
        <section className="rounded-2xl border border-primary/50 bg-primary/5 p-5 shadow-soft">
          <div className="flex items-center gap-2 mb-4">
            <MailOpen className="h-5 w-5 text-primary" />
            <h2 className="font-display text-lg font-semibold text-primary">
              Você tem um convite!
            </h2>
          </div>
          <div className="space-y-4">
            {convitesQuery.data.map((convite) => (
              <div
                key={convite.token}
                className="bg-background rounded-xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between border"
              >
                <div>
                  <p className="font-medium text-base">
                    <strong>{convite.nomeConvidante}</strong> convidou você para o CasalPlanner.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Aceite para vincular suas contas. Ao aceitar, seus dados atuais serão migrados
                    para a conta de casal.
                  </p>
                </div>
                <Button
                  onClick={() => aceitarMutation.mutate(convite.token)}
                  disabled={aceitarMutation.isPending}
                  className="w-full md:w-auto"
                >
                  <Check className="h-4 w-4 mr-2" />
                  {aceitarMutation.isPending ? "Aceitando..." : "Aceitar Convite"}
                </Button>
              </div>
            ))}
          </div>
        </section>
      )}

      {!isCasal && (
        <section className="rounded-2xl border bg-card p-5 shadow-soft">
          <h2 className="font-display text-lg font-semibold mb-4">Convidar parceiro</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Envie um convite para o email do seu parceiro. Ele será notificado para acessar o
            aplicativo e aceitar.
          </p>
          <div className="space-y-3">
            <div>
              <Label htmlFor="email-parceiro">Email do parceiro</Label>
              <Input
                id="email-parceiro"
                type="email"
                placeholder="parceiro@email.com"
                value={emailParceiro}
                onChange={(e) => setEmailParceiro(e.target.value)}
              />
            </div>
            <Button
              onClick={() => conviteMutation.mutate()}
              disabled={!emailParceiro || conviteMutation.isPending}
              className="w-full"
            >
              <Share2 className="h-4 w-4 mr-2" />
              {conviteMutation.isPending ? "Enviando..." : "Enviar convite"}
            </Button>
          </div>
        </section>
      )}

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
                dados={{ 
                  nome: usuario.casalInfo?.pessoa1.nome ?? "", 
                  email: usuario.casalInfo?.pessoa1.email ?? "",
                  receberNotificacoes: usuario.casalInfo?.pessoa1.receberNotificacoes ?? true
                }}
                bloquearEmailCpf
                onSave={async (dto) => {
                  await usuarioService.atualizarPerfilCasal(usuario.id, 1, {
                    nome: dto.nome,
                    dataNascimento: dto.dataNascimento ?? null,
                  });
                  await usuarioService.atualizarNotificacoes(dto.receberNotificacoes ?? true);
                  await refresh();
                }}
              />
            </TabsContent>
            <TabsContent value="p2">
              <PessoaForm
                key="p2"
                dados={{ 
                  nome: usuario.casalInfo?.pessoa2.nome ?? "", 
                  email: usuario.casalInfo?.pessoa2.email ?? "",
                  receberNotificacoes: usuario.casalInfo?.pessoa2.receberNotificacoes ?? true
                }}
                bloquearEmailCpf
                onSave={async (dto) => {
                  await usuarioService.atualizarPerfilCasal(usuario.id, 2, {
                    nome: dto.nome,
                    dataNascimento: dto.dataNascimento ?? null,
                  });
                  await usuarioService.atualizarNotificacoes(dto.receberNotificacoes ?? true);
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
              receberNotificacoes: usuario.receberNotificacoes ?? true
            }}
            bloquearEmailCpf
            onSave={async (dto) => {
              await usuarioService.atualizarPerfil({
                nomeCompleto: dto.nome,
                email: dto.email,
                dataNascimento: dto.dataNascimento ?? undefined,
              });
              await usuarioService.atualizarNotificacoes(dto.receberNotificacoes ?? true);
              await refresh();
            }}
          />
        )}
      </section>

      {/* Meta */}
      <MetaEnxovalCard metaUsuario={usuario.metaGlobalEnxoval ?? null} onSaved={refresh} />

      {/* Senha */}
      <TrocarSenhaCard />

      {/* Zona perigosa */}
      <section className="rounded-2xl border border-destructive/30 bg-destructive/5 p-5">
        <h2 className="font-display text-lg font-semibold text-destructive mb-3">Zona sensível</h2>
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
                  Todos os cômodos, itens, metas e pesquisas serão apagados. Essa ação não pode ser
                  desfeita.
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
  receberNotificacoes?: boolean;
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
  const [nasc, setNasc] = useState(dados.dataNascimento ? formatDate(dados.dataNascimento) : "");
  const [notif, setNotif] = useState(dados.receberNotificacoes ?? true);

  useEffect(() => {
    setNome(dados.nome ?? "");
    setEmail(dados.email ?? "");
    setNasc(dados.dataNascimento ? formatDate(dados.dataNascimento) : "");
    setNotif(dados.receberNotificacoes ?? true);
  }, [dados]);

  const mut = useMutation({
    mutationFn: async () => {
      let dataFormatada = undefined;
      if (nasc.trim() !== "") {
        dataFormatada = brToIsoDate(nasc);
        if (!dataFormatada) {
          throw new Error("A data de nascimento é inválida.");
        }
      }
      await onSave({
        nome,
        email,
        dataNascimento: dataFormatada,
        receberNotificacoes: notif,
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
            readOnly={bloquearEmailCpf}
          />
          {bloquearEmailCpf && (
            <p className="text-xs text-muted-foreground mt-1">
              O e-mail não pode ser alterado no momento.
            </p>
          )}
        </div>

        <div>
          <Label>Data de nascimento</Label>
          <Input
            value={nasc}
            onChange={(e) => setNasc(maskDate(e.target.value))}
            placeholder="dd/mm/aaaa"
          />
        </div>

        <div className="flex items-center justify-between col-span-full pt-2">
          <div className="flex flex-col space-y-0.5">
            <Label className="flex items-center gap-2">
              {notif ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4 text-muted-foreground" />}
              Receber Notificações
            </Label>
            <p className="text-xs text-muted-foreground">
              Avisos sobre itens marcados como comprados pelo parceiro.
            </p>
          </div>
          <Switch checked={notif} onCheckedChange={setNotif} />
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
        <CurrencyInput value={valor} onValueChange={setValor} placeholder="R$ 0,00" />
        <Button type="submit" disabled={mut.isPending} className="bg-gradient-primary">
          Salvar
        </Button>
      </form>
    </section>
  );
}

function TrocarSenhaCard() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  const emailDaConta =
    usuario?.tipoConta === "Casal"
      ? usuario.pessoaLogada === 2
        ? (usuario.casalInfo?.pessoa2.email ?? usuario.email ?? "")
        : (usuario.casalInfo?.pessoa1.email ?? usuario.email ?? "")
      : (usuario?.email ?? "");

  const mut = useMutation({
    mutationFn: () => recuperarSenhaService.esqueciSenha(emailDaConta),
    onSuccess: async () => {
      toast.success("E-mail enviado! Verifique sua caixa de entrada.");
      await navigate({ to: "/recuperar-senha", search: { email: emailDaConta, step: 2 } });
      logout();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Erro ao enviar e-mail"),
  });

  return (
    <section className="rounded-2xl border bg-card shadow-soft overflow-hidden p-5">
      <div className="flex items-center gap-2 mb-4">
        <KeyRound className="h-4 w-4 text-primary" />
        <h2 className="font-display text-lg font-semibold">Segurança e Senha</h2>
      </div>

      <p className="text-sm text-muted-foreground mb-4">
        Para sua segurança, enviaremos um link por e-mail para você redefinir sua senha. O processo
        é idêntico ao "Esqueci minha senha" sem precisar informar a senha atual.
      </p>

      <div className="bg-muted/50 rounded-lg p-4 mb-4 text-sm">
        <p className="font-semibold mb-2">Como funciona:</p>
        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
          <li>Clique no botão abaixo</li>
          <li>
            Acesse o link enviado para <strong>{emailDaConta}</strong>
          </li>
          <li>Escolha uma nova senha com pelo menos 8 caracteres</li>
        </ul>
      </div>

      <Button
        type="button"
        onClick={() => mut.mutate()}
        disabled={mut.isPending}
        className="w-full sm:w-auto bg-gradient-primary"
      >
        {mut.isPending ? "Enviando..." : "Enviar link de redefinição"}
      </Button>
    </section>
  );
}
