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

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
        {/* COLUNA ESQUERDA: Minha Conta & Segurança */}
        <div className="space-y-6 lg:space-y-8">
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

          {/* Senha */}
          <TrocarSenhaCard />

          {/* Zona perigosa & Logout */}
          <section className="rounded-3xl border border-destructive/20 bg-destructive/5 p-6 hover:bg-destructive/10 transition-colors duration-300">
            <div className="flex flex-col gap-4">
              <div>
                <h2 className="font-display text-lg font-semibold text-destructive mb-1">
                  Acesso & Segurança
                </h2>
                <p className="text-sm text-destructive/80">
                  Encerre sua sessão ou exclua sua conta permanentemente.
                </p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button variant="outline" onClick={logout} className="w-full">
                  <LogOut className="h-4 w-4 mr-2" /> Sair da conta
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="w-full">
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
            </div>
          </section>
        </div>

        {/* COLUNA DIREITA: Planejamento & Recursos */}
        <div className="space-y-6 lg:space-y-8">
          {/* Convites Recebidos */}
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
                      className="w-full md:w-auto shrink-0"
                    >
                      <Check className="h-4 w-4 mr-2" />
                      {aceitarMutation.isPending ? "Aceitando..." : "Aceitar Convite"}
                    </Button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Enviar Convite */}
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

          {/* Lista Pública */}
          <ListaPublicaCard />

          {/* Meta */}
          <MetaEnxovalCard metaUsuario={usuario.metaGlobalEnxoval ?? null} onSaved={refresh} />

          {/* Exportar */}
          <ExportarCard />
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

  useEffect(() => {
    setAtiva(usuario?.listaPublicaAtiva ?? false);
  }, [usuario]);

  const mut = useMutation({
    mutationFn: () => usuarioService.configurarListaPublica(ativa),
    onSuccess: async () => {
      toast.success("Configuração da lista pública atualizada!");
      await refresh();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Erro"),
  });

  const link = `${window.location.origin}/lista/${usuario?.slugListaPublica || ""}`;

  const shareLink = () => {
    if (navigator.share) {
      navigator.share({
        title: "Nossa Lista de Desejos",
        text: "Confira nossa lista de desejos!",
        url: link,
      }).catch((e) => console.log(e));
    } else {
      navigator.clipboard.writeText(link);
      toast.success("Link copiado!");
    }
  };

  const shareWhatsApp = () => {
    const text = encodeURIComponent(`Confira nossa lista de desejos: ${link}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
  };

  return (
    <section className="rounded-2xl border bg-card shadow-soft overflow-hidden p-5">
      <div className="flex items-center gap-2 mb-4">
        <Share2 className="h-4 w-4 text-primary" />
        <h2 className="font-display text-lg font-semibold">Sua Lista Pública</h2>
      </div>

      <p className="text-sm text-muted-foreground mb-4">
        Crie uma página pública com os itens que você deseja adquirir para compartilhar com
        seus amigos e familiares. O link é gerado automaticamente pelo sistema.
      </p>

      <div className="space-y-4">
        <div className="flex items-center justify-between border-b pb-4">
          <Label className="font-medium cursor-pointer" htmlFor="lista-ativa">
            Ativar Lista Pública
          </Label>
          <Switch
            id="lista-ativa"
            checked={ativa}
            onCheckedChange={(val) => setAtiva(val)}
          />
        </div>

        {usuario?.slugListaPublica && (
          <div className="space-y-2">
            <Label>Seu link exclusivo</Label>
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
          </div>
        )}

        {ativa !== (usuario?.listaPublicaAtiva ?? false) && (
          <Button
            onClick={() => mut.mutate()}
            disabled={mut.isPending}
            className="w-full bg-gradient-primary rounded-xl"
          >
            {mut.isPending ? "Salvando..." : "Salvar Configurações"}
          </Button>
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
        .filter((it) => it.origem !== "ganho")
        .reduce((s, it) => s + it.preco * it.quantidade, 0);
      const totalRestante = itensNaoComprados
        .filter((it) => it.origem !== "ganho")
        .reduce((s, it) => s + it.preco * it.quantidade, 0);
      const totalEconomia = todosItens
        .filter((it) => it.origem === "ganho")
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
    <section className="rounded-2xl border bg-card shadow-soft overflow-hidden p-5">
      <div className="flex items-center gap-2 mb-4">
        <Download className="h-4 w-4 text-primary" />
        <h2 className="font-display text-lg font-semibold">Exportar Planejamento</h2>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        Baixe um arquivo contendo toda a sua lista de enxoval. Ideal para enviar para as lojas ou arquivar.
      </p>
      <div className="flex flex-col gap-2">
        <Button variant="outline" className="w-full rounded-xl" onClick={handleExportarCSV} disabled={exportando}>
          <Download className="h-4 w-4 mr-2" />
          Exportar para CSV (Excel)
        </Button>
        <Button variant="outline" className="w-full rounded-xl" onClick={handleExportarPDF} disabled={exportando}>
          <Download className="h-4 w-4 mr-2" />
          Exportar para PDF
        </Button>
      </div>
    </section>
  );
}
