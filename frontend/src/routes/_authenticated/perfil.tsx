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
  Share2,
  Copy,
  Check,
  LogOut,
  Download,
  Bell,
  BellOff,
  ExternalLink,
  Calendar,
} from "lucide-react";
import { usePwa } from "@/hooks/use-pwa";
import { useAuth } from "@/lib/auth-context";

import { usuarioService } from "@/services/usuario";
import { resumoService } from "@/services/resumo";
import { recuperarSenhaService } from "@/services/recuperar-senha";
import { itensService } from "@/services/itens";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Label } from "@/components/ui/label";
import { WidgetDiaMudanca } from "@/components/planejamento/WidgetDiaMudanca";
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
import { motion, type Variants } from "framer-motion";
import { PerfilSkeleton } from "@/components/ui/LoadingSkeletons";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/perfil")({
  head: () => ({
    meta: [{ title: "CasalPlanner - Minha conta" }, { name: "robots", content: "noindex" }],
  }),
  component: PerfilPage,
});

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

function PerfilPage() {
  const { usuario, refresh, logout, loading } = useAuth();
  const { installPrompt, triggerInstall } = usePwa();
  const navigate = useNavigate();

  const isCasal = usuario?.tipoConta === "Casal";

  if (loading || !usuario) {
    return <PerfilSkeleton />;
  }

  return (
    <motion.div
      className="w-full space-y-6 pb-12 font-sans"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* Header matching Page 7 */}
      <motion.header
        variants={itemVariants}
        className="flex flex-col sm:flex-row sm:items-end justify-between gap-4"
      >
        <div>
          <span className="text-xs md:text-sm font-bold text-muted-foreground block mb-1">
            {isCasal ? "Conta de casal" : "Conta individual"}
          </span>
          <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight text-foreground">
            Minha conta
          </h1>
        </div>

        {installPrompt && (
          <Button
            variant="outline"
            size="sm"
            onClick={triggerInstall}
            className="btn-sticker self-start sm:self-auto"
          >
            <Download className="h-4 w-4 mr-1.5" /> Instalar App
          </Button>
        )}
      </motion.header>

      {/* Main Grid: 2 columns matching Page 7 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Perfil, Segurança, Meta */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card: Perfil */}
          <motion.div variants={itemVariants} className="card-sticker p-5 md:p-6 bg-card space-y-5">
            {isCasal ? (
              <Tabs defaultValue={usuario.pessoaLogada === 2 ? "p2" : "p1"} className="w-full">
                <TabsList className="grid grid-cols-2 mb-5">
                  <TabsTrigger value="p1">
                    {usuario.casalInfo?.pessoa1.nome ?? "Pessoa 1"}
                  </TabsTrigger>
                  <TabsTrigger value="p2">
                    {usuario.casalInfo?.pessoa2.nome ?? "Pessoa 2"}
                  </TabsTrigger>
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
                    iniciais="P1"
                    avatarColor="bg-primary text-primary-foreground"
                    bloquearEmailCpf
                    somenteLeitura={usuario.pessoaLogada !== 1}
                    onSave={async (dto) => {
                      await usuarioService.atualizarPerfilCasal(usuario.id, 1, {
                        nome: dto.nome,
                        dataNascimento: dto.dataNascimento ?? null,
                      });
                      await usuarioService.atualizarNotificacoes(
                        dto.receberNotificacoes ?? true,
                        1,
                      );
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
                    iniciais="P2"
                    avatarColor="bg-gold text-gold-foreground"
                    bloquearEmailCpf
                    somenteLeitura={usuario.pessoaLogada !== 2}
                    onSave={async (dto) => {
                      await usuarioService.atualizarPerfilCasal(usuario.id, 2, {
                        nome: dto.nome,
                        dataNascimento: dto.dataNascimento ?? null,
                      });
                      await usuarioService.atualizarNotificacoes(
                        dto.receberNotificacoes ?? true,
                        2,
                      );
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
                iniciais={usuario.nomeCompleto?.charAt(0).toUpperCase() || "U"}
                avatarColor="bg-primary text-primary-foreground"
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
          </motion.div>

          {/* Card: Segurança matching Page 7 */}
          <motion.div variants={itemVariants} className="card-sticker p-5 md:p-6 bg-card space-y-4">
            <h2 className="font-display font-bold text-xl text-foreground">Segurança</h2>
            <p className="text-sm font-semibold text-muted-foreground">
              Troque a senha de acesso sempre que precisar.
            </p>
            <TrocarSenhaCard />
          </motion.div>

          {/* Card: Meta Financeira Global */}
          <motion.div variants={itemVariants} className="card-sticker p-5 md:p-6 bg-card space-y-4">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              <h2 className="font-display font-bold text-xl text-foreground">
                Meta do orçamento da casa
              </h2>
            </div>
            <p className="text-sm font-semibold text-muted-foreground">
              Defina o valor limite que vocês planejam gastar com a casa nova.
            </p>
            <MetaEnxovalCard metaUsuario={usuario.metaGlobalEnxoval ?? null} onSaved={refresh} />
          </motion.div>
        </div>

        {/* Right Column: Dia da Mudança, Lista Pública, Exportar, Sessão e Dados */}
        <div className="lg:col-span-5 space-y-6">
          {/* Card: Dia da Mudança */}
          <motion.div variants={itemVariants}>
            <WidgetDiaMudanca />
          </motion.div>

          {/* Card: Lista Pública */}
          <motion.div variants={itemVariants}>
            <ListaPublicaCard />
          </motion.div>

          {/* Card: Exportar Planejamento */}
          <motion.div variants={itemVariants}>
            <ExportarCard />
          </motion.div>

          {/* Card: Sessão e dados matching Page 7 */}
          <motion.div variants={itemVariants} className="card-sticker p-5 md:p-6 bg-card space-y-4">
            <h2 className="font-display font-bold text-xl text-foreground">Sessão e dados</h2>
            <p className="text-sm font-semibold text-muted-foreground">
              Sair deste aparelho ou limpar os dados salvos no navegador.
            </p>

            <div className="flex flex-wrap gap-3">
              <Button
                variant="outline"
                onClick={logout}
                className="btn-sticker text-muted-foreground hover:text-foreground"
              >
                <LogOut className="h-4 w-4 mr-1.5" /> Sair
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="btn-sticker text-destructive border-destructive/40 hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4 mr-1.5" /> Excluir conta
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Excluir conta permanentemente?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Todos os cômodos, itens, metas e configurações serão apagados. Essa ação não
                      pode ser desfeita.
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
          </motion.div>
        </div>
      </div>
    </motion.div>
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
  iniciais,
  avatarColor,
  bloquearEmailCpf = false,
  somenteLeitura = false,
}: {
  dados: PessoaDados;
  onSave: (dto: PessoaDados) => Promise<void>;
  iniciais: string;
  avatarColor: string;
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
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        mut.mutate();
      }}
    >
      {/* Top Avatar + Name Summary matching Page 7 */}
      <div className="flex items-center gap-3.5 pb-2">
        <div
          className={cn(
            "h-12 w-12 rounded-full border-2 border-border grid place-items-center font-display font-bold text-base shadow-xs shrink-0",
            avatarColor,
          )}
        >
          {iniciais}
        </div>
        <div className="min-w-0">
          <span className="font-display font-bold text-lg text-foreground block truncate">
            {nome || "Seu nome"}
          </span>
          <span className="text-xs font-semibold text-muted-foreground block truncate">
            {email || "[e-mail]"}
          </span>
        </div>
      </div>

      <div className="space-y-3">
        <div className="space-y-1">
          <Label className="text-xs font-bold text-foreground">Nome completo</Label>
          <Input
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
            disabled={somenteLeitura}
            placeholder="Nome completo"
          />
        </div>

        <div className="space-y-1">
          <Label className="text-xs font-bold text-foreground">E-mail</Label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={bloquearEmailCpf || somenteLeitura}
            readOnly={bloquearEmailCpf || somenteLeitura}
            placeholder="seu@email.com"
          />
        </div>

        <div className="space-y-1">
          <Label className="text-xs font-bold text-foreground">Data de nascimento</Label>
          <Input
            value={nasc}
            onChange={(e) => setNasc(maskDate(e.target.value))}
            placeholder="dd/mm/aaaa"
            disabled={somenteLeitura}
          />
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="flex flex-col">
            <Label className="text-xs font-bold text-foreground flex items-center gap-1.5">
              {notif ? (
                <Bell className="h-3.5 w-3.5 text-primary" />
              ) : (
                <BellOff className="h-3.5 w-3.5 text-muted-foreground" />
              )}
              Receber Notificações
            </Label>
            <span className="text-[11px] font-semibold text-muted-foreground">
              Avisos sobre compras e alterações feitas na casa.
            </span>
          </div>
          <Switch checked={notif} onCheckedChange={setNotif} disabled={somenteLeitura} />
        </div>
      </div>

      {!somenteLeitura && (
        <div className="pt-2">
          <Button
            type="submit"
            disabled={mut.isPending}
            className="btn-sticker bg-primary text-primary-foreground hover:bg-primary/95"
          >
            <Save className="h-4 w-4 mr-1.5" />
            {mut.isPending ? "Salvando..." : "Salvar alterações"}
          </Button>
        </div>
      )}
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
    <form
      className="flex gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        mut.mutate();
      }}
    >
      <CurrencyInput value={valor} onValueChange={setValor} placeholder="R$ 0,00" />
      <Button
        type="submit"
        disabled={mut.isPending}
        className="btn-sticker bg-primary text-primary-foreground hover:bg-primary/95 shrink-0"
      >
        Salvar
      </Button>
    </form>
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
    <Button
      type="button"
      variant="outline"
      onClick={() => mut.mutate()}
      disabled={mut.isPending}
      className="btn-sticker"
    >
      <KeyRound className="h-4 w-4 mr-1.5" />
      {mut.isPending ? "Enviando e-mail..." : "Trocar senha"}
    </Button>
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

  const link = `${typeof window !== "undefined" ? window.location.origin : ""}/lista/${usuario?.slugListaPublica || ""}`;

  const shareLink = () => {
    if (navigator.share) {
      navigator
        .share({
          title: "Nossa Lista de Desejos",
          text: "Confira nossa lista de desejos do CasalPlanner!",
          url: link,
        })
        .catch(() => { });
    } else {
      navigator.clipboard.writeText(link);
      toast.success("Link copiado!");
    }
  };

  return (
    <div className="card-sticker p-5 md:p-6 bg-card space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Share2 className="h-5 w-5 text-primary" />
          <h2 className="font-display font-bold text-xl text-foreground">Lista pública</h2>
        </div>
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

      <p className="text-xs font-semibold text-muted-foreground">
        Compartilhe seus itens desejados com amigos e familiares por um endereço público.
      </p>

      {usuario?.listaPublicaAtiva && usuario?.slugListaPublica && (
        <div className="space-y-3 pt-2">
          <div className="card-sticker p-2.5 bg-muted/30 flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-foreground truncate">{link}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 shrink-0"
              onClick={() => {
                navigator.clipboard.writeText(link);
                toast.success("Link copiado!");
              }}
            >
              <Copy className="h-3.5 w-3.5" />
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" className="btn-sticker text-xs" asChild>
              <a href={link} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-3.5 w-3.5 mr-1.5" /> Acessar
              </a>
            </Button>
            <Button variant="outline" className="btn-sticker text-xs" onClick={shareLink}>
              <Share2 className="h-3.5 w-3.5 mr-1.5" /> Compartilhar
            </Button>
          </div>
        </div>
      )}
    </div>
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
      toast.success("CSV exportado!");
    } catch {
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

      const doc = new jsPDF();
      doc.setFontSize(20);
      doc.setTextColor(47, 125, 91);
      doc.text("CasalPlanner - Lista de Itens", 14, 20);

      doc.setFontSize(11);
      doc.setTextColor(36, 48, 42);
      doc.text(`Total gasto: ${brl(totalGasto)}`, 14, 30);
      doc.text(`Pendente: ${brl(totalRestante)}`, 14, 37);

      const tableData = itensNaoComprados.map((it, i) => [
        i + 1,
        it.nome,
        it.marca || "-",
        it.loja || "-",
        it.quantidade,
        brl(it.preco),
        brl(it.preco * it.quantidade),
      ]);

      autoTable(doc, {
        startY: 45,
        head: [["#", "Item", "Marca", "Loja", "Qtd", "Preço", "Total"]],
        body: tableData,
        theme: "grid",
        headStyles: {
          fillColor: [47, 125, 91],
          textColor: 255,
          fontStyle: "bold",
        },
      });

      doc.save("planejamento-casal-planner.pdf");
      toast.success("PDF gerado!");
    } catch {
      toast.error("Erro ao gerar PDF");
    } finally {
      setExportando(false);
    }
  };

  return (
    <div className="card-sticker p-5 md:p-6 bg-card space-y-4">
      <div className="flex items-center gap-2">
        <Download className="h-5 w-5 text-primary" />
        <h2 className="font-display font-bold text-xl text-foreground">Exportar dados</h2>
      </div>
      <p className="text-xs font-semibold text-muted-foreground">
        Baixe sua lista de itens em planilha ou documento PDF.
      </p>

      <div className="grid grid-cols-2 gap-2">
        <Button
          variant="outline"
          className="btn-sticker text-xs"
          onClick={handleExportarCSV}
          disabled={exportando}
        >
          CSV (Excel)
        </Button>
        <Button
          variant="outline"
          className="btn-sticker text-xs"
          onClick={handleExportarPDF}
          disabled={exportando}
        >
          PDF
        </Button>
      </div>
    </div>
  );
}
