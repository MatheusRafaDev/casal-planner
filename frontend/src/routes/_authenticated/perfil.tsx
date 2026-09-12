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
    <div className="p-4 md:p-8 w-full max-w-[1600px] space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-4xl font-display font-bold tracking-tight">Meu Perfil</h1>
          <p className="text-sm md:text-base text-muted-foreground font-medium mt-1">
            Conta {isCasal ? "de Casal" : "Individual"}
          </p>
        </div>
        {installPrompt && (
          <Button
            variant="secondary"
            size="sm"
            onClick={triggerInstall}
            className="font-medium rounded-full shadow-sm"
          >
            <Download className="h-4 w-4 md:mr-2" />
            <span className="hidden md:inline">Instalar App</span>
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        <div className="space-y-8 lg:col-span-2">
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
                        Aceite para vincular suas contas. Ao aceitar, seus dados atuais serão
                        migrados para a conta de casal.
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
          <section className="rounded-2xl border bg-card p-5 md:p-6 shadow-soft">
            <h2 className="font-display text-lg font-semibold mb-4">Dados pessoais</h2>
            {isCasal ? (
              <Tabs defaultValue="p1">
                <TabsList className="grid grid-cols-2 mb-4">
                  <TabsTrigger value="p1">
                    {usuario.casalInfo?.pessoa1.nome ?? "Pessoa 1"}
                  </TabsTrigger>
                  <TabsTrigger value="p2">
                    {usuario.casalInfo?.pessoa2.nome ?? "Pessoa 2"}
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="p1">
                  <PessoaForm
                    key="p1"
                    dados={{
                      nome: usuario.casalInfo?.pessoa1.nome ?? "",
                      email: usuario.casalInfo?.pessoa1.email ?? "",
                      dataNascimento: usuario.casalInfo?.pessoa1.dataNascimento ?? "",
                      receberNotificacoes: usuario.casalInfo?.pessoa1.receberNotificacoes ?? true,
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
                      dataNascimento: usuario.casalInfo?.pessoa2.dataNascimento ?? "",
                      receberNotificacoes: usuario.casalInfo?.pessoa2.receberNotificacoes ?? true,
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
                  receberNotificacoes: usuario.receberNotificacoes ?? true,
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
        </div>

        <div className="space-y-6 lg:col-span-1">
          {/* Lista Pública */}
          <ListaPublicaCard />

          {/* Meta */}
          <MetaEnxovalCard metaUsuario={usuario.metaGlobalEnxoval ?? null} onSaved={refresh} />

          {/* Senha */}
          <TrocarSenhaCard />

          {/* Zona perigosa */}
          <section className="rounded-3xl border border-destructive/20 bg-destructive/5 p-6 hover:bg-destructive/10 transition-colors duration-300">
            <div className="flex flex-col gap-4">
              <div>
                <h2 className="font-display text-lg font-semibold text-destructive mb-1">
                  Zona sensível
                </h2>
                <p className="text-sm text-destructive/80">Ações destrutivas. Tenha cuidado.</p>
              </div>
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
              <Button variant="outline" onClick={logout} className="w-full">
                <LogOut className="h-4 w-4 mr-2" /> Sair da conta
              </Button>
            </div>
          </section>
        </div>
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
            className="h-11 rounded-xl"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-muted-foreground font-medium">E-mail</Label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={bloquearEmailCpf}
            readOnly={bloquearEmailCpf}
            className="h-11 rounded-xl"
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
            className="h-11 rounded-xl"
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
          <Switch checked={notif} onCheckedChange={setNotif} className="scale-110" />
        </div>
      </div>
      <div className="pt-2">
        <Button
          type="submit"
          disabled={mut.isPending}
          className="w-full sm:w-auto h-11 px-8 rounded-full bg-gradient-primary shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5"
        >
          <Save className="h-4 w-4 mr-2" />
          {mut.isPending ? "Salvando..." : "Salvar alterações"}
        </Button>
      </div>
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

function ListaPublicaCard() {
  const { usuario, refresh } = useAuth();
  const [ativa, setAtiva] = useState(usuario?.listaPublicaAtiva ?? false);
  const [slug, setSlug] = useState(usuario?.slugListaPublica ?? "");
  const [editando, setEditando] = useState(!usuario?.slugListaPublica);

  useEffect(() => {
    setAtiva(usuario?.listaPublicaAtiva ?? false);
    setSlug(usuario?.slugListaPublica ?? "");
  }, [usuario]);

  const mut = useMutation({
    mutationFn: () => usuarioService.configurarListaPublica(ativa, slug),
    onSuccess: async () => {
      toast.success("Configuração da lista pública atualizada!");
      setEditando(false);
      await refresh();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Erro"),
  });

  const link = `${window.location.origin}/lista/${usuario?.slugListaPublica || "seu-link"}`;

  const shareLink = () => {
    if (navigator.share) {
      navigator.share({
        title: "Nossa Lista de Presentes",
        text: "Confira nossa lista de presentes!",
        url: link,
      }).catch((e) => console.log(e));
    } else {
      navigator.clipboard.writeText(link);
      toast.success("Link copiado!");
    }
  };

  const shareWhatsApp = () => {
    const text = encodeURIComponent(`Confira nossa lista de presentes: ${link}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
  };

  return (
    <section className="rounded-2xl border bg-card shadow-soft overflow-hidden p-5">
      <div className="flex items-center gap-2 mb-4">
        <Share2 className="h-4 w-4 text-primary" />
        <h2 className="font-display text-lg font-semibold">Sua Lista Pública</h2>
      </div>

      <p className="text-sm text-muted-foreground mb-4">
        Crie uma página pública com os presentes que você ainda não comprou para compartilhar com
        convidados.
      </p>

      <div className="space-y-4">
        <div className="flex items-center justify-between border-b pb-4">
          <Label className="font-medium cursor-pointer" htmlFor="lista-ativa">
            Ativar Lista Pública
          </Label>
          <Switch
            id="lista-ativa"
            checked={ativa}
            onCheckedChange={(val) => {
              setAtiva(val);
            }}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Seu link personalizado</Label>
            {!editando && ativa && (
              <Button variant="link" size="sm" className="h-auto p-0 text-primary" onClick={() => setEditando(true)}>
                Mudar link
              </Button>
            )}
          </div>
          
          {editando ? (
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                  /lista/
                </span>
                <Input
                  className="pl-[3.5rem] bg-muted/50"
                  placeholder="meu-casamento"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-xl border opacity-70">
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
              
              {ativa && (
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <Button variant="outline" className="w-full rounded-xl" onClick={shareWhatsApp}>
                    <svg viewBox="0 0 24 24" className="w-4 h-4 mr-2 fill-current text-green-500" xmlns="http://www.w3.org/2000/svg">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                    </svg>
                    WhatsApp
                  </Button>
                  <Button variant="outline" className="w-full rounded-xl" onClick={shareLink}>
                    <Share2 className="h-4 w-4 mr-2" />
                    Compartilhar
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {(editando || ativa !== (usuario?.listaPublicaAtiva ?? false)) && (
          <Button
            onClick={() => mut.mutate()}
            disabled={mut.isPending || (editando && slug.length < 3)}
            className="w-full bg-gradient-primary rounded-xl"
          >
            {mut.isPending ? "Salvando..." : "Salvar Configurações"}
          </Button>
        )}
      </div>
    </section>
  );
}
