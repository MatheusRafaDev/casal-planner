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
  BellOff,
  ExternalLink,
  Sun,
  Moon,
  Monitor,
} from "lucide-react";
import { useTheme } from "@/lib/theme-context";
import { usePwa } from "@/hooks/use-pwa";
import { useAuth } from "@/lib/auth-context";

import { usuarioService } from "@/services/usuario";
import { resumoService } from "@/services/resumo";
import { conviteService } from "@/services/convite";
import { recuperarSenhaService } from "@/services/recuperar-senha";
import { itensService } from "@/services/itens";
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
import { maskDate, brToIsoDate, formatDate, brl } from "@/lib/formatters";

export const Route = createFileRoute("/_authenticated/perfil")({
  head: () => ({
    meta: [{ title: "CasalPlanner - Perfil" }, { name: "robots", content: "noindex" }],
  }),
  component: PerfilPage,
});

function PerfilPage() {
  const { usuario, refresh, logout } = useAuth();
  const { installPrompt, triggerInstall } = usePwa();

  const navigate = useNavigate();
  const [emailParceiro, setEmailParceiro] = useState("");

  const isCasal = usuario?.tipoConta === "Casal";

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

  if (!usuario) return null;

  return (
    <div className="w-full max-w-5xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex items-center justify-between pb-6 border-b border-border/50">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold tracking-tight">Configurações da Conta</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gerencie suas informações, preferências e dados {isCasal ? "do casal" : "pessoais"}.
          </p>
        </div>
        {installPrompt && (
          <Button variant="outline" size="sm" onClick={triggerInstall} className="rounded-full shadow-sm bg-background">
            <Download className="h-4 w-4 mr-2" /> Instalar App
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-10 divide-y divide-border/50">
        
        {/* SEC 1: Dados Pessoais / Casal */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 first:pt-0">
          <div className="md:col-span-1 space-y-1">
            <h2 className="font-semibold text-lg flex items-center gap-2"><User className="w-5 h-5 text-primary" /> Perfil</h2>
            <p className="text-sm text-muted-foreground">
              Atualize suas informações pessoais e notificações.
            </p>
          </div>
          <div className="md:col-span-2">
            <div className="bg-card rounded-[var(--radius-lg)] border p-5 shadow-sm">
              {isCasal ? (
                <Tabs defaultValue="p1" className="w-full">
                  <TabsList className="grid grid-cols-2 mb-6 p-1 bg-muted/50">
                    <TabsTrigger value="p1" className="rounded-md">{usuario.casalInfo?.pessoa1.nome ?? "Pessoa 1"}</TabsTrigger>
                    <TabsTrigger value="p2" className="rounded-md">{usuario.casalInfo?.pessoa2.nome ?? "Pessoa 2"}</TabsTrigger>
                  </TabsList>
                  <TabsContent value="p1" className="mt-0">
                    <PessoaForm
                      key="p1"
                      dados={{
                        nome: usuario.casalInfo?.pessoa1.nome ?? "",
                        email: usuario.casalInfo?.pessoa1.email ?? "",
                        dataNascimento: usuario.casalInfo?.pessoa1.dataNascimento ?? "",
                        receberNotificacoes: usuario.casalInfo?.pessoa1.receberNotificacoes ?? true,
                      }}
                      bloquearEmailCpf
                      somenteLeitura={usuario.pessoaLogada !== 1}
                      onSave={async (dto) => {
                        await usuarioService.atualizarPerfilCasal(usuario.id, 1, { nome: dto.nome, dataNascimento: dto.dataNascimento ?? null });
                        await usuarioService.atualizarNotificacoes(dto.receberNotificacoes ?? true, 1);
                        await refresh();
                      }}
                    />
                  </TabsContent>
                  <TabsContent value="p2" className="mt-0">
                    <PessoaForm
                      key="p2"
                      dados={{
                        nome: usuario.casalInfo?.pessoa2.nome ?? "",
                        email: usuario.casalInfo?.pessoa2.email ?? "",
                        dataNascimento: usuario.casalInfo?.pessoa2.dataNascimento ?? "",
                        receberNotificacoes: usuario.casalInfo?.pessoa2.receberNotificacoes ?? true,
                      }}
                      bloquearEmailCpf
                      somenteLeitura={usuario.pessoaLogada !== 2}
                      onSave={async (dto) => {
                        await usuarioService.atualizarPerfilCasal(usuario.id, 2, { nome: dto.nome, dataNascimento: dto.dataNascimento ?? null });
                        await usuarioService.atualizarNotificacoes(dto.receberNotificacoes ?? true, 2);
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
                    receberNotificacoes: usuario.receberNotificacoes ?? true,
                  }}
                  bloquearEmailCpf
                  onSave={async (dto) => {
                    await usuarioService.atualizarPerfil({ nomeCompleto: dto.nome, email: dto.email, dataNascimento: dto.dataNascimento ?? undefined });
                    await usuarioService.atualizarNotificacoes(dto.receberNotificacoes ?? true);
                    await refresh();
                  }}
                />
              )}
            </div>
          </div>
        </section>

        {/* SEC 2: Parcerias e Convites (Só Individual) */}
        {!isCasal && (
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-10">
            <div className="md:col-span-1 space-y-1">
              <h2 className="font-semibold text-lg flex items-center gap-2"><MailOpen className="w-5 h-5 text-primary" /> Família & Casal</h2>
              <p className="text-sm text-muted-foreground">
                Vincule sua conta com seu parceiro(a) para planejarem juntos.
              </p>
            </div>
            <div className="md:col-span-2 space-y-6">
              
              {/* Convites Recebidos */}
              {convitesQuery.data && convitesQuery.data.length > 0 && (
                <div className="bg-primary/5 border border-primary/20 rounded-[var(--radius-lg)] p-5 space-y-4">
                  <h3 className="font-medium text-primary flex items-center gap-2"><Bell className="w-4 h-4" /> Convites Recebidos</h3>
                  {convitesQuery.data.map((convite) => (
                    <div key={convite.token} className="bg-background rounded-[var(--radius-lg)] p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between border shadow-sm">
                      <div className="flex-1">
                        <p className="font-medium text-sm"><strong>{convite.nomeConvidante}</strong> convidou você.</p>
                        <p className="text-xs text-muted-foreground mt-1">Ao aceitar, seus dados atuais serão migrados para uma conta conjunta.</p>
                      </div>
                      <Button onClick={() => aceitarMutation.mutate(convite.token)} disabled={aceitarMutation.isPending} size="sm" className="w-full sm:w-auto shrink-0 bg-primary">
                        <Check className="h-4 w-4 mr-2" /> {aceitarMutation.isPending ? "Processando..." : "Aceitar Convite"}
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* Enviar Convite */}
              <div className="bg-card rounded-[var(--radius-lg)] border p-5 shadow-sm space-y-4">
                <div className="space-y-1">
                  <h3 className="font-medium">Convidar Parceiro(a)</h3>
                  <p className="text-sm text-muted-foreground">Insira o e-mail do seu parceiro para enviar um convite de união de contas.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Input 
                    type="email" 
                    placeholder="parceiro@email.com" 
                    value={emailParceiro} 
                    onChange={(e) => setEmailParceiro(e.target.value)} 
                    className="flex-1 bg-muted/30"
                  />
                  <Button onClick={() => conviteMutation.mutate()} disabled={!emailParceiro || conviteMutation.isPending} className="shrink-0 bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors">
                    <Share2 className="h-4 w-4 mr-2" /> {conviteMutation.isPending ? "Enviando..." : "Enviar Convite"}
                  </Button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* SEC 3: Preferências e Exportação */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-10">
          <div className="md:col-span-1 space-y-1">
            <h2 className="font-semibold text-lg flex items-center gap-2"><Target className="w-5 h-5 text-primary" /> Preferências</h2>
            <p className="text-sm text-muted-foreground">
              Configure sua meta financeira, lista pública e exporte seus dados.
            </p>
          </div>
          <div className="md:col-span-2 space-y-6">
            <TemaCard />
            <MetaEnxovalCard metaUsuario={usuario.metaGlobalEnxoval ?? null} onSaved={refresh} />
            <ListaPublicaCard />
            <ExportarCard />
          </div>
        </section>

        {/* SEC 4: Segurança */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-10">
          <div className="md:col-span-1 space-y-1">
            <h2 className="font-semibold text-lg text-destructive flex items-center gap-2"><KeyRound className="w-5 h-5" /> Segurança</h2>
            <p className="text-sm text-muted-foreground">
              Proteja sua conta ou remova seus dados permanentemente.
            </p>
          </div>
          <div className="md:col-span-2 space-y-6">
            <TrocarSenhaCard />
            
            <div className="bg-destructive/5 border border-destructive/20 rounded-[var(--radius-lg)] p-5 shadow-sm">
              <h3 className="font-medium text-destructive mb-1">Zona de Risco</h3>
              <p className="text-sm text-destructive/80 mb-5">
                Encerrar sua sessão neste dispositivo ou deletar toda a sua conta do CasalPlanner.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button variant="outline" onClick={logout} className="flex-1 bg-background border-destructive/30 text-destructive hover:bg-destructive/10">
                  <LogOut className="h-4 w-4 mr-2" /> Sair da conta
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="flex-1">
                      <Trash2 className="h-4 w-4 mr-2" /> Excluir conta
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Excluir conta permanentemente?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Todos os cômodos, itens, metas e configurações serão apagados. Essa ação não pode ser desfeita.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        onClick={async () => {
                          try {
                            await usuarioService.excluirConta(usuario.id);
                            toast.success("Conta excluída com sucesso.");
                            logout();
                            navigate({ to: "/" });
                          } catch (e) {
                            toast.error(e instanceof Error ? e.message : "Erro ao excluir conta");
                          }
                        }}
                      >
                        Excluir agora
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </div>
        </section>

      </div>
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
  somenteLeitura = false,
}: {
  dados: PessoaDados;
  onSave: (dto: PessoaDados) => Promise<void>;
  bloquearEmailCpf?: boolean;
  somenteLeitura?: boolean;
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
      className="space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        mut.mutate();
      }}
    >
      <div className="grid md:grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <Label className="text-muted-foreground font-medium">Nome</Label>
          <Input
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
            disabled={somenteLeitura}
            className="h-11 rounded-[var(--radius-lg)]"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-muted-foreground font-medium">E-mail</Label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={bloquearEmailCpf || somenteLeitura}
            readOnly={bloquearEmailCpf || somenteLeitura}
            className="h-11 rounded-[var(--radius-lg)]"
          />
          {bloquearEmailCpf && (
            <p className="text-xs text-muted-foreground">
              O e-mail não pode ser alterado no momento.
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label className="text-muted-foreground font-medium">Data de nascimento</Label>
          <Input
            value={nasc}
            onChange={(e) => setNasc(maskDate(e.target.value))}
            placeholder="dd/mm/aaaa"
            disabled={somenteLeitura}
            className="h-11 rounded-[var(--radius-lg)]"
          />
        </div>

        <div className="flex items-center justify-between col-span-full pt-4 border-t border-border/50">
          <div className="flex flex-col space-y-1">
            <Label className="flex items-center gap-2 text-base">
              {notif ? (
                <Bell className="h-5 w-5 text-primary" />
              ) : (
                <BellOff className="h-5 w-5 text-muted-foreground" />
              )}
              Receber Notificações
            </Label>
            <p className="text-sm text-muted-foreground">
              Avisos sobre itens marcados como comprados pelo parceiro.
            </p>
          </div>
          <Switch
            checked={notif}
            onCheckedChange={setNotif}
            disabled={somenteLeitura}
            className="scale-110"
          />
        </div>
      </div>
      {!somenteLeitura && (
        <div className="pt-2">
          <Button
            type="submit"
            disabled={mut.isPending}
            className="w-full sm:w-auto h-11 px-8 rounded-full bg-primary shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5"
          >
            <Save className="h-4 w-4 mr-2" />
            {mut.isPending ? "Salvando..." : "Salvar alterações"}
          </Button>
        </div>
      )}
    </form>
  );
}

function TemaCard() {
  const { theme, setTheme } = useTheme();

  return (
    <section className="rounded-[var(--radius-lg)] border bg-card p-5 md:p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        {theme === "light" ? (
          <Sun className="h-5 w-5 text-primary" />
        ) : theme === "dark" ? (
          <Moon className="h-5 w-5 text-primary" />
        ) : (
          <Monitor className="h-5 w-5 text-primary" />
        )}
        <h2 className="font-display text-xl font-semibold">Aparência do Sistema</h2>
      </div>
      <p className="text-sm text-muted-foreground mb-5">
        Escolha entre o modo claro, escuro ou siga a preferência do seu dispositivo.
      </p>

      <div className="grid grid-cols-3 gap-3">
        <button
          onClick={() => setTheme("light")}
          className={`flex flex-col items-center justify-center gap-2 rounded-lg border-2 p-4 transition-all ${
            theme === "light"
              ? "border-primary bg-primary/5 text-primary font-medium"
              : "border-border bg-background text-muted-foreground hover:bg-muted/50"
          }`}
        >
          <Sun className="h-6 w-6" />
          <span className="text-sm">Claro</span>
        </button>

        <button
          onClick={() => setTheme("dark")}
          className={`flex flex-col items-center justify-center gap-2 rounded-lg border-2 p-4 transition-all ${
            theme === "dark"
              ? "border-primary bg-primary/5 text-primary font-medium"
              : "border-border bg-background text-muted-foreground hover:bg-muted/50"
          }`}
        >
          <Moon className="h-6 w-6" />
          <span className="text-sm">Escuro</span>
        </button>

        <button
          onClick={() => setTheme("system")}
          className={`flex flex-col items-center justify-center gap-2 rounded-lg border-2 p-4 transition-all ${
            theme === "system"
              ? "border-primary bg-primary/5 text-primary font-medium"
              : "border-border bg-background text-muted-foreground hover:bg-muted/50"
          }`}
        >
          <Monitor className="h-6 w-6" />
          <span className="text-sm">Sistema</span>
        </button>
      </div>
    </section>
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
    <section className="rounded-[var(--radius-lg)] border bg-card p-5 md:p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Target className="h-5 w-5 text-primary" />
        <h2 className="font-display text-xl font-semibold">Meta total do enxoval</h2>
      </div>
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          mut.mutate();
        }}
      >
        <CurrencyInput value={valor} onValueChange={setValor} placeholder="R$ 0,00" />
        <Button type="submit" disabled={mut.isPending} className="bg-primary">
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
    <section className="rounded-[var(--radius-lg)] border bg-card p-5 md:p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-5">
        <KeyRound className="h-5 w-5 text-primary" />
        <h2 className="font-display text-xl font-semibold">Segurança e Senha</h2>
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
        className="w-full sm:w-auto bg-primary"
      >
        {mut.isPending ? "Enviando..." : "Enviar link de redefinição"}
      </Button>
    </section>
  );
}

function ListaPublicaCard() {
  const { usuario, refresh } = useAuth();
  const [ativa, setAtiva] = useState(usuario?.listaPublicaAtiva ?? false);

  useEffect(() => {
    setAtiva(usuario?.listaPublicaAtiva ?? false);
  }, [usuario]);

  const mut = useMutation({
    mutationFn: (novoStatus: boolean) => usuarioService.configurarListaPublica(novoStatus),
    onSuccess: async () => {
      toast.success("Configuração da lista pública atualizada!");
      await refresh();
    },
    onError: (e) => {
      toast.error(e instanceof Error ? e.message : "Erro ao atualizar");
      setAtiva(usuario?.listaPublicaAtiva ?? false);
    },
  });

  const link = `${window.location.origin}/lista/${usuario?.slugListaPublica || ""}`;

  const shareLink = () => {
    if (navigator.share) {
      navigator
        .share({
          title: "Nossa Lista de Desejos",
          text: "Confira nossa lista de desejos!",
          url: link,
        })
        .catch((e) => console.log(e));
    } else {
      navigator.clipboard.writeText(link);
      toast.success("Link copiado!");
    }
  };

  return (
    <section className="rounded-[var(--radius-lg)] border bg-card p-5 md:p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-5">
        <Share2 className="h-5 w-5 text-primary" />
        <h2 className="font-display text-xl font-semibold">Sua Lista Pública</h2>
      </div>

      <p className="text-sm text-muted-foreground mb-4">
        Crie uma página pública com os itens que você deseja adquirir para compartilhar com seus
        amigos e familiares. O link é gerado automaticamente pelo sistema.
      </p>

      <div className="space-y-4">
        <div
          className={`flex items-center justify-between ${usuario?.listaPublicaAtiva ? "border-b pb-4" : ""}`}
        >
          <Label className="font-medium cursor-pointer" htmlFor="lista-ativa">
            Ativar Lista Pública
          </Label>
          <Switch
            id="lista-ativa"
            checked={ativa}
            onCheckedChange={(val) => {
              setAtiva(val);
              mut.mutate(val);
            }}
            disabled={mut.isPending}
          />
        </div>

        {usuario?.listaPublicaAtiva && usuario?.slugListaPublica && (
          <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
            <Label>Seu link exclusivo</Label>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-[var(--radius-lg)] border">
                <p className="text-sm font-medium truncate flex-1">{link}</p>
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0 h-8 w-8"
                  onClick={() => {
                    navigator.clipboard.writeText(link);
                    toast.success("Link copiado!");
                  }}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-2">
                <Button
                  variant="outline"
                  className="w-full rounded-[var(--radius-lg)] hover:bg-primary/5 hover:text-primary hover:border-primary/30 transition-colors"
                  asChild
                >
                  <a href={link} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Acessar Lista
                  </a>
                </Button>
                <Button
                  variant="outline"
                  className="w-full rounded-[var(--radius-lg)] hover:bg-primary/5 hover:text-primary hover:border-primary/30 transition-colors"
                  onClick={shareLink}
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Compartilhar
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function ExportarCard() {
  const [exportando, setExportando] = useState(false);

  const handleExportarCSV = async () => {
    setExportando(true);
    try {
      const todosItens = await itensService.listar();

      const cabecalho = [
        "Item",
        "Marca",
        "Loja",
        "Quantidade",
        "Preço Unitário",
        "Total",
        "Comprado",
        "Data Compra",
        "Origem",
      ];
      const linhas = todosItens.map((it) => [
        `"${it.nome.replace(/"/g, '""')}"`,
        `"${(it.marca || "").replace(/"/g, '""')}"`,
        `"${(it.loja || "").replace(/"/g, '""')}"`,
        it.quantidade,
        it.preco.toString().replace(".", ","),
        (it.preco * it.quantidade).toString().replace(".", ","),
        it.comprado ? "Sim" : "Não",
        it.dataCompra ? new Date(it.dataCompra).toLocaleDateString("pt-BR") : "",
        it.origem,
      ]);

      const conteudoCSV = [cabecalho.join(";"), ...linhas.map((l) => l.join(";"))].join("\n");
      const blob = new Blob(["\uFEFF" + conteudoCSV], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `Planejamento_CasalPlanner_${new Date().toISOString().split("T")[0]}.csv`,
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      toast.error("Erro ao exportar CSV");
    } finally {
      setExportando(false);
    }
  };

  const handleExportarPDF = async () => {
    setExportando(true);
    try {
      const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
        import("jspdf"),
        import("jspdf-autotable"),
      ]);
      const todosItens = await itensService.listar();

      const itensNaoComprados = todosItens.filter((it) => !it.comprado);
      const totalGasto = todosItens
        .filter((it) => !["ganho", "presente", "prometido"].includes(it.origem ?? ""))
        .reduce((s, it) => s + it.preco * it.quantidade, 0);
      const totalRestante = itensNaoComprados
        .filter((it) => !["ganho", "presente", "prometido"].includes(it.origem ?? ""))
        .reduce((s, it) => s + it.preco * it.quantidade, 0);
      const totalEconomia = todosItens
        .filter((it) => ["ganho", "presente", "prometido"].includes(it.origem ?? ""))
        .reduce((s, it) => s + it.preco * it.quantidade, 0);

      const doc = new jsPDF();

      // Header
      doc.setFontSize(20);
      doc.setTextColor(139, 92, 246);
      doc.text("Lista de Casamento", 14, 20);

      doc.setFontSize(12);
      doc.setTextColor(100);
      doc.text("CasalPlanner", 14, 28);

      // Info section
      doc.setFontSize(14);
      doc.setTextColor(0);
      doc.text("Todos os cômodos", 14, 45);

      doc.setFontSize(11);
      doc.text(`Total gasto: ${brl(totalGasto)}`, 14, 55);
      doc.text(`Pendente: ${brl(totalRestante)}`, 14, 62);
      if (totalEconomia > 0) doc.text(`Economia (ganhos): ${brl(totalEconomia)}`, 14, 69);
      doc.text(
        `Itens comprados: ${todosItens.filter((it) => it.comprado).length}/${todosItens.length}`,
        14,
        totalEconomia > 0 ? 76 : 69,
      );

      // Table data
      const tableData = itensNaoComprados.map((it, i) => [
        i + 1,
        it.nome,
        it.marca || "-",
        it.loja || "-",
        it.quantidade,
        brl(it.preco),
        brl(it.preco * it.quantidade),
      ]);

      // Generate table
      autoTable(doc, {
        startY: 80,
        head: [["#", "Item", "Marca", "Loja", "Qtd", "Preço", "Total"]],
        body: tableData,
        theme: "grid",
        headStyles: {
          fillColor: [139, 92, 246],
          textColor: 255,
          fontStyle: "bold",
        },
        alternateRowStyles: {
          fillColor: [245, 245, 250],
        },
      });

      // Footer
      const pageCount = doc.getNumberOfPages();
      doc.setFontSize(10);
      doc.setTextColor(150);
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.text(
          `Página ${i} de ${pageCount} - Gerado em ${new Date().toLocaleDateString("pt-BR")}`,
          14,
          doc.internal.pageSize.height - 10,
        );
      }

      doc.save(`lista-casamento-todos.pdf`);
      toast.success("PDF gerado com sucesso!");
    } catch (e) {
      toast.error("Erro ao gerar PDF");
    } finally {
      setExportando(false);
    }
  };

  return (
    <section className="rounded-[var(--radius-lg)] border bg-card overflow-hidden p-5">
      <div className="flex items-center gap-2 mb-4">
        <Download className="h-4 w-4 text-primary" />
        <h2 className="font-display text-lg font-semibold">Exportar Planejamento</h2>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        Baixe um arquivo contendo toda a sua lista de enxoval. Ideal para enviar para as lojas ou
        arquivar.
      </p>
      <div className="flex flex-col gap-2">
        <Button
          variant="outline"
          className="w-full rounded-[var(--radius-lg)]"
          onClick={handleExportarCSV}
          disabled={exportando}
        >
          <Download className="h-4 w-4 mr-2" />
          Exportar para CSV (Excel)
        </Button>
        <Button
          variant="outline"
          className="w-full rounded-[var(--radius-lg)]"
          onClick={handleExportarPDF}
          disabled={exportando}
        >
          <Download className="h-4 w-4 mr-2" />
          Exportar para PDF
        </Button>
      </div>
    </section>
  );
}
