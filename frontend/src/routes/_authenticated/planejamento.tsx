import { useState, useMemo, useDeferredValue } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  MoreVertical,
  Sparkles,
  Check,
  ExternalLink,
  Wallet,
  Wand2,
  Loader2,
  ArrowUp,
  ArrowDown,
  Package,
  AlertTriangle,
  Share2,
  FileText,
} from "lucide-react";
import { createFileRoute } from "@tanstack/react-router";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { categoriasService } from "@/services/categorias";
import { itensService } from "@/services/itens";
import { groqService, type SugestaoItem } from "@/services/groq";
import type { Categoria, Item } from "@/services/types";
import { brl } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";

import { iconFor } from "@/components/planejamento/icon-map";
import { CategoriaFormModal } from "@/components/planejamento/CategoriaFormModal";
import { ItemFormModal } from "@/components/planejamento/ItemFormModal";
import { AddItemWizard } from "@/components/planejamento/AddItemWizard";
import { getLogoUrl } from "@/lib/logos";

export const Route = createFileRoute("/_authenticated/planejamento")({
  head: () => ({
    meta: [{ title: "Planejamento - CasalPlanner" }, { name: "robots", content: "noindex" }],
  }),
  component: PlanejamentoPage,
});

function PlanejamentoPage() {
  const qc = useQueryClient();
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<string | null>(null);
  const [busca, setBusca] = useState("");
  const buscaDebounced = useDeferredValue(busca);
  const [filtroStatus, setFiltroStatus] = useState<
    "todos" | "comprados" | "faltando" | "presentes"
  >("todos");
  const [filtroPagamento, setFiltroPagamento] = useState<"todos" | "normal" | "vr">("todos");
  const [filtroResponsavel, setFiltroResponsavel] = useState<"todos" | "1" | "2">("todos");

  const { usuario } = useAuth();
  const isCasal = usuario?.tipoConta === "Casal";
  const p1 = usuario?.casalInfo?.pessoa1?.nome || "Pessoa 1";
  const p2 = usuario?.casalInfo?.pessoa2?.nome || "Pessoa 2";

  const [novaCategoria, setNovaCategoria] = useState(false);
  const [editandoCategoria, setEditandoCategoria] = useState<Categoria | null>(null);
  const [excluindoCategoria, setExcluindoCategoria] = useState<Categoria | null>(null);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [editandoItem, setEditandoItem] = useState<Item | null>(null);
  const [excluindoItem, setExcluindoItem] = useState<Item | null>(null);

  const categoriasQ = useQuery({
    queryKey: ["categorias"],
    queryFn: () => categoriasService.listar(),
  });

  const categorias = categoriasQ.data ?? [];
  const catAtualId = categoriaSelecionada ?? "tudo";
  const catAtual = categorias.find((c) => c.id === catAtualId) ?? null;

  const itensQ = useQuery({
    queryKey: ["itens"],
    queryFn: () => itensService.listar(),
  });

  const todosItens = itensQ.data ?? [];
  const itens =
    catAtualId === "tudo" ? todosItens : todosItens.filter((i) => i.categoriaId === catAtualId);

  const itensFiltrados = useMemo(() => {
    const b = buscaDebounced.trim().toLowerCase();
    return itens.filter((i) => {
      if (b && !i.nome.toLowerCase().includes(b) && !(i.marca ?? "").toLowerCase().includes(b))
        return false;
      if (filtroStatus === "comprados" && !i.comprado) return false;
      if (filtroStatus === "faltando" && i.comprado) return false;
      if (filtroStatus === "presentes" && i.origem !== "ganho") return false;
      if (filtroPagamento !== "todos" && i.pagamento !== filtroPagamento) return false;
      if (isCasal && filtroResponsavel !== "todos") {
        if (filtroResponsavel === "1" && i.responsavelId !== 1) return false;
        if (filtroResponsavel === "2" && i.responsavelId !== 2) return false;
      }
      return true;
    });
  }, [itens, buscaDebounced, filtroStatus, filtroPagamento, filtroResponsavel, isCasal]);

  const namesToResolve = useMemo(() => {
    const names = new Set<string>();
    itensFiltrados.forEach((it) => {
      if (it.marca) names.add(it.marca);
      if (it.loja) names.add(it.loja);
    });
    return Array.from(names);
  }, [itensFiltrados]);

  const dominiosQuery = useQuery({
    queryKey: ["dominios", namesToResolve],
    queryFn: () => groqService.descobrirDominios(namesToResolve),
    enabled: namesToResolve.length > 0,
    staleTime: Infinity,
  });

  const resolvedDomains = dominiosQuery.data ?? {};

  const totalCategoria = itens.reduce((s, i) => s + i.preco * i.quantidade, 0);
  const compradosCategoria = itens.filter((i) => i.comprado).length;
  const percentComprado = itens.length ? (compradosCategoria / itens.length) * 100 : 0;
  const percentMeta =
    catAtual?.metaOrcamento && catAtual.metaOrcamento > 0
      ? Math.min(100, (totalCategoria / catAtual.metaOrcamento) * 100)
      : null;

  const toggleComprado = useMutation({
    mutationFn: ({ id, comprado }: { id: string; comprado: boolean }) =>
      itensService.toggleComprado(id, comprado),
    onMutate: async ({ id, comprado }) => {
      await qc.cancelQueries({ queryKey: ["itens"] });
      const prev = qc.getQueryData(["itens"]);
      qc.setQueryData(["itens"], (old: Item[] | undefined) =>
        old?.map((i) => (i.id === id ? { ...i, comprado } : i)),
      );
      return { prev };
    },
    onError: (err, newTodo, context) => {
      qc.setQueryData(["itens"], context?.prev);
      toast.error("Erro ao atualizar item");
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["itens"] });
      qc.invalidateQueries({ queryKey: ["resumo"] });
    },
  });

  const excluirItem = useMutation({
    mutationFn: (id: string) => itensService.excluir(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["itens"] });
      qc.invalidateQueries({ queryKey: ["resumo"] });
      toast.success("Item removido");
      setExcluindoItem(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const excluirCategoria = useMutation({
    mutationFn: (id: string) => categoriasService.excluir(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["categorias"] });
      setExcluindoCategoria(null);
      setCategoriaSelecionada(null);
      toast.success("Cômodo removido");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const sugestoesQ = useQuery({
    queryKey: ["sugestoes-comodo", catAtual?.nome],
    queryFn: () => (catAtual ? groqService.sugestoesComodo(catAtual.nome) : Promise.resolve([])),
    enabled: false,
  });

  const handleCompartilhar = async () => {
    const texto = gerarTextoCompartilhamento();

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Minha Lista de Casamento - CasalPlanner",
          text: texto,
        });
        toast.success("Lista compartilhada com sucesso!");
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          toast.error("Erro ao compartilhar");
        }
      }
    } else {
      // Fallback: copiar para clipboard
      await navigator.clipboard.writeText(texto);
      toast.success("Lista copiada para a área de transferência!");
    }
  };

  const gerarTextoCompartilhamento = () => {
    const itensFiltrados =
      catAtualId === "tudo" ? todosItens : todosItens.filter((it) => it.categoriaId === catAtualId);

    const itensNaoComprados = itensFiltrados.filter((it) => !it.comprado);
    const totalGasto = itensFiltrados.reduce((s, it) => s + it.preco * it.quantidade, 0);
    const totalRestante = itensNaoComprados.reduce((s, it) => s + it.preco * it.quantidade, 0);

    let texto = `📋 Lista de Casamento - CasalPlanner\n\n`;

    if (catAtualId !== "tudo" && catAtual) {
      texto += `🏠 ${catAtual.nome}\n\n`;
    }

    texto += `💰 Total gasto: ${brl(totalGasto)}\n`;
    texto += `📦 Faltam ${itensNaoComprados.length} itens (${brl(totalRestante)})\n\n`;

    if (itensNaoComprados.length > 0) {
      texto += `📝 Itens pendentes:\n`;
      itensNaoComprados.forEach((it, i) => {
        texto += `${i + 1}. ${it.nome} - ${brl(it.preco)} x${it.quantidade} = ${brl(it.preco * it.quantidade)}\n`;
        if (it.marca) texto += `   Marca: ${it.marca}\n`;
        if (it.loja) texto += `   Loja: ${it.loja}\n`;
      });
    }

    texto += `\n✅ ${itensFiltrados.filter((it) => it.comprado).length} itens já comprados!`;

    return texto;
  };

  const handleExportarPDF = () => {
    const itensFiltrados =
      catAtualId === "tudo" ? todosItens : todosItens.filter((it) => it.categoriaId === catAtualId);

    const itensNaoComprados = itensFiltrados.filter((it) => !it.comprado);
    const totalGasto = itensFiltrados.reduce((s, it) => s + it.preco * it.quantidade, 0);
    const totalRestante = itensNaoComprados.reduce((s, it) => s + it.preco * it.quantidade, 0);

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
    doc.text(
      catAtualId !== "tudo" && catAtual ? `Cômodo: ${catAtual.nome}` : "Todos os cômodos",
      14,
      45,
    );

    doc.setFontSize(11);
    doc.text(`Total gasto: ${brl(totalGasto)}`, 14, 55);
    doc.text(`Pendente: ${brl(totalRestante)}`, 14, 62);
    doc.text(
      `Itens comprados: ${itensFiltrados.filter((it) => it.comprado).length}/${itensFiltrados.length}`,
      14,
      69,
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

    doc.save(
      `lista-casamento-${catAtualId === "tudo" ? "todos" : (catAtual?.nome ?? "comodo")}.pdf`,
    );
    toast.success("PDF gerado com sucesso!");
  };

  // Estimativa de comodo não disponível nessa versão do backend

  return (
    <div className="p-4 md:p-8 w-full max-w-[1600px] space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="font-display text-2xl md:text-4xl font-semibold">Planejamento</h1>
          <p className="text-muted-foreground text-sm">
            Organize os itens por cômodo, controle o orçamento e pesquise preços com IA.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 shrink-0">
          <Button variant="secondary" size="sm" onClick={() => setNovaCategoria(true)}>
            <Plus className="h-4 w-4 mr-1" /> Novo cômodo
          </Button>
          <Button size="sm" onClick={() => setWizardOpen(true)} disabled={categorias.length === 0}>
            <Sparkles className="h-4 w-4 mr-1" /> Adicionar item
          </Button>
          <Button variant="outline" size="sm" onClick={handleCompartilhar}>
            <Share2 className="h-4 w-4 mr-1" /> Compartilhar
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportarPDF}>
            <FileText className="h-4 w-4 mr-1" /> PDF
          </Button>
        </div>
      </header>

      {/* Mobile: Select dropdown for rooms */}
      <div className="lg:hidden">
        <Select
          value={catAtualId}
          onValueChange={(v) => setCategoriaSelecionada(v === "tudo" ? "tudo" : v)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecione um cômodo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="tudo">Todos os Itens</SelectItem>
            {categorias.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.nome} {c.metaOrcamento ? `(Meta: ${brl(c.metaOrcamento)})` : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        {/* Desktop: Sidebar with rooms */}
        <aside className="hidden lg:flex flex-col gap-3 w-[250px] shrink-0">
          {categoriasQ.isLoading && (
            <div className="text-sm text-muted-foreground">Carregando...</div>
          )}
          <div
            className={cn(
              "group flex items-center gap-3 rounded-xl border p-3 transition-all cursor-pointer",
              catAtualId === "tudo"
                ? "border-primary bg-primary/5 shadow-soft"
                : "hover:bg-accent/40 hover:border-accent",
            )}
            onClick={() => setCategoriaSelecionada("tudo")}
          >
            <span className="grid place-items-center h-10 w-10 rounded-lg text-white shrink-0 shadow-soft bg-zinc-800">
              <Package className="h-5 w-5" />
            </span>
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate">Todos os Itens</div>
              <div className="text-xs text-muted-foreground mt-0.5">
                <div className="flex justify-between items-center">
                  <span>
                    {todosItens.filter((i) => i.comprado).length}/{todosItens.length} itens
                  </span>
                  <span className="font-medium text-foreground">
                    {brl(todosItens.reduce((s, i) => s + i.preco * i.quantidade, 0))}
                  </span>
                </div>
              </div>
            </div>
          </div>
          {categorias.map((c) => {
            const I = iconFor(c.icon);
            const ativo = c.id === catAtualId;
            const cItens = todosItens.filter((it) => it.categoriaId === c.id);
            const cComprados = cItens.filter((it) => it.comprado).length;
            const cGasto = cItens.reduce((s, it) => s + it.preco * it.quantidade, 0);

            return (
              <div
                key={c.id}
                className={cn(
                  "group flex items-center gap-3 rounded-xl border p-3 transition-all cursor-pointer",
                  ativo
                    ? "border-primary bg-primary/5 shadow-soft"
                    : "hover:bg-accent/40 hover:border-accent",
                  c.metaOrcamento &&
                    cGasto > c.metaOrcamento &&
                    !ativo &&
                    "border-destructive/50 bg-destructive/5",
                )}
                onClick={() => setCategoriaSelecionada(c.id)}
              >
                <span
                  className="grid place-items-center h-10 w-10 rounded-lg text-white shrink-0 shadow-soft"
                  style={{ backgroundColor: c.bg }}
                >
                  <I className="h-5 w-5" />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate flex items-center gap-2">
                    {c.nome}
                    {c.metaOrcamento && cGasto > c.metaOrcamento && (
                      <span className="text-destructive" title="Orçamento estourado">
                        <AlertTriangle className="h-4 w-4" />
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    <div className="flex justify-between items-center">
                      <span>
                        {cComprados}/{cItens.length} itens
                      </span>
                      <span
                        className={cn(
                          "font-medium",
                          c.metaOrcamento && cGasto > c.metaOrcamento && "text-destructive",
                        )}
                      >
                        {brl(cGasto)}
                      </span>
                    </div>
                    {c.metaOrcamento ? (
                      <div className="mt-1.5 space-y-1">
                        <div className="flex justify-between text-[10px] text-muted-foreground/80">
                          <span>
                            {brl(cGasto)} de {brl(c.metaOrcamento)}
                          </span>
                        </div>
                        <div className="h-1 w-full bg-border rounded-full overflow-hidden">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all",
                              cGasto / c.metaOrcamento < 0.8
                                ? "bg-emerald-500"
                                : cGasto / c.metaOrcamento <= 1
                                  ? "bg-amber-500"
                                  : "bg-destructive",
                            )}
                            style={{ width: `${Math.min(100, (cGasto / c.metaOrcamento) * 100)}%` }}
                          />
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="md:opacity-0 md:group-hover:opacity-100 data-[state=open]:opacity-100 transition-opacity"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent onClick={(e) => e.stopPropagation()}>
                    <DropdownMenuItem onClick={() => setEditandoCategoria(c)}>
                      <Pencil className="h-4 w-4 mr-2" /> Editar
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => setExcluindoCategoria(c)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" /> Remover
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            );
          })}

          {!categoriasQ.isLoading && categorias.length === 0 && (
            <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
              Nenhum cômodo ainda. Crie o primeiro para começar.
            </div>
          )}
        </aside>

        {/* Painel principal */}
        <section className="flex-1 space-y-4 min-w-0">
          {catAtualId === "tudo" || catAtual ? (
            <>
              <div className="rounded-2xl bg-gradient-warm p-5 border shadow-soft">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <span
                        className="grid place-items-center h-12 w-12 rounded-xl text-white shadow-soft"
                        style={{ backgroundColor: catAtual ? catAtual.bg : "#27272a" }}
                      >
                        {(() => {
                          const I = catAtual ? iconFor(catAtual.icon) : Package;
                          return <I className="h-6 w-6" />;
                        })()}
                      </span>
                      <div>
                        <div className="font-display text-xl sm:text-2xl font-semibold flex items-center gap-2">
                          {catAtual ? catAtual.nome : "Todos os itens"}
                          {catAtual?.metaOrcamento && totalCategoria > catAtual.metaOrcamento && (
                            <span className="text-destructive" title="Orçamento estourado">
                              <AlertTriangle className="h-5 w-5" />
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {itens.length} itens · {compradosCategoria} comprados
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="text-left sm:text-right">
                    <div className="text-xs text-muted-foreground">Total gasto</div>
                    <div
                      className={cn(
                        "font-display text-xl sm:text-2xl font-semibold",
                        (catAtual?.metaOrcamento && totalCategoria > catAtual.metaOrcamento) ||
                          (!catAtual &&
                            usuario?.metaGlobalEnxoval &&
                            totalCategoria > usuario.metaGlobalEnxoval)
                          ? "text-destructive"
                          : "text-primary",
                      )}
                    >
                      {brl(totalCategoria)}
                    </div>
                    {catAtual?.metaOrcamento ? (
                      <div className="text-xs text-muted-foreground">
                        de {brl(catAtual.metaOrcamento)}
                        {totalCategoria > catAtual.metaOrcamento && (
                          <span className="text-destructive ml-2">
                            ({brl(totalCategoria - catAtual.metaOrcamento)} acima)
                          </span>
                        )}
                      </div>
                    ) : !catAtual && usuario?.metaGlobalEnxoval ? (
                      <div className="text-xs text-muted-foreground">
                        de {brl(usuario.metaGlobalEnxoval)}
                        {totalCategoria > usuario.metaGlobalEnxoval && (
                          <span className="text-destructive ml-2">
                            ({brl(totalCategoria - usuario.metaGlobalEnxoval)} acima)
                          </span>
                        )}
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Progresso da compra</span>
                      <span className="font-medium">{percentComprado.toFixed(0)}%</span>
                    </div>
                    <Progress value={percentComprado} />
                  </div>
                  {(percentMeta !== null || (!catAtual && usuario?.metaGlobalEnxoval)) && (
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Meta de orçamento</span>
                        <span
                          className={cn(
                            "font-medium",
                            (percentMeta !== null
                              ? percentMeta
                              : (totalCategoria / (usuario?.metaGlobalEnxoval || 1)) * 100) > 100
                              ? "text-destructive"
                              : "",
                          )}
                        >
                          {percentMeta !== null
                            ? percentMeta.toFixed(0)
                            : ((totalCategoria / (usuario?.metaGlobalEnxoval || 1)) * 100).toFixed(
                                0,
                              )}
                          %
                        </span>
                      </div>
                      <Progress
                        value={
                          percentMeta !== null
                            ? percentMeta
                            : (totalCategoria / (usuario?.metaGlobalEnxoval || 1)) * 100
                        }
                      />
                    </div>
                  )}
                </div>

                {/* Estimativa de comodo removida - funcionalidade não disponível no backend */}
              </div>

              {/* Filtros */}
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1 min-w-0">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    className="pl-9"
                    placeholder="Buscar item ou marca..."
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  <Select
                    value={filtroStatus}
                    onValueChange={(v) => setFiltroStatus(v as typeof filtroStatus)}
                  >
                    <SelectTrigger className="flex-1 min-w-[110px] sm:flex-none sm:w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                      <SelectItem value="faltando">Faltando</SelectItem>
                      <SelectItem value="comprados">Comprados</SelectItem>
                      <SelectItem value="presentes">Presentes</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={filtroPagamento}
                    onValueChange={(v) => setFiltroPagamento(v as typeof filtroPagamento)}
                  >
                    <SelectTrigger className="flex-1 min-w-[150px] sm:flex-none sm:w-[170px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Qualquer pagamento</SelectItem>
                      <SelectItem value="normal">Dinheiro</SelectItem>
                      <SelectItem value="vr">VR / VA</SelectItem>
                    </SelectContent>
                  </Select>
                  {isCasal && (
                    <Select
                      value={filtroResponsavel}
                      onValueChange={(v) => setFiltroResponsavel(v as typeof filtroResponsavel)}
                    >
                      <SelectTrigger className="flex-1 min-w-[130px] sm:flex-none sm:w-[150px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Qualquer resp.</SelectItem>
                        <SelectItem value="1">{p1}</SelectItem>
                        <SelectItem value="2">{p2}</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>

              {/* Itens */}
              <div className="space-y-2">
                {itensQ.isLoading && (
                  <div className="text-sm text-muted-foreground">Carregando itens...</div>
                )}
                {!itensQ.isLoading && itensFiltrados.length === 0 && (
                  <div className="rounded-xl border border-dashed p-10 text-center">
                    <Sparkles className="h-6 w-6 mx-auto text-primary mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Nenhum item por aqui ainda. Que tal adicionar o primeiro?
                    </p>
                    <Button className="mt-4" onClick={() => setWizardOpen(true)}>
                      <Plus className="h-4 w-4 mr-1" /> Adicionar item
                    </Button>
                  </div>
                )}

                {itensFiltrados.map((it) => (
                  <div
                    key={it.id}
                    className={cn(
                      "flex flex-col gap-3 rounded-xl border bg-card p-3 hover:shadow-soft transition-shadow",
                      it.comprado && "opacity-70",
                    )}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <Checkbox
                        checked={it.comprado}
                        onCheckedChange={() =>
                          toggleComprado.mutate({ id: it.id, comprado: !it.comprado })
                        }
                      />
                      {it.fotoUrl ? (
                        <img
                          src={it.fotoUrl}
                          alt=""
                          className="h-12 w-12 rounded-lg object-cover border shrink-0"
                        />
                      ) : (
                        <div
                          className="h-12 w-12 rounded-lg grid place-items-center text-white shrink-0"
                          style={{
                            backgroundColor:
                              categorias.find((c) => c.id === it.categoriaId)?.bg ?? "#27272a",
                          }}
                        >
                          {(() => {
                            const I = iconFor(
                              categorias.find((c) => c.id === it.categoriaId)?.icon ?? "package",
                            );
                            return <I className="h-5 w-5" />;
                          })()}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <div
                            className={cn(
                              "font-medium truncate max-w-full",
                              it.comprado && "line-through",
                            )}
                          >
                            {it.nome}
                          </div>
                          {it.marca && (
                            <Badge
                              variant="secondary"
                              className="text-[10px] py-0 px-1.5 h-4 font-normal flex items-center gap-1"
                            >
                              {getLogoUrl(it.marca, null, resolvedDomains) && (
                                <img
                                  src={getLogoUrl(it.marca, null, resolvedDomains)!}
                                  alt=""
                                  className="w-3 h-3 rounded-sm"
                                  onError={(e) => (e.currentTarget.style.display = "none")}
                                />
                              )}
                              {it.marca}
                            </Badge>
                          )}
                          {it.loja &&
                            (it.linkProduto ? (
                              <a
                                href={it.linkProduto}
                                target="_blank"
                                rel="noreferrer"
                                className="hover:opacity-80 transition-opacity"
                              >
                                <Badge
                                  variant="outline"
                                  className="text-[10px] py-0 px-1.5 h-4 font-normal bg-muted/30 flex items-center gap-1 cursor-pointer"
                                >
                                  {getLogoUrl(it.loja, it.linkProduto, resolvedDomains) && (
                                    <img
                                      src={getLogoUrl(it.loja, it.linkProduto, resolvedDomains)!}
                                      alt=""
                                      className="w-3 h-3 rounded-sm"
                                      onError={(e) => (e.currentTarget.style.display = "none")}
                                    />
                                  )}
                                  {it.loja}
                                  <ExternalLink className="w-2.5 h-2.5 ml-0.5" />
                                </Badge>
                              </a>
                            ) : (
                              <Badge
                                variant="outline"
                                className="text-[10px] py-0 px-1.5 h-4 font-normal bg-muted/30 flex items-center gap-1"
                              >
                                {getLogoUrl(it.loja, null, resolvedDomains) && (
                                  <img
                                    src={getLogoUrl(it.loja, null, resolvedDomains)!}
                                    alt=""
                                    className="w-3 h-3 rounded-sm"
                                    onError={(e) => (e.currentTarget.style.display = "none")}
                                  />
                                )}
                                {it.loja}
                              </Badge>
                            ))}
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mt-1">
                          {isCasal && it.responsavelId && (
                            <Badge
                              variant="outline"
                              className="text-[10px] py-0 bg-primary/5 text-primary border-primary/20"
                            >
                              {it.responsavelId === 1 ? p1 : p2}
                            </Badge>
                          )}
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-[10px] py-0",
                              it.pagamento === "vr" && "border-primary text-primary",
                            )}
                          >
                            {it.pagamento === "vr" ? "VR" : "Dinheiro"}
                          </Badge>
                          {it.origem === "ganho" && (
                            <Badge className="text-[10px] py-0 bg-emerald-500 hover:bg-emerald-600 text-white border-transparent">
                              🎁 Presente
                            </Badge>
                          )}
                          {it.prioridade === "alta" && (
                            <Badge className="text-[10px] py-0 bg-red-600 hover:bg-red-700 text-white border-transparent">
                              Alta
                            </Badge>
                          )}
                          {it.prioridade === "baixa" && (
                            <Badge className="text-[10px] py-0" variant="secondary">
                              Baixa
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-3 pt-2 border-t">
                      <div className="text-left min-w-0">
                        <div className="font-display font-semibold truncate">
                          {brl(it.preco * it.quantidade)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          <span>
                            {it.quantidade}× {brl(it.preco)}
                          </span>
                          {(it.parcelas ?? 1) > 1 && (
                            <span className="text-[10px] text-muted-foreground/70 ml-2">
                              {it.parcelas}x de {brl(it.preco / (it.parcelas ?? 1))}
                            </span>
                          )}
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="sm" variant="ghost">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setEditandoItem(it)}>
                            <Pencil className="h-4 w-4 mr-2" /> Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              toggleComprado.mutate({ id: it.id, comprado: !it.comprado })
                            }
                          >
                            <Check className="h-4 w-4 mr-2" />
                            {it.comprado ? "Marcar como faltando" : "Marcar comprado"}
                          </DropdownMenuItem>
                          {it.linkProduto && (
                            <DropdownMenuItem asChild>
                              <a href={it.linkProduto} target="_blank" rel="noreferrer">
                                <ExternalLink className="h-4 w-4 mr-2" /> Abrir link
                              </a>
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => setExcluindoItem(it)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" /> Remover
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="rounded-2xl border border-dashed p-16 text-center bg-gradient-warm">
              <Sparkles className="h-8 w-8 mx-auto text-primary mb-3" />
              <p className="text-muted-foreground">
                Crie seu primeiro cômodo para começar o planejamento.
              </p>
              <Button className="mt-4" onClick={() => setNovaCategoria(true)}>
                <Plus className="h-4 w-4 mr-1" /> Novo cômodo
              </Button>
            </div>
          )}
        </section>
      </div>

      {/* Modais */}
      <CategoriaFormModal open={novaCategoria} onOpenChange={setNovaCategoria} />
      <CategoriaFormModal
        open={!!editandoCategoria}
        onOpenChange={(o) => !o && setEditandoCategoria(null)}
        categoria={editandoCategoria}
      />
      <AddItemWizard
        open={wizardOpen}
        onOpenChange={setWizardOpen}
        categorias={categorias}
        categoriaInicialId={catAtualId === "tudo" ? "" : catAtualId}
      />
      {catAtualId && (
        <ItemFormModal
          open={!!editandoItem}
          onOpenChange={(o) => !o && setEditandoItem(null)}
          categorias={categorias}
          categoriaId={catAtualId}
          item={editandoItem}
        />
      )}

      <AlertDialog
        open={!!excluindoCategoria}
        onOpenChange={(o) => !o && setExcluindoCategoria(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover este cômodo?</AlertDialogTitle>
            <AlertDialogDescription>
              Todos os itens de <b>{excluindoCategoria?.nome}</b> serão removidos. Esta ação não
              pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => excluindoCategoria && excluirCategoria.mutate(excluindoCategoria.id)}
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!excluindoItem} onOpenChange={(o) => !o && setExcluindoItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover este item?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover <b>{excluindoItem?.nome}</b>? Esta ação não pode ser
              desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => excluindoItem && excluirItem.mutate(excluindoItem.id)}
            >
              {excluirItem.isPending ? "Removendo..." : "Remover"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
